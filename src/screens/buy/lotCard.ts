import type { MBStore } from '../../context/store';
import { imgFor } from '../../lib/images';
import { lotAvailabilityLabel, productIsSoldOut } from '../../lib/mappers';
import type { Product } from '../../types/mineralBridge';

export const lotLine = (x: Product) => lotAvailabilityLabel(x);

export function lotCard(store: MBStore, x: Product) {
  const off = productIsSoldOut(x);
  return {
    id: x.id, name: x.name, form: x.form, img: imgFor(x.img), qty: lotLine(x),
    grade: x.lab ? x.grade : 'Test report on request', lab: x.lab || 'No third-party report yet', origin: x.origin,
    off, opacity: off ? 0.55 : 1, hasLabTag: !!x.lab && !off,
    labBg: x.lab ? '#E2F2E9' : '#F1EFE9', labFg: x.lab ? '#17704C' : '#6B6A70',
    tap: () => store.go('detail', { pid: x.id, qty: String(x.min), qtyErr: '' }),
  };
}
export type LotCard = ReturnType<typeof lotCard>;
