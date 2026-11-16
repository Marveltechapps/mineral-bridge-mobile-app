// Regression tests for the Mineral Bridge app store (navigation, order stages,
// refunds, auctions). These exercise the same logic the screens call.
import { MBStore } from '../src/context/store';
import { DEMO_USER } from '../src/context/state';
import * as MB from '../src/lib/mb4';

jest.useFakeTimers();

function signedIn() {
  const s = new MBStore();
  s.setState({ user: { ...DEMO_USER }, screen: 'home', stack: [] });
  return s;
}

describe('navigation stack', () => {
  it('go pushes, back pops, back on an empty stack returns home', () => {
    const s = signedIn();
    s.go('cats');
    s.go('minerals');
    expect(s.state.stack).toEqual(['home', 'cats']);
    s.back();
    expect(s.state.screen).toBe('cats');
    s.jump('orders');
    s.back();
    expect(s.state.screen).toBe('home');
  });
});

describe('auth and gating', () => {
  it('rejects a short WhatsApp number and accepts a valid one', () => {
    const s = new MBStore();
    s.setState({ screen: 'auth', auth: { ...s.state.auth, mode: 'signin', value: '123' } });
    s.primary();
    expect(s.state.authErr).toMatch(/valid WhatsApp number/);
    s.setState({ auth: { ...s.state.auth, value: '8034127790' } });
    s.primary();
    expect(s.state.screen).toBe('otp');
  });
  it('sends guests to sign in before checkout', () => {
    const s = new MBStore();
    s.setState({ screen: 'cart', cart: [{ pid: 'G-1041', qty: 1 }] });
    s.primary();
    expect(s.state.screen).toBe('auth');
    expect(s.state.returnTo).toBe('checkout');
  });
});

describe('buy flow', () => {
  it('validates minimum quantity and converts units', () => {
    const s = signedIn();
    s.setState({ screen: 'detail', pid: 'G-1041', qty: '500', qu: { pid: 'G-1041', u: 'g' } });
    s.primary();
    expect(s.state.qtyErr).toMatch(/Minimum order is 1,000 g/);
    s.setState({ qty: '2', qu: null });
    s.primary();
    expect(s.state.screen).toBe('cart');
    expect(s.state.cart[0]).toMatchObject({ pid: 'G-1041', qty: 2 });
  });

  it('places an order and walks it through quotation, contract and payment', () => {
    const s = signedIn();
    s.setState({ cart: [{ pid: 'G-1041', qty: 1, qIn: 1, uIn: 'kg' }] });
    s.prefillShip();
    s.setState({ screen: 'checkout' });
    s.placeOrder();
    jest.advanceTimersByTime(1000);
    expect(s.state.screen).toBe('placed');
    const id = s.state.oid;
    s.demo(''); // accepted
    s.demo(''); // quotation issued
    expect(s.view(s.order(id)!).actionScreen).toBe('quote');
    s.setState({ screen: 'quote' });
    s.primary();
    s.demo(''); // price confirmed
    s.setState({ screen: 'contract', sign: { read: true, name: 'wrong name' } });
    s.primary();
    expect(s.state.signErr).toMatch(/exactly as Adaeze Okafor/);
    s.setState({ sign: { read: true, name: 'adaeze okafor' } });
    s.primary();
    s.demo(''); // countersigned
    expect(s.view(s.order(id)!).actionScreen).toBe('pay');
    s.setState({ screen: 'pay', pmethod: 'Bank transfer', proof: false });
    s.primary();
    expect(s.state.payErr).toMatch(/transfer receipt/);
    s.setState({ proof: true });
    s.primary();
    const o = s.order(id)!;
    expect(MB.stages('buy')[o.idx].key).toBe('paid');
    expect(s.refundable(o)).toBe(true);
  });
});

describe('refunds', () => {
  it('requires valid bank details and moves the order on hold', () => {
    const s = signedIn();
    const o = s.state.orders.find(x => x.id === 'MB-ORD-26-10418')!;
    s.patchOrder(o.id, c => ({ ...c, idx: MB.stages('buy').findIndex(x => x.key === 'payOk'), quote: { no: 'Q-1', total: 100000, issued: 0, valid: 0 } }));
    s.setState({ oid: o.id });
    s.openRefund(s.order());
    expect(s.state.screen).toBe('refund');
    s.setState({ rf: { ...s.state.rf, reason: 'Paid twice', note: 'I paid this order twice by mistake', dest: 'bank', account: '12', agree: true } });
    s.primary();
    expect(s.state.rfFieldErr.account).toBeTruthy();
    s.setState({ rf: { ...s.state.rf, holder: 'Adaeze Okafor', bank: 'Zenith Bank', account: '1234567890', account2: '1234567890', code: 'ZEIBNGLA', country: 'Nigeria' } });
    s.primary();
    expect(s.order()!.hold).toBe('refund');
    expect(s.order()!.refund!.to).toContain('••7890');
  });
});

describe('auctions', () => {
  it('enforces $500 steps and records the winning bid', () => {
    const s = signedIn();
    s.openAuction('A-302');
    s.setState({ bidAmt: '182100' });
    s.primary();
    expect(s.state.bidErr).toMatch(/Minimum bid|steps of \$500/);
    s.setState({ bidAmt: '182500' });
    s.primary();
    expect(s.aucOf('A-302')!.bids.slice(-1)[0]).toMatchObject({ who: 'You', amt: 182500 });
    s.endAuction('A-302');
    expect(s.aucOf('A-302')!.result).toBe('won');
    expect(s.state.screen).toBe('auctionWon');
  });
});
