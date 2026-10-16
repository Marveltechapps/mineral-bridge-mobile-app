/**
 * Icon geometry copied from the design's inline SVGs (24×24 viewBox, round
 * caps and joins). Each icon is a list of shapes rendered with react-native-svg.
 */
export type IconShape =
  | { d: string }
  | { circle: readonly [cx: number, cy: number, r: number] }
  | {
      rect: readonly [x: number, y: number, w: number, h: number, rx?: number];
    };

const p = (d: string): IconShape => ({ d });

export const icons = {
  back: [p('M15 18l-6-6 6-6')],
  bell: [
    p('M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8'),
    p('M13.7 21a2 2 0 0 1-3.4 0'),
  ],
  eye: [
    p('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z'),
    { circle: [12, 12, 2.6] },
  ],
  info: [{ circle: [12, 12, 9] }, p('M12 16v-5M12 8h.01')],
  check: [p('M20 6L9 17l-5-5')],
  chevronDown: [p('M6 9l6 6 6-6')],
  chevronRight: [p('M9 6l6 6-6 6')],
  play: [p('M7 4.5v15l13-7.5z')],
  playOutline: [p('M5 4.5v15l14-7.5z')],
  pause: [{ rect: [6, 4, 4, 16, 1] }, { rect: [14, 4, 4, 16, 1] }],
  restart: [p('M3 12a9 9 0 1 0 3-6.7M3 4v5h5')],
  pickaxe: [
    p('M14 3.5 20.5 10 17 13.5 10.5 7z'),
    p('M10.5 7 4 13.5V20h6.5L17 13.5'),
  ],
  verified: [
    p('M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9'),
  ],
  building: [p('M3 21V8l9-5 9 5v13M9 21v-6h6v6')],
  shield: [
    p('M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6z'),
    p('M9.2 12.2l2 2 3.6-4'),
  ],
  camera: [
    p(
      'M4 8V6a2 2 0 0 1 2-2h1.5l1.2-1.6h6.6L16.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
    ),
    { circle: [12, 12, 3.4] },
  ],
  face: [{ circle: [12, 9, 4] }, p('M5 21c0-3.4 3.1-6 7-6s7 2.6 7 6')],
  clock: [{ circle: [12, 12, 9] }, p('M12 8v4l3 2')],
  doc: [
    p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'),
    p('M14 3v5h5'),
  ],
  download: [p('M12 4v12M7 11l5 5 5-5M4 20h16')],
  search: [{ circle: [11, 11, 7] }, p('M20 20l-4.3-4.3')],
  filter: [p('M3 5h18M6 12h12M10 19h4')],
  minus: [p('M5 12h14')],
  plus: [p('M12 5v14M5 12h14')],
  calendar: [{ rect: [3, 5, 18, 16, 3] }, p('M8 3v4M16 3v4M3 11h18')],
  close: [p('M18 6 6 18M6 6l12 12')],
  upload: [p('M12 16V4M7 9l5-5 5 5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2')],
  phone: [
    p(
      'M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.6 18.6 0 0 1-5.7-5.7A19 19 0 0 1 2.8 4.2 2 2 0 0 1 4.8 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1l-1.2 1.3a15 15 0 0 0 5.7 5.7l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
    ),
  ],
  pin: [
    p('M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z'),
    { circle: [12, 10, 2.6] },
  ],
  currency: [p('M12 3v18M8 7h8M8 12h8')],
  chat: [
    p('M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z'),
  ],
  doubleCheck: [p('M2 13l4 4L14 7'), p('M11 15l2 2L22 7')],
  paperclip: [
    p(
      'M21 12.5 12.5 21a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 18.9a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8',
    ),
  ],
  send: [p('M4 12h15M13 6l6 6-6 6')],
  trash: [p('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14')],
  bank: [p('M3 9h18v11H3zM3 9l2-5h14l2 5M12 4v5')],
  arrowUp: [p('M12 19V5M5 12l7-7 7 7')],
  logout: [p('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')],
  lock: [{ rect: [4, 10, 16, 11, 3] }, p('M8 10V7a4 4 0 0 1 8 0v3')],
  edit: [p('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z')],
  cart: [
    p('M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6'),
    { circle: [9.5, 20, 1.4] },
    { circle: [18, 20, 1.4] },
  ],
  warning: [
    p(
      'M12 9v4M12 17h.01M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8A1.8 1.8 0 0 0 21.5 18L13.7 3.9a1.8 1.8 0 0 0-3.4 0z',
    ),
  ],
  fullscreen: [
    p(
      'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3',
    ),
  ],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof icons;
