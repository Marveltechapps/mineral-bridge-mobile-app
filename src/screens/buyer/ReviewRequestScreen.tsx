import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import { InfoNote, KeyValueRows, Photo } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { useQuantity } from '../../lib/hooks/useQuantity';
import { useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { formatMoney } from '../../utils/format';

/** B7 · Review & submit — full-screen review before the request is sent. */
export function ReviewRequestScreen() {
  const { qty, unitShort, grams } = useQuantity();
  const tierIdx = useApp(s => s.tierIdx);
  const rows = [
    { k: 'ACCOUNT TIER', v: ACCOUNT_TIERS[tierIdx].name },
    { k: 'DELIVER TO', v: 'Aurora Refining Ltd.\n14 Creek Road, Apapa, Lagos' },
    { k: 'CONTACT', v: 'Adaeze Okafor · +234 802 441 9087' },
    {
      k: 'PERMIT',
      v: tierIdx === 2 ? 'NG-IMP-2026-44817' : 'Not required for this tier',
    },
    { k: 'NEEDED BY', v: '28 September 2026' },
  ];
  return (
    <ScreenContainer screen="bReview" contentStyle={styles.content}>
      <Text style={styles.title}>Review your request</Text>
      <View style={styles.card}>
        <View style={styles.product}>
          <Photo name="gold-dore" style={styles.thumb} />
          <View style={styles.flex}>
            <Text style={styles.productName}>Gold Doré Bar · 22K</Text>
            <Text
              style={styles.productSub}
            >{`${qty} ${unitShort} · $61.40 / g`}</Text>
          </View>
        </View>
        <KeyValueRows rows={rows} />
        <View style={styles.total}>
          <Text style={styles.totalLabel}>INDICATIVE TOTAL</Text>
          <Text style={styles.totalValue}>
            {'$' + formatMoney(grams * 61.4)}
          </Text>
        </View>
      </View>
      <InfoNote style={styles.note}>
        No payment is taken now. A verified quote with final assay weight
        arrives within 48 hours.
      </InfoNote>
      <Text style={styles.terms} leading={1.5}>
        By submitting you accept the{' '}
        <Text style={styles.link}>trade terms</Text> and verification process.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingHorizontal: 22, paddingBottom: 26 },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: shadows.cardRaised,
  },
  product: {
    padding: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  thumb: { width: 56, height: 56, borderRadius: 11 },
  flex: { flex: 1 },
  productName: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  productSub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  total: {
    padding: 16,
    backgroundColor: '#fafbfc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
  },
  totalValue: { fontSize: 20, fontWeight: '600', color: '#1e2a5a' },
  note: { marginTop: 14 },
  terms: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12.5,
    color: '#8890ad',
  },
  link: { color: '#2563eb', fontWeight: '700' },
});
