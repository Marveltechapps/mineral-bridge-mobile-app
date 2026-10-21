import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mb.signed-in';

/** A verified sign-in. The OTP challenge is never written here. */
export type SavedSignIn = {
  demo: boolean;
  accessToken: string;
  refreshToken: string;
  phone: string;
  kyc: 'none' | 'pending' | 'verified';
  onboardingNext: 'intro' | 'tier' | 'kycStart' | 'bHome' | '';
  displayName: string;
  authMode: 'signup' | 'login';
};

/** In-memory customer session. The copy that survives a restart lives in storage. */
let accessToken: string | null = null;
let refreshToken: string | null = null;
let challengeId: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getChallengeId(): string | null {
  return challengeId;
}

export function setChallengeId(id: string | null): void {
  challengeId = id;
}

export function setSession(tokens: { accessToken: string; refreshToken?: string }): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken ?? refreshToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export async function saveSignIn(value: SavedSignIn): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function loadSignIn(): Promise<SavedSignIn | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedSignIn;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.demo && !parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  accessToken = null;
  refreshToken = null;
  challengeId = null;
  void AsyncStorage.removeItem(STORAGE_KEY);
}
