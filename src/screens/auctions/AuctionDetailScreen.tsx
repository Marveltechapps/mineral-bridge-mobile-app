import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import { Photo, Pill, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { BIDS } from '../../lib/catalog';
import { useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { formatMoney } from '../../utils/format';
import { LivePill } from '../../components/sell/NavyHero';
import { shrink } from '../../utils/style';
import { useCountdown } from '../../lib/hooks/useCountdown';

/** D2 · Auction detail — countdown pinned high, live bid feed, bid sheet. */
export function AuctionDetailScreen() {
  const countdown = useCountdown();
  const bid = useApp(s => s.bid);
  return (
    <ScreenContainer screen="aDetail" contentStyle={styles.content}>
      <View style={styles.heroShadow}>
        <Photo name="cat-critical" style={styles.hero} />
      </View>
      <View style={styles.countdown}>
        <View style={shrink}>
          <Text style={styles.remaining}>TIME REMAINING</Text>
          <Text style={styles.clock}>{countdown}</Text>
        </View>
        <LivePill
          label="LIVE"
          bg="rgba(220,38,38,0.16)"
          fg="#fca5a5"
          dot="#dc2626"
          dotSize={7}
          weight="600"
          size={10.5}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Cobalt Hydroxide</Text>
        <Text style={styles.lot}>Lot MB-A-2214 · 18 tonnes · 30% Co</Text>
        <View style={styles.badges}>
          <Pill
            label="Mineral Bridge Assured"
            bgColor="#edf7f1"
            border="#cfe7d8"
            fg="#15803d"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
            style={styles.gap5}
          >
            <Icon name="check" size={11} color="#15803d" strokeWidth={3} />
          </Pill>
          <Pill
            label="Origin traced"
            bgColor="#f1f3f7"
            border="#e2e5ec"
            fg="#33406e"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
          />
          <Pill
            label="Cobalt Institute"
            bgColor="#fbf3e4"
            border="#eddfc0"
            fg="#a1620b"
            size={11}
            spacing={0}
            padV={6}
            padH={11}
          />
        </View>
        <Text style={styles.paragraph} leading={1.6}>
          Cooperative intake from Kolwezi, dried and bagged in 1-tonne sacks.
          Independent sampling by SGS on 28 August, moisture 8.2%.
        </Text>

        <View style={styles.bids}>
          <View style={shrink}>
            <SectionLabel>CURRENT HIGHEST BID</SectionLabel>
            <GradientText
              block
              style={styles.highest}
              containerStyle={styles.mt4}
            >
              $48,200
            </GradientText>
            <Text style={styles.bidMeta}>14 bids · reserve met</Text>
          </View>
          <View style={styles.yours}>
            <SectionLabel style={styles.right}>YOUR BID</SectionLabel>
            <Text style={styles.yourBid}>{'$' + formatMoney(bid)}</Text>
            <Text style={[styles.bidMeta, styles.right, styles.start]}>
              Start $38,000
            </Text>
          </View>
        </View>

        <View style={styles.historyHead}>
          <SectionLabel>LIVE BID HISTORY</SectionLabel>
          <Text style={styles.auto}>Auto-updating</Text>
        </View>
        <View style={styles.history}>
          {BIDS.map(b => (
            <View
              key={b.name + b.ago}
              style={[
                styles.bidRow,
                { borderColor: b.lead ? '#bbf7d0' : '#e5e7ec' },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: b.lead ? '#dcfce7' : '#f0f2f6' },
                ]}
              >
                <Text
                  style={[
                    styles.initials,
                    { color: b.lead ? '#16a34a' : '#1e2a5a' },
                  ]}
                >
                  {b.initials}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.bidder}>{b.name}</Text>
                <Text style={styles.ago}>{b.ago}</Text>
              </View>
              <Text
                style={[
                  styles.amount,
                  { color: b.lead ? '#16a34a' : '#1a1f36' },
                ]}
              >
                {b.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  flex: { flex: 1 },
  mt4: { marginTop: 4 },
  right: { textAlign: 'right' },
  heroShadow: {
    marginHorizontal: 20,
    borderRadius: 14,
    boxShadow: shadows.media,
  },
  hero: { height: 210, width: '100%', borderRadius: 14 },
  countdown: {
    marginTop: -30,
    marginHorizontal: 20,
    experimental_backgroundImage: gradients.navyCard,
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 18,
    boxShadow: '0 14px 30px rgba(20,29,64,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remaining: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#8f9dcd',
  },
  clock: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 3,
  },
  body: { paddingTop: 18, paddingHorizontal: 22 },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  lot: { fontSize: 13, color: '#6b7290', marginTop: 4, fontWeight: '600' },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 13 },
  gap5: { gap: 5 },
  paragraph: { fontSize: 13.5, color: '#4a5170', marginTop: 15 },
  bids: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: shadows.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  highest: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  bidMeta: { fontSize: 12, color: '#8890ad', fontWeight: '600', marginTop: 3 },
  yours: {
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#f1f2f6',
    alignItems: 'flex-end',
  },
  yourBid: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e2a5a',
    marginTop: 4,
    textAlign: 'right',
  },
  start: { fontSize: 11.5 },
  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginHorizontal: 2,
    marginBottom: 12,
  },
  auto: { fontSize: 12, fontWeight: '700', color: '#8890ad' },
  history: { gap: 9 },
  bidRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.hairline,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 12, fontWeight: '600' },
  bidder: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  ago: { fontSize: 11.5, color: '#8890ad', fontWeight: '600', marginTop: 2 },
  amount: { fontSize: 14.5, fontWeight: '600' },
});
