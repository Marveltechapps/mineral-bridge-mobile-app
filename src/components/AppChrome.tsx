// Fixed chrome around every screen of the customer app (final design): header, in-flow CTA, floating tab bar
// with the gold Orders button, bottom toast, confirmation sheet and the navy splash / loading overlay.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MBStore, Meta } from '../context/store';
import { D } from '../theme';
import { Floaty, Grad, Ic, RadGrad, T } from './mb/base';
import { Logo } from './mb/art';
import { Btn, Cta, Cta2, Hdr, IconBtn, Press, TextBtn } from './mb/kit';

export function Header({ store, m }: { store: MBStore; m: Meta }) {
  const n = store.state.cart.length;
  const right = m.cartBtn ? <IconBtn icon="cart" label="Cart" badge={n} onPress={() => store.go('cart')} />
    : m.readAll ? <Press onPress={() => { void store.task(store.remote.readAll()); }} style={{ width: 60, alignItems: 'flex-end' }}><T s={12} w={800} c={D.GD} right>Read all</T></Press>
      : undefined;
  return <Hdr title={m.title || ''} sub={m.sub} prog={m.prog3} onBack={m.canBack ? () => store.back() : null} right={right} />;
}

/** The screen's bottom action(s), drawn at the end of the scrolling content like the prototype's `cta` / `cta2`. */
export function CtaArea({ store, m }: { store: MBStore; m: Meta }) {
  const disabled = m.ctaOpacity < 1;
  if (m.cta2) {
    return (
      <Cta2>
        <Btn label={m.cta || ''} disabled={disabled} icon={m.ctaIcon} onPress={() => store.primary()} />
        <TextBtn label={m.cta2} c={m.cta2Fg} onPress={() => store.secondary()} />
      </Cta2>
    );
  }
  return <Cta><Btn label={m.cta || ''} kind={m.ctaKind || 'primary'} disabled={disabled} icon={m.ctaIcon} onPress={() => store.primary()} /></Cta>;
}

/* ---------------------------------------------------------------- tab bar */

const TABS: [string, string, string, 'home' | 'cats' | 'sellCats' | 'profile'][] = [
  ['home', 'home', 'Home', 'home'], ['buy', 'bag', 'Buy', 'cats'], ['sell', 'dollar', 'Sell', 'sellCats'], ['profile', 'user', 'Profile', 'profile'],
];

function TabItem({ on, icon, label, onPress }: { on: boolean; icon: string; label: string; onPress: () => void }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: true }).start();
  }, [on, v]);
  const col = on ? D.G : D.faint;
  return (
    <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}>
      <Animated.View style={on ? { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] }) }] } : null}>
        <Ic name={icon} s={20} c={col} w={on ? 2.4 : 2} />
      </Animated.View>
      <T s={10} w={800} c={col}>{label}</T>
    </Pressable>
  );
}

export function TabBar({ store, m }: { store: MBStore; m: Meta }) {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const ordersOn = m.tabs === 'orders';
  const { w, h } = size, cx = w / 2, r = 30;
  // White bar with a 40px circular notch at the top centre (the prototype's radial-gradient mask).
  const d = w && h ? `M${r},0 H${cx - 40} A40,40 0 0 0 ${cx + 40},0 H${w - r} A${r},${r} 0 0 1 ${w},${r} V${h - r} A${r},${r} 0 0 1 ${w - r},${h} H${r} A${r},${r} 0 0 1 0,${h - r} V${r} A${r},${r} 0 0 1 ${r},0 Z` : '';
  const tab = (t: typeof TABS[number]) => <TabItem key={t[0]} on={m.tabs === t[0]} icon={t[1]} label={t[2]} onPress={() => store.jump(t[3])} />;
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: Math.max(20, insets.bottom), backgroundColor: D.BG }}>
      <View accessibilityRole="tablist" onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6 }}>
        {d ? <Svg style={StyleSheet.absoluteFill} width={w} height={h}><Path d={d} fill={D.white} /></Svg> : null}
        <View style={{ flex: 1, flexDirection: 'row' }}>{tab(TABS[0])}{tab(TABS[1])}</View>
        <View style={{ width: 84, alignItems: 'center', paddingTop: 22 }}><T s={10} w={800} c={ordersOn ? D.G : D.faint}>Orders</T></View>
        <View style={{ flex: 1, flexDirection: 'row' }}>{tab(TABS[2])}{tab(TABS[3])}</View>
      </View>
      <View pointerEvents="box-none" style={{ position: 'absolute', top: -30, left: 0, right: 0, alignItems: 'center', zIndex: 3 }}>
        <Press label="Orders" role="tab" selected={ordersOn} onPress={() => store.jump('orders')}
          style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: D.GOLD, alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -6px rgba(217,180,86,.75)', borderWidth: ordersOn ? 3 : 0, borderColor: D.goldLight, transform: [{ scale: ordersOn ? 1.05 : 1 }] }}>
          <Floaty><Ic name="box" s={24} c={D.G} w={2.4} /></Floaty>
        </Press>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- toast */

