import type { ImageSourcePropType } from 'react-native';

export type Actor = 'you' | 'mb' | 'sgs' | 'lp';
export type OrderKind = 'buy' | 'sell';
export type Role = 'buyer' | 'seller' | 'both' | '';
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type KycDocId = 'front' | 'back' | 'selfie' | 'address' | 'biz';

export interface Category {
  id: string;
  name: string;
  img: string;
  minerals: [string, string][];
}

export interface Product {
  id: string;
  mineral: string;
  name: string;
  form: string;
  avail: number;
  unit: string;
  min: number;
  grade: string;
  lab: string;
  cert: string;
  origin: string;
  img: string;
  ref: number;
}

export interface Stage {
  key: string;
  label: string;
  actor: Actor;
  screen: string;
  phase: number;
}

export interface LogEntry {
  who: string;
  text: string;
  note: string;
  at: number;
}

export interface Shipment {
  id: string;
  partner: string;
  contact: string;
  mode: string;
  from: string;
  to: string;
  pickup: string;
  status: string;
  events: [string, number][];
  vehicle?: string;
  driver?: string;
  seals?: string;
  docs?: string[];
  eta?: string;
  location?: string;
  pod?: string;
  deliveredAt?: number;
}

export interface Address {
  org: string;
  street: string;
  city: string;
  country: string;
  contact: string;
  mobile: string;
}

export interface Quote {
  no: string;
  total: number;
  issued: number;
  valid: number;
  rev?: number;
}

export interface Refund {
  ref: string;
  amount: number;
  type: 'full' | 'partial';
  reason: string;
  note: string;
  to: string;
  files: number;
  status: 'requested' | 'review' | 'approved' | 'processing' | 'refunded' | 'declined';
  at: number;
  fromDisc?: boolean;
  bankRef?: string;
  reason2?: string;
  at2?: number;
  [k: string]: unknown;
}

export interface SellInfo {
  mineral: string;
  name: string;
  qty: number;
  unit: string;
  grade: string;
  form: string;
  details: string;
  photos: number;
  docs: string[];
  ref: number;
}

export interface OrderItem {
  pid: string;
  qty: number;
  qIn?: number;
  uIn?: string;
}

export interface Order {
  id: string;
  kind: OrderKind;
  idx: number;
  created: number;
  log: LogEntry[];
  items: OrderItem[];
  sell?: SellInfo;
  addr?: Address;
  quote?: Quote;
  form?: { method?: string; terms?: string; date?: string; time?: string; address?: string };
  hold?: string;
  rejected?: string;
  cancelled?: { reason: string; note: string; at: number };
  refund?: Refund;
  history?: Refund[];
  refundedSoFar?: number;
  refundSettled?: boolean;
  refunded?: boolean;
  disc?: { qty: string; cond: string; note: string; photos: number; at: number } | null;
  ship?: Shipment;
  insp?: { when: string };
  company?: { by: string; at: number; result: string };
  sgs?: { no: string; at: number; result: string };
  txn?: string;
  paidAt?: number;
  auction?: string;
}

export interface User {
  name: string;
  business: string;
  country: string;
  phone: string;
  email: string;
  role: Role;
  buyerType: string;
  sellerType: string;
  kyc: KycStatus;
  kycRef: string;
  kycAt?: number;
  kycReason?: string;
  kycFlags?: Partial<Record<KycDocId, [string, number]>>;
  via?: string;
}

export interface KycFile {
  kind: 'img' | 'pdf' | 'sample';
  src: string;
  name: string;
  size: string;
  at: number;
}

export interface Bid {
  who: string;
  amt: number;
  at: number;
  auto?: boolean;
}

export interface Auction {
  id: string;
  pid: string;
  qty: number;
  status: 'live' | 'upcoming' | 'ended';
  start: number;
  endsAt: number;
  startsAt?: number;
  bids: Bid[];
  result?: 'won' | 'lost' | 'closed';
  outbid?: boolean;
  autoMax?: number;
  orderId?: string;
}

export interface Notif {
  id: string;
  oid?: string;
  to?: string;
  title: string;
  note: string;
  at: number;
  read: boolean;
}

export interface ChatMsg {
  me: boolean;
  text: string;
  at: number;
  action?: string;
  ctx?: string;
}

export interface DocSpec {
  t: string;
  oid?: string;
  pid?: string;
  aid?: string;
  ref?: string;
  name?: string;
}

export type Img = ImageSourcePropType;
