import { env } from '../src/config/env';
import { fetchDevLoginStatus, startDevLogin, verifyDevLogin, visibleDevelopmentOtp } from '../src/api/auth';
import { getChallengeId, setChallengeId } from '../src/api/session';
import { devLoginUiAllowed } from '../src/screens/auth/devLoginAccess';

const originalBaseUrl = env.API_BASE_URL;

afterEach(() => {
  env.API_BASE_URL = originalBaseUrl;
  setChallengeId(null);
  globalThis.fetch = originalFetch;
});

const originalFetch = globalThis.fetch;

function stub(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
  return calls;
}

describe('development login access', () => {
  it('hides a development verification code in a release build', () => {
    expect(visibleDevelopmentOtp('847291', false)).toBe('');
    expect(visibleDevelopmentOtp('847291', true)).toBe('847291');
    expect(visibleDevelopmentOtp(undefined, true)).toBe('');
  });

  it('stays unavailable in a release build and when the backend disables it', () => {
    expect(devLoginUiAllowed(false, true)).toBe(false);
    expect(devLoginUiAllowed(true, false)).toBe(false);
    expect(devLoginUiAllowed(true, true)).toBe(true);
  });

  it('calls the backend development login routes and keeps the code out of storage', async () => {
    env.API_BASE_URL = 'https://api.mineralbridge.test/v1';
    const calls = stub(200, {
      enabled: true,
      challengeId: 'chl_dev',
      developmentOtp: '847291',
      codeLength: 6,
      expiresIn: 120,
      accessToken: 'access',
      refreshToken: 'refresh',
      account: { kyc: { status: 'none' }, onboarding: { nextStep: 'tier' } },
    });
    await expect(fetchDevLoginStatus()).resolves.toMatchObject({ enabled: true });
    const started = await startDevLogin('dev.app@example.com', 'local-app-password');
    expect(started.developmentOtp).toBe('847291');
    expect(getChallengeId()).toBe('chl_dev');
    await verifyDevLogin('847291');
    expect(getChallengeId()).toBeNull();
    expect(calls.map((call) => call.url)).toEqual([
      'https://api.mineralbridge.test/v1/auth/dev-login',
      'https://api.mineralbridge.test/v1/auth/dev-login',
      'https://api.mineralbridge.test/v1/auth/dev-login/verify',
    ]);
    const bodies = calls.map((call) => String(call.init.body ?? ''));
    expect(bodies[1]).not.toContain('847291');
    expect(bodies[1]).toContain('dev.app@example.com');
    expect(bodies[2]).toContain('"code":"847291"');
  });
});
