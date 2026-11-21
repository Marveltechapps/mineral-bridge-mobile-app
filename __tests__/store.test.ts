// Regression tests for the Mineral Bridge app store: navigation, sign-in, order stages, refunds, auctions and
// sign-out. The store talks to the live V2 API through ../src/services/*; those modules are mocked here with API
// fixtures, so these tests exercise the real validation, mapping and request-building logic without a network.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../src/services/auth.service');
jest.mock('../src/services/auctions.service');
jest.mock('../src/services/cart.service');
jest.mock('../src/services/catalogue.service');
jest.mock('../src/services/documents.service');
jest.mock('../src/services/files.service');
jest.mock('../src/services/kyc.service');
jest.mock('../src/services/me.service');
jest.mock('../src/services/notifications.service');
jest.mock('../src/services/orders.service');
jest.mock('../src/services/reference.service');
jest.mock('../src/services/refunds.service');
jest.mock('../src/services/support.service');
jest.mock('../src/services/realtime');

import { Linking } from 'react-native';
import { ApiError } from '../src/api';
import type { AuctionDetail, Me, OrderDetail, Refund } from '../src/api';
import { MBStore } from '../src/context/store';
import { EMPTY_USER } from '../src/context/state';
import * as MB from '../src/lib/mb4';
import { mapAuctionDetail, mapPriceVariation } from '../src/lib/mappers';
import type { Product } from '../src/types/mineralBridge';
import * as authSvc from '../src/services/auth.service';
import * as auctionsSvc from '../src/services/auctions.service';
import * as ordersSvc from '../src/services/orders.service';
import * as refundsSvc from '../src/services/refunds.service';
import * as meSvc from '../src/services/me.service';
import * as supportSvc from '../src/services/support.service';
import * as catalogueSvc from '../src/services/catalogue.service';

jest.useFakeTimers();

const ISO = '2026-11-18T10:00:00.000Z';
const mock = <T extends (...a: never[]) => unknown>(fn: T) => fn as unknown as jest.Mock;

/* ----------------------------------------------------------------- fixtures */

const GOLD: Product = { id: 'G-1041', mineral: 'gold', name: 'Gold dorÃ© bar', form: 'Bar', avail: 50, unit: 'kg', min: 1, grade: '99.5%', lab: 'SGS', cert: 'SGS-1', origin: 'Ghana', img: '', ref: 0 };

const USER = { ...EMPTY_USER, name: 'Adaeze Okafor', business: 'Okafor Metals Ltd', country: 'Nigeria', phone: '+2348034127790', email: 'ada@example.com', role: 'buyer' as const, buyerType: 'refinery', kyc: 'verified' as const, kycRef: 'KYC-1' };

const ME: Me = {
  id: 'u1', customerNo: 'C-1', fullName: 'Adaeze Okafor', email: 'ada@example.com', phone: '+2348034127790', whatsapp: '+2348034127790', countryCode: 'NG', role: 'buyer',
  business: { name: 'Okafor Metals Ltd', buyerType: 'refinery', sellerType: null, isBusiness: true }, kyc: { status: 'verified', reference: 'KYC-1', flags: {} },
  accountStatus: 'active', notificationPreferences: { email: true, sms: true, whatsapp: true, push: true }, createdAt: ISO,
};

const money = (minor: number) => ({ amountMinor: minor, currency: 'USD' });
const zero = money(0);

/** An order whose *awaited* workflow step is `step` (the UI index is the last completed step). */
function orderAt(step: string, over: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: 'oid-1', reference: 'MB-ORD-26-10418', kind: 'buy', status: 'open',
    workflow: { definition: 'buy', version: 1, current: { key: step, owner: 'customer', enteredAt: ISO } }, hold: null,
    lines: [{ productId: 'G-1041', name: 'Gold dorÃ© bar', grams: 1000, unitPriceMinorE4PerGram: 0, lineTotalMinor: 0 }], sell: null,
    delivery: { org: 'Okafor Metals Ltd', street: '1 Marina', city: 'Lagos', country: 'NG', contact: 'Adaeze Okafor', mobile: '+2348034127790' },
    totals: { subtotal: zero, platformFee: zero, surcharge: zero, total: zero }, timeline: [], createdAt: ISO, updatedAt: ISO, version: 1, ...over,
  };
}

