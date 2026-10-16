import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { CHAPTERS, LEARN } from '../../lib/catalog';
import { flash } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { gradients } from '../../theme';

const BLURBS: Record<string, string> = {
  'Pit wall angles and collapse warning signs':
    'How to read a pit wall, the batter angles that hold in loose ground, and the cracks and trickles that mean you leave now.',
  'Shoring a shallow shaft with local timber':
    'Building props and lagging from timber you can source locally, spacing them correctly, and checking them each shift.',
  'Air, water and heat: knowing when to stop':
    'Recognising bad air and heat stress underground, testing before you descend, and the rules for pumping and ventilation.',
  'Mercury-free processing basics':
    'Gravity and borax methods that recover gold without mercury, and why buyers pay more for mercury-free material.',
  'Protective equipment on a small site':
    'The minimum kit for a small operation, how to make it last, and the injuries each item actually prevents.',
  'First aid for crush and cut injuries':
    'Controlling bleeding, immobilising a crush injury, and moving a casualty off a site without making it worse.',
};

const OUTLINES = {
  safety: [
    ['Why this matters on a small site', '00:00'],
    ['What to look for', '01:10'],
    ['Doing it step by step', '02:40'],
    ['When to stop work', '04:05'],
  ],
  trade: [
    ['What this covers', '00:00'],
    ['The detail', '00:48'],
    ['Common mistakes', '01:35'],
    ['What to do next', '02:20'],
  ],
};

/** E3 · Lesson player — 16:9 player, play button and chapter timestamps. */
export function LessonPlayerScreen() {
  const { catIdx, lessonIdx, chapter } = useApp(s => ({
    catIdx: s.catIdx,
    lessonIdx: s.lessonIdx,
    chapter: s.chapter,
  }));
  const sec = LEARN[catIdx] ?? LEARN[0];
  const li = Math.min(lessonIdx, sec.lessons.length - 1);
  const lesson = sec.lessons[li];
  const chapters = sec.group === 'miner' ? OUTLINES.safety : OUTLINES.trade;
  // The design labels the player with the reference lesson's timestamps.
  const label =
    CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)].time + ' · 2:48';

  return (
    <ScreenContainer screen="lPlayer" contentStyle={styles.content}>
      <View style={styles.player}>
        <View style={styles.stage}>
          <PressableScale
            onPress={() => flash('Playing · Weighing and pricing your lot')}
            accessibilityLabel="Play lesson"
            style={styles.play}
          >
            <Icon name="play" filled size={26} color="#1e2a5a" />
          </PressableScale>
          <View style={styles.time}>
            <Text style={styles.timeText}>{label}</Text>
          </View>
          <View style={styles.fullscreen}>
            <Icon name="fullscreen" size={18} color="rgba(255,255,255,0.86)" />
          </View>
        </View>
        <View style={styles.progress}>
          <View
            style={[styles.progressFill, { width: `${chapter * 24 + 4}%` }]}
          />
        </View>
      </View>
      <View style={styles.body}>
        <SectionLabel>
          {sec.label + ' · LESSON ' + (li + 1) + ' OF ' + sec.lessons.length}
        </SectionLabel>
        <Text style={styles.title} leading={1.3}>
          {lesson.name}
        </Text>
        <Text style={styles.blurb} leading={1.6}>
          {BLURBS[lesson.name] ??
            'A short walkthrough with the practical steps, the mistakes people make, and what to do next.'}
        </Text>
        <SectionLabel style={styles.label}>CHAPTERS</SectionLabel>
        <View style={styles.chapters}>
          {chapters.map(([name, time], i) => {
            const on = chapter === i;
            return (
              <PressableScale
                key={name}
                onPress={() => setAppState({ chapter: i })}
                accessibilityState={{ selected: on }}
                style={[
                  styles.chapter,
                  { borderColor: on ? '#1e2a5a' : '#e5e7ec' },
                ]}
              >
                <View
                  style={[
                    styles.chapterIcon,
                    { backgroundColor: on ? '#1e2a5a' : '#f0f2f6' },
                  ]}
                >
                  <Icon
                    name="play"
                    filled
                    size={15}
                    color={on ? '#fff' : '#1e2a5a'}
                  />
                </View>
                <Text style={styles.chapterName}>{name}</Text>
                <Text style={styles.chapterTime}>{time}</Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 26 },
  player: {
    marginHorizontal: 20,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#10163a',
    boxShadow: '0 12px 26px rgba(14,20,48,0.24)',
  },
  stage: {
    aspectRatio: 16 / 9,
    experimental_backgroundImage: gradients.navyPlayer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(16,24,40,0.30)',
  },
  time: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(14,20,48,0.72)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  fullscreen: { position: 'absolute', right: 12, bottom: 12 },
  progress: { height: 3, backgroundColor: 'rgba(255,255,255,0.18)' },
  progressFill: {
    height: '100%',
    experimental_backgroundImage: gradients.goldBar,
  },
  body: { paddingTop: 18, paddingHorizontal: 22 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 7,
    letterSpacing: -0.4,
  },
  blurb: { fontSize: 13.5, color: '#4a5170', marginTop: 10 },
  label: { marginTop: 22, marginHorizontal: 2, marginBottom: 11 },
  chapters: { gap: 9 },
  chapter: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  chapterIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterName: { flex: 1, fontSize: 13.5, fontWeight: '700', color: '#1a1f36' },
  chapterTime: { fontSize: 12.5, fontWeight: '600', color: '#8890ad' },
});
