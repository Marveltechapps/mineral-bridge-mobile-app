import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Alert, Check, FLabel, Input, Summary } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm, signedInUser } from './orderVals';

/** E-contract (`scr_contract`). "Sign e-contract" is the screen CTA. */
export function ContractScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), u = signedInUser(store), sell = o.kind === 'sell', amount = o.quote ? MB.money(o.quote.total) : '';
  const ct = s.om[o.id] && s.om[o.id].contract;
  const clauses: [string, string][] = ct && ct.clauses && ct.clauses.length ? ct.clauses.map(x => [x.h, x.text] as [string, string]) : [['E-contract', 'Loading the contract text from Mineral Bridge…']];
  if (ct && amount) clauses.unshift(['Price', amount]);
  const you = ct && ct.signatures && ct.signatures.customer ? 'Signed' : 'Pending', mb = ct && ct.signatures && ct.signatures.platform ? 'Signed' : 'Pending';
  const parties: [string, string][] = [['Buyer', sell ? 'Mineral Bridge Ltd' : u.business + ' (' + u.name + ')'], ['Seller', sell ? u.business + ' (' + u.name + ')' : 'Mineral Bridge Ltd']];
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      <View style={{ marginTop: 14, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 20, padding: 16 }}>
        {ct ? <T s={11} w={800} c={D.MUT} style={{ marginBottom: 10 }}>{'E-CONTRACT ' + ct.number}</T> : null}
        <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: D.BOR }}>
          {parties.map(([k, val]) => (
            <View key={k} style={{ flex: 1 }}>
              <T s={10.5} w={800} c={D.GD} ls={0.06}>{k.toUpperCase()}</T>
              <T s={13} w={800} style={{ marginTop: 3 }}>{val}</T>
            </View>
          ))}
        </View>
        {clauses.map(([k, val]) => (
          <View key={k} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: D.BOR }}>
            <T s={12} w={800}>{k}</T>
            <T s={12.5} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 2 }}>{val}</T>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
          <T s={12} w={600} c={D.MUT}>You: <T s={12} w={800}>{you}</T></T>
          <T s={12} w={600} c={D.MUT}>Mineral Bridge: <T s={12} w={800}>{mb}</T></T>
        </View>
      </View>
      <Check on={s.sign.read} text="I have read and agree to this e-contract." onPress={() => store.setState(x => ({ sign: { ...x.sign, read: !x.sign.read }, signErr: '' }))} />
      <FLabel t={'Type your full name to sign · ' + u.name} mt={16} />
      <Input accessibilityLabel="Signature" value={s.sign.name} placeholder={u.name} autoCapitalize="words" style={{ fontStyle: 'italic' }}
        onChangeText={t => store.setState(x => ({ sign: { ...x.sign, name: t }, signErr: '' }))} />
      <Alert msg={s.signErr} />
    </View>
  );
}
