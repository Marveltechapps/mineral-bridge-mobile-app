import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme';

type Props = {
  d?: string;
  size?: number;
  color?: string;
  sw?: number;
  circles?: [number, number, number][];
  linejoin?: boolean;
  view?: string;
  w?: number;
  h?: number;
};

/** Stroke icon drawn from the design's 24×24 SVG paths. */
export function Icon({ d, size = 18, color = colors.ink, sw = 1.8, circles, linejoin = true, view = '0 0 24 24', w, h }: Props) {
  return (
    <Svg width={w || size} height={h || size} viewBox={view} fill="none">
      {d ? <Path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin={linejoin ? 'round' : undefined} fill="none" /> : null}
      {(circles || []).map(([cx, cy, r], i) => <Circle key={i} cx={cx} cy={cy} r={r} stroke={color} strokeWidth={sw} fill="none" />)}
    </Svg>
  );
}

export const IC = {
  back: 'M15 18l-6-6 6-6',
  chevron: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  check: 'M20 6L9 17l-5-5',
  bag: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  search: 'M20 20l-4-4',
  sort: 'M3 6h18M6 12h12M10 18h4',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  truck: 'M1 7h13v10H1zM14 10h4l3 3v4h-7M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  refund: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  clock: 'M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  replace: 'M1 4v6h6M3.5 15a9 9 0 1 0 2.1-9.4L1 10',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  arrow: 'M2 7h28M25 2l5 5-5 5',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  email: 'M4 4h16v16H4zM22 6l-10 7L2 6',
  whatsapp: 'M3 21l1.6-5A9 9 0 1 1 8 19.4z',
  whatsappFull: 'M3 21l1.6-5A9 9 0 1 1 8 19.4zM9 10c0 2.5 2.5 5 5 5l1.2-1.2 2 1-1 2c-4 0-8-4-8-8l2-1 1 2z',
};