const AUCTION: AuctionDetail = {
  id: 'auc-1', reference: 'A-302', name: 'Gold dorÃ© 12 kg', status: 'live', lot: { quantity: { value: 12, unit: 'kg' }, grade: '98%', display: '12 kg' }, description: null, badges: [], sampling: null,
  bidding: {
    startingBid: { amount: 18000000, currency: 'USD' }, highestBid: { amount: 18200000, currency: 'USD' }, minimumIncrement: { amount: 50000, currency: 'USD' }, nextValidBid: { amount: 18250000, currency: 'USD' },
    quickIncrements: [500], bidCount: 3, reserveMet: true, yourBid: null, youAreHighest: false,
  },
  closesAt: new Date(Date.now() + 3600e3).toISOString(), antiSniping: { enabled: false, extendByMinutes: 0, withinMinutes: 0 }, bindingNote: '', imageUrl: null, mediaCount: 0, version: 7,
} as unknown as AuctionDetail;

function signedIn() {
  const s = new MBStore();
  s.setState({ user: { ...USER }, screen: 'home', stack: [] });
  return s;
}

beforeEach(() => {
  jest.resetAllMocks();
  MB.setCategories([]);
  MB.upsertProducts([GOLD]);
  // Calls the store makes in the background after most actions.
  mock(ordersSvc.listDocuments).mockResolvedValue({ items: [] });
  mock(ordersSvc.getShipment).mockResolvedValue(null);
  mock(ordersSvc.listOrders).mockResolvedValue({ items: [], nextCursor: null });
  mock(refundsSvc.listRefunds).mockResolvedValue({ items: [], nextCursor: null });
});

/* -------------------------------------------------------------------- tests */

describe('initial state', () => {
  it('starts signed out with no demo data', () => {
    const s = new MBStore();
    expect(s.state.user).toBeNull();
    expect(s.state.orders).toEqual([]);
    expect(s.state.cart).toEqual([]);
    expect(s.state.notifs).toEqual([]);
    expect(s.state.auctions).toEqual([]);
    expect(s.state.screen).toBe('welcome');
  });
});

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
  it('rejects a short WhatsApp number and requests a code for a valid one', async () => {
    mock(authSvc.requestOtp).mockResolvedValue({ challengeId: 'ch-1', maskedDestination: '+234 â€¢â€¢â€¢ â€¢â€¢7790', codeLength: 4, expiresAt: ISO, resendAvailableAt: ISO });
    const s = new MBStore();
    s.setState({ screen: 'auth', auth: { ...s.state.auth, mode: 'signin', value: '123' } });
    s.primary();
    expect(s.state.authErr).toMatch(/valid WhatsApp number/);
    expect(authSvc.requestOtp).not.toHaveBeenCalled();
    s.setState({ auth: { ...s.state.auth, value: '8034127790' } });
    s.primary();
    s.primary(); // double tap must not send a second request
    await s.idle();
    expect(authSvc.requestOtp).toHaveBeenCalledTimes(1);
    expect(authSvc.requestOtp).toHaveBeenCalledWith({ intent: 'signin', channel: 'whatsapp', identifier: '+2348034127790' });
    expect(s.state.screen).toBe('otp');
    expect(s.state.challengeId).toBe('ch-1');
    expect(s.state.authBusy).toBe(false);
  });

  it('shows the server field error and clears the busy flag when the code request fails', async () => {
    mock(authSvc.requestOtp).mockRejectedValue(new ApiError({ status: 422, code: 'validation/failed', message: 'Bad', fields: { identifier: 'Enter a valid number' } }));
    const s = new MBStore();
    s.setState({ screen: 'auth', auth: { ...s.state.auth, mode: 'signin', value: '8034127790' } });
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('auth');
    expect(s.state.authErr).toBe('Enter a valid number');
    expect(s.state.authBusy).toBe(false);
  });

  it('signs in with a verified code and loads the account', async () => {
    mock(authSvc.verifyOtp).mockResolvedValue({ status: 'signed_in', accessToken: 'a', expiresIn: 900, refreshToken: 'r', me: ME });
    const s = new MBStore();
    s.setState({ screen: 'otp', challengeId: 'ch-1', otp: '1234', stack: ['welcome'] });
    s.primary();
    await s.idle();
    expect(authSvc.verifyOtp).toHaveBeenCalledWith(expect.objectContaining({ challengeId: 'ch-1', code: '1234' }));
    expect(s.state.user).toMatchObject({ name: 'Adaeze Okafor', role: 'buyer', kyc: 'verified' });
  });

  it('sends a new customer to registration', async () => {
    mock(authSvc.verifyOtp).mockResolvedValue({ status: 'needs_registration', registrationToken: 'reg-1' });
    const s = new MBStore();
    s.setState({ screen: 'otp', challengeId: 'ch-1', otp: '1234' });
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('regType');
    expect(s.state.registrationToken).toBe('reg-1');
  });

  it('keeps the user on the code screen when the code is wrong', async () => {
    mock(authSvc.verifyOtp).mockRejectedValue(new ApiError({ status: 401, code: 'auth/otp-invalid', message: 'That code is not correct' }));
    const s = new MBStore();
    s.setState({ screen: 'otp', challengeId: 'ch-1', otp: '9999' });
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('otp');
    expect(s.state.otpErr).toBeTruthy();
    expect(s.state.authBusy).toBe(false);
  });

  it('sends guests to sign in before checkout', () => {
    const s = new MBStore();
    s.setState({ screen: 'cart', cart: [{ pid: 'G-1041', qty: 1 }] });
    s.primary();
    expect(s.state.screen).toBe('auth');
    expect(s.state.returnTo).toBe('checkout');
  });

  it('signs out: clears every signed-in cache and returns to welcome', async () => {
    mock(authSvc.logout).mockResolvedValue(undefined);
    const s = signedIn();
    s.remote.applyDetail(orderAt('accepted'));
    s.setState({ cart: [{ pid: 'G-1041', qty: 1 }], unread: 3 });
    expect(s.state.orders).toHaveLength(1);
    s.setState({ sheet: 'logout' });
    s.remote.stop();
    await s.remote.logout();
    expect(authSvc.logout).toHaveBeenCalled();
    expect(s.state.user).toBeNull();
    expect(s.state.orders).toEqual([]);
    expect(s.state.cart).toEqual([]);
    expect(s.state.unread).toBe(0);
  });
});

