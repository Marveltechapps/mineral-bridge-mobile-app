/** Product-grid filters. `null` means nothing has been applied yet. */
export type GridFilter = {
  purity: string[];
  seller: string[];
  price: string[];
  form: string[];
  verifiedOnly: boolean;
};

/** The chips the filter sheet opens with, before Apply. */
export const DESIGN_FILTER: GridFilter = {
  purity: ['22K+'],
  seller: ['Cooperative', 'Registered'],
  price: [],
  form: [],
  verifiedOnly: true,
};

export const EMPTY_FILTER: GridFilter = {
  purity: [],
  seller: [],
  price: [],
  form: [],
  verifiedOnly: false,
};

const TAGS: Record<
  string,
  { purity: string; seller: string; price: string; form: string; verified: boolean }
> = {
  'Gold Doré Bar': {
    purity: '22K+',
    seller: 'Cooperative',
    price: '$50 – $65',
    form: 'Bar',
    verified: true,
  },
  'Gold Concentrate': {
    purity: 'Under 18K',
    seller: 'Artisanal',
    price: 'Under $50',
    form: 'Concentrate',
    verified: false,
  },
  'Gold Dust': {
    purity: '18K – 22K',
    seller: 'Artisanal',
    price: '$50 – $65',
    form: 'Dust',
    verified: true,
  },
  'Gold Grain / Shot': {
    purity: '22K+',
    seller: 'Registered',
    price: '$50 – $65',
    form: 'Grain',
    verified: true,
  },
  'Gold Biscuit 24K': {
    purity: '22K+',
    seller: 'Registered',
    price: '$65+',
    form: 'Biscuit',
    verified: true,
  },
  'Gold Bullion Bar': {
    purity: '22K+',
    seller: 'Cooperative',
    price: '$65+',
    form: 'Bar',
    verified: true,
  },
};

export function matchesFilter(name: string, filter: GridFilter | null): boolean {
  if (!filter) return true;
  const tag = TAGS[name] ?? {
    purity: '22K+',
    seller: 'Cooperative',
    price: '$50 – $65',
    form: 'Bar',
    verified: true,
  };
  if (filter.verifiedOnly && !tag.verified) return false;
  if (filter.purity.length > 0 && !filter.purity.includes(tag.purity)) return false;
  if (filter.seller.length > 0 && !filter.seller.includes(tag.seller)) return false;
  if (filter.price.length > 0 && !filter.price.includes(tag.price)) return false;
  if (filter.form.length > 0 && !filter.form.includes(tag.form)) return false;
  return true;
}

export function matchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === '' || name.toLowerCase().includes(q);
}
