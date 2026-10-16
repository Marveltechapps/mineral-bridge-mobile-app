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
import { doneStyles } from '../buyer/OrderDoneScreen';

const TIMELINE: NumberedStep[] = [
  {
    n: '1',
    title: 'Document check',
    sub: 'Permit and lease validated against the register. 1–2 days.',
    bg: '#16a34a',
    fg: '#fff',
    border: '#16a34a',
    line: '#bbf7d0',
  },
  {
    n: '2',
    title: 'Assay confirmation',
    sub: 'Sample drawn at your facility by an accredited lab.',
    bg: '#fff',
    fg: '#8890ad',
    border: '#dfe2e9',
    line: '#dfe2e9',
  },
  {
    n: '3',
    title: 'Firm offer issued',
    sub: 'The desk prices the consignment and sends you an offer.',
    bg: '#fff',
    fg: '#8890ad',
    border: '#dfe2e9',
    line: 'transparent',
  },
];

/** C11 · Quote requested — the desk prices the consignment, then offers. */
export function BulkDoneScreen() {
  return (
    <ScreenContainer screen="iDone" contentStyle={doneStyles.content}>
      <SuccessHero />
      <Text style={doneStyles.title}>Quote requested</Text>
      <Text style={doneStyles.sub} leading={1.55}>
        Our trading desk prices your consignment and comes back with a firm
        offer.
      </Text>
      <RefPill label="QUOTE REF" value="MB-Q-90418" style={styles.ref} />
      <View style={styles.card}>
        <SectionLabel style={styles.cardLabel}>WHAT HAPPENS NEXT</SectionLabel>
        <NumberedTimeline steps={TIMELINE} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
