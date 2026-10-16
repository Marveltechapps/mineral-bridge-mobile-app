import { useQuantity } from './useQuantity';
import { useApp } from '../../context/appStore';
import { compactDollars } from '../../utils/format';

/** Rounds to the nearest $100, as the design's pricing does. */
const round100 = (n: number) => Math.round(n / 100) * 100;

/**
 * Sell-to-us pricing from the design: estimate band ($52.40–$57.90 per gram),
 * indicative midpoint ($55.10) and the firm offer ($54.60 per gram).
 */
export function useEstimate() {
  const q = useQuantity();
  const { sellItem, day, slot } = useApp(s => ({
    sellItem: s.sellItem,
    day: s.day,
    slot: s.slot,
  }));
  const g = q.grams;
  return {
    ...q,
    sellItem,
    day,
    slot,
    range:
      compactDollars(round100(g * 52.4)) +
      ' – ' +
      compactDollars(round100(g * 57.9)),
    mid: compactDollars(round100(g * 55.1)),
    offer: compactDollars(round100(g * 54.6)),
  };
}
