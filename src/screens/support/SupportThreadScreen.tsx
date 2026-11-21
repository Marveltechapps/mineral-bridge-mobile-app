import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { ErrBox, InfoBox, Pill } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { statusTone, topicLabel } from './supportVals';

/** One support conversation: history + reply composer (owns its scroll view like the order chat). `supRef === ''` starts a new one. */
export function SupportThreadScreen() {
  const store = useStore(), s = store.state, insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const isNew = !s.supRef, th = s.supThread && s.supThread.ref === s.supRef ? s.supThread : null, msgs = th ? th.messages : [];
  useEffect(() => { const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50); return () => clearTimeout(t); }, [msgs.length]);
  const tone = th ? statusTone(th.status) : null;
  const send = () => store.sendSupport();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18 }}>
        <FadeUp>
          <View style={st.ref}>
            <Txt s={12} c={c.ink2} style={{ flex: 1 }} lines={1}>{isNew ? 'New conversation with Mineral Bridge support' : (s.supRef + ' · ' + topicLabel(th ? th.topic : 'general'))}</Txt>
            {tone ? <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} /> : null}
          </View>
          {isNew ? <InfoBox mt={12}>Tell us what you need. Include an order number if it is about an order. We usually reply within one working day.</InfoBox> : null}
          {!isNew && !th && s.supThreadLoading ? <Txt s={13} c={c.muted} center style={{ marginTop: 20 }}>Loading conversation…</Txt> : null}
          <View style={{ gap: 8, marginTop: 12 }}>
            {msgs.map(m => m.system ? (
              <View key={m.id} style={{ alignItems: 'center' }}><Txt s={11.5} c={c.muted2} center>{m.text}</Txt></View>
            ) : m.me ? (
              <View key={m.id} style={[st.bubble, st.me]}>
                <Txt s={13.5} lh={1.45} c={c.paper}>{m.text}</Txt>
                <Txt s={10.5} c={c.faint} style={{ marginTop: 4 }}>You · {MB.fmt(m.at)}</Txt>
              </View>
            ) : (
              <View key={m.id} style={[st.bubble, st.them]}>
                <Txt s={13.5} lh={1.45}>{m.text}</Txt>
                <Txt s={10.5} c={c.muted2} style={{ marginTop: 4 }}>{m.who} · {MB.fmt(m.at)}</Txt>
              </View>
            ))}
          </View>
          {s.supErr ? <ErrBox>{s.supErr}</ErrBox> : null}
          {th && th.status === 'resolved' ? <InfoBox mt={14}>This conversation was marked resolved. Sending a message reopens it.</InfoBox> : null}
        </FadeUp>
      </ScrollView>
      <View style={[st.bar, { paddingBottom: Math.max(insets.bottom, 24) + 4 }]}>
        <TextInput accessibilityLabel="Message" value={s.supMsg} onChangeText={t => store.setState({ supMsg: t.slice(0, 4000), supErr: '' })} placeholder={isNew ? 'How can we help?' : 'Write a reply'} placeholderTextColor="#8E8D93"
          onSubmitEditing={send} returnKeyType="send" allowFontScaling={false} editable={!s.supBusy} style={st.input} />
        <Tap label="Send" onPress={send} disabled={s.supBusy} style={[st.send, { opacity: s.supBusy || !s.supMsg.trim() ? 0.55 : 1 }]}><Icon d={IC.send} size={17} color={c.gold} sw={2} /></Tap>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  ref: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.chip },
  bubble: { maxWidth: '82%', paddingVertical: 11, paddingHorizontal: 14 },
  them: { alignSelf: 'flex-start', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  me: { alignSelf: 'flex-end', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18, backgroundColor: c.ink },
  bar: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 8, paddingHorizontal: 18, backgroundColor: c.paper },
  input: { flex: 1, height: 48, borderRadius: 14, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, paddingHorizontal: 15, fontSize: 15, fontFamily: 'Geist-Regular', color: c.ink, paddingVertical: 0 },
  send: { width: 48, height: 48, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
});
