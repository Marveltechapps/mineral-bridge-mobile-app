import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { DashedBox, Pill, SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { fontFamilyFor, gradients, shadows } from '../../theme';
import { ChatBubble } from '../../components/profile/ChatBubble';

const THREAD = [
  {
    who: 'YOU',
    text: 'The evaluator recorded 248.6 kg but my own scale read 250 kg before they arrived. Can you explain the difference?',
    mine: true,
    time: '8 Sep · 11:20',
    delay: 50,
  },
  {
    who: 'MINERAL BRIDGE',
    text: 'Thanks for flagging it. Our evaluator deducts tare weight for the sealed container, which was 1.4 kg on this lot.',
    mine: false,
    time: '8 Sep · 11:44',
    delay: 120,
  },
  {
    who: 'MINERAL BRIDGE',
    text: 'The scale certificate and the tare photo are both attached to your assay certificate — you can download them from the offer screen.',
    mine: false,
    time: '8 Sep · 11:45',
    delay: 190,
  },
  {
    who: 'YOU',
    text: 'Understood, that matches. Thank you.',
    mine: true,
    time: '8 Sep · 12:02',
    delay: 260,
  },
];

const inputFont = {
  fontFamily: fontFamilyFor('400', false),
  includeFontPadding: false,
  padding: 0,
} as const;

/** P2a · Ticket thread — support conversation with a reply field. */
export function TicketScreen() {
  const [reply, setReply] = useState('');
  const send = () => {
    flash('Reply sent to the support desk');
    setReply('');
  };
  return (
    <ScreenContainer
      screen="ticket"
      contentStyle={styles.content}
      avoidKeyboard
    >
      <View style={styles.header}>
        <View style={styles.row9}>
          <Text style={styles.id}>TCK-4471</Text>
          <Pill
            label="AGENT REPLIED"
            bgColor="#eef3fe"
            border="#d6e2fb"
            fg="#1d4fd7"
          />
        </View>
        <Text style={styles.subject} leading={1.35}>
          Assay weight differs from my own scale
        </Text>
        <Text style={styles.meta}>Opened 8 Sep · about request MB-S-90412</Text>
      </View>
      <View style={styles.thread}>
        {THREAD.map((m, i) => (
          <ChatBubble
            key={i}
            mine={m.mine}
            who={m.who}
            text={m.text}
            time={m.time}
            delay={m.delay}
            duration={450}
            easing={ease.out}
            maxWidth="78%"
          />
        ))}
      </View>
      <View style={styles.reply}>
        <TextInput
          value={reply}
          onChangeText={setReply}
          placeholder="Write a reply…"
          placeholderTextColor="#a3abc4"
          selectionColor="#1e2a5a"
          cursorColor="#1e2a5a"
          multiline
          style={[inputFont, styles.replyInput]}
          accessibilityLabel="Reply"
        />
        <Pressable
          onPress={send}
          style={styles.send}
          accessibilityLabel="Send reply"
        >
          <Icon name="send" size={15} color="#fff" strokeWidth={2.2} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const TOPICS = [
  'Evaluation',
  'Payment',
  'Documents',
  'An order',
  'Something else',
];

/** P2b · New ticket — topic chips, related request and description. */
export function NewTicketScreen() {
  const topic = useApp(s => s.topic);
  const [description, setDescription] = useState('');
  return (
    <ScreenContainer
      screen="newTicket"
      contentStyle={styles.newContent}
      avoidKeyboard
    >
      <Text style={styles.title}>What do you need help with?</Text>
      <SectionLabel style={styles.label20}>TOPIC</SectionLabel>
      <View style={styles.topics}>
        {TOPICS.map(label => {
          const on = topic === label;
          return (
            <PressableScale
              key={label}
              activeScale={0.94}
              onPress={() => setAppState({ topic: label })}
              accessibilityState={{ selected: on }}
              style={[
                styles.topic,
                on
                  ? {
                      experimental_backgroundImage: gradients.navyButton,
                      borderColor: '#16204a',
                    }
                  : { backgroundColor: '#fff', borderColor: '#e2e5ec' },
              ]}
            >
              <Text
                style={[styles.topicText, { color: on ? '#fff' : '#606780' }]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <SectionLabel style={styles.label22}>RELATED TO</SectionLabel>
      <View style={styles.related}>
        <Text style={styles.relatedText}>MB-S-90412 · Gold Dust</Text>
        <Icon name="chevronDown" size={16} color="#8890ad" />
      </View>
      <SectionLabel style={styles.label22}>DESCRIBE THE ISSUE</SectionLabel>
      <View style={styles.describe}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us what happened and what you expected…"
          placeholderTextColor="#a3abc4"
          selectionColor="#1e2a5a"
          cursorColor="#1e2a5a"
          multiline
          textAlignVertical="top"
          style={[inputFont, styles.describeInput]}
          accessibilityLabel="Describe the issue"
        />
      </View>
      <DashedBox
        onPress={() => flash('Choose a photo or document')}
        pressScale={0.985}
        style={styles.attach}
      >
        <Icon name="paperclip" size={17} color="#1e2a5a" />
        <Text style={styles.attachText}>Attach a photo or document</Text>
      </DashedBox>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  newContent: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 26 },
  row9: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  header: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 15,
    boxShadow: shadows.xs,
  },
  id: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: '#8890ad' },
  subject: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 7,
  },
  meta: { fontSize: 11.5, color: '#8890ad', marginTop: 5 },
  thread: { marginTop: 16, gap: 12 },
  reply: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    boxShadow: shadows.hairline,
  },
  replyInput: { flex: 1, fontSize: 13, color: '#1a1f36', maxHeight: 96 },
  send: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#1e2a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  label20: { marginTop: 20, marginBottom: 10 },
  label22: { marginTop: 22, marginBottom: 8 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  topic: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 9999,
    borderWidth: 1,
    justifyContent: 'center',
  },
  topicText: { fontSize: 12.5, fontWeight: '600' },
  related: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    height: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: shadows.hairline,
  },
  relatedText: { fontSize: 14, fontWeight: '500', color: '#1a1f36' },
  describe: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    minHeight: 110,
    boxShadow: shadows.hairline,
  },
  describeInput: {
    fontSize: 13.5,
    lineHeight: 13.5 * 1.55,
    color: '#1a1f36',
    minHeight: 80,
  },
  attach: {
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  attachText: { fontSize: 13, fontWeight: '600', color: '#243258' },
});
