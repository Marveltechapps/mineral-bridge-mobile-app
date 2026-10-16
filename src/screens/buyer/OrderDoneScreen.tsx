import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import {
  NumberedTimeline,
  RefPill,
  SectionLabel,
  SuccessHero,
  type NumberedStep,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';

const TIMELINE: NumberedStep[] = [
  {
    n: '1',
    title: 'Verification desk review',
    sub: 'Assay and origin documents re-checked. Within 24 hours.',
    bg: '#16a34a',
    fg: '#fff',
    border: '#16a34a',
    line: '#bbf7d0',
  },
  {
    n: '2',
    title: 'Verified quote issued',
    sub: 'Final weight, price and transport cost sent for approval.',
    bg: '#fff',
    fg: '#8890ad',
    border: '#dfe2e9',
    line: '#dfe2e9',
  },
  {
    n: '3',
    title: 'Payment and release',
    sub: 'Escrow funded, then bonded transport is booked.',
    bg: '#fff',
    fg: '#8890ad',
    border: '#dfe2e9',
    line: 'transparent',
  },
];

/** B8 · Order processed — no payment taken yet, and what happens next. */
export function OrderDoneScreen() {
  return (
    <ScreenContainer screen="bDone" contentStyle={styles.content}>
      <SuccessHero />
      <Text style={styles.title}>Order processed</Text>
      <Text style={styles.sub} leading={1.55}>
        Your request is with the verification desk.{' '}
        <Text style={styles.bold}>No payment has been taken yet.</Text>
      </Text>
      <RefPill label="ORDER ID" value="MB-2026-04871" style={styles.ref} />
      <View style={styles.card}>
        <SectionLabel style={styles.cardLabel}>WHAT HAPPENS NEXT</SectionLabel>
        <NumberedTimeline steps={TIMELINE} />
      </View>
    </ScreenContainer>
  );
}

export const doneStyles = StyleSheet.create({
  content: { paddingTop: 30, paddingHorizontal: 22, paddingBottom: 26 },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 20,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 9, textAlign: 'center' },
  bold: { color: '#1a1f36', fontWeight: '700' },
});

const styles = StyleSheet.create({
  ...doneStyles,
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
