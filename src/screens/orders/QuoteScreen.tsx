import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ContactGrid, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { contactItems, currentOrder } from './orderVals';

export function QuoteScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o), q = o.quote, amount = q ? MB.money(q.total) : '';
  const lines = o.kind === 'sell' && o.sell ? [{ n: o.sell.name, q: o.sell.qty + ' ' + o.sell.unit, a: amount }] : o.items.map(it => {
    const p = MB.product(it.pid);
    const share = q && p ? q.total * (p.ref * it.qty) / MB.orderValue(o) : 0;
    return { n: p ? p.name : '', q: it.qty + ' ' + (p ? p.unit : ''), a: MB.money(share) };
  });
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      <Card style={{ padding: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label>QUOTATION</Label>
          <Txt mono s={11.5}>{q ? q.no + (q.rev ? ' · revision ' + q.rev : '') : ''}</Txt>
        </View>
        {lines.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <Txt s={13.5} style={{ flexShrink: 1 }}>{l.n} · {l.q}</Txt>
            <Txt s={13.5} mono w={600}>{l.a}</Txt>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14 }}>
          <Txt s={14} w={600}>Total</Txt>
          <Txt mono s={22} w={600}>{amount}</Txt>
        </View>
        <Txt s={12} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>{o.kind === 'sell' ? 'Price for the full quantity, subject to third-party inspection. Payment is released after the inspection is approved.' : 'Includes product, 1.2% verification and escrow fee, and insured transport. Final payment terms are set in the e-contract.'}</Txt>
        <Txt s={12} c={c.muted} style={{ marginTop: 6 }}>Issued {q ? MB.fmt(q.issued) : ''} · valid until {q ? MB.fmt(q.valid) : ''}</Txt>
      </Card>
      <Txt s={13} c={c.ink2} style={{ marginTop: 14, marginHorizontal: 4, marginBottom: 8 }}>Questions about the price? Talk to the trading desk first.</Txt>
      <ContactGrid items={contactItems(store)} />
    </FadeUp>
  );
}
