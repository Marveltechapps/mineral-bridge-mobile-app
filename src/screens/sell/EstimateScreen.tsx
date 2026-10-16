import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Blip, FadeUp, Pop, ease } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  InfoNote,
  Photo,
  Scrim,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';
import { useEstimate } from '../../lib/hooks/useEstimate';

const PROMISES = [
  {
    title: 'Free evaluation at your site',
    sub: 'No travel, no fee, no obligation.',
    icon: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z',
    delay: 50,
  },
  {
    title: 'Paid within 24 hours',
    sub: 'Straight to your bank once you accept.',
    icon: 'M3 9h18v11H3zM3 9l2-5h14l2 5M12 4v5',
    delay: 120,
  },
  {
    title: 'We take it from there',
    sub: 'Transport, refining and resale are ours.',
    icon: 'M3 7h11v10H3zM14 10h4l3 3v4h-7z',
    delay: 190,
  },
];

/** C3 · Instant estimate — a price range before any commitment. */
export function EstimateScreen() {
  const e = useEstimate();
  const factors = [
    { k: 'Quantity declared', v: e.qty + ' ' + e.unitShort, fg: '#1a1f36' },
    { k: 'Assumed purity', v: '22K (91.6%)', fg: '#1a1f36' },
    { k: 'Today’s reference rate', v: '$61.40 / g', fg: '#1a1f36' },
    { k: 'Refining and handling', v: '− 10.3%', fg: '#a1620b' },
  ];
  return (
    <ScreenContainer screen="sEstimate" contentStyle={styles.content}>
      <View style={styles.heroShadow}>
        <Photo name="gold-dust" style={styles.hero} imageStyle={styles.r14}>
          <Scrim gradient="linear-gradient(165deg,rgba(14,20,48,0.58),rgba(20,29,64,0.96))" />
          <View style={styles.heroBody}>
            <Text style={styles.kicker}>MINERAL BRIDGE WILL PAY YOU</Text>
            <Pop duration={500} easing={ease.pop} style={styles.rangeWrap}>
              <GradientText block style={styles.range}>
                {e.range}
              </GradientText>
            </Pop>
            <Text style={styles.heroSub} leading={1.5}>
              {`Estimated for ${e.qty} ${e.unitShort} of ${e.sellItem} at today's rate.`}
            </Text>
            <View style={styles.live}>
              <Blip style={styles.liveDot} />
              <Text style={styles.liveText}>Rate updated 4 minutes ago</Text>
            </View>
          </View>
        </Photo>
      </View>

      <View style={styles.card}>
        <SectionLabel>HOW WE GOT THERE</SectionLabel>
        <View style={styles.factors}>
          {factors.map(f => (
            <View key={f.k} style={styles.factor}>
              <Text style={styles.factorKey}>{f.k}</Text>
              <Text style={[styles.factorValue, { color: f.fg }]}>{f.v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.payout}>
          <Text style={styles.payoutLabel}>Indicative payout</Text>
          <GradientText style={styles.mid}>{e.mid}</GradientText>
        </View>
      </View>

      <InfoNote style={styles.mt14}>
        This is an estimate, not an offer. Our evaluator confirms weight and
        purity on site, then you get a firm price you can accept or decline.
      </InfoNote>

      <View style={styles.promises}>
        {PROMISES.map(p => (
          <FadeUp
            key={p.title}
            duration={500}
            delay={p.delay}
            easing={ease.out}
            style={styles.promise}
          >
            <IconTile
              size={32}
              radius={10}
              bgColor="#ecf7f0"
              color="#15803d"
              d={p.icon}
              iconSize={16}
              strokeWidth={2.2}
            />
            <View style={styles.flex}>
              <Text style={styles.promiseTitle}>{p.title}</Text>
              <Text style={styles.promiseSub} leading={1.4}>
                {p.sub}
              </Text>
            </View>
          </FadeUp>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  r14: { borderRadius: 14 },
  rangeWrap: { marginTop: 8, alignSelf: 'stretch' },
  mt14: { marginTop: 14 },
  heroShadow: { borderRadius: 14, boxShadow: shadows.hero },
  hero: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#0e1430' },
  heroBody: { padding: 20, alignItems: 'center' },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.9,
    color: '#a9b5dd',
    textAlign: 'center',
  },
  range: {
    fontSize: 33,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 12.5,
    color: '#c3cbe8',
    marginTop: 7,
    textAlign: 'center',
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  liveText: { fontSize: 11.5, fontWeight: '600', color: '#fff' },
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: shadows.xs,
  },
  factors: { marginTop: 14, gap: 12 },
  factor: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  factorKey: { flex: 1, fontSize: 13, color: '#4a5170' },
  factorValue: { fontSize: 13, fontWeight: '600' },
  payout: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payoutLabel: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  mid: { fontSize: 18, fontWeight: '700' },
  promises: { marginTop: 16, gap: 11 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  promiseTitle: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  promiseSub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
});
