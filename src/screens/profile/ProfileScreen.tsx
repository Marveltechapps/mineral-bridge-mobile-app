import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { IconTile, Photo, Pill, Scrim } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS, LEARN } from '../../lib/catalog';
import { go } from '../../navigation/flow';
import type { ScreenId } from '../../navigation/types';
import { setAppState, useApp, type AppState } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { GroupHeader } from '../../components/profile/GroupHeader';

const STATS = [
  { value: '12', label: 'SELL REQUESTS', delay: 50 },
  { value: '$48.5K', label: 'TOTAL SALES', delay: 120 },
  { value: '3', label: 'ACTIVE BIDS', delay: 190 },
];

const LEARN_TOTAL = LEARN.reduce((n, s) => n + s.lessons.length, 0);
const LEARN_DONE = LEARN.reduce(
  (n, s) => n + s.lessons.filter(l => l.done).length,
  0,
);

type Row = {
  label: string;
  sub: string;
  icon: string;
  iconBg: string;
  iconFg: string;
  badge?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeFg?: string;
  onPress: () => void;
};

const navy = { iconBg: '#f1f3f7', iconFg: '#33406e' };
const gold = { iconBg: '#f8f2e3', iconFg: '#8a6a1c' };
const blue = { iconBg: '#eef3fe', iconFg: '#1d4fd7' };
const to = (s: ScreenId) => () => go(s);

function groups(
  kyc: AppState['kyc'],
): { label: string; rule: string; delay: number; rows: Row[] }[] {
  const verified = kyc === 'verified';
  const pending = kyc === 'pending';
  return [
    {
      label: 'TRADING',
      rule: 'linear-gradient(90deg,#f7dd8e,#c8962f)',
      delay: 60,
      rows: [
        {
          label: 'My orders',
          sub: '2 active · 1 delivered',
          icon: 'M6 2h12l2 5H4zM4 7v13h16V7M9 11h6',
          ...gold,
          onPress: to('orders'),
        },
        {
          label: 'My sell requests',
          sub: '1 evaluating · 1 offer ready',
          icon: 'M4 6h16M4 12h16M4 18h10',
          ...gold,
          badge: 'OFFER READY',
          badgeBg: '#f8f2e3',
          badgeBorder: '#eddfc0',
          badgeFg: '#8a6a1c',
          onPress: () => {
            setAppState({ orderTab: 'selling' });
            go('orders');
          },
        },
        {
          label: 'Auctions',
          sub: '12 live lots · bid on bulk consignments',
          icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
          ...gold,
          badge: 'LIVE',
          badgeBg: '#fdeeee',
          badgeBorder: '#f3d4d4',
          badgeFg: '#c0392b',
          onPress: () => {
            setAppState({ aucTab: 'live' });
            go('aList');
          },
        },
        {
          label: 'My bids',
          sub: '3 active · 1 won this week',
          icon: 'M14 3.5 20.5 10 17 13.5 10.5 7zM10.5 7 4 13.5V20h6.5L17 13.5',
          ...gold,
          onPress: to('aList'),
        },
        {
          label: 'Payouts',
          sub: '$48,500 available to withdraw',
          icon: 'M3 9h18v11H3zM3 9l2-5h14l2 5M12 4v5',
          ...gold,
          onPress: to('payout'),
        },
      ],
    },
    {
      label: 'ACCOUNT',
      rule: 'linear-gradient(90deg,#2c3c6b,#1a2450)',
      delay: 130,
      rows: [
        {
          label: 'Identity check (KYC)',
          sub: verified
            ? 'Verified 6 Sep 2026'
            : pending
            ? 'Submitted, awaiting approval'
            : 'Required before trading',
          icon: 'M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6zM9.2 12.2l2 2 3.6-4',
          ...navy,
          badge: verified ? 'VERIFIED' : pending ? 'IN REVIEW' : 'REQUIRED',
          badgeBg: verified ? '#edf7f1' : pending ? '#fbf3e4' : '#fdeeee',
          badgeBorder: verified ? '#cfe7d8' : pending ? '#eddfc0' : '#f3d4d4',
          badgeFg: verified ? '#15803d' : pending ? '#a1620b' : '#c0392b',
          onPress: to(kyc === 'none' ? 'kycStart' : 'kycPending'),
        },
        {
          label: 'My documents',
          sub: '4 on file · 1 expiring soon',
          icon: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
          ...navy,
          badge: '1 EXPIRING',
          badgeBg: '#fbf3e4',
          badgeBorder: '#eddfc0',
          badgeFg: '#a1620b',
          onPress: to('docs'),
        },
        {
          label: 'Notifications',
          sub: '3 unread',
          icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0',
          ...navy,
          onPress: to('notifs'),
        },
        {
          label: 'Change your tier',
          sub: 'Buying and selling are both open to you',
          icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
          ...navy,
          onPress: to('tier'),
        },
      ],
    },
    {
      label: 'HELP & MORE',
      rule: 'linear-gradient(90deg,#4c8bf5,#1d4fd7)',
      delay: 200,
      rows: [
        {
          label: 'Help & support',
          sub: 'Chat, call, FAQ and tickets',
          icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.2 9.5a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.2-2.8 4M12 17.5h.01',
          ...blue,
          onPress: to('support'),
        },
        {
          label: 'How Mineral Bridge works',
          sub: 'Video guide and four topics',
          icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8.5v7l6-3.5z',
          ...blue,
          onPress: () => {
            setAppState({ introOpen: 0 });
            go('intro');
          },
        },
        {
          label: 'Learning Center',
          sub: LEARN_DONE + ' of ' + LEARN_TOTAL + ' lessons complete',
          icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 5.5V21h16',
          ...blue,
          onPress: to('lHome'),
        },
        {
          label: 'Settings',
          sub: 'Alerts, language, security',
          icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2 2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9 2 2 0 1 1 0 4z',
          ...blue,
          onPress: to('settings'),
        },
      ],
    },
  ];
}

