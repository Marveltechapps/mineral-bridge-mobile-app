import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { go } from '../../navigation/flow';
import type { ResolvedMeta } from '../../navigation/screenMeta';

type Props = { meta: ResolvedMeta; onBack: () => void };

/** Title row: back button, ellipsised title and optional notification bell. */
export function Header({ meta: m, onBack }: Props) {
  const chrome = { borderColor: m.chromeBorder, backgroundColor: m.chromeBg };
  return (
    <View style={styles.row}>
      <PressableScale
        activeScale={0.92}
        onPress={onBack}
        accessibilityLabel="Back"
        style={[styles.chrome, styles.backShadow, chrome]}
      >
        <Icon name="back" size={18} color={m.chromeFg} />
      </PressableScale>
      <Text numberOfLines={1} style={[styles.title, { color: m.ink }]}>
        {m.title}
      </Text>
      {m.bell ? (
        <PressableScale
          onPress={() => go('notifs')}
          style={[styles.chrome, chrome]}
          accessibilityLabel="Notifications"
        >
          <Icon name="bell" size={18} color={m.chromeFg} />
          <View style={[styles.badge, { borderColor: m.bg }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chrome: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backShadow: { boxShadow: '0 1px 2px rgba(16,24,40,0.06)' },
  title: { flex: 1, fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600', lineHeight: 12 },
});