/** The prototype colours toasts by kind (ok = navy, err = red, info = near-black). */
export function toastKind(msg: string): 'ok' | 'err' | 'info' {
  const t = msg.toLowerCase();
  if (/no longer|not open|only .* available|is required|needs at least|cannot|can’t|can't|could not|couldn't|failed|invalid|outbid|try again|unavailable|isn't|is not|expired|keep at least|too large|no internet|offline|went wrong|error|not available|already in progress|nothing has been paid|are paid to you/.test(t)) return 'err';
  if (/^(sign in to|complete kyc|opening|calling|demo|simulat)|requested|removed|logged out|declined|discarded|clarification sent|discrepancy raised|reminder|we will message|auction ended|another bidder|arranges|is cancelled once|sync|code was sent|new code/.test(t)) return 'info';
  return 'ok';
}

export function Toast({ text, tabs }: { text: string; tabs: boolean }) {
  const insets = useSafeAreaInsets();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { v.setValue(0); Animated.timing(v, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }, [v, text]);
  const kind = toastKind(text), map = { ok: [D.G, 'check'], err: [D.DANGER, 'x'], info: [D.black, 'bell'] }[kind];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (tabs ? 120 : 96) + insets.bottom, zIndex: 90, elevation: 90 }]}>
      <Animated.View accessibilityLiveRegion="polite" style={{ maxWidth: '86%', opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: map[0], paddingVertical: 11, paddingHorizontal: 16, borderRadius: 13, boxShadow: '0 14px 30px -10px rgba(0,0,0,.4)' }}>
          <Ic name={map[1]} s={15} c={D.white} w={2.4} />
          <T s={13} w={600} c={D.white} style={{ flexShrink: 1 }}>{text}</T>
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------------------------------------------------------------- confirmation sheet */

export function Sheet({ store }: { store: MBStore }) {
  const insets = useSafeAreaInsets();
  const sh = store.sheetVals();
  const fade = useRef(new Animated.Value(0)).current, up = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!sh.open) return;
    fade.setValue(0); up.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(up, { toValue: 1, duration: 300, easing: Easing.bezier(0.22, 0.61, 0.36, 1), useNativeDriver: true }),
    ]).start();
  }, [sh.open, fade, up]);
  if (!sh.open) return null;
  const close = () => store.setState({ sheet: '' });
  const danger = sh.bg === '#B42318';
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 70, elevation: 70 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <Pressable accessibilityLabel="Close" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,15,30,.5)' }]} />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[st.sheet, { paddingBottom: 24 + insets.bottom, transform: [{ translateY: up.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }] }]}>
        <View style={st.grip} />
        <T s={19} w={800}>{sh.title}</T>
        <T s={13.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 8 }}>{sh.body}</T>
        <View style={{ gap: 8, marginTop: 18 }}>
          <Btn label={sh.cta} kind={danger ? 'danger' : 'primary'} onPress={sh.confirm} />
          <Btn label="Not now" kind="ghost" onPress={close} />
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------------------------------------------------------------- splash / loading overlay */

function Ring({ inset, delay }: { inset: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]));
    a.start();
    return () => a.stop();
  }, [v, delay]);
  return <Animated.View style={{ position: 'absolute', top: inset, left: inset, right: inset, bottom: inset, borderRadius: 999, borderWidth: 1.5, borderColor: inset ? 'rgba(217,180,86,.25)' : 'rgba(217,180,86,.35)', opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.25] }) }] }} />;
}

/** `loader(msg)`: navy radial background, pulsing rings around the logo, gold loading bar. */
export function Loader({ msg }: { msg?: string }) {
  const pop = useRef(new Animated.Value(0)).current, bar = useRef(new Animated.Value(0)).current, fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    Animated.timing(pop, { toValue: 1, duration: 550, easing: Easing.linear, useNativeDriver: true }).start();
    const a = Animated.loop(Animated.timing(bar, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [pop, bar, fade]);
  return (
    <Animated.View accessibilityRole="progressbar" accessibilityLabel={msg || 'Loading'} style={[StyleSheet.absoluteFill, { zIndex: 85, elevation: 85, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#070F22', opacity: fade }]}>
      <RadGrad cx={0.5} cy={0.35} rx={1.2} ry={0.8} stops={[[0, '#1A3260'], [0.7, '#070F22']]} />
      <View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }}>
        <Ring inset={0} delay={0} />
        <Ring inset={14} delay={500} />
        <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.85, 1.08, 1] }) }] }}><Logo sz={168} /></Animated.View>
      </View>
      <T s={13} w={700} c={D.GOLD} ls={0.02}>Verified mineral trading</T>
      <View style={{ width: 132, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.12)', overflow: 'hidden', marginTop: 14 }}>
        <Animated.View style={{ height: '100%', width: '45%', borderRadius: 2, transform: [{ translateX: bar.interpolate({ inputRange: [0, 1], outputRange: [-0.45 * 132 * 1.1, 0.45 * 132 * 2.5] }) }] }}>
          <Grad angle={90} stops={[[0, '#B8862B'], [1, '#F3D98A']]} radius={2} />
        </Animated.View>
      </View>
      <T s={11.5} w={600} c="rgba(255,255,255,.53)">{msg || 'Buy and sell minerals, verified at every step.'}</T>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: D.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 10, paddingHorizontal: 22 },
  grip: { width: 40, height: 5, borderRadius: 3, backgroundColor: D.BOR, alignSelf: 'center', marginBottom: 16 },
});
