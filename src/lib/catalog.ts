/**
 * Demo content from the design (`Mineral Bridge Mobile Prototype.dc.html`),
 * copied verbatim. In production these records come from the API (see
 * `src/api/config.ts`); the app currently runs on this bundled data.
 */
import type { ImageName } from '../../assets/images';
import type { ScreenId } from '../navigation/types';

export type StepState = 'done' | 'active' | 'pending';
export type Tone = 'live' | 'warn' | 'done' | 'gold';
export type AuctionTab = 'live' | 'upcoming' | 'ended';

export type Category = { name: string; count: string; img: ImageName };
export type MineralType = { name: string; sub: string; img: ImageName };
export type Product = {
  name: string;
  price: string;
  avail: string;
  img: ImageName;
};
export type Auction = {
  name: string;
  lot: string;
  bid: string;
  timer: string;
  img: ImageName;
};
export type AccountTier = {
  name: string;
  tag: string;
  short: string;
  sub: string;
  icon: string;
  iconBg: string;
  iconFg: string;
  tagBg: string;
  tagBorder: string;
  tagFg: string;
  hint: string;
};
export type KeyValue = { k: string; v: string; fg: string };
export type StoredDocument = {
  name: string;
  meta: string;
  status: string;
  iconBg: string;
  iconFg: string;
  pillBg: string;
  pillBorder: string;
  pillFg: string;
  delay: string;
  rows: KeyValue[];
};
export type IdType = {
  name: string;
  sub: string;
  icon: string;
  label: string;
  num: string;
};
export type Order = {
  id: string;
  name: string;
  qty: string;
  value: string;
  status: string;
  stage: string;
  progress: string;
  eta: string;
  img: ImageName;
  tone: Tone;
};
export type SellRequest = Order & { dest: ScreenId };
/** [title, sub, time, state] */
export type TimelineTuple = [string, string, string, StepState];
/** [name, meta, ready] */
export type DocTuple = [string, string, boolean];
export type TrackStep = {
  title: string;
  sub: string;
  time: string;
  state: StepState;
};
export type VideoShot = {
  img: ImageName;
  at: number;
  dur: number;
  kicker: string;
  title: string;
  sub: string;
  z: [number, number];
  pan: [number, number];
};
export type IntroAudience = {
  title: string;
  sub: string;
  icon: string;
  headBg: string;
  rows: { n: string; name: string; sub: string }[];
};
export type IntroPath = {
  label: string;
  title: string;
  img: ImageName;
  rows: string[];
};
export type Bid = {
  name: string;
  initials: string;
  ago: string;
  amount: string;
  lead?: boolean;
};
export type Lesson = {
  name: string;
  dur: string;
  done?: boolean;
  icon: string;
};
export type LearnSection = {
  label: string;
  group?: 'miner';
  lessons: Lesson[];
};

export const CAT: Category[] = [
  { name: 'Precious Metals', count: '38 lots live', img: 'cat-precious' },
  { name: 'Gemstones', count: '21 lots live', img: 'cat-gemstone' },
  { name: 'Industrial Minerals', count: '46 lots live', img: 'cat-industrial' },
  { name: 'Battery & Critical', count: '29 lots live', img: 'cat-critical' },
];

export const TYPES: MineralType[] = [
  { name: 'Gold', sub: '12 lots · 18K – 24K', img: 'm-gold' },
  { name: 'Platinum', sub: '5 lots · sponge & ingot', img: 'm-platinum' },
  { name: 'Silver', sub: '9 lots · 925 – 999', img: 'm-silver' },
  { name: 'Palladium', sub: '3 lots · sponge', img: 'gold-bullion' },
];

