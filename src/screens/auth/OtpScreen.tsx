import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Caret,
  FadeUp,
  Pop,
  ease,
} from '../../components/common/animations';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash, go } from '../../navigation/flow';
import { appStore, setAppState, useApp } from '../../context/appStore';
import { Keypad } from '../../components/auth/Keypad';
import { formatPhone, usePhone } from '../../lib/hooks/usePhone';

/** 0.4 · Verify code — six boxes, keypad, and the resend countdown. */
export function OtpScreen() {
  const { code, resend, authMode } = useApp(s => ({
    code: s.code,
    resend: s.resend,
    authMode: s.authMode,
  }));
  const { full } = usePhone();
  const advance = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The code expiry only counts down while this screen is in front.
  useFocusEffect(
    useCallback(() => {
      const iv = setInterval(() => {
        if (appStore.getState().resend > 0)
          setAppState(p => ({ resend: p.resend - 1 }));
      }, 1000);
      return () => clearInterval(iv);
    }, []),
  );
  useEffect(() => () => clearTimeout(advance.current), []);

  const typeDigit = (d: string) => {
    const current = appStore.getState().code;
    if (current.length >= 6) return;
    const next = current + d;
    setAppState({ code: next });
    if (next.length === 6)
      advance.current = setTimeout(() => go('verifying'), 320);
  };
  const erase = () => setAppState(p => ({ code: p.code.slice(0, -1) }));
  const resendCode = () => {
    setAppState({ resend: 42, code: '' });
    flash('New code sent to +234 ' + formatPhone(appStore.getState().phone));
  };

  return (
    <ScreenContainer screen="otp" fill contentStyle={styles.content}>
      <FadeUp duration={400} easing={ease.out}>
        <Text style={styles.heading} leading={1.2}>
          Enter the 6-digit code
        </Text>
        <Text style={styles.sub} leading={1.5}>
          Sent by SMS to <Text style={styles.bold}>{full}</Text> ·{' '}
          <Text
            style={styles.link}
            onPress={() => go(authMode === 'login' ? 'login' : 'signupPhone')}
            accessibilityRole="link"
          >
            change
          </Text>
        </Text>
      </FadeUp>
      <View
        style={styles.boxes}
        accessibilityLabel={`Code, ${code.length} of 6 digits entered`}
      >
        {[0, 1, 2, 3, 4, 5].map(i => {
          const filled = i < code.length;
          const active = i === code.length;
          return (
            <View
              key={i}
              style={[
                styles.box,
                {
                  borderColor: filled || active ? '#1e2a5a' : '#e2e5ec',
                  boxShadow:
                    filled || active
                      ? '0 1px 2px rgba(16,24,40,0.06), 0 3px 10px rgba(16,24,40,0.07)'
                      : '0 1px 2px rgba(16,24,40,0.04)',
                },
              ]}
            >
              {filled ? (
                <Pop key={code[i] + i} duration={220} easing={ease.out}>
                  <Text style={styles.digit}>{code[i]}</Text>
                </Pop>
              ) : null}
              {active ? <Caret style={styles.caret} /> : null}
            </View>
          );
        })}
      </View>
      <View style={styles.resendRow}>
        <Text style={styles.expiry}>
          {resend > 0
            ? 'Code expires in 0:' + String(resend).padStart(2, '0')
            : 'Code expired'}
        </Text>
        <PressableScale onPress={resendCode} accessibilityRole="link">
          <Text
            style={[
              styles.resend,
              { color: resend > 0 ? '#b9c0d6' : '#2563eb' },
            ]}
          >
            Resend code
          </Text>
        </PressableScale>
      </View>
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
  bold: { color: '#fff', fontWeight: '700' },
  link: { color: '#2563eb', fontWeight: '700' },
  boxes: { flexDirection: 'row', gap: 9, marginTop: 26 },
  box: {
    flex: 1,
    height: 62,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { fontSize: 26, fontWeight: '700', color: '#fff' },
  caret: { width: 2, height: 26, backgroundColor: '#1e2a5a' },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  expiry: { fontSize: 12.5, color: '#8890ad', fontWeight: '600' },
  resend: { fontSize: 12.5, fontWeight: '600' },
  spacer: { flex: 1 },
});
