import React, { useEffect, useRef } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../context/AppStore';
import { CtaBar, Header, Sheet, StepBar, TabBar, Toast } from '../components/AppChrome';
import { SCREENS } from '../screens';
import { colors as c } from '../theme';

/** The Mineral Bridge customer app (phone UI from the design handoff). */
export function AppShell({ onOpenStarter }: { onOpenStarter?: () => void }) {
  const store = useStore(), s = store.state, m = store.meta();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);

  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [s.scrollSeq]);
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

  const Screen = SCREENS[s.screen];
  const bottomPad = m.cta || m.tabs ? 0 : insets.bottom;
  return (
    <View style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={c.paper} />
      {/* 'padding' on both platforms: it only pads by the real keyboard overlap, so it also works on
          Android 15+ where edge-to-edge enforcement stops adjustResize from resizing the window. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {m.header ? <Header store={store} m={m} /> : null}
        {m.step ? <StepBar m={m} /> : null}
        {s.screen === 'chat' ? (
          <Screen key="chat" />
        ) : (
          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPad }}
            keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
            <Screen key={s.screen} onOpenStarter={onOpenStarter} />
          </ScrollView>
        )}
        {m.cta ? <CtaBar store={store} m={m} /> : null}
        {m.tabs ? <TabBar store={store} m={m} /> : null}
      </KeyboardAvoidingView>
      {s.toast ? <Toast text={s.toast} /> : null}
      <Sheet store={store} />
    </View>
  );
}
