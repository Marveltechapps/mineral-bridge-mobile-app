// Values shared by the order screens (port of the prototype's orderVals / refundVals / cancelVals).
import type { MBStore } from '../../context/store';
import { RF_STEPS } from '../../context/store';
import { Linking } from 'react-native';
import { EMPTY_USER } from '../../context/state';
import * as MB from '../../lib/mb4';
import { prodIm } from '../../components/mb/art';
import type { Im } from '../../components/mb/art';
import type { Auction, Order, Product } from '../../types/mineralBridge';

const P = (id: string) => MB.product(id) || ({} as Product);

const CONTACT: Record<string, (c: { phone: string; whatsapp: string; email: string }) => string> = {
  Phone: c => 'tel:' + c.phone.replace(/\s/g, ''), SMS: c => 'sms:' + c.phone.replace(/\s/g, ''), Email: c => 'mailto:' + c.email,
  WhatsApp: c => 'https://wa.me/' + c.whatsapp.replace(/\D/g, ''),
};

/** Contact channels from the support API (`GET /support/faqs` contacts); nothing is hard-coded. */
export function contactItems(store: MBStore) {
  return (['Phone', 'SMS', 'Email', 'WhatsApp', 'Chat'] as const).map(l => ({
    l,
    tap: () => {
      if (l === 'Chat') return store.go('chat');
      const c = store.state.contacts;
      if (!c) { void store.task(store.remote.loadFaqs()); return store.flash('Loading contact details. Try again in a moment.'); }
      const url = CONTACT[l](c);
      Linking.openURL(url).catch(() => store.flash('Could not open ' + l.toLowerCase() + ' on this device'));
    },
  }));
}

/** Issued documents for an order, as returned by `GET /orders/:ref/documents`. */
export function orderDocs(store: MBStore, o: Order) {
  return (o.docs || []).map(d => {
    const spec = { t: d.type, num: d.number, oid: o.id };
    return { n: d.label + ' ' + d.number, f: MB.fmt(d.at) + (d.status && d.status !== 'issued' ? ' · ' + d.status : ''), tap: () => store.openDoc(spec), dl: () => store.downloadDoc(spec) };
  });
}

export function phaseRows(o: Order) {
  const st = MB.stages(o.kind), ph = MB.phases(o.kind), all = !st[o.idx + 1], cur = all ? st[o.idx].phase : st[o.idx + 1].phase;
  return ph.map((l, i) => {
    const d = all || i < cur, a = !all && i === cur;
    return { l, n: String(i + 1), done: d, now: a, last: i === ph.length - 1, dot: d ? '#14284B' : a ? '#D9B456' : '#fff', dotBorder: d ? '#14284B' : a ? '#D9B456' : '#D5D3CC', fg: !d && !a ? '#6B6A70' : '#0E1A33', line: d ? '#14284B' : '#E4E2DB', tag: d ? 'Done' : a ? 'Now' : '', tagFg: a ? '#A1620B' : '#17704C' };
  });
}

export function auditRows(o: Order) {
  return [...o.log].reverse().map((l, i, arr) => ({ who: l.who, text: l.text, note: l.note, at: MB.fmt(l.at), last: i === arr.length - 1, youBg: l.who === 'You' ? '#14284B' : '#F6EED8', youFg: l.who === 'You' ? '#D9B456' : '#8A6A1C', ini: l.who === 'You' ? 'YOU' : l.who.startsWith('SGS') ? 'SGS' : l.who.startsWith('Logistics') || l.who.startsWith('Sahel') ? 'LP' : 'MB' }));
}

export function orderLines(o: Order) {
  return o.kind === 'sell' && o.sell ? [{ n: o.sell.name, q: o.sell.qty + ' ' + o.sell.unit, g: [o.sell.grade, o.sell.form].filter(Boolean).join(' · ') }] : o.items.map(it => { const p = P(it.pid); return { n: p.name || it.name || it.pid, q: it.qty + ' ' + MB.unitOfItem(it), g: p.lab ? p.grade + ' · ' + p.lab : p.grade || 'Test report on request' }; });
}

export const refundTone = (st: string): [string, string, string] => (({ requested: ['#FBF3E4', '#A1620B', 'Requested'], review: ['#FBF3E4', '#A1620B', 'Under review'], approved: ['#E8EEF9', '#2B4C8C', 'Approved'], processing: ['#E8EEF9', '#2B4C8C', 'Processing'], refunded: ['#E2F2E9', '#17704C', 'Refunded'], declined: ['#FDECEA', '#B42318', 'Declined'] } as Record<string, [string, string, string]>)[st] || ['#F1EFE9', '#3A3940', st]);

