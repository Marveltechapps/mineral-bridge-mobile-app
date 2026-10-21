import type { SheetId } from '../context/appStore';
import type { AppState } from '../context/appStore';
import { GATED } from '../lib/catalog';
import type { ScreenId, TabId } from './types';

/**
 * Per-screen chrome from the design's `META` table: header title, step
 * progress, primary/secondary call-to-action and tab bar.
 */
export type ScreenMeta = {
  /** Reference name used by the design (e.g. "B4 · Mineral detail"). */
  name: string;
  title?: string;
  step?: string;
  stepnote?: string;
  prog?: string;
  cta?: string;
  next?: ScreenId;
  cta2?: string;
  next2?: ScreenId;
  tabs?: boolean;
  tab?: TabId;
  bell?: boolean;
  sheet?: SheetId;
};

export const META: Record<ScreenId, ScreenMeta> = {
  splash: { name: '0.1 · Splash' },
  welcome: {
    name: '0.2 · Welcome',
    cta: 'Create an account',
    next: 'signupPhone',
    cta2: 'I already have an account',
    next2: 'login',
  },
  signupPhone: {
    name: '0.3 · Sign up · number',
    title: 'Create account',
    step: 'STEP 1 OF 2',
    stepnote: 'SIGN UP',
    prog: '50%',
    cta: 'Send my code',
    next: 'otp',
  },
  login: {
    name: '0.6 · Log in · number',
    title: 'Log in',
    cta: 'Send my code',
    next: 'otp',
  },
  otp: {
    name: '0.4 · Verify code',
    title: 'Verify number',
    step: 'STEP 2 OF 2',
    stepnote: 'SIGN UP',
    prog: '100%',
    cta: 'Verify and continue',
    next: 'verifying',
  },
  verifying: { name: '0.5 · Verifying' },
  authDone: { name: '0.7 · Verified', cta: 'Continue', next: 'intro' },
  intro: { name: '0.8 · How it works', title: 'How Mineral Bridge works' },

  kycStart: {
    name: 'K1 · KYC intro',
    title: 'Identity check',
    step: 'STEP 1 OF 5',
    stepnote: 'KYC',
    prog: '20%',
    cta: 'Start verification',
    next: 'kycId',
    cta2: 'Skip for now',
    next2: 'bHome',
  },
  kycId: {
    name: 'K2 · ID type',
    title: 'Identity check',
    step: 'STEP 2 OF 5',
    stepnote: 'KYC',
    prog: '40%',
    cta: 'Continue',
    next: 'kycDoc',
  },
  kycDoc: {
    name: 'K3 · Document capture',
    title: 'Identity check',
    step: 'STEP 3 OF 5',
    stepnote: 'KYC',
    prog: '60%',
    cta: 'Continue',
    next: 'kycSelfie',
  },
  kycSelfie: {
    name: 'K4 · Liveness selfie',
    title: 'Identity check',
    step: 'STEP 4 OF 5',
    stepnote: 'KYC',
    prog: '80%',
    cta: 'Capture selfie',
    next: 'kycReview',
  },
  kycReview: {
    name: 'K5 · KYC review',
    title: 'Identity check',
    step: 'STEP 5 OF 5',
    stepnote: 'KYC',
    prog: '100%',
    cta: 'Submit for verification',
    next: 'kycPending',
  },
  kycPending: {
    name: 'K6 · Under review',
    cta: 'Continue to Mineral Bridge',
    next: 'bHome',
    cta2: 'Notify me when approved',
    next2: 'bHome',
  },

  editProfile: {
    name: 'P1a · Edit profile',
    title: 'Edit profile',
    cta: 'Save changes',
    next: 'profile',
    cta2: 'Discard',
    next2: 'profile',
  },
  cart: {
    name: 'B3a · Cart',
    title: 'Your cart',
    cta: 'Continue to delivery',
    next: 'bDeliv',
  },
  withdraw: {
    name: 'P4a · Withdraw',
    title: 'Withdraw funds',
    cta: 'Withdraw now',
    next: 'payout',
  },
  sTrack: {
    name: 'T3 · Sell request tracking',
    title: 'Track request',
    bell: true,
    cta: 'Contact the desk',
    next: 'sTrack',
    cta2: 'Back to my requests',
    next2: 'orders',
  },
  chat: { name: 'P2c · Live chat', title: 'Live chat', bell: true },
  ticket: {
    name: 'P2a · Ticket thread',
    title: 'TCK-4471',
    cta: 'Mark as resolved',
    next: 'support',
  },
  newTicket: {
    name: 'P2b · New ticket',
    title: 'New ticket',
    cta: 'Submit ticket',
    next: 'support',
  },
  docDetail: {
    name: 'P5a · Document',
    title: 'Document',
    cta: 'Replace this document',
    next: 'docs',
  },
  support: {
    name: 'P2 · Help & support',
    title: 'Help & support',
    tabs: true,
    tab: 'profile',
  },
  notifs: {
    name: 'P3 · Notifications',
    title: 'Notifications',
    tabs: true,
    tab: 'profile',
  },
  payout: {
    name: 'P4 · Payouts',
    title: 'Payouts',
    tabs: true,
    tab: 'profile',
  },
  docs: {
    name: 'P5 · Documents',
    title: 'My documents',
    tabs: true,
    tab: 'profile',
  },
  settings: {
    name: 'P6 · Settings',
    title: 'Settings',
    tabs: true,
    tab: 'profile',
  },

  orders: {
    name: 'T1 · My orders',
    title: 'My orders',
    tabs: true,
    tab: 'profile',
  },
  track: {
    name: 'T2 · Order tracking',
    title: 'Track order',
    cta: 'Contact the desk',
    next: 'track',
    cta2: 'Confirm delivery',
    next2: 'orders',
  },
  tier: {
    name: 'A1 · Account tier',
    title: 'Your tier',
    cta: 'Continue',
    next: 'kycStart',
  },
  bHome: { name: 'B1 · Buyer home', tabs: true, tab: 'home' },
  bTypes: {
    name: 'B2 · Type list',
    title: 'Precious Metals',
    tabs: true,
    tab: 'home',
  },
  bProducts: {
    name: 'B3 · Product grid',
    title: 'Gold',
    tabs: true,
    tab: 'home',
  },
  bDetail: {
    name: 'B4 · Mineral detail',
    title: 'Gold Doré Bar',
    cta: 'Continue',
    next: 'bQty',
  },
  bQty: {
    name: 'B5 · Quantity & requirement',
    title: 'Your requirement',
    step: 'STEP 1 OF 3',
    prog: '33%',
    cta: 'Continue',
    next: 'bDeliv',
  },
  bDeliv: {
    name: 'B6 · Delivery & logistics',
    title: 'Delivery details',
    step: 'STEP 2 OF 3',
    prog: '66%',
    cta: 'Continue',
    next: 'bReview',
  },
  bReview: {
    name: 'B7 · Review & submit',
    title: 'Review request',
    step: 'STEP 3 OF 3',
    prog: '100%',
    cta: 'Submit request',
    next: 'bDone',
  },
  bDone: {
    name: 'B8 · Order processed',
    cta: 'Track this order',
    next: 'track',
    cta2: 'Back to browsing',
    next2: 'bHome',
  },

  sPick: {
    name: 'C1 · What are you selling?',
    title: 'Sell to Mineral Bridge',
    tabs: true,
    tab: 'sell',
  },
  qList: {
    name: 'C2 · Your mineral',
    title: 'Your mineral',
    step: 'STEP 1 OF 4',
    stepnote: 'SELL',
    prog: '25%',
    cta: 'Get my price',
    next: 'sEstimate',
  },
  qPickup: {
    name: 'C4 · Book evaluation',
    title: 'Book evaluation',
    step: 'STEP 3 OF 4',
    stepnote: 'SELL',
    prog: '75%',
    cta: 'Confirm this time',
    next: 'qReview',
  },
  qReview: {
    name: 'C5 · Confirm booking',
    title: 'Confirm booking',
    step: 'STEP 4 OF 4',
    stepnote: 'SELL',
    prog: '100%',
    cta: 'Book my evaluation',
    next: 'qDone',
  },
  qDone: {
    name: 'C6 · Evaluation booked',
    cta: 'Track this request',
    next: 'sEval',
    cta2: 'Sell something else',
    next2: 'sPick',
  },
  sEval: {
    name: 'C7 · Evaluation live',
    title: 'Evaluation',
    cta: 'View my offer',
    next: 'sOffer',
    cta2: 'Back to home',
    next2: 'bHome',
  },
  sPaid: {
    name: 'C9 · Sold and paid',
    cta: 'Back to home',
    next: 'bHome',
    cta2: 'Sell something else',
    next2: 'sPick',
  },
  sEstimate: {
    name: 'C3 · Instant estimate',
    title: 'Your estimate',
    step: 'STEP 2 OF 4',
    stepnote: 'SELL',
    prog: '50%',
    cta: 'Book a free evaluation',
    next: 'qPickup',
    cta2: 'Not now',
    next2: 'sPick',
  },
  sOffer: {
    name: 'C8 · Firm offer',
    title: 'Your offer',
    cta: 'Accept and get paid',
    next: 'sPaid',
    cta2: 'Decline this offer',
    next2: 'sPick',
  },
  iStep1: {
    name: 'C8 · Bulk intake 1',
    title: 'Consignment details',
    step: 'STEP 1 OF 2',
    stepnote: 'BULK SALE',
    prog: '50%',
    cta: 'Continue',
    next: 'iStep2',
  },
  iStep2: {
    name: 'C9 · Bulk intake 2',
    title: 'Facility & compliance',
    step: 'STEP 2 OF 2',
    stepnote: 'BULK SALE',
    prog: '100%',
    cta: 'Continue to review',
    next: 'iReview',
  },
  iReview: {
    name: 'C10 · Bulk review',
    title: 'Review consignment',
    cta: 'Request a bulk quote',
    next: 'iDone',
  },
  iDone: {
    name: 'C11 · Quote requested',
    cta: 'Track this request',
    next: 'orders',
    cta2: 'Back to home',
    next2: 'bHome',
  },

  aList: {
    name: 'D1 · Auctions list',
    title: 'Auctions',
    bell: true,
    tabs: true,
    tab: 'profile',
  },
  aDetail: {
    name: 'D2 · Auction detail',
    title: 'Cobalt Hydroxide',
    cta: 'Place a bid',
    sheet: 'bid',
    cta2: 'Simulate: auction ends',
    next2: 'aWon',
  },
  aLost: {
    name: 'D4 · Auction lost',
    cta: 'Browse similar lots',
    next: 'aList',
    cta2: 'Notify me next time',
    next2: 'aList',
  },
  aWon: {
    name: 'D3 · Auction won',
    cta: 'Proceed to delivery details',
    next: 'bDeliv',
    cta2: 'Not right now',
    next2: 'aList',
  },

  lHome: {
    name: 'E1 · Learning Center',
    title: 'Learning Center',
    tabs: true,
    tab: 'learn',
  },
  lList: { name: 'E2 · Lesson list', tabs: true, tab: 'learn' },
  lPlayer: {
    name: 'E3 · Lesson player',
    cta: 'Mark as complete',
    next: 'lList',
  },
  profile: { name: 'Profile', title: 'Profile', tabs: true, tab: 'profile' },
};

