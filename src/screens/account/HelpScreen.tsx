import React from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ListCard } from '../../components/ui/Blocks';
import { Icon } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

const ICONS: Record<string, string> = {
  Phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  SMS: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  Email: 'M4 4h16v16H4zM22 6l-10 7L2 6',
  WhatsApp: 'M3 21l1.6-5A9 9 0 1 1 8 19.4z',
};
export function HelpScreen() {
  const store = useStore(), s = store.state;
  const { width } = useWindowDimensions();
  const w = Math.floor((width - 36 - 8) / 2);
  const ct = s.contacts, faqs = s.faqs || [];
  const channels: [string, string, string][] = ct ? [['Phone', ct.phone, 'tel:' + ct.phone.replace(/\s/g, '')], ['SMS', ct.phone, 'sms:' + ct.phone.replace(/\s/g, '')], ['Email', ct.email, 'mailto:' + ct.email], ['WhatsApp', ct.whatsapp, 'https://wa.me/' + ct.whatsapp.replace(/\D/g, '')]] : [];
  const open = (l: string, url: string) => { Linking.openURL(url).catch(() => store.flash('Could not open ' + l.toLowerCase() + ' on this device')); };
  const supportChat = () => { if (!s.user) return store.flash('Sign in to message support. You can still call, email or WhatsApp us.'); store.go('support'); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {channels.map(([l, v, url]) => (
          <Tap key={l} onPress={() => open(l, url)} style={{ width: w }}>
            <Card r={18} style={{ padding: 14 }}>
              <Icon d={ICONS[l]} size={18} />
              <Txt s={14} w={600} style={{ marginTop: 10 }}>{l}</Txt>
              <Txt s={11.5} c={c.muted} style={{ marginTop: 2 }}>{v}</Txt>
            </Card>
          </Tap>
        ))}
      </View>
      {!ct ? <Card style={{ paddingVertical: 18, paddingHorizontal: 16 }}><Txt s={13} c={c.muted} center>{s.faqs === null ? 'Loading contact details…' : 'Contact details are unavailable right now.'}</Txt><Tap onPress={() => void store.task(store.remote.loadFaqs())} style={{ marginTop: 8, alignSelf: 'center' }}><Txt s={13} w={600} c={c.goldInk}>Retry</Txt></Tap></Card> : null}
      <Tap onPress={supportChat} style={{ marginTop: 8, height: 52, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt s={14.5} w={600} c={c.paper}>Chat with support</Txt></Tap>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>FREQUENT QUESTIONS</Label>
      <ListCard>
        {faqs.map(({ q, a }, i) => (
          <Tap key={q} accessibilityState={{ expanded: s.faq === i }} onPress={() => store.setState({ faq: s.faq === i ? -1 : i })} style={{ paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Txt s={14} w={600} style={{ flex: 1 }}>{q}</Txt>
              <Txt s={18} c={c.goldInk}>{s.faq === i ? '−' : '+'}</Txt>
            </View>
            {s.faq === i ? <Txt s={13} c={c.ink2} lh={1.5} style={{ marginTop: 7 }}>{a}</Txt> : null}
          </Tap>
        ))}
      </ListCard>
    </FadeUp>
  );
}