export const PRODUCTS: Product[] = [
  {
    name: 'Gold Doré Bar',
    price: '$61.40 / g',
    avail: '4.2 kg',
    img: 'gold-dore',
  },
  {
    name: 'Gold Concentrate',
    price: '$44.10 / g',
    avail: '18 kg',
    img: 'gold-concentrate',
  },
  { name: 'Gold Dust', price: '$57.80 / g', avail: '2.6 kg', img: 'gold-dust' },
  {
    name: 'Gold Grain / Shot',
    price: '$63.20 / g',
    avail: '7.4 kg',
    img: 'grain-shot',
  },
  {
    name: 'Gold Biscuit 24K',
    price: '$66.90 / g',
    avail: '1.8 kg',
    img: 'gold-biscuit',
  },
  {
    name: 'Gold Bullion Bar',
    price: '$65.10 / g',
    avail: '12 kg',
    img: 'gold-bullion',
  },
];

export const AUCTIONS: Auction[] = [
  {
    name: 'Cobalt Hydroxide',
    lot: '18 t · 30% Co',
    bid: '$48,200',
    timer: '2h 14m',
    img: 'cat-critical',
  },
  {
    name: 'Lithium Spodumene',
    lot: '40 t · 5.8% Li₂O',
    bid: '$71,900',
    timer: '6h 02m',
    img: 'cat-industrial',
  },
  {
    name: 'Gold Doré Bar',
    lot: '3.1 kg · 22K',
    bid: '$186,400',
    timer: '41m',
    img: 'gold-dore',
  },
  {
    name: 'Tantalite Ore',
    lot: '12 t · 28% Ta₂O₅',
    bid: '$54,750',
    timer: '1d 3h',
    img: 'cat-gemstone',
  },
];

// One tag per account. Everyone can buy and sell; the tier only sets paperwork weight.
export const ACCOUNT_TIERS: AccountTier[] = [
  {
    name: 'Individual',
    tag: 'TIER 1',
    short: 'Individual',
    sub: 'Legal artisanal miners, solo operators, small leaseholders or personal buyers.',
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
    iconBg: '#f8f2e3',
    iconFg: '#8a6a1c',
    tagBg: '#f8f2e3',
    tagBorder: '#eddfc0',
    tagFg: '#8a6a1c',
    hint: 'Tier 1 needs only an ID. Selling is a 4-step flow with no permits.',
  },
  {
    name: 'Small group / SME',
    tag: 'TIER 2',
    short: 'Small group / SME',
    sub: 'A cooperative, mining group or trading business.',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9',
    iconBg: '#f1f3f7',
    iconFg: '#33406e',
    tagBg: '#f1f3f7',
    tagBorder: '#e2e5ec',
    tagFg: '#33406e',
    hint: 'Tier 2 adds a group registration number, checked once at KYC.',
  },
  {
    name: 'Registered company',
    tag: 'TIER 3',
    short: 'Registered company',
    sub: 'A licensed trader, refinery or institutional buyer.',
    icon: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6',
    iconBg: '#eef3fe',
    iconFg: '#1d4fd7',
    tagBg: '#eef3fe',
    tagBorder: '#d6e2fb',
    tagFg: '#1d4fd7',
    hint: 'Tier 3 unlocks bulk consignments and requires import or export permits.',
  },
];

