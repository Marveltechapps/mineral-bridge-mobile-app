import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pop, ease } from '../common/animations';
import { PrimaryButton, SecondaryButton } from '../common/Button';
import { Icon } from '../common/Icon';
import { BottomSheet, Scrim } from '../common/Modal';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import { CheckBadge, IconTile, RadioDot, SectionLabel } from '../common/ui';
import { flash, go, jump } from '../../navigation/flow';
import {
  appStore,
  setAppState,
  useApp,
  type PickerKind,
} from '../../context/appStore';
import { formatMoney } from '../../utils/format';

const close = () => setAppState({ sheet: null });

/** Renders whichever bottom sheet is open, over a tappable scrim. */
export function Sheets() {
  const sheet = useApp(s => s.sheet);
  if (!sheet) return null;
  return (
    <>
      <Scrim onPress={close} />
      {sheet === 'signin' ? <SigninSheet /> : null}
      {sheet === 'picker' ? <PickerSheet /> : null}
      {sheet === 'logout' ? <DangerSheet /> : null}
      {sheet === 'kyc' ? <KycSheet /> : null}
      {sheet === 'help' ? <HelpSheet /> : null}
      {sheet === 'bid' ? <BidSheet /> : null}
      {sheet === 'filter' ? <FilterSheet /> : null}
    </>
  );
}

const GUEST_GAINS = [
  'Send buying requirements and get verified quotes',
  'List your own lots and book a verifier',
  'Place bids and get outbid alerts',
];

