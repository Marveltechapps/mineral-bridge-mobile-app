import { setAppState, useApp, type Unit } from '../../context/appStore';

const UNIT_LABEL: Record<Unit, string> = {
  kg: 'KILOGRAMS',
  g: 'GRAMS',
  t: 'TONNES',
};
const GRAMS_PER: Record<Unit, number> = { g: 1, kg: 1000, t: 1000000 };

/**
 * Quantity shared by the buy requirement and the sell-to-us flow
 * (steps of 50, minimum 50) and the derived unit labels.
 */
function parsedQty(text: string, fallback: number): number {
  const n = Number(text);
  return Number.isFinite(n) ? n : fallback;
}

export function useQuantity() {
  const { qty, qtyText, unit } = useApp(s => ({
    qty: s.qty,
    qtyText: s.qtyText,
    unit: s.unit,
  }));
  const shown = parsedQty(qtyText, qty);
  return {
    qty: shown,
    qtyText,
    unit,
    unitLabel: UNIT_LABEL[unit],
    unitShort: unit,
    grams: (Number.isFinite(shown) ? shown : 0) * GRAMS_PER[unit],
    inc: () =>
      setAppState(p => {
        const next = parsedQty(p.qtyText, p.qty) + 50;
        return { qty: next, qtyText: String(next) };
      }),
    dec: () =>
      setAppState(p => {
        const next = Math.max(50, parsedQty(p.qtyText, p.qty) - 50);
        return { qty: next, qtyText: String(next) };
      }),
    setUnit: (u: Unit) => setAppState({ unit: u }),
    setText: (text: string) => {
      const n = Number(text);
      setAppState({ qtyText: text, qty: Number.isFinite(n) ? n : 0 });
    },
  };
}
