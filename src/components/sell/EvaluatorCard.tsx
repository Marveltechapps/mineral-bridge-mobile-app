import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { gradients, shadows } from '../../theme';

type Props = {
  style?: StyleProp<ViewStyle>;
  subtitle: string;
  onCall: () => void;
};

/** Evaluator contact row (avatar, name, call button) on the evaluation screen. */
export function EvaluatorCard({ style, subtitle, onCall }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>EB</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.name}>Emeka Balogun</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <PressableScale
        activeScale={0.92}
        onPress={onCall}
        accessibilityLabel="Call Emeka Balogun"
        style={styles.call}
      >
        <Icon name="phone" size={17} color="#15803d" />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    boxShadow: shadows.xs,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    experimental_backgroundImage: gradients.navyAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#f3d27a', fontSize: 15, fontWeight: '700' },
  flex: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  sub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
  call: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ecf7f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
