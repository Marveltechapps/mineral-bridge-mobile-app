import type { ImageSourcePropType } from 'react-native';

// Design handoff images (assets/*.png in the HTML prototype).
const IMAGES: Record<string, ImageSourcePropType> = {
  'hero-grain': require('../../assets/images/hero_grain.png'),
  'gold-bullion': require('../../assets/images/gold_bullion.png'),
  'gold-dore': require('../../assets/images/gold_dore.png'),
  'gold-biscuit': require('../../assets/images/gold_biscuit.png'),
  'gold-dust': require('../../assets/images/gold_dust.png'),
  'gold-concentrate': require('../../assets/images/gold_concentrate.png'),
  'grain-shot': require('../../assets/images/grain_shot.png'),
  'm-silver': require('../../assets/images/m_silver.png'),
  'm-platinum': require('../../assets/images/m_platinum.png'),
  'cat-precious': require('../../assets/images/cat_precious.png'),
  'cat-industrial': require('../../assets/images/cat_industrial.png'),
  'cat-critical': require('../../assets/images/cat_critical.png'),
  'cat-gemstone': require('../../assets/images/cat_gemstone.png'),
};

export function imgFor(name: string): ImageSourcePropType {
  return IMAGES[name] || IMAGES['cat-precious'];
}
