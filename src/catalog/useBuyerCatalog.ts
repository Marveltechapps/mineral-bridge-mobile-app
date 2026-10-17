import { useEffect, useState } from 'react';
import { apiRequest, isDemoMode } from '../api';
import { ENDPOINTS } from '../api/config';
import { setAppState, useApp } from '../context/appStore';
import { CAT, PRODUCTS, TYPES } from '../lib/catalog';
import {
  formsFor,
  productsFor,
  selectCategory,
  selectMineralType,
  selectProductForm,
  selectSubcategory,
  type CatalogCategoryNode,
  type CatalogSelection,
} from './selection';

interface ApiForm { slug: string; name: string; imageUrl?: string | null; imageName?: string | null }
interface ApiType { slug: string; name: string; imageUrl?: string | null; productForms?: ApiForm[] }
interface ApiSub { slug: string; name: string; imageUrl?: string | null; mineralTypes?: ApiType[] }
interface ApiCategory { slug: string; name: string; imageUrl?: string | null; subcategories?: ApiSub[] }

function demoTree(): CatalogCategoryNode[] {
  return CAT.map((category) => ({
    slug: category.name,
    name: category.name,
    img: category.img,
    count: category.count,
    subcategories:
      category.name === 'Precious Metals'
        ? TYPES.map((type) => ({
            slug: type.name,
            name: type.name,
            img: type.img,
            mineralTypes: [
              {
                slug: type.name,
                name: type.name,
                img: type.img,
                sub: type.sub,
                productForms:
                  type.name === 'Gold'
                    ? PRODUCTS.map((product) => ({
                        slug: product.name,
                        name: product.name,
                        img: product.img,
                        price: product.price,
                        avail: product.avail,
                      }))
                    : [],
              },
            ],
          }))
        : [],
  }));
}

function displayImage(url?: string | null): string | null {
  if (!url) return null;
  const queryAt = url.indexOf('?');
  const path = queryAt === -1 ? url : url.slice(0, queryAt);
  const query = queryAt === -1 ? '' : url.slice(queryAt);
  if (/\.(png|jpe?g|webp|gif|avif)$/i.test(path)) return url;
  return `${path}.png${query}`;
}

function fromApi(categories: ApiCategory[]): CatalogCategoryNode[] {
  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    imageUrl: displayImage(category.imageUrl),
    subcategories: (category.subcategories ?? []).map((sub) => ({
      slug: sub.slug,
      name: sub.name,
      imageUrl: displayImage(sub.imageUrl),
      mineralTypes: (sub.mineralTypes ?? []).map((type) => ({
        slug: type.slug,
        name: type.name,
        imageUrl: displayImage(type.imageUrl),
        productForms: (type.productForms ?? []).map((form) => ({
          slug: form.slug,
          name: form.name,
          imageUrl: displayImage(form.imageUrl),
        })),
      })),
    })),
  }));
}

function writeSelection(next: CatalogSelection) {
  setAppState({
    catalogCategory: next.category,
    catalogSubcategory: next.subcategory,
    catalogMineralType: next.mineralType,
    catalogProductForm: next.productForm,
  });
}

/** Buyer catalog selection. Child choices reset when a parent changes. */
export function useBuyerCatalog() {
  const selection = useApp((s) => ({
    category: s.catalogCategory,
    subcategory: s.catalogSubcategory,
    mineralType: s.catalogMineralType,
    productForm: s.catalogProductForm,
  }));
  const [remote, setRemote] = useState<CatalogCategoryNode[] | null>(null);
  const demo = isDemoMode();

  useEffect(() => {
    if (demo) return undefined;
    let cancelled = false;
    apiRequest<{ categories: ApiCategory[] }>(ENDPOINTS.catalog.hierarchy)
      .then((body) => {
        if (!cancelled) setRemote(fromApi(body.categories ?? []));
      })
      .catch(() => {
        if (!cancelled) setRemote([]);
      });
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const categories = demo ? demoTree() : remote ?? [];
  const category = categories.find((c) => c.slug === selection.category);
  const subcategories = category?.subcategories ?? [];
  const subcategory = subcategories.find((s) => s.slug === selection.subcategory);
  const mineralTypes = subcategory?.mineralTypes ?? [];

  return {
    categories,
    subcategories,
    mineralTypes,
    forms: formsFor(categories, selection),
    products: productsFor(categories, selection),
    selection,
    loading: !demo && remote === null,
    chooseCategory: (slug: string) => writeSelection(selectCategory(selection, slug)),
    chooseSubcategory: (slug: string) => writeSelection(selectSubcategory(selection, slug)),
    chooseMineralType: (slug: string) => writeSelection(selectMineralType(selection, slug)),
    chooseProductForm: (slug: string) => writeSelection(selectProductForm(selection, slug)),
  };
}
