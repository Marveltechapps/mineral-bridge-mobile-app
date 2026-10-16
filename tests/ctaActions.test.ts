import { appStore } from '../src/context/appStore';

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
  beforeEach(() => {
    appStore.reset();
    mockGo.mockClear();
    mockJump.mockClear();
    mockFlash.mockClear();
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
    addToCart();
    expect(mockGo).toHaveBeenCalledWith('cart');
  });
});
