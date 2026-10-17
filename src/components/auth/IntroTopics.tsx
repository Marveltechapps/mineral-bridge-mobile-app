import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  FadeUp,
  Rotate,
  Travel,
  ease,
} from '../common/animations';
import { Icon } from '../common/Icon';
import { PressableScale } from '../common/PressableScale';
import { Text } from '../common/Text';
import {
  CheckBadge,
  IconTile,
  Photo,
  Scrim,
} from '../common/ui';
import { INTRO_CAN, INTRO_WHO } from '../../lib/catalog';
import { setAppState, useApp } from '../../context/appStore';
import { bg, shadow } from '../../utils/style';
import { Easing } from 'react-native';

/** Accent palette for the four topic cards (gold, navy, green, blue). */
const ACCENTS = [
  {
    grad: 'linear-gradient(135deg,#f7dd8e,#c8962f)',
    tint: '#f8f2e3',
    ink: '#8a6a1c',
    edge: '#eddfc0',
    ring: 'rgba(200,150,47,0.30)',
    chipFg: '#3d2c05',
  },
  {
    grad: 'linear-gradient(135deg,#2c3c6b,#1a2450)',
    tint: '#eef1f8',
    ink: '#33406e',
    edge: '#dbe1ef',
    ring: 'rgba(30,42,90,0.26)',
    chipFg: '#fff',
  },
  {
    grad: 'linear-gradient(135deg,#22c55e,#15803d)',
    tint: '#ecf7f0',
    ink: '#15803d',
    edge: '#cfe7d8',
    ring: 'rgba(22,163,74,0.26)',
    chipFg: '#fff',
  },
  {
    grad: 'linear-gradient(135deg,#4c8bf5,#1d4fd7)',
    tint: '#eef3fe',
    ink: '#1d4fd7',
    edge: '#d6e2fb',
    ring: 'rgba(37,99,235,0.24)',
    chipFg: '#fff',
  },
];

const TOPICS = [
  {
    title: 'What is a mineral?',
    sub: 'Raw material, and how it gets priced',
    delay: 50,
  },
  { title: 'Who can join?', sub: 'Two sides, three levels each', delay: 120 },
  {
    title: 'How does Mineral Bridge fit in?',
    sub: 'We buy from sellers, then sell to buyers',
    delay: 190,
  },
  {
    title: 'What can you do here?',
    sub: 'Two ways in, one company in the middle',
    delay: 260,
  },
];

const FACTS = [
  {
    n: '1',
    title: 'Sold by weight and purity',
    sub: 'Gold is priced per gram at a karat; ore is priced per tonne at a grade.',
  },
  {
    n: '2',
    title: 'Origin has to be provable',
    sub: 'Buyers must show where material came from, so we record it with the lot.',
  },
  {
    n: '3',
    title: 'Nothing is priced by guesswork',
    sub: 'An assay sets the real content before anyone commits to a number.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'You get an instant estimate',
    sub: 'Quantity and type give you a price range in seconds.',
    delay: 50,
  },
  {
    n: '2',
    title: 'We evaluate, free of charge',
    sub: 'Our evaluator weighs and assays at your site.',
    delay: 130,
  },
  {
    n: '3',
    title: 'You accept our firm offer',
    sub: 'Paid within 24 hours. Decline and keep the lot.',
    delay: 210,
  },
  {
    n: '4',
    title: 'We refine and retail it',
    sub: 'Buyers purchase assured stock at a fixed price.',
    delay: 290,
  },
];

/** "In this guide": four expandable topics, one open at a time. */
export function IntroTopics() {
  const introOpen = useApp(s => s.introOpen);
  const toggle = (i: number) =>
    setAppState(p => ({ introOpen: p.introOpen === i ? -1 : i }));
  const bodies = [
    <TopicMineral key={0} />,
    <TopicWho key={1} />,
    <TopicBridge key={2} />,
    <TopicCan key={3} />,
  ];

  return (
    <View style={styles.list}>
      {TOPICS.map((t, i) => {
        const open = introOpen === i;
        const a = ACCENTS[i];
        return (
          <FadeUp key={t.title} delay={t.delay} duration={500}>
            <PressableScale
              activeScale={0.988}
              onPress={() => toggle(i)}
              accessibilityState={{ expanded: open }}
              style={[
                styles.card,
                {
                  borderColor: open ? a.edge : '#e5e7ec',
                  boxShadow: open
                    ? '0 1px 2px rgba(16,24,40,0.06), 0 10px 26px ' + a.ring
                    : '0 1px 2px rgba(16,24,40,0.05), 0 2px 8px rgba(16,24,40,0.04)',
                },
              ]}
            >
              <View
                style={[styles.accent, bg(a.grad), { opacity: open ? 1 : 0 }]}
              />
              <View style={styles.head}>
                <View
                  style={[
                    styles.chip,
                    bg(open ? a.grad : a.tint),
                    shadow(open ? '0 2px 8px ' + a.ring : 'none'),
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: open ? a.chipFg : a.ink },
                    ]}
                  >
                    {String(i + 1)}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.title}>{t.title}</Text>
                  <Text style={styles.sub} leading={1.4}>
                    {t.sub}
                  </Text>
                </View>
                <Rotate open={open}>
                  <Icon name="chevronDown" size={18} color="#a3abc4" />
                </Rotate>
              </View>
              {open ? (
                <FadeUp
                  duration={340}
                  style={[styles.body, { borderTopColor: a.edge }]}
                >
                  {bodies[i]}
                </FadeUp>
              ) : null}
            </PressableScale>
          </FadeUp>
        );
      })}
    </View>
  );
}