describe('buy flow', () => {
  it('validates minimum quantity and converts units', async () => {
    const s = signedIn();
    s.setState({ screen: 'detail', pid: 'G-1041', qty: '500', qu: { pid: 'G-1041', u: 'g' } });
    s.primary();
    expect(s.state.qtyErr).toMatch(/Minimum order is 1,000 g/);
    s.setState({ qty: '2', qu: null });
    // Signed in: the line is saved to the server cart.
    mock(require('../src/services/cart.service').putItem).mockResolvedValue({
      items: [{ productId: 'G-1041', name: 'Gold dorÃ© bar', qty: { value: 2, unit: 'kg' }, grams: 2000 }], version: 1,
    });
    s.primary();
    await s.idle();
    expect(require('../src/services/cart.service').putItem).toHaveBeenCalledWith('G-1041', { value: 2, unit: 'kg' });
  });

  it('keeps a guest cart locally', async () => {
    const s = new MBStore();
    s.setState({ screen: 'detail', pid: 'G-1041', qty: '2', qu: null });
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('cart');
    expect(s.state.cart[0]).toMatchObject({ pid: 'G-1041', qty: 2 });
  });

  it('places an order from the cart and walks it through quotation, contract and payment', async () => {
    const s = signedIn();
    s.setState({ cart: [{ pid: 'G-1041', qty: 1, qIn: 1, uIn: 'kg' }] });
    s.prefillShip();
    s.setState(x => ({ ship: { ...x.ship, street: '1 Marina', city: 'Lagos' }, screen: 'checkout' }));
    mock(ordersSvc.createBuyOrder).mockResolvedValue(orderAt('accepted'));
    s.placeOrder();
    s.placeOrder(); // double tap
    await s.idle();
    expect(ordersSvc.createBuyOrder).toHaveBeenCalledTimes(1);
    expect(ordersSvc.createBuyOrder).toHaveBeenCalledWith(expect.objectContaining({ fromCart: true, delivery: expect.objectContaining({ country: 'NG' }) }), expect.any(String));
    expect(s.state.screen).toBe('placed');
    expect(s.state.placing).toBe(false);
    const id = s.state.oid;
    expect(id).toBe('MB-ORD-26-10418');
    expect(s.state.cart).toEqual([]);

    // Quotation issued: the customer accepts it.
    s.remote.applyDetail(orderAt('quoteOk'));
    expect(s.view(s.order(id)!).actionScreen).toBe('quote');
    mock(ordersSvc.acceptQuote).mockResolvedValue(orderAt('confirmed', { version: 2 }));
    s.setState({ screen: 'quote', stack: ['order'] });
    s.primary();
    await s.idle();
    expect(ordersSvc.acceptQuote).toHaveBeenCalledWith(id, expect.objectContaining({ version: 1, quotationNumber: expect.stringMatching(/^Q-/) }));
    expect(s.order(id)!.ver).toBe(2);

    // E-contract: the typed name must match exactly.
    s.remote.applyDetail(orderAt('contract', { version: 3 }));
    mock(ordersSvc.getContract).mockResolvedValue({ number: 'C-1', html: '', pdfUrl: null, documentHash: 'hash-1', parties: [], clauses: [], signatures: {} });
    mock(ordersSvc.signContract).mockResolvedValue(orderAt('contractMb', { version: 4 }));
    s.setState({ screen: 'contract', stack: ['order'], sign: { read: true, name: 'wrong name' } });
    s.primary();
    expect(s.state.signErr).toMatch(/exactly as Adaeze Okafor/);
    expect(ordersSvc.signContract).not.toHaveBeenCalled();
    s.setState({ sign: { read: true, name: 'adaeze okafor' } });
    s.primary();
    await s.idle();
    expect(ordersSvc.signContract).toHaveBeenCalledWith(id, expect.objectContaining({ documentHash: 'hash-1', nameTyped: 'adaeze okafor', readConfirmed: true, version: 3 }));

    // Payment: a bank transfer needs an uploaded receipt.
    s.remote.applyDetail(orderAt('paid', { version: 5 }));
    expect(s.view(s.order(id)!).actionScreen).toBe('pay');
    s.setState({ screen: 'pay', stack: ['order'], pmethod: 'Bank transfer' });
    s.primary();
    expect(s.state.payErr).toMatch(/receipt/i);
    expect(ordersSvc.submitPayment).not.toHaveBeenCalled();
    mock(ordersSvc.submitPayment).mockResolvedValue(orderAt('payOk', { version: 6 }));
    s.setState(x => ({ uploads: { ...x.uploads, proof: [{ fileId: 'f-1', name: 'receipt.jpg', uri: 'file:///r.jpg', type: 'image/jpeg' }] } }));
    s.primary();
    await s.idle();
    expect(ordersSvc.submitPayment).toHaveBeenCalledWith(id, expect.objectContaining({ proofFileIds: ['f-1'], version: 5 }), expect.any(String));
    const o = s.order(id)!;
    expect(MB.stages('buy')[o.idx].key).toBe('paid');
    expect(s.state.paying).toBe(false);
    expect(s.refundable(o)).toBe(true);
  });

  it('reports a field error from checkout and never leaves placing stuck', async () => {
    const s = signedIn();
    s.setState({ cart: [{ pid: 'G-1041', qty: 1, qIn: 1, uIn: 'kg' }] });
    s.prefillShip();
    s.setState(x => ({ ship: { ...x.ship, street: '1 Marina', city: 'Lagos' }, screen: 'checkout' }));
    mock(ordersSvc.createBuyOrder).mockRejectedValue(new ApiError({ status: 422, code: 'validation/failed', message: 'Bad', fields: { 'delivery.street': 'Street is too short' } }));
    s.placeOrder();
    await s.idle();
    expect(s.state.screen).toBe('checkout');
    expect(s.state.shipErr.street).toBe('Street is too short');
    expect(s.state.placing).toBe(false);
  });

  it('refetches the order on a version conflict instead of overwriting it', async () => {
    const s = signedIn();
    s.remote.applyDetail(orderAt('quoteOk'));
    mock(ordersSvc.acceptQuote).mockRejectedValue(new ApiError({ status: 409, code: 'order/version-conflict', message: 'Changed' }));
    mock(ordersSvc.getOrder).mockResolvedValue(orderAt('quoteOk', { version: 9 }));
    s.setState({ screen: 'quote', stack: ['order'], oid: 'MB-ORD-26-10418' });
    s.primary();
    await s.idle();
    expect(ordersSvc.getOrder).toHaveBeenCalledWith('MB-ORD-26-10418');
    expect(s.order('MB-ORD-26-10418')!.ver).toBe(9);
    expect(s.state.screen).toBe('quote');
  });
});

