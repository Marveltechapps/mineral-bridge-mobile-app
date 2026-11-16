import type { Address, Auction, ChatMsg, DocSpec, KycDocId, KycFile, Notif, Order, OrderItem, Role, User } from '../types/mineralBridge';
import type { AppScreen } from '../navigation/types';
import * as MB from '../lib/mb4';

export type Errs = Record<string, string>;

export interface Draft {
  mineral: string;
  photos: number;
  qty: string;
  unit: string;
  grade: string;
  form: string;
  details: string;
  docs: string[];
}

export interface RefundForm {
  reason: string;
  note: string;
  type: 'full' | 'partial';
  amount: string;
  dest: 'original' | 'bank' | 'upi' | 'btc';
  holder: string;
  bank: string;
  account: string;
  account2: string;
  code: string;
  country: string;
  upi: string;
  upiName: string;
  addr: string;
  addr2: string;
  files: number;
  agree: boolean;
}

export type KycState = { idType: string; consent: boolean } & Record<KycDocId, KycFile | false>;

export interface AppState {
  ready: boolean;
  screen: AppScreen;
  stack: AppScreen[];
  toast: string;
  sheet: string;
  user: User | null;
  auth: { mode: 'signup' | 'signin'; method: 'whatsapp' | 'email'; cc: string; value: string; name: string; keep: boolean };
  authErr: string;
  otp: string;
  otpErr: string;
  reg: { role: Role; buyerType: string; sellerType: string; business: string; country: string; other: string; terms: boolean };
  regErr: string;
  kyc: KycState;
  kycErr: string;
  kycDocId: KycDocId;
  kycDocErr: string;
  returnTo: string;
  cat: string;
  mineral: string;
  pid: string;
  qty: string;
  qtyErr: string;
  search: string;
  sort: string;
  sortOpen?: boolean;
  cols?: number;
  fform: string;
  labOnly: boolean;
  cart: OrderItem[];
  orders: Order[];
  oid: string;
  otab: 'buy' | 'sell' | 'auction';
  notifs: Notif[];
  placing: boolean;
  ship: Address;
  shipErr: Errs;
  pf: { method: string; terms: string; billName: string; billAddr: string; instr: string; date: string; time: string; address: string; contact: string; mobile: string; avail: boolean; inspInstr: string; c1: boolean; c2: boolean };
  pfErr: Errs;
  sc: { method: string; bank: string; account: string; date: string; time: string; address: string; pickup: string; logistics: string; other: string; c1: boolean };
  scErr: Errs;
  sign: { read: boolean; name: string };
  signErr: string;
  repNote: string;
  repErr: string;
  proof: boolean;
  payErr: string;
  pmethod?: string;
  paying?: boolean;
  btcTx?: string;
  btcLockAt?: number;
  rc: { qty: string; cond: string; photos: number; note: string };
  rcErr: string;
  draft: Draft;
  draftErr: Errs;
  hasDraft: boolean;
  chat: Record<string, ChatMsg[]>;
  msg: string;
  prefs: { email: boolean; sms: boolean; whatsapp: boolean; push: boolean };
  faq: number;
  edit: { name: string; business: string; email: string; phone: string; country: string } | null;
  editErr: Errs;
  rf: RefundForm;
  rfFieldErr: Errs;
  rfErr: string;
  qu: { pid: string; u: string } | null;
  auctions: Auction[];
  atab: string;
  aid: string;
  bidAmt: string;
  bidErr: string;
  autoOn: boolean;
  autoMax: string;
  reminders: Record<string, boolean>;
  tick: number;
  doc?: DocSpec;
  cx?: { reason: string; note: string; agree: boolean };
  cxErr?: string;
  /** Increments whenever a screen asks to scroll back to the top. */
  scrollSeq: number;
}

export const DEMO_USER: User = { name: 'Adaeze Okafor', business: 'Kestrel Metals Ltd', country: 'Nigeria', phone: '+234 803 412 7790', email: 'adaeze@kestrelmetals.com', role: 'both', buyerType: 'refinery', sellerType: 'dealer', kyc: 'verified', kycRef: 'MB-KYC-26-55102' };

export const emptyDraft = (): Draft => ({ mineral: '', photos: 0, qty: '', unit: 'kg', grade: '', form: 'Raw', details: '', docs: [] });
export const emptyRefund = (): RefundForm => ({ reason: '', note: '', type: 'full', amount: '', dest: 'original', holder: '', bank: '', account: '', account2: '', code: '', country: '', upi: '', upiName: '', addr: '', addr2: '', files: 0, agree: false });

export function seedAuctions(): Auction[] {
  const now = Date.now(), m = 6e4, H = 36e5;
  const B = (who: string, amt: number, ago: number) => ({ who, amt, at: now - ago });
  return [
    { id: 'A-301', pid: 'G-1042', qty: 5, status: 'live', start: 300000, endsAt: now + 2 * H + 14 * m, bids: [B('Bidder 4821', 300000, 5 * H), B('Bidder 1307', 308500, 3 * H), B('Bidder 4821', 315000, 80 * m), B('Bidder 9052', 318500, 22 * m)] },
    { id: 'A-302', pid: 'CO-5021', qty: 20, status: 'live', start: 170000, endsAt: now + 38 * m, bids: [B('Bidder 2210', 170000, 4 * H), B('Bidder 6644', 176500, 2 * H), B('Bidder 2210', 182000, 40 * m)] },
    { id: 'A-303', pid: 'LI-5011', qty: 100, status: 'upcoming', start: 96000, startsAt: now + 26 * H, endsAt: now + 50 * H, bids: [] },
    { id: 'A-304', pid: 'G-1044', qty: 50, status: 'upcoming', start: 296000, startsAt: now + 3 * 24 * H, endsAt: now + 4 * 24 * H, bids: [] },
    { id: 'A-298', pid: 'S-2011', qty: 20, status: 'ended', start: 36000, endsAt: now - 2 * 24 * H, bids: [B('Bidder 3318', 36000, 3 * 24 * H), B('You', 40500, 2.2 * 24 * H), B('Bidder 3318', 41200, 2.1 * 24 * H)] },
  ];
}

