import { requestMobileOtp, isDemoMode } from '../api/auth';
import { GATED } from '../lib/catalog';
import { appStore } from '../context/appStore';
import { flash, go, jump } from './flow';
import { resolveMeta } from './screenMeta';
import type { ScreenId } from './types';

/**
 * The bottom call-to-action buttons, ported from the design's `primary()` and
 * `secondary()` handlers. Trading screens are gated: guests are asked to sign
 * in and unverified accounts are sent to the identity check.
 */
export function primaryAction(screen: ScreenId) {
  const st = appStore.getState();
  const set = appStore.setState;
  const m = resolveMeta(screen, st);

  if (GATED[screen] && st.guest) return set({ sheet: 'signin' });
  if (GATED[screen] && st.kyc !== 'verified') return set({ sheet: 'kyc' });

  switch (screen) {
    case 'intro':
      if (st.guest) {
        set({ guest: false, authMode: 'signup', phone: '', code: '' });
        return go('signupPhone');
      }
      return go(st.authMode === 'login' ? 'bHome' : 'tier');
    case 'authDone':
      set({ introOpen: 0 });
      return go('intro');
  }
  if (m.sheet) return set({ sheet: m.sheet });
  switch (screen) {
    case 'welcome':
      set({ authMode: 'signup', phone: '', code: '' });
      return go('signupPhone');
    case 'signupPhone':
    case 'login':
      if (isDemoMode()) {
        set({ code: '', resend: 42 });
        return go('otp');
      }
      void requestMobileOtp(st.phone, screen === 'login' || st.authMode === 'login' ? 'login' : 'signup')
        .then(info => {
          set({ code: '', resend: info.resendAfter || 42, otpExpires: info.expiresIn || 60 });
          go('otp');
        })
        .catch((error: unknown) => flash(error instanceof Error ? error.message : 'Could not send the code'));
      return;
    case 'kycReview':
      set({ kyc: 'pending' });
      return go('kycPending');
    case 'kycPending':
      return go('bHome');
    case 'track':
      return flash('Verification desk notified — they will call you');
    case 'qReview':
      return go('qDone');
    case 'iReview':
      return go('iDone');
    case 'sOffer':
      // As in the design, the navigation that follows clears this toast.
      flash('Offer accepted — payment on its way');
      return go('sPaid');
  }
  go(m.next);
}

export function secondaryAction(screen: ScreenId) {
  const st = appStore.getState();
  const set = appStore.setState;
  switch (screen) {
    case 'intro':
      set({ guest: true });
      return jump('bHome');
    case 'sOffer':
      flash('Offer declined — the lot stays yours');
      return go('sPick');
    case 'welcome':
      set({ authMode: 'login', phone: '8024419087', code: '' });
      return go('login');
  }
  go(resolveMeta(screen, st).next2);
}

/** "Add to Cart" on the product screen. */
export function addToCart() {
  flash('Gold Doré Bar added to your cart');
  go('cart');
}
