import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  RadioDot,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ID_TYPES } from '../../lib/catalog';
import { setAppState, useApp } from '../../context/appStore';

/** K2 · ID type — radio cards plus the matching ID number. */
export function KycIdScreen() {
  const idType = useApp(s => s.idType);
  const current = idType >= 0 ? ID_TYPES[idType] : null;
  return (
    <ScreenContainer screen="kycId" contentStyle={styles.content}>
      <Text style={styles.title}>Which ID will you use?</Text>
      <Text style={styles.sub} leading={1.5}>
        It must be current and show your full name and date of birth.
      </Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {ID_TYPES.map((t, i) => {
          const on = idType === i;
          return (
            <PressableScale
              key={t.label}
              onPress={() => setAppState({ idType: on ? -1 : i })}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.card, { borderColor: on ? '#1e2a5a' : '#e5e7ec' }]}
            >
              <IconTile
                size={44}
                radius={11}
                bgColor="#f0f2f6"
                color="#1e2a5a"
                d={t.icon}
                iconSize={21}
              />
              <View style={styles.flex}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.cardSub} leading={1.4}>
                  {t.sub}
                </Text>
              </View>
              <RadioDot
                radius={9}
                dot={on ? '#1e2a5a' : '#c9cdd8'}
                fill={on ? '#1e2a5a' : 'transparent'}
              />
            </PressableScale>
          );
        })}
      </View>
      {current ? (
        <>
          <SectionLabel style={styles.label}>
            {current.label.toUpperCase() + ' NUMBER'}
          </SectionLabel>
          <View style={styles.field}>
            <Text style={styles.number}>{current.num}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.cardSub}>Select an ID type to continue.</Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingHorizontal: 22, paddingBottom: 26 },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 7 },
  list: { marginTop: 18, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 13,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 2px 8px rgba(16,24,40,0.04)',
  },
  flex: { flex: 1 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  cardSub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  label: { marginTop: 22, marginBottom: 8 },
  field: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    height: 52,
    paddingHorizontal: 15,
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  number: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#1a1f36',
  },
});
