// Product imagery of the final design: the two gold photos, the logo, and the per-mineral
// placeholder artwork that the prototype draws as SVG (bars, rough gems, flakes, rocks).
import React, { useId } from 'react';
import { Image, View } from 'react-native';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { CAT_TINT, catKey, D } from '../../theme';
import { catOf } from '../../lib/mb4';
import type { Product } from '../../types/mineralBridge';

export const IMG = {
  grains: require('../../../assets/images/mb_grains.jpg') as ImageSourcePropType,
  bars: require('../../../assets/images/mb_bars.jpg') as ImageSourcePropType,
  logo: require('../../../assets/images/mb_logo.png') as ImageSourcePropType,
};

const HUE: Record<string, [string, string]> = { gold: ['#F3D277', '#B8862B'], silver: ['#E6E9EC', '#8E959E'], platinum: ['#ECEEF0', '#9DA3AA'], copper: ['#E39A63', '#8A4A22'], bauxite: ['#CC7148', '#7A3519'], aluminium: ['#CC7148', '#7A3519'], nickel: ['#9DB197', '#4E6449'], zinc: ['#B9C3CC', '#5F6B76'], lead: ['#A1A7AE', '#4A5058'], tin: ['#C6BFB2', '#6E675C'], lithium: ['#EDC2D1', '#A66A82'], cobalt: ['#6F8DE0', '#22357A'], tantalum: ['#8A8594', '#2F2B36'], niobium: ['#A2A784', '#4C5036'], rare: ['#D6C8B0', '#7D6D55'], quartz: ['#FFFFFF', '#AEBAC2'], graphite: ['#62666C', '#1E2024'], mica: ['#E6D7B2', '#8D7B52'], feldspar: ['#F1D2C3', '#A57D68'], limestone: ['#EEE9DC', '#A49C86'], diamond: ['#FFFFFF', '#9FB4C8'], emerald: ['#55C795', '#176845'], rub: ['#E4506A', '#7E1428'], sapphire: ['#5A80E6', '#18307A'] };

const norm = (s?: string) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function hueOf(mineral: string): [string, string] {
  const m = norm(mineral);
  const k = Object.keys(HUE).find(h => m === h || m.startsWith(h) || m.includes(h));
  return k ? HUE[k] : ['#cccccc', '#777777'];
}
const isBarForm = (f: string) => /bar|bullion|cathode|sheet|biscuit/.test(norm(f));
const isPhotoBars = (f: string) => /bar|bullion|biscuit/.test(norm(f));
const isGold = (m: string) => norm(m).startsWith('gold');

/** The prototype's `art(mineral, form)` SVG, drawn natively. */
export function MineralArt({ mineral, form }: { mineral: string; form: string }) {
  const [a, b] = hueOf(mineral);
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const fillG = `url(#${id})`;
  const f = norm(form);
  let body: React.ReactNode;
  if (isBarForm(form)) {
    const bar = (x: number, y: number, k: number) => (
      <G key={k} transform={`translate(${x} ${y})`}>
        <Path d="M8 0h44l8 22H0z" fill={fillG} />
        <Path d="M8 0h44l-4 6H12z" fill="#fff" opacity={0.35} />
        <Path d="M0 22h60v6H0z" fill={b} />
      </G>
    );
    body = [bar(20, 62, 0), bar(80, 62, 1), bar(50, 34, 2)];
  } else if (f === 'rough') {
    const gem = (x: number, y: number, s: number, k: number) => (
      <G key={k} transform={`translate(${x} ${y}) scale(${s})`}>
        <Path d="M0 14 12 0h20l12 14-22 30z" fill={fillG} />
        <Path d="M0 14h44M12 0l4 14 6 30M32 0l-4 14-6 30" stroke="#fff" strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
        <Path d="M12 0h20l-4 14H16z" fill="#fff" opacity={0.35} />
      </G>
    );
    body = [gem(26, 44, 1, 0), gem(78, 30, 1.25, 1), gem(66, 80, 0.7, 2)];
  } else if (f === 'flake') {
    body = [[30, 40], [70, 30], [100, 56], [44, 74], [84, 82]].map((p, i) => (
      <Path key={i} transform={`translate(${p[0]} ${p[1]}) rotate(${i * 37})`} d="M0 8 14 0l16 6-6 14-18 2z" fill={fillG} stroke={b} strokeWidth={1} />
    ));
  } else {
    const rocks = [[34, 58, 26, 20], [78, 50, 30, 24], [56, 82, 28, 18], [102, 82, 18, 14], [22, 90, 14, 11]];
    body = rocks.map((r, i) => (
      <G key={i}>
        <Ellipse cx={r[0]} cy={r[1]} rx={r[2]} ry={r[3]} fill={fillG} />
        <Ellipse cx={r[0] - r[2] * 0.3} cy={r[1] - r[3] * 0.35} rx={r[2] * 0.35} ry={r[3] * 0.25} fill="#fff" opacity={0.35} />
      </G>
    ));
  }
  return (
    <Svg width="100%" height="100%" viewBox="0 0 140 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={a} /><Stop offset="1" stopColor={b} /></LinearGradient>
      </Defs>
      <Ellipse cx={70} cy={104} rx={54} ry={7} fill="#000" opacity={0.08} />
      {body}
    </Svg>
  );
}

