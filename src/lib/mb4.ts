// Port of the design's mb4-data.js: catalog, order stages and the simulated
// counterparty updates used by the demo buttons. All data is local demo data.
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

export const CATS: Category[] = [
  { id: 'precious', name: 'Precious metals', img: 'cat-precious', minerals: [['gold', 'Gold'], ['silver', 'Silver'], ['platinum', 'Platinum']] },
  { id: 'base', name: 'Base metals', img: 'cat-industrial', minerals: [['copper', 'Copper'], ['bauxite', 'Aluminium / Bauxite'], ['nickel', 'Nickel'], ['zinc', 'Zinc'], ['lead', 'Lead'], ['tin', 'Tin']] },
  { id: 'critical', name: 'Critical minerals', img: 'cat-critical', minerals: [['lithium', 'Lithium'], ['cobalt', 'Cobalt'], ['tantalum', 'Tantalum'], ['niobium', 'Niobium'], ['rare', 'Rare earth elements']] },
  { id: 'industrial', name: 'Industrial minerals', img: 'cat-industrial', minerals: [['quartz', 'Quartz'], ['graphite', 'Graphite'], ['mica', 'Mica'], ['feldspar', 'Feldspar'], ['limestone', 'Limestone']] },
  { id: 'gems', name: 'Gemstones', img: 'cat-gemstone', minerals: [['diamonds', 'Diamonds'], ['emeralds', 'Emeralds'], ['rubies', 'Rubies'], ['sapphires', 'Sapphires']] },
];

