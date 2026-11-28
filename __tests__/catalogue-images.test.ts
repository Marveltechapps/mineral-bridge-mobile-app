import type { CatalogueCategory, ProductCard, ProductDetail } from '../src/api/types';
import { mapCategory, mapProduct } from '../src/lib/mappers';

const card = (over: Partial<ProductCard> = {}): ProductCard => ({
  id: 'pid-1',
  reference: 'MBV-1',
  productRef: 'MBV-1',
  name: 'Gold Bullion Bars',
  type: { slug: 'precious-metal-gold', name: 'Gold' },
  categorySlug: 'precious-metal',
  subcategorySlug: null,
  productFormSlug: null,
  productFormName: 'Gold Bullion Bars',
  imageName: 'gold-bullion',
  mineralCode: 'AU',
  purity: null,
  grade: null,
  origin: { country: 'NG' },
  seller: { name: 'Mineral Bridge', verified: true },
  assured: false,
  verified: false,
  status: 'active',
  imageUrl: 'https://cdn.example/gold-bullion.png',
  gradient: null,
  availability: {
    available: { value: 1, unit: 'kg', grams: 1000 },
    minOrder: { value: 1, unit: 'kg', grams: 1000 },
    step: { value: 1, unit: 'g', grams: 1 },
  },
  pricePerGram: { amount: 100, currency: 'USD' },
  createdAt: '2026-01-01T00:00:00.000Z',
  soldOut: false,
  ...over,
});

describe('catalogue images and categories', () => {
  it('uses the uploaded image url and ignores bundled placeholder names', () => {
    expect(mapProduct(card()).img).toBe('https://cdn.example/gold-bullion.png');
    expect(mapProduct(card({ imageUrl: null, imageName: 'gold-bullion' })).img).toBe('');
    const detail = { ...card({ imageUrl: null, imageName: null }), description: null, attributes: {}, media: [{ id: 'm1', kind: 'image', url: 'https://cdn.example/media-gold.png', thumbnailUrl: null }], documents: [], passportId: null } as ProductDetail;
    expect(mapProduct(detail).img).toBe('https://cdn.example/media-gold.png');
  });

  it('keeps live category names, counts, and each mineral photo', () => {
    const category: CatalogueCategory = {
      slug: 'precious-metal',
      name: 'Precious Metal',
      image: { url: '/assets/m4/cat-precious.png', name: 'cat-precious' },
      minerals: [
        { slug: 'precious-metal-gold', name: 'Gold', lotCount: 11, image: { url: 'https://cdn.example/gold.png', name: 'Gold.png' } },
        { slug: 'precious-metal-gold', name: 'Gold', lotCount: 11, image: { url: 'https://cdn.example/gold.png', name: 'Gold.png' } },
        { slug: 'precious-metal-platinum', name: 'Platinum', lotCount: 3, image: { url: 'https://cdn.example/platinum.png', name: 'Platinum.png' } },
      ],
    };
    const mapped = mapCategory(category);
    expect(mapped.name).toBe('Precious Metal');
    expect(mapped.img).toBe('https://cdn.example/gold.png');
    expect(mapped.lots).toBe(14);
    expect(mapped.minerals).toEqual([
      ['precious-metal-gold', 'Gold', 'https://cdn.example/gold.png'],
      ['precious-metal-platinum', 'Platinum', 'https://cdn.example/platinum.png'],
    ]);
  });
});
