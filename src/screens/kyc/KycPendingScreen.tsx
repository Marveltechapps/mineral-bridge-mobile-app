import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pop, Ring, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  NumberedTimeline,
  RefPill,
  SectionLabel,
  type NumberedStep,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';
import { insetFill } from '../../utils/style';

const TIMELINE: NumberedStep[] = [
  {
    n: '1',
    title: 'Documents received',
    sub: 'ID and selfie uploaded successfully.',
    bg: '#16a34a',
    fg: '#fff',
    border: '#16a34a',
    line: '#bbf7d0',
  },
  {
    n: '2',
    title: 'Identity database check',
    sub: 'Name, DOB and number matched against NIMC.',
    bg: '#fde68a',
    fg: '#b45309',
    border: '#fde68a',
    line: '#dfe2e9',
  },
  {
    n: '3',
    title: 'Account approved',
    sub: 'Ordering, listing and bidding unlock automatically.',
    bg: '#fff',
    fg: '#8890ad',
    border: '#dfe2e9',
    line: 'transparent',
  },
];

/** K6 · Under review — cleared in about 2 hours; browsing stays open. */
export function KycPendingScreen() {
  return (
    <ScreenContainer screen="kycPending" contentStyle={styles.content}>
      <View style={styles.badge}>
        <Pop duration={450} easing={ease.out} style={styles.halo} />
        <Ring duration={2200} style={styles.ring} />
        <Pop duration={500} delay={120} easing={ease.out} style={styles.clock}>
          <Icon name="clock" size={30} color="#a1620b" strokeWidth={2.3} />
        </Pop>
      </View>
      <Text style={styles.title}>KYC under review</Text>
      <Text style={styles.sub} leading={1.55}>
        Most checks clear within 2 hours. You can browse and build listings
        while you wait.
      </Text>
      <RefPill
        label="REFERENCE"
        value="KYC-2026-77310"
        valueWeight="700"
        style={styles.ref}
      />
      <View style={styles.card}>
        <SectionLabel style={styles.cardLabel}>
          VERIFICATION PROGRESS
        </SectionLabel>
        <NumberedTimeline steps={TIMELINE} numberWeight="700" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 30, paddingHorizontal: 22, paddingBottom: 26 },
  badge: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: { ...insetFill, borderRadius: 48, backgroundColor: '#fef9ec' },
  ring: {
    ...insetFill,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  clock: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fbf3e4',
    borderWidth: 1,
    borderColor: '#eddfc0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 20,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 9, textAlign: 'center' },
  ref: { marginTop: 18 },
  card: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    boxShadow: shadows.cardRaised,
  },
  cardLabel: { marginBottom: 16 },
});