export const TABS: {
  id: TabId;
  name: string;
  screen: ScreenId;
  icon: string;
}[] = [
  {
    id: 'home',
    name: 'Home',
    screen: 'bHome',
    icon: 'M3 10.5 12 3l9 7.5V21H3zM9.5 21v-7h5v7',
  },
  { id: 'sell', name: 'Sell to us', screen: 'sPick', icon: 'M12 5v14M5 12h14' },
  {
    id: 'learn',
    name: 'Learn',
    screen: 'lHome',
    icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 5.5V21h16',
  },
  {
    id: 'profile',
    name: 'Profile',
    screen: 'profile',
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
  },
];

/** Auth, onboarding and classification screens run on the dark navy ground. */
const DARK: Partial<Record<ScreenId, 1>> = {
  welcome: 1,
  intro: 1,
  signupPhone: 1,
  login: 1,
  otp: 1,
  verifying: 1,
  authDone: 1,
  tier: 1,
  kycStart: 1,
};
/** …and of those, these use the gold pill CTA. */
const GOLD_CTA: Partial<Record<ScreenId, 1>> = {
  welcome: 1,
  intro: 1,
  tier: 1,
};

export type ResolvedMeta = Required<
  Pick<ScreenMeta, 'title' | 'step' | 'stepnote' | 'prog' | 'cta' | 'cta2'>
