// Fixed chrome around every screen of the customer app: header, step bar,
// bottom CTA bar, floating tab bar, toast and confirmation sheet.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MBStore, Meta } from '../context/store';
import { colors as c } from '../theme';
import { Icon, IC } from './ui/Icon';
import { ProgressFill } from './ui/Motion';
import { Tap } from './ui/Tap';
import { Label, Txt } from './ui/Txt';

export function Header({ store, m }: { store: MBStore; m: Meta }) {
  const n = store.state.cart.length;
  return (
    <View style={st.header}>
      {m.canBack ? (
        <Tap label="Back" scale={0.92} onPress={() => store.back()} style={st.round}><Icon d={IC.back} size={18} sw={2} /></Tap>
      ) : null}
      <Txt s={16} w={600} lines={1} style={{ flex: 1, minWidth: 0 }} accessibilityRole="header">{m.title}</Txt>
      {m.cartBtn ? (
        <Tap label="Cart" onPress={() => store.go('cart')} style={st.round}>
          <Icon d={IC.bag} size={18} />
          {n ? <View style={st.cartBadge}><Txt s={10.5} w={700}>{String(n)}</Txt></View> : null}
        </Tap>
      ) : null}
    </View>
  );
}

export function StepBar({ m }: { m: Meta }) {
  return (
    <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
      <Label>{m.step}</Label>
      <View style={st.stepTrack}><ProgressFill pct={m.prog || '0'} dur={300} style={{ backgroundColor: c.ink, borderRadius: 2 }} /></View>
    </View>
  );
}

export function CtaBar({ store, m }: { store: MBStore; m: Meta }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.cta, { paddingBottom: Math.max(10, insets.bottom) }]}>
      <Tap scale={0.98} onPress={() => store.primary()} style={[st.ctaBtn, { opacity: m.ctaOpacity }]}><Txt s={15} w={600} c={c.paper}>{m.cta}</Txt></Tap>
      {m.cta2 ? <Tap onPress={() => store.secondary()} style={st.cta2}><Txt s={14} w={600} c={m.cta2Fg}>{m.cta2}</Txt></Tap> : null}
    </View>
  );
}

const TAB: [string, string, string, 'home' | 'cats' | 'sellCats' | 'orders' | 'profile'][] = [
  ['home', 'Home', 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z', 'home'],
  ['buy', 'Buy', IC.bag, 'cats'],
  ['sell', 'Sell', 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', 'sellCats'],
  ['orders', 'Orders', 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4', 'orders'],
  ['profile', 'Profile', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'profile'],
];

export function TabBar({ store, m }: { store: MBStore; m: Meta }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.tabsWrap, { paddingBottom: Math.max(22, insets.bottom) }]}>
      <View accessibilityRole="tablist" style={st.tabs}>
        {TAB.map(([id, label, icon, screen]) => {
          const on = m.tabs === id, fg = on ? c.ink : c.faint;
          return (
            <Tap key={id} role="tab" selected={on} label={label} onPress={() => store.jump(screen)} style={[st.tab, { backgroundColor: on ? c.gold : 'transparent' }]}>
              <Icon d={icon} size={19} color={fg} />
              <Txt s={10} w={600} c={fg}>{label}</Txt>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

export function Toast({ text }: { text: string }) {
  const insets = useSafeAreaInsets();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { v.setValue(0); Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }, [v, text]);
  return (
    <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" style={[st.toast, { top: insets.top + 8, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }] }]}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.gold }} />
      <Txt s={13.5} w={500} c={c.paper} style={{ flex: 1 }}>{text}</Txt>
    </Animated.View>
  );
}

export function Sheet({ store }: { store: MBStore }) {
  const insets = useSafeAreaInsets();
  const sh = store.sheetVals();
  const fade = useRef(new Animated.Value(0)).current, up = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!sh.open) return;
    fade.setValue(0); up.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(up, { toValue: 1, duration: 320, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }),
    ]).start();
  }, [sh.open, fade, up]);
  if (!sh.open) return null;
  const close = () => store.setState({ sheet: '' });
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <Pressable accessibilityLabel="Close" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18,18,20,.42)' }]} />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[st.sheet, { paddingBottom: 30 + insets.bottom, transform: [{ translateY: up.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}>
        <View style={st.grip} />
        <Txt serif s={26} lh={1.1}>{sh.title}</Txt>
        <Txt s={14} c={c.muted} lh={1.5} style={{ marginTop: 8 }}>{sh.body}</Txt>
        <Tap onPress={sh.confirm} style={[st.sheetCta, { backgroundColor: sh.bg }]}><Txt s={15} w={600} c="#fff">{sh.cta}</Txt></Tap>
        <Tap onPress={close} style={st.sheetCancel}><Txt s={14} w={600} c={c.muted}>Cancel</Txt></Tap>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  stepTrack: { height: 4, borderRadius: 2, backgroundColor: c.line, marginTop: 7, overflow: 'hidden' },
  cta: { paddingTop: 12, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: c.ctaLine, backgroundColor: c.paper },
  ctaBtn: { height: 56, borderRadius: 18, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
  cta2: { height: 42, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  tabsWrap: { paddingTop: 8, paddingHorizontal: 14, backgroundColor: c.paper },
  tabs: { height: 62, borderRadius: 31, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, gap: 4 },
  tab: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 3 },
  toast: { position: 'absolute', left: 16, right: 16, zIndex: 30, elevation: 30, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.ink, boxShadow: '0 12px 30px rgba(18,18,20,.3)', flexDirection: 'row', gap: 10, alignItems: 'center' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 22 },
  grip: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.dash, alignSelf: 'center', marginBottom: 18 },
  sheetCta: { marginTop: 20, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetCancel: { height: 44, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
});
