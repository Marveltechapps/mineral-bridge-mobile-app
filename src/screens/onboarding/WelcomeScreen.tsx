import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { FadeIn, Grad, Rise, T } from '../../components/mb/base';
import { IMG, MineralArt } from '../../components/mb/art';
import { Btn, Press } from '../../components/mb/kit';
import { CAT_TINT, D } from '../../theme';
import type { ScreenProps } from '../types';

const ONBOARD = [
  { t1: 'Buy and sell minerals,', t2: 'verified at every step.', sub: 'Inspected lots, agreed quotations, e-contracts and tracked delivery for buyers and sellers worldwide.', type: 'img', img: 'grains', tag: 'VERIFIED MINERAL TRADING' },
  { t1: 'Verified minerals,', t2: 'from mine to delivery.', sub: 'Every buyer and seller is verified before trading. Inspected · certified · tracked.', type: 'grid' },
  { t1: 'Buy, sell or both', t2: 'from one account.', sub: 'Choose Both to buy and sell from one account. Pick one buyer type and one seller type.', type: 'img', img: 'bars', tag: 'INSPECTED · CERTIFIED · TRACKED' },
] as const;
const TILES: [string, string, string][] = [['gold', 'Bars', 'precious'], ['copper', 'Cathode', 'base'], ['lithium', 'Ore', 'critical'], ['emeralds', 'Rough', 'gems'], ['quartz', 'Lump', 'industrial'], ['cobalt', 'Hydroxide', 'critical']];

function Dot({ on, onPress, i }: { on: boolean; onPress: () => void; i: number }) {
  const v = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => { Animated.timing(v, { toValue: on ? 1 : 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: false }).start(); }, [v, on]);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={'Slide ' + (i + 1)} hitSlop={8} onPress={onPress}>
      <Animated.View style={{ height: 8, borderRadius: 4, width: v.interpolate({ inputRange: [0, 1], outputRange: [8, 24] }), backgroundColor: v.interpolate({ inputRange: [0, 1], outputRange: [D.dash, D.G] }) }} />
    </Pressable>
  );
}

function Tile({ t, i }: { t: [string, string, string]; i: number }) {
  const gold = t[0] === 'gold';
  return (
    <Rise dur={500} delay={i * 60} style={{ width: 104, height: 104, borderRadius: 22, backgroundColor: gold ? D.white : CAT_TINT[t[2]], alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -16px rgba(14,26,51,.5)' }}>
      {gold ? <Image source={IMG.bars} resizeMode="contain" style={{ width: '78%', height: '78%', borderRadius: 12 }} /> : <View style={{ width: '78%', height: '78%' }}><MineralArt mineral={t[0]} form={t[1]} /></View>}
    </Rise>
  );
}

/** Onboarding carousel (`scr_onboarding`): three slides, Skip, dots, Next / Get Started. */
export function WelcomeScreen({ onOpenStarter }: ScreenProps) {
  const store = useStore();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const d = ONBOARD[i], last = i === ONBOARD.length - 1;
  const toAuth = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signup' }, authErr: '' })); store.jump('auth'); };
  const next = () => (last ? toAuth() : setI(i + 1));
  return (
    <View style={{ flexGrow: 1, backgroundColor: D.white, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 10, paddingHorizontal: 20 }}>
        <Press onPress={toAuth}><T s={13.5} w={800} c={D.MUT}>Skip</T></Press>
      </View>
      <Rise key={'tx' + i} dur={400} style={{ paddingTop: 6, paddingHorizontal: 26 }}>
        <T s={29} w={800} c={D.black} ls={-0.03} lh={1.1}>{d.t1 + '\n' + d.t2}</T>
        <T s={13} w={600} c={D.MUT} lh={1.55} style={{ marginTop: 10, maxWidth: 310 }}>{d.sub}</T>
      </Rise>
      <View style={{ flexDirection: 'row', gap: 7, marginTop: 16, marginHorizontal: 26 }}>
        {ONBOARD.map((_, k) => <Dot key={k} i={k} on={k === i} onPress={() => setI(k)} />)}
      </View>
      <View style={{ flex: 1, minHeight: 360, marginTop: 18, marginHorizontal: 20 }}>
        <FadeIn key={'im' + i} dur={450} style={[st.media, { bottom: 96 + insets.bottom }]}>
          <Pressable style={{ flex: 1 }} onLongPress={onOpenStarter} delayLongPress={900} accessibilityLabel="Mineral Bridge">
            {d.type === 'grid' ? (
              <View style={{ flex: 1, backgroundColor: D.chip, padding: 18, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 }}>
                  {TILES.map((t, k) => <View key={k} style={{ width: '50%', alignItems: 'center' }}><Tile t={t} i={k} /></View>)}
                </View>
              </View>
            ) : (
              <View style={{ flex: 1, backgroundColor: d.img === 'bars' ? D.white : D.photoDark }}>
                <Image source={IMG[d.img]} resizeMode={d.img === 'bars' ? 'contain' : 'cover'} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
                <Grad stops={[[0.55, 'rgba(14,26,51,0)'], [1, 'rgba(14,26,51,.55)']]} />
                <View style={st.tag}><T s={10.5} w={800} c={D.white} ls={0.08}>{d.tag}</T></View>
              </View>
            )}
          </Pressable>
        </FadeIn>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 26 + insets.bottom }}>
          <Btn label={last ? 'Get Started' : 'Next'} kind="dark" onPress={next} />
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  media: { position: 'absolute', top: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  tag: { position: 'absolute', left: 16, bottom: 16, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999 },
});
