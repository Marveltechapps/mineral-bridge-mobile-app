import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

/** Chat with Mineral Bridge: owns its scroll view and keeps the composer pinned to the bottom. */
export function ChatScreen() {
  const store = useStore(), s = store.state, insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const o = currentOrder(store);
  const msgs = o ? s.chat[o.id] || [] : [];
  useEffect(() => { const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50); return () => clearTimeout(t); }, [msgs.length]);
  if (!o) return null;
  const v = store.view(o);
  const actions = [
    ...(store.refundable(o) ? [{ l: 'Request a refund', tap: () => store.chatRefund(o) }] : []),
    ...(o.refund && !['declined', 'refunded'].includes(o.refund.status) ? [{ l: 'Refund status', tap: () => store.chatSay(o, 'What is the status of my refund ' + o.refund!.ref + '?', 'Refund ' + o.refund!.ref + ' for ' + MB.money(o.refund!.amount) + ' is ' + (({ requested: 'received and waiting for review', review: 'under review by our finance team', approved: 'approved and about to be sent', processing: 'being processed by the bank' } as Record<string, string>)[o.refund!.status] || o.refund!.status) + '. Refunds reach you 3–7 working days after approval.', 'trackRefund') }] : []),
    ...(o.hold === 'discrepancy' ? [{ l: 'Refund the difference', tap: () => store.chatRefund(o, true) }] : []),
    { l: 'Where is my order?', tap: () => store.chatSay(o, 'Where is my order?', o.id + ' is at: ' + v.headline + '. ' + v.next) },
    { l: 'Talk to a person', tap: () => store.chatSay(o, 'I would like to talk to a person.', 'An operations specialist will reply here within 2 working hours (Mon–Sat, 08:00–18:00 WAT).') },
  ];
  const send = () => {
    const t = s.msg.trim();
    if (!t) return;
    if (/refund|money back|reimburs/i.test(t)) { store.setState({ msg: '' }); return store.chatRefund(o, false, t); }
    store.setState(x => ({ msg: '', chat: { ...x.chat, [o.id]: [...(x.chat[o.id] || []), { me: true, text: t, at: Date.now() }] } }));
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18 }}>
        <FadeUp>
          <View style={st.ref}><Txt s={12} c={c.ink2}>{o.id + ' · ' + MB.titleOf(o)}</Txt></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -18 }} contentContainerStyle={{ gap: 7, paddingHorizontal: 18 }}>
            {actions.map(q => <Tap key={q.l} onPress={q.tap} style={st.quick}><Txt s={12.5} w={600}>{q.l}</Txt></Tap>)}
          </ScrollView>
          <View style={{ gap: 8, marginTop: 12 }}>
            {msgs.map((m, i) => m.me ? (
              <View key={i} style={[st.bubble, st.me]}>
                <Txt s={13.5} lh={1.45} c={c.paper}>{m.text}</Txt>
                <Txt s={10.5} c={c.faint} style={{ marginTop: 4 }}>You · {MB.fmt(m.at)}</Txt>
              </View>
            ) : (
              <View key={i} style={{ alignItems: 'flex-start', gap: 6 }}>
                <View style={[st.bubble, st.them]}>
                  <Txt s={13.5} lh={1.45}>{m.text}</Txt>
                  <Txt s={10.5} c={c.muted2} style={{ marginTop: 4 }}>Mineral Bridge · {MB.fmt(m.at)}</Txt>
                </View>
                {m.action === 'refund' && store.refundable(o) ? <Tap onPress={() => store.openRefund(o, { note: m.ctx || '' })} style={st.act}><Txt s={13} w={600} c={c.gold}>Open refund form</Txt></Tap> : null}
                {m.action === 'trackRefund' ? <Tap onPress={() => store.go('order', { oid: o.id })} style={st.act}><Txt s={13} w={600} c={c.gold}>View refund status</Txt></Tap> : null}
              </View>
            ))}
          </View>
        </FadeUp>
      </ScrollView>
      <View style={[st.bar, { paddingBottom: Math.max(insets.bottom, 24) + 4 }]}>
        <TextInput accessibilityLabel="Message" value={s.msg} onChangeText={t => store.setState({ msg: t })} placeholder="Write a message" placeholderTextColor="#8E8D93" onSubmitEditing={send} returnKeyType="send" allowFontScaling={false} style={st.input} />
        <Tap label="Send" onPress={send} style={st.send}><Icon d={IC.send} size={17} color={c.gold} sw={2} /></Tap>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  ref: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.chip },
  quick: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 99, backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  bubble: { maxWidth: '82%', paddingVertical: 11, paddingHorizontal: 14 },
  them: { alignSelf: 'flex-start', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  me: { alignSelf: 'flex-end', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18, backgroundColor: c.ink },
  act: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.ink },
  bar: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 8, paddingHorizontal: 18, backgroundColor: c.paper },
  input: { flex: 1, height: 48, borderRadius: 14, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, paddingHorizontal: 15, fontSize: 15, fontFamily: 'Geist-Regular', color: c.ink, paddingVertical: 0 },
  send: { width: 48, height: 48, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
});
