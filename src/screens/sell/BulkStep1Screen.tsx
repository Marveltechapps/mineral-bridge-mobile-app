import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  DashedBox,
  FieldBox,
  Grid,
  Photo,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';

const FIELDS = [
  { label: 'MINERAL TYPE', value: 'Gold Bullion Bar · 99.5%', chevron: true },
  {
    label: 'INTENDED OFFTAKE PARTNER',
    value: 'Aurora Refining Ltd.',
    chevron: true,
  },
  {
    label: 'ORIGIN / MINE SITE',
    value: 'Ilesha Consolidated Lease, Osun',
    chevron: false,
  },
  { label: 'EXTRACTION DATE', value: '14 July 2026', chevron: true },
];

/** C8 · Bulk intake 1 — consignment photos, volume, origin and extraction date. */
export function BulkStep1Screen() {
  return (
    <ScreenContainer screen="iStep1" contentStyle={styles.content}>
      <Text style={styles.title}>Consignment details</Text>
      <Text style={styles.sub} leading={1.5}>
        Our desk prices the whole consignment against your filed licences.
      </Text>
      <SectionLabel style={styles.label}>
        CONSIGNMENT PHOTOS · 4 ADDED
      </SectionLabel>
      <Grid columns={4} gap={8}>
        <Photo name="gold-bullion" style={styles.photo} />
        <Photo name="gold-biscuit" style={styles.photo} />
        <Photo name="gold-dore" style={styles.photo} />
        <DashedBox style={styles.addPhoto}>
          <Icon name="plus" size={18} color="#8890ad" />
        </DashedBox>
      </Grid>
      <View style={styles.fields}>
        <View style={styles.qtyRow}>
          <View style={styles.flex}>
            <FieldBox label="QUANTITY" value="12.5" weight="700" />
          </View>
          <View style={styles.unit}>
            <SectionLabel style={styles.unitLabel}>UNIT</SectionLabel>
            <View style={styles.unitBox}>
              <Text style={styles.unitText}>kg</Text>
              <Icon name="chevronDown" size={16} color="#8890ad" />
            </View>
          </View>
        </View>
        {FIELDS.map(f => (
          <FieldBox
            key={f.label}
            label={f.label}
            value={f.value}
            right={
              f.chevron ? (
                <Icon name="chevronDown" size={16} color="#8890ad" />
              ) : undefined
            }
          />
        ))}
        <View>
          <SectionLabel style={styles.unitLabel}>DESCRIPTION</SectionLabel>
          <View style={styles.description}>
            <Text style={styles.descriptionText} leading={1.55}>
              Refinery-grade bullion from consolidated cooperative intake,
              re-assayed at 99.5% and bar-stamped. Full chain-of-custody
              documents available on request.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 26 },
  flex: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 6 },
  label: { marginTop: 20, marginBottom: 8 },
  photo: { height: 66, borderRadius: 10 },
  addPhoto: {
    height: 66,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: { marginTop: 20, gap: 15 },
  qtyRow: { flexDirection: 'row', gap: 11 },
  unit: { width: 112 },
  unitLabel: { marginBottom: 7 },
  unitBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    height: 52,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: shadows.hairline,
  },
  unitText: { fontSize: 14.5, fontWeight: '700', color: '#1a1f36' },
  description: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    minHeight: 98,
    boxShadow: shadows.hairline,
  },
  descriptionText: { fontSize: 13.5, color: '#4a5170' },
});
