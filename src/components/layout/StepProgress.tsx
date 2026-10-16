import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from '../common/Text';
import { ease } from '../common/animations';
import type { ResolvedMeta } from '../../navigation/screenMeta';
import { bg } from '../../utils/style';

/** "STEP 2 OF 5 · KYC" label with the progress track (`transition: width .3s`). */
export function StepProgress({ meta: m }: { meta: ResolvedMeta }) {
  const pct = parseFloat(m.prog) || 0;
  const width = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 300,
      easing: ease.css,
      useNativeDriver: false,
    }).start();
  }, [pct, width]);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.step, { color: m.muted }]}>{m.step}</Text>
        <Text style={styles.note}>{m.stepnote}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: m.track }]}>
        <Animated.View
          style={[
            styles.fill,
            bg(m.progFill),
            {
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 10, paddingHorizontal: 22, paddingBottom: 2, gap: 7 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  step: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  note: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#c8962f',
  },
  track: { height: 5, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999 },
});
