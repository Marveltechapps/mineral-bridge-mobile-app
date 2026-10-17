/** In-memory customer session. Refresh tokens stay in process memory, not in source. */
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

export function clearSession(): void {
  accessToken = null;
  refreshToken = null;
  challengeId = null;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}