describe('refunds', () => {
  it('requires valid bank details, submits the request and moves the order on hold', async () => {
    const s = signedIn();
    const o = s.remote.applyDetail(orderAt('assigned', { totals: { subtotal: money(10000000), platformFee: zero, surcharge: zero, total: money(10000000) } }));
    expect(s.refundable(o)).toBe(true);
    s.setState({ oid: o.id });
    s.openRefund(s.order());
    expect(s.state.screen).toBe('refund');
    s.setState({ rf: { ...s.state.rf, reason: 'Paid twice', note: 'I paid this order twice by mistake', dest: 'bank', account: '12', agree: true } });
    s.primary();
    expect(s.state.rfFieldErr.account).toBeTruthy();
    expect(refundsSvc.createRefund).not.toHaveBeenCalled();

    const dto = {
      ref: 'MB-RF-1', id: 'rf-1', orderId: 'oid-1', type: 'full', amount: money(10000000), reason: 'Paid twice', note: 'I paid this order twice by mistake', status: 'requested',
      destination: { method: 'bank', bankName: 'Zenith Bank', accountMasked: 'â€¢â€¢7890' }, attachmentFileIds: [], refundedAt: null, dueBy: ISO, createdAt: ISO, overdue: false,
    } as unknown as Refund;
    mock(refundsSvc.createRefund).mockResolvedValue(dto);
    mock(refundsSvc.listRefunds).mockResolvedValue({ items: [dto], nextCursor: null });
    mock(ordersSvc.getOrder).mockResolvedValue(orderAt('assigned', { version: 2, hold: { type: 'refund', owner: 'platform' } }));
    s.setState({ rf: { ...s.state.rf, holder: 'Adaeze Okafor', bank: 'Zenith Bank', account: '1234567890', account2: '1234567890', code: 'ZEIBNGLA', country: 'Nigeria' } });
    s.primary();
    await s.idle();
    expect(refundsSvc.createRefund).toHaveBeenCalledWith(o.id, expect.objectContaining({ type: 'full', destination: expect.objectContaining({ method: 'bank', accountMasked: 'â€¢â€¢7890' }), agree: true }), expect.any(String));
    expect(s.order()!.hold).toBe('refund');
    expect(s.order()!.refund!.to).toContain('â€¢â€¢7890');
  });

  it('shows the server message when a refund is rejected', async () => {
    const s = signedIn();
    const o = s.remote.applyDetail(orderAt('assigned'));
    s.setState({ oid: o.id });
    s.openRefund(s.order());
    s.setState({ rf: { ...s.state.rf, reason: 'Paid twice', note: 'I paid this order twice by mistake', dest: 'bank', holder: 'Adaeze Okafor', bank: 'Zenith Bank', account: '1234567890', account2: '1234567890', code: 'ZEIBNGLA', country: 'Nigeria', agree: true } });
    mock(refundsSvc.createRefund).mockRejectedValue(new ApiError({ status: 409, code: 'refund/open-exists', message: 'A refund is already open for this order' }));
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('refund');
    expect(s.state.rfErr).toMatch(/already open/);
  });
});

