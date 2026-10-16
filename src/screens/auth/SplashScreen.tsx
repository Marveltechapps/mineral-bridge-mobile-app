import React, { useEffect, useRef } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { images } from '../../../assets/images';
import {
  FadeUp,
  LogoIn,
  Shimmer,
  ease,
} from '../../components/common/animations';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { jump } from '../../navigation/flow';
import { gradients } from '../../theme';

/** 0.1 · Splash — animated brand load; hands off to Welcome after 2s or on tap. */
export function SplashScreen() {
  const done = useRef(false);
  const toWelcome = () => {
    if (done.current) return;
    done.current = true;
    jump('welcome');
  };
  useEffect(() => {
    const t = setTimeout(toWelcome, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PressableScale
      style={styles.root}
      onPress={toWelcome}
      accessibilityLabel="Mineral Bridge. Tap to continue"
    >
      <StatusBar barStyle="light-content" />
      <LogoIn>
        <Image
          source={images['logo-circle']}
          style={styles.logo}
          accessibilityLabel="Mineral Bridge"
        />
      </LogoIn>
      <FadeUp duration={600} delay={280} easing={ease.out}>
        <Text style={styles.tagline}>VERIFIED MINERAL TRADE</Text>
      </FadeUp>
      <View style={styles.loader}>
        <Shimmer width={60} style={styles.shimmer} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0e1430',
    experimental_backgroundImage: gradients.splash,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    overflow: 'hidden',
  },
  logo: {
    width: 186,
    height: 186,
    filter: 'drop-shadow(0px 20px 44px rgba(200,150,47,0.28))',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#8f9dcd',
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    bottom: 64,
    alignSelf: 'center',
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  shimmer: {
    height: '100%',
    borderRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg,transparent,#f3d27a,transparent)',
  },
});
