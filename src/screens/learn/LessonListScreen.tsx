import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import { SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LEARN } from '../../lib/catalog';
import { lessonIsDone } from '../../learn/progress';
import { go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { LessonRow } from '../../components/learn/LessonRow';

const BLURB: Record<string, string> = {
  'GETTING STARTED': 'What Mineral Bridge does and how to set your account up.',
  'SELLING SAFELY':
    'Avoid underpayment, unsafe handover and unlicensed buyers.',
  'QUALITY & GRADING':
    'Read an assay, understand purity and grade your own lot.',
  'COMPLIANCE & DOCUMENTATION':
    'Which permits you need and how to keep them current.',
  'SAFE MINING · FOR ARTISANAL MINERS':
    'Work a small site without getting hurt: ground support, air, mercury and first aid.',
  'USING AUCTIONS': 'Bid on bulk consignments and set a reserve that holds.',
};

/** "SELLING SAFELY" → "Selling Safely". */
const titleCase = (label: string) =>
  label.split(' · ')[0].replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase());

/** E2 · Lesson list — category progress and duration tags. */
export function LessonListScreen() {
  const { catIdx, doneLessons } = useApp(s => ({
    catIdx: s.catIdx,
    doneLessons: s.doneLessons,
  }));
  const sec = LEARN[catIdx] ?? LEARN[0];
  const flags = sec.lessons.map((lesson, i) =>
    lessonIsDone(catIdx, i, lesson.done, doneLessons),
  );
  const total = sec.lessons.length;
  const done = flags.filter(Boolean).length;
  const nextIdx = flags.findIndex(finished => !finished);
  return (
    <ScreenContainer screen="lList" contentStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{titleCase(sec.label)}</Text>
        <Text style={styles.blurb} leading={1.5}>
          {BLURB[sec.label] ?? ''}
        </Text>
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round((done / total) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progress}>{done + ' of ' + total}</Text>
        </View>
      </View>
      <SectionLabel style={styles.label}>
        {total + (total === 1 ? ' LESSON' : ' LESSONS')}
      </SectionLabel>
      <View style={styles.lessons}>
        {sec.lessons.map((l, i) => {
          const finished = flags[i];
          const next = i === nextIdx;
          return (
            <LessonRow
              key={l.name}
              name={l.name}
              dur={l.dur}
              done={finished}
              state={finished ? 'Completed' : next ? 'Up next' : 'Not started'}
              stateFg={finished ? '#15803d' : next ? '#2563eb' : '#8890ad'}
              thumb={
                <View
                  style={[
                    styles.thumb,
                    {
                      backgroundColor: finished
                        ? '#e8f4ec'
                        : next
                        ? '#1e2a5a'
                        : '#f1f2f6',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.thumbText,
                      { color: finished ? '#15803d' : next ? '#fff' : '#8890ad' },
                    ]}
                  >
                    {String(i + 1)}
                  </Text>
                </View>
              }
              onPress={() => {
                setAppState({ lessonIdx: i });
                go('lPlayer');
              }}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 26 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: shadows.xs,
  },
  title: { fontSize: 16.5, fontWeight: '600', color: '#1a1f36' },
  blurb: { fontSize: 12.5, color: '#606780', marginTop: 5 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f2f6',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#1e2a5a', borderRadius: 9999 },
  progress: { fontSize: 11.5, fontWeight: '600', color: '#606780' },
  label: { marginTop: 20, marginHorizontal: 2, marginBottom: 11 },
  lessons: { gap: 10 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: { fontSize: 15, fontWeight: '600' },
});