type Row = [string, string, string, string, number, string, number, string, string, string, string, string, number];
// id, mineral, name, form, available, unit, min, grade, lab, certificate, origin, image, internal reference price per unit
const P: Row[] = [
  ['G-1041', 'gold', 'Gold Doré Bar', 'Doré bars', 12.5, 'kg', 1, 'Au 92.1%', 'SGS Lagos', 'SGS-NG-26-4471', 'Ilesha, Osun · Nigeria', 'gold-dore', 61400],
  ['G-1042', 'gold', 'Gold Bullion Bar', 'Bullion', 8, 'kg', 1, 'Au 99.99%', 'Bureau Veritas Accra', 'BV-GH-26-0912', 'Kumasi · Ghana', 'gold-bullion', 75100],
  ['G-1043', 'gold', 'Gold Bars · 1 kg', 'Bars', 20, 'bar', 1, 'Au 99.5%', 'SGS Dubai', 'SGS-AE-26-1180', 'Dubai · UAE', 'gold-bullion', 74300],
  ['G-1044', 'gold', 'Gold Biscuits · 100 g', 'Biscuits', 60, 'pc', 5, 'Au 99.9%', 'Intertek Johannesburg', 'ITK-ZA-26-3307', 'Johannesburg · South Africa', 'gold-biscuit', 7480],
  ['G-1045', 'gold', 'Alluvial Gold Dust', 'Dust', 4.2, 'kg', 0.5, 'Au 89.4%', 'SGS Lagos', 'SGS-NG-26-4502', 'Kebbi · Nigeria', 'gold-dust', 58100],
  ['G-1046', 'gold', 'Gold Concentrate', 'Concentrate', 18, 't', 2, 'Au 48 g/t', '', '', 'Geita · Tanzania', 'gold-concentrate', 2900],
  ['G-1047', 'gold', 'Gold Grain', 'Grain', 2.4, 'kg', 0.5, 'Au 99.5%', 'SGS Lagos', 'SGS-NG-26-4519', 'Osogbo · Nigeria', 'grain-shot', 74800],
  ['G-1048', 'gold', 'Gold Doré Bar · Lot B', 'Doré bars', 0, 'kg', 1, 'Au 90.6%', 'SGS Lagos', 'SGS-NG-26-4390', 'Ilesha, Osun · Nigeria', 'gold-dore', 60200],
  ['S-2011', 'silver', 'Silver Bars', 'Bars', 120, 'kg', 10, 'Ag 99.9%', 'SGS Lima', 'SGS-PE-26-0778', 'Arequipa · Peru', 'm-silver', 940],
  ['S-2012', 'silver', 'Silver Bullion', 'Bullion', 40, 'kg', 5, 'Ag 99.95%', 'Alex Stewart International', 'ASI-MX-26-1204', 'Zacatecas · Mexico', 'm-silver', 955],
  ['P-3011', 'platinum', 'Platinum Bars', 'Bars', 6, 'kg', 0.5, 'Pt 99.95%', 'SGS Johannesburg', 'SGS-ZA-26-0331', 'Rustenburg · South Africa', 'm-platinum', 32500],
  ['C-4011', 'copper', 'Copper Concentrate', 'Concentrate', 500, 't', 50, 'Cu 28.4%', 'SGS Lubumbashi', 'SGS-CD-26-2210', 'Katanga · DR Congo', 'cat-industrial', 2700],
  ['C-4012', 'copper', 'Copper Cathode', 'Cathode', 120, 't', 25, 'Cu 99.99%', 'Alex Stewart International', 'ASI-ZM-26-0415', 'Copperbelt · Zambia', 'cat-industrial', 9600],
  ['A-4021', 'bauxite', 'Metallurgical Bauxite', 'Ore', 5000, 't', 500, 'Al₂O₃ 48%', 'SGS Conakry', 'SGS-GN-26-0098', 'Boké · Guinea', 'cat-industrial', 62],
  ['N-4031', 'nickel', 'Nickel Laterite Ore', 'Ore', 2000, 't', 200, 'Ni 1.8%', '', '', 'Sulawesi · Indonesia', 'cat-industrial', 55],
  ['Z-4041', 'zinc', 'Zinc Concentrate', 'Concentrate', 800, 't', 50, 'Zn 52%', 'Intertek Windhoek', 'ITK-NA-26-0612', 'Rosh Pinah · Namibia', 'cat-industrial', 1450],
  ['L-4051', 'lead', 'Lead Concentrate', 'Concentrate', 600, 't', 50, 'Pb 60%', 'SGS Lagos', 'SGS-NG-26-4380', 'Ebonyi · Nigeria', 'cat-industrial', 1250],
  ['T-4061', 'tin', 'Cassiterite Concentrate', 'Concentrate', 40, 't', 5, 'Sn 68%', 'Alex Stewart Kigali', 'ASI-RW-26-0207', 'Rutongo · Rwanda', 'cat-industrial', 21000],
  ['LI-5011', 'lithium', 'Spodumene Concentrate', 'Concentrate', 1000, 't', 100, 'Li₂O 6.0%', 'SGS Harare', 'SGS-ZW-26-0544', 'Bikita · Zimbabwe', 'cat-critical', 980],
  ['LI-5012', 'lithium', 'Lepidolite Ore', 'Ore', 300, 't', 50, 'Li₂O 3.2%', '', '', 'Nasarawa · Nigeria', 'cat-critical', 410],
  ['CO-5021', 'cobalt', 'Cobalt Hydroxide', 'Hydroxide', 200, 't', 20, 'Co 34%', 'SGS Lubumbashi', 'SGS-CD-26-2231', 'Kolwezi · DR Congo', 'cat-critical', 9800],
  ['TA-5031', 'tantalum', 'Coltan Concentrate', 'Concentrate', 12, 't', 1, 'Ta₂O₅ 30%', 'Alex Stewart Kigali', 'ASI-RW-26-0219', 'Rubaya · DR Congo', 'cat-critical', 48000],
  ['NB-5041', 'niobium', 'Pyrochlore Concentrate', 'Concentrate', 50, 't', 5, 'Nb₂O₅ 55%', '', '', 'Jos Plateau · Nigeria', 'cat-critical', 26000],
  ['RE-5051', 'rare', 'Mixed Rare Earth Carbonate', 'Carbonate', 25, 't', 2, 'TREO 92%', 'SGS Mombasa', 'SGS-KE-26-0120', 'Kwale · Kenya', 'cat-critical', 11500],
  ['Q-6011', 'quartz', 'High-Purity Quartz', 'Lump', 300, 't', 20, 'SiO₂ 99.8%', 'Intertek Chennai', 'ITK-IN-26-0931', 'Tamil Nadu · India', 'cat-industrial', 220],
  ['GR-6021', 'graphite', 'Flake Graphite', 'Flake', 400, 't', 20, 'C 94%', 'SGS Maputo', 'SGS-MZ-26-0187', 'Balama · Mozambique', 'cat-industrial', 640],
  ['MI-6031', 'mica', 'Muscovite Mica', 'Sheet', 80, 't', 5, 'Grade V-2', '', '', 'Andhra Pradesh · India', 'cat-industrial', 520],
  ['FE-6041', 'feldspar', 'Potash Feldspar', 'Lump', 1000, 't', 100, 'K₂O 11%', 'Intertek Chennai', 'ITK-IN-26-0950', 'Rajasthan · India', 'cat-industrial', 85],
  ['LS-6051', 'limestone', 'Cement-Grade Limestone', 'Aggregate', 10000, 't', 1000, 'CaCO₃ 96%', '', '', 'Ogun · Nigeria', 'cat-industrial', 24],
  ['D-7011', 'diamonds', 'Rough Diamonds', 'Rough', 1200, 'ct', 50, 'Gem-quality mix', 'GIA Antwerp', 'KP-BW-26-00871', 'Orapa · Botswana', 'cat-gemstone', 410],
  ['E-7021', 'emeralds', 'Rough Emeralds', 'Rough', 3400, 'ct', 100, 'Medium green, AA', 'Gübelin Gem Lab', 'GGL-26-2214', 'Kagem · Zambia', 'cat-gemstone', 95],
  ['R-7031', 'rubies', 'Rough Rubies', 'Rough', 900, 'ct', 25, 'Pigeon blood, A', '', '', 'Montepuez · Mozambique', 'cat-gemstone', 180],
  ['SA-7041', 'sapphires', 'Blue Sapphires', 'Rough', 2100, 'ct', 50, 'Royal blue, AA', 'GIA Bangkok', 'GIA-TH-26-5520', 'Ilakaka · Madagascar', 'cat-gemstone', 140],
];
export const PRODUCTS: Product[] = P.map(r => ({ id: r[0], mineral: r[1], name: r[2], form: r[3], avail: r[4], unit: r[5], min: r[6], grade: r[7], lab: r[8], cert: r[9], origin: r[10], img: r[11], ref: r[12] }));
export const product = (id: string) => PRODUCTS.find(x => x.id === id);
export const mineralName = (id: string) => {
  for (const c of CATS) for (const [m, n] of c.minerals) if (m === id) return n;
  return id;
};
export const catOf = (id: string) => CATS.find(c => c.minerals.some(([m]) => m === id));

