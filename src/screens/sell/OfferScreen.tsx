import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pop, ease } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Photo, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash } from '../../navigation/flow';
import { shadows } from '../../theme';
import { NavyHero } from '../../components/sell/NavyHero';
import { useEstimate } from '../../lib/hooks/useEstimate';

const AFTER = [
  {
    n: '1',
    text: 'Title transfers to Mineral Bridge and we seal the lot on the spot.',
  },
  { n: '2', text: 'Payment is released to your bank within 24 hours.' },
  {
    n: '3',
    text: 'We refine, certify and retail it — you have nothing further to do.',
  },
];

/** C8 · Firm offer — the post-evaluation price to accept or decline. */
export function OfferScreen() {
  const e = useEstimate();
  const rows = [
    {
      k: 'ASSAYED WEIGHT',
      v: (e.qty - 1.4).toFixed(1) + ' ' + e.unitShort,
      fg: '#1a1f36',
    },
    { k: 'CONFIRMED PURITY', v: '21.6K (90.1%)', fg: '#1a1f36' },
    {
      k: 'EVALUATED',
      v: 'Sat ' + e.day + ' Sep 2026 · ' + e.slot,
      fg: '#1a1f36',
    },
    { k: 'VS ESTIMATE', v: '− 0.9% (within range)', fg: '#15803d' },
    { k: 'PAYOUT TO', v: 'GTBank ••4471', fg: '#1a1f36' },
  ];
  return (
    <ScreenContainer screen="sOffer" contentStyle={styles.content}>
      <NavyHero style={styles.hero}>
        <View style={styles.complete}>
          <Icon name="check" size={12} color="#86efac" strokeWidth={3.2} />
          <Text style={styles.completeText}>EVALUATION COMPLETE</Text>
        </View>
        <Text style={styles.kicker}>OUR FIRM OFFER</Text>
        <Pop duration={550} easing={ease.pop} style={styles.priceWrap}>
          <GradientText block style={styles.price}>
            {e.offer}
          </GradientText>
        </Pop>
        <Text style={styles.paid} leading={1.5}>
          Paid to GTBank ••4471 within 24 hours of acceptance.
        </Text>
        <View style={styles.validity}>
          <Icon name="clock" size={14} color="#f3d27a" strokeWidth={2.2} />
          <Text style={styles.validityText}>Offer valid for 48 hours</Text>
        </View>
      </NavyHero>

      <View style={styles.card}>
        <View style={styles.lot}>
          <Photo name="gold-dust" style={styles.thumb} />
          <View style={styles.flex}>
            <Text style={styles.lotName}>{e.sellItem}</Text>
            <Text style={styles.lotSub}>Evaluated at Ilesha Lease Site 4</Text>
          </View>
        </View>
        <View style={styles.rows}>
          {rows.map(r => (
            <View key={r.k} style={styles.row}>
              <SectionLabel>{r.k}</SectionLabel>
              <Text style={[styles.rowValue, { color: r.fg }]}>{r.v}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.after}>
        <SectionLabel>WHAT HAPPENS AFTER YOU ACCEPT</SectionLabel>
        <View style={styles.afterList}>
          {AFTER.map(a => (
            <View key={a.n} style={styles.afterRow}>
              <View style={styles.afterNum}>
                <Text style={styles.afterNumText}>{a.n}</Text>
              </View>
              <Text style={styles.afterText} leading={1.45}>
                {a.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <PressableScale
        activeScale={0.985}
        onPress={() => flash('Review requested — the desk will call you')}
        style={styles.review}
      >
        <Text style={styles.reviewText}>Offer seems low? Request a review</Text>
      </PressableScale>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  hero: { paddingVertical: 22, paddingHorizontal: 20, alignItems: 'center' },
  complete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(34,197,94,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(134,239,172,0.4)',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  completeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#86efac',
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: '#a9b5dd',
    marginTop: 18,
    textAlign: 'center',
  },
  priceWrap: { marginTop: 6, alignSelf: 'stretch' },
  price: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.4,
    textAlign: 'center',
  },
  paid: { fontSize: 12.5, color: '#c3cbe8', marginTop: 8, textAlign: 'center' },
  validity: {
    alignSelf: 'stretch',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validityText: { fontSize: 12, fontWeight: '600', color: '#f3d27a' },
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: shadows.xs,
  },
  lot: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  thumb: { width: 52, height: 52, borderRadius: 12 },
  lotName: { fontSize: 15, fontWeight: '600', color: '#1a1f36' },
  lotSub: { fontSize: 12, color: '#8890ad', marginTop: 3 },
  rows: { paddingVertical: 4, paddingHorizontal: 16 },
  row: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  after: {
    marginTop: 14,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 15,
  },
  afterList: { marginTop: 12, gap: 11 },
  afterRow: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  afterNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1e2a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  afterNumText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  afterText: { flex: 1, fontSize: 12.5, color: '#4a5170' },
  review: { marginTop: 14, alignItems: 'center' },
  reviewText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
  },
});
