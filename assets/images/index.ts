import type { ImageSourcePropType } from 'react-native';

/** Photography and brand art bundled with the design, keyed by the design's asset names. */
export const images = {
  'logo-circle': require('./logo-circle.png'),
  'hero-grain': require('./hero-grain.png'),
  'cat-precious': require('./cat-precious.png'),
  'cat-gemstone': require('./cat-gemstone.png'),
  'cat-industrial': require('./cat-industrial.png'),
  'cat-critical': require('./cat-critical.png'),
  'm-gold': require('./m-gold.png'),
  'm-platinum': require('./m-platinum.png'),
  'm-silver': require('./m-silver.png'),
  'gold-bullion': require('./gold-bullion.png'),
  'gold-dore': require('./gold-dore.png'),
  'gold-concentrate': require('./gold-concentrate.png'),
  'gold-dust': require('./gold-dust.png'),
  'grain-shot': require('./grain-shot.png'),
  'gold-biscuit': require('./gold-biscuit.png'),
} satisfies Record<string, ImageSourcePropType>;

export type ImageName = keyof typeof images;
