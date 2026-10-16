import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  FadeUp,
  Grow,
  Ring,
  Spin,
  ease,
} from '../../components/common/animations';
import { Text } from '../../components/common/Text';
import { CheckBadge } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { currentScreen, replace } from '../../navigation/flow';
import { insetFill } from '../../utils/style';

const STEPS = [
  { label: 'Code accepted', delay: 150 },
  { label: 'Account created', delay: 600 },
  { label: 'Securing your session', delay: 1050 },
];

/** 0.5 · Verifying — spinner, pulse rings and staged checks; auto-advances. */
export function VerifyingScreen() {
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentScreen() === 'verifying') replace('authDone');
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScreenContainer screen="verifying" contentStyle={styles.content}>
      <View style={styles.spinner}>
        <Ring style={styles.ring} />
        <Ring style={styles.ring} delay={800} />
        <Spin style={styles.arc} />
      </View>
      <Text style={styles.title}>Verifying your number</Text>
      <Text style={styles.sub} leading={1.55}>
        Checking the code and setting up your account.
      </Text>
      <View style={styles.track}>
        <Grow style={styles.fill} />
      </View>
      <View style={styles.steps}>
        {STEPS.map(s => (
          <FadeUp
            key={s.label}
            duration={400}
            delay={s.delay}
            easing={ease.out}
            style={styles.step}
          >
            <CheckBadge size={22} radius={9} iconSize={12} variant="soft" />
            <Text style={styles.stepLabel}>{s.label}</Text>
          </FadeUp>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 90, paddingHorizontal: 30 },
  spinner: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    ...insetFill,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#1e2a5a',
  },
  arc: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: '#dfe2e9',
    borderTopColor: '#1e2a5a',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginTop: 28,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sub: { fontSize: 13.5, color: '#c3cbe8', marginTop: 8, textAlign: 'center' },
  track: {
    height: 5,
    backgroundColor: '#dfe2e9',
    borderRadius: 9999,
    marginTop: 26,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
    experimental_backgroundImage: 'linear-gradient(90deg,#1e2a5a,#3b6fd4)',
  },
  steps: { marginTop: 26, gap: 11 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: '#4a5170' },
});
