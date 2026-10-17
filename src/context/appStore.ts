import { useRef, useSyncExternalStore } from 'react';

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
  toast: string | null;
  banner: boolean;
  qty: number;
  unit: Unit;
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
  toast: null,
  banner: false,
  qty: 250,
  unit: 'kg',
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
