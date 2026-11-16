import React from 'react';
import { Pressable } from 'react-native';
import type { AccessibilityRole, PressableProps, StyleProp, ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** CSS :active scale (e.g. .98). Omit for no press feedback. */
  scale?: number;
  role?: AccessibilityRole;
  label?: string;
  checked?: boolean;
  selected?: boolean;
  /** Extra style while pressed (CSS :hover/:active backgrounds). */
  pressedStyle?: StyleProp<ViewStyle>;
};

/** Pressable with the design's press feedback (style-active transform: scale()). */
export function Tap({ style, scale, role = 'button', label, checked, selected, pressedStyle, children, ...rest }: Props) {
  const state = checked !== undefined || selected !== undefined ? { checked, selected } : undefined;
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={state}
      hitSlop={4}
      style={({ pressed }) => [style, pressed && scale ? { transform: [{ scale }] } : null, pressed ? pressedStyle : null]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
