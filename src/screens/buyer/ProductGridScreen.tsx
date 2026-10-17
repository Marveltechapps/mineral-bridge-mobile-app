import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Grid, Photo } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useBuyerCatalog } from '../../catalog/useBuyerCatalog';
import { go } from '../../navigation/flow';
import { setAppState } from '../../context/appStore';
import { gradients, shadows } from '../../theme';

/** B3 · Product forms for the mineral type chosen on the previous screen. */
export function ProductGridScreen() {
  const catalog = useBuyerCatalog();
  const chips = [{ slug: '', name: 'All' }, ...catalog.forms];
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
        {chips.map(label => {
          const a = catalog.selection.productForm === label.slug;
          return (
            <PressableScale
              key={label.slug || 'all'}
              activeScale={0.94}
              onPress={() => catalog.chooseProductForm(label.slug)}
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
                {label.name}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <Grid columns={2} gap={13}>
        {catalog.products.map(p => (
          <PressableScale
            key={p.slug}
            onPress={() => go('bDetail')}
            style={styles.card}
          >
            <View style={styles.image}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={styles.fill} resizeMode="contain" />
              ) : p.img ? (
                <Photo name={p.img as 'gold-dore'} style={styles.fill} />
              ) : null}
              <View style={styles.verified}>
                <Icon name="check" size={10} color="#16a34a" strokeWidth={3} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>
            <View style={styles.body}>
              <Text style={styles.name} leading={1.25}>
                {p.name}
              </Text>
              <GradientText
                block
                style={styles.price}
                containerStyle={styles.priceBox}
              >
                {p.price || '—'}
              </GradientText>
              <Text style={styles.availLabel}>AVAILABLE</Text>
              <Text style={styles.avail}>{p.avail || '—'}</Text>
            </View>
          </PressableScale>
        ))}
      </Grid>
      {catalog.products.length === 0 ? (
        <Text style={styles.empty}>No product forms for this mineral type.</Text>
      ) : null}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 12,
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
  image: { height: 168, backgroundColor: '#eef1f6' },
  fill: { width: '100%', height: 168, backgroundColor: '#eef1f6' },
  empty: { fontSize: 13.5, color: '#6b7290', marginTop: 8 },
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