export const DOCS: StoredDocument[] = [
  {
    name: 'National ID (NIN)',
    meta: 'Verified 6 Sep 2026 · no expiry',
    status: 'VERIFIED',
    iconBg: '#ecf7f0',
    iconFg: '#15803d',
    pillBg: '#edf7f1',
    pillBorder: '#cfe7d8',
    pillFg: '#15803d',
    delay: '.05s',
    rows: [
      { k: 'TYPE', v: 'Government ID', fg: '#1a1f36' },
      { k: 'NUMBER', v: '2213 4477 901', fg: '#1a1f36' },
      { k: 'VERIFIED', v: '6 Sep 2026', fg: '#1a1f36' },
      { k: 'EXPIRES', v: 'No expiry', fg: '#15803d' },
    ],
  },
  {
    name: 'Export permit',
    meta: 'NG-EXP-2026-11204 · expires 30 Sep',
    status: 'EXPIRING',
    iconBg: '#f8f2e3',
    iconFg: '#8a6a1c',
    pillBg: '#fbf3e4',
    pillBorder: '#eddfc0',
    pillFg: '#a1620b',
    delay: '.11s',
    rows: [
      { k: 'TYPE', v: 'Regulatory permit', fg: '#1a1f36' },
      { k: 'NUMBER', v: 'NG-EXP-2026-11204', fg: '#1a1f36' },
      { k: 'ISSUED', v: '30 Mar 2026', fg: '#1a1f36' },
      { k: 'EXPIRES', v: '30 Sep 2026 · 21 days', fg: '#a1620b' },
    ],
  },
  {
    name: 'Mining lease certificate',
    meta: 'Ilesha Lease Site 4 · expires 2028',
    status: 'VERIFIED',
    iconBg: '#ecf7f0',
    iconFg: '#15803d',
    pillBg: '#edf7f1',
    pillBorder: '#cfe7d8',
    pillFg: '#15803d',
    delay: '.17s',
    rows: [
      { k: 'TYPE', v: 'Mining lease', fg: '#1a1f36' },
      { k: 'SITE', v: 'Ilesha Lease Site 4', fg: '#1a1f36' },
      { k: 'ISSUED', v: '11 Jan 2024', fg: '#1a1f36' },
      { k: 'EXPIRES', v: '11 Jan 2028', fg: '#15803d' },
    ],
  },
  {
    name: 'Proof of address',
    meta: 'eko-utility-aug2026.pdf · 1.4 MB',
    status: 'IN REVIEW',
    iconBg: '#eef3fe',
    iconFg: '#1d4fd7',
    pillBg: '#eef3fe',
    pillBorder: '#d6e2fb',
    pillFg: '#1d4fd7',
    delay: '.23s',
    rows: [
      { k: 'TYPE', v: 'Utility bill', fg: '#1a1f36' },
      { k: 'FILE', v: 'eko-utility-aug2026.pdf', fg: '#1a1f36' },
      { k: 'UPLOADED', v: '2 Sep 2026', fg: '#1a1f36' },
      { k: 'STATUS', v: 'Desk review', fg: '#1d4fd7' },
    ],
  },
];

export const ID_TYPES: IdType[] = [
  {
    name: 'National ID (NIN)',
    sub: '11-digit number on your NIMC slip or card.',
    icon: 'M3 5h18v14H3zM7 10h4M7 14h8',
    label: 'NIN',
    num: '2213 4477 901',
  },
  {
    name: 'International Passport',
    sub: 'Photo page, must be in date.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3c2.4 2.6 2.4 15.4 0 18',
    label: 'Passport',
    num: 'A501 88274',
  },
  {
    name: "Driver's Licence",
    sub: 'Front and back, both sides needed.',
    icon: 'M3 6h18v12H3zM7 15h4M15 10h3',
    label: 'Licence',
    num: 'OSU-4471-AB',
  },
  {
    name: "Voter's Card (PVC)",
    sub: 'Permanent voter card with VIN.',
    icon: 'M4 4h16v16H4zM8 9h8M8 13h5',
    label: 'PVC',
    num: '90F5A2213447',
  },
];

export const ORDERS: Order[] = [
  {
    id: 'MB-2026-04871',
    name: 'Gold Doré Bar',
    qty: '250 kg',
    value: '$15.35M',
    status: 'IN TRANSIT',
    stage: 'Step 5 of 6',
    progress: '78%',
    eta: 'Arriving Wed 10 Sep, 14:00–17:00',
    img: 'gold-dore',
    tone: 'live',
  },
  {
    id: 'MB-2026-04702',
    name: 'Cobalt Hydroxide',
    qty: '18 t',
    value: '$49,800',
    status: 'VERIFYING',
    stage: 'Step 3 of 6',
    progress: '46%',
    eta: 'Assay result expected 9 Sep',
    img: 'cat-critical',
    tone: 'warn',
  },
  {
    id: 'MB-2026-04588',
    name: 'Lithium Spodumene',
    qty: '40 t',
    value: '$71,900',
    status: 'DELIVERED',
    stage: 'Complete',
    progress: '100%',
    eta: 'Delivered 2 Sep · escrow released',
    img: 'cat-industrial',
    tone: 'done',
  },
];