describe('auctions', () => {
  function withAuction() {
    const s = signedIn();
    s.setState({ auctions: [mapAuctionDetail(AUCTION)] });
    return s;
  }

  it('enforces the server minimum and step, then records the winning bid', async () => {
    const s = withAuction();
    s.openAuction('A-302');
    expect(s.state.bidAmt).toBe('182500');
    s.setState({ bidAmt: '182100' });
    s.primary();
    expect(s.state.bidErr).toMatch(/Minimum bid|steps of \$500/);
    expect(auctionsSvc.placeBid).not.toHaveBeenCalled();
    mock(auctionsSvc.placeBid).mockResolvedValue({
      bid: { id: 'b1', amount: { amount: 18250000, currency: 'USD' }, placedAt: ISO, leading: true },
      auction: { highestMinor: 18250000, bidCount: 4, closesAt: AUCTION.closesAt, version: 8, currency: 'USD' },
    });
    mock(auctionsSvc.getAuction).mockResolvedValue(AUCTION);
    mock(auctionsSvc.listBids).mockResolvedValue({ items: [] });
    s.setState({ bidAmt: '182500' });
    s.primary();
    await s.idle();
    expect(auctionsSvc.placeBid).toHaveBeenCalledWith('auc-1', 18250000, 7, expect.any(String));
    expect(s.aucOf('A-302')!.bids.slice(-1)[0]).toMatchObject({ who: 'You', amt: 182500 });
    expect(s.state.bidErr).toBe('');
    s.endAuction('A-302'); // development-only local simulation of the close
    expect(s.aucOf('A-302')!.result).toBe('won');
    expect(s.state.screen).toBe('auctionWon');
  });

  it('shows the server message when a bid is refused', async () => {
    const s = withAuction();
    s.openAuction('A-302');
    mock(auctionsSvc.placeBid).mockRejectedValue(new ApiError({ status: 403, code: 'kyc/required', message: 'Complete KYC to bid' }));
    s.primary();
    await s.idle();
    expect(s.state.bidErr).toBe('Complete KYC to bid');
  });
});

