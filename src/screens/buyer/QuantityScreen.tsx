import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  Photo,
  QtyStepper,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { useQuantity } from '../../lib/hooks/useQuantity';
import { useApp } from '../../context/appStore';
import { shadows } from '../../theme';

/** B5 · Quantity & requirement — stepper with unit chips; tier pre-filled. */
export function QuantityScreen() {
  const q = useQuantity();
  const tierName = useApp(s => ACCOUNT_TIERS[s.tierIdx].name);
  return (
    <ScreenContainer screen="bQty" contentStyle={styles.content}>
      <Text style={styles.title}>Your requirement</Text>
      <SectionLabel style={styles.label20}>MINERAL TYPE</SectionLabel>
      <View style={styles.select}>
        <Photo name="gold-dore" style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.selectTitle}>Gold Doré Bar · 22K</Text>
          <Text style={styles.selectSub}>Precious Metals</Text>
        </View>
        <Icon name="chevronDown" size={18} color="#8890ad" />
      </View>
      <SectionLabel style={styles.label22}>AVAILABLE QUANTITY</SectionLabel>
      <QtyStepper
        qty={q.qty}
        unit={q.unit}
        unitLabel={q.unitLabel}
        onDec={q.dec}
        onInc={q.inc}
        onUnit={q.setUnit}
        footnote="Seller has 4.2 kg in the Lagos vault. Larger volumes are sourced within 14 days."
      />
      <SectionLabel style={styles.label22}>ACCOUNT TIER</SectionLabel>
      <View style={styles.select}>
        <IconTile
          size={38}
          radius={9}
          bgColor="#f0f2f6"
          color="#1e2a5a"
          name="building"
          iconSize={18}
        />
        <View style={styles.flex}>
          <Text style={styles.selectTitle}>{tierName}</Text>
          <Text style={styles.selectSub}>From your profile</Text>
        </View>
        <Text style={styles.change}>Change</Text>
      </View>
      <SectionLabel style={styles.label22}>NEEDED BY</SectionLabel>
      <View style={[styles.select, styles.date]}>
        <Text style={styles.dateText}>28 September 2026</Text>
        <Icon name="calendar" size={18} color="#8890ad" />
      </View>
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
  label20: { marginTop: 20, marginBottom: 8 },
  label22: { marginTop: 22, marginBottom: 8 },
  select: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.hairline,
  },
  thumb: { width: 40, height: 40, borderRadius: 9 },
  flex: { flex: 1 },
  selectTitle: { fontSize: 14.5, fontWeight: '600', color: '#1a1f36' },
  selectSub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
  change: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
  date: { padding: 15, justifyContent: 'space-between' },
  dateText: { fontSize: 14.5, fontWeight: '700', color: '#1a1f36' },
});
