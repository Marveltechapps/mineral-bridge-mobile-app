import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ImageName } from '../../../assets/images';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Grid, Photo } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import { appStore, setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';

const ITEMS: { name: string; sub: string; img: ImageName }[] = [
  { name: 'Gold Dust', sub: 'Unrefined', img: 'gold-dust' },
  { name: 'Gold Concentrate', sub: 'Sluice output', img: 'gold-concentrate' },
  { name: 'Gold Grain / Shot', sub: 'Melted', img: 'grain-shot' },
  { name: 'Gold Doré Bar', sub: 'Smelted', img: 'gold-dore' },
  { name: 'Gold Biscuit', sub: '24K', img: 'gold-biscuit' },
  { name: 'Gold Bullion Bar', sub: 'Refinery grade', img: 'gold-bullion' },
];

/** C1 · What are you selling? — entry to the sell-to-Mineral-Bridge flow. */
export function SellPickScreen() {
  const tierIdx = useApp(s => s.tierIdx);
  const tier = ACCOUNT_TIERS[tierIdx];
  const pick = (name: string) => {
    setAppState({ sellItem: name });
    go(appStore.getState().tierIdx === 2 ? 'iStep1' : 'qList');
  };
  return (
    <ScreenContainer screen="sPick" contentStyle={styles.content}>
      <Text style={styles.title}>What are you selling to us?</Text>
      <Text style={styles.sub} leading={1.5}>
        {tierIdx === 2
          ? 'For bulk consignments our desk prices the whole lot and quotes you directly.'
          : 'Pick what you have and get a price in under a minute. We buy it outright.'}
      </Text>
      <View style={styles.tierRow}>
        <View style={styles.tierBadge}>
          <Text style={styles.tierBadgeText}>
            {tier.tag + ' · ' + tier.short.toUpperCase()}
          </Text>
        </View>
        <Pressable
          onPress={() => setAppState(p => ({ tierIdx: (p.tierIdx + 1) % 3 }))}
          accessibilityRole="button"
        >
          <Text style={styles.switch}>Switch tier</Text>
        </Pressable>
      </View>
      <Grid columns={2} gap={13}>
        {ITEMS.map(p => (
          <PressableScale
            key={p.name}
            onPress={() => pick(p.name)}
            style={styles.card}
          >
            <Photo name={p.img} style={styles.image} />
            <View style={styles.body}>
              <Text style={styles.name} leading={1.25}>
                {p.name}
              </Text>
              <Text style={styles.itemSub}>{p.sub}</Text>
            </View>
          </PressableScale>
        ))}
      </Grid>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 6 },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  tierBadge: {
    backgroundColor: '#f6f1e6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  tierBadgeText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  switch: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  image: { height: 100, width: '100%' },
  body: { paddingTop: 11, paddingHorizontal: 12, paddingBottom: 13 },
  name: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  itemSub: {
    fontSize: 11.5,
    color: '#8890ad',
    marginTop: 4,
    fontWeight: '600',
  },
});
