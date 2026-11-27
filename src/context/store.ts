// Mineral Bridge app store: UI state, validation and navigation (stack, stage engine view, KYC, auctions, refunds,
// documents). Everything that talks to the backend lives in ./remote.ts (live /v2 API). The demo, simOutbid,
// endAuction and resetDemo helpers are development-only local simulations and do nothing in release builds.
import { Share } from 'react-native';
import * as MB from '../lib/mb4';
import type { AppScreen } from '../navigation/types';
import type { Auction, DocSpec, KycDocId, KycFile, Order, Product } from '../types/mineralBridge';
import { EMPTY_USER, emptyDraft, emptyRefund, fresh } from './state';
import type { AppState, Errs } from './state';
import { imgFor } from '../lib/images';
import { kycRequiredDocIds, moneyMajor, paymentSubmitError, pendingVariation, productHasLotDocuments, productIsSoldOut, resolveCountryCode, screenPollsOrders } from '../lib/mappers';
import { Remote, contactIdentifier, fmtBytes } from './remote';
import type { OtpChannel, ProductDocumentType } from '../api/types';

export const ACTION: Record<string, string> = { quote: 'Review quotation', contract: 'Review and sign e-contract', payInsp: 'Submit payment details', sellConfirm: 'Submit seller confirmation form', report: 'Review inspection reports', pay: 'Make payment', receipt: 'Confirm receipt', priceVar: 'Review price update' };
export const HOLD: Record<string, string> = { refund: 'Refund requested · order paused while Mineral Bridge reviews it', quoteDeclined: 'Quotation declined · waiting for a revised quotation', clarify: 'Clarification requested · waiting on Mineral Bridge', discrepancy: 'Discrepancy raised · order kept open', changes: 'Changes requested · please update your details' };
export const UF: Record<string, number> = { g: 1, kg: 1000, t: 1e6 };
export const REFUND_REASONS = ['Delivery delayed', 'Quantity or quality issue', 'Damaged in transit', 'Paid twice', 'No longer needed', 'Other'];
export const RF_STEPS: [string, string][] = [['requested', 'Refund requested'], ['review', 'Under review'], ['approved', 'Approved'], ['processing', 'Processing'], ['refunded', 'Refunded']];
export const ACTOR: Record<string, string> = { mb: 'Mineral Bridge', sgs: 'SGS', lp: 'logistics partner' };
export const TERMS = ['100% advance before dispatch', '30% advance, 70% before dispatch', 'Letter of credit at sight'];
export const PAY = ['Bank transfer', 'NEFT', 'RTGS', 'UPI', 'Net banking', 'Letter of credit', 'Bitcoin', 'Other approved method'];
export const SELLPAY = ['Bank transfer', 'NEFT', 'RTGS', 'UPI', 'Bitcoin', 'Other approved method'];
export const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30'];
export const CC: [string, string][] = [['+234', '🇳🇬'], ['+233', '🇬🇭'], ['+27', '🇿🇦'], ['+254', '🇰🇪'], ['+255', '🇹🇿'], ['+263', '🇿🇼'], ['+243', '🇨🇩'], ['+225', '🇨🇮'], ['+91', '🇮🇳'], ['+971', '🇦🇪'], ['+44', '🇬🇧'], ['+1', '🇺🇸']];
export const UNAME: Record<string, string> = { g: 'Gram', kg: 'Kilogram', t: 'Ton' };
export const KYC_INFO: Record<KycDocId, { title: string; short: string; ratio: number; hint: string; icon: string; desc: string; tips: string[] }> = {
  front: { title: 'ID front', short: 'Photo of the front side', ratio: 1.58, hint: 'Place the front of your ID inside the frame', icon: 'M3 5h18v14H3zM7 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0M14 9h4M14 13h4M6 16h6', desc: 'Take a clear photo of the front of your ID. The name, photo and ID number must be readable.', tips: ['All four corners are inside the photo', 'No glare, blur or fingers covering text', 'The ID is valid and not expired'] },
  back: { title: 'ID back', short: 'Photo of the back side', ratio: 1.58, hint: 'Turn your ID over and fit it in the frame', icon: 'M3 5h18v14H3zM6 15h12M6 11h8', desc: 'Now the back of the same ID. Barcodes and the code strip must be visible.', tips: ['Same ID as the front', 'Barcode or code strip fully visible', 'Good light, no shadows'] },
  selfie: { title: 'Selfie with ID', short: 'Hold your ID next to your face', ratio: 0.8, hint: 'Fit your face in the circle, ID beside your chin', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1', desc: 'Take a selfie holding the same ID beside your face so we can match you to the document.', tips: ['Face clearly visible, no sunglasses or hat', 'ID held next to your face, details readable', 'Plain background, good light'] },
  address: { title: 'Proof of address', short: 'Utility bill, bank statement or lease', ratio: 0.75, hint: 'Fit the whole page inside the frame', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', desc: 'A utility bill, bank statement or lease showing your name and address.', tips: ['Dated within the last 3 months', 'Your full name and address are visible', 'The whole page is in the photo, or upload the PDF'] },
  biz: { title: 'Business document', short: 'Registration, licence or permit', ratio: 0.75, hint: 'Fit the whole page inside the frame', icon: 'M4 21V5a2 2 0 0 1 2-2h8l6 6v12zM14 3v6h6M8 13h8M8 17h5', desc: 'Your company registration, mining or dealer licence, or trading permit.', tips: ['Shows the registered business name', 'Registration or licence number readable', 'Not expired'] },
};

export interface Meta {
  header?: number; canBack?: number; title?: string; cartBtn?: number; step?: string; prog?: string;
  cta?: string; cta2?: string; cta2Fg: string; ctaOpacity: number; tabs: string;
  /** Header subtitle and 3-segment registration progress (final design). */
  sub?: string; prog3?: number;
  /** CTA look: button kind and leading icon. `ownCta` = the screen draws its own actions. */
  ctaKind?: 'primary' | 'ghost'; ctaIcon?: string; ownCta?: number;
  /** Notifications header action. */
  readAll?: number;
}

export interface View {
  id: string; kind: string; title: string; status: string; pillBg: string; pillFg: string; headline: string; next: string;
  you: boolean; actionLabel: string; actionScreen: string; canDemo: boolean; demoLabel: string; canReject: boolean;
  canDeclineRefund: boolean; canChanges: boolean; pct: string; step: string; value: string; qtyLine: string;
  img: ReturnType<typeof imgFor>; updated: string; done: boolean; rej: boolean;
}

export interface DocData {
  title: string; no: string; date: string; status: string; issuer: string; signer: string; signerRole: string; note: string;
  parties: [string, string][]; sections: { h: string; rows: { k: string; v: string; w: 500 | 700; mono: boolean }[] }[];
}

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState> | null);

export class MBStore {
  state: AppState = fresh();
  readonly remote = new Remote(this);
  private listeners = new Set<() => void>();
  private toastTimer?: ReturnType<typeof setTimeout>;
  private ticker?: ReturnType<typeof setInterval>;
  private pending = new Set<Promise<unknown>>();
  private dueSeen = new Map<string, number>();
  version = 0;

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getVersion = () => this.version;
  setState(patch: Patch, cb?: () => void) {
    const prev = this.state.screen;
    const p = typeof patch === 'function' ? patch(this.state) : patch;
    if (p) {
      this.state = { ...this.state, ...p }; this.version++; this.listeners.forEach(l => l());
      if (this.state.screen !== prev) this.remote.onScreen(this.state.screen, prev);
    }
    if (cb) cb();
  }

  /** Track a background promise so tests (and shutdown) can wait for it. */
  task<T>(p: Promise<T>): Promise<T> {
    this.pending.add(p);
    const done = () => { this.pending.delete(p); };
    p.then(done, done);
    return p;
  }
  /** Resolves once every tracked async task (including ones started by other tasks) has settled. */
  async idle() { while (this.pending.size) await Promise.allSettled([...this.pending]); }

  start() {
    if (this.ticker) return;
    this.remote.start();
    this.ticker = setInterval(() => {
      const st = this.state;
      if (st.screen === 'pay' && st.pmethod === 'Bitcoin') return this.setState({ tick: Date.now() });
      if (st.screen === 'chat') this.remote.pollChat();
      if (st.screen === 'supportThread') this.remote.pollSupport();
      if (screenPollsOrders(st.screen)) this.remote.pollOrders();
      if (!['auctions', 'auction', 'orders'].includes(st.screen)) return;
      // A live auction past its end time is settled by the server; ask it for the result (at most every 10 s).
      (st.auctions || []).filter(a => a.status === 'live' && a.endsAt <= Date.now()).forEach(a => {
        if (Date.now() - (this.dueSeen.get(a.id) || 0) < 10000) return;
        this.dueSeen.set(a.id, Date.now());
        void this.task(this.remote.loadAuction(a.id));
      });
      this.setState({ tick: Date.now() });
    }, 1000);
  }
  stop() { if (this.ticker) clearInterval(this.ticker); this.ticker = undefined; this.remote.stop(); }

  flash(t: string) { if (this.toastTimer) clearTimeout(this.toastTimer); this.setState({ toast: t }); this.toastTimer = setTimeout(() => this.setState({ toast: '' }), 2400); }
  go(s: AppScreen, extra?: Partial<AppState>) { this.setState(x => Object.assign({ stack: [...x.stack, x.screen], screen: s, sortOpen: false }, extra || {})); this.top(); }
  resume(ret0: string) {
    let ret = ret0 as AppScreen | '';
    if (!ret) return this.jump('home', { returnTo: '' });
    const u = this.state.user;
    if (ret === 'checkout' && (!u || u.kyc !== 'verified')) ret = 'cart';
    const ST: Record<string, AppScreen[]> = { checkout: ['home', 'cart'], sellForm: ['home', 'sellCats'], cart: ['home'] };
    this.setState({ stack: ST[ret] || ['home'], screen: ret as AppScreen, returnTo: '' });
    this.top();
    if (ret === 'checkout') setTimeout(() => this.prefillShip(), 0);
  }
  jump(s: AppScreen, extra?: Partial<AppState>) { this.setState(Object.assign({ stack: [], screen: s, sortOpen: false }, extra || {})); this.top(); }
  back() {
    this.setState(x => { const st = [...x.stack]; const p = st.pop(); return p ? { stack: st, screen: p } : { screen: x.user ? 'home' : 'welcome' }; });
    this.top();
  }
  top() { this.setState(x => ({ scrollSeq: x.scrollSeq + 1 })); }
  order(id?: string) { return this.state.orders.find(o => o.id === (id || this.state.oid)); }
  patchOrder(id: string, fn: (o: Order) => Order) { this.setState(x => ({ orders: x.orders.map(o => (o.id === id ? fn(Object.assign({}, o)) : o)) })); }
  log(o: Order, who: string, text: string, note?: string, extra?: Partial<Order>) { o.log = [...o.log, { who, text, note: note || '', at: Date.now() }]; return Object.assign(o, extra || {}); }
  notify(o: Order | null | undefined, title: string, note: string) { this.setState(x => ({ notifs: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), oid: o ? o.id : '', to: o ? '' : 'kycStatus', title, note, at: Date.now(), read: false }, ...x.notifs] })); }
  gate(ret: string) {
    const u = this.state.user;
    if (!u) { this.setState({ returnTo: ret, auth: Object.assign({}, this.state.auth, { mode: 'signin' }) }); this.go('auth'); this.flash('Sign in to continue'); return false; }
    if (u.kyc === 'none' || u.kyc === 'rejected') { this.setState({ returnTo: ret }); this.go('kyc'); this.flash('Complete KYC to continue'); return false; }
    if (u.kyc === 'pending') { this.setState({ returnTo: ret, sheet: 'kycPending' }); return false; }
    const need = ret === 'sellForm' ? 'seller' : 'buyer';
    if (u.role !== 'both' && u.role !== need) { this.setState({ returnTo: ret, sheet: need === 'seller' ? 'needSeller' : 'needBuyer' }); return false; }
    return true;
  }

  /**
   * DEVELOPMENT ONLY. Local simulation of counterparty steps (Mineral Bridge, SGS, logistics) on the order held in
   * memory. It never calls the API and the next refresh from the server overwrites it. Production builds ignore it.
   */
  demo(kind: '' | 'reject' | 'changes' | 'refundDecline') {
    if (!__DEV__) return;
    const o = this.order(); if (!o) return;
    const st = MB.stages(o.kind), next = st[o.idx + 1], now = Date.now();
    if (kind === 'reject') { this.patchOrder(o.id, c => this.log(c, MB.WHO.mb, 'Order rejected', 'The seller has withdrawn this quantity. Please choose another lot.', { rejected: 'The seller has withdrawn this quantity. Please choose another lot.' })); this.notify(o, 'Order rejected', 'Reason shared in your order.'); return; }
    if (kind === 'changes') { this.patchOrder(o.id, c => { c.idx -= 1; return this.log(c, MB.WHO.mb, 'Changes requested', (o.kind === 'sell' ? 'Please choose an inspection date within the next 10 days.' : 'Please update the billing address to match your company registration.'), { hold: 'changes' }); }); this.notify(o, 'Changes requested', o.kind === 'sell' ? 'Update your seller confirmation form.' : 'Update your payment details.'); return; }
    if (kind === 'refundDecline') { this.patchOrder(o.id, c => this.log(c, MB.WHO.mb, 'Refund declined', 'The shipment is already with the logistics partner and the goods match the contract. Contact support if you disagree.', { hold: c.refund && c.refund.fromDisc ? 'discrepancy' : '', refund: Object.assign({}, c.refund!, { status: 'declined' as const, reason2: 'The shipment is already with the logistics partner and the goods match the contract.', at2: now }) })); this.notify(o, 'Refund declined', 'Reason shared in your order.'); return; }
    if (o.hold === 'refund' && o.refund) {
      const r = o.refund, nx = ({ requested: 'review', review: 'approved', approved: 'processing', processing: 'refunded' } as Record<string, string>)[r.status];
      const TXT = ({ review: ['Refund under review', 'Our finance team is checking the payment and order status.'], approved: ['Refund approved', MB.money(r.amount) + ' will be returned to ' + r.to + '.'], processing: ['Refund processing', 'Sent to the bank. Allow 3–7 working days to appear.'], refunded: ['Refund completed', MB.money(r.amount) + ' refunded · bank reference RF' + String(now).slice(-8)] } as Record<string, [string, string]>)[nx];
      if (!TXT) return;
      this.patchOrder(o.id, c => {
        const rf = Object.assign({}, c.refund!, { status: nx as typeof r.status, ['at_' + nx]: now });
        if (nx === 'refunded') { rf.bankRef = 'RF' + String(now).slice(-8); c.refundedSoFar = (c.refundedSoFar || 0) + rf.amount; }
        const out = this.log(c, MB.WHO.mb, TXT[0], TXT[1], { refund: rf, hold: nx === 'refunded' ? '' : 'refund' });
        if (nx === 'refunded' && rf.fromDisc) { out.disc = null; out.log = [...out.log, { who: MB.WHO.mb, text: 'Discrepancy settled by refund', note: MB.money(rf.amount) + ' refunded for the difference.', at: now + 1 }]; }
        if (nx === 'refunded' && c.kind === 'buy') { out.refundSettled = true; this.closeIfDelivered(out, now + 2); }
        return out;
      });
      this.notify(o, TXT[0], TXT[1]); return;
    }
    if (o.hold && o.hold !== 'changes') {
      const q = o.quote;
      const R = ({ quoteDeclined: ['Revised quotation issued', 'Revised total ' + MB.money((q ? q.total : 0) * 0.985), q ? { quote: Object.assign({}, q, { total: Math.round(q.total * 0.985), issued: now, rev: (q.rev || 1) + 1 }) } : {}], clarify: ['Clarification provided', 'SGS confirmed the sampling method and re-issued the certificate.', {}], discrepancy: ['Discrepancy resolved', 'Mineral Bridge checked the delivery and shipped the missing quantity. Confirm receipt again when it arrives.', {}] } as Record<string, [string, string, Partial<Order>]>)[o.hold];
      if (!R) return;
      this.patchOrder(o.id, c => this.log(c, MB.WHO.mb, R[0], R[1], Object.assign({ hold: '' }, R[2])));
      this.notify(o, R[0], R[1]); return;
    }
    if (!next || next.actor === 'you') return;
    const u = MB.demoUpdate(o, next.key, now);
    this.patchOrder(o.id, c => { c.idx += 1; const out = this.log(c, MB.WHO[next.actor], u[0], u[1], u[2] || {}); if (out.refundSettled) this.closeIfDelivered(out, now + 1); return out; });
    this.notify(o, u[0], u[1]);
  }
  closeIfDelivered(c: Order, at: number) {
    const st = MB.stages('buy'), di = st.findIndex(x => x.key === 'delivered'), ri = st.findIndex(x => x.key === 'receipt'), ei = st.length - 1;
    if (c.idx < di || c.idx >= ri) return c;
    c.idx = ei; c.hold = '';
    c.log = [...c.log, { who: MB.WHO.mb, text: 'Receipt confirmation not needed', note: 'This order was settled by refund, so it closes on delivery.', at }, { who: MB.WHO.mb, text: 'Order completed', note: 'Closed after refund ' + ((c.refund || { ref: '' }).ref || '') + '. All records are stored in your history.', at: at + 1 }];
    return c;
  }
  view(o: Order): View {
    const st = MB.stages(o.kind), next = st[o.idx + 1], last = st[Math.max(0, o.idx)] || st[0];
    const refunded = !!(o.refund && o.refund.status === 'refunded' && o.refund.type === 'full');
    const cx = !!o.cancelled, done = !next || refunded || cx, rej = !!o.rejected || cx;
    const needVar = !!pendingVariation(o) && !rej && !done;
    const nextScreen = next ? next.screen : '';
    const holdBlocks = !!o.hold && o.hold !== 'changes' && !(o.hold === 'quoteDeclined' && nextScreen && nextScreen !== 'quote');
    const you = needVar || (!!next && next.actor === 'you' && !rej && !holdBlocks);
    const holdText = o.hold ? (o.holdNote ? HOLD[o.hold].split(' · ')[0] + ' · ' + o.holdNote : HOLD[o.hold] || 'On hold') : '';
    const status = rej ? (cx ? 'Cancelled' : 'Rejected') : refunded ? 'Refunded' : done ? 'Completed' : needVar ? 'Action needed' : o.hold ? (HOLD[o.hold] || 'On hold').split(' · ')[0] : you ? 'Action needed' : 'Waiting on ' + ACTOR[next.actor];
    const tone = cx ? ['#F1EFE9', '#3A3940'] : rej ? ['#FDECEA', '#B42318'] : refunded ? ['#EDE9F7', '#4B3B8F'] : done ? ['#E2F2E9', '#17704C'] : you || o.hold ? ['#FBF3E4', '#A1620B'] : ['#EEF0F5', '#3A4560'];
    const value = o.quote ? (o.quote.est ? 'From ' : '') + MB.money(o.quote.total) : 'By quotation';
    const p0 = o.kind === 'sell' && o.sell ? MB.PRODUCTS.find(p => p.mineral === o.sell!.mineral) : MB.product(o.items[0] && o.items[0].pid);
    const lastAt = o.log.length ? o.log[o.log.length - 1].at : o.created;
    return {
      id: o.id, kind: o.kind, title: MB.titleOf(o), status, pillBg: tone[0], pillFg: tone[1],
      headline: rej ? (cx ? (o.kind === 'sell' ? 'Sell request cancelled' : 'Order cancelled') : 'Order rejected') : refunded ? 'Order cancelled and refunded' : done ? (o.kind === 'sell' ? 'Sale completed' : 'Order completed') : last.label,
      next: rej ? (cx ? 'Cancelled by you on ' + MB.fmt(o.cancelled!.at) + ' · ' + o.cancelled!.reason + (o.kind === 'sell' ? '. No inspection or payment took place.' : '. Nothing was charged.') : o.rejected || '') : refunded ? MB.money(o.refund!.amount) + ' refunded to ' + o.refund!.to + ' · ref ' + o.refund!.ref : done ? 'All records are stored in your history.' : needVar ? 'Your turn: ' + ACTION.priceVar : o.hold ? holdText : you ? 'Your turn: ' + ACTION[next.screen] : 'Next: ' + next.label + ' (' + ACTOR[next.actor] + ')',
      you, actionLabel: needVar ? ACTION.priceVar : you ? ACTION[next.screen] : '', actionScreen: needVar ? 'priceVar' : you ? next.screen : '',
      canDemo: __DEV__ && !rej && !done && !you && o.hold !== 'changes', demoLabel: o.hold === 'refund' ? 'Simulate: refund ' + (({ requested: 'review started', review: 'approved', approved: 'processing', processing: 'completed' } as Record<string, string>)[(o.refund || { status: '' }).status] || 'update') : o.hold ? 'Simulate Mineral Bridge response' : next ? 'Simulate: ' + next.label : '',
      canReject: __DEV__ && !rej && !!next && next.key === 'accepted', canDeclineRefund: __DEV__ && o.hold === 'refund' && ['requested', 'review'].includes((o.refund || { status: '' }).status), canChanges: __DEV__ && !rej && !!next && next.key === 'formOk' && !o.hold,
      pct: Math.round((o.idx + 1) / st.length * 100) + '%', step: 'STAGE ' + (o.idx + 1) + ' OF ' + st.length, value,
      qtyLine: o.kind === 'sell' && o.sell ? o.sell.qty + ' ' + o.sell.unit + (o.sell.grade ? ' · ' + o.sell.grade : '') : o.items.filter(it => it.qty > 0).map(it => it.qty + ' ' + MB.unitOfItem(it)).join(' + '),
      img: imgFor(p0 ? p0.img : 'cat-precious'),
      updated: MB.fmt(lastAt), done, rej,
    };
  }

  meta(): Meta {
    const s = this.state, u = s.user;
    const kycIds = kycRequiredDocIds(s.kycReq, s.kyc.idType, this.bizDocNeeded()), kycPos = Math.max(0, kycIds.indexOf(s.kycDocId));
    const ord = this.order(), detailP = MB.product(s.pid), detailOff = !!detailP && productIsSoldOut(detailP);
    const M: Partial<Record<AppScreen, Partial<Meta>>> = {
      welcome: { ownCta: 1 }, auth: { canBack: 1, title: s.auth.mode === 'signup' ? 'Create account' : 'Sign in', cta: s.authBusy ? 'Sending code…' : 'Send verification code', ownCta: 1 },
      otp: { header: 1, canBack: 1, title: 'Verify', cta: s.authBusy ? 'Verifying…' : 'Verify and continue', ownCta: 1 },
      regType: { header: 1, title: 'Account type', sub: 'Step 1 of 3', prog3: 1, step: 'STEP 1 OF 3 · ACCOUNT TYPE', prog: '33%', cta: 'Continue' },
      regDetails: { header: 1, canBack: 1, title: 'Your details', sub: 'Step 2 of 3', prog3: 2, step: 'STEP 2 OF 3 · DETAILS', prog: '66%', cta: s.authBusy ? 'Creating account…' : 'Continue' },
      kyc: { header: 1, canBack: 1, title: 'KYC verification', sub: 'Step 3 of 3', prog3: 3, step: 'STEP 3 OF 3 · KYC', prog: '100%', cta: s.kycBusy ? 'Submitting…' : 'Submit for review' },
      kycDoc: { header: 1, canBack: 1, title: 'Upload document', sub: 'Document ' + (kycPos + 1) + ' of ' + Math.max(1, kycIds.length), cta: s.kycUploading ? 'Uploading…' : s.kyc[s.kycDocId] ? 'Save and continue' : 'Upload to continue', ctaOpacity: s.kycUploading || !s.kyc[s.kycDocId] ? 0.45 : 1 },
      kycDone: { cta: s.returnTo ? 'Continue where you left off' : 'Go to home', ownCta: 1 },
      home: { tabs: 'home' }, cats: { tabs: 'buy', title: 'Buy minerals', cartBtn: 1 },
      minerals: { tabs: 'buy', header: 1, canBack: 1, title: (MB.CATS.find(c => c.id === s.cat) || { name: '' }).name, cartBtn: 1 },
      lots: { tabs: 'buy', header: 1, canBack: 1, title: MB.mineralName(s.mineral), cartBtn: 1 },
      detail: { header: 1, canBack: 1, title: 'Product details', cartBtn: 1, cta: detailP && !detailOff ? (s.cart.some(c => c.pid === detailP.id) ? 'Update cart' : 'Add to cart') : 'See other lots', ctaKind: detailP && !detailOff ? 'primary' : 'ghost', ctaIcon: detailP && !detailOff ? 'cart' : undefined },
      cart: { header: 1, canBack: 1, title: 'Cart', sub: s.cart.length ? s.cart.length + (s.cart.length === 1 ? ' lot' : ' lots') : '', cta: s.cart.length ? 'Proceed to checkout' : '' },
      checkout: { header: 1, canBack: 1, title: 'Checkout', cta: s.placing ? 'Placing order…' : 'Place order' },
      placed: { cta: 'Track order', cta2: 'Continue browsing', ownCta: 1 },
      orders: { tabs: 'orders', header: 1, title: 'Orders' }, order: { header: 1, canBack: 1, title: s.oid, sub: ord ? (ord.kind === 'sell' ? 'Sell request' : 'Buy order') : '' },
      quote: { header: 1, canBack: 1, title: 'Quotation', cta: 'Accept quotation', cta2: 'Decline quotation', cta2Fg: '#B42318' },
      contract: { header: 1, canBack: 1, title: 'E-contract', cta: 'Sign e-contract', ctaIcon: 'file' },
      payInsp: { header: 1, canBack: 1, title: 'Payment details', cta: 'Submit details' },
      sellConfirm: { header: 1, canBack: 1, title: 'Seller confirmation', cta: 'Submit form' },
      report: { header: 1, canBack: 1, title: 'Inspection reports', cta: 'Accept reports', cta2: 'Request clarification', cta2Fg: '#A1620B' },
      pay: { header: 1, canBack: 1, title: 'Make payment', cta: s.paying ? 'Processing…' : s.pmethod === 'Bitcoin' ? 'I have sent the Bitcoin' : (s.pmethod === 'Bank transfer' ? 'I have made the transfer' : 'Pay with ' + (s.pmethod || 'UPI')), ctaOpacity: s.paying ? 0.6 : 1 },
      refund: { header: 1, canBack: 1, title: 'Request a refund', cta: 'Submit refund request' },
      cancel: this.cancelMeta(),
      refunds: { header: 1, canBack: 1, title: 'Refunds' },
      receipt: { header: 1, canBack: 1, title: 'Confirm receipt', cta: 'Accept delivery', cta2: 'Raise a discrepancy', cta2Fg: '#B42318' },
      chat: { header: 1, canBack: 1, title: 'Chat with Mineral Bridge', sub: ord ? ord.id + ' · ' + MB.titleOf(ord) : '' },
      shipment: { header: 1, canBack: 1, title: 'Shipment tracking' },
      sellCats: { tabs: 'sell', title: 'Sell minerals' },
      sellForm: { header: 1, canBack: 1, title: 'Sell ' + MB.mineralName(s.draft.mineral || 'gold'), sub: (MB.catOf(s.draft.mineral || 'gold') || { name: '' }).name, cta: s.placing ? 'Submitting…' : 'Submit sell request', cta2: 'Save draft', cta2Fg: '#0E1A33' },
      sellDone: { cta: 'Track request', cta2: 'Back to home', ownCta: 1 },
      profile: { tabs: 'profile', header: 1, title: 'Profile' },
      editProfile: { header: 1, canBack: 1, title: 'Edit profile', cta: 'Save changes' },
      bizType: { header: 1, canBack: 1, title: 'Account type', cta: 'Save' },
      kycStatus: { header: 1, canBack: 1, title: 'KYC & documents', cta: u && u.kyc === 'none' ? 'Start verification' : '' },
      notifs: { tabs: '', header: 1, canBack: 1, title: 'Notifications', readAll: s.unread > 0 || s.notifs.some(n => !n.read) ? 1 : 0 }, prefs: { header: 1, canBack: 1, title: 'Notification channels' },
      help: { header: 1, canBack: 1, title: 'Help & support' },
      auctions: { header: 1, canBack: 1, title: 'Auctions' },
      auction: Object.assign({ header: 1, canBack: 1, title: 'Auction', sub: s.aid, ctaIcon: (this.aucOf() || { status: '' }).status === 'live' ? 'gavel' : undefined }, this.aucCta()),
      auctionWon: { cta: this.aucWonCta(), cta2: 'Back to auctions', ownCta: 1 },
      doc: { header: 1, canBack: 1, title: 'Document', cta: 'Download', cta2: 'Share' },
      contactOtp: { header: 1, canBack: 1, title: s.contact && s.contact.field === 'email' ? 'Verify new email' : 'Verify new number', cta: s.contactBusy ? 'Verifying…' : 'Verify and save' },
      priceVar: this.varMeta(),
      support: { header: 1, canBack: 1, title: 'Support messages', cta: 'New message' },
      supportThread: { header: 1, canBack: 1, title: s.supRef ? s.supRef : 'New message' },
    };
    const m: Meta = Object.assign({ ctaOpacity: 1, cta2Fg: '#6B6A70', tabs: '' }, M[s.screen] || {});
    if (s.placing || s.authBusy || s.kycBusy || s.contactBusy || s.varBusy) m.ctaOpacity = 0.6;
    return m;
  }

  stepOpen() {
    const o = this.order(); if (!o) return false;
    const next = MB.stages(o.kind)[o.idx + 1];
    const ok = !!next && next.screen === this.state.screen && !o.rejected && !o.cancelled && (!o.hold || o.hold === 'changes');
    if (!ok) this.flash('This step is not open yet for ' + o.id);
    return ok;
  }
  err(key: 'shipErr' | 'pfErr' | 'scErr' | 'draftErr' | 'editErr', obj: Errs) { this.setState({ [key]: obj } as Partial<AppState>); const first = Object.values(obj)[0]; if (first) this.flash(first); }

  primary() {
    const s = this.state, sc = s.screen, u = s.user;
    const bg = (p: Promise<unknown>) => { void this.task(p); };
    const H: Partial<Record<AppScreen, () => void>> = {
      auth: () => {
        if (s.authBusy) return;
        const a = s.auth, v = a.value.trim();
        if (a.mode === 'signup' && a.name.trim().length < 2) return this.setState({ authErr: 'Enter your full name' });
        const nd = v.replace(/\D/g, '').replace(/^0+/, '');
        if (a.method !== 'email' && (nd.length < 7 || nd.length > 12)) return this.setState({ authErr: 'Enter a valid WhatsApp number for ' + (a.cc || '+234') + ' (7–12 digits, without the country code)' });
        if (a.method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return this.setState({ authErr: 'Enter a valid email address' });
        this.setState({ authErr: '', otp: '', otpErr: '' });
        bg(this.remote.requestOtp());
      },
      otp: () => {
        if (s.authBusy) return;
        if (!/^\d{4}$/.test(s.otp)) return this.setState({ otpErr: 'Enter all 4 digits' });
        bg(this.remote.verifyOtp());
      },
      regType: () => {
        const r = s.reg;
        if (!r.role) return this.setState({ regErr: 'Choose buyer, seller or both' });
        if (r.role !== 'seller' && !r.buyerType) return this.setState({ regErr: 'Choose your buyer type' });
        if (r.role !== 'buyer' && !r.sellerType) return this.setState({ regErr: 'Choose your seller type' });
        this.setState({ regErr: '' }); this.go('regDetails');
      },
      regDetails: () => {
        if (s.authBusy) return;
        const r = s.reg;
        if (this.isBusiness(r) && r.business.trim().length < 2) return this.setState({ regErr: 'Enter your business or trading name' });
        if (!r.country.trim()) return this.setState({ regErr: 'Enter your country' });
        if (!resolveCountryCode(r.country)) return this.setState({ regErr: 'Choose a supported country (type its full name, e.g. Nigeria)' });
        if (!r.terms) return this.setState({ regErr: 'Accept the terms to continue' });
        if (!s.registrationToken) return this.setState({ regErr: 'Your verification expired. Go back and request a new code.' });
        this.setState({ regErr: '' });
        bg(this.remote.register());
      },
      kyc: () => {
        if (s.kycBusy) return;
        const k = s.kyc;
        const labels: Record<string, string> = { front: 'ID front', back: 'ID back', selfie: 'selfie', address: 'proof of address', biz: 'business document' };
        const need = kycRequiredDocIds(s.kycReq, k.idType, this.bizDocNeeded())
          .filter((id) => !k[id])
          .map((id) => labels[id] ?? id);
        if (need.length) return this.setState({ kycErr: 'Still needed: ' + need.join(', ') });
        const stale = (Object.keys(KYC_INFO) as KycDocId[]).filter(id => this.kycFlag(id));
        if (stale.length) return this.setState({ kycErr: 'Re-upload requested: ' + stale.map(id => KYC_INFO[id].title.toLowerCase()).join(', ') + '. Replace ' + (stale.length > 1 ? 'them' : 'it') + ' before resubmitting.' });
        if (!k.consent) return this.setState({ kycErr: 'Tick the consent box to submit' });
        this.setState({ kycErr: '' });
        bg(this.remote.submitKyc());
      },
      kycDone: () => this.resume(s.returnTo),
      auction: () => this.auctionPrimary(),
      refund: () => this.submitRefund(),
      cancel: () => this.submitCancel(),
      auctionWon: () => this.auctionToOrder(s.aid, true),
      doc: () => this.downloadDoc(),
      kycDoc: () => { if (s.kycUploading) return; if (!s.kyc[s.kycDocId]) return this.setState({ kycDocErr: 'Upload a photo or file first' }); this.flash('Document saved'); this.nextKycDoc(); },
      detail: () => { const p = MB.product(s.pid); if (p && productIsSoldOut(p)) return this.jump('cats', { cat: (MB.catOf(p.mineral) || { id: '' }).id, search: MB.mineralName(p.mineral) }); this.addToCart(); },
      cart: () => { if (!s.cart.length) return; if (!this.gate('checkout')) return; this.prefillShip(); this.go('checkout'); },
      checkout: () => this.placeOrder(),
      placed: () => { this.setState({ stack: ['orders'], screen: 'order' }); this.top(); },
      sellDone: () => { this.setState({ stack: ['orders'], screen: 'order' }); this.top(); },
      quote: () => { if (!this.stepOpen()) return; bg(this.remote.acceptQuote()); },
      contract: () => {
        if (!this.stepOpen()) return;
        if (!s.sign.read) return this.setState({ signErr: 'Confirm you have read the contract' });
        if (s.sign.name.trim().toLowerCase() !== u!.name.toLowerCase()) return this.setState({ signErr: 'Type your full name exactly as ' + u!.name });
        this.setState({ signErr: '' });
        bg(this.remote.signContract(s.sign.name));
      },
      payInsp: () => this.submitPayInsp(),
      sellConfirm: () => this.submitSellConfirm(),
      report: () => { if (!this.stepOpen()) return; bg(this.remote.acceptReports()); },
      pay: () => {
        if (s.paying || !this.stepOpen()) return;
        const method = s.pmethod || 'UPI';
        if (method === 'Bitcoin') { const tx = (s.btcTx || '').trim(); if (!/^[0-9a-fA-Fx]{16,}$/.test(tx)) return this.setState({ payErr: 'Paste the transaction ID from your wallet (at least 16 characters)' }); }
        else { const err = paymentSubmitError(method, s.payRef || '', !!s.uploads.proof.length); if (err) return this.setState({ payErr: err }); }
        this.setState({ payErr: '' });
        bg(this.remote.submitPay(method));
      },
      receipt: () => {
        if (!this.stepOpen()) return;
        const r = s.rc;
        if (!(parseFloat(r.qty) > 0)) return this.setState({ rcErr: 'Enter the quantity you received' });
        if (s.uploads.receipt.length < 1) return this.setState({ rcErr: 'Add at least one photo of the delivery' });
        this.setState({ rcErr: '' });
        bg(this.remote.confirmReceipt());
      },
      sellForm: () => this.submitSell(),
      editProfile: () => this.saveProfile(),
      bizType: () => this.saveBizType(),
      kycStatus: () => this.go('kyc'),
      contactOtp: () => {
        if (s.contactBusy) return;
        if (!/^\d{4}$/.test(s.contactCode)) return this.setState({ contactErr: 'Enter all 4 digits' });
        bg(this.remote.verifyContactChange(s.contactCode));
      },
      priceVar: () => this.decideVariation('accept'),
      support: () => this.openSupport(''),
    };
    const fn = H[sc]; if (fn) fn();
  }
  secondary() {
    const s = this.state, sc = s.screen;
    const bg = (p: Promise<unknown>) => { void this.task(p); };
    const H: Partial<Record<AppScreen, () => void>> = {
      placed: () => this.jump('cats'), sellDone: () => this.jump('home'),
      auctionWon: () => { this.setState({ stack: ['orders'], screen: 'auctions', atab: 'ended' }); this.top(); },
      cancel: () => this.back(),
      doc: () => { const d = this.docData(s.doc); Share.share({ title: d.title, message: d.title + ' ' + d.no }).catch(() => {}); },
      quote: () => { if (this.stepOpen()) this.setState({ sheet: 'declineQuote' }); },
      report: () => {
        if (!this.stepOpen()) return;
        if (s.repNote.trim().length < 5) return this.setState({ repErr: 'Describe what needs clarifying' });
        bg(this.remote.queryReports(s.repNote.trim()));
      },
      receipt: () => {
        if (!this.stepOpen()) return;
        if (s.rc.note.trim().length < 5) return this.setState({ rcErr: 'Describe the discrepancy in the note' });
        if (!(parseFloat(s.rc.qty) > 0)) return this.setState({ rcErr: 'Enter the quantity you received' });
        bg(this.remote.disputeReceipt());
      },
      sellForm: () => { this.setState({ hasDraft: true }); this.flash('Draft saved'); },
      priceVar: () => this.decideVariation('reject'),
    };
    const fn = H[sc]; if (fn) fn();
  }
  sheetVals() {
    const s = this.state, k = s.sheet, close = () => this.setState({ sheet: '' });
    const S: Record<string, [string, string, string, string, () => void]> = {
      kycPending: ['Verification still under review', 'Your KYC (' + ((s.user || { kycRef: '' }).kycRef || '') + ') is being reviewed. You can browse, but buying and selling open once it is approved.', 'View status', '#121214', () => { close(); this.go('kycStatus'); }],
      declineQuote: ['Decline this quotation?', 'Mineral Bridge will be told and can send a revised quotation. Your order stays open.', 'Decline quotation', '#B42318', () => { close(); void this.task(this.remote.declineQuote()); }],
      needSeller: ['Add selling to your account', 'Your account is set up for buying only. Choose a seller type to sell to Mineral Bridge. Your draft is kept.', 'Add seller type', '#121214', () => { close(); this.setState(x => ({ reg: Object.assign({}, x.reg, { role: 'both' as const, buyerType: x.user!.buyerType || '', sellerType: '' }), regErr: '' })); this.go('bizType'); }],
      needBuyer: ['Add buying to your account', 'Your account is set up for selling only. Choose a buyer type to place orders. Your cart is kept.', 'Add buyer type', '#121214', () => { close(); this.setState(x => ({ reg: Object.assign({}, x.reg, { role: 'both' as const, buyerType: '', sellerType: x.user!.sellerType || '' }), regErr: '' })); this.go('bizType'); }],
      rejectVariation: ['Reject this price?', 'Mineral Bridge will be told and the order is paused while they review it with you. Your note is shared with them.', 'Reject price', '#B42318', () => { close(); void this.task(this.remote.decideVariation('reject', this.state.varNote)); }],
      logout: ['Log out?', 'You will need a verification code to sign in again.', 'Log out', '#B42318', () => { close(); this.jump('welcome', { returnTo: '' }); void this.task(this.remote.logout()); }],
      discardDraft: ['Discard this draft?', 'Photos and details you entered will be removed.', 'Discard draft', '#B42318', () => { close(); this.setState(x => ({ hasDraft: false, draft: emptyDraft(), uploads: { ...x.uploads, sellPhotos: [], sellDocs: [] } })); this.flash('Draft discarded'); }],
    };
    const v = S[k];
    if (!v) return { open: false as const, title: '', body: '', cta: '', bg: '', confirm: () => {} };
    return { open: true as const, title: v[0], body: v[1], cta: v[2], bg: v[3], confirm: v[4] };
  }

  unitOf(p: Product) { const q = this.state.qu; return UF[p.unit] && q && q.pid === p.id && UF[q.u] ? q.u : p.unit; }
  conv(v: number, from: string, to: string) { return UF[from] && UF[to] ? +(v * UF[from] / UF[to]).toFixed(6) : v; }
  addToCart() {
    const s = this.state, p = MB.product(s.pid), qIn = parseFloat(s.qty);
    if (!p) return;
    const u = this.unitOf(p), q = this.conv(qIn, u, p.unit), nf = (v: number) => MB.num(+v.toFixed(6));
    if (productIsSoldOut(p)) return this.flash('This lot is no longer available');
    if (!(qIn > 0)) return this.setState({ qtyErr: 'Enter a quantity' });
    if (q < p.min) return this.setState({ qtyErr: 'Minimum order is ' + nf(this.conv(p.min, p.unit, u)) + ' ' + u + (u !== p.unit ? ' (' + p.min + ' ' + p.unit + ')' : '') });
    if (p.avail > 0 && q > p.avail) return this.setState({ qtyErr: 'Only ' + nf(this.conv(p.avail, p.unit, u)) + ' ' + u + ' available' + (u !== p.unit ? ' (' + p.avail + ' ' + p.unit + ')' : '') });
    const had = s.cart.some(c => c.pid === p.id);
    void this.task(this.remote.cartPut(p.id, qIn, u, q).then(ok => { if (!ok) return; this.flash(had ? 'Cart quantity updated' : 'Added to cart'); this.go('cart'); }));
  }
  prefillShip() {
    const s = this.state, u = s.user, last = s.orders.find(o => o.kind === 'buy' && o.addr);
    if (s.ship.street) return;
    this.setState({ ship: last && last.addr ? Object.assign({}, last.addr) : { org: (u && u.business !== 'Individual' && u.business) || '', street: '', city: '', country: (u && u.country) || '', contact: (u && u.name) || '', mobile: (u && u.phone) || '' }, shipErr: {} });
  }
  placeOrder() {
    const s = this.state;
    if (s.placing) return;
    if (!this.gate('checkout')) return;
    const e: Errs = {}, sh = s.ship as unknown as Record<string, string>;
    [['org', 'Company / receiver name'], ['street', 'Street address'], ['city', 'City'], ['country', 'Country'], ['contact', 'Contact person']].forEach(([k, l]) => { if (!String(sh[k] || '').trim()) e[k] = l + ' is required'; });
    if (String(sh.mobile || '').replace(/\D/g, '').length < 9) e.mobile = 'Mobile needs at least 9 digits';
    if (!e.country && !resolveCountryCode(sh.country)) e.country = 'Enter the delivery country as a full country name';
    if (Object.keys(e).length) return this.err('shipErr', e);
    const bad = s.cart.find(c => { const p = MB.product(c.pid); return !!c.issue || (!!p && (productIsSoldOut(p) || (p.avail > 0 && c.qty > p.avail))); });
    if (bad) return this.flash('A cart item is no longer available in that quantity');
    if (!s.cart.length) return this.flash('Your cart is empty');
    this.setState({ shipErr: {} });
    void this.task(this.remote.placeOrder());
  }
  submitPayInsp() {
    if (!this.stepOpen()) return;
    const f = this.state.pf, e: Errs = {};
    if (!f.method) e.method = 'Choose a payment method';
    if (!f.terms) e.terms = 'Choose payment terms';
    if (!f.billName.trim()) e.billName = 'Billing name is required';
    if (!f.billAddr.trim()) e.billAddr = 'Billing address is required';
    if (!f.c1) e.c = 'Tick the confirmation';
    if (Object.keys(e).length) return this.err('pfErr', e);
    void this.task(this.remote.submitBuyerForm());
  }
  submitSellConfirm() {
    if (!this.stepOpen()) return;
    const f = this.state.sc, e: Errs = {};
    if (!f.method) e.method = 'Choose how you want to be paid';
    if (!f.bank.trim()) e.bank = f.method === 'UPI' ? 'Account holder name is required' : 'Bank / wallet name is required';
    if (f.method === 'UPI') { if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.account.trim())) e.account = 'Enter a valid UPI ID, e.g. name@okbank'; } else if (f.account.trim().length < 6) e.account = 'Enter a valid account or wallet number';
    if (!f.date) e.date = 'Choose an inspection date';
    if (!f.time) e.time = 'Choose a time';
    if (!f.address.trim()) e.address = 'Inspection location is required';
    if (!f.c1) e.c = 'Tick the confirmation';
    if (Object.keys(e).length) return this.err('scErr', e);
    void this.task(this.remote.submitSellerForm());
  }
  prefillForms(o: Order) {
    const s = this.state, u = s.user || EMPTY_USER, f = o.form || {};
    if (!s.pf.billName) this.setState(x => ({ pf: Object.assign({}, x.pf, { billName: u.business === 'Individual' ? u.name : u.business, billAddr: o.addr ? o.addr.street + ', ' + o.addr.city : '', address: f.address || '', contact: u.name, mobile: u.phone || '' }) }));
  }
  submitSell() {
    const s = this.state, d = s.draft, e: Errs = {};
    if (s.placing) return;
    if (!d.mineral) e.mineral = 'Choose a mineral';
    if (s.uploads.sellPhotos.length < 3) e.photos = 'Add at least 3 photos (' + s.uploads.sellPhotos.length + ' added)';
    if (!(parseFloat(d.qty) > 0)) e.qty = 'Enter the quantity';
    if (!d.grade.trim()) e.grade = 'Enter the quality or grade';
    if (d.details.trim().length < 10) e.details = 'Describe the mineral in a sentence or two';
    if (Object.keys(e).length) return this.err('draftErr', e);
    if (!this.gate('sellForm')) { this.setState({ hasDraft: true }); return; }
    void this.task(this.remote.submitSell());
  }
  saveProfile() {
    const s = this.state, f = s.edit || { name: '', business: '', email: '', phone: '', country: '' }, e: Errs = {};
    if ((f.name || '').trim().length < 2) e.name = 'Enter your full name';
    if ((f.business || '').trim().length < 2 && this.bizDocNeeded()) e.business = 'Enter your business name';
    // Phone and email are not part of PATCH /me: they change only through startContactChange (OTP-verified).
    if (f.country && f.country.trim() && !resolveCountryCode(f.country)) e.country = 'Enter a full country name';
    if (Object.keys(e).length) return this.err('editErr', e);
    void this.task(this.remote.saveProfile(f));
  }
  saveBizType() {
    const r = this.state.reg;
    if (!r.role) return this.setState({ regErr: 'Choose buyer, seller or both' });
    if (r.role !== 'seller' && !r.buyerType) return this.setState({ regErr: 'Choose your buyer type' });
    if (r.role !== 'buyer' && !r.sellerType) return this.setState({ regErr: 'Choose your seller type' });
    void this.task(this.remote.saveBizType());
  }

  /** Start a phone/email change: validates the new value, then asks the server to send a code to it. */
  startContactChange(field: 'phone' | 'email', channel: OtpChannel, raw: string) {
    const s = this.state, u = s.user;
    if (s.contactBusy) return;
    const v = raw.trim();
    if (field === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return this.err('editErr', { email: 'Enter a valid email address' });
      if (u && v.toLowerCase() === (u.email || '').toLowerCase()) return this.err('editErr', { email: 'That is already your email' });
    } else {
      const id = contactIdentifier(channel, v, s.auth.cc);
      const n = id.replace(/\D/g, '').length;
      if (n < 9 || n > 15) return this.err('editErr', { phone: 'Enter a valid number (9–15 digits, with the country code if it is not ' + (s.auth.cc || '+234') + ')' });
      if (u && id === u.phone) return this.err('editErr', { phone: 'That is already your number' });
    }
    this.setState({ editErr: {} });
    void this.task(this.remote.startContactChange(channel, contactIdentifier(channel, v, s.auth.cc)));
  }

  // ---- Price variation (sell orders)
  varMeta(): Partial<Meta> {
    const pv = pendingVariation(this.order());
    return { header: 1, canBack: 1, title: 'Price update', cta: pv ? (this.state.varBusy ? 'Submitting…' : 'Accept new price') : '', cta2: pv ? 'Reject new price' : '', cta2Fg: '#B42318' };
  }
  decideVariation(decision: 'accept' | 'reject') {
    const s = this.state, o = this.order();
    if (s.varBusy) return;
    if (!o || !pendingVariation(o)) return this.flash('There is no price update waiting for your answer');
    this.setState({ varErr: '' });
    if (decision === 'reject') return this.setState({ sheet: 'rejectVariation' });
    void this.task(this.remote.decideVariation('accept', s.varNote));
  }

  // ---- Support inbox
  openSupport(ref: string) { this.go('supportThread', { supRef: ref, supThread: null, supMsg: '', supErr: '' }); }
  sendSupport() {
    const s = this.state, t = s.supMsg.trim();
    if (s.supBusy) return;
    if (!t) return;
    void this.task(s.supRef ? this.remote.sendSupportMessage(s.supRef, t) : this.remote.createSupportThread(t));
  }

  // ---- Catalogue documents
  /** Open a lot document from the API (signed URL). Falls back to the on-device document view when the lot has none. */
  openProductDoc(p: Product, type: ProductDocumentType, t: string, download = false) {
    void this.task(this.remote.openProductDocument(p.id, type, download).then(ok => { if (ok === false) { if (download) this.downloadDoc({ t, pid: p.id }); else this.openDoc({ t, pid: p.id }); } }));
  }

  // ---- KYC
  saveKycFile(file: { uri: string; fileName?: string; fileSize?: number; type?: string }) {
    const id = this.state.kycDocId, sz = file.fileSize || 0;
    if (sz > 10 * 1048576) return this.setState({ kycDocErr: 'File is larger than 10 MB. Choose a smaller file.' });
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.fileName || '');
    if (!isPdf && file.type && !/^image\//.test(file.type)) return this.setState({ kycDocErr: 'Use a JPG, PNG or PDF file.' });
    if (isPdf && id === 'selfie') return this.setState({ kycDocErr: 'A selfie must be a photo.' });
    const rec: KycFile = { kind: isPdf ? 'pdf' : 'img', src: isPdf ? '' : file.uri, name: file.fileName || (id + (isPdf ? '.pdf' : '.jpg')), size: fmtBytes(sz), at: Date.now() };
    void this.task(this.remote.uploadKycDoc(id, file, rec));
  }
  removeKycFile(id: KycDocId) { void this.task(this.remote.removeKycDoc(id)); }
  setIdType(label: string) { void this.task(this.remote.setKycIdType(label)); }
  setConsent(v: boolean) { void this.task(this.remote.setKycConsent(v)); }
  nextKycDoc() {
    const s = this.state, k = s.kyc;
    const ids = kycRequiredDocIds(s.kycReq, k.idType, this.bizDocNeeded());
    const nxt = ids.find(id => !k[id] && id !== s.kycDocId);
    if (nxt) { this.setState({ kycDocId: nxt, kycDocErr: '' }); this.top(); } else this.back();
  }
  isBusiness(r: { role?: string; buyerType?: string; sellerType?: string }) {
    const NON: Record<string, number> = { investor: 1, asm: 1, scrap: 1 };
    const types = [r.role !== 'seller' ? r.buyerType : '', r.role !== 'buyer' ? r.sellerType : ''].filter(Boolean) as string[];
    return types.some(t => !NON[t]);
  }
  bizDocNeeded() { return this.isBusiness(this.state.user || {}); }
  kycFlag(id: KycDocId) { const u = this.state.user, fl = u && u.kycFlags ? u.kycFlags[id] : undefined, f = this.state.kyc[id]; if (!fl) return ''; return f && f.at > fl[1] ? '' : fl[0]; }

  // ---- Auctions
  aucOf(id?: string) { return (this.state.auctions || []).find(a => a.id === (id || this.state.aid)); }
  aucCur(a: Auction) { return a.bids.length ? a.bids[a.bids.length - 1].amt : a.start; }
  aucInc(a: Auction) { return a.inc && a.inc > 0 ? a.inc : 500; }
  aucMin(a: Auction) { if (a.minNext && a.minNext > 0) return a.minNext; return a.bids.length ? this.aucCur(a) + this.aucInc(a) : a.start; }
  patchAuc(id: string, fn: (a: Auction) => Auction) { this.setState(x => ({ auctions: x.auctions.map(a => (a.id === id ? fn(JSON.parse(JSON.stringify(a))) : a)) })); }
  left(ms: number) { if (ms <= 0) return '00:00:00'; const h = Math.floor(ms / 36e5), mi = Math.floor(ms % 36e5 / 6e4), se = Math.floor(ms % 6e4 / 1e3), p = (n: number) => String(n).padStart(2, '0'); return h >= 24 ? Math.floor(h / 24) + 'd ' + p(h % 24) + 'h' : p(h) + ':' + p(mi) + ':' + p(se); }
  aucCta(): Partial<Meta> {
    const a = this.aucOf(); if (!a) return {};
    if (a.status === 'live') return { cta: 'Place bid · ' + MB.money(parseFloat(this.state.bidAmt) || this.aucMin(a)) };
    if (a.status === 'upcoming') return { cta: this.state.reminders[a.id] ? 'Reminder on · tap to cancel' : 'Remind me when it opens' };
    if (a.result === 'won') return { cta: this.aucUnpaid(a) ? 'Pay now · ' + MB.money(this.aucCur(a)) : 'Track order ' + (a.orderId || '') };
    return { cta: 'Browse similar lots' };
  }
  openAuction(id: string) {
    const a = this.aucOf(id);
    // BUG-017: restore server auto-bid ceiling instead of always clearing the toggle.
    const max = a && (a.autoMax ?? 0) > 0 ? String(a.autoMax) : '';
    this.go('auction', { aid: id, bidAmt: a ? String(this.aucMin(a)) : '', bidErr: '', autoOn: !!max, autoMax: max });
  }
  auctionPrimary() {
    const s = this.state, a = this.aucOf(); if (!a) return;
    if (a.status === 'upcoming') { if (!this.gate('auction')) return; void this.task(this.remote.toggleReminder(a, !s.reminders[a.id])); return; }
    if (a.status === 'ended') {
      if (a.result === 'won') return this.aucUnpaid(a) ? this.auctionToOrder(a.id, true) : this.go('order', { oid: a.orderId });
      const p = MB.product(a.pid);
      return this.jump('cats', { cat: '', search: p ? MB.mineralName(p.mineral) : '' });
    }
    if (!this.gate('auction')) return;
    const amt = Math.round(parseFloat(String(s.bidAmt).replace(/[^\d.]/g, ''))), min = this.aucMin(a), inc = this.aucInc(a);
    if (!(amt > 0)) return this.setState({ bidErr: 'Enter your bid amount' });
    if (amt < min) return this.setState({ bidErr: 'Minimum bid is ' + MB.money(min) });
    if (amt % inc) return this.setState({ bidErr: 'Bids go up in steps of ' + MB.money(inc) });
    let max = 0;
    if (s.autoOn) { max = Math.round(parseFloat(String(s.autoMax).replace(/[^\d.]/g, ''))); if (!(max >= amt)) { max = 0; this.setState({ autoOn: false, autoMax: '' }); setTimeout(() => this.flash('Bid placed · auto-bid turned off because its limit was below this bid'), 0); } }
    void this.task(this.remote.placeBid(a, amt, max));
  }
  /** DEVELOPMENT ONLY: a fake competing bid for UI testing. Never sent to the server. */
  simOutbid() {
    if (!__DEV__) return;
    const a = this.aucOf(); if (!a || a.status !== 'live') return;
    const other = this.aucCur(a) + this.aucInc(a) * (1 + Math.floor(Math.random() * 3));
    this.patchAuc(a.id, c => {
      c.bids.push({ who: 'Bidder ' + (1000 + Math.floor(Math.random() * 9000)), amt: other, at: Date.now() });
      if (c.mine) { c.outbid = true; c.leading = false; }
      return c;
    });
    this.setState({ bidAmt: String(this.aucMin(this.aucOf(a.id)!)) });
  }
  /** DEVELOPMENT ONLY: end the auction locally. The server decides real outcomes. */
  endAuction(id: string, silent?: boolean) {
    if (!__DEV__) return;
    const a = this.aucOf(id); if (!a || a.status !== 'live') return;
    const last = a.bids[a.bids.length - 1], won = !!last && last.who === 'You', mine = a.bids.some(b => b.who === 'You');
    this.patchAuc(a.id, c => { c.status = 'ended'; c.endsAt = Math.min(c.endsAt, Date.now()); c.result = won ? 'won' : mine ? 'lost' : 'closed'; c.outbid = false; return c; });
    if (won) { if (this.state.screen === 'auction' && this.state.aid === id) this.go('auctionWon'); } else if (!silent || mine) this.flash(mine ? 'Auction ended · another bidder won' : 'Auction ended');
  }
  aucUnpaid(a?: Auction) { if (!a || a.result !== 'won') return false; const o = a.orderId && this.state.orders.find(x => x.id === a.orderId); if (!o) return true; return o.idx < MB.stages('buy').findIndex(x => x.key === 'paid') && !o.rejected; }
  aucWonCta() { const a = this.aucOf(); return a && this.aucUnpaid(a) ? 'Pay now · ' + MB.money(this.aucCur(a)) : 'Track order'; }
  auctionToOrder(id: string, toPay: boolean) {
    const a = this.aucOf(id); if (!a || a.result !== 'won') return;
    if (a.orderId) { if (toPay && this.aucUnpaid(a)) { this.setState({ stack: ['orders', 'order'], screen: 'pay', oid: a.orderId, payErr: '' }); this.top(); return; } return this.go('order', { oid: a.orderId }); }
    void this.task(this.remote.auctionToOrder(a, toPay));
  }
  myAucs() { const s = this.state; return (s.auctions || []).filter(a => a.mine || a.bids.some(b => b.who === 'You') || s.reminders[a.id]).sort((a, b) => (Number(b.result === 'won') - Number(a.result === 'won')) || (Number(b.status === 'live') - Number(a.status === 'live'))); }

  // ---- Refunds & cancellation
  refundable(o?: Order) {
    if (!o || o.kind !== 'buy' || o.rejected || o.cancelled || o.refunded) return false;
    const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
    if (o.idx < pi || !st[o.idx + 1]) return false;
    if (o.refund && !['declined', 'refunded'].includes(o.refund.status)) return false;
    if (o.refund && o.refund.status === 'refunded' && o.refund.type === 'full') return false;
    return !o.hold || o.hold === 'discrepancy';
  }
  /** A client-side helper exchange in the chat (guidance toward the refund form). Never sent to the server. */
  chatSay(o: Order, mine: string, reply: string, action?: string, ctx?: string, echo = true) {
    const now = Date.now();
    this.setState(x => ({ msg: '', chat: Object.assign({}, x.chat, { [o.id]: [...(x.chat[o.id] || []), ...(echo ? [{ me: true, text: mine, at: now, local: true }] : []), { me: false, text: reply, at: now + 1, action: action || '', ctx: ctx || '', local: true }] }) }));
  }
  chatRefund(o: Order, disc?: boolean, typed?: string, echo = true) {
    const mine = typed || (disc ? 'I would like a refund for the difference in my delivery.' : 'I would like to request a refund for ' + o.id + '.');
    if (!this.refundable(o)) {
      const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
      const inProg = !!o.refund && !['declined', 'refunded'].includes(o.refund.status);
      const why = o.kind !== 'buy' ? 'Sell requests are paid to you, so there is nothing to refund. If a payment to you is wrong, tell us here and we will check it.' : o.idx < pi ? 'Nothing has been paid on ' + o.id + ' yet, so there is nothing to refund. You can decline the quotation or cancel before paying.' : inProg ? 'Refund ' + o.refund!.ref + ' is already in progress. I will update you here.' : !MB.stages('buy')[o.idx + 1] ? o.id + ' is completed, so refunds are closed. If something is wrong, describe it here and our team will review it.' : 'A refund cannot be requested on ' + o.id + ' at this stage. Our team will help you here.';
      return this.chatSay(o, mine, why, inProg ? 'trackRefund' : '', undefined, echo);
    }
    const paid = (o.quote ? o.quote.total : 0) - (o.refundedSoFar || 0);
    this.chatSay(o, mine, 'You can request ' + (disc ? 'a partial refund for the missing or damaged quantity' : 'a full or partial refund of up to ' + MB.money(paid)) + ' on ' + o.id + '. Fill in the refund form and we will review it within 2 working days. The order is paused while we review.', 'refund', disc ? 'Delivery discrepancy: ' + ((o.disc || { note: '' }).note || '') : (typed || ''), echo);
  }
  /** Send a typed message to Mineral Bridge on the order chat. */
  sendChat(o: Order, text: string) { void this.task(this.remote.sendChat(o, text)); }
  cancelInfo(o?: Order): { mode: 'none' | 'free' | 'refund' } {
    if (!o || o.rejected || o.cancelled || this.view(o).done) return { mode: 'none' };
    const srv = this.state.om[o.id]?.cancelInfo;
    if (srv && srv.mode) return { mode: srv.mode };
    const st = MB.stages(o.kind), at = (k: string) => st.findIndex(x => x.key === k);
    if (o.hold && !['changes', 'quoteDeclined', 'clarify'].includes(o.hold)) return { mode: 'none' };
    if (o.kind === 'sell') return o.idx < at('schedule') ? { mode: 'free' } : { mode: 'none' };
    if (o.auction) return { mode: 'none' };
    if (o.idx < at('paid')) return { mode: 'free' };
    if (o.idx < at('picked') && this.refundable(o)) return { mode: 'refund' };
    return { mode: 'none' };
  }
  cancelMeta(): Partial<Meta> {
    const o = this.order(), ci = this.cancelInfo(o), sell = !!o && o.kind === 'sell';
    return { header: 1, canBack: 1, title: sell ? 'Cancel sell request' : 'Cancel order', cta: ci.mode === 'refund' ? 'Cancel and continue to refund' : sell ? 'Cancel sell request' : 'Cancel order', cta2: sell ? 'Keep sell request' : 'Keep order' };
  }
  openCancel(o?: Order) {
    const ci = this.cancelInfo(o);
    if (!o || ci.mode === 'none') return this.flash('This order can no longer be cancelled. Contact support for help.');
    this.setState({ cx: { reason: '', note: '', agree: false }, cxErr: '' }); this.go('cancel', { oid: o.id });
  }
  submitCancel() {
    const s = this.state, o = this.order(), ci = this.cancelInfo(o), c = s.cx || { reason: '', note: '', agree: false };
    if (!o || ci.mode === 'none') return this.flash('This order can no longer be cancelled');
    if (!c.reason) return this.setState({ cxErr: 'Choose a reason' });
    if (c.reason === 'Other' && (c.note || '').trim().length < 10) return this.setState({ cxErr: 'Tell us why in at least 10 characters' });
    if (!c.agree) return this.setState({ cxErr: 'Tick the box to confirm' });
    const why = c.reason + ((c.note || '').trim() ? ': ' + c.note.trim() : '');
    if (ci.mode === 'refund') {
      const rr = REFUND_REASONS.find(x => /longer|cancel/i.test(x)) || REFUND_REASONS[REFUND_REASONS.length - 1];
      this.openRefund(o, { reason: rr, note: 'Cancel before dispatch · ' + why, type: 'full' });
      this.setState(x => ({ stack: x.stack.filter(k => k !== 'cancel'), cancelRefund: o.id }));
      return this.flash('Your order is cancelled once the full refund is approved');
    }
    void this.task(this.remote.cancelOrder(c.reason, (c.note || '').trim()));
  }
  openRefund(o?: Order, pre?: Partial<AppState['rf']>) {
    if (!o) return;
    if (!this.refundable(o)) {
      const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
      return this.flash(o.kind !== 'buy' ? 'Sell requests are paid to you, so they cannot be refunded' : o.idx < pi ? 'Nothing has been paid on ' + o.id + ' yet' : o.refund && !['declined', 'refunded'].includes(o.refund.status) ? 'Refund ' + o.refund.ref + ' is already in progress' : 'A refund cannot be requested on ' + o.id + ' now');
    }
    this.setState({ oid: o.id, rfErr: '', rf: Object.assign(emptyRefund(), pre || {}), rfFieldErr: {}, cancelRefund: '' });
    this.go('refund', { oid: o.id });
  }
  submitRefund() {
    const s = this.state, o = this.order(), r = s.rf;
    if (!o || !this.refundable(o)) return this.flash('A refund can’t be requested on this order right now');
    const paid = (o.quote ? o.quote.total : 0) - (o.refundedSoFar || 0);
    if (!r.reason) return this.setState({ rfErr: 'Choose a reason' });
    if (r.note.trim().length < 10) return this.setState({ rfErr: 'Describe what happened in at least 10 characters' });
    if (r.type === 'partial') { const amount = parseFloat(String(r.amount).replace(/[^\d.]/g, '')); if (!(amount > 0)) return this.setState({ rfErr: 'Enter the amount to refund' }); if (paid > 0 && amount >= paid) return this.setState({ rfErr: 'A partial refund must be less than ' + MB.money(paid) + '. Choose full refund instead.' }); }
    const fe: Errs = {}, v = (k: keyof typeof r) => String(r[k] || '').trim();
    if (r.dest === 'bank') { if (v('holder').length < 2) fe.holder = 'Enter the account holder name'; if (v('bank').length < 2) fe.bank = 'Enter the bank name'; if (!/^\d{6,18}$/.test(v('account').replace(/\s/g, ''))) fe.account = 'Enter a 6–18 digit account number'; if (v('account2').replace(/\s/g, '') !== v('account').replace(/\s/g, '')) fe.account2 = 'Account numbers do not match'; if (!/^[A-Za-z0-9]{6,11}$/.test(v('code'))) fe.code = 'Enter a valid IFSC (11), SWIFT (8 or 11) or sort code'; if (v('country').length < 2) fe.country = 'Enter the bank country'; }
    if (r.dest === 'upi') { if (!/^[\w.-]{2,}@[A-Za-z]{2,}$/.test(v('upi'))) fe.upi = 'Enter a valid UPI ID, like name@bank'; if (v('upiName').length < 2) fe.upiName = 'Enter the name on the UPI account'; }
    if (r.dest === 'btc') { if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v('addr'))) fe.addr = 'Enter a valid Bitcoin address (starts with bc1, 1 or 3)'; if (v('addr2') !== v('addr')) fe.addr2 = 'Addresses do not match'; }
    if (Object.keys(fe).length) return this.setState({ rfFieldErr: fe, rfErr: 'Check the ' + ({ bank: 'bank account', upi: 'UPI', btc: 'wallet', original: '' }[r.dest]) + ' details' });
    if (!r.agree) return this.setState({ rfErr: 'Tick the confirmation to submit' });
    this.setState({ rfErr: '', rfFieldErr: {} });
    void this.task(this.remote.createRefund(o));
  }

  // ---- Documents
  openDoc(spec: DocSpec) { this.go('doc', { doc: spec }); }

  /** Map a rendered API document (`GET /documents/:number`) into the screen shape. */
  apiDocData(j: Record<string, unknown>, num: string): DocData {
    const val = (v: unknown): string => {
      if (v == null || v === '') return '—';
      if (typeof v === 'object') { const m = v as { amountMinor?: number; amount?: number; currency?: string }; if (m.amountMinor != null || (m.amount != null && m.currency)) return MB.money(moneyMajor(m as never)); return JSON.stringify(v); }
      return String(v);
    };
    const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
    const parties: [string, string][] = Object.entries(rec(j.parties)).filter(([k, v]) => v != null && v !== '' && k !== 'userId').map(([k, v]) => [k.replace(/([A-Z])/g, ' $1').toUpperCase(), val(v)]);
    const secs = Array.isArray(j.sections) ? (j.sections as { heading?: string; rows?: { label?: string; value?: unknown }[] }[]) : [];
    const issued = j.issuedAt ? Date.parse(String(j.issuedAt)) : NaN;
    return {
      title: String(j.title || 'Document'), no: String(j.number || num), date: Number.isFinite(issued) ? MB.fmt(issued) : '—', status: String(j.status || '').toUpperCase(),
      issuer: 'MINERAL BRIDGE LTD', signer: 'Mineral Bridge Operations', signerRole: 'AUTHORISED SIGNATORY', note: '', parties,
      sections: secs.map(sec => ({ h: String(sec.heading || '').toUpperCase(), rows: (sec.rows || []).map(r => ({ k: String(r.label || ''), v: val(r.value), w: 500 as const, mono: false })) })),
    };
  }

  docData(spec?: DocSpec): DocData {
    const s = this.state, u = s.user || EMPTY_USER, sp: DocSpec = spec || { t: '' };
    if (sp.num && s.docs[sp.num]) return s.docs[sp.num];
    const o = sp.oid ? s.orders.find(x => x.id === sp.oid) : undefined, p = sp.pid ? MB.product(sp.pid) : undefined;
    const R = (k: string, v: unknown, strong?: boolean) => ({ k, v: String(v == null || v === '' ? '—' : v), w: (strong ? 700 : 500) as 500 | 700, mono: !!strong });
    const items = o && o.kind === 'buy' ? o.items.map(it => [MB.product(it.pid) || ({} as Product), it] as const) : [];
    const lines = o ? (o.kind === 'sell' && o.sell ? [R(o.sell.name, o.sell.qty + ' ' + o.sell.unit + (o.sell.grade ? ' · ' + o.sell.grade : ''))] : items.map(([x, it]) => R((it.name || x.name || it.pid), (it.uIn && it.uIn !== MB.unitOfItem(it) ? it.qIn + ' ' + it.uIn : it.qty + ' ' + MB.unitOfItem(it)) + (x.lab ? ' · ' + x.grade : '')))) : [];
    const pp: [string, string][] = o && o.kind === 'sell' ? [['SELLER', u.name + ' · ' + u.business], ['BUYER', 'Mineral Bridge Ltd']] : [['BUYER', u.name + ' · ' + u.business], ['SELLER', 'Mineral Bridge Ltd']];
    type D = Partial<DocData> & Pick<DocData, 'title' | 'no' | 'date' | 'status' | 'parties' | 'sections'>;
    // Only documents that are built from real order/product fields live here. Everything issued by the platform
    // (quotation, e-contract, receipts, invoices, reports, PODs...) is rendered by the API (`sp.num`).
    const D: Record<string, () => D> = {
      refund: () => { const r = [...(o!.history || []), o!.refund].find(x => x && x.ref === sp.ref) || o!.refund!; return { title: 'Refund receipt', no: r.ref, date: MB.fmt((r.at_refunded as number) || r.at), status: String(r.status).toUpperCase(), parties: [['REFUNDED TO', u.name + ' · ' + r.to], ['FROM', 'Mineral Bridge Ltd']], sections: [{ h: 'REFUND', rows: [R('Order', o!.id), R('Type', r.type === 'full' ? 'Full refund' : 'Partial refund'), R('Reason', r.reason), R('Bank reference', r.bankRef), R('Amount', MB.money(r.amount), true)] }] }; },
      cancel: () => ({ title: 'Cancellation confirmation', no: 'CX-' + o!.id.slice(-5), date: MB.fmt(o!.cancelled!.at), status: 'CANCELLED', parties: pp, sections: [{ h: o!.kind === 'sell' ? 'SELL REQUEST' : 'ORDER', rows: lines.concat([R('Reference', o!.id), R('Cancelled by', u.name), R('Reason', o!.cancelled!.reason + (o!.cancelled!.note ? ' · ' + o!.cancelled!.note : ''))]) }], note: 'Any quotation and e-contract on this ' + (o!.kind === 'sell' ? 'sell request' : 'order') + ' are withdrawn.' }),
      lotReport: () => ({ title: 'Test report', no: p!.cert, date: '—', status: p!.cert ? 'CERTIFIED' : '', issuer: String(p!.lab || '').toUpperCase(), parties: [['LABORATORY', p!.lab || '—'], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'RESULTS', rows: [R('Form', p!.form), R('Purity / grade', p!.grade, true)] }], signer: p!.lab, signerRole: 'AUTHORISED ANALYST' }),
      lotCoa: () => ({ title: 'Certificate of analysis', no: p!.cert, date: '—', status: p!.cert ? 'VALID' : '', issuer: String(p!.lab || '').toUpperCase(), parties: [['ISSUED BY', p!.lab || '—'], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'CERTIFIED VALUES', rows: [R('Available quantity', p!.avail + ' ' + p!.unit), R('Origin', p!.origin), R('Grade', p!.grade, true)] }], signer: p!.lab, signerRole: 'CERTIFYING OFFICER' }),
      lotOrigin: () => ({ title: 'Origin declaration', no: 'OD-' + p!.id, date: '—', status: '', parties: [['ORIGIN', p!.origin], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'DECLARATION', rows: [R('Mine of origin', String(p!.origin || '').split(' · ')[0])] }] }),
    };
    const fn = D[sp.t] as (() => D) | undefined;
    let d: D | null = null;
    try { d = fn && (o || p) ? fn() : null; } catch { d = null; }
    if (!d) return { title: sp.num && s.docLoading ? 'Loading document…' : 'Document unavailable', no: '', date: '—', status: '', parties: [], sections: [], issuer: '', signer: '', signerRole: '', note: sp.num && s.docLoading ? '' : 'This document is not available yet.' };
    return Object.assign({ issuer: 'MINERAL BRIDGE LTD', signer: 'Mineral Bridge Operations', signerRole: 'AUTHORISED SIGNATORY', note: '' }, d) as DocData;
  }
  docFile(d: DocData) { return ((d.title + ' ' + (d.no || '')).trim().replace(/[^\w-]+/g, '-')) + '.html'; }
  docText(d: DocData) {
    const out: string[] = ['MINERAL BRIDGE · ' + d.issuer + ' · ' + d.no, '', d.title, 'Issued ' + d.date + (d.status ? ' · ' + d.status : ''), ''];
    d.parties.forEach(([k, v]) => out.push(k + ': ' + v));
    d.sections.forEach(sec => { out.push('', sec.h); sec.rows.forEach(r => out.push(r.k + ': ' + r.v)); });
    if (d.note) out.push('', d.note);
    out.push('', d.signer, d.signerRole);
    return out.join('\n');
  }
  downloadDoc(spec?: DocSpec) {
    const sp = spec || this.state.doc;
    if (sp && sp.num && !this.state.docs[sp.num]) { void this.task(this.remote.loadDoc(sp.num).then(() => { if (this.state.docs[sp.num as string]) this.downloadDoc(sp); })); return; }
    const d = this.docData(sp);
    if (!d.no) return this.flash('This document is not available yet');
    const file = this.docFile(d);
    Share.share({ title: file, message: this.docText(d) })
      .then(r => { if (r.action !== Share.dismissedAction) this.flash('Downloaded ' + file); })
      .catch(() => this.flash('Download failed. Try again.'));
  }

  /** DEVELOPMENT ONLY: wipe in-memory state. Does not touch the server session. */
  resetDemo() { if (!__DEV__) return; this.state = fresh(); this.version++; this.listeners.forEach(l => l()); this.flash('Local state reset'); }
}
