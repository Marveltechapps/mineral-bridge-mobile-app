import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Blip, FadeUp, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { Photo } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash, go } from '../../navigation/flow';
import { fontFamilyFor, gradients, layout, shadows } from '../../theme';
import { ChatBubble } from '../../components/profile/ChatBubble';
import { QUICK_REPLIES, useChat } from '../../lib/hooks/useChat';

/** P2c · Live chat — real-time conversation with the verification desk. */
export function ChatScreen() {
  const chat = useChat();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const hasDraft = !!chat.draft;
  const seen = useRef(chat.messages.length + (chat.typing ? 1 : 0));

  // Follow the conversation as messages arrive (but open at the top, as designed).
  useEffect(() => {
    const count = chat.messages.length + (chat.typing ? 1 : 0);
    if (count === seen.current) return;
    seen.current = count;
    const t = setTimeout(
      () => scroll.current?.scrollToEnd({ animated: true }),
      60,
    );
    return () => clearTimeout(t);
  }, [chat.messages.length, chat.typing]);

  const endChat = () => {
    flash('Chat ended — a transcript was emailed to you');
    go('support');
  };

  const composer = (
    <View
      style={[
        styles.composer,
        { paddingBottom: Math.max(layout.ctaWellPadding, insets.bottom) },
      ]}
    >
      <PressableScale
        activeScale={0.9}
        onPress={() => flash('Attach a photo or document')}
        accessibilityLabel="Attach"
        style={styles.attach}
      >
        <Icon name="paperclip" size={18} color="#33406e" />
      </PressableScale>
      <View style={styles.inputBox}>
        <TextInput
          value={chat.draft}
          onChangeText={chat.setDraft}
          placeholder="Write a message…"
          placeholderTextColor="#a3abc4"
          selectionColor="#1e2a5a"
          cursorColor="#1e2a5a"
          returnKeyType="send"
          onSubmitEditing={chat.send}
          submitBehavior="submit"
          style={styles.input}
          accessibilityLabel="Message"
        />
      </View>
      <PressableScale
        activeScale={0.9}
        onPress={chat.send}
        accessibilityLabel="Send"
        style={[
          styles.send,
          hasDraft
            ? {
                experimental_backgroundImage: gradients.navyButton,
                boxShadow:
                  '0 1px 2px rgba(16,24,40,0.10), 0 4px 12px rgba(16,24,40,0.14)',
              }
            : { backgroundColor: '#e5e7ec' },
        ]}
      >
        <Icon
          name="send"
          size={18}
          color={hasDraft ? '#fff' : '#a3abc4'}
          strokeWidth={2.2}
        />
      </PressableScale>
    </View>
  );

  return (
    <ScreenContainer
      screen="chat"
      contentStyle={styles.content}
      footer={composer}
      avoidKeyboard
      scrollRef={scroll}
    >
      <View style={styles.agent}>
        <View>
          <View style={styles.avatar}>
            <Text style={styles.initials}>NA</Text>
          </View>
          <View style={styles.online} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.agentName}>Ngozi A.</Text>
          <View style={styles.statusRow}>
            <Blip duration={1600} style={styles.statusDot} />
            <Text style={styles.statusText}>
              Online · replies in about 2 min
            </Text>
          </View>
        </View>
        <PressableScale
          activeScale={0.92}
          onPress={endChat}
          accessibilityLabel="End chat"
          style={styles.end}
        >
          <Icon name="close" size={16} color="#c0392b" strokeWidth={2.2} />
        </PressableScale>
      </View>

      <Text style={styles.day}>Today · 14:06</Text>

      <View style={styles.thread}>
        <FadeUp
          duration={400}
          delay={400}
          easing={ease.out}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <Photo name="gold-dust" style={styles.cardThumb} />
            <View style={styles.cardText}>
              <Text style={styles.cardRef}>MB-S-90412</Text>
              <Text style={styles.cardName}>Gold Dust · 250 kg</Text>
            </View>
          </View>
          <PressableScale
            activeScale={0.985}
            onPress={() => go('sEval')}
            style={styles.cardLink}
          >
            <Text style={styles.cardLinkText}>Open this request</Text>
            <Icon name="chevronRight" size={15} color="#b9c0d6" />
          </PressableScale>
        </FadeUp>
        {chat.messages.map((m, i) => (
          <ChatBubble
            key={i}
            mine={m.who === 'u'}
            text={m.text}
            time={m.time}
            read={!!m.read}
            delay={i * 40}
            maxWidth="80%"
          />
        ))}
        {chat.typing ? (
          <View style={styles.typing} accessibilityLabel="Ngozi is typing">
            {[0, 200, 400].map(d => (
              <Blip
                key={d}
                duration={1200}
                delay={d}
                style={styles.typingDot}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.quick}>
        {QUICK_REPLIES.map(label => (
          <PressableScale
            key={label}
            activeScale={0.94}
            onPress={() => chat.setDraft(label)}
            style={styles.quickChip}
          >
            <Text style={styles.quickText}>{label}</Text>
          </PressableScale>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12 },
  flex: { flex: 1 },
  agent: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.xs,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    experimental_backgroundImage: gradients.navyAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#f3d27a', fontSize: 14, fontWeight: '700' },
  online: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#fff',
  },
  agentName: { fontSize: 14.5, fontWeight: '600', color: '#1a1f36' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  statusText: { fontSize: 11.5, color: '#15803d', fontWeight: '600' },
  end: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fdeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#606780',
  },
  thread: { paddingTop: 8, paddingHorizontal: 20, gap: 11 },
  card: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: shadows.xs,
  },
  cardTop: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  cardThumb: { width: 44, height: 44, borderRadius: 10 },
  cardText: { flexShrink: 1 },
  cardRef: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#8890ad',
  },
  cardName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 3,
  },
  cardLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLinkText: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
  typing: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#b9c0d6',
  },
  quick: {
    paddingTop: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6e2fb',
    justifyContent: 'center',
  },
  quickText: { color: '#1d4fd7', fontSize: 12, fontWeight: '600' },
  composer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f4f5f7',
    borderTopWidth: 1,
    borderTopColor: '#e5e7ec',
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  attach: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingHorizontal: 14,
    justifyContent: 'center',
    boxShadow: shadows.hairline,
  },
  input: {
    fontFamily: fontFamilyFor('400', false),
    fontSize: 13.5,
    color: '#1a1f36',
    padding: 0,
    includeFontPadding: false,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
