import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp } from '../../components/common/animations';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { IconTile, Pill, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LEARN } from '../../lib/catalog';
import { lessonIsDone } from '../../learn/progress';
import { go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { bg } from '../../utils/style';
import { LessonRow } from '../../components/learn/LessonRow';

const sectionIdx = (miner: boolean) =>
  LEARN.map((s, i) => [s, i] as const)
    .filter(([s]) => (s.group === 'miner') === miner)
    .map(([, i]) => i);

const GROUPS = [
  {
    key: 'miner' as const,
    label: 'For miners',
    title: 'Safe mining',
    sub: 'For artisanal and small-scale miners',
    icon: 'M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6zM9.2 12.2l2 2 3.6-4',
    bandBg: 'linear-gradient(135deg,#2c3c6b,#1a2450)',
    bandBorder: '#16204a',
    iconBg: 'rgba(243,210,122,0.18)',
    iconFg: '#f3d27a',
    titleFg: '#fff',
    subFg: '#a9b5dd',
    pillBg: 'rgba(255,255,255,0.12)',
    pillBorder: 'rgba(255,255,255,0.22)',
    pillFg: '#fff',
    idx: sectionIdx(true),
  },
  {
    key: 'trade' as const,
    label: 'Trading',
    title: 'Trading on Mineral Bridge',
    sub: 'Selling, grading, compliance and auctions',
    icon: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6',
    bandBg: '#fff',
    bandBorder: '#e5e7ec',
    iconBg: '#f1f3f7',
    iconFg: '#33406e',
    titleFg: '#1a1f36',
    subFg: '#606780',
    pillBg: '#f1f3f7',
    pillBorder: '#e2e5ec',
    pillFg: '#33406e',
    idx: sectionIdx(false),
  },
];

/** E1 · Learning Center — safety and trading tracks with per-track progress. */
export function LearnHomeScreen() {
  const { learnTab, doneLessons } = useApp(s => ({
    learnTab: s.learnTab,
    doneLessons: s.doneLessons,
  }));
  const tally = (idx: number[]) => ({
    total: idx.reduce((n, i) => n + LEARN[i].lessons.length, 0),
    done: idx.reduce(
      (n, i) =>
        n +
        LEARN[i].lessons.filter((lesson, lessonIdx) =>
          lessonIsDone(i, lessonIdx, lesson.done, doneLessons),
        ).length,
      0,
    ),
  });
  const active = GROUPS.find(g => g.key === learnTab) ?? GROUPS[0];
  const at = tally(active.idx);

  return (
    <ScreenContainer screen="lHome" contentStyle={styles.content}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {GROUPS.map(g => {
          const t = tally(g.idx);
          const on = g.key === active.key;
          return (
            <PressableScale
              key={g.key}
              activeScale={0.98}
              onPress={() => setAppState({ learnTab: g.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.tab, on ? styles.tabOn : null]}
            >
              <Text
                style={[styles.tabLabel, { color: on ? '#1e2a5a' : '#606780' }]}
              >
                {g.label}
              </Text>
              <Text
                style={[styles.tabCount, { color: on ? '#8890ad' : '#a3abc4' }]}
              >
                {t.done + ' of ' + t.total}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <FadeUp
        duration={400}
        style={[
          styles.band,
          bg(active.bandBg),
          { borderColor: active.bandBorder },
        ]}
      >
        <IconTile
          size={36}
          radius={10}
          bgColor={active.iconBg}
          color={active.iconFg}
          d={active.icon}
          iconSize={18}
        />
        <View style={styles.flex}>
          <Text style={[styles.bandTitle, { color: active.titleFg }]}>
            {active.title}
          </Text>
          <Text style={[styles.bandSub, { color: active.subFg }]} leading={1.4}>
            {active.sub}
          </Text>
        </View>
        <Pill
          label={at.done + ' / ' + at.total}
          bgColor={active.pillBg}
          border={active.pillBorder}
          fg={active.pillFg}
          padV={4}
          padH={9}
        />
      </FadeUp>

      {active.idx.map(si => {
        const sec = LEARN[si];
        return (
          <View key={sec.label} style={styles.section}>
            <View style={styles.sectionHead}>
              <SectionLabel>{sec.label}</SectionLabel>
              <PressableScale
                onPress={() => {
                  setAppState({ catIdx: si });
                  go('lList');
                }}
                accessibilityRole="link"
              >
                <Text style={styles.count}>
                  {sec.lessons.length +
                    (sec.lessons.length === 1 ? ' lesson' : ' lessons')}
                </Text>
              </PressableScale>
            </View>
            <View style={styles.lessons}>
              {sec.lessons.map((l, li) => {
                const finished = lessonIsDone(si, li, l.done, doneLessons);
                return (
                <LessonRow
                  key={l.name}
                  name={l.name}
                  dur={l.dur}
                  done={finished}
                  state={finished ? 'Completed' : 'Not started'}
                  stateFg={finished ? '#15803d' : '#606780'}
                  thumb={
                    <IconTile
                      size={48}
                      radius={10}
                      bgColor={finished ? '#e8f4ec' : '#f0f2f6'}
                      color={finished ? '#15803d' : '#33406e'}
                      d={l.icon}
                      iconSize={20}
                    />
                  }
                  onPress={() => {
                    setAppState({ catIdx: si, lessonIdx: li });
                    go('lPlayer');
                  }}
                />
                );
              })}
            </View>
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 2, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  tabs: {
    marginTop: 2,
    backgroundColor: '#f0f2f6',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 46,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tabOn: {
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(16,24,40,0.12)',
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  tabCount: { fontSize: 10, fontWeight: '600' },
  band: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bandTitle: { fontSize: 14.5, fontWeight: '600' },
  bandSub: { fontSize: 11.5, marginTop: 2 },
  section: { marginTop: 18 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    marginBottom: 11,
  },
  count: { fontSize: 12.5, fontWeight: '700', color: '#2563eb' },
  lessons: { gap: 10 },
});
