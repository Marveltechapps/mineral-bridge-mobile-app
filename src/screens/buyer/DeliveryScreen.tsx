import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import { FieldBox, Pill } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useApp } from '../../context/appStore';

const FIELDS = [
  { label: 'FACILITY NAME', value: 'Aurora Refining Ltd.' },
  { label: 'STREET ADDRESS', value: '14 Creek Road, Apapa' },
  { label: 'CITY', value: 'Lagos' },
  { label: 'STATE / REGION', value: 'Lagos State' },
  { label: 'CONTACT PERSON', value: 'Adaeze Okafor' },
  { label: 'CONTACT PHONE', value: '+234 802 441 9087' },
];

/** B6 · Delivery & logistics — the import permit field appears for Tier 3 only. */
export function DeliveryScreen() {
  const institutional = useApp(s => s.tierIdx === 2);
  return (
    <ScreenContainer screen="bDeliv" contentStyle={styles.content}>
      <Text style={styles.title}>Where should we deliver?</Text>
      <Text style={styles.sub} leading={1.5}>
        Bonded transport is arranged by Mineral Bridge after verification.
      </Text>
      <View style={styles.fields}>
        {FIELDS.map(f => (
          <FieldBox key={f.label} label={f.label} value={f.value} />
        ))}
        {institutional ? (
          <FieldBox
            label="IMPORT PERMIT NUMBER"
            value="NG-IMP-2026-44817"
            labelAccessory={
              <Pill
                label="TIER 3"
                bgColor="#eef3fe"
                border="#d6e2fb"
                fg="#1d4fd7"
                spacing={0.5}
                padH={7}
              />
            }
            note="Required for Tier 3 accounts. Checked against the regulator register."
          />
        ) : null}
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
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 7 },
  fields: { marginTop: 20, gap: 16 },
});
