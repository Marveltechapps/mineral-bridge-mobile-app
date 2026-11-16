import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, CheckRow, ErrBox, Field, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder, userOrDemo } from './orderVals';

export function ContractScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o), u = userOrDemo(store), sell = o.kind === 'sell', amount = o.quote ? MB.money(o.quote.total) : '';
  const clauses: [string, string][] = [
    ['Product', sell && o.sell ? o.sell.name + ', ' + o.sell.qty + ' ' + o.sell.unit : MB.titleOf(o)], ['Price', amount || 'Per quotation'],
    sell ? ['Inspection', 'Mineral Bridge inspects the product on site, then an independent third party (SGS) tests it. Both parties must accept the reports.'] : ['Quality', 'As stated in the lot test report and certificate of analysis. No pre-purchase inspection is required.'],
    sell ? ['Payment', 'Released to the seller after inspection approval, before pickup.'] : ['Payment', 'Per the agreed payment terms, confirmed by Mineral Bridge before dispatch.'],
    ['Delivery', 'Insured transport by an approved logistics partner, with tracking.'], ['Disputes', 'Any discrepancy at delivery is recorded and resolved before completion.'],
  ];
  const you = o.log.some(l => l.text === 'E-contract signed by you') ? 'Signed' : 'Pending', mb = o.log.some(l => l.text === 'E-contract countersigned') ? 'Signed' : 'Pending';
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      <Card style={{ paddingVertical: 4, paddingHorizontal: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair }}>
          <View style={{ flex: 1 }}><Label s={9.5}>BUYER</Label><Txt s={13} w={600} style={{ marginTop: 4 }}>{sell ? 'Mineral Bridge Ltd' : u.business + ' (' + u.name + ')'}</Txt></View>
          <View style={{ flex: 1 }}><Label s={9.5}>SELLER</Label><Txt s={13} w={600} style={{ marginTop: 4 }}>{sell ? u.business + ' (' + u.name + ')' : 'Mineral Bridge Ltd'}</Txt></View>
        </View>
        {clauses.map(([k, v]) => (
          <View key={k} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <Txt s={12} w={600} c={c.goldInk}>{k}</Txt>
            <Txt s={13} lh={1.45} style={{ marginTop: 3 }}>{v}</Txt>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 12 }}>
          <Txt s={12.5} style={{ flex: 1 }}>You: <Txt s={12.5} w={700}>{you}</Txt></Txt>
          <Txt s={12.5} style={{ flex: 1 }}>Mineral Bridge: <Txt s={12.5} w={700}>{mb}</Txt></Txt>
        </View>
      </Card>
      <View style={{ marginTop: 12 }}>
        <CheckRow r={16} pv={13} on={s.sign.read} onPress={() => store.setState(x => ({ sign: { ...x.sign, read: !x.sign.read }, signErr: '' }))}>I have read and agree to this e-contract.</CheckRow>
      </View>
      <Label style={{ marginTop: 16, marginHorizontal: 4, marginBottom: 6 }}>TYPE YOUR FULL NAME TO SIGN · {u.name}</Label>
      <Field accessibilityLabel="Signature" serif fs={22} value={s.sign.name} placeholder={u.name} autoCapitalize="words" onChangeText={t => store.setState(x => ({ sign: { ...x.sign, name: t }, signErr: '' }))} />
      {s.signErr ? <ErrBox>{s.signErr}</ErrBox> : null}
    </FadeUp>
  );
}