/** What to draw for a product (`prodImg` in the prototype). Remote photos from the API win over placeholder art. */
export type Im = { kind: 'photo'; src: ImageSourcePropType; bars: boolean } | { kind: 'art'; mineral: string; form: string };

export function prodIm(p?: Pick<Product, 'mineral' | 'form' | 'img'> | null): Im {
  if (!p) return { kind: 'art', mineral: '', form: 'Ore' };
  if (/^https?:\/\//i.test(p.img || '')) return { kind: 'photo', src: { uri: p.img }, bars: false };
  if (isGold(p.mineral) && /dore|doré/.test(norm(p.form))) return { kind: 'art', mineral: 'gold', form: 'Bars' };
  if (isGold(p.mineral)) return isPhotoBars(p.form) ? { kind: 'photo', src: IMG.bars, bars: true } : { kind: 'photo', src: IMG.grains, bars: false };
  return { kind: 'art', mineral: p.mineral, form: p.form };
}
/** Background behind an image: white for the bars photo, near-black for photos, otherwise `tint`. */
export const imBg = (im: Im, tint: string = D.TINT) => (im.kind === 'photo' ? (im.bars ? D.white : D.photoDark) : tint);
/** Category tint of a product's mineral. */
export const tintOf = (mineral: string) => CAT_TINT[catKey((catOf(mineral) || { id: '' }).id)] || D.TINT;

/** The image itself, filling its parent: cover for photos, `inset` (84%) contain for bars/art. */
export function ImFill({ im, inset = 0.84 }: { im: Im; inset?: number }) {
  const full = im.kind === 'photo' && !im.bars;
  if (im.kind === 'photo') {
    return <Image source={im.src} resizeMode={full ? 'cover' : 'contain'} style={{ width: (full ? 100 : inset * 100) + '%', height: (full ? 100 : inset * 100) + '%' } as never} />;
  }
  return <View style={{ width: inset * 100 + '%', height: inset * 100 + '%' } as never}><MineralArt mineral={im.mineral} form={im.form} /></View>;
}

/** `thumb(im, sz)`: rounded 14, bordered square. */
export function Thumb({ im, sz, style }: { im: Im; sz: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: sz, height: sz, borderRadius: 14, overflow: 'hidden', backgroundColor: imBg(im), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: D.BOR }, style]}>
      <ImFill im={im} />
    </View>
  );
}

/** Image shown for a category (`CAT_IMG`). */
export function catIm(id: string): Im {
  const k = catKey(id);
  if (k === 'precious') return { kind: 'photo', src: IMG.bars, bars: true };
  const m: Record<string, [string, string]> = { base: ['copper', 'Cathode'], critical: ['cobalt', 'Ore'], industrial: ['quartz', 'Lump'], gems: ['emeralds', 'Rough'] };
  return { kind: 'art', mineral: m[k][0], form: m[k][1] };
}

/** Round Mineral Bridge logo with its drop shadow (`flat` removes it). */
export function Logo({ sz, flat }: { sz: number; flat?: boolean }) {
  return (
    <View style={{ width: sz, height: sz, borderRadius: sz / 2, boxShadow: flat ? undefined : '0 18px 30px rgba(0,0,0,.55)' }}>
      <Image source={IMG.logo} accessibilityLabel="Mineral Bridge" style={{ width: sz, height: sz, borderRadius: sz / 2 }} resizeMode="contain" />
    </View>
  );
}
