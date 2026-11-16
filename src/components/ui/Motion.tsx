// The design's CSS keyframes (fadeUp, rise, pop, drift1/2, spinSlow, shimmer,
// pulse, scanLine, toastIn, sheetUp) rebuilt with the Animated API.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

type Base = { style?: StyleProp<ViewStyle>; children?: React.ReactNode; delay?: number; pointerEvents?: 'none' | 'auto' | 'box-none' };

/** fadeUp .45s cubic-bezier(.2,.8,.2,1) (screen entrance) or rise .5s (18px). */
export function FadeUp({ style, children, delay = 0, dist = 12, dur = 450, fadeOnly }: Base & { dist?: number; dur?: number; fadeOnly?: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: dur, delay, easing: ease, useNativeDriver: true }).start(); }, [v, delay, dur]);
  const tr = fadeOnly ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }];
  return <Animated.View style={[style, { opacity: v, transform: tr }]}>{children}</Animated.View>;
}

/** pop .35–.5s: scale .5 → 1.07 → 1 with fade in. */
export function Pop({ style, children, dur = 500 }: Base & { dur?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }).start(); }, [v, dur]);
  const scale = v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 1.07, 1] });
  const opacity = v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 1] });
  return <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>;
}

function useLoop(dur: number, pingPong = false) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = pingPong
      ? Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]))
      : Animated.loop(Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [v, dur, pingPong]);
  return v;
}

/** drift1 / drift2: slow translate + scale ping-pong. */
export function Drift({ style, children, dur = 9000, dx = 38, dy = 22, sc = 1.15, pointerEvents }: Base & { dur?: number; dx?: number; dy?: number; sc?: number }) {
  const v = useLoop(dur, true);
  const transform = [
    { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
    { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
    { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, sc] }) },
  ];
  return <Animated.View pointerEvents={pointerEvents} style={[style, { transform }]}>{children}</Animated.View>;
}

/** spinSlow: continuous rotation. */
export function Spin({ style, children, dur = 24000, pointerEvents }: Base & { dur?: number }) {
  const v = useLoop(dur);
  return <Animated.View pointerEvents={pointerEvents} style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>{children}</Animated.View>;
}

/** pulse 1.2s: opacity 1 → .3 → 1. */
export function Pulse({ style, children, dur = 1200 }: Base & { dur?: number }) {
  const v = useLoop(dur, true);
  return <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]}>{children}</Animated.View>;
}

/** shimmer 2.4s: band sweeping from -120% to 220% of `width`. */
export function Shimmer({ style, children, width, dur = 2400 }: Base & { width: number; dur?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [v, dur]);
  const band = width * 0.4;
  return <Animated.View pointerEvents="none" style={[style, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-1.2 * band, 2.2 * band] }) }] }]}>{children}</Animated.View>;
}

/** scanLine 2.6s: moves between 8% and 88% of `height`. */
export function ScanLine({ style, children, height, dur = 2600 }: Base & { height: number; dur?: number }) {
  const v = useLoop(dur, true);
  return <Animated.View pointerEvents="none" style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [height * 0.08, height * 0.88] }) }] }]}>{children}</Animated.View>;
}

/** Animated width for progress fills (transition: width .3s–.5s). */
export function ProgressFill({ pct, style, dur = 400, children }: { pct: string | number; style?: StyleProp<ViewStyle>; dur?: number; children?: React.ReactNode }) {
  const target = typeof pct === 'number' ? pct : parseFloat(pct) || 0;
  const v = useRef(new Animated.Value(target)).current;
  useEffect(() => { Animated.timing(v, { toValue: target, duration: dur, easing: ease, useNativeDriver: false }).start(); }, [v, target, dur]);
  return <Animated.View style={[{ height: '100%', width: v.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }, style]}>{children}</Animated.View>;
}

/** Animated left offset for switch knobs / segmented thumbs. */
export function Slide({ to, style, children, dur = 300, spring }: Base & { to: number; dur?: number; spring?: boolean }) {
  const v = useRef(new Animated.Value(to)).current;
  useEffect(() => {
    if (spring) Animated.spring(v, { toValue: to, useNativeDriver: true, speed: 14, bounciness: 9 }).start();
    else Animated.timing(v, { toValue: to, duration: dur, easing: ease, useNativeDriver: true }).start();
  }, [v, to, dur, spring]);
  return <Animated.View style={[style, { transform: [{ translateX: v }] }]}>{children}</Animated.View>;
}
