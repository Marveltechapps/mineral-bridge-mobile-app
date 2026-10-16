import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeUp } from '../common/animations';
import { CtaBar } from './CtaBar';
import { Header } from './Header';
import { StepProgress } from './StepProgress';
import { TabBar } from './TabBar';
import { useApp } from '../../context/appStore';
import { resolveMeta } from '../../navigation/screenMeta';
import {
  addToCart,
  primaryAction,
  secondaryAction,
} from '../../navigation/ctaActions';
import { back } from '../../navigation/flow';
import type { ScreenId } from '../../navigation/types';
import { layout } from '../../theme';

type Props = {
  screen: ScreenId;
  children: React.ReactNode;
  /** Style of the screen's animated content wrapper (the design's per-screen `<div>`). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Content stretches to the scroll area's height (keypad screens). */
  fill?: boolean;
  /** Rendered between the scroll area and the tab bar (live-chat composer). */
  footer?: React.ReactNode;
  /** Lift the footer above the software keyboard. */
  avoidKeyboard?: boolean;
  scrollProps?: ScrollViewProps;
  scrollRef?: React.Ref<ScrollView>;
};

/**
 * The phone frame from the design: status-bar zone, title row, step
 * progress, scrolling content (which fades up on entry), the CTA well and the
 * tab bar — each driven by the screen's entry in `META`.
 */
export function ScreenContainer({
  screen,
  children,
  contentStyle,
  fill,
  footer,
  avoidKeyboard,
  scrollProps,
  scrollRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const st = useApp(s => ({
    authMode: s.authMode,
    guest: s.guest,
    kyc: s.kyc,
  }));
  const m = resolveMeta(screen, st);

  const body = (
    <>
      {m.title ? <Header meta={m} onBack={back} /> : null}
      {m.step ? <StepProgress meta={m} /> : null}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={fill ? styles.fill : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        {...scrollProps}
      >
        <FadeUp style={[fill ? styles.fill : null, contentStyle]}>
          {children}
        </FadeUp>
      </ScrollView>
      {m.dualCta || m.soloCta ? (
        <CtaBar
          meta={m}
          bottomInset={insets.bottom}
          onPrimary={() => primaryAction(screen)}
          onSecondary={() => secondaryAction(screen)}
          onAddToCart={addToCart}
        />
      ) : null}
      {footer}
      {m.tabs ? <TabBar meta={m} bottomInset={insets.bottom} /> : null}
    </>
  );

  return (
    <View
      style={[styles.frame, { backgroundColor: m.bg }]}
      testID={`screen-${screen}`}
    >
      {focused ? (
        <StatusBar barStyle={m.dark ? 'light-content' : 'dark-content'} />
      ) : null}
      <View style={{ height: Math.max(layout.statusBar, insets.top) }} />
      {avoidKeyboard ? (
        // 'padding' (not 'height'): the view also flex-grows, which would undo a
        // height change. Edge-to-edge Android no longer resizes the window.
        <KeyboardAvoidingView style={styles.fill} behavior="padding">
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  scroll: { flex: 1 },
  fill: { flexGrow: 1 },
});