export function refundView(o?: Order) {
  const rfo = o && o.refund;
  if (!rfo) return null;
  const ti = RF_STEPS.findIndex(x => x[0] === rfo.status), t = refundTone(rfo.status);
  return {
    ref: rfo.ref, amount: MB.money(rfo.amount), typeLabel: rfo.type === 'full' ? 'Full refund' : 'Partial refund', reason: rfo.reason, to: rfo.to, statusLabel: t[2], pillBg: t[0], pillFg: t[1],
    declined: rfo.status === 'declined', declineReason: rfo.reason2 || '', showSteps: rfo.status !== 'declined', bankRef: rfo.bankRef || '',
    steps: RF_STEPS.map(([, l], i) => ({ l, bar: i <= ti ? (rfo.status === 'refunded' ? '#17704C' : '#D9B456') : '#E4E2DB', fg: i <= ti ? '#0E1A33' : '#6B6A70', w: (i === ti ? 800 : 600) as 600 | 800 })),
  };
}

export function shipSteps(o: Order) {
  const ORDER = ['Pickup scheduled', 'Picked up', 'In transit', 'Delivered'];
  const s0 = (o.ship || { status: '' }).status, st = s0 === 'Delivered to vault' ? 'Delivered' : s0, i = ORDER.indexOf(st);
  return ['Booked', 'Collected', 'In transit', 'Delivered'].map((l, k) => ({ l, bar: k <= i ? '#D9B456' : 'rgba(255,255,255,.14)', fg: k <= i ? '#FFFFFF' : '#9AA3B8' }));
}

export function aucOrderCard(store: MBStore, a: Auction) {
  const s = store.state, p = P(a.pid), o = a.orderId ? s.orders.find(x => x.id === a.orderId) : undefined, lead = a.bids.length && a.bids[a.bids.length - 1].who === 'You';
  const base = { id: a.id, title: p.name || a.name || a.id, qtyLine: a.qty + ' ' + (p.unit || a.unit || ''), im: prodIm({ mineral: p.mineral || '', form: p.form || '', img: a.imageUrl || p.img || '' }) as Im, tap: () => store.openAuction(a.id) };
  if (o) { const v = store.view(o); return { ...base, id: a.id + ' · ' + o.id, status: v.status, pillBg: v.pillBg, pillFg: v.pillFg, value: MB.money(store.aucCur(a)), pct: v.pct, next: v.next, tap: () => store.go('order', { oid: o.id }) }; }
  if (a.result === 'won') return { ...base, status: 'Won · pay now', pillBg: '#E2F2E9', pillFg: '#17704C', value: 'Winning bid ' + MB.money(store.aucCur(a)), pct: '20%', next: 'Pay the winning bid to release the lot for dispatch.', tap: () => store.go('auctionWon', { aid: a.id }) };
  if (a.status === 'live') return { ...base, status: lead ? 'Leading' : 'Outbid', pillBg: lead ? '#E2F2E9' : '#FDECEA', pillFg: lead ? '#17704C' : '#B42318', value: 'Current ' + MB.money(store.aucCur(a)), pct: '10%', next: (lead ? 'You are the highest bidder' : 'Another bidder is ahead. Bid again') + ' · ends in ' + store.left(a.endsAt - Date.now()) };
  if (a.status === 'upcoming') return { ...base, status: 'Reminder on', pillBg: '#FBF3E4', pillFg: '#A1620B', value: 'Starts at ' + MB.money(a.start), pct: '0%', next: 'Bidding opens ' + MB.fmt(a.startsAt || 0) };
  return { ...base, status: 'Not won', pillBg: '#F1EFE9', pillFg: '#3A3940', value: 'Sold for ' + MB.money(store.aucCur(a)), pct: '100%', next: 'Another bidder won this lot.' };
}

/** The order the order-step screens show (current oid, falling back to the first). */
export function currentOrder(store: MBStore) {
  return store.order() || store.state.orders[0];
}
export const signedInUser = (store: MBStore) => store.state.user || EMPTY_USER;

/** Image of an order (first line's lot, or a lot of the mineral being sold). */
export function orderIm(o: Order): Im {
  if (o.kind === 'sell' && o.sell) {
    const lot = MB.PRODUCTS.find(p => p.mineral === o.sell!.mineral && /^https?:\/\//i.test(p.img || ''));
    return prodIm({ mineral: o.sell.mineral, form: lot?.form || '', img: lot?.img || MB.mineralImageUrl(o.sell.mineral) });
  }
  const line = MB.product(o.items[0] && o.items[0].pid);
  return prodIm(line || { mineral: '', form: '', img: '' });
}
