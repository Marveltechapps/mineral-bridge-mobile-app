import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { saveDevicePreferences } from '../../api/devicePrefs';
import { flash } from '../../navigation/flow';
import {
  setAppState,
  useApp,
  type AppState,
  type PickerKind,
} from '../../context/appStore';
import { shadows } from '../../theme';

type PrefKey = keyof AppState['prefs'];
type Row =
  | { kind: 'toggle'; key: PrefKey; label: string; sub: string }
  | {
      kind: 'value';
      label: string;
      sub: string;
      value: string;
      onPress: () => void;
    };

/** iOS-style switch from the design (46×27 track, 21px knob). */
function Toggle({ on }: { on: boolean }) {
  const v = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: on ? 1 : 0,
      duration: 220,
      easing: ease.css,
      useNativeDriver: false,
    }).start();
  }, [on, v]);
  return (
    <Animated.View
      style={[
        styles.track,
        {
          backgroundColor: v.interpolate({
            inputRange: [0, 1],
            outputRange: ['#dfe2e9', '#16a34a'],
          }),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: v.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 19],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

/** P6 · Settings — alert toggles, preferences, security and sign-out. */
export function SettingsScreen() {
  const { prefs, prefsVal } = useApp(s => ({
    prefs: s.prefs,
    prefsVal: s.prefsVal,
  }));
  const toggle = (key: PrefKey, label: string, sub: string): Row => ({
    kind: 'toggle',
    key,
    label,
    sub,
  });
  const openPicker = (kind: PickerKind) => () =>
    setAppState({ picker: kind, sheet: 'picker' });
  const groups: { label: string; rows: Row[] }[] = [
    {
      label: 'ALERTS',
      rows: [
        toggle('bids', 'Bid activity', 'Outbid alerts and auction endings'),
        toggle('orders', 'Order updates', 'Verification, transit and delivery'),
        toggle(
          'lots',
          'New matching lots',
          'When supply fits your requirements',
        ),
        toggle('marketing', 'Product news', 'Occasional feature announcements'),
      ],
    },
    {
      label: 'PREFERENCES',
      rows: [
        {
          kind: 'value',
          label: 'Language',
          sub: 'App and email language',
          value: prefsVal.language,
          onPress: openPicker('language'),
        },
        {
          kind: 'value',
          label: 'Currency',
          sub: 'Prices shown across the app',
          value: prefsVal.currency,
          onPress: openPicker('currency'),
        },
        {
          kind: 'value',
          label: 'Units',
          sub: 'Weight and volume display',
          value: prefsVal.units,
          onPress: openPicker('units'),
        },
      ],
    },
    {
      label: 'SECURITY',
      rows: [
        toggle(
          'biometric',
          'Face ID unlock',
          'Require Face ID to open the app',
        ),
        {
          kind: 'value',
          label: 'Change PIN',
          sub: 'Used for payouts and bids',
          value: '',
          onPress: () => flash('Change your PIN'),
        },
        {
          kind: 'value',
          label: 'Active sessions',
          sub: '2 devices signed in',
          value: '2',
          onPress: () => flash('Manage sessions'),
        },
      ],
    },
  ];

  return (
    <ScreenContainer screen="settings" contentStyle={styles.content}>
      {groups.map(g => (
        <View key={g.label} style={styles.group}>
          <SectionLabel style={styles.label}>{g.label}</SectionLabel>
          <View style={styles.card}>
            {g.rows.map(r => (
              <Pressable
                key={r.label}
                onPress={
                  r.kind === 'toggle'
                    ? () =>
                        setAppState(p => {
                          const prefs = { ...p.prefs, [r.key]: !p.prefs[r.key] };
                          void saveDevicePreferences({ prefs, prefsVal: p.prefsVal });
                          return { prefs };
                        })
                    : r.onPress
                }
                accessibilityRole={r.kind === 'toggle' ? 'switch' : 'button'}
                accessibilityState={
                  r.kind === 'toggle' ? { checked: prefs[r.key] } : undefined
                }
                style={styles.row}
              >
                <View style={styles.flex}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowSub} leading={1.4}>
                    {r.sub}
                  </Text>
                </View>
                {r.kind === 'toggle' ? <Toggle on={prefs[r.key]} /> : null}
                {r.kind === 'value' && r.value ? (
                  <Text style={styles.value}>{r.value}</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <PressableScale
        activeScale={0.985}
        onPress={() => setAppState({ sheet: 'logout', danger: 'logout' })}
        style={styles.logout}
      >
        <Icon name="logout" size={17} color="#dc2626" />
        <Text style={styles.logoutText}>Log out</Text>
      </PressableScale>
      <Pressable
        onPress={() => setAppState({ sheet: 'logout', danger: 'delete' })}
        accessibilityRole="button"
        style={styles.deleteWrap}
      >
        <Text style={styles.delete}>Delete my account</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  group: { marginBottom: 20 },
  label: { marginHorizontal: 2, marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 2,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  row: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  rowLabel: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  rowSub: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
  value: { fontSize: 12.5, fontWeight: '600', color: '#606780' },
  track: {
    width: 46,
    height: 27,
    borderRadius: 14,
    padding: 3,
    flexDirection: 'row',
  },
  knob: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(16,24,40,0.2)',
  },
  logout: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3d4d4',
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    boxShadow: shadows.xs,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
  deleteWrap: { marginTop: 16, alignSelf: 'center' },
  delete: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#a3abc4',
  },
});
