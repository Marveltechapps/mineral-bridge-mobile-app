import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp, Pop, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import { Pill } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { usePhone } from '../../lib/hooks/usePhone';
import { insetFill } from '../../utils/style';

/** 0.7 · Verified — confirmation before everyone goes through the explainer. */
export function AuthDoneScreen() {
  const login = useApp(s => s.authMode === 'login');
  const { full } = usePhone();
  return (
    <ScreenContainer screen="authDone" contentStyle={styles.content}>
      <View style={styles.badge}>
        <Pop duration={400} easing={ease.out} style={styles.halo} />
        <Pop duration={450} delay={120} easing={ease.out} style={styles.tick}>
          <Icon name="check" size={34} color="#fff" strokeWidth={3} />
        </Pop>
      </View>
      <FadeUp duration={450} delay={200} easing={ease.out}>
        <Text style={styles.title}>
          {login ? 'Welcome back' : "You're verified"}
        </Text>
      </FadeUp>
      <FadeUp duration={450} delay={280} easing={ease.out}>
        <Text style={styles.sub} leading={1.55}>
          {login
            ? 'Signed in. Picking up where you left off.'
            : 'Two quick questions and your account is ready to trade.'}
        </Text>
      </FadeUp>
      <FadeUp duration={450} delay={360} easing={ease.out} style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>AO</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.phone}>{full}</Text>
          <Pill
            label="NUMBER VERIFIED"
            bgColor="#edf7f1"
            border="#cfe7d8"
            fg="#15803d"
            size={10}
            padV={4}
            padH={9}
            style={styles.verified}
          >
            <Icon name="check" size={10} color="#15803d" strokeWidth={3} />
          </Pill>
        </View>
      </FadeUp>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 64, paddingHorizontal: 26 },
  badge: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: { ...insetFill, borderRadius: 48, backgroundColor: '#dcfce7' },
  tick: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  sub: { fontSize: 13.5, color: '#c3cbe8', marginTop: 9, textAlign: 'center' },
  card: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    boxShadow: shadows.cardRaised,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    experimental_backgroundImage: gradients.navyCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#f3d27a', fontSize: 18, fontWeight: '600' },
  flex: { flex: 1 },
  phone: { fontSize: 15, fontWeight: '700', color: '#1a1f36' },
  verified: { alignSelf: 'flex-start', marginTop: 6, gap: 5 },
});
