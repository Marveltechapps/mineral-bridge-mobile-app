import {
  isDemoMode,
  isValidNigerianNational,
  requestMobileOtp,
  visibleDevelopmentOtp,
  verifyMobileOtp,
  type OnboardingStep,
} from '../api/auth';
import { getAccessToken, getRefreshToken, saveSignIn } from '../api/session';
import { GATED } from '../lib/catalog';
import { lessonKey } from '../learn/progress';
import { appStore } from '../context/appStore';
import { flash, go, jump } from './flow';
import { resolveMeta } from './screenMeta';
import type { ScreenId } from './types';

const TRACKED_ORDER = 'MB-2026-04871';
const WITHDRAW_MAX = 48500;
const MIN_BID = 48400;

/**
 * The bottom call-to-action buttons, ported from the design's `primary()` and
 * `secondary()` handlers. Trading screens are gated: guests are asked to sign
 * in and unverified accounts are sent to the identity check.
 */
function blockedByGate(screen: ScreenId): boolean {
  const st = appStore.getState();
  if (GATED[screen] && st.guest) {
    appStore.setState({ sheet: 'signin' });
    return true;
  }
  if (GATED[screen] && st.kyc !== 'verified') {
    appStore.setState({ sheet: 'kyc' });
    return true;
  }
  return false;
}

function otpError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function filled(value: string): boolean {
  return value.trim().length > 0;
}

function quantityOk(text: string): boolean {
  const n = Number(text);
  return text.trim() !== '' && Number.isFinite(n) && n > 0;
}

function sendCode(screen: 'signupPhone' | 'login') {
  const st = appStore.getState();
  if (!isValidNigerianNational(st.phone)) {
    flash('Enter a valid Nigerian mobile number');
    return;
  }
  if (st.otpBusy) return;
  if (isDemoMode()) {
    appStore.setState({ code: '', resend: 42 });
    go('otp');
    return;
  }
  appStore.setState({ otpBusy: true });
  const intent = screen === 'login' || st.authMode === 'login' ? 'login' : 'signup';
  void requestMobileOtp(st.phone, intent)
    .then(info => {
      appStore.setState({
        code: '',
        developmentOtp: visibleDevelopmentOtp(info.developmentOtp, typeof __DEV__ !== 'undefined' && __DEV__ === true),
        otpBusy: false,
        resend: info.resendAfter || 42,
        otpExpires: info.expiresIn || 60,
      });
      go('otp');
    })
    .catch((error: unknown) => {
      appStore.setState({ otpBusy: false });
      flash(otpError(error, 'Could not send the code'));
    });
}

/** Shared by the verify button and the keypad auto-submit. */
export function submitOtpCode(code: string) {
  if (code.length !== 6) {
    flash('Enter the 6-digit code');
    return;
  }
  const st = appStore.getState();
  if (st.otpBusy) return;
  if (isDemoMode()) {
    appStore.setState({ signedIn: true, sampleOrders: st.authMode !== 'signup' });
    void saveSignIn({
      demo: true,
      accessToken: '',
      refreshToken: '',
      phone: st.phone,
      kyc: st.kyc,
      onboardingNext: '',
      displayName: st.displayName,
      authMode: st.authMode,
    });
    go('verifying');
    return;
  }
  appStore.setState({ otpBusy: true });
  void verifyMobileOtp(st.phone, code)
    .then(info => {
      appStore.setState({
        otpBusy: false,
        developmentOtp: '',
        signedIn: true,
        sampleOrders: false,
        onboardingNext: info.nextStep,
        kyc: info.kyc,
      });
      void saveSignIn({
        demo: false,
        accessToken: getAccessToken() ?? '',
        refreshToken: getRefreshToken() ?? '',
        phone: st.phone,
        kyc: info.kyc,
        onboardingNext: info.nextStep,
        displayName: st.displayName,
        authMode: st.authMode,
      });
      go('verifying');
    })
    .catch((error: unknown) => {
      appStore.setState({ code: '', otpBusy: false });
      flash(otpError(error, 'That code was not accepted'));
    });
}

function continueAfterVerified(next: OnboardingStep | '') {
  if (next === 'bHome' || next === 'tier' || next === 'kycStart' || next === 'intro') {
    return go(next);
  }
  return go('intro');
}