describe('contact change (phone / email OTP)', () => {
  const editing = () => {
    const s = signedIn();
    s.setState({ edit: { name: USER.name, business: USER.business, email: USER.email, phone: USER.phone, country: 'Nigeria' }, editErr: {} });
    s.go('editProfile');
    return s;
  };
  const challenge = { challengeId: 'cc-1', maskedDestination: 'n••••@example.com', resendAvailableAt: new Date(Date.now() - 1000).toISOString() };

  it('validates the new value before asking the server for a code', async () => {
    const s = editing();
    s.startContactChange('email', 'email', 'not-an-email');
    expect(s.state.editErr.email).toMatch(/valid email/);
    s.startContactChange('email', 'email', 'ADA@example.com');
    expect(s.state.editErr.email).toMatch(/already your email/);
    s.startContactChange('phone', 'whatsapp', '123');
    expect(s.state.editErr.phone).toMatch(/valid number/);
    await s.idle();
    expect(meSvc.contactChange).not.toHaveBeenCalled();
    expect(s.state.screen).toBe('editProfile');
  });

  it('sends a code to the new email, verifies it, updates the user and returns to edit profile', async () => {
    mock(meSvc.contactChange).mockResolvedValue(challenge);
    const s = editing();
    s.startContactChange('email', 'email', ' New@Example.com ');
    s.startContactChange('email', 'email', ' New@Example.com '); // double tap
    await s.idle();
    expect(meSvc.contactChange).toHaveBeenCalledTimes(1);
    expect(meSvc.contactChange).toHaveBeenCalledWith({ channel: 'email', identifier: 'new@example.com' });
    expect(s.state.screen).toBe('contactOtp');
    expect(s.state.contact).toMatchObject({ field: 'email', challengeId: 'cc-1', masked: 'n••••@example.com' });

    s.setState({ contactCode: '12' });
    s.primary();
    expect(s.state.contactErr).toMatch(/4 digits/);
    expect(meSvc.verifyContactChange).not.toHaveBeenCalled();

    mock(meSvc.verifyContactChange).mockResolvedValue({ ...ME, email: 'new@example.com' });
    s.setState({ contactCode: '4821' });
    s.primary();
    await s.idle();
    expect(meSvc.verifyContactChange).toHaveBeenCalledWith('cc-1', '4821');
    expect(meSvc.patchMe).not.toHaveBeenCalled();
    expect(s.state.user!.email).toBe('new@example.com');
    expect(s.state.edit!.email).toBe('new@example.com');
    expect(s.state.contact).toBeNull();
    expect(s.state.screen).toBe('editProfile');
  });

  it('builds an E.164 identifier for a new phone, keeps the code screen on a wrong code and can resend', async () => {
    mock(meSvc.contactChange).mockResolvedValue({ ...challenge, maskedDestination: '+234 ••• ••7791' });
    const s = editing();
    s.startContactChange('phone', 'sms', '0803 412 7791');
    await s.idle();
    expect(meSvc.contactChange).toHaveBeenCalledWith({ channel: 'sms', identifier: '+2348034127791' });
    expect(s.state.contact!.field).toBe('phone');

    mock(meSvc.verifyContactChange).mockRejectedValue(new ApiError({ status: 401, code: 'auth/otp-invalid', message: 'That code is not correct' }));
    s.setState({ contactCode: '0000' });
    s.primary();
    await s.idle();
    expect(s.state.screen).toBe('contactOtp');
    expect(s.state.contactErr).toBe('That code is not correct');
    expect(s.state.contactBusy).toBe(false);

    mock(meSvc.contactChange).mockResolvedValue({ ...challenge, challengeId: 'cc-2' });
    await s.remote.resendContactChange();
    expect(s.state.contact!.challengeId).toBe('cc-2');
  });

  it('shows the server field error (e.g. contact already used) on the edit screen', async () => {
    mock(meSvc.contactChange).mockRejectedValue(new ApiError({ status: 422, code: 'validation/failed', message: 'Bad', fields: { identifier: 'Enter a valid email' } }));
    const s = editing();
    s.startContactChange('email', 'email', 'new@example.com');
    await s.idle();
    expect(s.state.screen).toBe('editProfile');
    expect(s.state.editErr.email).toBe('Enter a valid email');
    expect(s.state.contactBusy).toBe(false);
  });
});

