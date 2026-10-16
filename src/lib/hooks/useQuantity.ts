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
export function useQuantity() {
  const { qty, unit } = useApp(s => ({ qty: s.qty, unit: s.unit }));
  return {
    qty,
    unit,
    unitLabel: UNIT_LABEL[unit],
    unitShort: unit,
    grams: qty * GRAMS_PER[unit],
    inc: () => setAppState(p => ({ qty: p.qty + 50 })),
    dec: () => setAppState(p => ({ qty: Math.max(50, p.qty - 50) })),
    setUnit: (u: Unit) => setAppState({ unit: u }),
  };
}