export const SELL_STEPS: Record<number, TimelineTuple[]> = {
  0: [
    [
      'Request submitted',
      'Photos, quantity and type sent to the desk.',
      '9 Sep · 08:40',
      'done',
    ],
    [
      'Estimate issued',
      'Indicative range $13.1M – $14.5M at today\u2019s rate.',
      '9 Sep · 08:41',
      'done',
    ],
    [
      'Evaluator assigned',
      'Emeka Balogun · 412 evaluations completed.',
      '9 Sep · 09:05',
      'done',
    ],
    [
      'On site and weighing',
      'Gross weight recorded, tare deducted and photographed.',
      '10 Sep · 10:24',
      'done',
    ],
    [
      'Fire assay running',
      'Sample under test. Around 90 minutes remaining.',
      'Now',
      'active',
    ],
    [
      'Firm offer issued',
      'Sent to your phone the moment the assay clears.',
      'By 16:30',
      'pending',
    ],
    [
      'Paid to your account',
      'Within 24 hours of you accepting.',
      'Pending',
      'pending',
    ],
  ],
  1: [
    [
      'Request submitted',
      'Sluice output, 18 kg declared.',
      '6 Sep · 14:10',
      'done',
    ],
    [
      'Estimate issued',
      'Indicative range $940K – $1.04M.',
      '6 Sep · 14:11',
      'done',
    ],
    [
      'Evaluation complete',
      'Assayed 17.8 kg at 89.4% purity.',
      '8 Sep · 12:20',
      'done',
    ],
    [
      'Firm offer issued',
      '$986,400 — valid for 48 hours.',
      '8 Sep · 15:02',
      'done',
    ],
    [
      'Awaiting your decision',
      'Accept and we pay within 24 hours.',
      'Now',
      'active',
    ],
    ['Paid to your account', 'GTBank \u2022\u20224471.', 'Pending', 'pending'],
  ],
  2: [
    [
      'Consignment submitted',
      '12.5 kg bullion, Tier 3 bulk sale.',
      '7 Sep · 11:05',
      'done',
    ],
    [
      'Documents received',
      'Export permit and lease certificate on file.',
      '7 Sep · 11:06',
      'done',
    ],
    [
      'Document check',
      'Permit validated against the regulator register.',
      '8 Sep · 09:30',
      'done',
    ],
    ['Desk pricing', 'Trading desk valuing the consignment.', 'Now', 'active'],
    [
      'Firm offer issued',
      'Within two working days of the document check.',
      'By 10 Sep',
      'pending',
    ],
    [
      'Settlement',
      'Paid on acceptance, transport arranged by us.',
      'Pending',
      'pending',
    ],
  ],
};

export const SELL_DOCS: Record<number, DocTuple[]> = {
  0: [
    ['Intake receipt', 'PDF · 96 KB · 9 Sep', true],
    ['Weight certificate', 'PDF · 180 KB · 10 Sep', true],
    ['Assay certificate', 'Issued with your offer', false],
  ],
  1: [
    ['Intake receipt', 'PDF · 92 KB · 6 Sep', true],
    ['Assay certificate', 'PDF · 240 KB · 8 Sep', true],
    ['Offer letter', 'PDF · 88 KB · 8 Sep', true],
  ],
  2: [
    ['Consignment manifest', 'PDF · 310 KB · 7 Sep', true],
    ['Export permit copy', 'PDF · 1.2 MB · 7 Sep', true],
    ['Valuation report', 'Issued with your quote', false],
  ],
};

