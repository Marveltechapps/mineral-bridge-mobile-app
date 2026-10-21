import AsyncStorage from '@react-native-async-storage/async-storage';
import { appStore } from '../src/context/appStore';
import { env } from '../src/config/env';
import { clearSession } from '../src/api/session';

jest.mock('../src/api/auth', () => {
  const actual = jest.requireActual('../src/api/auth');
  return {
    ...actual,
    requestMobileOtp: jest.fn(),
    verifyMobileOtp: jest.fn(),
  };
});

const mockGo = jest.fn();
const mockJump = jest.fn();
const mockFlash = jest.fn();
jest.mock('../src/navigation/flow', () => ({
  go: (s: string) => mockGo(s),
  jump: (s: string) => mockJump(s),
  flash: (m: string) => mockFlash(m),
}));

// Imported after the mock so the actions use the stubbed navigation.
const {
  primaryAction,
  secondaryAction,
  addToCart,
} = require('../src/navigation/ctaActions');

describe('CTA actions', () => {
  beforeEach(async () => {
    appStore.reset();
    clearSession();
    await AsyncStorage.clear();
    mockGo.mockClear();
    mockJump.mockClear();
    mockFlash.mockClear();
    const auth = require('../src/api/auth') as {
      requestMobileOtp: jest.Mock;
      verifyMobileOtp: jest.Mock;
    };
    auth.requestMobileOtp.mockReset();
    auth.verifyMobileOtp.mockReset();
  });

  it('opens the sign-in sheet when a guest tries to trade', () => {
    appStore.setState({ guest: true });
    primaryAction('bDetail');
    expect(appStore.getState().sheet).toBe('signin');
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('opens the KYC sheet for unverified accounts', () => {
    primaryAction('qList');
    expect(appStore.getState().sheet).toBe('kyc');
  });

  it('follows the flow once verified', () => {
    appStore.setState({ kyc: 'verified' });
    primaryAction('bQty');
    expect(mockGo).toHaveBeenCalledWith('bDeliv');
  });

  it('opens the bid sheet on the auction detail', () => {
    appStore.setState({ kyc: 'verified' });
    primaryAction('aDetail');
    expect(appStore.getState().sheet).toBe('bid');
  });

  it('starts sign-up from welcome with an empty number', () => {
    primaryAction('welcome');
    expect(appStore.getState().phone).toBe('');
    expect(mockGo).toHaveBeenCalledWith('signupPhone');
  });

  it('pre-fills the number for log in', () => {
    appStore.setState({ phone: '' });
    secondaryAction('welcome');
    expect(appStore.getState().authMode).toBe('login');
    expect(appStore.getState().phone).toBe('8024419087');
    expect(mockGo).toHaveBeenCalledWith('login');
  });

  it('marks KYC as pending on submit', () => {
    primaryAction('kycReview');
    expect(appStore.getState().kyc).toBe('pending');
    expect(mockGo).toHaveBeenCalledWith('kycPending');
  });

  it('routes the explainer by auth mode', () => {
    primaryAction('intro');
    expect(mockGo).toHaveBeenCalledWith('tier');
    appStore.setState({ authMode: 'login' });
    primaryAction('intro');
    expect(mockGo).toHaveBeenCalledWith('bHome');
  });

  it('lets guests continue browsing from the explainer', () => {
    secondaryAction('intro');
    expect(appStore.getState().guest).toBe(true);
    expect(mockJump).toHaveBeenCalledWith('bHome');
  });

  it('notifies the desk instead of navigating on order tracking', () => {
    primaryAction('track');
    expect(mockFlash).toHaveBeenCalledWith(
      'Verification desk notified — they will call you',
    );
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('adds to cart and opens the cart', () => {
    appStore.setState({ kyc: 'verified' });
    addToCart();
    expect(mockFlash).toHaveBeenCalledWith('Gold Doré Bar added to your cart');
    expect(mockGo).toHaveBeenCalledWith('cart');
  });

  it('does not add to the cart for a guest', () => {
    appStore.setState({ guest: true });
    addToCart();
    expect(appStore.getState().sheet).toBe('signin');
    expect(mockFlash).not.toHaveBeenCalled();
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('does not add to the cart before identity is verified', () => {
    addToCart();
    expect(appStore.getState().sheet).toBe('kyc');
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('refuses a short number and does not request a code', () => {
    appStore.setState({ phone: '123', authMode: 'signup' });
    primaryAction('signupPhone');
    const auth = require('../src/api/auth') as { requestMobileOtp: jest.Mock };
    expect(auth.requestMobileOtp).not.toHaveBeenCalled();
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockFlash).toHaveBeenCalledWith('Enter a valid Nigerian mobile number');
  });

  it('ignores a second tap while a code is already being sent', () => {
    const auth = require('../src/api/auth') as { requestMobileOtp: jest.Mock };
    const previous = env.API_BASE_URL;
    env.API_BASE_URL = 'http://127.0.0.1:4000';
    auth.requestMobileOtp.mockReset();
    auth.requestMobileOtp.mockReturnValue(new Promise(() => undefined));
    appStore.setState({ phone: '8024419087', authMode: 'signup', otpBusy: false });
    primaryAction('signupPhone');
    primaryAction('signupPhone');
    expect(auth.requestMobileOtp).toHaveBeenCalledTimes(1);
    env.API_BASE_URL = previous;
  });

  it('stays on the code screen when the code is short or wrong', async () => {
    primaryAction('otp');
    expect(mockFlash).toHaveBeenCalledWith('Enter the 6-digit code');
    expect(mockGo).not.toHaveBeenCalled();

    const auth = require('../src/api/auth') as { verifyMobileOtp: jest.Mock };
    const previous = env.API_BASE_URL;
    env.API_BASE_URL = 'http://127.0.0.1:4000';
    auth.verifyMobileOtp.mockReset();
    auth.verifyMobileOtp.mockRejectedValue(new Error('That code is incorrect.'));
    appStore.setState({ phone: '8024419087', code: '123456', otpBusy: false });
    primaryAction('otp');
    await auth.verifyMobileOtp.mock.results[0]?.value.catch(() => undefined);
    expect(mockGo).not.toHaveBeenCalledWith('verifying');
    expect(mockFlash).toHaveBeenCalledWith('That code is incorrect.');
    env.API_BASE_URL = previous;
  });

  it('notifies the desk from sell-request tracking without leaving', () => {
    primaryAction('sTrack');
    expect(mockFlash).toHaveBeenCalledWith(
      'Verification desk notified — they will call you',
    );
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('blocks document continue until the back of the ID is captured', () => {
    primaryAction('kycDoc');
    expect(mockGo).not.toHaveBeenCalled();
    appStore.setState({ docBack: true });
    primaryAction('kycDoc');
    expect(mockGo).toHaveBeenCalledWith('kycSelfie');
  });

  it('marks the open lesson complete', () => {
    appStore.setState({ catIdx: 1, lessonIdx: 0, doneLessons: [] });
    primaryAction('lPlayer');
    expect(appStore.getState().doneLessons).toEqual(['1:0']);
    expect(mockGo).toHaveBeenCalledWith('lList');
  });

  it('moves a confirmed delivery into completed orders', () => {
    appStore.setState({ kyc: 'verified' });
    secondaryAction('track');
    expect(appStore.getState().deliveredIds).toContain('MB-2026-04871');
    expect(appStore.getState().orderTab).toBe('completed');
    expect(mockGo).toHaveBeenCalledWith('orders');
  });

  it('leaves the login number empty when an API is configured', () => {
    const previous = env.API_BASE_URL;
    env.API_BASE_URL = 'http://127.0.0.1:4000';
    appStore.setState({ phone: '8024419087' });
    secondaryAction('welcome');
    expect(appStore.getState().phone).toBe('');
    expect(mockGo).toHaveBeenCalledWith('login');
    env.API_BASE_URL = previous;
  });

  it('rejects an empty support ticket', () => {
    appStore.setState({ ticketDraft: '   ' });
    primaryAction('newTicket');
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockFlash).toHaveBeenCalledWith('Describe the issue before submitting');
  });

  it('does not continue from an empty cart', () => {
    appStore.setState({ kyc: 'verified', cartA: 0, cartB: 0 });
    primaryAction('cart');
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockFlash).toHaveBeenCalledWith('Your cart is empty');
  });

  it('rejects a blank, zero, or negative quantity', () => {
    appStore.setState({ kyc: 'verified', qtyText: '0', qty: 0 });
    primaryAction('bQty');
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockFlash).toHaveBeenCalledWith('Enter a quantity greater than zero');

    appStore.setState({ qtyText: '5', qty: 5, unit: 'kg' });
    primaryAction('bQty');
    expect(mockGo).toHaveBeenCalledWith('bDeliv');
  });

  it('rejects blank delivery details', () => {
    appStore.setState({
      kyc: 'verified',
      delivery: { ...appStore.getState().delivery, street: '   ' },
    });
    primaryAction('bDeliv');
    expect(mockGo).not.toHaveBeenCalled();
    expect(mockFlash).toHaveBeenCalledWith(
      'Fill in the delivery details before continuing',
    );
  });

  it('keeps a cleared delivery address off the next step', () => {
    appStore.setState({ kyc: 'verified' });
    primaryAction('bDeliv');
    expect(mockGo).toHaveBeenCalledWith('bReview');
  });

  it('rejects a sell weight of zero and a booking with no time', () => {
    appStore.setState({ kyc: 'verified', qtyText: '', qty: 0 });
    primaryAction('qList');
    expect(mockGo).not.toHaveBeenCalled();

    appStore.setState({ qtyText: '250', qty: 250, slot: '' });
    primaryAction('qPickup');
    expect(mockFlash).toHaveBeenCalledWith('Choose a time before continuing');
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('requires an ID type and consignment details', () => {
    appStore.setState({ idType: -1 });
    primaryAction('kycId');
    expect(mockFlash).toHaveBeenCalledWith('Choose an ID type before continuing');
    expect(mockGo).not.toHaveBeenCalled();

    appStore.setState({
      kyc: 'verified',
      bulk: { ...appStore.getState().bulk, origin: '' },
    });
    primaryAction('iStep1');
    expect(mockFlash).toHaveBeenCalledWith(
      'Fill in the consignment details before continuing',
    );
  });

  it('remembers a verified sign-in for the next launch', async () => {
    appStore.setState({ phone: '8024419087', code: '123456', authMode: 'signup' });
    primaryAction('otp');
    await Promise.resolve();
    appStore.reset();
    const { restoreSignedInDestination } = require('../src/api/restoreSession') as {
      restoreSignedInDestination: () => Promise<string>;
    };
    await expect(restoreSignedInDestination()).resolves.toBe('intro');
    expect(appStore.getState().signedIn).toBe(true);
    expect(appStore.getState().phone).toBe('8024419087');
  });

  it('does not restore a session that was never verified', async () => {
    const { restoreSignedInDestination } = require('../src/api/restoreSession') as {
      restoreSignedInDestination: () => Promise<string>;
    };
    await expect(restoreSignedInDestination()).resolves.toBe('welcome');
    expect(appStore.getState().signedIn).toBe(false);
  });

  it('opens home when a saved account is now verified', async () => {
    const { saveSignIn } = require('../src/api/session') as {
      saveSignIn: (value: unknown) => Promise<void>;
    };
    const { restoreSignedInDestination } = require('../src/api/restoreSession') as {
      restoreSignedInDestination: () => Promise<string>;
    };
    const previous = env.API_BASE_URL;
    const originalFetch = globalThis.fetch;
    env.API_BASE_URL = 'http://127.0.0.1:4000';
    await saveSignIn({
      demo: false,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      phone: '8024419087',
      kyc: 'none',
      onboardingNext: 'kycStart',
      displayName: 'Adaeze Okafor',
      authMode: 'login',
    });
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          fullName: 'Adaeze Okafor',
          displayName: 'Adaeze Okafor',
          phone: '+2348024419087',
          kycStatus: 'verified',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )) as typeof fetch;
    try {
      await expect(restoreSignedInDestination()).resolves.toBe('bHome');
      expect(appStore.getState().kyc).toBe('verified');
      expect(appStore.getState().signedIn).toBe(true);
    } finally {
      env.API_BASE_URL = previous;
      globalThis.fetch = originalFetch;
    }
  });

  it('gives a new sign-up an empty order book and keeps the demo login history', () => {
    appStore.setState({ phone: '8024419087', code: '123456', authMode: 'signup' });
    primaryAction('otp');
    expect(appStore.getState().sampleOrders).toBe(false);

    appStore.setState({ phone: '8024419087', code: '123456', authMode: 'login' });
    primaryAction('otp');
    expect(appStore.getState().sampleOrders).toBe(true);
  });

  it('reopens the bid sheet from the outbid banner only when bidding is allowed', () => {
    const { openBidSheet } = require('../src/navigation/ctaActions') as {
      openBidSheet: () => void;
    };
    openBidSheet();
    expect(appStore.getState().sheet).toBe('kyc');

    appStore.setState({ kyc: 'verified', banner: true });
    openBidSheet();
    expect(appStore.getState().sheet).toBe('bid');
    expect(appStore.getState().banner).toBe(false);
  });

  it('lists Gold Doré after Add to Cart even when that line was empty', () => {
    appStore.setState({ kyc: 'verified', cartA: 0 });
    addToCart();
    expect(appStore.getState().cartA).toBeGreaterThan(0);
    expect(mockFlash).toHaveBeenCalledWith('Gold Doré Bar added to your cart');
    expect(mockGo).toHaveBeenCalledWith('cart');
  });

  it('gates cart checkout for an unverified account', () => {
    primaryAction('cart');
    expect(appStore.getState().sheet).toBe('kyc');
    expect(mockGo).not.toHaveBeenCalled();
  });

  it('tells the person to create an account when login is for an unknown number', async () => {
    const auth = require('../src/api/auth') as {
      isDemoMode: () => boolean;
      requestMobileOtp: jest.Mock;
    };
    const previous = env.API_BASE_URL;
    env.API_BASE_URL = 'http://127.0.0.1:4000';
    expect(auth.isDemoMode()).toBe(false);
    auth.requestMobileOtp.mockReset();
    auth.requestMobileOtp.mockRejectedValue(
      new Error('Account not found. Please check your email or mobile number, or create a new account.'),
    );
    appStore.setState({ phone: '8024419087', authMode: 'login' });
    primaryAction('login');
    expect(auth.requestMobileOtp).toHaveBeenCalledWith('8024419087', 'login');
    await auth.requestMobileOtp.mock.results[0]?.value.catch(() => undefined);
    expect(mockGo).not.toHaveBeenCalledWith('otp');
    expect(mockFlash).toHaveBeenCalledWith(
      'Account not found. Please check your email or mobile number, or create a new account.',
    );
    env.API_BASE_URL = previous;
  });
});
