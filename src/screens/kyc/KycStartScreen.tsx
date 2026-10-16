import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pop, Ring, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  SectionLabel,
  SuccessNote,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { gradients, shadows } from '../../theme';

const NEEDS = [
  {
    title: 'A government ID',
    icon: 'M3 5h18v14H3zM7 10h4M7 14h8',
    sub: 'NIN, passport, driver’s licence or voter’s card.',
  },
  {
    title: 'A selfie',
    icon: 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c0-3.4 3.1-6 7-6s7 2.6 7 6',
    sub: 'Matched against the photo on your ID.',
  },
  {
    title: 'Two minutes of light',
    icon: 'M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    sub: 'Daylight or a bright room works best.',
  },
];

/** K1 · KYC intro — why we verify; skippable, but required before trading. */
export function KycStartScreen() {
  return (
    <ScreenContainer screen="kycStart" contentStyle={styles.content}>
      <View style={styles.hero}>
        <Ring duration={2400} style={styles.ring} />
        <Ring duration={2400} delay={1200} style={styles.ring} />
        <Pop duration={500} easing={ease.out} style={styles.shield}>
          <Icon name="shield" size={30} color="#3d2c05" strokeWidth={2.1} />
        </Pop>
      </View>
      <Text style={styles.title} leading={1.22}>
        Verify your identity
      </Text>
      <Text style={styles.sub} leading={1.6}>
        Every account on Mineral Bridge is KYC verified — buyers and sellers
        alike. It is what lets the other side trust your lot or your order.
      </Text>
      <View style={styles.card}>
        <SectionLabel>WHAT YOU NEED</SectionLabel>
        {NEEDS.map(k => (
          <View key={k.title} style={styles.need}>
            <IconTile
              size={34}
              radius={9}
              bgColor="#f0f2f6"
              color="#1e2a5a"
              d={k.icon}
              iconSize={16}
            />
            <View style={styles.flex}>
              <Text style={styles.needTitle}>{k.title}</Text>
              <Text style={styles.needSub} leading={1.45}>
                {k.sub}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <SuccessNote weight="700" style={styles.note}>
        Takes about 3 minutes. Your documents are visible only to the
        verification desk.
      </SuccessNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingHorizontal: 22, paddingBottom: 26 },
  hero: {
    height: 150,
    borderRadius: 14,
    experimental_backgroundImage: gradients.navyCard,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.hero,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(243,210,122,0.34)',
  },
  shield: {
    width: 64,
    height: 64,
    borderRadius: 15,
    experimental_backgroundImage: gradients.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: '#c3cbe8', marginTop: 9 },
  card: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: shadows.xs,
    gap: 13,
  },
  need: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  flex: { flex: 1 },
  needTitle: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  needSub: { fontSize: 12.5, color: '#6b7290', marginTop: 2 },
  note: { marginTop: 14 },
});
