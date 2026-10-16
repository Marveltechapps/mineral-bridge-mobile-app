import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Grid, Photo, SegmentTabs } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AUC_SETS, type AuctionTab } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';

const TABS: { id: AuctionTab; label: string; count: string }[] = [
  { id: 'live', label: 'Live', count: '12' },
  { id: 'upcoming', label: 'Upcoming', count: '5' },
  { id: 'ended', label: 'Ended', count: '38' },
];

const FLAG = {
  live: {
    label: 'LIVE',
    bg: '#dc2626',
    fg: '#fff',
    dot: '#fff',
    timerBg: 'rgba(220,38,38,0.92)',
    bidLabel: 'CURRENT BID',
  },
  upcoming: {
    label: 'SOON',
    bg: 'rgba(255,255,255,0.94)',
    fg: '#a1620b',
    dot: '#c8962f',
    timerBg: 'rgba(14,20,48,0.82)',
    bidLabel: 'STARTING BID',
  },
  ended: {
    label: 'ENDED',
    bg: 'rgba(14,20,48,0.82)',
    fg: '#fff',
    dot: '#8890ad',
    timerBg: 'rgba(14,20,48,0.82)',
    bidLabel: 'SOLD FOR',
  },
} as const;

/** D1 · Auctions list — Live / Upcoming / Ended, with a countdown on each tile. */
export function AuctionListScreen() {
  const aucTab = useApp(s => s.aucTab);
  const f = FLAG[aucTab];
  return (
    <ScreenContainer screen="aList" contentStyle={styles.content}>
      <SegmentTabs
        tabs={TABS}
        value={aucTab}
        onChange={id => setAppState({ aucTab: id })}
        spacing={20}
        pillWeight="600"
        pressScale={0.977}
      />
      <Grid columns={2} gap={13} style={styles.grid}>
        {AUC_SETS[aucTab].map(a => (
          <PressableScale
            key={a.name + a.lot}
            onPress={() => go(aucTab === 'ended' ? 'aLost' : 'aDetail')}
            style={styles.card}
          >
            <Photo name={a.img} style={styles.image}>
              <View style={[styles.flag, { backgroundColor: f.bg }]}>
                <View style={[styles.flagDot, { backgroundColor: f.dot }]} />
                <Text style={[styles.flagText, { color: f.fg }]}>
                  {f.label}
                </Text>
              </View>
              <View style={styles.verified}>
                <Icon
                  name="check"
                  size={12}
                  color="#15803d"
                  strokeWidth={3.2}
                />
              </View>
              <View style={[styles.timer, { backgroundColor: f.timerBg }]}>
                <Icon name="clock" size={11} color="#fff" strokeWidth={2.4} />
                <Text style={styles.timerText}>{a.timer}</Text>
              </View>
            </Photo>
            <View style={styles.body}>
              <Text style={styles.name} leading={1.25}>
                {a.name}
              </Text>
              <Text style={styles.lot}>{a.lot}</Text>
              <Text style={styles.bidLabel}>{f.bidLabel}</Text>
              <GradientText
                block
                style={styles.bid}
                containerStyle={styles.bidBox}
              >
                {a.bid}
              </GradientText>
            </View>
          </PressableScale>
        ))}
      </Grid>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 4, paddingBottom: 26 },
  grid: { paddingTop: 16, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  image: { height: 104 },
  flag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flagDot: { width: 6, height: 6, borderRadius: 3 },
  flagText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.5 },
  verified: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  timerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: { paddingTop: 11, paddingHorizontal: 12, paddingBottom: 13 },
  name: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  lot: { fontSize: 11, color: '#8890ad', fontWeight: '700', marginTop: 5 },
  bidLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
    marginTop: 8,
  },
  bid: { fontSize: 16.5, fontWeight: '700' },
  bidBox: { marginTop: 1 },
});
