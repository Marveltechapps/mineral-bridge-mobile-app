import { useRef, useSyncExternalStore } from 'react';
import type { GridFilter } from '../catalog/gridFilter';
import type { OnboardingStep } from '../api/auth';

export type SheetId =
  | 'signin'
  | 'picker'
  | 'logout'
  | 'kyc'
  | 'help'
  | 'bid'
  | 'filter';
export type KycStatus = 'none' | 'pending' | 'verified';
export type Unit = 'g' | 'kg' | 't';
export type PickerKind = 'language' | 'currency' | 'units';

export type DeliveryDetails = {
  facility: string;
  street: string;
  city: string;
  region: string;
  contact: string;
  phone: string;
  permit: string;
};

export type BulkDraft = {
  qty: string;
  mineral: string;
  partner: string;
  origin: string;
  extracted: string;
  description: string;
  facility: string;
  street: string;
  city: string;
  region: string;
  contact: string;
  phone: string;
  permit: string;
};

export const initialDelivery: DeliveryDetails = {
  facility: 'Aurora Refining Ltd.',
  street: '14 Creek Road, Apapa',
  city: 'Lagos',
  region: 'Lagos State',
  contact: 'Adaeze Okafor',
  phone: '+234 802 441 9087',
  permit: 'NG-IMP-2026-44817',
};

export const initialBulk: BulkDraft = {
  qty: '12.5',
  mineral: 'Gold Bullion Bar · 99.5%',
  partner: 'Aurora Refining Ltd.',
  origin: 'Ilesha Consolidated Lease, Osun',
  extracted: '14 July 2026',
  description:
    'Refinery-grade bullion from consolidated cooperative intake, re-assayed at 99.5% and bar-stamped. Full chain-of-custody documents available on request.',
  facility: 'Ilesha Consolidated Minerals Ltd.',
  street: 'Plot 7, Ijebu-Jesa Industrial Way',
  city: 'Ilesha',
  region: 'Osun State',
  contact: 'Tunde Balogun',
  phone: '+234 703 118 2260',
  permit: 'NG-EXP-2026-11204',
};

export type ChatMessage = {
  who: 'a' | 'u';
  text: string;
  time: string;
  read?: boolean;
};

/**
 * App-wide state. Field names and initial values follow the design's
 * component state so behaviour (pre-filled number, default tier, selected
 * slot, open FAQ, …) matches the prototype exactly.
 */
export interface AppState {
  authMode: 'signup' | 'login';
  phone: string;
  code: string;
  /** In-memory development code. Never written to storage. */
  developmentOtp: string;
  resend: number;
  otpExpires: number;
  tierIdx: number;
  guest: boolean;
  introOpen: number;
  idType: number;
  kycConsent: boolean;
  orderTab: 'active' | 'selling' | 'completed';
  kyc: KycStatus;
  faqOpen: number;
  payoutSel: number;
  danger: 'logout' | 'delete';
  chip: string;
  catalogCategory: string;
  catalogSubcategory: string;
  catalogMineralType: string;
  catalogProductForm: string;
  docIdx: number;
  cartA: number;
  cartB: number;
  wd: number;
  topic: string;
  picker: PickerKind;
  chatOut: ChatMessage[];
  chatDraftText: string;
  chatTyping: boolean;
  reqIdx: number;
  catIdx: number;
  lessonIdx: number;
  learnTab: 'miner' | 'trade';
  prefsVal: Record<PickerKind, string>;
  sellItem: string;
  prefs: {
    bids: boolean;
    orders: boolean;
    lots: boolean;
    marketing: boolean;
    biometric: boolean;
  };
  sheet: SheetId | null;
  browseQuery: string;
  appliedFilter: GridFilter | null;
  docBack: boolean;
  doneLessons: string[];
  deliveredIds: string[];
  displayName: string;
  profileDraft: string;
  ticketDraft: string;
  otpBusy: boolean;
  orderSubmitted: boolean;
  offerAccepted: boolean;
  bulkQuoted: boolean;
  withdrawn: boolean;
  onboardingNext: OnboardingStep | '';
  signedIn: boolean;
  /** Demo accounts keep the sample order book. A new sign-up does not. */
  sampleOrders: boolean;
  toast: string | null;
  banner: boolean;
  qty: number;
  qtyText: string;
  unit: Unit;
  delivery: DeliveryDetails;
  bulk: BulkDraft;
  bid: number;
  nudge: boolean;
  day: number;
  slot: string;
  ack: boolean;
  chapter: number;
  aucTab: 'live' | 'upcoming' | 'ended';
}

