import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import { FieldBox, Pill } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { setAppState, useApp, type DeliveryDetails } from '../../context/appStore';

const FIELDS: { key: keyof DeliveryDetails; label: string }[] = [
  { key: 'facility', label: 'FACILITY NAME' },
  { key: 'street', label: 'STREET ADDRESS' },
  { key: 'city', label: 'CITY' },
  { key: 'region', label: 'STATE / REGION' },
  { key: 'contact', label: 'CONTACT PERSON' },
  { key: 'phone', label: 'CONTACT PHONE' },
];

/** B6 · Delivery & logistics — the import permit field appears for Tier 3 only. */
export function DeliveryScreen() {
  const institutional = useApp(s => s.tierIdx === 2);
  const delivery = useApp(s => s.delivery);
  const edit =
    (key: keyof DeliveryDetails) => (value: string) =>
      setAppState(p => ({ delivery: { ...p.delivery, [key]: value } }));
  return (
    <ScreenContainer screen="bDeliv" contentStyle={styles.content}>
      <Text style={styles.title}>Where should we deliver?</Text>
      <Text style={styles.sub} leading={1.5}>
        Bonded transport is arranged by Mineral Bridge after verification.
      </Text>
      <View style={styles.fields}>
        {FIELDS.map(f => (
          <FieldBox
            key={f.key}
            label={f.label}
            value={delivery[f.key]}
            onChangeText={edit(f.key)}
          />
        ))}
        {institutional ? (
          <FieldBox
            label="IMPORT PERMIT NUMBER"
            value={delivery.permit}
            onChangeText={edit('permit')}
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
