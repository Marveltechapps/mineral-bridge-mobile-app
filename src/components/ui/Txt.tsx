import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextProps, TextStyle } from 'react-native';
import { colors, fonts } from '../../theme';
import type { Weight } from '../../theme';

export type TxtProps = TextProps & {
  /** font-size in px */
  s?: number;
  /** font-weight */
  w?: Weight;
  mono?: boolean;
  serif?: boolean;
  italic?: boolean;
  /** color */
  c?: string;
  /** letter-spacing in px */
  ls?: number;
  /** CSS line-height multiplier */
  lh?: number;
  center?: boolean;
  right?: boolean;
  /** clamp to n lines with an ellipsis */
  lines?: number;
  style?: StyleProp<TextStyle>;
};

export function family(w: Weight = 400, mono?: boolean, serif?: boolean, italic?: boolean) {
  if (serif) return italic ? fonts.serifItalic : fonts.serif;
  return (mono ? fonts.mono : fonts.sans)[w];
}

/** Text primitive matching the design's typography (Geist / Geist Mono / Instrument Serif). */
export function Txt({ s = 16, w = 400, mono, serif, italic, c = colors.ink, ls, lh, center, right, lines, style, children, ...rest }: TxtProps) {
  const st: TextStyle = { fontFamily: family(w, mono, serif, italic), fontSize: s, color: c };
  if (ls !== undefined) st.letterSpacing = ls;
  if (lh !== undefined) st.lineHeight = Math.round(s * lh * 10) / 10;
  if (center) st.textAlign = 'center';
  if (right) st.textAlign = 'right';
  return (
    <Text allowFontScaling={false} numberOfLines={lines} ellipsizeMode={lines ? 'tail' : undefined} style={[styles.base, st, style]} {...rest}>
      {children}
    </Text>
  );
}

/** Mono uppercase section label: Geist Mono 10.5px, letter-spacing .8px, #8B8A90. */
export function Label({ c = colors.muted2, s = 10.5, style, ...rest }: TxtProps) {
  return <Txt mono s={s} ls={0.8} c={c} style={style} {...rest} />;
}

const styles = StyleSheet.create({ base: { includeFontPadding: false } });
