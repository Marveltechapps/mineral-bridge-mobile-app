import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { CheckBadge } from '../common/ui';

type Props = {
  name: string;
  dur: string;
  state: string;
  stateFg: string;
  done: boolean;
  thumb: React.ReactNode;
  onPress: () => void;
};

/** Lesson row: thumbnail, title, duration pill, progress state and done tick. */
export function LessonRow({
  name,
  dur,
  state,
  stateFg,
  done,
  thumb,
  onPress,
}: Props) {
  return (
    <PressableScale onPress={onPress} style={styles.row}>
      {thumb}
      <View style={styles.flex}>
        <Text style={styles.name} leading={1.35}>
          {name}
        </Text>
        <View style={styles.meta}>
          <View style={styles.dur}>
            <Text style={styles.durText}>{dur}</Text>
          </View>
          <Text style={[styles.state, { color: stateFg }]}>{state}</Text>
        </View>
      </View>
      {done ? <CheckBadge size={24} radius={10} iconSize={13} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  flex: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  dur: {
    backgroundColor: '#f2f3f6',
    borderWidth: 1,
    borderColor: '#e4e6eb',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  durText: { color: '#606780', fontSize: 10.5, fontWeight: '600' },
  state: { fontSize: 11.5, fontWeight: '700' },
});
