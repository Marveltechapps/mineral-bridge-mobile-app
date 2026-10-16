import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ease } from './animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /**
   * Scale applied while pressed, mirroring the design's
   * `style-active="transform:scale(.977)"`. `1` disables the effect for
   * elements the design gives no pressed state.
   */
  activeScale?: number;
};

/** A pressable surface with the design's pressed-state scale (120ms ease). */
export function PressableScale({
  activeScale = 0.977,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.timing(scale, {
      toValue: to,
      duration: 120,
      easing: ease.css,
      useNativeDriver: true,
    }).start();
  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      style={[style, activeScale !== 1 ? { transform: [{ scale }] } : null]}
      onPressIn={(e: GestureResponderEvent) => {
        if (activeScale !== 1) animate(activeScale);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        if (activeScale !== 1) animate(1);
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
