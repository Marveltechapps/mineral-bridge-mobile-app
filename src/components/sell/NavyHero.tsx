import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Blip } from '../common/animations';
import { Text } from '../common/Text';
import { gradients, shadows } from '../../theme';

/** Navy gradient status card used at the top of tracking and offer screens. */
export function NavyHero({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.hero, style]}>{children}</View>;
}

/** Pill with a pulsing dot ("ON SITE", "LIVE", "EVALUATING"). */
export function LivePill({
  label,
  bg,
  border,
  fg,
  dot,
  weight = '700',
  dotSize = 6,
  duration = 1400,
  size = 10,
  spacing = 0.6,
}: {
  label: string;
  bg: string;
  border?: string;
  fg: string;
  dot: string;
  weight?: '600' | '700';
  dotSize?: number;
  duration?: number;
  size?: number;
  spacing?: number;
}) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg },
        border ? { borderWidth: 1, borderColor: border } : null,
      ]}
    >
      <Blip
        duration={duration}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: dot,
        }}
      />
      <Text
        style={{
          color: fg,
          fontWeight: weight,
          fontSize: size,
          letterSpacing: spacing,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 14,
    overflow: 'hidden',
    experimental_backgroundImage: gradients.navyCard,
    padding: 19,
    boxShadow: shadows.hero,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 9999,
  },
});
