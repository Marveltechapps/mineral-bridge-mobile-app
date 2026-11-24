import type { ProductCard } from '../src/api/types';
import { lotAvailabilityLabel, mapProduct } from '../src/lib/mappers';
import { lotCard } from '../src/screens/buy/lotCard';

const baseCard = (over: Partial<ProductCard>): ProductCard => ({
  id: 'pid-1',
  reference: 'REF-1',
  productRef: 'REF-1',
  name: 'Gold dore',
  type: { slug: 'gold-dore', name: 'Gold doré' },
  categorySlug: 'precious',
  subcategorySlug: null,
  productFormSlug: null,
  productFormName: 'Doré bar',
  imageName: null,
  mineralCode: 'AU',
  purity: null,
  grade: '99.5%',
  origin: { country: 'GH' },
  seller: { name: 'Seller', verified: true },
  assured: false,
  verified: false,
  status: 'active',
  imageUrl: null,
  gradient: null,
  availability: {
    available: { value: 0, unit: 'g', grams: 0 },
    minOrder: { value: 10, unit: 'g', grams: 10 },
    step: { value: 1, unit: 'g', grams: 1 },
  },
  pricePerGram: { amountMinor: 100, currency: 'USD' },
  createdAt: '2026-01-01T00:00:00.000Z',
  soldOut: false,
  availableOnRequest: true,
  inventoryTracked: false,
  ...over,
});

describe('BUG-004: availability labels', () => {
  it('BUG-004: on-request stock is not dimmed off', () => {
    const p = mapProduct(baseCard());
    const card = lotCard({ go: jest.fn() } as never, p);
    expect(lotAvailabilityLabel(p)).toBe('Available on request');
    expect(card.off).toBe(false);
    expect(card.opacity).toBe(1);
  });

  it('BUG-004: sold out lot is dimmed', () => {
    const p = mapProduct(baseCard({ soldOut: true, availableOnRequest: false, status: 'sold' }));
    const card = lotCard({ go: jest.fn() } as never, p);
    expect(card.off).toBe(true);
    expect(card.opacity).toBe(0.55);
  });
});