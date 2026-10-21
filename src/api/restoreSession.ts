import { appStore, type KycStatus } from '../context/appStore';
import type { ScreenId } from '../navigation/types';
import { ENDPOINTS } from './config';
import { apiRequest, isApiError, isDemoMode } from './index';
import {
  clearSession,
  loadSignIn,
  saveSignIn,
  setSession,
  type SavedSignIn,
} from './session';

type Profile = {
  fullName: string | null;
  displayName: string | null;
  phone: string | null;
  kycStatus?: string;
};

function asKyc(status: string | undefined): KycStatus {
  return status === 'verified' || status === 'pending' ? status : 'none';
}

function national(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('234') ? digits.slice(3) : digits;
}

/** Where a restored sign-in opens. A verified or pending account goes home. */
function landing(saved: SavedSignIn, kyc: KycStatus): ScreenId {
  if (kyc === 'verified' || kyc === 'pending') return 'bHome';
  const next = saved.onboardingNext;
  if (next === 'intro' || next === 'tier' || next === 'kycStart' || next === 'bHome') {
    return next;
  }
  return saved.authMode === 'login' ? 'bHome' : 'intro';
}

function apply(saved: SavedSignIn, kyc: KycStatus, phone: string, name: string) {
  const next = landing(saved, kyc);
  appStore.setState({
    signedIn: true,
    guest: false,
    kyc,
    onboardingNext:
      next === 'intro' || next === 'tier' || next === 'kycStart' || next === 'bHome'
        ? next
        : saved.onboardingNext,
    phone: phone || saved.phone,
    displayName: name || saved.displayName,
    authMode: saved.authMode,
  });
  return next;
}

async function readProfile(): Promise<Profile> {
  return apiRequest<Profile>(ENDPOINTS.account.profile);
}

/**
 * Reads the sign-in saved after a successful code check.
 * Returns Welcome when nothing was saved, or when the saved token is rejected.
 */
export async function restoreSignedInDestination(): Promise<ScreenId> {
  const saved = await loadSignIn();
  if (!saved || saved.demo !== isDemoMode()) {
    if (saved) clearSession();
    return 'welcome';
  }
  if (saved.demo) return apply(saved, saved.kyc, saved.phone, saved.displayName);
  if (!saved.accessToken) {
    clearSession();
    return 'welcome';
  }

  setSession({ accessToken: saved.accessToken, refreshToken: saved.refreshToken });
  try {
    const profile = await readProfile();
    const kyc = asKyc(profile.kycStatus);
    return apply(
      saved,
      kyc,
      national(profile.phone),
      profile.fullName || profile.displayName || saved.displayName,
    );
  } catch (error) {
    if (!(isApiError(error) && error.status === 401 && saved.refreshToken)) {
      return apply(saved, saved.kyc, saved.phone, saved.displayName);
    }
    try {
      const refreshed = await apiRequest<{ accessToken: string; refreshToken?: string }>(
        ENDPOINTS.auth.refresh,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: saved.refreshToken }),
        },
      );
      setSession(refreshed);
      const profile = await readProfile();
      const kyc = asKyc(profile.kycStatus);
      const name = profile.fullName || profile.displayName || saved.displayName;
      await saveSignIn({
        ...saved,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || saved.refreshToken,
        kyc,
        displayName: name,
        phone: national(profile.phone) || saved.phone,
      });
      return apply(saved, kyc, national(profile.phone), name);
    } catch {
      clearSession();
      return 'welcome';
    }
  }
}
