import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, CheckRow, ErrBox, Field, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder, signedInUser } from './orderVals';

export function ContractScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o), u = signedInUser(store), sell = o.kind === 'sell', amount = o.quote ? MB.money(o.quote.total) : '';
  const ct = s.om[o.id] && s.om[o.id].contract;
  const clauses: [string, string][] = ct && ct.clauses && ct.clauses.length ? ct.clauses.map(x => [x.h, x.text] as [string, string]) : [['E-contract', 'Loading the contract text from Mineral Bridge…']];
  if (ct && amount) clauses.unshift(['Price', amount]);
  const you = ct && ct.signatures && ct.signatures.customer ? 'Signed' : 'Pending', mb = ct && ct.signatures && ct.signatures.platform ? 'Signed' : 'Pending';  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      {ct ? <Txt mono s={11.5} c={c.muted} style={{ marginTop: 10, marginHorizontal: 4 }}>{'E-contract ' + ct.number}</Txt> : null}
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
