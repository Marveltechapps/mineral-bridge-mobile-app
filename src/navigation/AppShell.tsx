import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../context/AppStore';
import { CtaArea, Header, Loader, Sheet, TabBar, Toast } from '../components/AppChrome';
import { SCREEN_BG, SCREENS, TOPS } from '../screens';
import { D } from '../theme';
import type { AppScreen } from './types';

/** Screens that own a tab: arriving on Home from any other screen shows the "Loading your dashboard…" overlay. */
const TAB_SCREENS: AppScreen[] = ['cats', 'sellCats', 'orders', 'profile', 'minerals', 'lots'];
/** Status-bar colour per screen (the prototype's `statusBg`). */
const statusBg = (sc: AppScreen) => (sc === 'welcome' || sc === 'otp' ? D.white : ['home', 'auth', 'kycDone', 'placed', 'sellDone'].includes(sc) ? D.cream : D.BG);

/** The Mineral Bridge customer app (phone UI of "Mineral Bridge Mobile Final"). */
export function AppShell({ onOpenStarter }: { onOpenStarter?: () => void }) {
  const store = useStore(), s = store.state, m = store.meta();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [splash, setSplash] = useState(true);
  const [homeLoad, setHomeLoad] = useState(false);
  const [kb, setKb] = useState(false);
  const prev = useRef<AppScreen>(s.screen);
  const homeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 1600); return () => { clearTimeout(t); if (homeTimer.current) clearTimeout(homeTimer.current); }; }, []);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [s.scrollSeq]);
  // Avoid the keyboard only while it is open: on Android 15+ edge-to-edge the hide event can leave the
  // KeyboardAvoidingView padded, which would push the bottom CTA / tab bar up after the keyboard closes.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKb(true)), hide = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    const p = prev.current; prev.current = s.screen;
    if (s.screen !== 'home' || p === 'home' || splash || s.booting || TAB_SCREENS.includes(p)) return;
    setHomeLoad(true);
    if (homeTimer.current) clearTimeout(homeTimer.current);
    homeTimer.current = setTimeout(() => setHomeLoad(false), 1300);
  }, [s.screen, splash, s.booting]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const st = store.state;
      if (st.sheet) { store.setState({ sheet: '' }); return true; }
      if (st.sortOpen) { store.setState({ sortOpen: false }); return true; }
      if (st.stack.length || !['home', 'welcome'].includes(st.screen)) { store.back(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [store]);

  const Screen = SCREENS[s.screen], Top = TOPS[s.screen];
  const top = statusBg(s.screen);
  if (s.booting || splash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#070F22' }}>
        <StatusBar barStyle="light-content" backgroundColor="#070F22" />
        <Loader />
      </View>
    );
  }
  const ownInput = s.screen === 'chat' || s.screen === 'supportThread';
  const showCta = !!m.cta && !m.ownCta;
  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG[s.screen] || D.BG }}>
      <View style={{ height: insets.top, backgroundColor: top }} />
      <StatusBar barStyle="dark-content" backgroundColor={top} />
      {/* 'padding' on both platforms: it only pads by the real keyboard overlap, so it also works on
          Android 15+ where edge-to-edge enforcement stops adjustResize from resizing the window. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={kb}>
        {s.syncing ? <View pointerEvents="none" accessibilityLabel="Syncing" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: D.GOLD, opacity: 0.7, zIndex: 30 }} /> : null}
        {m.header ? <Header store={store} m={m} /> : null}
        {Top ? <Top /> : null}
        {ownInput ? (
          <Screen key={s.screen} />
        ) : (
          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: showCta || m.tabs || m.ownCta ? 0 : insets.bottom }}
            keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
            <Screen key={s.screen} onOpenStarter={onOpenStarter} />
            {showCta ? <CtaArea store={store} m={m} /> : null}
          </ScrollView>
        )}
        {m.tabs ? <TabBar store={store} m={m} /> : null}
      </KeyboardAvoidingView>
      {s.toast ? <Toast text={s.toast} tabs={!!m.tabs} /> : null}
      <Sheet store={store} />
      {homeLoad ? <Loader msg={s.user ? 'Loading your dashboard…' : 'Loading verified lots…'} /> : null}
    </View>
  );
}
