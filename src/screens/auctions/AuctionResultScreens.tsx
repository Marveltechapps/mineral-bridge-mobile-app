import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImageName } from '../../../assets/images';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  InfoNote,
  Photo,
  Pill,
  SectionLabel,
  SuccessHero,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { go } from '../../navigation/flow';
import { shadows } from '../../theme';
import { doneStyles } from '../buyer/OrderDoneScreen';

/** D3 · Auction won — restrained celebration and the escrow note. */
export function AuctionWonScreen() {
  return (
    <ScreenContainer screen="aWon" contentStyle={doneStyles.content}>
      <SuccessHero />
      <Text style={doneStyles.title}>You won this lot</Text>
      <Text style={doneStyles.sub} leading={1.55}>
        Your bid of <Text style={doneStyles.bold}>$49,800</Text> took Lot
        MB-A-2214. Delivery details are next.
      </Text>
      <View style={styles.lotCard}>
        <Photo name="cat-critical" style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.lotName}>Cobalt Hydroxide</Text>
          <Text style={styles.lotSub}>18 tonnes · 30% Co · Kolwezi</Text>
          <Pill
            label="WON · 8 SEP 2026"
            bgColor="#edf7f1"
            border="#cfe7d8"
            fg="#15803d"
            size={10}
            padV={4}
            padH={9}
            style={styles.status}
          />
        </View>
      </View>
      <InfoNote style={styles.note}>
        Payment is held in escrow and released only after you confirm the
        delivered assay.
      </InfoNote>
    </ScreenContainer>
  );
}

const SIMILAR: { name: string; sub: string; img: ImageName }[] = [
  {
    name: 'Cobalt Concentrate',
    sub: 'Opens in 2 days · 22 t',
    img: 'cat-critical',
  },
  {
    name: 'Nickel Sulphate',
    sub: 'Opens in 4 days · 30 t',
    img: 'cat-industrial',
  },
];

/** D4 · Auction lost — reached from the Ended tab or a losing close. */
export function AuctionLostScreen() {
  return (
    <ScreenContainer screen="aLost" contentStyle={doneStyles.content}>
      <View style={styles.endedOuter}>
        <View style={styles.endedInner}>
          <Icon name="clock" size={28} color="#8890ad" strokeWidth={2.2} />
        </View>
      </View>
      <Text style={doneStyles.title}>Auction ended</Text>
      <Text style={doneStyles.sub} leading={1.55}>
        This lot sold for <Text style={doneStyles.bold}>$52,400</Text>. Similar
        cobalt lots open most weeks.
      </Text>
      <View style={styles.lotCard}>
        <Photo name="cat-critical" style={styles.thumb} dim={0.75} />
        <View style={styles.flex}>
          <Text style={styles.lotName}>Cobalt Hydroxide</Text>
          <Text style={styles.lotSub}>Your last bid $49,800</Text>
          <Pill
            label="ENDED · 8 SEP 2026"
            bgColor="#f2f3f6"
            border="#e4e6eb"
            fg="#606780"
            size={10}
            padV={4}
            padH={9}
            style={styles.status}
          />
        </View>
      </View>
      <View style={styles.soon}>
        <SectionLabel style={styles.soonLabel}>OPENING SOON</SectionLabel>
        <View style={styles.soonList}>
          {SIMILAR.map(s => (
            <PressableScale
              key={s.name}
              onPress={() => go('aDetail')}
              style={styles.similar}
            >
              <Photo name={s.img} style={styles.similarThumb} />
              <View style={styles.flex}>
                <Text style={styles.similarName}>{s.name}</Text>
                <Text style={styles.similarSub}>{s.sub}</Text>
              </View>
              <Icon name="chevronRight" size={17} color="#b9c0d6" />
            </PressableScale>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lotCard: {
    marginTop: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    boxShadow: shadows.cardRaised,
  },
  thumb: { width: 60, height: 60, borderRadius: 11 },
  lotName: { fontSize: 15.5, fontWeight: '600', color: '#1a1f36' },
  lotSub: { fontSize: 12.5, color: '#6b7290', marginTop: 3 },
  status: { alignSelf: 'flex-start', marginTop: 7 },
  note: { marginTop: 14 },
  endedOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: 'center',
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endedInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#dfe2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soon: { marginTop: 16 },
  soonLabel: { marginBottom: 11 },
  soonList: { gap: 10 },
  similar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.hairline,
  },
  similarThumb: { width: 48, height: 48, borderRadius: 10 },
  similarName: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  similarSub: {
    fontSize: 12,
    color: '#8890ad',
    marginTop: 2,
    fontWeight: '600',
  },
});
