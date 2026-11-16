import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/** [offset 0–1, css colour (hex or rgba())] */
export type GStop = [number, string];

function parse(c: string): [string, number] {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return [c, 1];
  const [r, g, b, a = '1'] = m[1].split(',').map(x => x.trim());
  const hex = '#' + [r, g, b].map(v => Number(v).toString(16).padStart(2, '0')).join('');
  return [hex, Number(a)];
}

const VEC: Record<number, [string, string, string, string]> = {
  180: ['0', '0', '0', '1'],
  90: ['0', '0', '1', '0'],
  135: ['0', '0', '1', '1'],
};

/** CSS linear-gradient() as an absolutely positioned fill (180deg = top→bottom). */
export function LinearFill({ stops, angle = 180, style, radius }: { stops: GStop[]; angle?: 90 | 135 | 180; style?: StyleProp<ViewStyle>; radius?: number }) {
  const id = 'lg' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [x1, y1, x2, y2] = VEC[angle];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, radius ? { borderRadius: radius, overflow: 'hidden' } : null, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
            {stops.map(([o, c], i) => { const [hex, a] = parse(c); return <Stop key={i} offset={o} stopColor={hex} stopOpacity={a} />; })}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** radial-gradient(circle, color, transparent 70%) inside a circle of `size`. */
export function RadialBlob({ size, color, style }: { size: number; color: string; style?: StyleProp<ViewStyle> }) {
  const id = 'rg' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [hex, a] = parse(color);
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={hex} stopOpacity={a} />
            <Stop offset="0.99" stopColor={hex} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
