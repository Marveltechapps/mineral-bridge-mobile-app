/**
 * Number formatting matching the design's `toLocaleString('en-US')` calls,
 * implemented without Intl so output is identical on every engine.
 */
export function formatMoney(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + grouped + (frac ? '.' + frac : '');
}

/** "$1,234" (rounded to whole dollars). */
export function dollars(n: number): string {
  return '$' + formatMoney(Math.round(n));
}

/** The estimate formatter: "$13.10M" at a million and above, otherwise "$945,000". */
export function compactDollars(n: number): string {
  return '$' + (n >= 1000000 ? (n / 1000000).toFixed(2) + 'M' : formatMoney(n));
}
