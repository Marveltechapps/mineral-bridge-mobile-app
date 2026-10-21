import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Text } from '../../components/common/Text';
import {
  CheckBadge,
  InfoNote,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { ReviewCard } from '../../components/sell/ReviewCard';

/** C10 · Bulk review — summary before the desk quotes the consignment. */
export function BulkReviewScreen() {
  const bulk = useApp(s => s.bulk);
  const rows = [
    { k: 'TARGET BUYER', v: bulk.partner },
    { k: 'ORIGIN', v: `${bulk.origin}\nExtracted ${bulk.extracted}` },
    {
      k: 'FACILITY',
      v: `${bulk.street}\n${bulk.city}, ${bulk.region}`,
    },
    { k: 'CONTACT', v: `${bulk.contact} · ${bulk.phone}` },
    { k: 'EXPORT PERMIT', v: bulk.permit },
  ];
  return (
    <ScreenContainer screen="iReview" contentStyle={styles.content}>
      <Text style={styles.title}>Review consignment</Text>
      <ReviewCard
        img="gold-bullion"
        name={bulk.mineral}
        sub={`${bulk.qty} kg · 4 photos`}
        rows={rows}
      >
        <View style={styles.signed}>
          <CheckBadge size={20} radius={8} iconSize={12} />
          <Text style={styles.signedText}>
            Compliance acknowledgment signed
          </Text>
        </View>
      </ReviewCard>
      <SectionLabel style={styles.label}>INDICATIVE VALUATION</SectionLabel>
      <View style={styles.valuation}>
        <View style={styles.valuationRow}>
          <View style={styles.shrink}>
            <Text style={styles.purity}>{`${bulk.qty} kg at 99.5% purity`}</Text>
            <Text style={styles.reference}>Desk reference $65.10 / g</Text>
          </View>
          <GradientText style={styles.band}>$780K – $814K</GradientText>
        </View>
        <View style={styles.whole}>
          <CheckBadge size={20} radius={10} iconSize={11} variant="mint" />
          <Text style={styles.wholeText} leading={1.45}>
            Mineral Bridge buys the full consignment — no partial purchase.
          </Text>
        </View>
      </View>
      <InfoNote style={styles.note}>
        Our trading desk confirms documents, samples the consignment, then sends
        a firm offer within two working days.
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
  signed: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
  },
  signedText: { fontSize: 12.5, fontWeight: '700', color: '#15803d' },
  label: { marginTop: 22, marginBottom: 10 },
  valuation: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 16,
    boxShadow: shadows.xs,
  },
  valuationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  shrink: { flexShrink: 1 },
  purity: { fontSize: 12.5, color: '#606780' },
  reference: { fontSize: 12, color: '#8890ad', marginTop: 4 },
  band: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6 },
  whole: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  wholeText: { flex: 1, fontSize: 12, color: '#4a5170' },
  note: { marginTop: 14 },
});