function TopicMineral() {
  return (
    <>
      <Photo
        name="cat-precious"
        style={styles.mineralHero}
        imageStyle={styles.r16}
        fit="cover"
      >
        <Scrim
          gradient="linear-gradient(180deg,rgba(14,20,48,0.05),rgba(14,20,48,0.78))"
          style={styles.r16}
        />
        <View style={styles.mineralTags}>
          {['GOLD', 'COBALT', 'LITHIUM', '+ 9 MORE'].map(tag => (
            <View key={tag} style={styles.mineralTag}>
              <Text style={styles.mineralTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </Photo>
      <Text style={[styles.paragraph, styles.mt14]} leading={1.6}>
        A mineral is raw material dug from the ground — gold, cobalt, lithium,
        tantalite, gemstones. Miners sell it by weight and purity. Factories and
        refineries buy it to make jewellery, batteries, wiring and machines.
      </Text>
      <View style={styles.facts}>
        {FACTS.map(f => (
          <View key={f.n} style={styles.fact}>
            <View style={styles.factNum}>
              <Text style={styles.factNumText}>{f.n}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{f.title}</Text>
              <Text style={[styles.rowSub, styles.mt3]} leading={1.5}>
                {f.sub}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function TopicWho() {
  return (
    <>
      <Text style={styles.paragraph} leading={1.6}>
        Two sides, three levels each. You pick your level once — it only changes
        how much paperwork we ask for.
      </Text>
      {INTRO_WHO.map(w => (
        <View key={w.title} style={styles.whoCard}>
          <View style={[styles.whoHead, bg(w.headBg)]}>
            <IconTile
              size={32}
              radius={9}
              bgColor="rgba(255,255,255,0.16)"
              color="#fff"
              d={w.icon}
              iconSize={16}
              strokeWidth={2.2}
            />
            <View style={styles.flex}>
              <Text style={styles.whoTitle}>{w.title}</Text>
              <Text style={styles.whoSub}>{w.sub}</Text>
            </View>
          </View>
          <View style={styles.whoRows}>
            {w.rows.map(r => (
              <View key={r.n} style={styles.whoRow}>
                <View style={styles.whoNum}>
                  <Text style={styles.whoNumText}>{r.n}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{r.name}</Text>
                  <Text style={[styles.rowSub, styles.mt2]} leading={1.45}>
                    {r.sub}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

function TopicBridge() {
  return (
    <>
      <Text style={styles.paragraph} leading={1.6}>
        Sellers do not wait for a buyer. Mineral Bridge evaluates the mineral,
        buys it outright, then refines, certifies and retails it. We carry the
        risk in the middle.
      </Text>
      <View style={styles.diagram}>
        <View style={styles.diagramRow}>
          <View style={styles.party}>
            <IconTile
              size={52}
              radius={12}
              bgColor="rgba(247,221,142,0.18)"
              color="#f3d27a"
              name="pickaxe"
              iconSize={24}
            />
            <Text style={styles.partyName}>SELLER</Text>
            <Text style={styles.partySub} leading={1.4}>
              Paid in 24h
            </Text>
          </View>
          <View style={styles.bridge}>
            <View style={styles.bridgeLine} />
            <View style={styles.bridgeTrack}>
              <Travel
                duration={2600}
                easing={Easing.bezier(0.5, 0, 0.5, 1)}
                style={styles.bridgeDot}
              />
            </View>
            <View style={styles.bridgeHub}>
              <Icon
                name="verified"
                size={24}
                color="#16a34a"
                strokeWidth={2.4}
              />
            </View>
          </View>
          <View style={styles.party}>
            <IconTile
              size={52}
              radius={12}
              bgColor="rgba(255,255,255,0.14)"
              color="#fff"
              name="building"
              iconSize={24}
            />
            <Text style={styles.partyName}>BUYER</Text>
            <Text style={styles.partySub} leading={1.4}>
              Buys assured stock
            </Text>
          </View>
        </View>
        <Text style={styles.bridgeCaption}>MINERAL BRIDGE BUYS AND OWNS</Text>
      </View>
      <View style={styles.steps}>
        {STEPS.map(t => (
          <FadeUp
            key={t.n}
            duration={450}
            delay={t.delay}
            easing={ease.out}
            style={styles.step}
          >
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{t.n}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{t.title}</Text>
              <Text style={[styles.rowSub, styles.mt3]} leading={1.5}>
                {t.sub}
              </Text>
            </View>
          </FadeUp>
        ))}
      </View>
    </>
  );
}

function TopicCan() {
  return (
    <>
      {INTRO_CAN.map(c => (
        <View key={c.title} style={styles.canCard}>
          <Photo name={c.img} style={styles.canHero} fit="cover">
            <Scrim gradient="linear-gradient(180deg,rgba(14,20,48,0.05),rgba(14,20,48,0.72))" />
            <View style={styles.canLabel}>
              <Text style={styles.canKicker}>{c.label}</Text>
              <Text style={styles.canTitle}>{c.title}</Text>
            </View>
          </Photo>
          <View style={styles.canRows}>
            {c.rows.map(r => (
              <View key={r} style={styles.canRow}>
                <CheckBadge size={22} radius={9} iconSize={12} variant="soft" />
                <Text style={styles.canText} leading={1.45}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.warn}>
        <Text style={styles.warnText} leading={1.55}>
          Browsing is free and open. You only need an account to place an order,
          list a lot or bid.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 14, paddingHorizontal: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  accent: { height: 3 },
  head: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13.5, fontWeight: '700' },
  flex: { flex: 1 },
  title: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.2,
  },
  sub: { fontSize: 12, color: '#7b839c', marginTop: 3 },
  body: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  r16: { borderRadius: 16 },
  mt2: { marginTop: 2 },
  mt3: { marginTop: 3 },
  mt14: { marginTop: 14 },
  mineralHero: {
    height: 196,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(16,24,40,0.10), 0 8px 20px rgba(16,24,40,0.12)',
  },
  mineralTags: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  mineralTag: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  mineralTagText: {
    color: '#1e2a5a',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  paragraph: { fontSize: 13.5, color: '#4a5170' },
  facts: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 16,
    boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
    gap: 12,
  },
  fact: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  factNum: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f0f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factNumText: { color: '#1e2a5a', fontSize: 12.5, fontWeight: '700' },
  rowTitle: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  rowSub: { fontSize: 12.5, color: '#6b7290' },
  whoCard: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 2px 8px rgba(16,24,40,0.04)',
  },
  whoHead: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whoTitle: { fontSize: 14.5, fontWeight: '700', color: '#fff' },
  whoSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 1 },
  whoRows: { paddingVertical: 6, paddingHorizontal: 16 },
  whoRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  whoNum: {
    width: 22,
    height: 22,
    borderRadius: 9,
    backgroundColor: '#f0f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whoNumText: { color: '#1e2a5a', fontSize: 11, fontWeight: '700' },
  diagram: {
    marginTop: 20,
    experimental_backgroundImage: 'linear-gradient(135deg,#1e2a5a,#141d40)',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    boxShadow: '0 1px 3px rgba(16,24,40,0.12), 0 10px 22px rgba(16,24,40,0.16)',
    overflow: 'hidden',
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  party: { width: 78, alignItems: 'center' },
  partyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  partySub: {
    fontSize: 10.5,
    color: '#8f9dcd',
    marginTop: 2,
    textAlign: 'center',
  },
  bridge: { flex: 1, height: 52 },
  bridgeLine: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  bridgeTrack: { position: 'absolute', top: 20, left: 0, right: 0, height: 12 },
  bridgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f3d27a',
    boxShadow: '0 0 12px rgba(243,210,122,0.8)',
  },
  bridgeHub: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -26,
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(16,24,40,0.28)',
  },
  bridgeCaption: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#f3d27a',
    marginTop: 14,
  },
  steps: { marginTop: 16, gap: 11 },
  step: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#1e2a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  canCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 2px 8px rgba(16,24,40,0.04)',
  },
  canHero: { height: 120 },
  canLabel: { position: 'absolute', left: 16, bottom: 12 },
  canKicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#c3cbe8',
  },
  canTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 2 },
  canRows: { paddingTop: 6, paddingHorizontal: 16, paddingBottom: 10 },
  canRow: {
    paddingVertical: 11,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  canText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1a1f36' },
  warn: {
    marginTop: 16,
    backgroundColor: '#fef9ec',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  warnText: { fontSize: 12.5, color: '#b45309' },
});
