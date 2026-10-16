import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Rule } from '../../components/common/animations';
import { Text } from '../../components/common/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { gradients } from '../../theme';
import { ExplainerVideo } from '../../components/auth/ExplainerVideo';
import { IntroTopics } from '../../components/auth/IntroTopics';

/** 0.8 · How it works — explainer video plus four topics; open to guests. */
export function IntroScreen() {
  return (
    <ScreenContainer screen="intro" contentStyle={styles.content}>
      <View style={styles.video}>
        <ExplainerVideo />
      </View>
      <View style={styles.guide}>
        <View style={styles.guideHead}>
          <Rule style={styles.rule} />
          <Text style={styles.guideLabel}>IN THIS GUIDE</Text>
        </View>
        <Text style={styles.guideText} leading={1.5}>
          Four short topics. Tap any one to open it — the video above covers the
          same ground.
        </Text>
      </View>
      <IntroTopics />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingBottom: 22 },
  video: { paddingHorizontal: 20, paddingBottom: 18 },
  guide: { paddingHorizontal: 20, paddingBottom: 4 },
  guideHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  rule: {
    width: 22,
    height: 3,
    borderRadius: 2,
    experimental_backgroundImage: gradients.goldBar,
  },
  guideLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#a9b5dd',
  },
  guideText: { fontSize: 12.5, color: '#c3cbe8', marginTop: 5 },
});
