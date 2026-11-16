import type { MBStore } from '../../context/store';
import { imgFor } from '../../lib/images';
import * as MB from '../../lib/mb4';
import type { Auction, Product } from '../../types/mineralBridge';

export const prodOf = (a: Auction) => MB.product(a.pid) || ({} as Product);
export const mineOf = (a: Auction) => a.bids.some(b => b.who === 'You');
export const leadOf = (a: Auction) => a.bids.length > 0 && a.bids[a.bids.length - 1].who === 'You';

/** Auction card values (list rows and the detail hero). */
export function aucCard(store: MBStore, a: Auction) {
  const s = store.state, p = prodOf(a), now = Date.now(), live = a.status === 'live', up = a.status === 'upcoming', mine = mineOf(a), lead = leadOf(a);
  return {
    id: a.id, name: p.name, qty: a.qty + ' ' + p.unit, img: imgFor(p.img), live,
    pill: live ? 'LIVE' : up ? 'UPCOMING' : 'ENDED', pillBg: live ? '#C2412D' : up ? '#D9B456' : '#121214', pillFg: live || !up ? '#fff' : '#121214',
    priceLabel: live ? 'Current bid' : up ? 'Starting bid' : 'Sold for', price: MB.money(up ? a.start : store.aucCur(a)),
    timeLabel: live ? 'Ends in' : up ? 'Opens in' : 'Ended', time: live ? store.left(a.endsAt - now) : up ? store.left((a.startsAt || 0) - now) : MB.fmt(a.endsAt), timeFg: live && a.endsAt - now < 36e5 ? '#C2412D' : '#121214',
    myTag: a.result === 'won' ? 'You won' : a.result === 'lost' ? 'Outbid · ended' : live && mine ? (lead ? 'You are leading' : 'You are outbid') : up && s.reminders[a.id] ? 'Reminder on' : '',
    myBg: a.result === 'won' || (live && lead) ? '#E2F2E9' : (live && mine) || a.result === 'lost' ? '#FDECEA' : '#F1EFE9',
    myFg: a.result === 'won' || (live && lead) ? '#17704C' : (live && mine) || a.result === 'lost' ? '#B42318' : '#3A3940',
    tap: () => store.openAuction(a.id),
  };
}
