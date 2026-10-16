import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import {
  SectionLabel,
  StatusTimeline,
  SuccessNote,
  type StatusStep,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash } from '../../navigation/flow';
import { shadows } from '../../theme';
import { EvaluatorCard } from '../../components/sell/EvaluatorCard';
import { LivePill, NavyHero } from '../../components/sell/NavyHero';
import { shrink } from '../../utils/style';
import { useEstimate } from '../../lib/hooks/useEstimate';

/** C7 · Evaluation live — on-site progress, evaluator contact and offer ETA. */
export function EvaluationScreen() {
  const { qty, unitShort } = useEstimate();
  const steps: StatusStep[] = (
    [
      {
        title: 'Evaluator dispatched',
        sub: 'Emeka left the Ilesha office at 09:05.',
        time: '09:05',
        state: 'done',
      },
      {
        title: 'Arrived on site',
        sub: 'Checked in at Ilesha Lease Site 4.',
        time: '10:02',
        state: 'done',
      },
      {
        title: 'Weighing complete',
        sub:
          'Gross ' +
          qty +
          ' ' +
          unitShort +
          ', tare deducted and photographed.',
        time: '10:24',
        state: 'done',
      },
      {
        title: 'Fire assay running',
        sub: 'Sample drawn and under test. Around 90 minutes.',
        time: 'Now',
        state: 'active',
      },
      {
        title: 'Firm offer issued',
        sub: 'Sent to your phone the moment the assay clears.',
        time: 'By 16:30',
        state: 'pending',
      },
    ] as const
  ).map((e, i, arr) => ({
    title: e.title,
    sub: e.sub,
    time: e.time,
    done: e.state === 'done',
    pending: e.state === 'pending',
    active: e.state === 'active',
    bg: e.state === 'done' ? '#16a34a' : '#fff',
    border:
      e.state === 'done'
        ? '#16a34a'
        : e.state === 'active'
        ? '#1e2a5a'
        : '#e2e5ec',
    line:
      i === arr.length - 1
        ? 'transparent'
        : e.state === 'done'
        ? '#bbf7d0'
        : '#e2e5ec',
    titleFg: e.state === 'pending' ? '#8890ad' : '#1a1f36',
  }));

  return (
    <ScreenContainer screen="sEval" contentStyle={styles.content}>
      <NavyHero>
        <View style={styles.heroRow}>
          <View style={shrink}>
            <Text style={styles.kicker}>REQUEST MB-S-90412</Text>
            <Text style={styles.heroTitle}>Evaluation in progress</Text>
            <Text style={styles.heroSub}>Offer expected by 16:30 today</Text>
          </View>
          <LivePill
            label="ON SITE"
            bg="rgba(243,210,122,0.18)"
            border="rgba(243,210,122,0.38)"
            fg="#f3d27a"
            dot="#f3d27a"
          />
        </View>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
      </NavyHero>
      <EvaluatorCard
        style={styles.evaluator}
        subtitle="Certified evaluator · 412 evaluations"
        onCall={() => flash('Calling Emeka Balogun…')}
      />
      <SectionLabel style={styles.label}>LIVE PROGRESS</SectionLabel>
      <View style={styles.card}>
        <StatusTimeline
          steps={steps}
          nodeRadius={13}
          lineMin={15}
          gap={17}
          titleSize={13.5}
        />
      </View>
      <SuccessNote checkRadius={11} style={styles.note}>
        The lot stays with you throughout. Nothing moves until you accept an
        offer.
      </SuccessNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#a9b5dd',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 5,
    letterSpacing: -0.4,
  },
  heroSub: { fontSize: 12.5, color: '#c3cbe8', marginTop: 4 },
  track: {
    marginTop: 16,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  fill: {
    width: '62%',
    height: '100%',
    borderRadius: 3,
    experimental_backgroundImage: 'linear-gradient(90deg,#f7dd8e,#c8962f)',
  },
  evaluator: { marginTop: 14 },
  label: { marginTop: 22, marginHorizontal: 2, marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 17,
    boxShadow: shadows.xs,
  },
  note: { marginTop: 14 },
});
