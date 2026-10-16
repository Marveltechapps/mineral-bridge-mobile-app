import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Photo, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { TYPES } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import { shadows } from '../../theme';

/** B2 · Type list — mineral types within Precious Metals. */
export function TypeListScreen() {
  return (
    <ScreenContainer screen="bTypes" contentStyle={styles.content}>
      <SectionLabel style={styles.label}>4 TYPES AVAILABLE</SectionLabel>
      <View style={styles.list}>
        {TYPES.map(t => (
          <PressableScale
            key={t.name}
            onPress={() => go('bProducts')}
            style={styles.card}
          >
            <Photo name={t.img} style={styles.thumb} />
            <View style={styles.flex}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.sub}>{t.sub}</Text>
            </View>
            <Icon name="chevronRight" size={18} color="#b9c0d6" />
          </PressableScale>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 26 },
  label: { marginTop: 6, marginHorizontal: 2, marginBottom: 12 },
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
  thumb: { width: 58, height: 58, borderRadius: 11 },
  flex: { flex: 1 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  sub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
});
