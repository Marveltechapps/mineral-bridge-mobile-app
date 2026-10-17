import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp, ease } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { IconTile, Photo, Scrim } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { go, jump } from '../../navigation/flow';
import { setAppState } from '../../context/appStore';
import { ms } from '../../utils/style';

const POINTS = [
  {
    title: 'Every lot assayed on intake',
    sub: 'Origin, grade and weight confirmed before resale.',
    icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
    delay: '.08s',
  },
  {
    title: 'We buy it from you directly',
    sub: 'Free evaluation at your site, paid within 24 hours.',
    icon: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 10h.01',
    delay: '.16s',
  },
  {
    title: 'No waiting for a buyer',
    sub: 'Mineral Bridge owns the stock it sells.',
    icon: 'M3 9h18v11H3zM3 9l2-5h14l2 5M12 4v5',
    delay: '.24s',
  },
];

/** 0.2 · Welcome — sign up or log in, or look around first. */
export function WelcomeScreen() {
  const browseGuest = () => {
    setAppState({ guest: true });
    jump('intro');
  };
  return (
    <ScreenContainer screen="welcome" contentStyle={styles.content}>
      <FadeUp duration={500} easing={ease.out} style={styles.heroShadow}>
        <Photo
          name="hero-grain"
          style={styles.hero}
          imageStyle={styles.heroImage}
          fit="cover"
        >
          <Scrim
            gradient="linear-gradient(180deg,rgba(14,20,48,0.30) 0%,rgba(14,20,48,0.55) 52%,rgba(14,20,48,0.95) 100%)"
            style={styles.heroImage}
          />
          <View style={styles.heroText}>
            <Text style={styles.kicker}>VERIFIED B2B MINERAL TRADE</Text>
            <View style={styles.headline}>
              <Text style={styles.headlineText} leading={1.18}>
                We buy your minerals.
              </Text>
              <GradientText style={[styles.headlineText, styles.headlineGold]}>
                You get paid fast.
              </GradientText>
            </View>
          </View>
        </Photo>
      </FadeUp>
      <View style={styles.body}>
        <View style={styles.buttons}>
          <PressableScale onPress={browseGuest} style={styles.ghostButton}>
            <Icon name="eye" size={17} color="#fff" />
            <Text style={styles.ghostLabel}>Browse as guest</Text>
          </PressableScale>
          <PressableScale
            onPress={() => go('intro')}
            style={styles.ghostButton}
          >
            <Icon name="info" size={17} color="#fff" />
            <Text style={styles.ghostLabel}>How it works</Text>
          </PressableScale>
        </View>
        {POINTS.map(p => (
          <FadeUp
            key={p.title}
            duration={500}
            delay={ms(p.delay)}
            easing={ease.out}
            style={styles.point}
          >
            <IconTile
              size={36}
              radius={10}
              bgColor="#f0f2f6"
              color="#1e2a5a"
              d={p.icon}
              iconSize={17}
            />
            <View style={styles.flex}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointSub} leading={1.45}>
                {p.sub}
              </Text>
            </View>
          </FadeUp>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  heroShadow: {
    marginHorizontal: 16,
    borderRadius: 24,
    boxShadow: '0 18px 38px rgba(20,29,64,0.26)',
  },
  hero: {
    height: 328,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0e1430',
  },
  heroImage: { borderRadius: 24 },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#a9b5dd',
  },
  headline: { marginTop: 8 },
  headlineText: {
    fontSize: 27,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 27 * 1.18,
  },
  headlineGold: { fontStyle: 'italic', fontWeight: '700' },
  body: { paddingTop: 22, paddingHorizontal: 22, gap: 14 },
  buttons: { flexDirection: 'row', gap: 10 },
  ghostButton: {
    flex: 1,
    height: 50,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostLabel: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
  point: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  flex: { flex: 1 },
  pointTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  pointSub: { fontSize: 12.5, color: '#a9b5dd', marginTop: 2 },
});