> &
  ScreenMeta & {
    dark: boolean;
    gold: boolean;
    bg: string;
    ink: string;
    muted: string;
    chromeBg: string;
    chromeBorder: string;
    chromeFg: string;
    track: string;
    progFill: string;
    tabBg: string;
    tabBorder: string;
    ctaWell: string;
    ctaRadius: number;
    ctaBg: string;
    ctaBorder: string;
    ctaFg: string;
    ctaShadow: string;
    cta2Bg: string;
    cta2Border: string;
    cta2Fg: string;
    dualCta: boolean;
    soloCta: boolean;
  };

type MetaState = Pick<AppState, 'authMode' | 'guest' | 'kyc'>;

/** The design's `meta()`: per-screen chrome after state-dependent overrides. */
export function resolveMeta(screen: ScreenId, st: MetaState): ResolvedMeta {
  let base: ScreenMeta = META[screen];
  if (screen === 'otp' && st.authMode === 'login') {
    base = { ...base, step: '', stepnote: '', prog: '0%', title: 'Log in' };
  }
  if (screen === 'intro') {
    base = {
      ...base,
      cta: st.guest ? 'Create an account' : 'Got it — continue',
      cta2: st.guest ? 'Browse as a guest' : '',
    };
  }
  // "Simulate: auction ends" is a design control. Release builds hide it.
  if (screen === 'aDetail' && !__DEV__) {
    base = { ...base, cta2: '', next2: undefined };
  }
  if (GATED[screen] && (st.guest || st.kyc !== 'verified')) {
    base = {
      ...base,
      cta: st.guest
        ? 'Sign in to continue'
        : st.kyc === 'pending'
        ? 'Verification in review'
        : 'Verify identity to continue',
    };
  }
  const merged = {
    stepnote: '',
    title: '',
    step: '',
    cta: '',
    cta2: '',
    prog: '0%',
    ...base,
  };
  const dark = !!DARK[screen];
  const gold = !!GOLD_CTA[screen];
  return {
    ...merged,
    dark,
    gold,
    bg: dark ? '#0e1430' : '#f4f5f7',
    ink: dark ? '#ffffff' : '#1a1f36',
    muted: dark ? '#a9b5dd' : '#8890ad',
    chromeBg: dark ? 'rgba(255,255,255,0.10)' : '#ffffff',
    chromeBorder: dark ? 'rgba(255,255,255,0.20)' : '#e2e5ec',
    chromeFg: dark ? '#ffffff' : '#1e2a5a',
    track: dark ? 'rgba(255,255,255,0.16)' : '#dfe2e9',
    progFill: dark ? 'linear-gradient(90deg,#f7dd8e,#c8962f)' : '#1e2a5a',
    tabBg: dark ? '#10163a' : '#ffffff',
    tabBorder: dark ? 'rgba(255,255,255,0.10)' : '#e5e7ec',
    ctaWell: dark
      ? 'linear-gradient(180deg,rgba(14,20,48,0),#0e1430 34%)'
      : 'linear-gradient(180deg,rgba(244,245,247,0),#f4f5f7 30%)',
    ctaRadius: gold ? 9999 : 11,
    ctaBg: gold
      ? 'linear-gradient(135deg,#f7dd8e,#c8962f)'
      : 'linear-gradient(180deg,#243258,#1a2450)',
    ctaBorder: gold ? '#c8962f' : '#16204a',
    ctaFg: gold ? '#2b1f04' : '#ffffff',
    ctaShadow: gold
      ? '0 1px 2px rgba(16,24,40,0.14), 0 8px 20px rgba(200,150,47,0.30)'
      : '0 1px 2px rgba(16,24,40,0.10), 0 6px 16px rgba(16,24,40,0.14)',
    cta2Bg: dark ? 'rgba(255,255,255,0.08)' : '#ffffff',
    cta2Border: dark ? 'rgba(255,255,255,0.22)' : '#d8dce5',
    cta2Fg: dark ? '#ffffff' : '#243258',
    // The product screen splits its CTA into "Add to Cart" + "Buy Now".
    dualCta: screen === 'bDetail' && !!merged.cta,
    soloCta: screen !== 'bDetail' && !!merged.cta,
  };
}

/** Home screen of the tab a screen belongs to (used by back navigation). */
export function tabHome(screen: ScreenId): ScreenId {
  const tab = META[screen].tab;
  return tab ? TABS.find(t => t.id === tab)?.screen ?? 'bHome' : 'bHome';
}
