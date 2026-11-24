import type { ProductDetail } from '../src/api/types';
import { mapProduct, productHasLotDocuments } from '../src/lib/mappers';

const detail = (over: Partial<ProductDetail>): ProductDetail => ({
  id: 'pid-2',
  reference: 'REF-2',
  productRef: 'REF-2',
  name: 'Copper concentrate',
  type: { slug: 'copper', name: 'Copper' },
  categorySlug: 'base',
  subcategorySlug: null,
  productFormSlug: null,
  productFormName: 'Concentrate',
  imageName: null,
  mineralCode: 'CU',
  purity: null,
  grade: '28%',
  origin: { country: 'ZM' },
  seller: { name: 'Seller', verified: true },
  assured: false,
  verified: true,
  status: 'active',
  imageUrl: null,
  gradient: null,
  availability: {
    available: { value: 0, unit: 'g', grams: 0 },
    minOrder: { value: 1, unit: 't', grams: 1_000_000 },
    step: { value: 1, unit: 'g', grams: 1 },
  },
  pricePerGram: { amountMinor: 50, currency: 'USD' },
  createdAt: '2026-01-01T00:00:00.000Z',
  soldOut: false,
  availableOnRequest: true,
  inventoryTracked: false,
  description: null,
  attributes: {},
  media: [],
  documents: [{ id: 'd1', name: 'Assay report', kind: 'lot_test_report' }],
  passportId: null,
  lab: { name: 'Bureau Veritas', certificateNo: 'BV-2026-88' },
  ...over,
});

describe('BUG-006: lab mapping', () => {
  it('BUG-006: maps structured lab for document fallback', () => {
    const p = mapProduct(detail({}));
    expect(p.lab).toBe('Bureau Veritas');
    expect(p.cert).toBe('BV-2026-88');
    expect(productHasLotDocuments(p)).toBe(true);
  });
});