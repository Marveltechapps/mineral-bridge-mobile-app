// Port of the design's mb4-data.js: order stage engine + formatting helpers. The catalogue registries
// (CATS / PRODUCTS) are filled from the API at runtime. `demoUpdate` is DEV-only (simulated counterparties).
import type { Category, Order, Product, Stage } from '../types/mineralBridge';

const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** en-US number with thousands separators, keeping up to `maxFrac` decimals. */
export function num(n: number, maxFrac = 6): string {
  if (!isFinite(n)) return String(n);
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(maxFrac);
  let [int, frac = ''] = fixed.split('.');
  frac = frac.replace(/0+$/, '');
  int = group(int);
  return (neg ? '-' : '') + int + (frac ? '.' + frac : '');
}

export const money = (n: number) => {
  const r = Math.round(n);
  return (r < 0 ? '-$' : '$') + group(String(Math.abs(r)));
};
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n: number) => String(n).padStart(2, '0');
export const fmt = (t: number) => {
  const d = new Date(t);
  return p2(d.getDate()) + ' ' + M[d.getMonth()] + ' · ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
};
export const day = (t: number) => {
  const d = new Date(t);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' ' + d.getDate() + ' ' + M[d.getMonth()];
};

// Live catalogue registries. They start EMPTY and are filled from the API (`catalogue.service`) by the store.
// They are mutable arrays (same reference forever) so the many sync `product()/PRODUCTS` call sites keep working.
export const CATS: Category[] = [];
export const PRODUCTS: Product[] = [];
const ALIAS = new Map<string, string>();