/** Guests who try to trade are asked to create an account. */
function SigninSheet() {
  const signup = () => {
    setAppState({
      guest: false,
      authMode: 'signup',
      phone: '',
      code: '',
      sheet: null,
    });
    jump('signupPhone');
  };
  const login = () => {
    setAppState({
      guest: false,
      authMode: 'login',
      phone: '8024419087',
      code: '',
      sheet: null,
    });
    jump('login');
  };
  return (
    <BottomSheet>
      <Pop duration={400} easing={ease.out} style={styles.lockTile}>
        <Icon name="lock" size={24} color="#1e2a5a" />
      </Pop>
      <Text style={[styles.title19, styles.mt14]}>
        Create an account to continue
      </Text>
      <Text style={styles.body13} leading={1.55}>
        Guests can browse every lot and price. Ordering, listing and bidding
        need a verified number.
      </Text>
      <View style={styles.gains}>
        {GUEST_GAINS.map(g => (
          <View key={g} style={styles.gain}>
            <CheckBadge size={20} radius={8} iconSize={11} variant="soft" />
            <Text style={styles.gainText}>{g}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        label="Create an account"
        onPress={signup}
        pressScale={1}
        style={styles.mt18}
      />
      <SecondaryButton
        label="I already have an account"
        onPress={login}
        pressScale={1}
        style={styles.mt9}
      />
      <PressableScale activeScale={1} onPress={close} style={styles.textLink}>
        <Text style={styles.keepLooking}>Keep looking around</Text>
      </PressableScale>
    </BottomSheet>
  );
}

const PICKER: Record<
  PickerKind,
  { title: string; options: [string, string][] }
> = {
  language: {
    title: 'App language',
    options: [
      ['English', 'Default'],
      ['Hausa', ''],
      ['Yoruba', ''],
      ['Igbo', ''],
      ['French', ''],
    ],
  },
  currency: {
    title: 'Display currency',
    options: [
      ['USD', 'US Dollar'],
      ['NGN', 'Nigerian Naira'],
      ['EUR', 'Euro'],
      ['GBP', 'Pound Sterling'],
    ],
  },
  units: {
    title: 'Measurement units',
    options: [
      ['Metric', 'kg, tonnes'],
      ['Imperial', 'lb, tons'],
      ['Troy', 'oz t, dwt'],
    ],
  },
};

/** Settings preference picker (language, currency, units). */
function PickerSheet() {
  const { picker, prefsVal } = useApp(s => ({
    picker: s.picker,
    prefsVal: s.prefsVal,
  }));
  const cur = prefsVal[picker];
  return (
    <BottomSheet radius={18}>
      <Text style={styles.title185}>{PICKER[picker].title}</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {PICKER[picker].options.map(([label, sub]) => {
          const on = cur === label;
          return (
            <PressableScale
              key={label}
              activeScale={0.985}
              onPress={() =>
                setAppState(p => ({
                  prefsVal: { ...p.prefsVal, [p.picker]: label },
                }))
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[
                styles.option,
                {
                  borderColor: on ? '#1e2a5a' : '#e5e7ec',
                  boxShadow: on
                    ? '0 1px 2px rgba(16,24,40,0.06), 0 6px 16px rgba(30,42,90,0.12)'
                    : '0 1px 2px rgba(16,24,40,0.04)',
                },
              ]}
            >
              <Text style={styles.optionLabel}>{label}</Text>
              {sub ? <Text style={styles.optionSub}>{sub}</Text> : null}
              <RadioDot
                size={20}
                radius={10}
                dotSize={9}
                dot={on ? '#1e2a5a' : '#c9cdd8'}
                fill={on ? '#1e2a5a' : 'transparent'}
              />
            </PressableScale>
          );
        })}
      </View>
      <PrimaryButton
        label="Done"
        onPress={close}
        height={52}
        pressScale={1}
        shadow={false}
        labelStyle={styles.label145}
        style={styles.mt16}
      />
    </BottomSheet>
  );
}

/** Log out or delete-account confirmation. */
function DangerSheet() {
  const del = useApp(s => s.danger === 'delete');
  const confirm = () => {
    setAppState({
      sheet: null,
      guest: false,
      kyc: 'none',
      tierIdx: 0,
      authMode: 'signup',
      phone: '',
      code: '',
      introOpen: 0,
    });
    jump('welcome');
  };
  return (
    <BottomSheet radius={18}>
      <Pop duration={400} easing={ease.out}>
        <IconTile
          size={50}
          radius={14}
          bgColor={del ? '#fdeeee' : '#f1f3f7'}
          color={del ? '#c0392b' : '#33406e'}
          d={
            del
              ? 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5'
              : 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'
          }
          iconSize={24}
        />
      </Pop>
      <Text style={[styles.title185, styles.mt14]}>
        {del ? 'Delete your account?' : 'Log out of Mineral Bridge?'}
      </Text>
      <Text style={[styles.body13, styles.subtle]} leading={1.55}>
        {del
          ? 'This removes your listings, bids and documents permanently. Active orders must be settled first.'
          : 'Your listings and bids stay live. You will need your phone number and a new code to sign back in.'}
      </Text>
      <PrimaryButton
        label={del ? 'Delete permanently' : 'Log out'}
        onPress={confirm}
        height={56}
        style={[styles.mt20, del ? styles.dangerButton : null]}
      />
      <SecondaryButton
        label="Stay signed in"
        onPress={close}
        pressScale={1}
        style={styles.mt9}
      />
    </BottomSheet>
  );
}

/** Unverified accounts that try to trade are pointed at the identity check. */
function KycSheet() {
  const pending = useApp(s => s.kyc === 'pending');
  const rows = pending
    ? [
        'ID and selfie received',
        'Database check in progress',
        'Approval unlocks trading automatically',
      ]
    : [
        'Place orders and get verified quotes',
        'List lots and book a verifier',
        'Bid in live auctions',
      ];
  const start = () => {
    setAppState({ sheet: null });
    go('kycStart');
  };
  return (
    <BottomSheet radius={18}>
      <Pop duration={400} easing={ease.out}>
        <IconTile
          size={50}
          radius={14}
          bgColor={pending ? '#fbf3e4' : '#f1f3f7'}
          color={pending ? '#a1620b' : '#33406e'}
          name="shield"
          iconSize={24}
        />
      </Pop>
      <Text style={[styles.title185, styles.mt14]}>
        {pending
          ? 'Your verification is still in review'
          : 'Verify your identity first'}
      </Text>
      <Text style={[styles.body13, styles.subtle]} leading={1.55}>
        {pending
          ? 'We are matching your ID against the national database. You will be notified the moment it clears.'
          : 'You skipped the identity check. It takes about three minutes and unlocks every trading action.'}
      </Text>
      <View style={styles.gains}>
        {rows.map(r => (
          <View key={r} style={styles.gain}>
            <CheckBadge size={20} radius={10} iconSize={11} variant="mint" />
            <Text style={styles.kycRow}>{r}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        label={pending ? 'View verification status' : 'Complete verification'}
        onPress={start}
        height={56}
        pressScale={1}
        style={styles.mt18}
      />
      <PressableScale activeScale={1} onPress={close} style={styles.textLink}>
        <Text style={styles.notNow}>Not right now</Text>
      </PressableScale>
    </BottomSheet>
  );
}

const HELP = [
  {
    label: 'Call me with the code',
    sub: 'Automated voice call in English',
    icon: 'M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.6 18.6 0 0 1-5.7-5.7A19 19 0 0 1 2.8 4.2 2 2 0 0 1 4.8 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1l-1.2 1.3a15 15 0 0 0 5.7 5.7l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  },
  {
    label: 'Send the code on WhatsApp',
    sub: 'Uses the same number',
    icon: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z',
  },
  {
    label: 'Talk to support',
    sub: 'Mon–Sat, 8am–8pm WAT',
    icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0',
  },
];

/** "Trouble signing in?" — other ways to receive the code. */
function HelpSheet() {
  return (
    <BottomSheet>
      <Text style={styles.title19}>Trouble signing in?</Text>
      <Text style={[styles.body13, styles.mt5]}>
        Pick another way to get your code.
      </Text>
      <View style={styles.helpList}>
        {HELP.map(h => (
          <PressableScale
            key={h.label}
            onPress={() => {
              setAppState({ sheet: null });
              flash('Code on the way — ' + h.label.toLowerCase());
            }}
            style={styles.helpRow}
          >
            <IconTile
              size={38}
              radius={10}
              bgColor="#f0f2f6"
              color="#1e2a5a"
              d={h.icon}
              iconSize={18}
            />
            <View style={styles.flex}>
              <Text style={styles.helpLabel}>{h.label}</Text>
              <Text style={styles.helpSub}>{h.sub}</Text>
            </View>
            <Icon name="chevronRight" size={17} color="#b9c0d6" />
          </PressableScale>
        ))}
      </View>
    </BottomSheet>
  );
}

/** Place a bid on the open auction lot. */
function BidSheet() {
  const bid = useApp(s => s.bid);
  const confirm = () => {
    setAppState({ sheet: null });
    flash('Bid placed — $48,400 on Cobalt Hydroxide');
  };
  return (
    <BottomSheet>
      <Text style={styles.title19}>Place your bid</Text>
      <Text style={[styles.body13, styles.mt5]}>
        Current highest $48,200 · minimum increment $200
      </Text>
      <SectionLabel style={styles.bidLabel}>YOUR BID (USD)</SectionLabel>
      <View
        style={styles.bidField}
        accessibilityLabel={`Your bid ${formatMoney(bid)} dollars`}
      >
        <Text style={styles.currency}>$</Text>
        <Text style={styles.bidAmount}>{formatMoney(bid)}</Text>
        <View style={styles.bidCaret} />
      </View>
      <View style={styles.bidSteps}>
        {[200, 500, 1000].map(v => (
          <PressableScale
            key={v}
            onPress={() => setAppState({ bid: appStore.getState().bid + v })}
            style={styles.bidStep}
          >
            <Text style={styles.bidStepLabel}>{'+$' + v}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.binding}>
        <Text style={styles.bindingText} leading={1.5}>
          Bids are binding. Winning bids move straight to delivery details.
        </Text>
      </View>
      <PrimaryButton
        label="Confirm Bid"
        onPress={confirm}
        style={styles.mt16}
      />
    </BottomSheet>
  );
}

function Chip({ label, on }: { label: string; on: boolean }) {
  return (
    <View
      style={[
        styles.filterChip,
        on ? styles.filterChipOn : styles.filterChipOff,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          on ? styles.filterChipTextOn : styles.filterChipTextOff,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/** Product grid filters. */
function FilterSheet() {
  return (
    <BottomSheet>
      <View style={styles.filterHead}>
        <Text style={styles.title19}>Filters</Text>
        <Text style={styles.reset}>Reset</Text>
      </View>
      <SectionLabel style={styles.filterLabel}>PURITY</SectionLabel>
      <View style={styles.chips}>
        <Chip label="22K+" on />
        <Chip label="18K – 22K" on={false} />
        <Chip label="Under 18K" on={false} />
      </View>
      <SectionLabel style={styles.filterLabel}>SELLER TIER</SectionLabel>
      <View style={styles.chips}>
        <Chip label="Artisanal" on={false} />
        <Chip label="Cooperative" on />
        <Chip label="Registered" on />
      </View>
      <View style={styles.verifiedRow}>
        <Text style={styles.verifiedText}>Verified lots only</Text>
        <View style={styles.toggle}>
          <View style={styles.knob} />
        </View>
      </View>
      <PrimaryButton
        label="Show 12 results"
        onPress={close}
        style={styles.mt18}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mt5: { marginTop: 5 },
  mt9: { marginTop: 9 },
  mt14: { marginTop: 14 },
  mt16: { marginTop: 16 },
  mt18: { marginTop: 18 },
  mt20: { marginTop: 20 },
  lockTile: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f0f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title19: { fontSize: 19, fontWeight: '600', color: '#1a1f36' },
  title185: {
    fontSize: 18.5,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.2,
  },
  body13: { fontSize: 13, color: '#6b7290', marginTop: 6 },
  subtle: { color: '#606780' },
  gains: { marginTop: 16, gap: 10 },
  gain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gainText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#4a5170' },
  kycRow: { flex: 1, fontSize: 13, fontWeight: '500', color: '#4a5170' },
  textLink: { marginTop: 14, alignSelf: 'center' },
  keepLooking: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8890ad',
  },
  notNow: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '500',
    color: '#7b839c',
  },
  label145: { fontSize: 14.5, letterSpacing: 0 },
  options: { marginTop: 16, gap: 9 },
  option: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  optionSub: { fontSize: 12, color: '#8890ad' },
  dangerButton: {
    experimental_backgroundImage: 'linear-gradient(180deg,#e04141,#c0392b)',
    borderColor: '#a52f22',
  },
  helpList: { marginTop: 18, gap: 10 },
  helpRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  helpLabel: { fontSize: 14, fontWeight: '700', color: '#1a1f36' },
  helpSub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
  bidLabel: { marginTop: 20, marginBottom: 8 },
  bidField: {
    backgroundColor: '#f4f5f7',
    borderWidth: 1.5,
    borderColor: '#1e2a5a',
    borderRadius: 11,
    height: 62,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: { fontSize: 22, fontWeight: '600', color: '#8890ad' },
  bidAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.5,
  },
  bidCaret: { width: 2, height: 26, backgroundColor: '#1e2a5a', marginLeft: 2 },
  bidSteps: { flexDirection: 'row', gap: 9, marginTop: 12 },
  bidStep: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidStepLabel: { color: '#1e2a5a', fontSize: 13, fontWeight: '600' },
  binding: {
    marginTop: 16,
    backgroundColor: '#fef9ec',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  bindingText: { fontSize: 12.5, color: '#b45309' },
  filterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reset: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  filterLabel: { marginTop: 20, marginBottom: 9 },
  chips: { flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  filterChip: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 9999,
    justifyContent: 'center',
  },
  filterChipOn: { backgroundColor: '#1e2a5a' },
  filterChipOff: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe2e9',
  },
  filterChipText: { fontSize: 12.5 },
  filterChipTextOn: { color: '#fff', fontWeight: '600' },
  filterChipTextOff: { color: '#6b7290', fontWeight: '700' },
  verifiedRow: {
    marginTop: 20,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 11,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedText: { fontSize: 13.5, fontWeight: '600', color: '#15803d' },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 11,
    backgroundColor: '#16a34a',
    padding: 3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  knob: { width: 22, height: 22, borderRadius: 9, backgroundColor: '#fff' },
});
