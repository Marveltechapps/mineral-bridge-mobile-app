import { api, setTokens, clearSession, getDeviceId } from '../api';
import type {
  AuthSession,
  OtpChallenge,
  OtpChannel,
  OtpRequestBody,
  OtpVerifyBody,
  OtpVerifyResult,
  RefreshResult,
  RegisterBody,
  SignedIn,
} from '../api';
import { refreshSession } from '../api/client';
import { getRefreshToken } from '../api/session';
import { Platform } from 'react-native';

const PUBLIC = { auth: false } as const;

/** POST /auth/otp/request (202). `fullName` is required for `intent: 'signup'`. */
export const requestOtp = (body: OtpRequestBody, signal?: AbortSignal): Promise<OtpChallenge> =>
  api.post<OtpChallenge>('/auth/otp/request', body, { ...PUBLIC, signal });

/** POST /auth/otp/resend (202). */
export const resendOtp = (challengeId: string, channel?: OtpChannel, signal?: AbortSignal): Promise<OtpChallenge> =>
  api.post<OtpChallenge>('/auth/otp/resend', { challengeId, ...(channel ? { channel } : {}) }, { ...PUBLIC, signal });

/**
 * POST /auth/otp/verify. Returns `needs_registration` (call `register`) or `signed_in`.
 * On `signed_in` the tokens are stored automatically.
 */
export async function verifyOtp(
  input: { challengeId: string; code: string; keepSignedIn?: boolean },
  signal?: AbortSignal,
): Promise<OtpVerifyResult> {
  const body: OtpVerifyBody = {
    challengeId: input.challengeId,
    code: input.code,
    keepSignedIn: input.keepSignedIn ?? true,
    device: { id: await getDeviceId(), platform: Platform.OS, name: `${Platform.OS} device` },
  };
  const res = await api.post<OtpVerifyResult>('/auth/otp/verify', body, { ...PUBLIC, signal });
  if (res.status === 'signed_in') await storeSignedIn(res);
  return res;
}

/** POST /auth/register (201). Consumes the `registrationToken` from `verifyOtp`. Stores tokens. */
export async function register(body: RegisterBody, signal?: AbortSignal): Promise<SignedIn> {
  const res = await api.post<SignedIn>('/auth/register', body, { ...PUBLIC, signal });
  await storeSignedIn(res);
  return res;
}

async function storeSignedIn(res: SignedIn): Promise<void> {
  await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken, expiresIn: res.expiresIn }, 'signed-in');
}

/**
 * POST /auth/refresh with the stored refresh token (single-flight; also done automatically by the client).
 * Returns the new tokens after persisting them.
 */
export async function refresh(): Promise<void> {
  await refreshSession();
}

/** Low-level refresh that returns the raw body (does not store). Prefer `refresh()`. */
export const refreshRaw = (refreshToken: string = getRefreshToken() ?? ''): Promise<RefreshResult> =>
  api.post<RefreshResult>('/auth/refresh', { refreshToken }, PUBLIC);

/** POST /auth/logout (204). Always clears local tokens, even if the request fails. */
export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout');
  } catch {
    /* sign out locally regardless (offline / already-expired session) */
  } finally {
    await clearSession('cleared');
  }
}

/** GET /auth/sessions. */
export const listSessions = (signal?: AbortSignal): Promise<AuthSession[]> =>
  api.get<{ items: AuthSession[] }>('/auth/sessions', { signal }).then(r => r.items);

/** DELETE /auth/sessions/:id (204). */
export const revokeSession = (id: string): Promise<void> => api.delete<void>(`/auth/sessions/${encodeURIComponent(id)}`);
