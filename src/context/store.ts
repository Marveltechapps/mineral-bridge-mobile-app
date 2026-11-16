// Mineral Bridge app store: a direct port of the design prototype's logic
// (navigation stack, order stage engine, KYC, auctions, refunds, documents).
// Counterparty steps (Mineral Bridge, SGS, logistics) are simulated by the
// labelled demo buttons, exactly as in the handoff.
import { Share } from 'react-native';
import * as MB from '../lib/mb4';
import type { AppScreen } from '../navigation/types';
import type { Auction, DocSpec, KycDocId, KycFile, Order, Product } from '../types/mineralBridge';
import { DEMO_USER, emptyDraft, emptyRefund, fresh, seed, seedAuctions } from './state';
import type { AppState, Errs } from './state';
import { imgFor } from '../lib/images';

export const ACTION: Record<string, string> = { quote: 'Review quotation', contract: 'Review and sign e-contract', payInsp: 'Submit payment details', sellConfirm: 'Submit seller confirmation form', report: 'Review inspection reports', pay: 'Make payment', receipt: 'Confirm receipt' };
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
  private listeners = new Set<() => void>();
  private toastTimer?: ReturnType<typeof setTimeout>;
  private ticker?: ReturnType<typeof setInterval>;
  version = 0;

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getVersion = () => this.version;
  setState(patch: Patch, cb?: () => void) {
    const p = typeof patch === 'function' ? patch(this.state) : patch;
    if (p) { this.state = { ...this.state, ...p }; this.version++; this.listeners.forEach(l => l()); }
    if (cb) cb();
  }

  start() {
    if (this.ticker) return;
    this.ticker = setInterval(() => {
      const st = this.state;
      if (st.screen === 'pay' && st.pmethod === 'Bitcoin') return this.setState({ tick: Date.now() });
      if (!['auctions', 'auction', 'orders'].includes(st.screen)) return;
      const due = (st.auctions || []).filter(a => a.status === 'live' && a.endsAt <= Date.now());
      due.forEach(a => this.endAuction(a.id, true));
      this.setState({ tick: Date.now() });
    }, 1000);
  }
  stop() { if (this.ticker) clearInterval(this.ticker); this.ticker = undefined; }

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
  youDo(text: string, note: string, extra?: Partial<Order>) { const o = this.order(); if (!o) return; this.patchOrder(o.id, c => { c.idx += 1; c.hold = ''; return this.log(c, 'You', text, note, extra); }); }
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

  demo(kind: '' | 'reject' | 'changes' | 'refundDecline') {
    const o = this.order(); if (!o) return;
    const st = MB.stages(o.kind), next = st[o.idx + 1], now = Date.now();
    if (kind === 'reject') { this.patchOrder(o.id, c => this.log(c, MB.WHO.mb, 'Order rejected', 'The seller has withdrawn this quantity. Please choose another lot.', { rejected: 'The seller has withdrawn this quantity. Please choose another lot.' })); this.notify(o, 'Order rejected', 'Reason shared in your order.'); return; }
    if (kind === 'changes') { this.patchOrder(o.id, c => { c.idx -= 1; return this.log(c, MB.WHO.mb, 'Changes requested', (o.kind === 'sell' ? 'Please choose an inspection date within the next 10 days.' : 'Please update the billing address to match your company registration.'), { hold: 'changes' }); }); this.notify(o, 'Changes requested', o.kind === 'sell' ? 'Update your seller confirmation form.' : 'Update your payment details.'); return; }
    if (kind === 'refundDecline') { this.patchOrder(o.id, c => this.log(c, MB.WHO.mb, 'Refund declined', 'The shipment is already with the logistics partner and the goods match the contract. Contact support if you disagree.', { hold: c.refund && c.refund.fromDisc ? 'discrepancy' : '', refund: Object.assign({}, c.refund!, { status: 'declined' as const, reason2: 'The shipment is already with the logistics partner and the goods match the contract.', at2: now }) })); this.notify(o, 'Refund declined', 'Reason shared in your order.'); return; }
    if (o.hold === 'refund' && o.refund) {
      const r = o.refund, nx = ({ requested: 'review', review: 'approved', approved: 'processing', processing: 'refunded' } as Record<string, string>)[r.status];
      const TXT = ({ review: ['Refund under review', 'Our finance team is checking the payment and order status.'], approved: ['Refund approved', MB.money(r.amount) + ' will be returned to ' + r.to + '.'], processing: ['Refund processing', 'Sent to the bank. Allow 3–7 working days to appear.'], refunded: ['Refund completed', MB.money(r.amount) + ' refunded · bank reference RF' + String(now).slice(-8)] } as Record<string, [string, string]>)[nx];
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
    const st = MB.stages(o.kind), next = st[o.idx + 1], last = st[o.idx];
    const refunded = !!(o.refund && o.refund.status === 'refunded' && o.refund.type === 'full');
    const cx = !!o.cancelled, done = !next || refunded || cx, rej = !!o.rejected || cx;
    const you = !!next && next.actor === 'you' && !rej && (!o.hold || o.hold === 'changes');
    const status = rej ? (cx ? 'Cancelled' : 'Rejected') : refunded ? 'Refunded' : done ? 'Completed' : o.hold ? HOLD[o.hold].split(' · ')[0] : you ? 'Action needed' : 'Waiting on ' + ACTOR[next.actor];
    const tone = cx ? ['#F1EFE9', '#3A3940'] : rej ? ['#FDECEA', '#B42318'] : refunded ? ['#EDE9F7', '#4B3B8F'] : done ? ['#E2F2E9', '#17704C'] : you || o.hold ? ['#FBF3E4', '#A1620B'] : ['#F1EFE9', '#3A3940'];
    const value = o.quote ? MB.money(o.quote.total) : 'By quotation';
    const p0 = o.kind === 'sell' && o.sell ? MB.PRODUCTS.find(p => p.mineral === o.sell!.mineral) : MB.product(o.items[0] && o.items[0].pid);
    return {
      id: o.id, kind: o.kind, title: MB.titleOf(o), status, pillBg: tone[0], pillFg: tone[1],
      headline: rej ? (cx ? (o.kind === 'sell' ? 'Sell request cancelled' : 'Order cancelled') : 'Order rejected') : refunded ? 'Order cancelled and refunded' : done ? (o.kind === 'sell' ? 'Sale completed' : 'Order completed') : last.label,
      next: rej ? (cx ? 'Cancelled by you on ' + MB.fmt(o.cancelled!.at) + ' · ' + o.cancelled!.reason + (o.kind === 'sell' ? '. No inspection or payment took place.' : '. Nothing was charged.') : o.rejected || '') : refunded ? MB.money(o.refund!.amount) + ' refunded to ' + o.refund!.to + ' · ref ' + o.refund!.ref : done ? 'All records are stored in your history.' : o.hold ? HOLD[o.hold] : you ? 'Your turn: ' + ACTION[next.screen] : 'Next: ' + next.label + ' (' + ACTOR[next.actor] + ')',
      you, actionLabel: you ? ACTION[next.screen] : '', actionScreen: you ? next.screen : '',
      canDemo: !rej && !done && !you && o.hold !== 'changes', demoLabel: o.hold === 'refund' ? 'Simulate: refund ' + (({ requested: 'review started', review: 'approved', approved: 'processing', processing: 'completed' } as Record<string, string>)[(o.refund || { status: '' }).status] || 'update') : o.hold ? 'Simulate Mineral Bridge response' : next ? 'Simulate: ' + next.label : '',
      canReject: !rej && !!next && next.key === 'accepted', canDeclineRefund: o.hold === 'refund' && ['requested', 'review'].includes((o.refund || { status: '' }).status), canChanges: !rej && !!next && next.key === 'formOk' && !o.hold,
      pct: Math.round((o.idx + 1) / st.length * 100) + '%', step: 'STAGE ' + (o.idx + 1) + ' OF ' + st.length, value,
      qtyLine: o.kind === 'sell' && o.sell ? o.sell.qty + ' ' + o.sell.unit + ' · ' + o.sell.grade : o.items.map(it => it.qty + ' ' + (MB.product(it.pid) || ({} as Product)).unit).join(' + '),
      img: imgFor(p0 ? p0.img : 'cat-precious'),
      updated: MB.fmt(o.log[o.log.length - 1].at), done, rej,
    };
  }

  meta(): Meta {
    const s = this.state, u = s.user;
    const M: Partial<Record<AppScreen, Partial<Meta>>> = {
      welcome: {}, auth: { header: 1, canBack: 1, title: s.auth.mode === 'signup' ? 'Create account' : 'Sign in', cta: 'Send verification code' },
      otp: { header: 1, canBack: 1, title: 'Verify', cta: 'Verify and continue' },
      regType: { header: 1, title: 'Account type', step: 'STEP 1 OF 3 · ACCOUNT TYPE', prog: '33%', cta: 'Continue' },
      regDetails: { header: 1, canBack: 1, title: 'Your details', step: 'STEP 2 OF 3 · DETAILS', prog: '66%', cta: 'Continue' },
      kyc: { header: 1, canBack: 1, title: 'KYC verification', step: 'STEP 3 OF 3 · KYC', prog: '100%', cta: 'Submit for review' },
      kycDoc: { header: 1, canBack: 1, title: 'Upload document', step: 'STEP 3 OF 3 · KYC', prog: '100%', cta: s.kyc[s.kycDocId] ? 'Save and continue' : 'Upload to continue', ctaOpacity: s.kyc[s.kycDocId] ? 1 : 0.45 },
      kycDone: { cta: s.returnTo ? 'Continue where you left off' : 'Go to home' },
      home: { tabs: 'home' }, cats: { tabs: 'buy', header: 1, title: 'Buy minerals', cartBtn: 1 },
      minerals: { tabs: 'buy', header: 1, canBack: 1, title: (MB.CATS.find(c => c.id === s.cat) || { name: '' }).name, cartBtn: 1 },
      lots: { tabs: 'buy', header: 1, canBack: 1, title: MB.mineralName(s.mineral), cartBtn: 1 },
      detail: { header: 1, canBack: 1, title: 'Product details', cartBtn: 1, cta: ((MB.product(s.pid) || { avail: 0 }).avail > 0) ? 'Add to cart' : 'See other lots' },
      cart: { header: 1, canBack: 1, title: 'Cart', cta: s.cart.length ? 'Proceed to checkout' : '' },
      checkout: { header: 1, canBack: 1, title: 'Checkout', cta: s.placing ? 'Placing order…' : 'Place order' },
      placed: { cta: 'Track order', cta2: 'Continue browsing' },
      orders: { tabs: 'orders', header: 1, title: 'Orders' }, order: { header: 1, canBack: 1, title: s.oid },
      quote: { header: 1, canBack: 1, title: 'Quotation', cta: 'Accept quotation', cta2: 'Decline quotation', cta2Fg: '#B42318' },
      contract: { header: 1, canBack: 1, title: 'E-contract', cta: 'Sign e-contract' },
      payInsp: { header: 1, canBack: 1, title: 'Payment details', cta: 'Submit details' },
      sellConfirm: { header: 1, canBack: 1, title: 'Seller confirmation', cta: 'Submit form' },
      report: { header: 1, canBack: 1, title: 'Inspection reports', cta: 'Accept reports', cta2: 'Request clarification', cta2Fg: '#A1620B' },
      pay: { header: 1, canBack: 1, title: 'Make payment', cta: s.paying ? 'Processing…' : s.pmethod === 'Bitcoin' ? 'I have sent the Bitcoin' : (s.pmethod === 'Bank transfer' ? 'I have made the transfer' : 'Pay with ' + (s.pmethod || 'UPI')), ctaOpacity: s.paying ? 0.6 : 1 },
      refund: { header: 1, canBack: 1, title: 'Request a refund', cta: 'Submit refund request' },
      cancel: this.cancelMeta(),
      refunds: { header: 1, canBack: 1, title: 'Refunds' },
      receipt: { header: 1, canBack: 1, title: 'Confirm receipt', cta: 'Accept delivery', cta2: 'Raise a discrepancy', cta2Fg: '#B42318' },
      chat: { header: 1, canBack: 1, title: 'Chat with Mineral Bridge' },
      shipment: { header: 1, canBack: 1, title: 'Shipment tracking' },
      sellCats: { tabs: 'sell', header: 1, title: 'Sell minerals' },
      sellForm: { header: 1, canBack: 1, title: 'Sell ' + MB.mineralName(s.draft.mineral || 'gold'), cta: 'Submit sell request', cta2: 'Save draft', cta2Fg: '#121214' },
      sellDone: { cta: 'Track request', cta2: 'Back to home' },
      profile: { tabs: 'profile', header: 1, title: 'Profile' },
      editProfile: { header: 1, canBack: 1, title: 'Edit profile', cta: 'Save changes' },
      bizType: { header: 1, canBack: 1, title: 'Account type', cta: 'Save' },
      kycStatus: { header: 1, canBack: 1, title: 'KYC & documents', cta: u && u.kyc === 'none' ? 'Start verification' : '' },
      notifs: { tabs: '', header: 1, canBack: 1, title: 'Notifications' }, prefs: { header: 1, canBack: 1, title: 'Notification channels' },
      help: { header: 1, canBack: 1, title: 'Help & support' },
      auctions: { header: 1, canBack: 1, title: 'Auctions' },
      auction: Object.assign({ header: 1, canBack: 1, title: 'Auction' }, this.aucCta()),
      auctionWon: { cta: this.aucWonCta(), cta2: 'Back to auctions' },
      doc: { header: 1, canBack: 1, title: 'Document', cta: 'Download', cta2: 'Share' },
    };
    const m: Meta = Object.assign({ ctaOpacity: 1, cta2Fg: '#6B6A70', tabs: '' }, M[s.screen] || {});
    if (s.placing) m.ctaOpacity = 0.6;
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
    const H: Partial<Record<AppScreen, () => void>> = {
      auth: () => {
        const a = s.auth, v = a.value.trim();
        if (a.mode === 'signup' && a.name.trim().length < 2) return this.setState({ authErr: 'Enter your full name' });
        const nd = v.replace(/\D/g, '').replace(/^0+/, '');
        if (a.method !== 'email' && (nd.length < 7 || nd.length > 12)) return this.setState({ authErr: 'Enter a valid WhatsApp number for ' + (a.cc || '+234') + ' (7–12 digits, without the country code)' });
        if (a.method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return this.setState({ authErr: 'Enter a valid email address' });
        this.setState({ authErr: '', otp: '', otpErr: '' }); this.go('otp');
      },
      otp: () => {
        if (!/^\d{4}$/.test(s.otp)) return this.setState({ otpErr: 'Enter all 4 digits' });
        if (s.auth.mode === 'signin') { this.setState(x => ({ user: Object.assign({}, DEMO_USER), orders: x.orders.length ? x.orders : seed() })); this.flash('Signed in'); return this.resume(s.returnTo); }
        this.jump('regType');
      },
      regType: () => {
        const r = s.reg;
        if (!r.role) return this.setState({ regErr: 'Choose buyer, seller or both' });
        if (r.role !== 'seller' && !r.buyerType) return this.setState({ regErr: 'Choose your buyer type' });
        if (r.role !== 'buyer' && !r.sellerType) return this.setState({ regErr: 'Choose your seller type' });
        this.setState({ regErr: '' }); this.go('regDetails');
      },
      regDetails: () => {
        const r = s.reg, a = s.auth;
        if (this.isBusiness(r) && r.business.trim().length < 2) return this.setState({ regErr: 'Enter your business or trading name' });
        if (!r.country.trim()) return this.setState({ regErr: 'Enter your country' });
        if (!r.terms) return this.setState({ regErr: 'Accept the terms to continue' });
        const contact = a.method === 'email' ? { email: a.value.trim(), phone: '' } : { phone: (a.cc || '+234') + ' ' + a.value.trim().replace(/^0+/, ''), email: '' };
        this.setState({
          regErr: '', orders: [], notifs: [], cart: [], reminders: {},
          auctions: seedAuctions().map(x => Object.assign({}, x, { bids: x.bids.filter(b => b.who !== 'You'), result: x.result === 'won' ? 'lost' as const : x.result })),
          user: Object.assign({ name: a.name.trim(), business: r.business.trim() || 'Individual', country: r.country.trim(), role: r.role, buyerType: r.role !== 'seller' ? r.buyerType : '', sellerType: r.role !== 'buyer' ? r.sellerType : '', kyc: 'none' as const, kycRef: '', via: a.method }, contact),
        });
        this.go('kyc');
      },
      kyc: () => {
        const k = s.kyc, need: string[] = [];
        if (!k.front) need.push('ID front');
        if (k.idType !== 'Passport' && !k.back) need.push('ID back');
        if (!k.selfie) need.push('selfie');
        if (!k.address) need.push('proof of address');
        if (!k.biz && this.bizDocNeeded()) need.push('business document');
        if (need.length) return this.setState({ kycErr: 'Still needed: ' + need.join(', ') });
        const stale = (Object.keys(KYC_INFO) as KycDocId[]).filter(id => this.kycFlag(id));
        if (stale.length) return this.setState({ kycErr: 'Re-upload requested: ' + stale.map(id => KYC_INFO[id].title.toLowerCase()).join(', ') + '. Replace ' + (stale.length > 1 ? 'them' : 'it') + ' before resubmitting.' });
        if (!k.consent) return this.setState({ kycErr: 'Tick the consent box to submit' });
        this.setState(x => ({ kycErr: '', user: Object.assign({}, x.user!, { kycFlags: {}, kyc: 'pending' as const, kycRef: 'MB-KYC-26-' + String(Date.now()).slice(-5), kycAt: Date.now() }) }));
        this.jump('kycDone');
      },
      kycDone: () => this.resume(s.returnTo),
      auction: () => this.auctionPrimary(),
      refund: () => this.submitRefund(),
      cancel: () => this.submitCancel(),
      auctionWon: () => this.auctionToOrder(s.aid, true),
      doc: () => this.downloadDoc(),
      kycDoc: () => { if (!s.kyc[s.kycDocId]) return this.setState({ kycDocErr: 'Upload a photo or file first' }); this.flash('Document saved'); this.nextKycDoc(); },
      detail: () => { const p = MB.product(s.pid); if (p && p.avail <= 0) return this.go('lots', { mineral: p.mineral, fform: 'All', labOnly: false, search: '' }); this.addToCart(); },
      cart: () => { if (!s.cart.length) return; if (!this.gate('checkout')) return; this.prefillShip(); this.go('checkout'); },
      checkout: () => this.placeOrder(),
      placed: () => { this.setState({ stack: ['orders'], screen: 'order' }); this.top(); },
      sellDone: () => { this.setState({ stack: ['orders'], screen: 'order' }); this.top(); },
      quote: () => { if (!this.stepOpen()) return; const o = this.order()!; this.youDo('Quotation accepted', 'Accepted by ' + u!.name + ' · ' + MB.money(o.quote ? o.quote.total : 0)); this.flash('Quotation accepted'); this.back(); },
      contract: () => {
        if (!this.stepOpen()) return;
        if (!s.sign.read) return this.setState({ signErr: 'Confirm you have read the contract' });
        if (s.sign.name.trim().toLowerCase() !== u!.name.toLowerCase()) return this.setState({ signErr: 'Type your full name exactly as ' + u!.name });
        this.youDo('E-contract signed by you', 'Signed by ' + u!.name + ' · e-signature, time and device recorded'); this.setState({ sign: { read: false, name: '' }, signErr: '' }); this.flash('Contract signed'); this.back();
      },
      payInsp: () => this.submitPayInsp(),
      sellConfirm: () => this.submitSellConfirm(),
      report: () => { if (!this.stepOpen()) return; this.youDo('Inspection reports accepted by you', 'Mineral Bridge inspection and SGS reports accepted by ' + u!.name); this.flash('Reports accepted'); this.back(); },
      pay: () => {
        if (s.paying || !this.stepOpen()) return;
        const method = s.pmethod || 'UPI';
        if (method === 'Bitcoin') { const tx = (s.btcTx || '').trim(); if (!/^[0-9a-fA-Fx]{16,}$/.test(tx)) return this.setState({ payErr: 'Paste the transaction ID from your wallet (at least 16 characters)' }); this.youDo('Payment made', 'Bitcoin · TXID ' + tx.slice(0, 10) + '… · waiting for 3 confirmations', { paidAt: Date.now(), form: { method } }); this.setState({ btcTx: '', payErr: '' }); this.flash('Bitcoin payment submitted · confirming on-chain'); return this.back(); }
        if (method === 'Bank transfer') { if (!s.proof) return this.setState({ payErr: 'Upload the transfer receipt first' }); this.youDo('Payment made', 'Bank transfer · receipt uploaded · awaiting confirmation', { paidAt: Date.now(), form: { method } }); this.setState({ proof: false, payErr: '' }); this.flash('Payment submitted for confirmation'); return this.back(); }
        this.setState({ paying: true, payErr: '' });
        setTimeout(() => { const ref = (method === 'UPI' ? 'UPI ref ' : 'Bank ref ') + String(Date.now()).slice(-10); this.youDo('Payment made', method + ' · ' + ref + ' · awaiting confirmation', { paidAt: Date.now(), form: { method } }); this.setState({ paying: false }); this.flash('Payment sent · Mineral Bridge will confirm it'); this.back(); }, 1600);
      },
      receipt: () => {
        if (!this.stepOpen()) return;
        const r = s.rc;
        if (!(parseFloat(r.qty) > 0)) return this.setState({ rcErr: 'Enter the quantity you received' });
        if (r.photos < 1) return this.setState({ rcErr: 'Add at least one photo of the delivery' });
        this.youDo('Receipt confirmed by you', r.qty + ' received · condition ' + r.cond.toLowerCase() + ' · ' + r.photos + (r.photos === 1 ? ' photo' : ' photos')); this.setState({ rcErr: '' }); this.flash('Delivery accepted'); this.back();
      },
      sellForm: () => this.submitSell(),
      editProfile: () => this.saveProfile(),
      bizType: () => this.saveBizType(),
      kycStatus: () => this.go('kyc'),
    };
    const fn = H[sc]; if (fn) fn();
  }
  secondary() {
    const s = this.state, sc = s.screen;
    const H: Partial<Record<AppScreen, () => void>> = {
      placed: () => this.jump('cats'), sellDone: () => this.jump('home'),
      auctionWon: () => { this.setState({ stack: ['orders'], screen: 'auctions', atab: 'ended' }); this.top(); },
      cancel: () => this.back(),
      doc: () => { const d = this.docData(s.doc); Share.share({ title: d.title, message: d.title + ' ' + d.no }).catch(() => {}); },
      quote: () => { if (this.stepOpen()) this.setState({ sheet: 'declineQuote' }); },
      report: () => {
        if (!this.stepOpen()) return;
        if (s.repNote.trim().length < 5) return this.setState({ repErr: 'Describe what needs clarifying' });
        const o = this.order()!; this.patchOrder(o.id, c => this.log(c, 'You', 'Clarification requested', s.repNote.trim(), { hold: 'clarify' })); this.setState({ repNote: '', repErr: '' }); this.flash('Clarification sent'); this.back();
      },
      receipt: () => {
        if (!this.stepOpen()) return;
        if (s.rc.note.trim().length < 5) return this.setState({ rcErr: 'Describe the discrepancy in the note' });
        const o = this.order()!; this.patchOrder(o.id, c => this.log(c, 'You', 'Discrepancy raised', s.rc.qty + ' received · ' + s.rc.cond.toLowerCase() + ' · ' + s.rc.note.trim(), { hold: 'discrepancy', disc: { qty: s.rc.qty, cond: s.rc.cond, note: s.rc.note.trim(), photos: s.rc.photos, at: Date.now() } })); this.notify(o, 'Discrepancy raised', o.id + ' · Mineral Bridge will review it within 1 working day'); this.flash('Discrepancy raised'); this.back();
      },
      sellForm: () => { this.setState({ hasDraft: true }); this.flash('Draft saved'); },
    };
    const fn = H[sc]; if (fn) fn();
  }
  sheetVals() {
    const s = this.state, k = s.sheet, close = () => this.setState({ sheet: '' });
    const S: Record<string, [string, string, string, string, () => void]> = {
      kycPending: ['Verification still under review', 'Your KYC (' + ((s.user || { kycRef: '' }).kycRef || '') + ') is being reviewed. You can browse, but buying and selling open once it is approved.', 'View status', '#121214', () => { close(); this.go('kycStatus'); }],
      declineQuote: ['Decline this quotation?', 'Mineral Bridge will be told and can send a revised quotation. Your order stays open.', 'Decline quotation', '#B42318', () => { close(); const o = this.order()!; this.patchOrder(o.id, c => this.log(c, 'You', 'Quotation declined', 'Declined by ' + s.user!.name, { hold: 'quoteDeclined' })); this.flash('Quotation declined'); this.back(); }],
      needSeller: ['Add selling to your account', 'Your account is set up for buying only. Choose a seller type to sell to Mineral Bridge. Your draft is kept.', 'Add seller type', '#121214', () => { close(); this.setState(x => ({ reg: Object.assign({}, x.reg, { role: 'both' as const, buyerType: x.user!.buyerType || '', sellerType: '' }), regErr: '' })); this.go('bizType'); }],
      needBuyer: ['Add buying to your account', 'Your account is set up for selling only. Choose a buyer type to place orders. Your cart is kept.', 'Add buyer type', '#121214', () => { close(); this.setState(x => ({ reg: Object.assign({}, x.reg, { role: 'both' as const, buyerType: '', sellerType: x.user!.sellerType || '' }), regErr: '' })); this.go('bizType'); }],
      logout: ['Log out?', 'You will need a verification code to sign in again.', 'Log out', '#B42318', () => { close(); this.jump('welcome', { user: null, returnTo: '' }); this.flash('Logged out'); }],
      discardDraft: ['Discard this draft?', 'Photos and details you entered will be removed.', 'Discard draft', '#B42318', () => { close(); this.setState({ hasDraft: false, draft: emptyDraft() }); this.flash('Draft discarded'); }],
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
    if (p.avail <= 0) return this.flash('This lot is no longer available');
    if (!(qIn > 0)) return this.setState({ qtyErr: 'Enter a quantity' });
    if (q < p.min) return this.setState({ qtyErr: 'Minimum order is ' + nf(this.conv(p.min, p.unit, u)) + ' ' + u + (u !== p.unit ? ' (' + p.min + ' ' + p.unit + ')' : '') });
    if (q > p.avail) return this.setState({ qtyErr: 'Only ' + nf(this.conv(p.avail, p.unit, u)) + ' ' + u + ' available' + (u !== p.unit ? ' (' + p.avail + ' ' + p.unit + ')' : '') });
    const had = s.cart.some(c => c.pid === p.id), item = { pid: p.id, qty: q, qIn, uIn: u };
    this.setState(x => ({ qtyErr: '', cart: had ? x.cart.map(c => (c.pid === p.id ? item : c)) : [...x.cart, item] }));
    this.flash(had ? 'Cart quantity updated' : 'Added to cart'); this.go('cart');
  }
  prefillShip() {
    const s = this.state, u = s.user, last = s.orders.find(o => o.kind === 'buy' && o.addr);
    if (s.ship.street) return;
    this.setState({ ship: last && last.addr ? Object.assign({}, last.addr) : { org: (u && u.business) || '', street: '', city: '', country: (u && u.country) || '', contact: (u && u.name) || '', mobile: (u && u.phone) || '' }, shipErr: {} });
  }
  placeOrder() {
    const s = this.state;
    if (s.placing) return;
    if (!this.gate('checkout')) return;
    const e: Errs = {}, sh = s.ship as unknown as Record<string, string>;
    [['org', 'Company / receiver name'], ['street', 'Street address'], ['city', 'City'], ['country', 'Country'], ['contact', 'Contact person']].forEach(([k, l]) => { if (!String(sh[k] || '').trim()) e[k] = l + ' is required'; });
    if (String(sh.mobile || '').replace(/\D/g, '').length < 9) e.mobile = 'Mobile needs at least 9 digits';
    if (Object.keys(e).length) return this.err('shipErr', e);
    const bad = s.cart.find(c => { const p = MB.product(c.pid); return !p || p.avail <= 0 || c.qty > p.avail; });
    if (bad) return this.flash('A cart item is no longer available in that quantity');
    this.setState({ placing: true, shipErr: {} });
    setTimeout(() => {
      const n = 10419 + this.state.orders.filter(o => o.kind === 'buy').length;
      const id = 'MB-ORD-26-' + n, now = Date.now();
      const o: Order = { id, kind: 'buy', items: this.state.cart.map(c => Object.assign({}, c)), addr: Object.assign({}, s.ship), idx: 0, created: now, log: [{ who: 'You', text: 'Order placed', note: 'Order ' + id + ' submitted for review', at: now }] };
      this.setState(x => ({ placing: false, cart: [], orders: [o, ...x.orders], oid: id, stack: [], screen: 'placed' }));
      this.notify(o, 'Order placed', id + ' is under review by Mineral Bridge');
      this.top();
    }, 900);
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
    this.youDo('Payment details submitted', f.method + ' · ' + f.terms, { form: { method: f.method, terms: f.terms } });
    this.setState({ pfErr: {} }); this.flash('Details submitted for approval'); this.back();
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
    this.youDo('Seller confirmation form submitted', f.method + ' · inspection and pickup ' + f.date + ' ' + f.time + ' at ' + f.address.trim(), { form: { method: f.method, date: f.date, time: f.time, address: f.address.trim() } });
    this.setState({ scErr: {} }); this.flash('Form submitted for approval'); this.back();
  }
  prefillForms(o: Order) {
    const s = this.state, u = s.user || DEMO_USER, f = o.form || {};
    if (!s.pf.billName) this.setState(x => ({ pf: Object.assign({}, x.pf, { billName: u.business, billAddr: o.addr ? o.addr.street + ', ' + o.addr.city : '', address: f.address || '', contact: u.name, mobile: u.phone || '' }) }));
    if (!s.sc.address) this.setState(x => ({ sc: Object.assign({}, x.sc, { address: 'Ilesha Lease Site 4, Osun, Nigeria' }) }));
  }
  submitSell() {
    const s = this.state, d = s.draft, e: Errs = {};
    if (!d.mineral) e.mineral = 'Choose a mineral';
    if (d.photos < 3) e.photos = 'Add at least 3 photos (' + d.photos + ' added)';
    if (!(parseFloat(d.qty) > 0)) e.qty = 'Enter the quantity';
    if (!d.grade.trim()) e.grade = 'Enter the quality or grade';
    if (d.details.trim().length < 10) e.details = 'Describe the mineral in a sentence or two';
    if (Object.keys(e).length) return this.err('draftErr', e);
    if (!this.gate('sellForm')) { this.setState({ hasDraft: true }); return; }
    const n = 90414 + s.orders.filter(o => o.kind === 'sell').length, id = 'MB-SELL-26-' + n, now = Date.now();
    const refP = MB.PRODUCTS.filter(p => p.mineral === d.mineral && p.unit === d.unit);
    const o: Order = { id, kind: 'sell', idx: 0, created: now, items: [], sell: { mineral: d.mineral, name: MB.mineralName(d.mineral), qty: parseFloat(d.qty), unit: d.unit, grade: d.grade.trim(), form: d.form, details: d.details.trim(), photos: d.photos, docs: d.docs, ref: refP.length ? refP[0].ref * 0.94 : 1000 }, log: [{ who: 'You', text: 'Sell request submitted', note: d.photos + ' photos · ' + d.qty + ' ' + d.unit + ' · ' + d.docs.length + ' documents', at: now }] };
    this.setState(x => ({ orders: [o, ...x.orders], oid: id, hasDraft: false, draftErr: {}, draft: emptyDraft(), stack: [], screen: 'sellDone' }));
    this.notify(o, 'Sell request submitted', id + ' is with our operations team for review'); this.top();
  }
  saveProfile() {
    const s = this.state, f = s.edit || { name: '', business: '', email: '', phone: '', country: '' }, e: Errs = {};
    if ((f.name || '').trim().length < 2) e.name = 'Enter your full name';
    if ((f.business || '').trim().length < 2 && this.bizDocNeeded()) e.business = 'Enter your business name';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email';
    if (f.phone && f.phone.replace(/\D/g, '').length < 9) e.phone = 'Phone numbers need at least 9 digits';
    if (!f.email && !f.phone) e.phone = 'Keep at least one contact method';
    if (Object.keys(e).length) return this.err('editErr', e);
    this.setState(x => ({ user: Object.assign({}, x.user!, { name: f.name.trim(), business: f.business.trim(), email: (f.email || '').trim(), phone: (f.phone || '').trim(), country: (f.country || '').trim() }), editErr: {} }));
    this.flash('Profile saved'); this.back();
  }
  saveBizType() {
    const r = this.state.reg;
    if (!r.role) return this.setState({ regErr: 'Choose buyer, seller or both' });
    if (r.role !== 'seller' && !r.buyerType) return this.setState({ regErr: 'Choose your buyer type' });
    if (r.role !== 'buyer' && !r.sellerType) return this.setState({ regErr: 'Choose your seller type' });
    this.setState(x => ({ regErr: '', user: Object.assign({}, x.user!, { role: r.role, buyerType: r.role !== 'seller' ? r.buyerType : '', sellerType: r.role !== 'buyer' ? r.sellerType : '' }) }));
    this.flash('Account type updated');
    const ret = this.state.returnTo;
    if (ret) { this.setState({ returnTo: '' }); this.back(); if (ret === 'checkout') { this.prefillShip(); this.go('checkout'); } } else this.back();
  }

  // ---- KYC
  saveKycFile(file: { uri: string; fileName?: string; fileSize?: number; type?: string }) {
    const id = this.state.kycDocId, sz = file.fileSize || 0;
    const size = sz > 1048576 ? (sz / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(sz / 1024)) + ' KB';
    if (sz > 10 * 1048576) return this.setState({ kycDocErr: 'File is larger than 10 MB. Choose a smaller file.' });
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.fileName || '');
    if (!isPdf && file.type && !/^image\//.test(file.type)) return this.setState({ kycDocErr: 'Use a JPG, PNG or PDF file.' });
    if (isPdf && id === 'selfie') return this.setState({ kycDocErr: 'A selfie must be a photo.' });
    const rec: KycFile = { kind: isPdf ? 'pdf' : 'img', src: isPdf ? '' : file.uri, name: file.fileName || (id + (isPdf ? '.pdf' : '.jpg')), size, at: Date.now() };
    this.setState(x => ({ kycDocErr: '', kyc: Object.assign({}, x.kyc, { [id]: rec }) }));
  }
  nextKycDoc() {
    const s = this.state, k = s.kyc;
    const ids = (['front', 'back', 'selfie', 'address', 'biz'] as KycDocId[]).filter(id => (id !== 'back' || k.idType !== 'Passport') && (id !== 'biz' || this.bizDocNeeded()));
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
  aucMin(a: Auction) { return a.bids.length ? this.aucCur(a) + 500 : a.start; }
  patchAuc(id: string, fn: (a: Auction) => Auction) { this.setState(x => ({ auctions: x.auctions.map(a => (a.id === id ? fn(JSON.parse(JSON.stringify(a))) : a)) })); }
  left(ms: number) { if (ms <= 0) return '00:00:00'; const h = Math.floor(ms / 36e5), mi = Math.floor(ms % 36e5 / 6e4), se = Math.floor(ms % 6e4 / 1e3), p = (n: number) => String(n).padStart(2, '0'); return h >= 24 ? Math.floor(h / 24) + 'd ' + p(h % 24) + 'h' : p(h) + ':' + p(mi) + ':' + p(se); }
  aucCta(): Partial<Meta> {
    const a = this.aucOf(); if (!a) return {};
    if (a.status === 'live') return { cta: 'Place bid · ' + MB.money(parseFloat(this.state.bidAmt) || this.aucMin(a)) };
    if (a.status === 'upcoming') return { cta: this.state.reminders[a.id] ? 'Reminder on · tap to cancel' : 'Remind me when it opens' };
    if (a.result === 'won') return { cta: this.aucUnpaid(a) ? 'Pay now · ' + MB.money(this.aucCur(a)) : 'Track order ' + (a.orderId || '') };
    return { cta: 'Browse similar lots' };
  }
  openAuction(id: string) { const a = this.aucOf(id); this.go('auction', { aid: id, bidAmt: a ? String(this.aucMin(a)) : '', bidErr: '', autoOn: false, autoMax: '' }); }
  auctionPrimary() {
    const s = this.state, a = this.aucOf(); if (!a) return;
    if (a.status === 'upcoming') { const on = !s.reminders[a.id]; this.setState(x => ({ reminders: Object.assign({}, x.reminders, { [a.id]: on }) })); return this.flash(on ? 'We will message you when bidding opens' : 'Reminder cancelled'); }
    if (a.status === 'ended') {
      if (a.result === 'won') return this.aucUnpaid(a) ? this.auctionToOrder(a.id, true) : this.go('order', { oid: a.orderId });
      const p = MB.product(a.pid);
      return this.jump('lots', { mineral: p ? p.mineral : 'gold', fform: 'All', labOnly: false, search: '' });
    }
    if (!this.gate('auction')) return;
    const amt = Math.round(parseFloat(String(s.bidAmt).replace(/[^\d.]/g, ''))), min = this.aucMin(a);
    if (!(amt > 0)) return this.setState({ bidErr: 'Enter your bid amount' });
    if (amt < min) return this.setState({ bidErr: 'Minimum bid is ' + MB.money(min) });
    if (amt % 500) return this.setState({ bidErr: 'Bids go up in steps of $500' });
    let max = 0;
    if (s.autoOn) { max = Math.round(parseFloat(String(s.autoMax).replace(/[^\d.]/g, ''))); if (!(max >= amt)) { max = 0; this.setState({ autoOn: false, autoMax: '' }); setTimeout(() => this.flash('Bid placed · auto-bid turned off because its limit was below this bid'), 0); } }
    this.patchAuc(a.id, c => { c.bids.push({ who: 'You', amt, at: Date.now() }); c.autoMax = max || 0; c.outbid = false; return c; });
    this.setState({ bidErr: '', bidAmt: String(amt + 500) }); this.flash('Bid placed · you are the highest bidder');
  }
  simOutbid() {
    const a = this.aucOf(); if (!a || a.status !== 'live') return;
    const other = this.aucCur(a) + 500 * (1 + Math.floor(Math.random() * 3));
    this.patchAuc(a.id, c => {
      c.bids.push({ who: 'Bidder ' + (1000 + Math.floor(Math.random() * 9000)), amt: other, at: Date.now() });
      const mine = c.bids.some(b => b.who === 'You');
      if (mine && c.autoMax && c.autoMax >= other + 500) { c.bids.push({ who: 'You', amt: other + 500, at: Date.now() + 1, auto: true }); c.outbid = false; } else if (mine) c.outbid = true;
      return c;
    });
    setTimeout(() => {
      const n = this.aucOf(a.id)!; const last = n.bids[n.bids.length - 1];
      this.setState({ bidAmt: String(this.aucMin(n)) });
      if (last.who === 'You') this.flash('Auto-bid raised your bid to ' + MB.money(last.amt));
      else if (n.outbid) { this.flash('You have been outbid'); this.setState(x => ({ notifs: [{ id: 'n' + Date.now(), title: 'You have been outbid', note: a.id + ' · current bid ' + MB.money(last.amt), at: Date.now(), read: false }, ...x.notifs] })); }
    }, 0);
  }
  endAuction(id: string, silent?: boolean) {
    const a = this.aucOf(id); if (!a || a.status !== 'live') return;
    const last = a.bids[a.bids.length - 1], won = !!last && last.who === 'You', mine = a.bids.some(b => b.who === 'You');
    this.patchAuc(a.id, c => { c.status = 'ended'; c.endsAt = Math.min(c.endsAt, Date.now()); c.result = won ? 'won' : mine ? 'lost' : 'closed'; c.outbid = false; return c; });
    if (won) { this.setState(x => ({ notifs: [{ id: 'n' + Date.now(), title: 'You won ' + a.id, note: 'Winning bid ' + MB.money(last.amt) + ' · sign the e-contract to continue', at: Date.now(), read: false }, ...x.notifs] })); if (this.state.screen === 'auction' && this.state.aid === id) this.go('auctionWon'); } else if (!silent || mine) this.flash(mine ? 'Auction ended · another bidder won' : 'Auction ended');
  }
  aucUnpaid(a?: Auction) { if (!a || a.result !== 'won') return false; const o = a.orderId && this.state.orders.find(x => x.id === a.orderId); if (!o) return true; return o.idx < MB.stages('buy').findIndex(x => x.key === 'paid') && !o.rejected; }
  aucWonCta() { const a = this.aucOf(); return a && this.aucUnpaid(a) ? 'Pay now · ' + MB.money(this.aucCur(a)) : 'Track order'; }
  auctionToOrder(id: string, toPay: boolean) {
    const s = this.state, a = this.aucOf(id); if (!a || a.result !== 'won') return;
    if (a.orderId) { if (toPay && this.aucUnpaid(a)) { this.setState({ stack: ['orders', 'order'], screen: 'pay', oid: a.orderId, payErr: '' }); this.top(); return; } return this.go('order', { oid: a.orderId }); }
    const st = MB.stages('buy'), ci = st.findIndex(x => x.key === 'contractMb'), now = Date.now(), total = this.aucCur(a);
    const n = 10419 + s.orders.filter(o => o.kind === 'buy').length, oid = 'MB-ORD-26-' + n, u = s.user || DEMO_USER;
    const last = s.orders.find(o => o.kind === 'buy' && o.addr);
    const addr = last && last.addr ? Object.assign({}, last.addr) : { org: u.business, street: '', city: '', country: u.country || '', contact: u.name, mobile: u.phone || '' };
    const o: Order = {
      id: oid, kind: 'buy', items: [{ pid: a.pid, qty: a.qty }], addr, idx: ci, created: now, auction: a.id, quote: { no: 'AUC-' + a.id, total, issued: now, valid: now + 7 * 864e5 },
      log: [{ who: 'You', text: 'Won at auction ' + a.id, note: 'Winning bid ' + MB.money(total), at: now }, { who: MB.WHO.mb, text: 'Price confirmed by Mineral Bridge', note: 'Auction result ' + MB.money(total) + ' accepted as the contract price.', at: now + 1 }, { who: MB.WHO.mb, text: 'Auction terms accepted as the e-contract', note: 'The bidding terms you accepted apply as the signed contract. Pay to release the lot for dispatch.', at: now + 2 }],
    };
    this.setState(x => ({ orders: [o, ...x.orders], auctions: x.auctions.map(y => (y.id === a.id ? Object.assign({}, y, { orderId: oid }) : y)), stack: toPay ? ['orders', 'order'] : ['orders'], screen: toPay ? 'pay' : 'order', oid, payErr: '' }));
    this.notify(o, 'Order created from auction', oid + ' · pay the winning bid to release the lot'); this.top();
  }
  myAucs() { const s = this.state; return (s.auctions || []).filter(a => a.bids.some(b => b.who === 'You') || s.reminders[a.id]).sort((a, b) => (Number(b.result === 'won') - Number(a.result === 'won')) || (Number(b.status === 'live') - Number(a.status === 'live'))); }

  // ---- Refunds & cancellation
  refundable(o?: Order) {
    if (!o || o.kind !== 'buy' || o.rejected || o.cancelled || o.refunded) return false;
    const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
    if (o.idx < pi || !st[o.idx + 1]) return false;
    if (o.refund && !['declined', 'refunded'].includes(o.refund.status)) return false;
    if (o.refund && o.refund.status === 'refunded' && o.refund.type === 'full') return false;
    return !o.hold || o.hold === 'discrepancy';
  }
  chatSay(o: Order, mine: string, reply: string, action?: string, ctx?: string) {
    const now = Date.now();
    this.setState(x => ({ msg: '', chat: Object.assign({}, x.chat, { [o.id]: [...(x.chat[o.id] || []), { me: true, text: mine, at: now }] }) }));
    setTimeout(() => this.setState(x => ({ chat: Object.assign({}, x.chat, { [o.id]: [...(x.chat[o.id] || []), { me: false, text: reply, at: Date.now(), action: action || '', ctx: ctx || '' }] }) })), 700);
  }
  chatRefund(o: Order, disc?: boolean, typed?: string) {
    const mine = typed || (disc ? 'I would like a refund for the difference in my delivery.' : 'I would like to request a refund for ' + o.id + '.');
    if (!this.refundable(o)) {
      const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
      const inProg = !!o.refund && !['declined', 'refunded'].includes(o.refund.status);
      const why = o.kind !== 'buy' ? 'Sell requests are paid to you, so there is nothing to refund. If a payment to you is wrong, tell us here and we will check it.' : o.idx < pi ? 'Nothing has been paid on ' + o.id + ' yet, so there is nothing to refund. You can decline the quotation or cancel before paying.' : inProg ? 'Refund ' + o.refund!.ref + ' is already in progress. I will update you here.' : !MB.stages('buy')[o.idx + 1] ? o.id + ' is completed, so refunds are closed. If something is wrong, describe it here and our team will review it.' : 'A refund cannot be requested on ' + o.id + ' at this stage. Our team will help you here.';
      return this.chatSay(o, mine, why, inProg ? 'trackRefund' : '');
    }
    const paid = (o.quote ? o.quote.total : 0) - (o.refundedSoFar || 0);
    this.chatSay(o, mine, 'You can request ' + (disc ? 'a partial refund for the missing or damaged quantity' : 'a full or partial refund of up to ' + MB.money(paid)) + ' on ' + o.id + '. Fill in the refund form and we will review it within 2 working days. The order is paused while we review.', 'refund', disc ? 'Delivery discrepancy: ' + ((o.disc || { note: '' }).note || '') : (typed || ''));
  }
  cancelInfo(o?: Order): { mode: 'none' | 'free' | 'refund' } {
    if (!o || o.rejected || o.cancelled || this.view(o).done) return { mode: 'none' };
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
      this.setState(x => ({ stack: x.stack.filter(k => k !== 'cancel') }));
      return this.flash('Your order is cancelled once the full refund is approved');
    }
    const now = Date.now(), sell = o.kind === 'sell';
    this.patchOrder(o.id, x => this.log(x, 'You', sell ? 'Sell request cancelled by you' : 'Order cancelled by you', why, { cancelled: { reason: c.reason, note: (c.note || '').trim(), at: now }, hold: '' }));
    this.notify(o, sell ? 'Sell request cancelled' : 'Order cancelled', o.id + ' · ' + c.reason);
    this.setState({ cx: { reason: '', note: '', agree: false }, cxErr: '' });
    this.flash(sell ? 'Sell request cancelled' : 'Order cancelled'); this.back();
  }
  openRefund(o?: Order, pre?: Partial<AppState['rf']>) {
    if (!o) return;
    if (!this.refundable(o)) {
      const st = MB.stages('buy'), pi = st.findIndex(x => x.key === 'paid');
      return this.flash(o.kind !== 'buy' ? 'Sell requests are paid to you, so they cannot be refunded' : o.idx < pi ? 'Nothing has been paid on ' + o.id + ' yet' : o.refund && !['declined', 'refunded'].includes(o.refund.status) ? 'Refund ' + o.refund.ref + ' is already in progress' : 'A refund cannot be requested on ' + o.id + ' now');
    }
    this.setState({ oid: o.id, rfErr: '', rf: Object.assign(emptyRefund(), pre || {}), rfFieldErr: {} });
    this.go('refund', { oid: o.id });
  }
  submitRefund() {
    const s = this.state, o = this.order(), r = s.rf;
    if (!o || !this.refundable(o)) return this.flash('A refund can’t be requested on this order right now');
    const paid = (o.quote ? o.quote.total : 0) - (o.refundedSoFar || 0);
    if (!r.reason) return this.setState({ rfErr: 'Choose a reason' });
    if (r.note.trim().length < 10) return this.setState({ rfErr: 'Describe what happened in at least 10 characters' });
    let amount = paid;
    if (r.type === 'partial') { amount = parseFloat(String(r.amount).replace(/[^\d.]/g, '')); if (!(amount > 0)) return this.setState({ rfErr: 'Enter the amount to refund' }); if (amount >= paid) return this.setState({ rfErr: 'A partial refund must be less than ' + MB.money(paid) + '. Choose full refund instead.' }); }
    const fe: Errs = {}, v = (k: keyof typeof r) => String(r[k] || '').trim();
    if (r.dest === 'bank') { if (v('holder').length < 2) fe.holder = 'Enter the account holder name'; if (v('bank').length < 2) fe.bank = 'Enter the bank name'; if (!/^\d{6,18}$/.test(v('account').replace(/\s/g, ''))) fe.account = 'Enter a 6–18 digit account number'; if (v('account2').replace(/\s/g, '') !== v('account').replace(/\s/g, '')) fe.account2 = 'Account numbers do not match'; if (!/^[A-Za-z0-9]{6,11}$/.test(v('code'))) fe.code = 'Enter a valid IFSC (11), SWIFT (8 or 11) or sort code'; if (v('country').length < 2) fe.country = 'Enter the bank country'; }
    if (r.dest === 'upi') { if (!/^[\w.-]{2,}@[A-Za-z]{2,}$/.test(v('upi'))) fe.upi = 'Enter a valid UPI ID, like name@bank'; if (v('upiName').length < 2) fe.upiName = 'Enter the name on the UPI account'; }
    if (r.dest === 'btc') { if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v('addr'))) fe.addr = 'Enter a valid Bitcoin address (starts with bc1, 1 or 3)'; if (v('addr2') !== v('addr')) fe.addr2 = 'Addresses do not match'; }
    if (Object.keys(fe).length) return this.setState({ rfFieldErr: fe, rfErr: 'Check the ' + ({ bank: 'bank account', upi: 'UPI', btc: 'wallet', original: '' }[r.dest]) + ' details' });
    if (!r.agree) return this.setState({ rfErr: 'Tick the confirmation to submit' });
    const method = (o.form || {}).method || 'Bank transfer', to = r.dest === 'bank' ? r.bank.trim() + ' ••' + String(r.account).replace(/\s/g, '').slice(-4) + ' (' + r.holder.trim() + ')' : r.dest === 'upi' ? 'UPI ' + r.upi.trim() : r.dest === 'btc' ? 'BTC wallet ' + r.addr.trim().slice(0, 6) + '…' + r.addr.trim().slice(-4) : 'original ' + method;
    const ref = 'MB-RF-26-' + String(Date.now()).slice(-5), now = Date.now();
    this.patchOrder(o.id, c => this.log(c, 'You', 'Refund requested', (r.type === 'full' ? 'Full refund ' : 'Partial refund ') + MB.money(amount) + ' · ' + r.reason + ' · ' + r.note.trim(), { hold: 'refund', history: [...(c.history || []), ...(c.refund ? [c.refund] : [])], refund: { fromDisc: c.hold === 'discrepancy', ref, amount, type: r.type, reason: r.reason, note: r.note.trim(), to, files: r.files, status: 'requested', at: now } }));
    this.notify(o, 'Refund requested', ref + ' · ' + MB.money(amount));
    this.setState({ rfErr: '', rf: emptyRefund(), rfFieldErr: {} });
    this.flash('Refund request submitted · ' + ref); this.back();
  }

  // ---- Documents
  openDoc(spec: DocSpec) { this.go('doc', { doc: spec }); }
  docData(spec?: DocSpec): DocData {
    const s = this.state, u = s.user || DEMO_USER, sp: DocSpec = spec || { t: '' };
    const o = sp.oid ? s.orders.find(x => x.id === sp.oid) : undefined, p = sp.pid ? MB.product(sp.pid) : undefined;
    const R = (k: string, v: unknown, strong?: boolean) => ({ k, v: String(v == null || v === '' ? '—' : v), w: (strong ? 700 : 500) as 500 | 700, mono: !!strong });
    const items = o && o.kind === 'buy' ? o.items.map(it => [MB.product(it.pid) || ({} as Product), it] as const) : [];
    const total = o && o.quote ? o.quote.total : 0, prod = o && o.auction ? total : Math.max(0, (total - 4200) / 1.012);
    const pp: [string, string][] = o && o.kind === 'sell' ? [['SELLER', u.name + ' · ' + u.business], ['BUYER', 'Mineral Bridge Ltd']] : [['BUYER', u.name + ' · ' + u.business], ['SELLER', 'Mineral Bridge Ltd']];
    const at = (re: RegExp) => { const l = o && o.log.find(x => re.test(x.text)); return MB.fmt(l ? l.at : Date.now()); };
    const lines = o ? (o.kind === 'sell' && o.sell ? [R(o.sell.name, o.sell.qty + ' ' + o.sell.unit + ' · ' + o.sell.grade)] : items.map(([x, it]) => R(x.name + ' · ' + x.id, (it.uIn && it.uIn !== x.unit ? it.qIn + ' ' + it.uIn : it.qty + ' ' + x.unit) + (x.lab ? ' · ' + x.grade : '')))) : [];
    const ship: Partial<NonNullable<Order['ship']>> = (o && o.ship) || {};
    type D = Partial<DocData> & Pick<DocData, 'title' | 'no' | 'date' | 'status' | 'parties' | 'sections'>;
    const D: Record<string, () => D> = {
      quote: () => ({ title: 'Price quotation', no: o!.quote!.no + (o!.quote!.rev ? '-R' + o!.quote!.rev : ''), date: MB.fmt(o!.quote!.issued), status: 'VALID', parties: pp, sections: [{ h: 'ITEMS', rows: lines }, { h: 'PRICE', rows: o!.kind === 'sell' ? [R('Agreed price, full quantity', MB.money(total), true)] : [R('Product', MB.money(prod)), R('Verification & escrow fee (1.2%)', MB.money(prod * 0.012)), R('Insured transport', MB.money(4200)), R('Total', MB.money(total), true)] }, { h: 'TERMS', rows: [R('Valid until', MB.fmt(o!.quote!.valid)), R('Order', o!.id)] }], note: 'Prices are fixed once both parties sign the e-contract.' }),
      contract: () => ({ title: o!.auction ? 'Auction sale contract' : 'E-contract', no: 'EC-' + o!.id.slice(-5), date: at(/countersigned|accepted as the e-contract/), status: 'SIGNED', parties: pp, sections: [{ h: 'SUBJECT', rows: lines.concat([R('Price', MB.money(total), true)]) }, { h: 'CLAUSES', rows: [R('Payment', o!.kind === 'sell' ? 'Released after inspection approval' : 'Due before dispatch'), R('Quality', o!.kind === 'sell' ? 'Mineral Bridge and SGS inspection' : 'Sold with existing test reports'), R('Delivery', 'Insured transport with tracking'), R('Disputes', 'Resolved before completion')] }, { h: 'SIGNATURES', rows: [R(u.name, o!.auction ? 'Accepted auction terms' : 'Signed electronically'), R('Mineral Bridge Ltd', 'Countersigned')] }] }),
      payment: () => ({ title: 'Payment receipt', no: o!.txn || 'PR-' + o!.id.slice(-5), date: at(/Payment made/), status: o!.txn ? 'CONFIRMED' : 'PROCESSING', parties: [['PAID BY', u.name + ' · ' + u.business], ['PAID TO', 'Mineral Bridge Ltd']], sections: [{ h: 'PAYMENT', rows: [R('Order', o!.id), R('Method', (o!.form || {}).method), R('Status', o!.txn ? 'Confirmed by Mineral Bridge' : 'Awaiting confirmation'), R('Amount', MB.money(total), true)] }], note: o!.txn ? '' : 'This receipt becomes final once Mineral Bridge confirms the funds.' }),
      invoice: () => ({ title: 'Tax invoice', no: 'INV-' + o!.id.slice(-5), date: at(/Payment confirmed/), status: 'PAID', parties: [['BILLED TO', u.business + (o!.addr ? ', ' + [o!.addr.street, o!.addr.city, o!.addr.country].filter(Boolean).join(', ') : '')], ['FROM', 'Mineral Bridge Ltd, Lagos']], sections: [{ h: 'ITEMS', rows: lines }, { h: 'AMOUNT', rows: o!.auction ? [R('Winning bid', MB.money(total)), R('Total paid', MB.money(total), true)] : [R('Product', MB.money(prod)), R('Fee and transport', MB.money(total - prod)), R('Total paid', MB.money(total), true)] }, { h: 'PAYMENT', rows: [R('Method', (o!.form || {}).method), R('Transaction', o!.txn)] }] }),
      inspection: () => ({ title: 'Inspection report', no: 'INS-' + o!.id.slice(-5), date: MB.fmt(o!.company!.at), status: 'COMPLETED', parties: [['INSPECTED BY', o!.company!.by], ['LOCATION', (o!.form || {}).address || '—']], sections: [{ h: 'FINDINGS', rows: lines.concat([R('Result', o!.company!.result, true)]) }] }),
      sgs: () => ({ title: 'Third-party test report', no: o!.sgs!.no, date: MB.fmt(o!.sgs!.at), status: 'COMPLIANT', issuer: 'SGS', parties: [['LABORATORY', 'SGS (independent inspector)'], ['CLIENT', 'Mineral Bridge Ltd']], sections: [{ h: 'RESULTS', rows: (o!.kind === 'sell' && o!.sell ? [['Net weight', o!.sell.qty + ' ' + o!.sell.unit], ['Grade', o!.sell.grade]] : items.map(([x, it]) => [x.name, it.qty + ' ' + x.unit + ' · ' + x.grade])).concat([['Sampling', 'ISO 3082 composite'], ['Result', o!.sgs!.result || 'Compliant']]).map(([k, v], i, a) => R(k, v, i === a.length - 1)) }], signer: 'SGS Laboratory', signerRole: 'AUTHORISED ANALYST' }),
      payout: () => ({ title: 'Payment advice', no: 'PA-' + o!.id.slice(-5), date: at(/Payment released/), status: 'RELEASED', parties: [['PAID TO', u.name + ' · ' + u.business], ['FROM', 'Mineral Bridge Ltd']], sections: [{ h: 'PAYMENT', rows: [R('Sell request', o!.id), R('Method', (o!.form || {}).method), R('Amount', MB.money(total), true)] }] }),
      shipment: () => ({ title: sp.name || 'Consignment note', no: ship.id || '', date: MB.fmt(((ship.events || [])[0] || [0, Date.now()])[1] as number), status: String(ship.status || '').toUpperCase(), issuer: String(ship.partner || '').toUpperCase(), parties: [['FROM', ship.from || '—'], ['TO', ship.to || '—']], sections: [{ h: 'CONSIGNMENT', rows: lines }, { h: 'TRANSPORT', rows: [R('Carrier', ship.partner), R('Mode', ship.mode), R('Vehicle', ship.vehicle), R('Seals', ship.seals), R('ETA', ship.eta)] }], signer: ship.partner, signerRole: 'CARRIER' }),
      pod: () => ({ title: 'Proof of delivery', no: 'POD-' + ship.id, date: at(/Delivered|Received/), status: 'DELIVERED', parties: [['DELIVERED TO', ship.to || '—'], ['CARRIER', ship.partner || '—']], sections: [{ h: 'DELIVERY', rows: lines.concat([R('Received by', ship.pod), R('Seals', (ship.seals || '—') + ' · intact')]) }], signer: ship.partner, signerRole: 'CARRIER' }),
      completion: () => ({ title: 'Completion certificate', no: 'CC-' + o!.id.slice(-5), date: at(/completed/i), status: 'COMPLETED', parties: pp, sections: [{ h: 'ORDER', rows: lines.concat([R('Receipt confirmed', at(/Receipt confirmed/)), R('Total', MB.money(total), true)]) }] }),
      refund: () => { const r = [...(o!.history || []), o!.refund].find(x => x && x.ref === sp.ref) || o!.refund!; return { title: 'Refund receipt', no: r.ref, date: MB.fmt((r.at_refunded as number) || r.at), status: 'REFUNDED', parties: [['REFUNDED TO', u.name + ' · ' + r.to], ['FROM', 'Mineral Bridge Ltd']], sections: [{ h: 'REFUND', rows: [R('Order', o!.id), R('Type', r.type === 'full' ? 'Full refund' : 'Partial refund'), R('Reason', r.reason), R('Bank reference', r.bankRef), R('Amount', MB.money(r.amount), true)] }] }; },
      cancel: () => ({ title: 'Cancellation confirmation', no: 'CX-' + o!.id.slice(-5), date: MB.fmt(o!.cancelled!.at), status: 'CANCELLED', parties: pp, sections: [{ h: o!.kind === 'sell' ? 'SELL REQUEST' : 'ORDER', rows: lines.concat([R('Reference', o!.id), R('Cancelled by', u.name), R('Reason', o!.cancelled!.reason + (o!.cancelled!.note ? ' · ' + o!.cancelled!.note : '')), R('Amount charged', MB.money(0), true)]) }], note: 'Any quotation and e-contract on this ' + (o!.kind === 'sell' ? 'sell request' : 'order') + ' are withdrawn.' }),
      auction: () => { const a = (s.auctions || []).find(x => x.id === (o ? o.auction : sp.aid)) || ({ id: '', bids: [], qty: 0, start: 0, endsAt: Date.now(), pid: '' } as unknown as Auction); const x = MB.product(a.pid) || ({} as Product); return { title: 'Auction result certificate', no: 'AR-' + a.id, date: MB.fmt(a.endsAt), status: 'WON', parties: [['WINNING BIDDER', u.name + ' · ' + u.business], ['AUCTIONEER', 'Mineral Bridge Ltd']], sections: [{ h: 'LOT', rows: [R('Lot', x.name + ' · ' + x.id), R('Quantity', a.qty + ' ' + x.unit), R('Bids received', a.bids.length)] }, { h: 'RESULT', rows: [R('Starting bid', MB.money(a.start)), R('Winning bid', MB.money(this.aucCur(a)), true)] }], note: 'Payment of the winning bid is required to release the lot for dispatch.' }; },
      lotReport: () => ({ title: 'Test report', no: p!.cert + '-TR', date: '14 Oct 2026', status: 'CERTIFIED', issuer: String(p!.lab).toUpperCase(), parties: [['LABORATORY', p!.lab], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'RESULTS', rows: [R('Form', p!.form), R('Method', 'Fire assay · ISO 11426'), R('Sample', 'Composite of 5 points'), R('Purity / grade', p!.grade, true)] }], signer: p!.lab, signerRole: 'AUTHORISED ANALYST' }),
      lotCoa: () => ({ title: 'Certificate of analysis', no: p!.cert, date: '15 Oct 2026', status: 'VALID', issuer: String(p!.lab).toUpperCase(), parties: [['ISSUED BY', p!.lab], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'CERTIFIED VALUES', rows: [R('Available quantity', p!.avail + ' ' + p!.unit), R('Origin', p!.origin), R('Grade', p!.grade, true)] }], signer: p!.lab, signerRole: 'CERTIFYING OFFICER' }),
      lotOrigin: () => ({ title: 'Origin declaration', no: 'OD-' + p!.id, date: '12 Oct 2026', status: 'DECLARED', parties: [['ORIGIN', p!.origin], ['LOT', p!.name + ' · ' + p!.id]], sections: [{ h: 'DECLARATION', rows: [R('Mine of origin', p!.origin.split(' · ')[0]), R('Extraction', 'Licensed operation'), R('Due diligence', 'OECD Annex II screening passed')] }] }),
    };
    const fn = D[sp.t] as (() => D) | undefined;
    let d: D | null = null;
    try { d = fn && (o || p || sp.t === 'auction') ? fn() : null; } catch { d = null; }
    if (!d) return { title: 'Document unavailable', no: '', date: '—', status: '', parties: [], sections: [], issuer: '', signer: '', signerRole: '', note: 'This document is not available yet.' };
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
    const d = this.docData(spec || this.state.doc);
    if (!d.no) return this.flash('This document is not available yet');
    const file = this.docFile(d);
    Share.share({ title: file, message: this.docText(d) })
      .then(r => { if (r.action !== Share.dismissedAction) this.flash('Downloaded ' + file); })
      .catch(() => this.flash('Download failed. Try again.'));
  }

  resetDemo() { this.state = fresh(); this.version++; this.listeners.forEach(l => l()); this.flash('Demo data reset'); }
}