/** Replace the category list in place. */
export function setCategories(list: Category[]) { CATS.splice(0, CATS.length, ...list); }
/** Insert or replace products by id. `aliases` maps other ids (e.g. internal ids) to the product id. */
export function upsertProducts(list: Product[], aliases?: Record<string, string>) {
  list.forEach(p => { const i = PRODUCTS.findIndex(x => x.id === p.id); if (i >= 0) PRODUCTS[i] = p; else PRODUCTS.push(p); });
  if (aliases) Object.keys(aliases).forEach(k => ALIAS.set(k, aliases[k]));
}
/** Drop every product of a mineral (before reloading that mineral). */
export function dropMineral(mineral: string) {
  for (let i = PRODUCTS.length - 1; i >= 0; i--) if (PRODUCTS[i].mineral === mineral) PRODUCTS.splice(i, 1);
}
export function clearCatalogue() { CATS.length = 0; PRODUCTS.length = 0; ALIAS.clear(); }
export const product = (id?: string) => (id ? PRODUCTS.find(x => x.id === id) || PRODUCTS.find(x => x.id === ALIAS.get(id)) : undefined);
export const mineralName = (id: string) => {
  for (const c of CATS) for (const [m, n] of c.minerals) if (m === id) return n;
  return id;
};
/** Original photo for a mineral, from its category record or one of its own lots. */
export function mineralImageUrl(id: string): string {
  for (const c of CATS) for (const [m, , img] of c.minerals) if (m === id && /^https?:\/\//i.test(img || '')) return img;
  const lot = PRODUCTS.find(p => p.mineral === id && /^https?:\/\//i.test(p.img || ''));
  return lot?.img || '';
}
export const catOf = (id: string) => CATS.find(c => c.minerals.some(([m]) => m === id));

export const BUYER_TYPES: [string, string, string][] = [['refinery', 'Refineries and smelters', 'Buy doré and concentrate to refine into high-grade metal'], ['house', 'International trading houses', 'Bulk volumes to hedge or distribute globally'], ['industry', 'Manufacturing & industrial end-users', 'Lithium, cobalt, quartz and more for production'], ['jewel', 'Jewelry manufacturers & artisans', 'Precious metals and gemstones for consumer goods'], ['investor', 'Retail investors & collectors', 'Bars, bullion and rare specimens'], ['wholesale', 'B2B wholesalers', 'Medium-to-large lots to warehouse and resell']];
export const SELLER_TYPES: [string, string, string][] = [['asm', 'Artisanal and small-scale miners (ASMs)', 'Independent or family-run operations'], ['industrial', 'Industrial mining companies', 'Large-scale producers of base metals or bulk minerals'], ['coop', 'Mining cooperatives', 'Registered groups of artisanal miners'], ['dealer', 'Licensed local dealers / brokers', 'Aggregate from miners and handle local paperwork'], ['exporter', 'International traders / exporters', 'Export logistics, customs and compliance'], ['scrap', 'Individual salvagers / scrap collectors', 'Recycled metal, e-waste and precious scrap']];

export const WHO: Record<string, string> = { you: 'You', mb: 'Mineral Bridge Operations', sgs: 'SGS (independent inspector)', lp: 'Logistics partner' };
type StageRow = [string, string, Stage['actor'], string, number];
// key, label, actor, customer action screen, phase index
const BUY: StageRow[] = [
  ['placed', 'Order placed', 'you', '', 0], ['accepted', 'Order accepted', 'mb', '', 0],
  ['quote', 'Quotation issued', 'mb', '', 1], ['quoteOk', 'Quotation accepted', 'you', 'quote', 1], ['confirmed', 'Price confirmed', 'mb', '', 1],
  ['contract', 'E-contract signed by you', 'you', 'contract', 2], ['contractMb', 'E-contract countersigned', 'mb', '', 2],
  ['paid', 'Payment made', 'you', 'pay', 3], ['payOk', 'Payment confirmed', 'mb', '', 3],
  ['assigned', 'Logistics partner assigned', 'lp', '', 4], ['picked', 'Product picked up', 'lp', '', 4], ['transit', 'In transit', 'lp', '', 4],
  ['delivered', 'Delivered', 'lp', '', 5], ['receipt', 'Receipt confirmed by you', 'you', 'receipt', 5], ['done', 'Order completed', 'mb', '', 5],
];
const BUY_PH = ['Order review', 'Price quotation', 'E-contract', 'Payment', 'Logistics', 'Delivery & completion'];
const SELL: StageRow[] = [
  ['submitted', 'Sell request submitted', 'you', '', 0], ['reviewed', 'Reviewed by operations', 'mb', '', 0],
  ['quote', 'Price quotation issued', 'mb', '', 1], ['quoteOk', 'Quotation accepted by you', 'you', 'quote', 1], ['confirmed', 'Price and terms confirmed', 'mb', '', 1],
  ['contract', 'E-contract signed by you', 'you', 'contract', 2], ['contractMb', 'E-contract countersigned', 'mb', '', 2],
  ['form', 'Seller confirmation form submitted', 'you', 'sellConfirm', 3], ['formOk', 'Details accepted', 'mb', '', 3],
  ['schedule', 'Inspection scheduled by Mineral Bridge', 'mb', '', 4], ['inspect', 'Mineral Bridge inspection completed', 'mb', '', 4], ['sgs', 'Third-party test report uploaded', 'sgs', '', 4], ['reportOk', 'Inspection reports accepted by you', 'you', 'report', 4], ['approved', 'Final approval by Mineral Bridge', 'mb', '', 4],
  ['payout', 'Payment released to you', 'mb', '', 5],
  ['picked', 'Collected by logistics partner', 'lp', '', 6], ['transit', 'In transit to Mineral Bridge', 'lp', '', 6],
  ['received', 'Received by Mineral Bridge', 'mb', '', 7], ['done', 'Completed', 'mb', '', 7],
];
const SELL_PH = ['Submission & review', 'Price negotiation', 'E-contract', 'Seller confirmation form', 'Inspection by Mineral Bridge', 'Payment', 'Transportation', 'Received & completed'];
const mapStages = (rows: StageRow[]): Stage[] => rows.map(s => ({ key: s[0], label: s[1], actor: s[2], screen: s[3], phase: s[4] }));
const BUY_STAGES = mapStages(BUY);
const SELL_STAGES = mapStages(SELL);
export const stages = (k: string): Stage[] => (k === 'sell' ? SELL_STAGES : BUY_STAGES);
export const phases = (k: string) => (k === 'sell' ? SELL_PH : BUY_PH);

export const orderValue = (o: Order) =>
  o.kind === 'sell' && o.sell ? o.sell.qty * (o.sell.ref || 1000) : o.items.reduce((a, it) => { const p = product(it.pid); return a + (it.amount !== undefined ? it.amount : p ? p.ref * it.qty : 0); }, 0);
export const titleOf = (o: Order) => (o.kind === 'sell' && o.sell ? o.sell.name : o.items.map(it => it.name || (product(it.pid) || ({} as Product)).name || it.pid).join(' + '));
/** Unit label of an order line (API orders carry it on the line; catalogue products otherwise). */
export const unitOfItem = (it: { pid: string; unit?: string }) => it.unit || (product(it.pid) || ({} as Product)).unit || '';

export type DemoUpdate = [string, string, Partial<Order>?];

// simulated counterparty updates (clearly labelled as demo in the UI)
export function demoUpdate(o: Order, key: string, now: number): DemoUpdate {
  const v = orderValue(o), ref = o.id.slice(-5);
  const f = o.form || {};
  const sell = o.kind === 'sell';
  const SHIP0 = {
    id: 'SSF-' + ref, partner: 'Sahel Secure Freight', contact: 'Musa Ibrahim · +234 803 555 0142', mode: 'Armoured road freight, insured',
    from: sell ? (f.address || 'Seller site') : (f.address || 'Mineral Bridge bonded vault, Lagos'),
    to: sell ? 'Mineral Bridge bonded vault, 14 Creek Road, Apapa, Lagos' : (o.addr ? [o.addr.org, o.addr.street, o.addr.city, o.addr.country].filter(Boolean).join(', ') : 'Buyer address'),
    pickup: fmt(now + 5 * 36e5), status: 'Pickup scheduled', events: [] as [string, number][],
  };
  const ship = (p: Record<string, unknown>, ev: string): Partial<Order> => {
    const b = Object.assign({}, SHIP0, o.ship || {}, p);
    b.events = [...((o.ship || { events: [] }).events || []), [ev, now]];
    return { ship: b };
  };
  const U: Record<string, DemoUpdate> = {
    accepted: ['Order accepted', 'Product, quantity and customer details verified.'],
    reviewed: ['Request reviewed', 'Photos, quantity and documents checked. Our trading desk will call you to agree a price.'],
    quote: ['Quotation issued', 'Quotation Q-' + ref + ' · ' + money(v) + ' · valid 7 days', { quote: { no: 'Q-' + ref, total: Math.round(v), issued: now, valid: now + 7 * 864e5 } }],
    confirmed: ['Price confirmed by Mineral Bridge', 'Accepted by Tunde Adebayo, Head of Trading.'],
    contractMb: ['E-contract countersigned', 'Signed by Tunde Adebayo for Mineral Bridge Ltd.'],
    formOk: [sell ? 'Details accepted' : 'Payment details accepted', sell ? 'Payout and inspection arrangements approved.' : 'Payment method, terms and billing approved.'],
    schedule: ['Inspection scheduled by Mineral Bridge', (f.date || 'Thu 5 Nov') + ' · ' + (f.time || '10:00') + ' at ' + (f.address || 'your site'), { insp: { when: (f.date || 'Thu 5 Nov') + ' · ' + (f.time || '10:00') } }],
    inspect: ['Mineral Bridge inspection completed', 'Our inspector verified quantity, weight and condition on site · 24 photos and weighing slip uploaded.', { company: { by: 'Emeka Balogun, Mineral Bridge inspection', at: now, result: 'Quantity verified, condition good' } }],
    sgs: ['Third-party test report uploaded', 'SGS report SGS-' + ref + ' · result: compliant', { sgs: { no: 'SGS-' + ref, at: now, result: 'Compliant' } }],
    approved: ['Final approval recorded', 'Inspection and test reports approved by both sides. Moving to payment.'],
    payOk: ['Payment confirmed', 'Funds received by Mineral Bridge · Txn ref TRX-' + ref, { txn: 'TRX-' + ref }],
    payout: ['Payment released to you', money(o.quote ? o.quote.total : v) + ' sent · Txn ref TRX-' + ref, { txn: 'TRX-' + ref }],
    assigned: ['Logistics partner assigned', 'Sahel Secure Freight · shipment SSF-' + ref + ' · pickup ' + SHIP0.pickup, ship({}, 'Partner assigned · pickup booked for ' + SHIP0.pickup)],
    picked: [sell ? 'Collected by logistics partner' : 'Product picked up', 'Vehicle LAG-482-KJ · driver Musa Ibrahim · transport documents uploaded', ship({ status: 'Picked up', vehicle: 'LAG-482-KJ · armoured van', driver: 'Musa Ibrahim · +234 803 555 0142', seals: 'MB-SEAL-' + ref + '-01 to 04', docs: ['Waybill SSF-' + ref, 'Packing list', 'Insurance certificate', 'Seal record'] }, 'Collected · 4 seals applied · documents uploaded')],
    transit: [sell ? 'In transit to Mineral Bridge' : 'In transit', 'Tracking SSF-' + ref + ' · estimated arrival ' + day(now + 3 * 864e5), ship({ status: 'In transit', eta: day(now + 3 * 864e5) + ' · by 17:00', location: sell ? 'Ibadan checkpoint' : 'Lagos–Ibadan Expressway' }, 'Departed · last scan ' + (sell ? 'Ibadan checkpoint' : 'Lagos–Ibadan Expressway'))],
    delivered: ['Delivered', 'Delivered ' + fmt(now) + ' · proof of delivery uploaded', ship({ status: 'Delivered', pod: 'POD-' + ref + ' · signed by receiver, 6 photos', deliveredAt: now, location: 'Destination' }, 'Delivered · proof of delivery uploaded')],
    received: ['Received by Mineral Bridge', 'Product received at the Mineral Bridge vault and checked against the inspection report.', ship({ status: 'Delivered to vault', pod: 'POD-' + ref + ' · vault receipt, seals intact', deliveredAt: now, location: 'Mineral Bridge vault' }, 'Received at vault · seals intact')],
    done: [o.kind === 'sell' ? 'Sale completed' : 'Order completed', 'All documents, approvals and records stored.'],
  };
  return U[key] || ['Updated', ''];
}
