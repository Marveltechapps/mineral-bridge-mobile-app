import { apiRequest, isDemoMode } from './index';
import { ENDPOINTS } from './config';
import { clearSession, getChallengeId, setChallengeId, setSession } from './session';

export { isDemoMode };

export interface OtpChallenge {
  challengeId: string;
  resendAfter: number;
  expiresIn: number;
  developmentOtp?: string;
}

/** Release builds drop a development code before it can reach the screen. */
export function visibleDevelopmentOtp(code: string | undefined, devBuild: boolean): string {
  if (devBuild !== true || !/^\d{6}$/.test(code ?? '')) return '';
  return code ?? '';
}

function toE164(national: string): string {
  const digits = national.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

/** Nigerian mobiles are 10 digits starting 7, 8 or 9, with an optional leading 0. */
export function isValidNigerianNational(national: string): boolean {
  const digits = national.replace(/\D/g, '');
  const local = digits.startsWith('234')
    ? digits.slice(3)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return /^[789]\d{9}$/.test(local);
}

export type OnboardingStep = 'intro' | 'tier' | 'kycStart' | 'bHome';

export interface VerifiedSession {
  nextStep: OnboardingStep;
  kyc: 'none' | 'pending' | 'verified';
}

export async function requestMobileOtp(nationalPhone: string, intent: 'signup' | 'login'): Promise<OtpChallenge> {
  const body = await apiRequest<OtpChallenge>(ENDPOINTS.auth.requestOtp, {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(nationalPhone), intent, channel: 'sms' }),
  });
  setChallengeId(body.challengeId);
  return body;
}

export async function verifyMobileOtp(nationalPhone: string, code: string): Promise<VerifiedSession> {
  const challengeId = getChallengeId();
  if (!challengeId) throw new Error('Request a code before verifying');
  const body = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    account?: {
      kyc?: { status?: string };
      onboarding?: { nextStep?: string };
    };
  }>(ENDPOINTS.auth.verifyOtp, {
    method: 'POST',
    body: JSON.stringify({
      challengeId,
      phone: toE164(nationalPhone),
      code,
      device: { platform: 'android', name: 'Mineral Bridge' },
    }),
  });
  setSession(body);
  const step = body.account?.onboarding?.nextStep;
  const nextStep: OnboardingStep =
    step === 'home' ? 'bHome' : step === 'tier' || step === 'kycStart' || step === 'intro' ? step : 'intro';
  const raw = body.account?.kyc?.status;
  const kyc = raw === 'pending' || raw === 'verified' ? raw : 'none';
  return { nextStep, kyc };
}

export async function signOutMobile(): Promise<void> {
  await apiRequest(ENDPOINTS.auth.signOut, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  clearSession();
}

export async function deleteMobileAccount(pin: string): Promise<void> {
  await apiRequest(ENDPOINTS.auth.deleteAccount, {
    method: 'DELETE',
    headers: { 'X-Transaction-Pin': pin },
  });
  clearSession();
}

export async function resendMobileOtp(): Promise<OtpChallenge> {
  const challengeId = getChallengeId();
  if (!challengeId) throw new Error('Request a code before resending');
  const body = await apiRequest<OtpChallenge>(ENDPOINTS.auth.resendOtp, {
    method: 'POST',
    body: JSON.stringify({ challengeId }),
  });
  setChallengeId(body.challengeId);
  return body;
}

export function fetchDevLoginStatus(): Promise<{ enabled: boolean; codeLength?: number }> {
  return apiRequest(ENDPOINTS.auth.devLoginStatus);
}

export async function startDevLogin(
  email: string,
  password: string,
): Promise<{ challengeId: string; developmentOtp: string; expiresIn: number; codeLength: number }> {
  const body = await apiRequest<{ challengeId: string; developmentOtp: string; expiresIn: number; codeLength: number }>(
    ENDPOINTS.auth.devLogin,
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
  setChallengeId(body.challengeId);
  return body;
}

export async function verifyDevLogin(code: string): Promise<VerifiedSession> {
  const challengeId = getChallengeId();
  if (!challengeId) throw new Error('Request a code before verifying');
  const body = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    account?: { kyc?: { status?: string }; onboarding?: { nextStep?: string } };
  }>(ENDPOINTS.auth.devLoginVerify, {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  });
  setChallengeId(null);
  setSession(body);
  const step = body.account?.onboarding?.nextStep;
  const nextStep: OnboardingStep =
    step === 'home' ? 'bHome' : step === 'tier' || step === 'kycStart' || step === 'intro' ? step : 'intro';
  const raw = body.account?.kyc?.status;
  const kyc = raw === 'pending' || raw === 'verified' ? raw : 'none';
  return { nextStep, kyc };
}
