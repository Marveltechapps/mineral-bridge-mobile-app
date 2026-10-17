import { apiRequest, isDemoMode } from './index';
import { ENDPOINTS } from './config';
import { getChallengeId, setChallengeId, setSession } from './session';

export { isDemoMode };

export interface OtpChallenge {
  challengeId: string;
  resendAfter: number;
  expiresIn: number;
}

function toE164(national: string): string {
  const digits = national.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export async function requestMobileOtp(nationalPhone: string, intent: 'signup' | 'login'): Promise<OtpChallenge> {
  const body = await apiRequest<OtpChallenge>(ENDPOINTS.auth.requestOtp, {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(nationalPhone), intent, channel: 'sms' }),
  });
  setChallengeId(body.challengeId);
  return body;
}

export async function verifyMobileOtp(nationalPhone: string, code: string): Promise<void> {
  const challengeId = getChallengeId();
  if (!challengeId) throw new Error('Request a code before verifying');
  const body = await apiRequest<{ accessToken: string; refreshToken: string }>(ENDPOINTS.auth.verifyOtp, {
    method: 'POST',
    body: JSON.stringify({
      challengeId,
      phone: toE164(nationalPhone),
      code,
      device: { platform: 'android', name: 'Mineral Bridge' },
    }),
  });
  setSession(body);
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
