import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Ic, jakarta, Rise, T } from '../../components/mb/base';
import { Empty, Press } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder } from './orderVals';

/** Chat with Mineral Bridge (`scr_chat`): quick actions, bubbles, composer pinned to the bottom. */
export function ChatScreen() {
  const store = useStore(), s = store.state, insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const o = currentOrder(store);
  const msgs = o ? s.chat[o.id] || [] : [];
  useEffect(() => { const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50); return () => clearTimeout(t); }, [msgs.length]);
  if (!o) return <Empty icon="chat" title="No orders to discuss yet" msg="Place an order or a sell request first." />;
  const v = store.view(o);
  const actions = [
    ...(store.refundable(o) ? [{ l: 'Request a refund', tap: () => store.chatRefund(o) }] : []),
    ...(o.refund && !['declined', 'refunded'].includes(o.refund.status) ? [{ l: 'Refund status', tap: () => store.chatSay(o, 'What is the status of my refund ' + o.refund!.ref + '?', 'Refund ' + o.refund!.ref + ' for ' + MB.money(o.refund!.amount) + ' is ' + (({ requested: 'received and waiting for review', review: 'under review by our finance team', approved: 'approved and about to be sent', processing: 'being processed by the bank' } as Record<string, string>)[o.refund!.status] || o.refund!.status) + '. Refunds reach you 3–7 working days after approval.', 'trackRefund') }] : []),
    ...(o.hold === 'discrepancy' ? [{ l: 'Refund the difference', tap: () => store.chatRefund(o, true) }] : []),
    { l: 'Where is my order?', tap: () => store.chatSay(o, 'Where is my order?', o.id + ' is at: ' + v.headline + '. ' + v.next) },
    { l: 'Talk to a person', tap: () => store.sendChat(o, 'I would like to talk to a person about ' + o.id + '.') },
  ];
  const send = () => {
    const t = s.msg.trim();
    if (!t) return;
    store.sendChat(o, t);
    if (/refund|money back|reimburs/i.test(t)) store.chatRefund(o, false, t, false);
  };
  return (
    <View style={{ flex: 1, backgroundColor: D.BG }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 7, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 4 }}>
        {actions.map(q => <Press key={q.l} onPress={q.tap} style={st.quick}><T s={12.5} w={800}>{q.l}</T></Press>)}
      </ScrollView>
      <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16, gap: 10 }}>
        {msgs.map((m, i) => (
          <Rise key={i} dur={250} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
            <View style={[st.bubble, m.me ? st.me : st.them]}>
              <T s={13.5} w={600} lh={1.45} c={m.me ? D.white : D.INK}>{m.text}</T>
              <T s={10.5} w={600} c={m.me ? D.navyFaint : D.MUT} style={{ marginTop: 4 }}>{(m.me ? 'You' : m.local ? 'Assistant' : 'Mineral Bridge') + ' · ' + MB.fmt(m.at)}</T>
            </View>
            {!m.me && m.action === 'refund' && store.refundable(o) ? <Press onPress={() => store.openRefund(o, { note: m.ctx || '' })} style={st.act}><T s={12.5} w={800} c={D.G}>Open refund form</T></Press> : null}
            {!m.me && m.action === 'trackRefund' ? <Press onPress={() => store.go('order', { oid: o.id })} style={st.act}><T s={12.5} w={800} c={D.G}>View refund status</T></Press> : null}
          </Rise>
        ))}
      </ScrollView>
      <View style={[st.bar, { paddingBottom: Math.max(18, insets.bottom) }]}>
        <TextInput accessibilityLabel="Message" value={s.msg} onChangeText={t => store.setState({ msg: t })} placeholder="Write a message" placeholderTextColor={D.placeholder} onSubmitEditing={send} returnKeyType="send" allowFontScaling={false}
          style={[st.input, { fontFamily: jakarta(600) }]} />
        <Press label="Send" onPress={send} style={st.send}><Ic name="send" s={18} c={D.GOLD} /></Press>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  quick: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR },
  bubble: { paddingVertical: 10, paddingHorizontal: 13 },
  them: { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4 },
  me: { backgroundColor: D.G, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 4, borderBottomLeftRadius: 18 },
  act: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 8, paddingHorizontal: 13, borderRadius: 11, backgroundColor: D.GOLD },
  bar: { flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 16, backgroundColor: D.BG },
  input: { flex: 1, minWidth: 0, height: 46, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.BOR, borderRadius: 999, paddingHorizontal: 16, fontSize: 14, color: D.INK, paddingVertical: 0 },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
});
