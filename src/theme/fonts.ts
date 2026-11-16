// Bundled fonts (assets/fonts). Each family string is both the file name
// (Android) and the PostScript name (iOS), so one value works on both.
export type Weight = 400 | 500 | 600 | 700;

export const fonts = {
  sans: { 400: 'Geist-Regular', 500: 'Geist-Medium', 600: 'Geist-SemiBold', 700: 'Geist-Bold' } as Record<Weight, string>,
  mono: { 400: 'GeistMono-Regular', 500: 'GeistMono-Medium', 600: 'GeistMono-SemiBold', 700: 'GeistMono-Bold' } as Record<Weight, string>,
  serif: 'InstrumentSerif-Regular',
  serifItalic: 'InstrumentSerif-Italic',
};
