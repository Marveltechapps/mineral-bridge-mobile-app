import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Caret, FadeUp, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { appStore, setAppState } from '../../context/appStore';
import { shadows } from '../../theme';
import { Keypad } from '../../components/auth/Keypad';
import { usePhone } from '../../lib/hooks/usePhone';

/** 0.3 Sign up · number and 0.6 Log in · number (same keypad, shorter copy). */
export function PhoneEntryScreen({ mode }: { mode: 'signupPhone' | 'login' }) {
  const { display, color } = usePhone();
  const login = mode === 'login';
  const typeDigit = (d: string) => {
    if (appStore.getState().phone.length >= 10) return;
    setAppState(p => ({ phone: p.phone + d }));
  };
  const erase = () => setAppState(p => ({ phone: p.phone.slice(0, -1) }));

  return (
    <ScreenContainer screen={mode} fill contentStyle={styles.content}>
      <FadeUp duration={400} easing={ease.out}>
        <Text style={styles.heading} leading={1.2}>
          {login ? 'Welcome back' : "What's your mobile number?"}
        </Text>
        <Text style={styles.sub} leading={1.5}>
          {login
            ? 'Enter the number on your Mineral Bridge account and we’ll text a code.'
            : 'We text a 6-digit code. Your number is never shown to buyers or sellers.'}
        </Text>
      </FadeUp>
      <SectionLabel style={styles.label}>MOBILE NUMBER</SectionLabel>
      <FadeUp duration={450} delay={60} easing={ease.out} style={styles.inputs}>
        <View
          style={styles.country}
          accessibilityLabel="Country code Nigeria, plus 234"
        >
          <Text style={styles.flag}>🇳🇬</Text>
          <Text style={styles.dial}>+234</Text>
          <Icon name="chevronDown" size={14} color="#8890ad" />
        </View>
        <View
          style={styles.number}
          accessibilityLabel={`Mobile number ${display}`}
        >
          <Text style={[styles.numberText, { color }]}>{display}</Text>
          <Caret style={styles.caret} />
        </View>
      </FadeUp>
      <PressableScale
        onPress={() => setAppState({ sheet: 'help' })}
        style={styles.helpLink}
        accessibilityRole="link"
      >
        <Text style={styles.help}>Trouble signing in?</Text>
      </PressableScale>
      <View style={styles.spacer} />
      <Keypad onDigit={typeDigit} onDelete={erase} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingHorizontal: 22 },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
  },
  sub: { fontSize: 13.5, color: '#c3cbe8', marginTop: 8 },
  label: { marginTop: 22, marginBottom: 8 },
  inputs: { flexDirection: 'row', gap: 10 },
  country: {
    width: 104,
    height: 58,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    boxShadow: shadows.hairline,
  },
  flag: { fontSize: 17 },
  dial: { fontSize: 14.5, fontWeight: '700', color: '#1a1f36' },
  number: {
    flex: 1,
    height: 58,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1e2a5a',
    borderRadius: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: shadows.input,
  },
  numberText: { fontSize: 19, fontWeight: '700', letterSpacing: 0.6 },
  caret: { width: 2, height: 24, backgroundColor: '#1e2a5a', marginLeft: 3 },
  helpLink: { marginTop: 14, alignSelf: 'flex-start' },
  help: { fontSize: 12.5, fontWeight: '700', color: '#2563eb' },
  spacer: { flex: 1 },
});