describe('price variation (sell orders)', () => {
  const variation = (over: Record<string, unknown> = {}) => ({ id: 'pvr_1', from: money(10000000), to: money(9000000), reason: 'grade', note: 'Assay came back lower', status: 'awaiting_seller', ...over });
  const sellAt = (over: Partial<OrderDetail> = {}) => orderAt('payout', {
    kind: 'sell', lines: [], sell: { mineralSlug: 'gold', name: 'Gold doré', qty: { value: 2, unit: 'kg' }, grade: '98%' }, ...over,
  });

  it('maps a pending variation, tolerates the raw _id and opens the price screen as the order action', () => {
    expect(mapPriceVariation({ _id: 'pvr_9', ...variation(), id: undefined } as never)).toMatchObject({ id: 'pvr_9', from: 100000, to: 90000, status: 'awaiting_seller' });
    const s = signedIn();
    const o = s.remote.applyDetail(sellAt({ priceVariations: [variation()] } as Partial<OrderDetail>));
    expect(o.variations).toHaveLength(1);
    const v = s.view(o);
    expect(v.you).toBe(true);
    expect(v.actionScreen).toBe('priceVar');
    expect(v.actionLabel).toBe('Review price update');
    expect(v.status).toBe('Action needed');
    // Decided variations no longer ask for an answer.
    const done = s.remote.applyDetail(sellAt({ priceVariations: [variation({ status: 'accepted' })] } as Partial<OrderDetail>));
    expect(s.view(done).actionScreen).not.toBe('priceVar');
  });

  it('accepts the new price with the order version and returns to the order', async () => {
    const s = signedIn();
    const o = s.remote.applyDetail(sellAt({ priceVariations: [variation()] } as Partial<OrderDetail>));
    s.setState({ oid: o.id, stack: ['orders', 'order'], screen: 'priceVar' });
    expect(s.meta().cta).toBe('Accept new price');
    mock(ordersSvc.decideVariation).mockResolvedValue(sellAt({ version: 2, priceVariations: [variation({ status: 'accepted' })] } as Partial<OrderDetail>));
    s.primary();
    s.primary(); // double tap
    await s.idle();
    expect(ordersSvc.decideVariation).toHaveBeenCalledTimes(1);
    expect(ordersSvc.decideVariation).toHaveBeenCalledWith(o.id, 'pvr_1', { decision: 'accept', version: 1 });
    expect(s.order(o.id)!.variations![0].status).toBe('accepted');
    expect(s.order(o.id)!.ver).toBe(2);
    expect(s.state.screen).toBe('order');
    expect(s.state.varBusy).toBe(false);
  });

  it('asks for confirmation before rejecting and sends the note', async () => {
    const s = signedIn();
    const o = s.remote.applyDetail(sellAt({ priceVariations: [variation()] } as Partial<OrderDetail>));
    s.setState({ oid: o.id, stack: ['orders', 'order'], screen: 'priceVar', varNote: ' Assay was certified at 99% ' });
    s.secondary();
    expect(s.state.sheet).toBe('rejectVariation');
    expect(ordersSvc.decideVariation).not.toHaveBeenCalled();
    mock(ordersSvc.decideVariation).mockResolvedValue(sellAt({ version: 2, hold: { type: 'clarify', owner: 'platform' }, priceVariations: [variation({ status: 'rejected' })] } as Partial<OrderDetail>));
    s.sheetVals().confirm();
    await s.idle();
    expect(ordersSvc.decideVariation).toHaveBeenCalledWith(o.id, 'pvr_1', { decision: 'reject', note: 'Assay was certified at 99%', version: 1 });
    expect(s.order(o.id)!.variations![0].status).toBe('rejected');
    expect(s.state.sheet).toBe('');
  });

  it('shows the server message and refetches when the variation was already closed', async () => {
    const s = signedIn();
    const o = s.remote.applyDetail(sellAt({ priceVariations: [variation()] } as Partial<OrderDetail>));
    s.setState({ oid: o.id, stack: ['orders', 'order'], screen: 'priceVar' });
    mock(ordersSvc.decideVariation).mockRejectedValue(new ApiError({ status: 409, code: 'variation/closed', message: 'Variation is no longer awaiting a response.' }));
    mock(ordersSvc.getOrder).mockResolvedValue(sellAt({ version: 2, priceVariations: [variation({ status: 'withdrawn' })] } as Partial<OrderDetail>));
    s.primary();
    await s.idle();
    expect(s.state.varErr).toMatch(/no longer awaiting/);
    expect(s.state.screen).toBe('priceVar');
    expect(s.order(o.id)!.variations![0].status).toBe('withdrawn');
    expect(s.state.varBusy).toBe(false);
  });
});

