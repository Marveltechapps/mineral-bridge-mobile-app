import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { Grid } from '../common/ui';
import { shadows } from '../../theme';

const KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '',
  '0',
  'del',
] as const;

type Props = { onDigit: (d: string) => void; onDelete: () => void };

/**
 * The design's on-screen number pad (a 3-column grid docked to the bottom of
 * the phone and OTP screens). It replaces the system keyboard there.
 */
export function Keypad({ onDigit, onDelete }: Props) {
  return (
    <View style={styles.pad}>
      <Grid columns={3} gap={7}>
        {KEYS.map((k, i) => {
          const blank = k === '' || k === 'del';
          return (
            <PressableScale
              key={i}
              disabled={k === ''}
              onPress={() => (k === 'del' ? onDelete() : onDigit(k))}
              accessibilityLabel={k === 'del' ? 'Delete' : k || undefined}
              style={[styles.key, blank ? styles.blank : styles.digit]}
            >
              <Text style={styles.keyLabel}>{k === 'del' ? '⌫' : k}</Text>
            </PressableScale>
          );
        })}
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    marginTop: 18,
    marginHorizontal: -22,
    backgroundColor: '#e7e9ee',
    borderTopWidth: 1,
    borderTopColor: '#dfe2e9',
    paddingTop: 9,
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  key: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { backgroundColor: '#fff', boxShadow: shadows.keypadKey },
  blank: { backgroundColor: 'transparent' },
  keyLabel: { fontSize: 23, fontWeight: '500', color: '#1a1f36' },
});
