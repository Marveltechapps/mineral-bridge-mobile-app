import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Grid, Photo } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PRODUCTS } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';

const CHIPS = ['All', 'Gold', 'Copper', 'Iron', 'Other'];

/** B3 · Product grid — price and available quantity on every tile. */
export function ProductGridScreen() {
  const chip = useApp(s => s.chip);
  return (
    <ScreenContainer screen="bProducts" contentStyle={styles.content}>
      <View style={styles.search}>
        <Icon name="search" size={17} color="#8890ad" />
        <Text style={styles.searchText}>Search minerals…</Text>
        <Pressable
          onPress={() => setAppState({ sheet: 'filter' })}
          accessibilityLabel="Filters"
          hitSlop={8}
        >
          <Icon name="filter" size={17} color="#1e2a5a" />
        </Pressable>
      </View>
      <View style={styles.chips}>
        {CHIPS.map(label => {
          const a = chip === label;
          return (
            <PressableScale
              key={label}
              activeScale={0.94}
              onPress={() => setAppState({ chip: label })}
              accessibilityState={{ selected: a }}
              style={[
                styles.chip,
                a
                  ? {
                      experimental_backgroundImage: gradients.navyButton,
                      borderColor: '#16204a',
                      boxShadow: '0 2px 8px rgba(30,42,90,0.24)',
                    }
                  : {
                      backgroundColor: '#fff',
                      borderColor: '#e2e5ec',
                      boxShadow: shadows.hairline,
                    },
              ]}
            >
              <Text
                style={[styles.chipText, { color: a ? '#fff' : '#606780' }]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <Grid columns={2} gap={13}>
        {PRODUCTS.map(p => (
          <PressableScale
            key={p.name}
            onPress={() => go('bDetail')}
            style={styles.card}
          >
            <Photo name={p.img} style={styles.image}>
              <View style={styles.verified}>
                <Icon name="check" size={10} color="#16a34a" strokeWidth={3} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </Photo>
            <View style={styles.body}>
              <Text style={styles.name} leading={1.25}>
                {p.name}
              </Text>
              <GradientText
                block
                style={styles.price}
                containerStyle={styles.priceBox}
              >
                {p.price}
              </GradientText>
              <Text style={styles.availLabel}>AVAILABLE</Text>
              <Text style={styles.avail}>{p.avail}</Text>
            </View>
          </PressableScale>
        ))}
      </Grid>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 26 },
  search: {
    marginTop: 2,
    marginBottom: 12,
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    boxShadow: shadows.hairline,
  },
  searchText: { flex: 1, fontSize: 13, color: '#8890ad' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    flex: 1,
    height: 34,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  image: { height: 104 },
  verified: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: '#16a34a',
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  body: { paddingTop: 11, paddingHorizontal: 12, paddingBottom: 13 },
  name: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  price: { fontSize: 14, fontWeight: '700' },
  priceBox: { marginTop: 6 },
  availLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
    marginTop: 7,
  },
  avail: { fontSize: 12, fontWeight: '700', color: '#6b7290', marginTop: 2 },
});
