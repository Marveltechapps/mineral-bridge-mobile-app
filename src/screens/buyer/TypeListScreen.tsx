import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useBuyerCatalog } from '../../catalog/useBuyerCatalog';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Photo, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { go } from '../../navigation/flow';
import { shadows } from '../../theme';

/** B2 · Subcategories, then mineral types, for the category chosen on the home screen. */
export function TypeListScreen() {
  const catalog = useBuyerCatalog();
  const showingTypes = Boolean(catalog.selection.subcategory);
  const rows = showingTypes ? catalog.mineralTypes : catalog.subcategories;
  return (
    <ScreenContainer screen="bTypes" contentStyle={styles.content}>
      <SectionLabel style={styles.label}>
        {showingTypes ? `${rows.length} MINERAL TYPES` : `${rows.length} SUBCATEGORIES`}
      </SectionLabel>
      {showingTypes ? (
        <PressableScale
          onPress={() => catalog.chooseSubcategory(catalog.selection.subcategory)}
          style={styles.back}
        >
          <Text style={styles.backText}>All subcategories</Text>
        </PressableScale>
      ) : null}
      <View style={styles.list}>
        {rows.map((row) => (
          <PressableScale
            key={row.slug}
            onPress={() => {
              if (showingTypes) {
                catalog.chooseMineralType(row.slug);
                go('bProducts');
              } else {
                catalog.chooseSubcategory(row.slug);
              }
            }}
            style={styles.card}
          >
            {row.imageUrl ? (
              <Image source={{ uri: row.imageUrl }} style={styles.thumb} resizeMode="contain" />
            ) : row.img ? (
              <Photo name={row.img as 'm-gold'} style={styles.thumb} />
            ) : (
              <View style={styles.thumb} />
            )}
            <View style={styles.flex}>
              <Text style={styles.name}>{row.name}</Text>
              <Text style={styles.sub}>
                {'sub' in row && row.sub
                  ? row.sub
                  : 'mineralTypes' in row
                    ? `${row.mineralTypes.length} mineral types`
                    : `${'productForms' in row ? row.productForms.length : 0} product forms`}
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="#b9c0d6" />
          </PressableScale>
        ))}
        {rows.length === 0 ? (
          <Text style={styles.empty}>Nothing is published under this selection.</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 26 },
  label: { marginTop: 6, marginHorizontal: 2, marginBottom: 12 },
  back: { alignSelf: 'flex-start', marginBottom: 10 },
  backText: { fontSize: 13, fontWeight: '600', color: '#1d4fd7' },
  list: { gap: 11 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    boxShadow: shadows.xs,
  },
  thumb: { width: 72, height: 72, borderRadius: 11, backgroundColor: '#eef1f6' },
  flex: { flex: 1 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  sub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  empty: { fontSize: 13.5, color: '#6b7290', paddingVertical: 12 },
});
