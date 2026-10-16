import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Easing } from 'react-native';
import { Travel } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  Photo,
  SectionLabel,
  StatusTimeline,
  type StatusStep,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { TRACK_STEPS } from '../../lib/catalog';
import { flash } from '../../navigation/flow';
import { gradients, shadows } from '../../theme';
import { shrink } from '../../utils/style';
import { LivePill } from '../../components/sell/NavyHero';

const DOCS = [
  {
    name: 'Assay certificate',
    meta: 'PDF · 240 KB · issued 5 Sep',
    toast: 'Downloading assay certificate',
  },
  {
    name: 'Waybill and seal photos',
    meta: 'PDF · 1.1 MB · issued 8 Sep',
    toast: 'Downloading waybill',
  },
  {
    name: 'Escrow receipt',
    meta: 'PDF · 88 KB · issued 6 Sep',
    toast: 'Downloading escrow receipt',
  },
];

const STEPS: StatusStep[] = TRACK_STEPS.map((t, i) => ({
  title: t.title,
  sub: t.sub,
  time: t.time,
  done: t.state === 'done',
  pending: t.state === 'pending',
  active: t.state === 'active',
  bg: t.state === 'done' ? '#16a34a' : '#fff',
  border:
    t.state === 'done'
      ? '#16a34a'
      : t.state === 'active'
      ? '#1e2a5a'
      : '#dfe2e9',
  line:
    i === TRACK_STEPS.length - 1
      ? 'transparent'
      : t.state === 'done'
      ? '#bbf7d0'
      : '#dfe2e9',
  titleFg: t.state === 'pending' ? '#8890ad' : '#1a1f36',
}));

/** T2 · Order tracking — live route, stage history and documents. */
export function TrackOrderScreen() {
  return (
    <ScreenContainer screen="track" contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={shrink}>
            <Text style={styles.kicker}>ORDER MB-2026-04871</Text>
            <Text style={styles.heroTitle}>In transit</Text>
            <Text style={styles.heroSub}>Arriving Wed 10 Sep, 14:00–17:00</Text>
          </View>
          <LivePill
            label="LIVE"
            bg="rgba(22,163,74,0.18)"
            fg="#86efac"
            dot="#22c55e"
            dotSize={7}
            size={10.5}
            spacing={0.5}
          />
        </View>
        <View style={styles.route}>
          <View style={styles.routeLine} />
          <View style={styles.routeDone} />
          <View style={styles.routeDot}>
            <Travel
              duration={3400}
              easing={Easing.bezier(0.45, 0, 0.55, 1)}
              style={styles.dot}
            />
          </View>
          <Text style={styles.from}>LAGOS VAULT</Text>
          <Text style={styles.to}>APAPA FACILITY</Text>
        </View>
      </View>

      <View style={styles.product}>
        <Photo name="gold-dore" style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.productName}>Gold Doré Bar · 22K</Text>
          <Text style={styles.productSub}>
            250 kg · escrow funded $15,350,000
          </Text>
        </View>
      </View>

      <SectionLabel style={styles.label}>TRACKING HISTORY</SectionLabel>
      <View style={styles.history}>
        <StatusTimeline
          steps={STEPS}
          nodeRadius={10}
          lineMin={16}
          gap={18}
          titleSize={14}
        />
      </View>

      <SectionLabel style={styles.label}>DOCUMENTS</SectionLabel>
      <View style={styles.docs}>
        {DOCS.map(d => (
          <Pressable
            key={d.name}
            onPress={() => flash(d.toast)}
            style={styles.doc}
            accessibilityRole="button"
          >
            <IconTile
              size={34}
              radius={9}
              bgColor="#f0f2f6"
              color="#1e2a5a"
              name="doc"
              iconSize={16}
              strokeWidth={2.2}
            />
            <View style={styles.flex}>
              <Text style={styles.docName}>{d.name}</Text>
              <Text style={styles.docMeta}>{d.meta}</Text>
            </View>
            <Icon name="download" size={17} color="#b9c0d6" />
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 22, paddingBottom: 26 },
  flex: { flex: 1 },
  hero: {
    experimental_backgroundImage: gradients.navyCard,
    borderRadius: 16,
    padding: 19,
    boxShadow: shadows.heroStrong,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#8f9dcd',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: '#fff',
    marginTop: 5,
    letterSpacing: -0.4,
  },
  heroSub: { fontSize: 12.5, color: '#c3cbe8', marginTop: 4 },
  route: { marginTop: 18, height: 44 },
  routeLine: {
    position: 'absolute',
    top: 21,
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  routeDone: {
    position: 'absolute',
    top: 21,
    left: 6,
    width: '54%',
    height: 2,
    backgroundColor: '#f3d27a',
  },
  routeDot: { position: 'absolute', top: 15, left: 0, right: 0, height: 12 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3d27a',
    boxShadow: '0 0 12px rgba(243,210,122,0.9)',
  },
  from: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fff',
  },
  to: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8f9dcd',
  },
  product: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    boxShadow: shadows.card,
  },
  thumb: { width: 56, height: 56, borderRadius: 11 },
  productName: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  productSub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  label: { marginTop: 22, marginHorizontal: 2, marginBottom: 12 },
  history: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 18,
    boxShadow: shadows.card,
  },
  docs: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 16,
    boxShadow: shadows.xs,
  },
  doc: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  docName: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  docMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
});
