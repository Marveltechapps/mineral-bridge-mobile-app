import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Text } from '../../components/common/Text';
import { InfoNote, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { ReviewCard } from '../../components/sell/ReviewCard';
import { shrink } from '../../utils/style';
import { useEstimate } from '../../lib/hooks/useEstimate';

/** C5 · Confirm booking — summary before the evaluator is dispatched. */
export function SellReviewScreen() {
  const e = useEstimate();
  const tierName = useApp(s => ACCOUNT_TIERS[s.tierIdx].name);
  const rows = [
    { k: 'PICKUP', v: 'Ilesha Lease Site 4\nOsun State, Nigeria' },
    { k: 'VERIFICATION', v: 'Sat ' + e.day + ' Sep 2026 · ' + e.slot },
    { k: 'ACCOUNT TIER', v: tierName },
    { k: 'PAYOUT', v: 'Bank transfer · GTB ••4471' },
  ];
  return (
    <ScreenContainer screen="qReview" contentStyle={styles.content}>
      <Text style={styles.title}>Confirm your booking</Text>
      <ReviewCard
        img="gold-dust"
        name="Gold Dust · unrefined"
        sub={`${e.qty} ${e.unitShort} · 3 photos`}
        rows={rows}
      />
      <SectionLabel style={styles.label}>YOUR ESTIMATE</SectionLabel>
      <View style={styles.estimate}>
        <View style={shrink}>
          <SectionLabel>ESTIMATED PAYOUT</SectionLabel>
          <Text style={styles.estimateSub}>
            Firm offer follows the evaluation
          </Text>
        </View>
        <GradientText style={styles.range}>{e.range}</GradientText>
      </View>
      <InfoNote style={styles.note}>
        Booking costs nothing and commits you to nothing. Accept or decline our
        offer once you have it.
      </InfoNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 26 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  label: { marginTop: 22, marginBottom: 10 },
  estimate: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: shadows.xs,
  },
  estimateSub: { fontSize: 12, color: '#8890ad', marginTop: 4 },
  range: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  note: { marginTop: 14 },
});
