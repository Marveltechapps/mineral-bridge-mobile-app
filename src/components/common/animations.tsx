/**
 * The design's CSS keyframes (`fadeUp`, `pop`, `ring`, `spin`, `blip`, …)
 * re-created with the Animated API. Durations, delays and timing functions
 * are the design's; multi-step keyframes apply the timing function to each
 * segment, as CSS does.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type EasingFunction,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export const ease = {
  /** cubic-bezier(.2,.8,.2,1) — the design's signature ease-out. */
  brand: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** cubic-bezier(.2,.9,.3,1) — used by the success pops. */
  pop: Easing.bezier(0.2, 0.9, 0.3, 1),
  css: Easing.bezier(0.25, 0.1, 0.25, 1),
  out: Easing.bezier(0, 0, 0.58, 1),
  inOut: Easing.bezier(0.42, 0, 0.58, 1),
  linear: Easing.linear,
};

type Base = { style?: StyleProp<ViewStyle>; children?: React.ReactNode };
type Timed = { delay?: number; duration?: number; easing?: EasingFunction };

function useValue(initial: number) {
  return useRef(new Animated.Value(initial)).current;
}

/** Runs `anim` once on mount (after `delay`). */
function useOnMount(build: () => Animated.CompositeAnimation, delay = 0) {
  useEffect(() => {
    const anim = Animated.sequence([Animated.delay(delay), build()]);
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Runs `anim` forever on mount (after `delay`). */
function useLoop(
  build: () => Animated.CompositeAnimation,
  delay = 0,
  active = true,
) {
  useEffect(() => {
    if (!active) return;
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(build()),
    ]);
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

const timing = (
  v: Animated.Value,
  toValue: number,
  duration: number,
  easing: EasingFunction,
) => Animated.timing(v, { toValue, duration, easing, useNativeDriver: true });

/** `fadeUp`: opacity 0 → 1, translateY(14px) → 0. */
export function FadeUp({
  delay = 0,
  duration = 420,
  easing = ease.brand,
  distance = 14,
  style,
  children,
}: Base & Timed & { distance?: number }) {
  const v = useValue(0);
  useOnMount(() => timing(v, 1, duration, easing), delay);
  const translateY = v.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/** `drop`: opacity 0 → 1, translateY(-14px) → 0. */
export function Drop({
  delay = 0,
  duration = 350,
  easing = ease.out,
  style,
  children,
}: Base & Timed) {
  return (
    <FadeUp
      delay={delay}
      duration={duration}
      easing={easing}
      distance={-14}
      style={style}
    >
      {children}
    </FadeUp>
  );
}

/** `fade`: opacity 0 → 1. */
export function FadeIn({
  delay = 0,
  duration = 200,
  easing = ease.out,
  style,
  children,
}: Base & Timed) {
  const v = useValue(0);
  useOnMount(() => timing(v, 1, duration, easing), delay);
  return (
    <Animated.View style={[style, { opacity: v }]}>{children}</Animated.View>
  );
}

/** `pop`: scale .55 → 1.12 (70%) → 1, opacity .3 → 1. */
export function Pop({
  delay = 0,
  duration = 500,
  easing = ease.out,
  style,
  children,
}: Base & Timed) {
  const v = useValue(0);
  useOnMount(
    () =>
      Animated.sequence([
        timing(v, 0.7, duration * 0.7, easing),
        timing(v, 1, duration * 0.3, easing),
      ]),
    delay,
  );
  const scale = v.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.55, 1.12, 1],
  });
  const opacity = v.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.3, 1, 1],
  });
  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

/** `logoIn`: opacity 0, scale .82 → 1.04 (60%) → 1. */
export function LogoIn({
  delay = 0,
  duration = 700,
  easing = ease.pop,
  style,
  children,
}: Base & Timed) {
  const v = useValue(0);
  useOnMount(
    () =>
      Animated.sequence([
        timing(v, 0.6, duration * 0.6, easing),
        timing(v, 1, duration * 0.4, easing),
      ]),
    delay,
  );
  const scale = v.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.82, 1.04, 1],
  });
  const opacity = v.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 1, 1],
  });
  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

/** `ring`: scale .8 → 1.5, opacity .55 → 0, repeating. */
export function Ring({
  delay = 0,
  duration = 1600,
  easing = ease.out,
  style,
}: Base & Timed) {
  const v = useValue(0);
  useLoop(
    () =>
      Animated.sequence([
        timing(v, 1, duration, easing),
        timing(v, 0, 0, ease.linear),
      ]),
    delay,
  );
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { opacity, transform: [{ scale }] }]}
    />
  );
}