export const initialState: AppState = {
  authMode: 'signup',
  phone: '8024419087',
  code: '',
  developmentOtp: '',
  resend: 42,
  otpExpires: 60,
  tierIdx: 0,
  guest: false,
  introOpen: 0,
  idType: 0,
  kycConsent: true,
  orderTab: 'active',
  kyc: 'none',
  faqOpen: 0,
  payoutSel: 0,
  danger: 'logout',
  chip: 'Gold',
  catalogCategory: '',
  catalogSubcategory: '',
  catalogMineralType: '',
  catalogProductForm: '',
  docIdx: 1,
  cartA: 250,
  cartB: 40,
  wd: 25000,
  topic: 'Evaluation',
  picker: 'language',
  chatOut: [],
  chatDraftText: '',
  chatTyping: false,
  reqIdx: 0,
  catIdx: 1,
  lessonIdx: 0,
  learnTab: 'miner',
  prefsVal: { language: 'English', currency: 'USD', units: 'Metric' },
  sellItem: 'Gold Dust',
  prefs: {
    bids: true,
    orders: true,
    lots: true,
    marketing: false,
    biometric: true,
  },
  sheet: null,
  browseQuery: '',
  appliedFilter: null,
  docBack: false,
  doneLessons: [],
  deliveredIds: [],
  displayName: 'Adaeze Okafor',
  profileDraft: 'Adaeze Okafor',
  ticketDraft: '',
  otpBusy: false,
  orderSubmitted: false,
  offerAccepted: false,
  bulkQuoted: false,
  withdrawn: false,
  onboardingNext: '',
  signedIn: false,
  sampleOrders: true,
  toast: null,
  banner: false,
  qty: 250,
  qtyText: '250',
  unit: 'kg',
  delivery: initialDelivery,
  bulk: initialBulk,
  bid: 48400,
  nudge: true,
  day: 12,
  slot: '10:00',
  ack: true,
  chapter: 0,
  aucTab: 'live',
};

type Patch = Partial<AppState> | ((prev: AppState) => Partial<AppState>);
type Listener = () => void;

let state: AppState = initialState;
const listeners = new Set<Listener>();

export const appStore = {
  getState: (): AppState => state,
  /** Merges a partial update, like a class component's `setState`. */
  setState(patch: Patch) {
    const next = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...next };
    listeners.forEach(l => l());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Restores the initial state (used by tests). */
  reset() {
    state = initialState;
    listeners.forEach(l => l());
  },
};

export const setAppState = appStore.setState;

function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const ka = Object.keys(a as object);
  if (ka.length !== Object.keys(b as object).length) return false;
  return ka.every(k =>
    Object.is(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ),
  );
}

/**
 * Subscribes to the slice of state returned by `selector`. Components only
 * re-render when that slice changes (shallow comparison).
 */
export function useApp<T = AppState>(
  selector: (s: AppState) => T = s => s as unknown as T,
): T {
  const cache = useRef<{ value: T } | null>(null);
  const getSnapshot = () => {
    const next = selector(appStore.getState());
    if (cache.current && shallowEqual(cache.current.value, next))
      return cache.current.value;
    cache.current = { value: next };
    return next;
  };
  return useSyncExternalStore(appStore.subscribe, getSnapshot, getSnapshot);
}
