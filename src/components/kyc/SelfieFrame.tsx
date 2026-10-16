import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Icon } from '../common/Icon';
import { ease } from '../common/animations';

const W = 236;
const H = 296;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * The liveness oval (`border-radius: 118px / 148px`). React Native has no
 * elliptical corner radii, so the oval, its gold guide ring and the clipped
 * scanning line are drawn in SVG; the drop shadow follows the oval's shape.
 */
export function SelfieFrame() {
  const pos = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const D = 2200;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pos, {
          toValue: 1,
          duration: D,
          easing: ease.inOut,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(fade, {
            toValue: 1,
            duration: D * 0.12,
            easing: ease.inOut,
            useNativeDriver: false,
          }),
          Animated.delay(D * 0.76),
          Animated.timing(fade, {
            toValue: 0,
            duration: D * 0.12,
            easing: ease.inOut,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pos, fade]);

  const y = pos.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12 * H, 0.88 * H],
  });

  return (
    <View style={styles.wrap}>
      <Svg width={W} height={H}>
        <Defs>
          {/* linear-gradient(160deg,#1e2a5a,#0e1430) across the 236×296 box */}
          <LinearGradient
            id="selfieBg"
            gradientUnits="userSpaceOnUse"
            x1={W / 2 - 61.37}
            y1={H / 2 - 168.63}
            x2={W / 2 + 61.37}
            y2={H / 2 + 168.63}
          >
            <Stop offset="0" stopColor="#1e2a5a" />
            <Stop offset="1" stopColor="#0e1430" />
          </LinearGradient>
          <LinearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#f3d27a" stopOpacity={0} />
            <Stop offset="0.5" stopColor="#f3d27a" />
            <Stop offset="1" stopColor="#f3d27a" stopOpacity={0} />
          </LinearGradient>
          <ClipPath id="oval">
            <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} />
          </ClipPath>
        </Defs>
        <Ellipse
          cx={W / 2}
          cy={H / 2}
          rx={W / 2}
          ry={H / 2}
          fill="url(#selfieBg)"
        />
        <Ellipse
          cx={W / 2}
          cy={H / 2}
          rx={W / 2 - 14 - 1.5}
          ry={H / 2 - 14 - 1.5}
          fill="none"
          stroke="rgba(243,210,122,0.5)"
          strokeWidth={3}
        />
        <AnimatedRect
          clipPath="url(#oval)"
          x={0}
          y={y}
          width={W}
          height={3}
          fill="url(#scanLine)"
          opacity={fade}
        />
      </Svg>
      <View style={styles.face}>
        <Icon
          name="face"
          size={34}
          color="rgba(255,255,255,0.55)"
          strokeWidth={1.8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: W,
    height: H,
    alignSelf: 'center',
    marginTop: 24,
    filter:
      'drop-shadow(0px 1px 3px rgba(16,24,40,0.12)) drop-shadow(0px 12px 26px rgba(16,24,40,0.16))',
  },
  face: {
    position: 'absolute',
    left: W / 2 - 34,
    top: H / 2 - 34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
