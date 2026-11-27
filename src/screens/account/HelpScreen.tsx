import React from 'react';
import { Linking, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Rise, T } from '../../components/mb/base';
import { Btn, Card, IconTile, Press, Row, Section } from '../../components/mb/kit';
import { D } from '../../theme';

/** Help & support (`scr_help`). Contacts and FAQs come from the support API. */
export function HelpScreen() {
  const store = useStore(), s = store.state;
  const ct = s.contacts, faqs = s.faqs || [];
  const channels: [string, string, string, string][] = ct ? [['Phone', ct.phone, 'tel:' + ct.phone.replace(/\s/g, ''), 'phone'], ['SMS', ct.phone, 'sms:' + ct.phone.replace(/\s/g, ''), 'msg'], ['Email', ct.email, 'mailto:' + ct.email, 'mail'], ['WhatsApp', ct.whatsapp, 'https://wa.me/' + ct.whatsapp.replace(/\D/g, ''), 'wa']] : [];
  const open = (l: string, url: string) => { Linking.openURL(url).catch(() => store.flash('Could not open ' + l.toLowerCase() + ' on this device')); };
  const supportChat = () => { if (!s.user) return store.flash('Sign in to message support. You can still call, email or WhatsApp us.'); store.go('support'); };
  const rows: [string, string, string, string][][] = [channels.slice(0, 2), channels.slice(2, 4)].filter(r => r.length);
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 24 }}>
      {ct ? (
        <View style={{ gap: 8 }}>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              {r.map(([l, v, url, icn]) => (
                <Press key={l} onPress={() => open(l, url)} style={{ flex: 1, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 14 }}>
                  <IconTile icon={icn} bg={D.G} c={D.GOLD} s={17} />
                  <T s={14} w={800} style={{ marginTop: 10 }}>{l}</T>
                  <T s={11.5} w={600} c={D.MUT} style={{ marginTop: 1 }}>{v}</T>
                </Press>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Card style={{ paddingVertical: 16, alignItems: 'center' }}>
          <T s={13} w={600} c={D.MUT} center>{s.faqs === null ? 'Loading contact details…' : 'Contact details are unavailable right now.'}</T>
          <Press onPress={() => void store.task(store.remote.loadFaqs())} style={{ marginTop: 8 }}><T s={13} w={800} c={D.GD}>Retry</T></Press>
        </Card>
      )}
      <View style={{ marginTop: 10 }}><Btn label="Chat with support" icon="chat" onPress={supportChat} /></View>
      <Section t="Frequent questions" />
      <Card>
        {faqs.map(({ q, a }, i) => (
          <Row key={q} last={i === faqs.length - 1} pv={13} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }} onPress={() => store.setState({ faq: s.faq === i ? -1 : i })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }} accessibilityState={{ expanded: s.faq === i }}>
              <T s={13.5} w={800} style={{ flex: 1 }}>{q}</T>
              <T s={18} w={800} c={D.GD} lh={1}>{s.faq === i ? '−' : '+'}</T>
            </View>
            {s.faq === i ? <Rise dur={200}><T s={12.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 6 }}>{a}</T></Rise> : null}
          </Row>
        ))}
      </Card>
    </View>
  );
}