describe('support inbox', () => {
  const T1 = { ref: 'MB-SUP-1', topic: 'general', subject: 'general', status: 'agent_replied', updatedAt: ISO };
  const thread = (extra: unknown[] = []) => ({
    reference: 'MB-SUP-1', topic: 'general', status: 'agent_replied',
    messages: [
      { _id: 'm2', author: 'agent', authorName: 'Ngozi', body: 'Happy to help', at: '2026-11-18T10:05:00.000Z' },
      { _id: 'm1', author: 'user', body: 'Where is my payout?', at: '2026-11-18T10:00:00.000Z' }, ...extra,
    ],
  });

  it('lists threads and opens one with its messages in order', async () => {
    mock(supportSvc.listThreads).mockResolvedValue({ items: [T1], total: 1 });
    mock(supportSvc.getThread).mockResolvedValue(thread());
    const s = signedIn();
    s.go('support');
    await s.idle();
    expect(s.state.supThreads).toEqual([T1]);
    expect(s.meta().cta).toBe('New message');
    s.openSupport('MB-SUP-1');
    await s.idle();
    expect(s.state.screen).toBe('supportThread');
    expect(supportSvc.getThread).toHaveBeenCalledWith('MB-SUP-1');
    expect(s.state.supThread!.messages.map(m => [m.me, m.who, m.text])).toEqual([[true, 'You', 'Where is my payout?'], [false, 'Ngozi', 'Happy to help']]);
  });

  it('sends a reply and reloads the thread; a failed send keeps the typed text', async () => {
    mock(supportSvc.getThread).mockResolvedValue(thread());
    mock(supportSvc.listThreads).mockResolvedValue({ items: [T1], total: 1 });
    const s = signedIn();
    s.openSupport('MB-SUP-1');
    await s.idle();
    mock(supportSvc.postMessage).mockRejectedValueOnce(new ApiError({ status: 500, code: 'server/error', message: 'Try later' }));
    s.setState({ supMsg: 'Any update?' });
    s.sendSupport();
    await s.idle();
    expect(s.state.supMsg).toBe('Any update?');
    expect(s.state.supBusy).toBe(false);
    mock(supportSvc.postMessage).mockResolvedValue({ body: 'Any update?' });
    mock(supportSvc.getThread).mockResolvedValue(thread([{ _id: 'm3', author: 'user', body: 'Any update?', at: '2026-11-18T10:10:00.000Z' }]));
    s.sendSupport();
    await s.idle();
    expect(supportSvc.postMessage).toHaveBeenLastCalledWith('MB-SUP-1', 'Any update?');
    expect(s.state.supMsg).toBe('');
    expect(s.state.supThread!.messages).toHaveLength(3);
  });

  it('starts a new general thread from the inbox', async () => {
    mock(supportSvc.listThreads).mockResolvedValue({ items: [], total: 0 });
    mock(supportSvc.createThread).mockResolvedValue({ ref: 'MB-SUP-2', topic: 'general', status: 'open', messages: [{ _id: 'm1', author: 'user', body: 'Hello', at: ISO }] });
    mock(supportSvc.getThread).mockResolvedValue({ reference: 'MB-SUP-2', topic: 'general', status: 'open', messages: [{ _id: 'm1', author: 'user', body: 'Hello', at: ISO }] });
    const s = signedIn();
    s.go('support');
    await s.idle();
    s.primary(); // "New message"
    expect(s.state.screen).toBe('supportThread');
    expect(s.state.supRef).toBe('');
    s.sendSupport(); // empty: ignored
    expect(supportSvc.createThread).not.toHaveBeenCalled();
    s.setState({ supMsg: 'Hello' });
    s.sendSupport();
    await s.idle();
    expect(supportSvc.createThread).toHaveBeenCalledWith({ topic: 'general', body: 'Hello' });
    expect(s.state.supRef).toBe('MB-SUP-2');
    expect(s.state.supThread!.messages[0]).toMatchObject({ me: true, text: 'Hello' });
  });

  it('Help ? Chat with support opens the inbox', () => {
    const s = signedIn();
    s.go('help');
    s.go('support');
    expect(s.state.screen).toBe('support');
  });
});

describe('catalogue documents', () => {
  it('opens the signed URL for a lot document', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    mock(catalogueSvc.getProductDocument).mockResolvedValue({ type: 'lot_test_report', number: 'SGS-1', name: 'report.pdf', contentType: 'application/pdf', available: true, url: 'https://files.example.com/r.pdf', expiresAt: ISO });
    const s = signedIn();
    s.openProductDoc(GOLD, 'lot_test_report', 'lotReport');
    await s.idle();
    expect(catalogueSvc.getProductDocument).toHaveBeenCalledWith('G-1041', 'lot_test_report');
    expect(open).toHaveBeenCalledWith('https://files.example.com/r.pdf');
    expect(s.state.screen).toBe('home');
    open.mockRestore();
  });

  it('falls back to the on-device document view when the lot has no such document', async () => {
    mock(catalogueSvc.getProductDocument).mockRejectedValue(new ApiError({ status: 404, code: 'document/not-available', message: 'Document is not available for this lot.' }));
    const s = signedIn();
    s.openProductDoc(GOLD, 'origin_declaration', 'lotOrigin');
    await s.idle();
    expect(s.state.screen).toBe('doc');
    expect(s.state.doc).toMatchObject({ t: 'lotOrigin', pid: 'G-1041' });
  });
});
