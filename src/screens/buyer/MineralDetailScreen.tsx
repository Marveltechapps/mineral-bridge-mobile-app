import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import { CheckBadge, Photo, Pill } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';

const SPECS = [
  { k: 'PURITY', v: '22K (91.6%)' },
  { k: 'FORM', v: 'Doré bar, sealed' },
  { k: 'ORIGIN', v: 'Osun State, NG' },
  { k: 'AVAILABLE', v: '4.2 kg' },
];
const COMPLIANCE = [
  'Fire assay on intake — 22 Aug 2026',
  'Purchased outright, title held by Mineral Bridge',
  'Conflict-free and OECD-compliant sourcing',
];

/** B4 · Mineral detail — hero, verification badges, specs and compliance. */
export function MineralDetailScreen() {
  return (
    <ScreenContainer screen="bDetail" contentStyle={styles.content}>
      <View style={styles.heroShadow}>
        <Photo name="gold-dore" style={styles.hero} imageStyle={styles.r14} fit="contain">
          <View style={styles.counter}>
            <Text style={styles.counterText}>1 / 4</Text>
          </View>
        </Photo>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.shrink}>
            <Text style={styles.title}>Gold Doré Bar</Text>
            <Text style={styles.origin}>
              22K · Osun State · sold by Mineral Bridge
            </Text>
          </View>
          <View style={styles.priceCol}>
            <GradientText block style={styles.price}>
              $61.40
            </GradientText>
            <Text style={styles.perGram}>per gram</Text>
          </View>
        </View>
        <View style={styles.badges}>
          <Pill
            label="Mineral Bridge Assured"
            bgColor="#edf7f1"
            border="#cfe7d8"
            fg="#15803d"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
            style={styles.gap5}
          >
            <Icon name="check" size={11} color="#15803d" strokeWidth={3} />
          </Pill>
          <Pill
            label="Origin traced"
            bgColor="#f1f3f7"
            border="#e2e5ec"
            fg="#33406e"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
          />
          <Pill
            label="OECD due diligence"
            bgColor="#fbf3e4"
            border="#eddfc0"
            fg="#a1620b"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
          />
        </View>
        <Text style={styles.paragraph} leading={1.6}>
          Bought outright from a licensed cooperative lease in Osun State and
          now owned by Mineral Bridge. Weighed, fire-assayed and sealed on
          intake, held in our Lagos vault, and sold to you at a fixed price.
        </Text>
        <View style={styles.specs}>
          {SPECS.map(s => (
            <View key={s.k} style={styles.spec}>
              <Text style={styles.specKey}>{s.k}</Text>
              <Text style={styles.specValue}>{s.v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.compliance}>
          {COMPLIANCE.map(row => (
            <View key={row} style={styles.complianceRow}>
              <CheckBadge size={20} radius={8} iconSize={12} />
              <Text style={styles.complianceText}>{row}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  r14: { borderRadius: 14 },
  heroShadow: {
    marginHorizontal: 20,
    borderRadius: 14,
    boxShadow: shadows.media,
  },
  hero: { height: 280, borderRadius: 14, overflow: 'hidden', backgroundColor: '#eef1f6' },
  counter: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 9999,
  },
  counterText: { color: '#1e2a5a', fontSize: 11, fontWeight: '600' },
  body: { paddingTop: 18, paddingHorizontal: 22 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  shrink: { flexShrink: 1 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  origin: { fontSize: 13, color: '#6b7290', marginTop: 4, fontWeight: '500' },
  priceCol: { alignItems: 'flex-end' },
  price: {
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  perGram: {
    fontSize: 11,
    color: '#8890ad',
    fontWeight: '600',
    textAlign: 'right',
  },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 14 },
  gap5: { gap: 5 },
  paragraph: { fontSize: 13.5, color: '#4a5170', marginTop: 16 },
  specs: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 16,
    boxShadow: shadows.xs,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  specKey: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
  },
  specValue: { fontSize: 13.5, fontWeight: '700', color: '#1a1f36' },
  compliance: {
    marginTop: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    gap: 10,
  },
  complianceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  complianceText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803d',
  },
});