/** Profile — identity hero, account tier and grouped account rows. */
export function ProfileScreen() {
  const { kyc, tierIdx } = useApp(s => ({ kyc: s.kyc, tierIdx: s.tierIdx }));
  const tier = ACCOUNT_TIERS[tierIdx];
  const chip =
    kyc === 'verified'
      ? {
          bg: 'rgba(34,197,94,0.18)',
          border: 'rgba(134,239,172,0.4)',
          fg: '#86efac',
          label: 'KYC VERIFIED',
          icon: 'M20 6L9 17l-5-5',
        }
      : kyc === 'pending'
      ? {
          bg: 'rgba(243,210,122,0.20)',
          border: 'rgba(243,210,122,0.42)',
          fg: '#f3d27a',
          label: 'KYC IN REVIEW',
          icon: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
        }
      : {
          bg: 'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.24)',
          fg: '#c3cbe8',
          label: 'KYC REQUIRED',
          icon: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
        };

  return (
    <ScreenContainer screen="profile" contentStyle={styles.content}>
      <View style={styles.heroShadow}>
        <Photo name="hero-grain" style={styles.hero} imageStyle={styles.r14}>
          <Scrim gradient="linear-gradient(160deg,rgba(14,20,48,0.72),rgba(20,29,64,0.94))" />
          <View style={styles.heroBody}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AO</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name}>Adaeze Okafor</Text>
                <Text style={styles.phone}>+234 802 441 9087</Text>
                <Pill
                  label={chip.label}
                  bgColor={chip.bg}
                  border={chip.border}
                  fg={chip.fg}
                  size={10}
                  padV={4}
                  padH={9}
                  style={styles.kyc}
                >
                  <Icon
                    d={chip.icon}
                    size={10}
                    color={chip.fg}
                    strokeWidth={3}
                  />
                </Pill>
              </View>
              <PressableScale
                activeScale={0.94}
                onPress={() => go('editProfile')}
                accessibilityLabel="Edit profile"
                style={styles.edit}
              >
                <Icon name="edit" size={16} color="#fff" />
              </PressableScale>
            </View>
            <View style={styles.stats}>
              {STATS.map(st => (
                <FadeUp
                  key={st.label}
                  duration={500}
                  delay={st.delay}
                  style={styles.stat}
                >
                  <Text style={styles.statValue}>{st.value}</Text>
                  <Text style={styles.statLabel}>{st.label}</Text>
                </FadeUp>
              ))}
            </View>
          </View>
        </Photo>
      </View>

      <PressableScale
        activeScale={0.985}
        onPress={() => go('tier')}
        style={styles.tier}
      >
        <IconTile
          size={38}
          radius={11}
          bgColor={tier.iconBg}
          color={tier.iconFg}
          d={tier.icon}
          iconSize={18}
        />
        <View style={styles.flex}>
          <Text style={styles.tierLabel}>ACCOUNT TIER</Text>
          <Text style={styles.tierName} leading={1.25}>
            {tier.short}
          </Text>
        </View>
        <Pill
          label={tier.tag}
          bgColor={tier.tagBg}
          border={tier.tagBorder}
          fg={tier.tagFg}
          weight="700"
          spacing={0.5}
          padV={4}
          padH={9}
        />
        <Icon name="chevronRight" size={16} color="#b9c0d6" />
      </PressableScale>

      {groups(kyc).map(g => (
        <FadeUp
          key={g.label}
          duration={500}
          delay={g.delay}
          style={styles.group}
        >
          <View style={styles.groupHead}>
            <GroupHeader label={g.label} rule={g.rule} />
          </View>
          <View style={styles.card}>
            {g.rows.map(r => (
              <PressableScale
                key={r.label}
                activeScale={0.985}
                onPress={r.onPress}
                style={styles.row}
              >
                <IconTile
                  size={34}
                  radius={10}
                  bgColor={r.iconBg}
                  color={r.iconFg}
                  d={r.icon}
                  iconSize={17}
                />
                <View style={styles.flex}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowSub} leading={1.4}>
                    {r.sub}
                  </Text>
                </View>
                {r.badge ? (
                  <Pill
                    label={r.badge}
                    bgColor={r.badgeBg!}
                    border={r.badgeBorder}
                    fg={r.badgeFg!}
                  />
                ) : null}
                <Icon name="chevronRight" size={17} color="#b9c0d6" />
              </PressableScale>
            ))}
          </View>
        </FadeUp>
      ))}

      <Text style={styles.version}>Mineral Bridge · v2.4.0 (build 316)</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  flex: { flex: 1 },
  r14: { borderRadius: 14 },
  heroShadow: {
    marginHorizontal: 20,
    borderRadius: 14,
    boxShadow: shadows.hero,
  },
  hero: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#0e1430' },
  heroBody: { padding: 18 },
  identity: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 14,
    experimental_backgroundImage: gradients.gold,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(16,24,40,0.24)',
  },
  avatarText: { color: '#3d2c05', fontSize: 19, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  phone: { fontSize: 12.5, color: '#c3cbe8', marginTop: 2 },
  kyc: { alignSelf: 'flex-start', marginTop: 7, gap: 5 },
  edit: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 9, marginTop: 16 },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  statValue: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#a9b5dd',
    marginTop: 3,
  },
  tier: {
    marginTop: 13,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    boxShadow: shadows.hairline,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
  },
  tierName: { fontSize: 15, fontWeight: '600', color: '#1e2a5a', marginTop: 3 },
  group: { marginTop: 20, marginHorizontal: 20 },
  groupHead: { marginHorizontal: 2, marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 2,
    paddingHorizontal: 14,
    boxShadow: shadows.xs,
  },
  row: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  rowSub: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
  version: {
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 11.5,
    color: '#a3abc4',
  },
});
