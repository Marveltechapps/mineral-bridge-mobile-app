import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { gradients, shadows } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  /** The design gives some sheet buttons no pressed state. */
  pressScale?: number;
  shadow?: boolean;
  accessibilityLabel?: string;
};

/** Navy gradient button (`linear-gradient(180deg,#243258,#1a2450)`). */
export function PrimaryButton({
  label,
  onPress,
  height = 58,
  style,
  labelStyle,
  icon,
  pressScale = 0.977,
  shadow = true,
  accessibilityLabel,
}: Props) {
  return (
    <PressableScale
      activeScale={pressScale}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        styles.primary,
        { height },
        shadow ? styles.primaryShadow : null,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.primaryLabel, labelStyle]}>{label}</Text>
    </PressableScale>
  );
}

/** White outlined button (`border:1px solid #d8dce5; color:#243258`). */
export function SecondaryButton({
  label,
  onPress,
  height = 50,
  style,
  labelStyle,
  icon,
  pressScale = 0.977,
  accessibilityLabel,
}: Props) {
  return (
    <PressableScale
      activeScale={pressScale}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, styles.secondary, { height }, style]}
    >
      {icon}
      <Text style={[styles.secondaryLabel, labelStyle]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    experimental_backgroundImage: gradients.navyButton,
    borderColor: '#16204a',
  },
  primaryShadow: { boxShadow: shadows.navyButton },
  primaryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  secondary: { backgroundColor: '#fff', borderColor: '#d8dce5' },
  secondaryLabel: { color: '#243258', fontSize: 14.5, fontWeight: '600' },
});