export const SELL_REQUESTS: SellRequest[] = [
  {
    id: 'MB-S-90412',
    name: 'Gold Dust',
    qty: '250 kg',
    value: 'Est. $13.1M – $14.5M',
    status: 'EVALUATING',
    stage: 'Step 3 of 5',
    progress: '62%',
    eta: 'Offer expected by 16:30 today',
    img: 'gold-dust',
    tone: 'warn',
    dest: 'sEval',
  },
  {
    id: 'MB-S-90408',
    name: 'Gold Concentrate',
    qty: '18 kg',
    value: 'Offer $986,400',
    status: 'OFFER READY',
    stage: 'Awaiting you',
    progress: '80%',
    eta: 'Expires in 48 hours — accept or decline',
    img: 'gold-concentrate',
    tone: 'gold',
    dest: 'sOffer',
  },
  {
    id: 'MB-Q-90418',
    name: 'Gold Bullion Bar',
    qty: '12.5 kg',
    value: 'Bulk quote requested',
    status: 'DESK PRICING',
    stage: 'Step 2 of 5',
    progress: '34%',
    eta: 'Quote within two working days',
    img: 'gold-bullion',
    tone: 'live',
    dest: 'iDone',
  },
];

export const TRACK_STEPS: TrackStep[] = [
  {
    title: 'Request submitted',
    sub: 'Requirement sent to the verification desk.',
    time: '4 Sep · 09:12',
    state: 'done',
  },
  {
    title: 'Verified quote issued',
    sub: 'Final assay weight 249.6 kg at 22K confirmed.',
    time: '5 Sep · 11:40',
    state: 'done',
  },
  {
    title: 'Escrow funded',
    sub: '$15,350,000 held by Mineral Bridge escrow.',
    time: '6 Sep · 16:05',
    state: 'done',
  },
  {
    title: 'Sealed and released from vault',
    sub: 'Tamper seal MB-SL-4471 photographed and logged.',
    time: '8 Sep · 07:30',
    state: 'done',
  },
  {
    title: 'In transit',
    sub: 'Bonded carrier Fidelis Secure Logistics · 2 escorts.',
    time: 'Now',
    state: 'active',
  },
  {
    title: 'Delivered and confirmed',
    sub: 'You confirm the seal and assay, then escrow releases.',
    time: 'Wed 10 Sep',
    state: 'pending',
  },
];

// --- inline explainer video: Ken Burns shots over real mineral photography ---
export const VID: VideoShot[] = [
  {
    img: 'hero-grain',
    at: 0,
    dur: 6.5,
    kicker: 'MINERAL BRIDGE',
    title: 'Verified mineral trade',
    sub: 'Artisanal and institutional sellers meeting industrial buyers.',
    z: [1.06, 1.18],
    pan: [-1.5, 2],
  },
  {
    img: 'gold-dust',
    at: 6.5,
    dur: 6.5,
    kicker: '1 — SELLING',
    title: 'We buy it from you',
    sub: 'Instant estimate, free evaluation, firm offer, paid in 24h.',
    z: [1.2, 1.05],
    pan: [3, -2],
  },
  {
    img: 'cat-industrial',
    at: 13,
    dur: 6.5,
    kicker: '2 — WHO IS IT FOR',
    title: 'Two sides, three levels each',
    sub: 'Artisanal miners to refineries. Your level sets the paperwork.',
    z: [1.05, 1.16],
    pan: [-3, 1.5],
  },
  {
    img: 'cat-critical',
    at: 19.5,
    dur: 8,
    kicker: '3 — THE BRIDGE',
    title: 'We carry the risk between',
    sub: 'Mineral Bridge owns every lot it sells to buyers.',
    z: [1.14, 1.04],
    pan: [2, -1],
  },
  {
    img: 'gold-dore',
    at: 27.5,
    dur: 7.5,
    kicker: '4 — BUYING',
    title: 'Fixed price, assured stock',
    sub: 'No haggling. Every lot assayed, sealed and certified.',
    z: [1.04, 1.15],
    pan: [-2, 2],
  },
];
export const VID_LEN = 35;

export const GATED: Partial<Record<ScreenId, 1>> = {
  bDetail: 1,
  bQty: 1,
  bDeliv: 1,
  bReview: 1,
  aDetail: 1,
  qList: 1,
  qPickup: 1,
  qReview: 1,
  iStep1: 1,
  iStep2: 1,
  iReview: 1,
  cart: 1,
};

