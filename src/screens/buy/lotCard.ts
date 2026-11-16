import type { MBStore } from '../../context/store';
import { imgFor } from '../../lib/images';
import { num } from '../../lib/mb4';
import type { Product } from '../../types/mineralBridge';

export const lotLine = (x: Product) => (x.avail > 0 ? num(x.avail) + ' ' + (x.unit === 'bar' && x.avail !== 1 ? 'bars' : x.unit) + ' available' : 'Unavailable');

export function lotCard(store: MBStore, x: Product) {
  return {
    id: x.id, name: x.name, form: x.form, img: imgFor(x.img), qty: lotLine(x),
    grade: x.lab ? x.grade : 'Test report on request', lab: x.lab || 'No third-party report yet', origin: x.origin,
    off: x.avail <= 0, opacity: x.avail > 0 ? 1 : 0.55, hasLabTag: !!x.lab && x.avail > 0,
    labBg: x.lab ? '#E2F2E9' : '#F1EFE9', labFg: x.lab ? '#17704C' : '#6B6A70',
    tap: () => store.go('detail', { pid: x.id, qty: String(x.min), qtyErr: '' }),
  };
}
export type LotCard = ReturnType<typeof lotCard>;
