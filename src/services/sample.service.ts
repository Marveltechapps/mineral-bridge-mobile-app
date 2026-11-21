import type { SampleItem } from '../types/sample';
import { listProducts } from './catalogue.service';

/**
 * The backend has no `/samples` endpoint on `/v2` (the legacy router is not mounted), so the starter
 * "sample items" screen now shows real catalogue lots. No mock data lives here.
 */
export async function getSamples(signal?: AbortSignal): Promise<SampleItem[]> {
  const page = await listProducts({ limit: 10 }, signal);
  return page.items.map(p => ({
    id: p.productRef,
    name: p.name,
    description: [p.type.name, p.grade, p.origin?.country].filter(Boolean).join(' · '),
  }));
}
