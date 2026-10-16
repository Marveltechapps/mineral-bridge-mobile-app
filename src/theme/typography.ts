/**
 * Poppins is the only typeface in the design (body and display). The font
 * files are the design's own woff2 files converted to TTF; each weight is a
 * separate family so Android never synthesises bold or italic.
 */
export type FontWeight = '400' | '500' | '600' | '700' | '800' | '900';

const UPRIGHT: Record<FontWeight, string> = {
  '400': 'Poppins-Regular',
  '500': 'Poppins-Medium',
  '600': 'Poppins-SemiBold',
  '700': 'Poppins-Bold',
  '800': 'Poppins-ExtraBold',
  '900': 'Poppins-Black',
};

// The design only loads italic faces for 700-900; lighter italics fall back
// to the 700 italic, which is what the browser does when matching faces.
const ITALIC: Record<FontWeight, string> = {
  '400': 'Poppins-BoldItalic',
  '500': 'Poppins-BoldItalic',
  '600': 'Poppins-BoldItalic',
  '700': 'Poppins-BoldItalic',
  '800': 'Poppins-ExtraBoldItalic',
  '900': 'Poppins-BlackItalic',
};

export function fontFamilyFor(
  weight: string | number | undefined,
  italic: boolean,
): string {
  const w = normalizeWeight(weight);
  return italic ? ITALIC[w] : UPRIGHT[w];
}

function normalizeWeight(weight: string | number | undefined): FontWeight {
  if (weight === 'bold') return '700';
  if (weight === undefined || weight === 'normal') return '400';
  const n = Math.round(Number(weight) / 100) * 100;
  if (n <= 400) return '400';
  if (n >= 900) return '900';
  return String(n) as FontWeight;
}

/** CSS `line-height: normal` for Poppins: (ascender 1050 + descender 350 + lineGap 100) / 1000. */
export const NORMAL_LINE_HEIGHT = 1.5;