export function primaryAction(screen: ScreenId) {
  const st = appStore.getState();
  const set = appStore.setState;
  const m = resolveMeta(screen, st);

  if (blockedByGate(screen)) return;

  switch (screen) {
    case 'intro':
      if (st.guest) {
        set({ guest: false, authMode: 'signup', phone: '', code: '' });
        return go('signupPhone');
      }
      return go(st.authMode === 'login' ? 'bHome' : 'tier');
    case 'authDone':
      set({ introOpen: 0 });
      return continueAfterVerified(st.onboardingNext);
  }
  if (m.sheet) return set({ sheet: m.sheet });
  switch (screen) {
    case 'welcome':
      set({ authMode: 'signup', phone: '', code: '' });
      return go('signupPhone');
    case 'signupPhone':
    case 'login':
      return sendCode(screen);
    case 'otp':
      return submitOtpCode(st.code);
    case 'kycId':
      if (st.idType < 0) {
        flash('Choose an ID type before continuing');
        return;
      }
      return go('kycDoc');
    case 'kycDoc':
      if (!st.docBack) {
        flash('Photograph the back of your ID before continuing');
        return;
      }
      return go('kycSelfie');
    case 'kycReview':
      set({ kyc: 'pending' });
      return go('kycPending');
    case 'kycPending':
      return go('bHome');
    case 'bDetail':
      set({ orderSubmitted: false });
      return go('bQty');
    case 'bQty':
      if (!quantityOk(st.qtyText)) {
        flash('Enter a quantity greater than zero');
        return;
      }
      return go('bDeliv');
    case 'bDeliv': {
      const d = st.delivery;
      const permitOk = st.tierIdx === 2 ? filled(d.permit) : true;
      if (
        !filled(d.facility) ||
        !filled(d.street) ||
        !filled(d.city) ||
        !filled(d.region) ||
        !filled(d.contact) ||
        !filled(d.phone) ||
        !permitOk
      ) {
        flash('Fill in the delivery details before continuing');
        return;
      }
      return go('bReview');
    }
    case 'cart':
      if (st.cartA <= 0 && st.cartB <= 0) {
        flash('Your cart is empty');
        return;
      }
      return go('bDeliv');
    case 'bReview':
      if (st.orderSubmitted) return;
      set({ orderSubmitted: true });
      return go('bDone');
    case 'track':
    case 'sTrack':
      return flash('Verification desk notified — they will call you');
    case 'qList':
      if (!quantityOk(st.qtyText)) {
        flash('Enter a weight greater than zero');
        return;
      }
      return go('sEstimate');
    case 'qPickup':
      if (!st.slot) {
        flash('Choose a time before continuing');
        return;
      }
      return go('qReview');
    case 'qReview':
      return go('qDone');
    case 'iStep1': {
      const b = st.bulk;
      if (
        !quantityOk(b.qty) ||
        !filled(b.mineral) ||
        !filled(b.partner) ||
        !filled(b.origin) ||
        !filled(b.extracted)
      ) {
        flash('Fill in the consignment details before continuing');
        return;
      }
      return go('iStep2');
    }
    case 'iStep2': {
      const b = st.bulk;
      if (
        !st.ack ||
        !filled(b.facility) ||
        !filled(b.street) ||
        !filled(b.city) ||
        !filled(b.region) ||
        !filled(b.contact) ||
        !filled(b.phone) ||
        !filled(b.permit)
      ) {
        flash('Fill in the facility details before continuing');
        return;
      }
      return go('iReview');
    }
    case 'iReview':
      if (st.bulkQuoted) return;
      set({ bulkQuoted: true });
      return go('iDone');
    case 'sOffer':
      if (st.offerAccepted) return;
      set({ offerAccepted: true });
      flash('Offer accepted — payment on its way');
      return go('sPaid');
    case 'lPlayer': {
      const key = lessonKey(st.catIdx, st.lessonIdx);
      if (!st.doneLessons.includes(key)) {
        set({ doneLessons: st.doneLessons.concat(key) });
      }
      return go('lList');
    }
    case 'editProfile': {
      const name = st.profileDraft.trim();
      if (name.length < 2) {
        flash('Enter your full name');
        return;
      }
      set({ displayName: name });
      return go('profile');
    }
    case 'newTicket':
      if (!st.ticketDraft.trim()) {
        flash('Describe the issue before submitting');
        return;
      }
      set({ ticketDraft: '' });
      return go('support');
    case 'withdraw':
      if (st.wd <= 0 || st.wd > WITHDRAW_MAX) {
        flash('Enter an amount within your available balance');
        return;
      }
      if (st.withdrawn) return;
      set({ withdrawn: true });
      return go('payout');
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
      set({
        authMode: 'login',
        phone: isDemoMode() ? '8024419087' : '',
        code: '',
      });
      return go('login');
    case 'track': {
      const deliveredIds = st.deliveredIds.includes(TRACKED_ORDER)
        ? st.deliveredIds
        : st.deliveredIds.concat(TRACKED_ORDER);
      set({ deliveredIds, orderTab: 'completed' });
      return go('orders');
    }
    case 'editProfile':
      set({ profileDraft: st.displayName });
      return go('profile');
  }
  go(resolveMeta(screen, st).next2);
}

/** Opens the bid sheet, or the sign-in / KYC sheet when bidding is gated. */
export function openBidSheet() {
  if (blockedByGate('aDetail')) {
    appStore.setState({ banner: false });
    return;
  }
  appStore.setState({ banner: false, sheet: 'bid' });
}

/** "Add to Cart" on the product screen. Gated the same way as Buy Now. */
export function addToCart() {
  if (blockedByGate('bDetail')) return;
  appStore.setState(p => ({ cartA: p.cartA > 0 ? p.cartA : 250 }));
  flash('Gold Doré Bar added to your cart');
  go('cart');
}

export function bidIsHighEnough(amount: number): boolean {
  return amount >= MIN_BID;
}

export const MIN_BID_AMOUNT = MIN_BID;
