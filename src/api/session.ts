import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { uuidv4 } from '../lib/uuid';

/**
 * Token/device persistence.
 * - Access + refresh tokens: Android Keystore / iOS Keychain via react-native-keychain.
 * - deviceId: AsyncStorage (non-secret install id).
 *
 * On first hydrate after upgrade, any tokens still in AsyncStorage are migrated into the Keychain
 * and removed from AsyncStorage.
 */
const KEYCHAIN_SERVICE = 'com.mineralbridge.session';
const KEY_ACCESS_LEGACY = 'mb.session.accessToken';
const KEY_REFRESH_LEGACY = 'mb.session.refreshToken';
const KEY_DEVICE = 'mb.session.deviceId';

type State = {
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  /** epoch ms when the access token expires (known only for tokens received this app run). */
  accessExpiresAt: number | null;
};

const state: State = { accessToken: null, refreshToken: null, deviceId: null, accessExpiresAt: null };
let hydrating: Promise<void> | null = null;

export type SessionEvent = 'signed-in' | 'refreshed' | 'cleared' | 'expired';
const listeners = new Set<(event: SessionEvent) => void>();

/** Subscribe to session lifecycle events (e.g. store navigates to Welcome on `expired`). */
export function subscribeSession(listener: (event: SessionEvent) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(event: SessionEvent): void {
  listeners.forEach(l => {
    try {
      l(event);
    } catch {
      /* listener errors must never break auth flow */
    }
  });
}

type StoredTokens = { accessToken: string; refreshToken: string };

async function readKeychainTokens(): Promise<StoredTokens | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!creds) return null;
    const parsed = JSON.parse(creds.password) as Partial<StoredTokens>;
    if (!parsed.accessToken && !parsed.refreshToken) return null;
    return {
      accessToken: parsed.accessToken ?? '',
      refreshToken: parsed.refreshToken ?? '',
    };
  } catch {
    return null;
  }
}

async function writeKeychainTokens(tokens: StoredTokens): Promise<void> {
  const opts: Record<string, unknown> = {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  // SECURITY_LEVEL is Android-only (Keystore).
  if (Keychain.SECURITY_LEVEL?.SECURE_SOFTWARE) {
    opts.securityLevel = Keychain.SECURITY_LEVEL.SECURE_SOFTWARE;
  }
  await Keychain.setGenericPassword('session', JSON.stringify(tokens), opts as never);
}

async function clearKeychainTokens(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch {
    /* non-fatal */
  }
}

/** One-time migration from plaintext AsyncStorage → Keychain. */
async function migrateLegacyTokens(): Promise<StoredTokens | null> {
  try {
    const pairs = await AsyncStorage.multiGet([KEY_ACCESS_LEGACY, KEY_REFRESH_LEGACY]);
    const m = new Map(pairs);
    const accessToken = m.get(KEY_ACCESS_LEGACY) ?? '';
    const refreshToken = m.get(KEY_REFRESH_LEGACY) ?? '';
    if (!accessToken && !refreshToken) return null;
    const tokens = { accessToken, refreshToken };
    try {
      await writeKeychainTokens(tokens);
      await AsyncStorage.multiRemove([KEY_ACCESS_LEGACY, KEY_REFRESH_LEGACY]);
    } catch {
      // Keep legacy copy if Keychain write fails so the user is not signed out.
    }
    return tokens;
  } catch {
    return null;
  }
}

/** Load persisted tokens + device id into memory. Safe to call many times. */
export function hydrateSession(): Promise<void> {
  if (!hydrating) {
    hydrating = (async () => {
      try {
        let tokens = await readKeychainTokens();
        if (!tokens) tokens = await migrateLegacyTokens();
        if (tokens) {
          state.accessToken = tokens.accessToken || null;
          state.refreshToken = tokens.refreshToken || null;
        }
        state.deviceId = (await AsyncStorage.getItem(KEY_DEVICE)) ?? null;
      } catch {
        // storage unavailable: continue with an empty in-memory session
      }
    })();
  }
  return hydrating;
}

export const getAccessToken = (): string | null => state.accessToken;
export const getRefreshToken = (): string | null => state.refreshToken;
export const hasSession = (): boolean => Boolean(state.accessToken || state.refreshToken);

/** ms until the access token expires, or null when unknown. */
export const accessTokenTtlMs = (): number | null =>
  state.accessExpiresAt === null ? null : state.accessExpiresAt - Date.now();

/** Stable per-install device id (generated on first use, survives sign-out). */
export async function getDeviceId(): Promise<string> {
  await hydrateSession();
  if (state.deviceId) return state.deviceId;
  const id = uuidv4();
  state.deviceId = id;
  try {
    await AsyncStorage.setItem(KEY_DEVICE, id);
  } catch {
    /* non-fatal */
  }
  return id;
}

export interface TokenInput {
  accessToken: string;
  /** Mobile refresh rotates; when omitted the previous refresh token is kept. */
  refreshToken?: string | null;
  /** Seconds, as returned by the backend (`expiresIn`, ~900). */
  expiresIn?: number;
}

export async function setTokens(input: TokenInput, event: SessionEvent = 'signed-in'): Promise<void> {
  state.accessToken = input.accessToken;
  if (input.refreshToken) state.refreshToken = input.refreshToken;
  state.accessExpiresAt = input.expiresIn ? Date.now() + input.expiresIn * 1000 : null;
  try {
    await writeKeychainTokens({
      accessToken: state.accessToken ?? '',
      refreshToken: state.refreshToken ?? '',
    });
    // Ensure no leftover plaintext copies remain after a successful Keychain write.
    await AsyncStorage.multiRemove([KEY_ACCESS_LEGACY, KEY_REFRESH_LEGACY]);
  } catch {
    /* non-fatal — in-memory tokens still work for this process */
  }
  emit(event);
}

/** Update only the access token (rare - prefer setTokens). */
export const setAccessToken = (accessToken: string, expiresIn?: number): Promise<void> =>
  setTokens({ accessToken, expiresIn }, 'refreshed');

export const setRefreshToken = async (refreshToken: string): Promise<void> => {
  state.refreshToken = refreshToken;
  try {
    await writeKeychainTokens({
      accessToken: state.accessToken ?? '',
      refreshToken,
    });
  } catch {
    /* non-fatal */
  }
};

/** Remove tokens (keeps deviceId). `reason: 'expired'` notifies listeners so the UI can sign out. */
export async function clearSession(reason: 'cleared' | 'expired' = 'cleared'): Promise<void> {
  const had = hasSession();
  state.accessToken = null;
  state.refreshToken = null;
  state.accessExpiresAt = null;
  await clearKeychainTokens();
  try {
    await AsyncStorage.multiRemove([KEY_ACCESS_LEGACY, KEY_REFRESH_LEGACY]);
  } catch {
    /* non-fatal */
  }
  if (had || reason === 'cleared') emit(reason);
}
