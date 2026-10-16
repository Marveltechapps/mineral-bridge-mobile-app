import { compactDollars, dollars, formatMoney } from '../src/utils/format';
import { appStore, initialState } from '../src/context/appStore';
import { resolveMeta, tabHome } from '../src/navigation/screenMeta';

describe('format', () => {
  it('groups thousands like toLocaleString("en-US")', () => {
    expect(formatMoney(15350000)).toBe('15,350,000');
    expect(formatMoney(48400)).toBe('48,400');
    expect(formatMoney(999)).toBe('999');
    expect(formatMoney(1234.5, 2)).toBe('1,234.50');
  });

  it('formats whole dollars and compact millions', () => {
    expect(dollars(276300.4)).toBe('$276,300');
    expect(compactDollars(13100000)).toBe('$13.10M');
    expect(compactDollars(945000)).toBe('$945,000');
  });
});

describe('appStore', () => {
  afterEach(() => appStore.reset());

  it('starts from the design state', () => {
    expect(appStore.getState().phone).toBe('8024419087');
    expect(appStore.getState().slot).toBe('10:00');
    expect(appStore.getState().kyc).toBe('none');
  });

  it('merges partial and functional updates', () => {
    appStore.setState({ qty: 300 });
    appStore.setState(p => ({ qty: p.qty + 50 }));
    expect(appStore.getState().qty).toBe(350);
    expect(appStore.getState().unit).toBe(initialState.unit);
  });

  it('notifies subscribers', () => {
    const listener = jest.fn();
    const off = appStore.subscribe(listener);
    appStore.setState({ toast: 'Hello' });
    off();
    appStore.setState({ toast: null });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('resolveMeta', () => {
  const base = {
    authMode: 'signup' as const,
    guest: false,
    kyc: 'none' as const,
  };

  it('runs auth and onboarding screens on the dark ground with gold CTAs', () => {
    const welcome = resolveMeta('welcome', base);
    expect(welcome.dark).toBe(true);
    expect(welcome.ctaRadius).toBe(9999);
    expect(welcome.ctaBg).toContain('#f7dd8e');
    const otp = resolveMeta('otp', base);
    expect(otp.dark).toBe(true);
    expect(otp.ctaRadius).toBe(11);
    expect(resolveMeta('bHome', base).dark).toBe(false);
  });

  it('gates trading screens behind sign-in and KYC', () => {
    expect(resolveMeta('bDetail', { ...base, guest: true }).cta).toBe(
      'Sign in to continue',
    );
    expect(resolveMeta('bDetail', base).cta).toBe(
      'Verify identity to continue',
    );
    expect(resolveMeta('bDetail', { ...base, kyc: 'pending' }).cta).toBe(
      'Verification in review',
    );
    expect(resolveMeta('bDetail', { ...base, kyc: 'verified' }).cta).toBe(
      'Continue',
    );
  });

  it('uses the dual CTA only on the product screen', () => {
    expect(resolveMeta('bDetail', base).dualCta).toBe(true);
    expect(resolveMeta('bQty', base).dualCta).toBe(false);
    expect(resolveMeta('bQty', base).soloCta).toBe(true);
  });

  it('drops the sign-up steps when logging in', () => {
    const m = resolveMeta('otp', { ...base, authMode: 'login' });
    expect(m.title).toBe('Log in');
    expect(m.step).toBe('');
  });

  it('swaps the explainer CTAs for guests', () => {
    expect(resolveMeta('intro', base).cta).toBe('Got it — continue');
    expect(resolveMeta('intro', { ...base, guest: true }).cta2).toBe(
      'Browse as a guest',
    );
  });

  it('knows each tab home', () => {
    expect(tabHome('support')).toBe('profile');
    expect(tabHome('sPick')).toBe('sPick');
    expect(tabHome('bDetail')).toBe('bHome');
  });
});
