/**
 * Colour tokens taken verbatim from the Mineral Bridge mobile design
 * (`Mineral Bridge Mobile Prototype.dc.html`). Names describe the role the
 * colour plays in the design; values are never adjusted.
 */
export const colors = {
  // Brand navy
  navy: '#1e2a5a',
  navyDeep: '#141d40',
  navyNight: '#0e1430',
  navyFrame: '#10163a',
  navyButtonTop: '#243258',
  navyButtonBottom: '#1a2450',
  navyButtonBorder: '#16204a',
  navyMuted: '#33406e',

  // Gold
  goldLight: '#f7dd8e',
  gold: '#c8962f',
  goldSoft: '#f3d27a',
  goldInk: '#2b1f04',
  goldInkDeep: '#3d2c05',

  // Text
  ink: '#1a1f36',
  body: '#4a5170',
  muted: '#6b7290',
  subtle: '#606780',
  label: '#7b839c',
  faint: '#8890ad',
  placeholder: '#a3abc4',
  ghost: '#b9c0d6',
  white: '#ffffff',

  // Dark-ground text
  onDarkMuted: '#a9b5dd',
  onDarkSoft: '#c3cbe8',
  onDarkBright: '#d3daf0',
  onDarkDim: '#8f9dcd',

  // Surfaces and lines
  screen: '#f4f5f7',
  surface: '#ffffff',
  surfaceAlt: '#fafbfc',
  tint: '#f0f2f6',
  tintCool: '#f1f3f7',
  tintGrey: '#f1f2f6',
  border: '#e5e7ec',
  borderInput: '#e2e5ec',
  borderSoft: '#dfe2e9',
  borderButton: '#d8dce5',
  divider: '#f1f2f6',
  dashed: '#c9cdd8',
  keypad: '#e7e9ee',

  // Status
  link: '#2563eb',
  infoBg: '#eff3fe',
  infoBorder: '#d6e2fb',
  infoText: '#3b6fd4',
  blue: '#1d4fd7',
  blueTint: '#eef3fe',
  success: '#16a34a',
  successDeep: '#15803d',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  successTint: '#edf7f1',
  successTintBorder: '#cfe7d8',
  successSoft: '#e8f4ec',
  successChip: '#ecf7f0',
  successBright: '#86efac',
  successLive: '#22c55e',
  warnBg: '#fef9ec',
  warnBorder: '#fde68a',
  warnText: '#b45309',
  amberTint: '#fbf3e4',
  amberBorder: '#eddfc0',
  amber: '#a1620b',
  goldTint: '#f8f2e3',
  goldTintInk: '#8a6a1c',
  danger: '#dc2626',
  dangerDeep: '#c0392b',
  dangerTint: '#fdeeee',
  dangerBorder: '#f3d4d4',
} as const;

export type ColorToken = keyof typeof colors;