/** `spin`: rotate 0 → 360deg, linear, repeating. */
export function Spin({ duration = 900, style }: Base & Timed) {
  const v = useValue(0);
  useLoop(() =>
    Animated.sequence([
      timing(v, 1, duration, ease.linear),
      timing(v, 0, 0, ease.linear),
    ]),
  );
  const rotate = v.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return <Animated.View style={[style, { transform: [{ rotate }] }]} />;
}

/** `blip`: opacity 1 → .45, scale 1 → .72 at 50%, ease-in-out, repeating. */
export function Blip({
  delay = 0,
  duration = 1400,
  style,
  children,
  active = true,
}: Base & Timed & { active?: boolean }) {
  const v = useValue(0);
  useLoop(
    () =>
      Animated.sequence([
        timing(v, 1, duration / 2, ease.inOut),
        timing(v, 0, duration / 2, ease.inOut),
      ]),
    delay,
    active,
  );
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  return (
    <Animated.View
      style={[style, active ? { opacity, transform: [{ scale }] } : null]}
    >
      {children}
    </Animated.View>
  );
}

/** `caret`: steps(1) blink — visible for 55% of 1.1s. */
export function Caret({ style }: Base) {
  const v = useValue(1);
  useLoop(() =>
    Animated.sequence([
      timing(v, 1, 0, ease.linear),
      Animated.delay(605),
      timing(v, 0, 0, ease.linear),
      Animated.delay(495),
    ]),
  );
  return <Animated.View style={[style, { opacity: v }]} />;
}

/** `shimmer`: translateX(-120%) → translateX(240%) of its own width. */
export function Shimmer({
  width,
  duration = 1300,
  style,
  children,
}: Base & Timed & { width: number }) {
  const v = useValue(0);
  useLoop(() =>
    Animated.sequence([
      timing(v, 1, duration, ease.inOut),
      timing(v, 0, 0, ease.linear),
    ]),
  );
  const translateX = v.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.2 * width, 2.4 * width],
  });
  return (
    <Animated.View style={[style, { width, transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

/** Opacity track used by `travel`: 0 → 1 (12%), hold, → 0 (88–100%). */
function edgeFade(v: Animated.Value, duration: number, easing: EasingFunction) {
  return Animated.sequence([
    timing(v, 1, duration * 0.12, easing),
    Animated.delay(duration * 0.76),
    timing(v, 0, duration * 0.12, easing),
  ]);
}

/**
 * `travel`: a dot that moves from the left edge to the centre (46%), pauses
 * (to 54%) and continues to the right edge, fading in and out at the ends.
 */
export function Travel({
  duration,
  easing,
  dot = 12,
  style,
}: {
  duration: number;
  easing: EasingFunction;
  dot?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const pos = useValue(0);
  const fade = useValue(0);
  useLoop(
    () =>
      Animated.parallel([
        Animated.sequence([
          timing(pos, 0.5, duration * 0.46, easing),
          Animated.delay(duration * 0.08),
          timing(pos, 1, duration * 0.46, easing),
          timing(pos, 0, 0, ease.linear),
        ]),
        edgeFade(fade, duration, easing),
      ]),
    0,
    width > 0,
  );
  const translateX = pos.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, width - dot)],
  });
  return (
    <Animated.View
      pointerEvents="none"
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      <Animated.View
        style={[style, { opacity: fade, transform: [{ translateX }] }]}
      />
    </Animated.View>
  );
}

/** `grow`: width 0 → 100%. */
export function Grow({
  duration = 1500,
  easing = ease.inOut,
  style,
}: Base & Timed) {
  const v = useValue(0);
  useOnMount(() =>
    Animated.timing(v, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: false,
    }),
  );
  const width = v.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return <Animated.View style={[style, { width }]} />;
}

/** `rule`: scaleX 0 → 1 from the left edge. */
export function Rule({
  duration = 600,
  easing = ease.brand,
  style,
}: Base & Timed) {
  const v = useValue(0);
  useOnMount(() => timing(v, 1, duration, easing));
  return (
    <Animated.View
      style={[
        style,
        { transformOrigin: 'left center', transform: [{ scaleX: v }] },
      ]}
    />
  );
}

/** Animated rotation used by accordion chevrons (`transition: transform .22s ease`). */
export function Rotate({
  open,
  duration = 220,
  style,
  children,
}: Base & { open: boolean; duration?: number }) {
  const v = useValue(open ? 1 : 0);
  useEffect(() => {
    timing(v, open ? 1 : 0, duration, ease.css).start();
  }, [open, duration, v]);
  const rotate = v.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  return (
    <Animated.View style={[style, { transform: [{ rotate }] }]}>
      {children}
    </Animated.View>
  );
}
