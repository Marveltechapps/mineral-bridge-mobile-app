import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  Grid,
  IconTile,
  InfoNote,
  Pill,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';

const DAYS = [
  { day: 10, dow: 'THU' },
  { day: 11, dow: 'FRI' },
  { day: 12, dow: 'SAT' },
  { day: 13, dow: 'SUN' },
  { day: 14, dow: 'MON' },
];
const SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
const BOOKED = '14:00';

/** C4 · Book evaluation — where and when our evaluator attends. */
export function PickupScreen() {
  const { day, slot } = useApp(s => ({ day: s.day, slot: s.slot }));
  return (
    <ScreenContainer screen="qPickup" contentStyle={styles.content}>
      <Text style={styles.title}>Where should we evaluate?</Text>
      <SectionLabel style={styles.label20}>PICKUP LOCATION</SectionLabel>
      <View style={styles.location}>
        <View style={styles.locRow}>
          <IconTile
            size={40}
            radius={10}
            bgColor="#f0f2f6"
            color="#1e2a5a"
            name="pin"
            iconSize={19}
          />
          <View style={styles.flex}>
            <Text style={styles.site}>Ilesha Lease Site 4</Text>
            <Text style={styles.address} leading={1.5}>
              {'Off Ijebu-Jesa Road, Ilesha\nOsun State, Nigeria'}
            </Text>
          </View>
          <Text style={styles.edit}>Edit</Text>
        </View>
        <View style={styles.locFoot}>
          <Pill
            label="FROM YOUR PROFILE"
            bgColor="#f1f3f7"
            border="#e2e5ec"
            fg="#33406e"
            size={10}
            padV={5}
            padH={9}
          />
          <Text style={styles.saved}>Saved 12 Aug 2026</Text>
        </View>
      </View>

      <SectionLabel style={styles.label22}>EVALUATION VISIT</SectionLabel>
      <View style={styles.days} accessibilityRole="radiogroup">
        {DAYS.map(d => {
          const a = day === d.day;
          return (
            <PressableScale
              key={d.day}
              onPress={() => setAppState({ day: d.day })}
              accessibilityRole="radio"
              accessibilityState={{ checked: a }}
              style={[
                styles.day,
                {
                  backgroundColor: a ? '#1e2a5a' : '#fff',
                  borderColor: a ? '#1e2a5a' : '#e2e5ec',
                  boxShadow: a
                    ? '0 1px 3px rgba(16,24,40,0.14)'
                    : '0 1px 2px rgba(16,24,40,0.04)',
                },
              ]}
            >
              <Text style={[styles.dow, { color: a ? '#8f9dcd' : '#8890ad' }]}>
                {d.dow}
              </Text>
              <Text style={[styles.dayNum, { color: a ? '#fff' : '#1a1f36' }]}>
                {String(d.day)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <Grid columns={3} gap={9} style={styles.slots}>
        {SLOTS.map(s => {
          const booked = s === BOOKED;
          const a = slot === s;
          return (
            <PressableScale
              key={s}
              disabled={booked}
              onPress={() => setAppState({ slot: s })}
              accessibilityState={{ selected: a, disabled: booked }}
              style={[
                styles.slot,
                {
                  backgroundColor: booked ? '#f4f5fa' : a ? '#1e2a5a' : '#fff',
                  borderColor: booked ? '#e8eaef' : a ? '#1e2a5a' : '#e2e5ec',
                },
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  {
                    color: booked ? '#b9c0d6' : a ? '#fff' : '#4a5170',
                    textDecorationLine: booked ? 'line-through' : 'none',
                  },
                ]}
              >
                {s}
              </Text>
            </PressableScale>
          );
        })}
      </Grid>
      <InfoNote style={styles.note}>
        Our evaluator weighs and assays on site, free of charge. Nothing leaves
        your hands until you accept our offer.
      </InfoNote>
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
  label20: { marginTop: 20, marginBottom: 8 },
  label22: { marginTop: 22, marginBottom: 10 },
  location: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: shadows.xs,
  },
  locRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  site: { fontSize: 14.5, fontWeight: '600', color: '#1a1f36' },
  address: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  edit: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
  locFoot: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saved: { fontSize: 12, color: '#8890ad', fontWeight: '600' },
  days: { flexDirection: 'row', gap: 9 },
  day: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  dow: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  dayNum: { fontSize: 18, fontWeight: '600', marginTop: 3 },
  slots: { marginTop: 12 },
  slot: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontSize: 13, fontWeight: '600' },
  note: { marginTop: 16 },
});