export const INTRO_WHO: IntroAudience[] = [
  {
    title: 'Buyers',
    sub: 'People and businesses who need material',
    icon: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6',
    headBg: 'linear-gradient(135deg,#1e2a5a,#141d40)',
    rows: [
      {
        n: '1',
        name: 'Individual',
        sub: 'Small personal purchases — a jeweller, a collector.',
      },
      {
        n: '2',
        name: 'Small group / SME',
        sub: 'Buys to resell locally or across the region.',
      },
      {
        n: '3',
        name: 'Registered company',
        sub: 'Refineries and factories buying by the tonne.',
      },
    ],
  },
  {
    title: 'Sellers',
    sub: 'People and companies who dig or hold material',
    icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
    headBg: 'linear-gradient(135deg,#8a6a1c,#c8962f)',
    rows: [
      {
        n: '1',
        name: 'Artisanal miner',
        sub: 'One person or a small lease. Lightest paperwork.',
      },
      {
        n: '2',
        name: 'Small-scale group',
        sub: 'A cooperative or group of operators.',
      },
      {
        n: '3',
        name: 'Registered company',
        sub: 'Traders and refineries with export permits.',
      },
    ],
  },
];

export const INTRO_CAN: IntroPath[] = [
  {
    label: 'IF YOU BUY',
    title: 'Buy assured stock',
    img: 'cat-industrial',
    rows: [
      'Browse stock Mineral Bridge already owns',
      'Fixed prices, no haggling with a stranger',
      'Every lot assayed and Mineral Bridge Assured',
      'Bid on bulk consignments in live auctions',
    ],
  },
  {
    label: 'IF YOU SELL',
    title: 'Sell it to us',
    img: 'gold-dust',
    rows: [
      'Get a price estimate in under a minute',
      'Free evaluation at your own site',
      'A firm offer you can accept or decline',
      'Paid within 24 hours — we handle the rest',
    ],
  },
];

export const AUC_SETS: Record<AuctionTab, Auction[]> = {
  live: AUCTIONS,
  upcoming: [
    {
      name: 'Cobalt Concentrate',
      lot: '22 t · 24% Co',
      bid: '$41,000',
      timer: 'Opens in 2d',
      img: 'cat-critical',
    },
    {
      name: 'Nickel Sulphate',
      lot: '30 t · 22% Ni',
      bid: '$68,500',
      timer: 'Opens in 4d',
      img: 'cat-industrial',
    },
    {
      name: 'Gold Grain / Shot',
      lot: '5.0 kg · 24K',
      bid: '$298,000',
      timer: 'Opens in 5d',
      img: 'grain-shot',
    },
    {
      name: 'Rough Sapphire',
      lot: '840 ct · unheated',
      bid: '$27,400',
      timer: 'Opens in 6d',
      img: 'cat-gemstone',
    },
  ],
  ended: [
    {
      name: 'Cobalt Hydroxide',
      lot: '18 t · 30% Co',
      bid: '$52,400',
      timer: 'Ended today',
      img: 'cat-critical',
    },
    {
      name: 'Gold Doré Bar',
      lot: '2.4 kg · 22K',
      bid: '$141,900',
      timer: 'Ended 2d ago',
      img: 'gold-dore',
    },
    {
      name: 'Tantalite Ore',
      lot: '9 t · 26% Ta₂O₅',
      bid: '$46,100',
      timer: 'Ended 3d ago',
      img: 'cat-gemstone',
    },
    {
      name: 'Silver Granules',
      lot: '120 kg · 999',
      bid: '$88,600',
      timer: 'Ended 5d ago',
      img: 'm-silver',
    },
  ],
};

export const BIDS: Bid[] = [
  {
    name: 'Aurora Refining',
    initials: 'AR',
    ago: '2 minutes ago',
    amount: '$48,200',
    lead: true,
  },
  {
    name: 'Kade Metals SA',
    initials: 'KM',
    ago: '9 minutes ago',
    amount: '$47,600',
  },
  {
    name: 'Bidder #4417',
    initials: 'B4',
    ago: '18 minutes ago',
    amount: '$46,900',
  },
  {
    name: 'Aurora Refining',
    initials: 'AR',
    ago: '34 minutes ago',
    amount: '$45,200',
  },
  {
    name: 'Helios Cathode Co.',
    initials: 'HC',
    ago: '52 minutes ago',
    amount: '$43,800',
  },
];

