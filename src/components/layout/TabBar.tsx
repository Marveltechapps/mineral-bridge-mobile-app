import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { TABS, type ResolvedMeta } from '../../navigation/screenMeta';
import { jump } from '../../navigation/flow';
import { gradients, layout } from '../../theme';

/**
 * Bottom tab bar. As in the design, a tab resets history to that tab's root
 * screen; "Sell to us" is the raised centre action.
 */
export function TabBar({
  meta: m,
  bottomInset,
}: {
  meta: ResolvedMeta;
  bottomInset: number;
}) {
  const height =
    layout.tabBar -
    layout.tabBarSafeZone +
    Math.max(layout.tabBarSafeZone, bottomInset);
  return (
    <View
      style={[
        styles.bar,
        { height, backgroundColor: m.tabBg, borderTopColor: m.tabBorder },
      ]}
      accessibilityRole="tablist"
    >
      {TABS.map(t => {
        const active = m.tab === t.id;
        const center = t.id === 'sell';
        const fg = center ? '#fff' : active ? '#1e2a5a' : '#a3abc4';
        return (
          <PressableScale
            key={t.id}
            onPress={() => jump(t.screen)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.name}
            style={[styles.item, { paddingTop: center ? 0 : 5 }]}
          >
            <View style={center ? styles.centerBox : styles.box}>
              <Icon d={t.icon} size={center ? 23 : 21} color={fg} />
            </View>
            <Text
              style={[styles.label, { color: active ? '#1e2a5a' : '#a3abc4' }]}
            >
              {t.name}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 8,
    boxShadow: '0 -0.5px 0 rgba(16,24,40,0.10)',
    zIndex: 4,
  },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  box: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: gradients.navyCard,
    boxShadow: '0 1px 3px rgba(16,24,40,0.20), 0 4px 10px rgba(16,24,40,0.18)',
  },
  label: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.2 },
});
