import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Blip, FadeUp, Rotate } from '../../components/common/animations';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  Grid,
  IconTile,
  Photo,
  Pill,
  Scrim,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash, go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { GroupHeader } from '../../components/profile/GroupHeader';

const CHANNELS = [
  {
    name: 'Live chat',
    sub: 'Replies in ~2 min',
    icon: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z',
    bg: gradients.green,
    fg: '#fff',
    sh: '0 2px 8px rgba(22,163,74,0.26)',
    delay: 50,
    onPress: () => go('chat'),
  },
  {
    name: 'Call the desk',
    sub: '+234 700 646 3725',
    icon: 'M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.6 18.6 0 0 1-5.7-5.7A19 19 0 0 1 2.8 4.2 2 2 0 0 1 4.8 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1l-1.2 1.3a15 15 0 0 0 5.7 5.7l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
    bg: gradients.navyAvatar,
    fg: '#fff',
    sh: '0 2px 8px rgba(30,42,90,0.26)',
    delay: 110,
    onPress: () => flash('Calling the verification desk…'),
  },
  {
    name: 'Email us',
    sub: 'help@mineralbridge.co',
    icon: 'M3 6h18v12H3zM3 7l9 6 9-6',
    bg: '#eef3fe',
    fg: '#1d4fd7',
    sh: 'none',
    delay: 170,
    onPress: () => flash('Opening a new email'),
  },
  {
    name: 'WhatsApp',
    sub: 'Same number, 24/7',
    icon: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5zM8.5 9.5c0 3.3 2.7 6 6 6',
    bg: '#f8f2e3',
    fg: '#8a6a1c',
    sh: 'none',
    delay: 230,
    onPress: () => flash('Opening WhatsApp'),
  },
];

const FAQS = [
  {
    q: 'When do I get paid for a lot?',
    a: 'Escrow releases within 24 hours of you and the buyer both confirming the delivered assay. Payout lands in your default account on the next banking day.',
  },
  {
    q: 'What does verification actually check?',
    a: 'A licensed verifier attends your site, weighs the lot, draws a sample for fire assay, and photographs the seal. They also confirm your lease or permit is current.',
  },
  {
    q: 'Is there a fee for selling or evaluation?',
    a: 'Evaluation is free and we buy at the price we offer — nothing is deducted from your payout. Mineral Bridge makes its margin when it refines and resells the lot.',
  },
  {
    q: 'Can I cancel an auction after it opens?',
    a: 'You can cancel before the first bid. Once a bid is placed the lot is committed, though you can still decline if the reserve is not met.',
  },
  {
    q: 'Why was my document rejected?',
    a: 'The most common reasons are glare across the photo page, an expired date, or a name that does not match your KYC record. Re-upload a flat, well-lit scan.',
  },
];

const TICKETS = [
  {
    id: 'TCK-4471',
    status: 'AGENT REPLIED',
    subject: 'Assay weight differs from my own scale',
    meta: 'Updated 2 hours ago · 3 messages',
    pillBg: '#eef3fe',
    pillBorder: '#d6e2fb',
    pillFg: '#1d4fd7',
  },
  {
    id: 'TCK-4402',
    status: 'RESOLVED',
    subject: 'Payout account name mismatch',
    meta: 'Closed 3 Sep 2026',
    pillBg: '#edf7f1',
    pillBorder: '#cfe7d8',
    pillFg: '#15803d',
  },
];

