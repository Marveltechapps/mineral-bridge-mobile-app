import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Ic, jakarta, Rise, T } from '../../components/mb/base';
import { Alert, Note, Pill, Press } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { statusTone, topicLabel } from './supportVals';

/** One support conversation: history + reply composer. `supRef === ''` starts a new one. */
export function SupportThreadScreen() {
  const store = useStore(), s = store.state, insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const isNew = !s.supRef, th = s.supThread && s.supThread.ref === s.supRef ? s.supThread : null, msgs = th ? th.messages : [];
  useEffect(() => { const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50); return () => clearTimeout(t); }, [msgs.length]);
  const tone = th ? statusTone(th.status) : null;
  const send = () => store.sendSupport();
  return (
    <View style={{ flex: 1, backgroundColor: D.BG }}>
      <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR }}>
          <T s={12} w={700} c={D.MUT} style={{ flex: 1 }} lines={1}>{isNew ? 'New conversation with Mineral Bridge support' : s.supRef + ' · ' + topicLabel(th ? th.topic : 'general')}</T>
          {tone ? <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} /> : null}
        </View>
        {isNew ? <Note mt={12}>Tell us what you need. Include an order number if it is about an order. We usually reply within one working day.</Note> : null}
        {!isNew && !th && s.supThreadLoading ? <T s={13} w={600} c={D.MUT} center style={{ marginTop: 20 }}>Loading conversation…</T> : null}
        <View style={{ gap: 10, marginTop: 12 }}>
          {msgs.map(m => (m.system ? (
            <T key={m.id} s={11.5} w={600} c={D.MUT} center>{m.text}</T>
          ) : (
            <Rise key={m.id} dur={250} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <View style={[st.bubble, m.me ? st.me : st.them]}>
                <T s={13.5} w={600} lh={1.45} c={m.me ? D.white : D.INK}>{m.text}</T>
                <T s={10.5} w={600} c={m.me ? D.navyFaint : D.MUT} style={{ marginTop: 4 }}>{(m.me ? 'You' : m.who) + ' · ' + MB.fmt(m.at)}</T>
              </View>
            </Rise>
          )))}
        </View>
        <Alert msg={s.supErr} />
        {th && th.status === 'resolved' ? <Note>This conversation was marked resolved. Sending a message reopens it.</Note> : null}
      </ScrollView>
      <View style={[st.bar, { paddingBottom: Math.max(18, insets.bottom) }]}>
        <TextInput accessibilityLabel="Message" value={s.supMsg} onChangeText={t => store.setState({ supMsg: t.slice(0, 4000), supErr: '' })} placeholder={isNew ? 'How can we help?' : 'Write a reply'} placeholderTextColor={D.placeholder}
          onSubmitEditing={send} returnKeyType="send" allowFontScaling={false} editable={!s.supBusy} style={[st.input, { fontFamily: jakarta(600) }]} />
        <Press label="Send" onPress={send} disabled={s.supBusy} style={[st.send, { opacity: s.supBusy || !s.supMsg.trim() ? 0.55 : 1 }]}><Ic name="send" s={18} c={D.GOLD} /></Press>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bubble: { paddingVertical: 10, paddingHorizontal: 13 },
  them: { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4 },
  me: { backgroundColor: D.G, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 4, borderBottomLeftRadius: 18 },
  bar: { flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 16, backgroundColor: D.BG },
  input: { flex: 1, minWidth: 0, height: 46, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.BOR, borderRadius: 999, paddingHorizontal: 16, fontSize: 14, color: D.INK, paddingVertical: 0 },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
});
