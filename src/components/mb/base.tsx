// Primitives of the final design: Plus Jakarta Sans text, the Selorg line-icon set and CSS-style gradients.
import React, { useEffect, useId, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextProps, TextStyle, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { D, fonts } from '../../theme';
import type { JWeight } from '../../theme';

export const jakarta = (w: JWeight = 600) => fonts.jakarta[w];

export type TProps = TextProps & {
  /** font-size (px) */
  s?: number;
  /** font-weight 400–800 */
  w?: JWeight;
  /** color */
  c?: string;
  /** line-height multiplier */
  lh?: number;
  /** letter-spacing in em */
  ls?: number;
  center?: boolean;
  right?: boolean;
  italic?: boolean;
  /** clamp to n lines with an ellipsis */
  lines?: number;
  style?: StyleProp<TextStyle>;
};

/** Text in Plus Jakarta Sans (the prototype's only typeface). */
export function T({ s = 14, w = 600, c = D.INK, lh, ls, center, right, italic, lines, style, children, ...rest }: TProps) {
  const st: TextStyle = { fontFamily: jakarta(w), fontSize: s, color: c };
  if (lh !== undefined) st.lineHeight = Math.round(s * lh * 10) / 10;
  if (ls !== undefined) st.letterSpacing = ls * s;
  if (center) st.textAlign = 'center';
  if (right) st.textAlign = 'right';
  if (italic) st.fontStyle = 'italic';
  return (
    <Text allowFontScaling={false} numberOfLines={lines} ellipsizeMode={lines ? 'tail' : undefined} style={[base.text, st, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ---------------------------------------------------------------- icons (Selorg line set + MB glyphs) */

export const PATHS: Record<string, string[]> = {
  home: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  bag: ['M6 7h12l1 14H5z', 'M9 7a3 3 0 0 1 6 0'],
  dollar: ['M12 2v20', 'M17 6.5C16 5 14.3 4.5 12 4.5c-3 0-4.5 1.5-4.5 3.3 0 4.4 9.5 2.4 9.5 7.4 0 2-1.8 3.5-5 3.5-2.6 0-4.3-.8-5.3-2.4'],
  box: ['M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'cc:12,7,4'],
  cart: ['M2 3h2l2.4 12.5a2 2 0 0 0 2 1.5h9.3a2 2 0 0 0 2-1.6L22 7H6', 'cc:9,20,1.4', 'cc:18,20,1.4'],
  bell: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'],
  search: ['cc:11,11,8', 'm21 21-4.3-4.3'],
  mail: ['M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'm3.5 6.5 8.5 6 8.5-6'],
  wa: ['M3 21l1.6-5A9 9 0 1 1 8 19.4z', 'M9 10c0 2.5 2.5 5 5 5l1.2-1.2 2 1-1 2c-4 0-8-4-8-8l2-1 1 2z'],
  shield: ['M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z', 'M9 12l2 2 4-4'],
  lock: ['rr:3,11,18,10,2', 'M7 11V7a5 5 0 0 1 10 0v4'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9z'],
  check: ['M20 6 9 17l-5-5'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  plus: ['M12 5v14', 'M5 12h14'],
  chevronLeft: ['m15 18-6-6 6-6'], chevronRight: ['m9 18 6-6-6-6'], chevronDown: ['m6 9 6 6 6-6'],
  arrowRight: ['M5 12h14', 'm13 6 6 6-6 6'],
  clock: ['cc:12,12,9', 'M12 7v5l3 2'],
  flask: ['M9 3h6', 'M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3', 'M7 15h10'],
  badge: ['cc:12,9,6', 'M8.5 13.5 7 22l5-3 5 3-1.5-8.5'],
  truck: ['M14 17V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11h2', 'M14 8h4l3 4v5h-2', 'M9 17h4', 'cc:6.5,17.5,2', 'cc:18,17.5,2'],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'cc:12,10,3'],
  heart: ['M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z'],
  camera: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z', 'cc:12,13,3.5'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  file: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5'],
  globe: ['cc:12,12,9', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18'],
  building: ['rr:5,2,14,20,2', 'M9 22v-4h6v4', 'M9 6h.01', 'M15 6h.01', 'M9 10h.01', 'M15 10h.01', 'M9 14h.01', 'M15 14h.01'],
  signal: ['M2 20h.01', 'M7 20v-4', 'M12 20v-8', 'M17 20V8', 'M22 20V4'],
  battery: ['rr:2,7,18,10,2.5', 'M22 11v2', 'M5 10h8v4H5z'],
  star: ['M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z'],
  help: ['cc:12,12,9', 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4', 'M12 17h.01'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  card: ['rr:2,5,20,14,2.5', 'M2 10h20'],
  bank: ['M3 21h18', 'M5 21v-9', 'M9 21v-9', 'M15 21v-9', 'M19 21v-9', 'M12 3 3 8h18z'],
  zap: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  btc: ['M9 4v16', 'M13 4v3', 'M13 17v3', 'M7 7h7a3 3 0 0 1 0 6H7', 'M7 13h8a3 3 0 0 1 0 6H7'],
  gavel: ['M14 3.5 20.5 10 17 13.5 10.5 7z', 'M10.5 7 4 13.5 7.5 17 14 10.5', 'M3 21h9'],
  refund: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'cc:9,7,4', 'M23 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  send: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],
  msg: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  chat: ['M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'cc:12,12,3'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'],
};

/** Line icon from the prototype (`ic(name, {s, c, w, fill})`). `name` may also be a raw SVG path starting with M. */
export function Ic({ name, s = 22, c = D.INK, w = 2, fill = 'none' }: { name: string; s?: number; c?: string; w?: number; fill?: string }) {
  const list = PATHS[name] || (name.indexOf('M') === 0 ? [name] : ['cc:12,12,9']);
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {list.map((d, i) => {
        if (d.indexOf('cc:') === 0) { const a = d.slice(3).split(',').map(Number); return <Circle key={i} cx={a[0]} cy={a[1]} r={a[2]} stroke={c} strokeWidth={w} fill={fill} />; }
        if (d.indexOf('rr:') === 0) { const a = d.slice(3).split(',').map(Number); return <Rect key={i} x={a[0]} y={a[1]} width={a[2]} height={a[3]} rx={a[4]} stroke={c} strokeWidth={w} fill={fill} strokeLinejoin="round" />; }
        return <Path key={i} d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill={fill} />;
      })}
    </Svg>
  );
}

/* ---------------------------------------------------------------- gradients */

export type Stop2 = [number, string];

function parse(col: string): [string, number] {
  const m = col.match(/rgba?\(([^)]+)\)/);
  if (!m) return [col, 1];
  const [r, g, b, a = '1'] = m[1].split(',').map(x => x.trim());
  return ['#' + [r, g, b].map(v => Number(v).toString(16).padStart(2, '0')).join(''), Number(a)];
}
const stopsOf = (stops: Stop2[]) => stops.map(([o, col], i) => { const [hex, a] = parse(col); return <Stop key={i} offset={o} stopColor={hex} stopOpacity={a} />; });

/** CSS `linear-gradient(<angle>deg, ...)` as an absolute fill. 180 = top→bottom, 90 = left→right. */
export function Grad({ angle = 180, stops, radius, style }: { angle?: number; stops: Stop2[]; radius?: number | [number, number, number, number]; style?: StyleProp<ViewStyle> }) {
  const id = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = (angle * Math.PI) / 180, sx = Math.sin(a), sy = -Math.cos(a), L = (Math.abs(sx) + Math.abs(sy)) / 2;
  const r = Array.isArray(radius) ? { borderTopLeftRadius: radius[0], borderTopRightRadius: radius[1], borderBottomRightRadius: radius[2], borderBottomLeftRadius: radius[3] } : radius ? { borderRadius: radius } : null;
  // Explicit pixel size: percentage-sized SVGs do not redraw on Android when the parent grows.
  const [sz, setSz] = useState({ w: 0, h: 0 });
  return (
    <View pointerEvents="none" onLayout={e => { const { width: w, height: h } = e.nativeEvent.layout; if (w !== sz.w || h !== sz.h) setSz({ w, h }); }} style={[StyleSheet.absoluteFill, r ? [r, { overflow: 'hidden' }] : null, style]}>
      {sz.w > 0 ? <Svg width={sz.w} height={sz.h}>
        <Defs>
          <LinearGradient id={id} x1={0.5 - sx * L} y1={0.5 - sy * L} x2={0.5 + sx * L} y2={0.5 + sy * L}>{stopsOf(stops)}</LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={sz.w} height={sz.h} fill={`url(#${id})`} />
      </Svg> : null}
    </View>
  );
}

/** CSS `radial-gradient(rx ry at cx cy, ...)` in bounding-box units, as an absolute fill. */
export function RadGrad({ cx = 0.5, cy = 0.5, rx = 0.71, ry, stops, radius, style }: { cx?: number; cy?: number; rx?: number; ry?: number; stops: Stop2[]; radius?: number; style?: StyleProp<ViewStyle> }) {
  const id = 'r' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [sz, setSz] = useState({ w: 0, h: 0 });
  return (
    <View pointerEvents="none" onLayout={e => { const { width: w, height: h } = e.nativeEvent.layout; if (w !== sz.w || h !== sz.h) setSz({ w, h }); }} style={[StyleSheet.absoluteFill, radius ? { borderRadius: radius, overflow: 'hidden' } : null, style]}>
      {sz.w > 0 ? <Svg width={sz.w} height={sz.h}>
        <Defs>
          <RadialGradient id={id} cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fx={cx} fy={cy}>{stopsOf(stops)}</RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={sz.w} height={sz.h} fill={`url(#${id})`} />
      </Svg> : null}
    </View>
  );
}

/* ---------------------------------------------------------------- keyframes used by the prototype */

const easeOut = Easing.bezier(0.22, 0.61, 0.36, 1);

/** `rise` (fade + 10px up) / `screenin` entrance. */
export function Rise({ children, style, dur = 280, dist = 10, delay = 0 }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; dur?: number; dist?: number; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: dur, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }, [v, dur, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }] }]}>{children}</Animated.View>;
}

/** `fadein`. */
export function FadeIn({ children, style, dur = 250 }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; dur?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }, [v, dur]);
  return <Animated.View style={[style, { opacity: v }]}>{children}</Animated.View>;
}

