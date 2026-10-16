import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { icons, type IconName, type IconShape } from '../../../assets/icons';

type Props = {
  /** A named icon from the design's icon set. */
  name?: IconName;
  /** Raw path data, for icons the design passes in as data (`d="{{ x.icon }}"`). */
  d?: string;
  size: number;
  color: string;
  strokeWidth?: number;
  /** Solid glyphs (play / pause) use `fill="currentColor" stroke="none"`. */
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Icon({
  name,
  d,
  size,
  color,
  strokeWidth = 2,
  filled = false,
  style,
}: Props) {
  const shapes: readonly IconShape[] = name ? icons[name] : d ? [{ d }] : [];
  const paint = filled
    ? { fill: color, stroke: 'none' }
    : {
        fill: 'none',
        stroke: color,
        strokeWidth,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {shapes.map((s, i) => {
        if ('d' in s) return <Path key={i} d={s.d} {...paint} />;
        if ('circle' in s) {
          const [cx, cy, r] = s.circle;
          return <Circle key={i} cx={cx} cy={cy} r={r} {...paint} />;
        }
        const [x, y, w, h, rx] = s.rect;
        return (
          <Rect key={i} x={x} y={y} width={w} height={h} rx={rx} {...paint} />
        );
      })}
    </Svg>
  );
}
