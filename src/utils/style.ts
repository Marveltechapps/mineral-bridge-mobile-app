import type { ViewStyle } from 'react-native';

/**
 * Turns a CSS `background` value from the design (a colour or a gradient)
 * into the matching React Native style.
 */
export function bg(value: string): ViewStyle {
  if (value === 'transparent') return { backgroundColor: 'transparent' };
  return /gradient\(/.test(value)
    ? { experimental_backgroundImage: value }
    : { backgroundColor: value };
}

/** A CSS `box-shadow` value, with `none` mapped to no shadow. */
export function shadow(value: string | undefined): ViewStyle {
  return value && value !== 'none' ? { boxShadow: value } : {};
}

/** Splits an array into rows of `size` (CSS grid columns). */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    rows.push(items.slice(i, i + size));
  return rows;
}

/** CSS `animation-delay` strings like ".12s" → milliseconds. */
export function ms(delay: string | number): number {
  return typeof delay === 'number'
    ? delay
    : Math.round(parseFloat(delay) * 1000);
}

/** `position:absolute; inset:0` as a spreadable style object. */
export const insetFill = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

/** CSS flex items shrink by default (`flex-shrink: 1`); React Native's do not. */
export const shrink = { flexShrink: 1 } as const;
