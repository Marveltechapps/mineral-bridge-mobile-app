import { formsFor, productsFor, selectCategory, selectMineralType, selectProductForm, selectSubcategory } from '../src/catalog/selection';

const tree = [
  {
    slug: 'Precious Metals',
    name: 'Precious Metals',
    subcategories: [
      {
        slug: 'Gold',
        name: 'Gold',
        mineralTypes: [
          {
            slug: 'Gold',
            name: 'Gold',
            productForms: [
              { slug: 'Gold Bullion Bar', name: 'Gold Bullion Bar' },
              { slug: 'Gold Dust', name: 'Gold Dust' },
            ],
          },
        ],
      },
      { slug: 'Platinum', name: 'Platinum', mineralTypes: [{ slug: 'Platinum', name: 'Platinum', productForms: [] }] },
    ],
  },
  { slug: 'Gemstones', name: 'Gemstones', subcategories: [] },
];

describe('mobile catalog selection', () => {
  it('drops a gold form when the category changes', () => {
    const selected = selectProductForm(
      selectMineralType(selectSubcategory(selectCategory({ category: '', subcategory: '', mineralType: '', productForm: '' }, 'Precious Metals'), 'Gold'), 'Gold'),
      'Gold Bullion Bar',
    );
    expect(productsFor(tree, selected).map((p) => p.name)).toEqual(['Gold Bullion Bar']);
    const next = selectCategory(selected, 'Gemstones');
    expect(next.productForm).toBe('');
    expect(productsFor(tree, next)).toEqual([]);
    expect(formsFor(tree, selectMineralType(selectSubcategory(selectCategory({ category: '', subcategory: '', mineralType: '', productForm: '' }, 'Precious Metals'), 'Platinum'), 'Platinum'))).toEqual([]);
  });
});
