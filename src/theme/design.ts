// Design tokens of "Mineral Bridge Mobile Final" (Selorg app layout): navy + gold on warm paper,
// Plus Jakarta Sans. Values are copied from the HTML prototype (const C and the inline styles).
export const D = {
  G: '#14284B', // navy (primary)
  GD: '#8A6A1C', // gold ink
  INK: '#0E1A33',
  MUT: '#6B6A70',
  BOR: '#E4E2DB',
  BG: '#F4F2ED',
  TINT: '#F6EED8',
  DANGER: '#B42318',
  AMBER: '#A1620B',
  GOLD: '#D9B456',
  white: '#FFFFFF',
  black: '#1A1A1A',
  faint: '#9C9AA0',
  heart: '#8B8A90',
  dash: '#D5D3CC',
  radioOff: '#C8C6BF',
  disabled: '#C9C7C0',
  dangerBg: '#FDECEC',
  redBg: '#FDECEA',
  redLine: '#F2CFCB',
  amberBg: '#FBF3E4',
  amberInk: '#7A4A08',
  amberInk2: '#8A5310',
  green: '#17704C',
  greenBg: '#E2F2E9',
  greenLine: '#B7DFC8',
  navyMute: '#C9CFDC',
  navyFaint: '#9AA3B8',
  deep: '#0A1428',
  cream: '#EFE5C9',
  cream2: '#F6F1E4',
  sand: '#D9CBA0',
  sand2: '#D2C49B',
  goldLine: '#E6D49E',
  goldLight: '#F0D78C',
  paper2: '#FAF8F2',
  paper3: '#FBF6EA',
  chip: '#F1EFE9',
  hair: '#EFEDE7',
  ink2: '#3A3940',
  live: '#C2412D',
  violetBg: '#EDE9F7',
  violet: '#4B3B8F',
  blueBg: '#E8EEF9',
  blue: '#2B4C8C',
  slateBg: '#EEF0F5',
  slate: '#3A4560',
  radioBg: '#F8F6EF',
  unreadBg: '#FFFCF3',
  unreadLine: '#EAD9A6',
  photoDark: '#1B1B1B',
  placeholder: '#A9A9A9',
};

/** Category tints (TINT in the prototype), keyed by category id. */
export const CAT_TINT: Record<string, string> = { precious: '#F6EFDD', base: '#F4E9E2', critical: '#ECEAF4', industrial: '#EEF0EC', gems: '#E8F1EE' };

/** Map an API category slug onto the prototype's five category ids. */
export function catKey(id?: string): string {
  const s = String(id || '').toLowerCase();
  if (s.includes('precious')) return 'precious';
  if (s.includes('base')) return 'base';
  if (s.includes('critical')) return 'critical';
  if (s.includes('industrial')) return 'industrial';
  if (s.includes('gem')) return 'gems';
  return s in CAT_TINT ? s : 'precious';
}

export const SHADOW = {
  primary: '0 10px 22px -12px rgba(20,40,75,.65)',
  gold: '0 10px 22px -12px rgba(217,180,86,.9)',
  card: '0 8px 22px -16px rgba(14,26,51,.5)',
  hero: '0 16px 34px -16px rgba(20,40,75,.55)',
  dark: '0 18px 34px -18px rgba(14,26,51,.7)',
  badge: '0 20px 40px -12px rgba(20,40,75,.5)',
  toast: '0 14px 30px -10px rgba(0,0,0,.4)',
};