export function seed(): Order[] {
  const now = Date.now(), H = 36e5;
  const mk = (o: Partial<Order> & Pick<Order, 'id' | 'kind'>, upto: number, t0: number): Order => {
    const ord = Object.assign({ items: [], idx: 0, created: t0, log: [] }, o) as Order;
    const st = MB.stages(ord.kind);
    let t = t0;
    ord.log = [{ who: 'You', text: st[0].label, note: ord.kind === 'sell' ? 'Photos, quantity and documents submitted.' : 'Order submitted for review.', at: t }];
    for (let i = 1; i <= upto; i++) {
      t += 5 * H;
      const s = st[i];
      if (s.actor === 'you') ord.log.push({ who: 'You', text: s.label, note: 'Accepted by ' + DEMO_USER.name, at: t });
      else {
        const u = MB.demoUpdate(ord, s.key, t);
        Object.assign(ord, u[2] || {});
        ord.log.push({ who: MB.WHO[s.actor], text: u[0], note: u[1], at: t });
      }
    }
    ord.idx = upto;
    ord.created = t0;
    return ord;
  };
  const addr: Address = { org: 'Kestrel Metals Ltd', street: '14 Kofo Abayomi Street', city: 'Victoria Island, Lagos', country: 'Nigeria', contact: 'Adaeze Okafor', mobile: '+234 803 412 7790' };
  return [
    mk({ id: 'MB-ORD-26-10418', kind: 'buy', items: [{ pid: 'G-1041', qty: 2 }], addr }, 2, now - 26 * H),
    mk({ id: 'MB-SELL-26-90413', kind: 'sell', sell: { mineral: 'gold', name: 'Gold Dust', qty: 3.5, unit: 'kg', grade: 'Au 88%', form: 'Raw', details: 'Alluvial dust, dried and bagged.', photos: 4, docs: ['Assay report.pdf'], ref: 57000 } }, 6, now - 70 * H),
    mk({ id: 'MB-ORD-26-10377', kind: 'buy', items: [{ pid: 'S-2011', qty: 20 }], addr, form: { method: 'Bank transfer', terms: '100% advance before dispatch' } }, MB.stages('buy').length - 1, now - 30 * 24 * H),
  ];
}

export function fresh(): AppState {
  return {
    ready: true, screen: 'welcome', stack: [], toast: '', sheet: '',
    user: null, auth: { mode: 'signup', method: 'whatsapp', cc: '+234', value: '', name: '', keep: true }, authErr: '',
    otp: '', otpErr: '', reg: { role: '', buyerType: '', sellerType: '', business: '', country: 'Nigeria', other: '', terms: false }, regErr: '',
    kyc: { idType: 'National ID', front: false, back: false, selfie: false, address: false, biz: false, consent: false }, kycErr: '', kycDocId: 'front', kycDocErr: '', returnTo: '',
    cat: 'precious', mineral: 'gold', pid: 'G-1041', qty: '1', qtyErr: '', search: '', sort: 'featured', fform: 'All', labOnly: false,
    cart: [], orders: seed(), oid: 'MB-ORD-26-10418', otab: 'buy', notifs: [], placing: false,
    ship: { org: '', street: '', city: '', country: '', contact: '', mobile: '' }, shipErr: {},
    pf: { method: '', terms: '', billName: '', billAddr: '', instr: '', date: '', time: '', address: '', contact: '', mobile: '', avail: true, inspInstr: '', c1: false, c2: false }, pfErr: {},
    sc: { method: '', bank: '', account: '', date: '', time: '', address: '', pickup: '', logistics: '', other: '', c1: false }, scErr: {},
    sign: { read: false, name: '' }, signErr: '', repNote: '', repErr: '', proof: false, payErr: '',
    rc: { qty: '', cond: 'Good', photos: 0, note: '' }, rcErr: '',
    draft: emptyDraft(), draftErr: {}, hasDraft: false,
    chat: { 'MB-ORD-26-10418': [{ me: false, text: 'Hello Adaeze, we have sent quotation Q-10418 for 2 kg of Gold Doré. Happy to discuss on a call.', at: Date.now() - 2 * 36e5 }] }, msg: '',
    prefs: { email: true, sms: true, whatsapp: true, push: true }, faq: -1,
    edit: null, editErr: {},
    rf: emptyRefund(), rfFieldErr: {}, rfErr: '', qu: null, auctions: seedAuctions(), atab: 'live', aid: 'A-301', bidAmt: '', bidErr: '', autoOn: false, autoMax: '', reminders: {}, tick: 0,
    scrollSeq: 0,
  };
}