export const BUYER_TYPES: [string, string, string][] = [['refinery', 'Refineries and smelters', 'Buy doré and concentrate to refine into high-grade metal'], ['house', 'International trading houses', 'Bulk volumes to hedge or distribute globally'], ['industry', 'Manufacturing & industrial end-users', 'Lithium, cobalt, quartz and more for production'], ['jewel', 'Jewelry manufacturers & artisans', 'Precious metals and gemstones for consumer goods'], ['investor', 'Retail investors & collectors', 'Bars, bullion and rare specimens'], ['wholesale', 'B2B wholesalers', 'Medium-to-large lots to warehouse and resell']];
export const SELLER_TYPES: [string, string, string][] = [['asm', 'Artisanal and small-scale miners (ASMs)', 'Independent or family-run operations'], ['industrial', 'Industrial mining companies', 'Large-scale producers of base metals or bulk minerals'], ['coop', 'Mining cooperatives', 'Registered groups of artisanal miners'], ['dealer', 'Licensed local dealers / brokers', 'Aggregate from miners and handle local paperwork'], ['exporter', 'International traders / exporters', 'Export logistics, customs and compliance'], ['scrap', 'Individual salvagers / scrap collectors', 'Recycled metal, e-waste and precious scrap']];

export const WHO: Record<string, string> = { you: 'You', mb: 'Mineral Bridge Operations', sgs: 'SGS (independent inspector)', lp: 'Sahel Secure Freight (logistics)' };
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
  o.kind === 'sell' && o.sell ? o.sell.qty * (o.sell.ref || 1000) : o.items.reduce((a, it) => { const p = product(it.pid); return a + (p ? p.ref * it.qty : 0); }, 0);
export const titleOf = (o: Order) => (o.kind === 'sell' && o.sell ? o.sell.name : o.items.map(it => (product(it.pid) || ({} as Product)).name).join(' + '));

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