export const LEARN: LearnSection[] = [
  {
    label: 'GETTING STARTED',
    lessons: [
      {
        name: 'What Mineral Bridge does',
        dur: '2:10',
        done: true,
        icon: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z',
      },
      {
        name: 'Setting up your seller profile',
        dur: '3:40',
        done: true,
        icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
      },
      {
        name: 'How verification visits work',
        dur: '4:05',
        done: true,
        icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
      },
    ],
  },
  {
    label: 'SELLING SAFELY',
    lessons: [
      {
        name: 'Spotting an unlicensed buyer',
        dur: '3:15',
        icon: 'M12 9v4M12 17h.01M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8A1.8 1.8 0 0 0 21.5 18L13.7 3.9a1.8 1.8 0 0 0-3.4 0z',
      },
      {
        name: 'Weighing and pricing your lot',
        dur: '2:48',
        icon: 'M12 3v3M5 6h14l-3 7H8zM8 21h8M12 13v8',
      },
      {
        name: 'Safe handover at the pickup site',
        dur: '3:55',
        icon: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z',
      },
      {
        name: 'What to do if an offer is withdrawn',
        dur: '2:22',
        icon: 'M9 14l6-6M9 8h6v6',
      },
    ],
  },
  {
    label: 'QUALITY & GRADING',
    lessons: [
      {
        name: 'Reading an assay certificate',
        dur: '5:20',
        icon: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
      },
      {
        name: 'Purity, karat and fineness',
        dur: '3:02',
        icon: 'M12 3l9 6-9 12L3 9z',
      },
    ],
  },
  {
    label: 'COMPLIANCE & DOCUMENTATION',
    lessons: [
      {
        name: 'Which permits you actually need',
        dur: '4:12',
        icon: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
      },
      {
        name: 'Keeping your documents in date',
        dur: '3:28',
        icon: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
      },
    ],
  },
  {
    label: 'GROUND SAFETY',
    group: 'miner',
    lessons: [
      {
        name: 'Pit wall angles and collapse warning signs',
        dur: '5:40',
        done: true,
        icon: 'M3 20h18L14 6l-4 7-3-3z',
      },
      {
        name: 'Shoring a shallow shaft with local timber',
        dur: '7:15',
        icon: 'M4 21V6h16v15M4 11h16M9 6v15M15 6v15',
      },
      {
        name: 'Air, water and heat: knowing when to stop',
        dur: '4:35',
        icon: 'M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z',
      },
      {
        name: 'Mercury-free processing basics',
        dur: '6:05',
        icon: 'M12 9v4M12 17h.01M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8A1.8 1.8 0 0 0 21.5 18L13.7 3.9a1.8 1.8 0 0 0-3.4 0z',
      },
      {
        name: 'Protective equipment on a small site',
        dur: '3:50',
        icon: 'M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6z',
      },
      {
        name: 'First aid for crush and cut injuries',
        dur: '5:20',
        icon: 'M12 8v8M8 12h8M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      },
    ],
  },
  {
    label: 'USING AUCTIONS',
    lessons: [
      {
        name: 'Setting a starting bid and reserve',
        dur: '4:30',
        icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
      },
      {
        name: 'Reading a live bid history',
        dur: '3:05',
        icon: 'M4 20V10M10 20V4M16 20v-8M22 20h-20',
      },
    ],
  },
];

export const CHAPTERS: { name: string; time: string; active?: boolean }[] = [
  { name: 'Why weight is measured twice', time: '00:00', active: true },
  { name: 'Reading the scale certificate', time: '00:41' },
  { name: 'Legitimate deductions', time: '01:18' },
  { name: 'Questions to ask before handover', time: '02:04' },
];
