import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { ContactRow, Press, Summary } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { NavyCard } from './OrderTrackingScreen';
import { contactItems, currentOrder, orderIm } from './orderVals';

/** Quotation (`scr_quote`). Accept / Decline are the screen CTAs. */
export function QuoteScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), q = o.quote, amount = q ? MB.money(q.total) : '', est = !!(q && q.est), qdoc = (o.docs || []).find(d => d.type === 'quotation');
  const lines: [string, string][] = o.kind === 'sell' && o.sell ? [[o.sell.name + ' · ' + o.sell.qty + ' ' + o.sell.unit, amount]] : o.items.map(it => {
    const p = MB.product(it.pid), ov0 = MB.orderValue(o), share = q && p && ov0 > 0 ? q.total * (p.ref * it.qty) / ov0 : 0;
    return [(p ? p.name : it.name || it.pid) + ' · ' + it.qty + ' ' + MB.unitOfItem(it), share > 0 ? MB.money(share) : '—'];
  });
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      <NavyCard style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <T s={10.5} w={800} c={D.GOLD} ls={0.08}>{est ? 'QUOTATION · ESTIMATE' : 'QUOTATION'}</T>
          <T s={12} w={800} c={D.white}>{q ? q.no + (q.rev ? ' · revision ' + q.rev : '') : ''}</T>
        </View>
        {lines.map(([n, a], i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
            <T s={13} w={600} c={D.navyMute} style={{ flexShrink: 1 }}>{n}</T>
            <T s={13} w={800} c={D.white}>{a}</T>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,.14)', marginVertical: 14 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T s={13} w={700} c={D.navyMute}>{est ? 'Estimated total' : 'Total'}</T>
          <T s={26} w={800} c={D.GOLD}>{amount}</T>
        </View>
        <T s={12} w={600} c={D.navyMute} lh={1.45} style={{ marginTop: 10 }}>{(est ? 'Indicative total from list prices. The binding price, fees and transport are on the quotation document. ' : '') + (o.kind === 'sell' ? 'Price for the full quantity, subject to third-party inspection. Payment is released after the inspection is approved.' : 'Final payment terms are set in the e-contract.')}</T>
        {!est && q ? <T s={11} w={600} c={D.navyFaint} style={{ marginTop: 8 }}>{'Issued ' + MB.fmt(q.issued) + ' · valid until ' + MB.fmt(q.valid)}</T> : null}
        {qdoc ? <Press onPress={() => store.openDoc({ t: 'quotation', num: qdoc.number, oid: o.id })} style={{ marginTop: 10 }}><T s={12.5} w={800} c={D.GOLD}>{'View quotation document ' + qdoc.number}</T></Press> : null}
      </NavyCard>
      <T s={13} w={700} c={D.MUT} style={{ marginTop: 16, marginHorizontal: 2, marginBottom: 10 }}>Questions about the price? Talk to the trading desk first.</T>
      <ContactRow items={contactItems(store)} />
    </View>
  );
}
