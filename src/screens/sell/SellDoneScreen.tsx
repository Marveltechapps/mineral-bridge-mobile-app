import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, NumDot, RefPill, SuccessBadge } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

const NEXT: [string, string][] = [['Review and price', 'Our operations team checks your request and contacts you to agree a price.'], ['E-contract', 'Both sides accept the price, then sign the e-contract.'], ['Inspection and payment', 'Mineral Bridge inspects the product at your site, SGS tests it, then payment is released before pickup.']];

export function SellDoneScreen() {
  const store = useStore(), s = store.state;
  const so = s.orders.find(o => o.id === s.oid);
  const summary = so && so.kind === 'sell' && so.sell ? so.sell.qty + ' ' + so.sell.unit + ' of ' + so.sell.name + ' · ' + so.sell.photos + ' photos' : '';
  return (
    <FadeUp style={{ paddingTop: 40, paddingHorizontal: 22, paddingBottom: 24 }}>
      <SuccessBadge />
      <Txt serif s={32} lh={1.05} ls={-0.3} center style={{ marginTop: 22 }}>Sell request submitted</Txt>
      <Txt s={14} c={c.muted} lh={1.5} center style={{ marginTop: 10 }}>{summary}. Nothing is sold until you accept a price and sign the e-contract.</Txt>
      <RefPill k="REF" v={so ? so.id : ''} />
      <Label style={{ marginTop: 24, marginHorizontal: 4, marginBottom: 8 }}>WHAT HAPPENS NEXT</Label>
      <Card style={{ paddingVertical: 2, paddingHorizontal: 16 }}>
        {NEXT.map(([t, b], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <NumDot n={i + 1} />
            <View style={{ flex: 1 }}>
              <Txt s={14} w={600}>{t}</Txt>
              <Txt s={12.5} c={c.muted} lh={1.45} style={{ marginTop: 2 }}>{b}</Txt>
            </View>
          </View>
        ))}
      </Card>
    </FadeUp>
  );
}
