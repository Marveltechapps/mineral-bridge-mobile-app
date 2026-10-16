import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  Photo,
  SectionLabel,
  StatusTimeline,
  type StatusStep,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import {
  ACCOUNT_TIERS,
  SELL_DOCS,
  SELL_REQUESTS,
  SELL_STEPS,
} from '../../lib/catalog';
import { flash, go } from '../../navigation/flow';
import { useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { LivePill, NavyHero } from '../../components/sell/NavyHero';

/** T3 · Sell request tracking — full stage history for one sell request. */
export function TrackSellRequestScreen() {
  const { reqIdx, tierIdx } = useApp(s => ({
    reqIdx: s.reqIdx,
    tierIdx: s.tierIdx,
  }));
  const R = SELL_REQUESTS[reqIdx] ?? SELL_REQUESTS[0];
  const steps = SELL_STEPS[reqIdx] ?? SELL_STEPS[0];
  const docs = SELL_DOCS[reqIdx] ?? SELL_DOCS[0];
  const offerReady = R.tone === 'gold';

  const timeline: StatusStep[] = steps.map(([title, sub, time, state], i) => ({
    title,
    sub,
    time,
    done: state === 'done',
    pending: state === 'pending',
    active: state === 'active',
    bg: state === 'done' ? '#16a34a' : '#fff',
    border:
      state === 'done' ? '#16a34a' : state === 'active' ? '#1e2a5a' : '#dfe2e9',
    line:
      i === steps.length - 1
        ? 'transparent'
        : state === 'done'
        ? '#bbf7d0'
        : '#dfe2e9',
    titleFg: state === 'pending' ? '#8890ad' : '#1a1f36',
  }));

  return (
    <ScreenContainer screen="sTrack" contentStyle={styles.content}>
      <NavyHero>
        <View style={styles.heroRow}>
          <View style={styles.flex}>
            <Text style={styles.kicker}>{'REQUEST ' + R.id}</Text>
            <Text style={styles.heroTitle}>
              {offerReady
                ? 'Offer ready'
                : R.status.charAt(0) + R.status.slice(1).toLowerCase()}
            </Text>
            <Text style={styles.heroSub} leading={1.45}>
              {R.eta}
            </Text>
          </View>
          <LivePill
            label={R.status}
            weight="600"
            duration={1600}
            bg={
              offerReady ? 'rgba(243,210,122,0.18)' : 'rgba(255,255,255,0.10)'
            }
            border={
              offerReady ? 'rgba(243,210,122,0.38)' : 'rgba(255,255,255,0.20)'
            }
            fg={offerReady ? '#f3d27a' : '#fff'}
            dot={offerReady ? '#f3d27a' : '#86efac'}
          />
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: R.progress as `${number}%` }]} />
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.submitted}>
            {'SUBMITTED ' + steps[0][2].replace(' · ', ' at ')}
          </Text>
          <Text style={styles.stage}>{R.stage}</Text>
        </View>
      </NavyHero>

      <View style={styles.product}>
        <Photo name={R.img} style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.productName}>{R.name}</Text>
          <Text style={styles.productQty}>
            {R.qty + ' · ' + ACCOUNT_TIERS[tierIdx].tag}
          </Text>
          <GradientText
            block
            style={styles.value}
            containerStyle={styles.valueBox}
          >
            {R.value}
          </GradientText>
        </View>
      </View>

      {offerReady ? (
        <PressableScale
          activeScale={0.985}
          onPress={() => go('sOffer')}
          style={styles.offer}
        >
          <IconTile
            size={34}
            radius={10}
            bgColor={gradients.gold}
            color="#2b1f04"
            name="currency"
            iconSize={17}
            strokeWidth={2.2}
          />
          <View style={styles.flex}>
            <Text style={styles.offerTitle}>Your offer is ready</Text>
            <Text style={styles.offerSub}>
              Expires in 48 hours — accept or decline
            </Text>
          </View>
          <Icon
            name="chevronRight"
            size={16}
            color="#a1620b"
            strokeWidth={2.2}
          />
        </PressableScale>
      ) : null}

      {reqIdx !== 2 ? (
        <View style={styles.evaluator}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>EB</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.evLabel}>YOUR EVALUATOR</Text>
            <Text style={styles.evName}>Emeka Balogun</Text>
          </View>
          <PressableScale
            activeScale={0.92}
            onPress={() => flash('Calling Emeka Balogun…')}
            accessibilityLabel="Call evaluator"
            style={[styles.action, styles.call]}
          >
            <Icon name="phone" size={17} color="#15803d" />
          </PressableScale>
          <PressableScale
            activeScale={0.92}
            onPress={() => go('chat')}
            accessibilityLabel="Chat with the desk"
            style={[styles.action, styles.chat]}
          >
            <Icon name="chat" size={17} color="#1d4fd7" />
          </PressableScale>
        </View>
      ) : null}

      <SectionLabel style={styles.label}>PROGRESS</SectionLabel>
      <View style={styles.card}>
        <StatusTimeline
          steps={timeline}
          nodeRadius={13}
          lineMin={15}
          gap={17}
          titleSize={13.5}
          timeColor="#606780"
          subColor="#606780"
          pendingDot="#c9cdd8"
        />
      </View>

      <SectionLabel style={styles.label}>DOCUMENTS</SectionLabel>
      <View style={styles.docs}>
        {docs.map(([name, meta, ready]) => (
          <PressableScale
            key={name}
            activeScale={0.985}
            onPress={() =>
              flash(
                ready
                  ? 'Downloading ' + name.toLowerCase()
                  : 'Not available yet',
              )
            }
            style={styles.doc}
          >
            <IconTile
              size={32}
              radius={10}
              bgColor={ready ? '#f1f3f7' : '#f4f5f7'}
              color={ready ? '#33406e' : '#a3abc4'}
              name="doc"
              iconSize={15}
              strokeWidth={2.2}
            />
            <View style={styles.flex}>
              <Text
                style={[
                  styles.docName,
                  { color: ready ? '#1a1f36' : '#8890ad' },
                ]}
              >
                {name}
              </Text>
              <Text style={styles.docMeta}>{meta}</Text>
            </View>
            {ready ? <Icon name="download" size={16} color="#b9c0d6" /> : null}
          </PressableScale>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 17,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    experimental_backgroundImage: 'linear-gradient(90deg,#f7dd8e,#c8962f)',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  submitted: { fontSize: 10.5, fontWeight: '600', color: '#8f9dcd' },
  stage: { fontSize: 10.5, fontWeight: '600', color: '#f3d27a' },
  product: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    boxShadow: shadows.xs,
  },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: '#1a1f36' },
  productQty: { fontSize: 12.5, color: '#606780', marginTop: 3 },
  value: { fontSize: 14.5, fontWeight: '700' },
  valueBox: { marginTop: 5 },
  offer: {
    marginTop: 12,
    backgroundColor: '#f8f2e3',
    borderWidth: 1,
    borderColor: '#eddfc0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offerTitle: { fontSize: 13.5, fontWeight: '600', color: '#8a5a09' },
  offerSub: { fontSize: 11.5, color: '#a1620b', marginTop: 2 },
  evaluator: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.xs,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 11,
    experimental_backgroundImage: gradients.navyAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#f3d27a', fontSize: 14, fontWeight: '700' },
  evLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#8890ad',
  },
  evName: { fontSize: 14, fontWeight: '600', color: '#1a1f36', marginTop: 3 },
  action: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: { backgroundColor: '#ecf7f0' },
  chat: { backgroundColor: '#eef3fe' },
  label: { marginTop: 22, marginHorizontal: 2, marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 17,
    boxShadow: shadows.xs,
  },
  docs: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 2,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  doc: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  docName: { fontSize: 13, fontWeight: '600' },
  docMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
});
