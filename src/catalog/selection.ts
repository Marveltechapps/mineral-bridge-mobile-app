export interface CatalogSelection {
  category: string;
  subcategory: string;
  mineralType: string;
  productForm: string;
}

export const emptySelection: CatalogSelection = {
  category: '',
  subcategory: '',
  mineralType: '',
  productForm: '',
};

export function selectCategory(current: CatalogSelection, category: string): CatalogSelection {
  if (current.category === category) return emptySelection;
  return { category, subcategory: '', mineralType: '', productForm: '' };
}

export function selectSubcategory(current: CatalogSelection, subcategory: string): CatalogSelection {
  if (current.subcategory === subcategory) return { ...current, subcategory: '', mineralType: '', productForm: '' };
  return { ...current, subcategory, mineralType: '', productForm: '' };
}

export function selectMineralType(current: CatalogSelection, mineralType: string): CatalogSelection {
  if (current.mineralType === mineralType) return { ...current, mineralType: '', productForm: '' };
  return { ...current, mineralType, productForm: '' };
}

export function selectProductForm(current: CatalogSelection, productForm: string): CatalogSelection {
  if (current.productForm === productForm) return { ...current, productForm: '' };
  return { ...current, productForm };
}

export interface CatalogForm {
  slug: string;
  name: string;
  imageUrl?: string | null;
  price?: string;
  avail?: string;
  img?: string;
}
export interface CatalogType {
  slug: string;
  name: string;
  imageUrl?: string | null;
  img?: string;
  sub?: string;
  productForms: CatalogForm[];
}
export interface CatalogSubcategory {
  slug: string;
  name: string;
  imageUrl?: string | null;
  img?: string;
  mineralTypes: CatalogType[];
}
export interface CatalogCategoryNode {
  slug: string;
  name: string;
  imageUrl?: string | null;
  img?: string;
  count?: string;
  subcategories: CatalogSubcategory[];
}

export function formsFor(categories: CatalogCategoryNode[], selection: CatalogSelection): CatalogForm[] {
  const type = categories
    .find((c) => c.slug === selection.category)
    ?.subcategories.find((s) => s.slug === selection.subcategory)
    ?.mineralTypes.find((t) => t.slug === selection.mineralType);
  return type?.productForms ?? [];
}

export function productsFor(categories: CatalogCategoryNode[], selection: CatalogSelection): CatalogForm[] {
  const forms = formsFor(categories, selection);
  if (!selection.productForm) return forms;
  return forms.filter((f) => f.slug === selection.productForm);
}
