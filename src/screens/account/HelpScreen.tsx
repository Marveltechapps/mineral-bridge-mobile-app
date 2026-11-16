import React from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ListCard } from '../../components/ui/Blocks';
import { Icon } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

const CHANNELS: [string, string, string, string][] = [
  ['Phone', '+234 1 700 6400', 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z', 'tel:+23417006400'],
  ['SMS', '+234 803 700 6400', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'sms:+2348037006400'],
  ['Email', 'support@mineralbridge.com', 'M4 4h16v16H4zM22 6l-10 7L2 6', 'mailto:support@mineralbridge.com'],
  ['WhatsApp', '+234 803 700 6400', 'M3 21l1.6-5A9 9 0 1 1 8 19.4z', 'https://wa.me/2348037006400'],
];
const FAQ: [string, string][] = [
  ['Why is there no price on lots?', 'Prices depend on quantity and grade. After you place an order, Mineral Bridge sends a quotation for you to accept or decline.'],
  ['When do I pay?', 'After you accept the quotation and both sides sign the e-contract. Payment is confirmed by Mineral Bridge before dispatch.'],
  ['Who inspects the minerals?', 'Only minerals you sell to us are inspected. Our team checks quantity and condition at your site, then an independent third party such as SGS tests quality. Lots you buy come with their existing test report.'],
  ['How do I sell to Mineral Bridge?', 'Choose Sell, pick the mineral, add at least 3 photos, quantity, quality and any certificates, then submit. Our team will contact you to agree a price.'],
];

export function HelpScreen() {
  const store = useStore(), s = store.state;
  const { width } = useWindowDimensions();
  const w = Math.floor((width - 36 - 8) / 2);
  const open = (l: string, url: string) => { store.flash('Opening ' + l); Linking.openURL(url).catch(() => {}); };
  const supportChat = () => { const o = s.orders.find(x => !store.view(x).done) || s.orders[0]; if (o) store.go('chat', { oid: o.id }); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CHANNELS.map(([l, v, icon, url]) => (
          <Tap key={l} onPress={() => open(l, url)} style={{ width: w }}>
            <Card r={18} style={{ padding: 14 }}>
              <Icon d={icon} size={18} />
              <Txt s={14} w={600} style={{ marginTop: 10 }}>{l}</Txt>
              <Txt s={11.5} c={c.muted} style={{ marginTop: 2 }}>{v}</Txt>
            </Card>
          </Tap>
        ))}
      </View>
      <Tap onPress={supportChat} style={{ marginTop: 8, height: 52, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt s={14.5} w={600} c={c.paper}>Chat with support</Txt></Tap>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>FREQUENT QUESTIONS</Label>
      <ListCard>
        {FAQ.map(([q, a], i) => (
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
