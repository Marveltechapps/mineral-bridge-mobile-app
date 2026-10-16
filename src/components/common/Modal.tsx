import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, shadows } from '../../theme';
import { ease } from './animations';

/** Dimmed backdrop behind bottom sheets (`fade .18s ease-out`). */
export function Scrim({ onPress }: { onPress: () => void }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 180,
      easing: ease.out,
      useNativeDriver: true,
    }).start();
  }, [v]);
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.scrim, { opacity: v }]}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        accessibilityLabel="Close"
      />
    </Animated.View>
  );
}

/**
 * Bottom sheet that slides up from below (`up .28s cubic-bezier(.2,.8,.2,1)`)
 * with the grab handle. The design uses 26px or 18px top corners.
 */
export function BottomSheet({
  children,
  radius = 26,
  style,
}: {
  children: React.ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const shown = useRef(false);
  return (
    <Animated.View
      accessibilityViewIsModal
      onLayout={e => {
        if (shown.current) return;
        shown.current = true;
        y.setValue(e.nativeEvent.layout.height);
        Animated.timing(y, {
          toValue: 0,
          duration: 280,
          easing: ease.brand,
          useNativeDriver: true,
        }).start();
      }}
      style={[
        styles.sheet,
        {
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          paddingBottom: Math.max(layout.sheetPadding, insets.bottom),
        },
        { transform: [{ translateY: y }] },
        style,
      ]}
    >
      <View style={styles.handle} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: { zIndex: 24, backgroundColor: 'rgba(14,20,48,0.44)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 22,
    boxShadow: shadows.sheet,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#dfe2e9',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
