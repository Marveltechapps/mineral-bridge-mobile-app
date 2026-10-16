import React, { createContext, useContext } from 'react';
import {
  PixelRatio,
  Platform,
  StyleSheet,
  Text as RNText,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { colors, fontFamilyFor, NORMAL_LINE_HEIGHT } from '../../theme';
import { ADVANCES, METRIC_CHARS } from '../../theme/fontMetrics';

export type AppTextProps = TextProps & {
  /** CSS-style unitless line height (e.g. 1.5). Overrides `lineHeight` in `style`. */
  leading?: number;
};

const InsideText = createContext(false);
const CHAR_INDEX = new Map([...METRIC_CHARS].map((c, i) => [c, i]));
const DEFAULT_ADVANCE = 0.55;

/** Concatenates the plain-string content of (possibly nested) children. */
function plainText(children: React.ReactNode): string {
  if (
    children === null ||
    children === undefined ||
    typeof children === 'boolean'
  )
    return '';
  if (typeof children === 'string' || typeof children === 'number')
    return String(children);
  if (Array.isArray(children)) return children.map(plainText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(children))
    return plainText(children.props.children);
  return '';
}

/** Mean advance (in em) of the characters of `text` in `family`. */
function meanAdvance(text: string, family: string): number {
  const table = ADVANCES[family];
  if (!table || !text) return DEFAULT_ADVANCE;
  let sum = 0;
  let count = 0;
  for (const ch of text) {
    if (ch === '\n') continue;
    const i = CHAR_INDEX.get(ch);
    const adv = i === undefined ? 0 : table[i];
    sum += adv ? adv / 1000 : DEFAULT_ADVANCE;
    count++;
  }
  return count ? sum / count : DEFAULT_ADVANCE;
}

/**
 * React Native on Android rounds every font size *up* to a whole device pixel
 * (`ceil(dp × density)`), so 12.5dp at 2.5x renders at 32px instead of 31.25px
 * and text runs ~2.4% wide. This picks the size whose rounded pixel value is
 * nearest the design's, then spreads the remaining sub-pixel difference over
 * the glyphs as letter spacing so line widths (and wrapping) match the design.
 */
function androidSizeFix(
  fontSize: number,
  lineHeight: number,
  family: string,
  text: string,
  maxMultiplier: number,
) {
  const scale =
    PixelRatio.get() * Math.min(PixelRatio.getFontScale(), maxMultiplier);
  const target = fontSize * scale;
  const px = Math.max(1, Math.round(target));
  return {
    fontSize: (px - 0.001) / scale,
    extraSpacing: ((target - px) * meanAdvance(text, family)) / scale,
    // Line heights are ceil'd to whole pixels too; aim for the nearest instead.
    lineHeight: (Math.max(1, Math.round(lineHeight * scale)) - 0.001) / scale,
  };
}

/**
 * Poppins text that reproduces browser text layout: the weight picks the
 * matching font file, font padding is disabled, the default line height is
 * CSS `normal` (1.5em) and font sizes are corrected for Android's whole-pixel
 * rounding. Nested spans only restyle glyphs and inherit the paragraph's line box.
 */
export function Text({
  style,
  leading,
  maxFontSizeMultiplier = 1.3,
  children,
  ...rest
}: AppTextProps) {
  const nested = useContext(InsideText);
  const flat = (StyleSheet.flatten(nested ? style : [styles.base, style]) ??
    {}) as TextStyle;
  const resolved: TextStyle = {
    ...flat,
    fontWeight: undefined,
    fontStyle: undefined,
  };
  const family =
    flat.fontFamily ??
    fontFamilyFor(flat.fontWeight, flat.fontStyle === 'italic');
  if (flat.fontWeight !== undefined || flat.fontStyle !== undefined || !nested)
    resolved.fontFamily = family;

  if (!nested) {
    const fontSize = flat.fontSize ?? 16;
    const lineHeight = leading
      ? fontSize * leading
      : flat.lineHeight ?? fontSize * NORMAL_LINE_HEIGHT;
    resolved.lineHeight = lineHeight;
    if (Platform.OS === 'android') {
      const fix = androidSizeFix(
        fontSize,
        lineHeight,
        family,
        plainText(children),
        maxFontSizeMultiplier ?? Infinity,
      );
      resolved.fontSize = fix.fontSize;
      resolved.lineHeight = fix.lineHeight;
      resolved.letterSpacing = (flat.letterSpacing ?? 0) + fix.extraSpacing;
    }
  }

  const text = (
    <RNText
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={resolved}
    >
      {children}
    </RNText>
  );
  return nested ? (
    text
  ) : (
    <InsideText.Provider value>{text}</InsideText.Provider>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.ink,
    fontSize: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