/** P2 · Help & support — contact channels, FAQ accordion and open tickets. */
export function SupportScreen() {
  const faqOpen = useApp(s => s.faqOpen);
  return (
    <ScreenContainer screen="support" contentStyle={styles.content}>
      <View style={styles.heroShadow}>
        <Photo
          name="cat-industrial"
          style={styles.hero}
          imageStyle={styles.r14}
          fit="cover"
        >
          <Scrim gradient="linear-gradient(165deg,rgba(14,20,48,0.62),rgba(20,29,64,0.95))" />
          <View style={styles.heroBody}>
            <View style={styles.open}>
              <Blip style={styles.openDot} />
              <Text style={styles.openText}>DESK OPEN · 08:00–20:00 WAT</Text>
            </View>
            <View style={styles.heroTitle}>
              <Text style={styles.heroTitleText} leading={1.22}>
                How can we
              </Text>
              <GradientText style={[styles.heroTitleText, styles.heroGold]}>
                help you?
              </GradientText>
            </View>
            <Text style={styles.heroSub} leading={1.5}>
              Typical reply in 4 minutes on chat, same day by email.
            </Text>
          </View>
        </Photo>
      </View>

      <Grid columns={2} gap={11} style={styles.channels}>
        {CHANNELS.map(c => (
          <FadeUp key={c.name} duration={500} delay={c.delay}>
            <PressableScale onPress={c.onPress} style={styles.channel}>
              <IconTile
                size={38}
                radius={11}
                bgColor={c.bg}
                color={c.fg}
                d={c.icon}
                iconSize={19}
                shadowValue={c.sh}
              />
              <Text style={styles.channelName}>{c.name}</Text>
              <Text style={styles.channelSub} leading={1.4}>
                {c.sub}
              </Text>
            </PressableScale>
          </FadeUp>
        ))}
      </Grid>

      <View style={styles.block}>
        <View style={styles.blockHead}>
          <GroupHeader label="COMMON QUESTIONS" rule={gradients.goldBar} />
        </View>
        <View style={styles.faqs}>
          {FAQS.map((f, i) => {
            const open = faqOpen === i;
            return (
              <PressableScale
                key={f.q}
                activeScale={0.988}
                onPress={() =>
                  setAppState(p => ({ faqOpen: p.faqOpen === i ? -1 : i }))
                }
                accessibilityState={{ expanded: open }}
                style={[
                  styles.faq,
                  {
                    borderColor: open ? '#d6e2fb' : '#e5e7ec',
                    boxShadow: open
                      ? '0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(37,99,235,0.14)'
                      : '0 1px 2px rgba(16,24,40,0.05)',
                  },
                ]}
              >
                <View style={styles.faqHead}>
                  <Text style={styles.question} leading={1.4}>
                    {f.q}
                  </Text>
                  <Rotate open={open}>
                    <Icon name="chevronDown" size={17} color="#a3abc4" />
                  </Rotate>
                </View>
                {open ? (
                  <FadeUp duration={300} style={styles.answer}>
                    <Text style={styles.answerText} leading={1.6}>
                      {f.a}
                    </Text>
                  </FadeUp>
                ) : null}
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <View style={[styles.blockHead, styles.ticketHead]}>
          <GroupHeader label="YOUR TICKETS" rule={gradients.blueRule} />
          <Pressable onPress={() => go('newTicket')} accessibilityRole="button">
            <Text style={styles.newTicket}>New ticket</Text>
          </Pressable>
        </View>
        <View style={styles.faqs}>
          {TICKETS.map(t => (
            <PressableScale
              key={t.id}
              activeScale={0.985}
              onPress={() => go('ticket')}
              style={styles.ticket}
            >
              <View style={styles.ticketRow}>
                <Text style={styles.ticketId}>{t.id}</Text>
                <Pill
                  label={t.status}
                  bgColor={t.pillBg}
                  border={t.pillBorder}
                  fg={t.pillFg}
                />
              </View>
              <Text style={styles.subject} leading={1.4}>
                {t.subject}
              </Text>
              <Text style={styles.ticketMeta}>{t.meta}</Text>
            </PressableScale>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  r14: { borderRadius: 14 },
  heroShadow: {
    marginHorizontal: 20,
    borderRadius: 14,
    boxShadow: shadows.hero,
  },
  hero: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#0e1430' },
  heroBody: { padding: 20 },
  open: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  openDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  openText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#86efac',
  },
  heroTitle: { marginTop: 9 },
  heroTitleText: {
    fontSize: 21,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 21 * 1.22,
  },
  heroGold: { fontStyle: 'italic', fontWeight: '700' },
  heroSub: { fontSize: 12.5, color: '#c3cbe8', marginTop: 7 },
  channels: { marginTop: 14, marginHorizontal: 20 },
  channel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 15,
    boxShadow: shadows.card,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 12,
  },
  channelSub: { fontSize: 11.5, color: '#8890ad', marginTop: 3 },
  block: { marginTop: 20, marginHorizontal: 20 },
  blockHead: { marginHorizontal: 2, marginBottom: 10 },
  ticketHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqs: { gap: 10 },
  faq: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqHead: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  question: { flex: 1, fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  answer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    paddingTop: 13,
    paddingHorizontal: 14,
    paddingBottom: 15,
  },
  answerText: { fontSize: 12.5, color: '#4a5170' },
  newTicket: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  ticket: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 14,
    boxShadow: shadows.xs,
  },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  ticketId: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#8890ad',
  },
  subject: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 6,
  },
  ticketMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 4 },
});
