import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  DashedBox,
  IconTile,
  Pill,
  RadioDot,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash, go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { formatMoney } from '../../utils/format';

const ACCOUNTS = [
  {
    name: 'GTBank · ••4471',
    sub: 'Adaeze C. Okafor · NGN',
    icon: 'M3 9h18v11H3zM3 9l2-5h14l2 5M12 4v5',
    iconBg: '#f1f3f7',
    iconFg: '#33406e',
    primary: true,
  },
  {
    name: 'Wise · USD balance',
    sub: 'For international settlement',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8',
    iconBg: '#eef3fe',
    iconFg: '#1d4fd7',
    primary: false,
  },
];

const HISTORY = [
  { amount: '$18,400.00', meta: 'GTBank ••4471 · 2 Sep 2026', status: 'PAID' },
  { amount: '$7,250.00', meta: 'GTBank ••4471 · 24 Aug 2026', status: 'PAID' },
  { amount: '$22,850.00', meta: 'Wise USD · 11 Aug 2026', status: 'PAID' },
];

const BALANCE = 48500;

/** P4 · Payouts — balance, payout accounts and recent payouts. */
export function PayoutScreen() {
  const payoutSel = useApp(s => s.payoutSel);
  return (
    <ScreenContainer screen="payout" contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>AVAILABLE TO WITHDRAW</Text>
        <Text style={styles.balance}>$48,500.00</Text>
        <View style={styles.escrow}>
          <View style={styles.escrowDot} />
          <Text style={styles.escrowText}>
            $12,400 in escrow, releases on delivery
          </Text>
        </View>
        <PressableScale onPress={() => go('withdraw')} style={styles.withdraw}>
          <Icon name="download" size={16} color="#2b1f04" strokeWidth={2.2} />
          <Text style={styles.withdrawText}>Withdraw funds</Text>
        </PressableScale>
      </View>

      <SectionLabel style={styles.label20}>PAYOUT ACCOUNTS</SectionLabel>
      <View style={styles.accounts} accessibilityRole="radiogroup">
        {ACCOUNTS.map((a, i) => {
          const sel = payoutSel === i;
          return (
            <PressableScale
              key={a.name}
              activeScale={0.985}
              onPress={() => setAppState({ payoutSel: i })}
              accessibilityRole="radio"
              accessibilityState={{ checked: sel }}
              style={[
                styles.account,
                {
                  borderColor: sel ? '#1e2a5a' : '#e5e7ec',
                  boxShadow: sel ? shadows.selected : shadows.xs,
                },
              ]}
            >
              <IconTile
                size={40}
                radius={11}
                bgColor={a.iconBg}
                color={a.iconFg}
                d={a.icon}
                iconSize={19}
              />
              <View style={styles.flex}>
                <Text style={styles.accountName}>{a.name}</Text>
                <Text style={styles.accountSub}>{a.sub}</Text>
              </View>
              {a.primary ? (
                <Pill
                  label="DEFAULT"
                  bgColor="#edf7f1"
                  border="#cfe7d8"
                  fg="#15803d"
                />
              ) : null}
              <RadioDot
                size={20}
                radius={10}
                dotSize={9}
                dot={sel ? '#1e2a5a' : '#c9cdd8'}
                fill={sel ? '#1e2a5a' : 'transparent'}
              />
            </PressableScale>
          );
        })}
      </View>
      <DashedBox
        onPress={() => flash('Add a payout account')}
        pressScale={0.985}
        style={styles.add}
      >
        <Icon name="plus" size={17} color="#1e2a5a" />
        <Text style={styles.addText}>Add a payout account</Text>
      </DashedBox>

      <SectionLabel style={styles.label22}>RECENT PAYOUTS</SectionLabel>
      <View style={styles.history}>
        {HISTORY.map(p => (
          <View key={p.amount} style={styles.payout}>
            <IconTile
              size={32}
              radius={10}
              bgColor="#edf7f1"
              color="#15803d"
              name="arrowUp"
              iconSize={15}
              strokeWidth={2.4}
            />
            <View style={styles.flex}>
              <Text style={styles.amount}>{p.amount}</Text>
              <Text style={styles.payoutMeta}>{p.meta}</Text>
            </View>
            <Text style={styles.paid}>{p.status}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const PRESETS: [number, string][] = [
  [10000, '$10,000'],
  [25000, '$25,000'],
  [48500, 'All'],
];

/** P4a · Withdraw — amount presets, destination account and fee breakdown. */
export function WithdrawScreen() {
  const wd = useApp(s => s.wd);
  const rows = [
    { k: 'Transfer fee', v: 'Free', fg: '#15803d' },
    { k: 'Arrives', v: 'Within 24 hours', fg: '#1a1f36' },
    {
      k: 'Remaining balance',
      v: '$' + formatMoney(BALANCE - wd) + '.00',
      fg: '#1a1f36',
    },
  ];
  return (
    <ScreenContainer screen="withdraw" contentStyle={styles.wdContent}>
      <View style={styles.amountBlock}>
        <SectionLabel style={styles.center}>WITHDRAWING</SectionLabel>
        <GradientText
          block
          style={styles.wdAmount}
          containerStyle={styles.wdAmountBox}
        >
          {'$' + formatMoney(wd) + '.00'}
        </GradientText>
        <Text style={styles.available}>$48,500.00 available</Text>
      </View>
      <View style={styles.presets}>
        {PRESETS.map(([v, label]) => {
          const on = wd === v;
          return (
            <PressableScale
              key={label}
              activeScale={0.94}
              onPress={() => setAppState({ wd: v })}
              accessibilityState={{ selected: on }}
              style={[
                styles.preset,
                {
                  backgroundColor: on ? '#1e2a5a' : '#fff',
                  borderColor: on ? '#16204a' : '#e2e5ec',
                },
              ]}
            >
              <Text
                style={[styles.presetText, { color: on ? '#fff' : '#606780' }]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <SectionLabel style={styles.toLabel}>TO ACCOUNT</SectionLabel>
      <View style={styles.to}>
        <IconTile
          size={40}
          radius={11}
          bgColor="#f1f3f7"
          color="#33406e"
          name="bank"
          iconSize={19}
        />
        <View style={styles.flex}>
          <Text style={styles.accountName}>GTBank · ••4471</Text>
          <Text style={styles.accountSub}>Adaeze C. Okafor · NGN</Text>
        </View>
        <Pressable onPress={() => go('payout')} accessibilityRole="button">
          <Text style={styles.change}>Change</Text>
        </Pressable>
      </View>
      <View style={styles.fees}>
        {rows.map(r => (
          <View key={r.k} style={styles.fee}>
            <Text style={styles.feeKey}>{r.k}</Text>
            <Text style={[styles.feeValue, { color: r.fg }]}>{r.v}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  hero: {
    borderRadius: 14,
    overflow: 'hidden',
    experimental_backgroundImage: gradients.navyCard,
    padding: 18,
    boxShadow: shadows.hero,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#a9b5dd',
  },
  balance: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginTop: 6,
    letterSpacing: -1,
  },
  escrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  escrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f3d27a',
  },
  escrowText: { fontSize: 12, color: '#c3cbe8' },
  withdraw: {
    marginTop: 16,
    height: 46,
    borderRadius: 11,
    experimental_backgroundImage: gradients.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 2px 10px rgba(200,150,47,0.30)',
  },
  withdrawText: { color: '#2b1f04', fontSize: 14, fontWeight: '600' },
  label20: { marginTop: 20, marginHorizontal: 2, marginBottom: 10 },
  label22: { marginTop: 22, marginHorizontal: 2, marginBottom: 10 },
  accounts: { gap: 11 },
  account: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  accountName: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  accountSub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
  add: {
    marginTop: 11,
    borderRadius: 13,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  addText: { fontSize: 13.5, fontWeight: '600', color: '#243258' },
  history: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 2,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  payout: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  amount: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  payoutMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
  paid: { fontSize: 11, fontWeight: '600', color: '#15803d' },
  wdContent: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 26 },
  amountBlock: { paddingTop: 8, paddingBottom: 4 },
  center: { textAlign: 'center' },
  wdAmount: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.4,
    textAlign: 'center',
  },
  wdAmountBox: { marginTop: 6 },
  available: {
    fontSize: 12.5,
    color: '#8890ad',
    marginTop: 6,
    textAlign: 'center',
  },
  presets: { flexDirection: 'row', gap: 9, marginTop: 18 },
  preset: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetText: { fontSize: 12.5, fontWeight: '600' },
  toLabel: { marginTop: 22, marginBottom: 10 },
  to: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1e2a5a',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    boxShadow: shadows.selected,
  },
  change: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
  fees: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  fee: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  feeKey: { fontSize: 13, color: '#606780' },
  feeValue: { fontSize: 13, fontWeight: '600' },
});