/** `pop`: scale .85 → 1.08 → 1. */
export function PopIn({ children, style, dur = 500 }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; dur?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }).start(); }, [v, dur]);
  return <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.85, 1.08, 1] }) }] }]}>{children}</Animated.View>;
}

/** `stepin` (cart stepper appears): scale .6 → 1.06 → 1 with fade. */
export function StepIn({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: true }).start(); }, [v]);
  return <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>{children}</Animated.View>;
}

/** `slideup` for bottom sheets. */
export function SlideUp({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 300, easing: easeOut, useNativeDriver: true }).start(); }, [v]);
  return <Animated.View style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>{children}</Animated.View>;
}

/** Infinite loop helper (`spin`, `floaty`, `ring`, `loadbar`, `blink`). */
export function useLoop(dur: number, pingPong = false, easing = Easing.linear) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = pingPong
      ? Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]))
      : Animated.loop(Animated.timing(v, { toValue: 1, duration: dur, easing, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [v, dur, pingPong, easing]);
  return v;
}

/** `floaty`: 3px vertical bob. */
export function Floaty({ children, dur = 2800, dist = 3 }: { children?: React.ReactNode; dur?: number; dist?: number }) {
  const v = useLoop(dur, true);
  return <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -dist] }) }] }}>{children}</Animated.View>;
}

const base = StyleSheet.create({ text: { includeFontPadding: false } });
