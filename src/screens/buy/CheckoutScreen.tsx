import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { Address } from '../../types/mineralBridge';
import { T } from '../../components/mb/base';
import { Card, Field, KV, Section } from '../../components/mb/kit';
import { num, product } from '../../lib/mb4';
import { D } from '../../theme';

const FIELDS: [keyof Address, string][] = [['org', 'Company / receiver'], ['street', 'Street address'], ['city', 'City'], ['country', 'Country'], ['contact', 'Contact person'], ['mobile', 'Mobile']];
const nf = (v: number) => num(+v.toFixed(4), 4);

/** Checkout (`scr_checkout`): buyer, items, delivery address. "Place order" is the screen CTA. */
export function CheckoutScreen() {
  const store = useStore(), s = store.state, u = s.user, e = s.shipErr || {};
  const items: [string, string][] = s.cart.map(it => {
    const x = product(it.pid), unit = x ? x.unit : it.unit || '';
    return [x ? x.name : it.name || it.pid, it.uIn && it.uIn !== unit ? it.qIn + ' ' + it.uIn + ' (' + nf(it.qty) + ' ' + unit + ')' : nf(it.qty) + ' ' + unit];
  });
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Section t="Buyer" />
      <Card>
        <View style={{ paddingVertical: 10 }}>
          <T s={14} w={800}>{u ? u.name + ' · ' + u.business : ''}</T>
          <T s={12} w={600} c={D.green} style={{ marginTop: 2 }}>{(u ? u.phone || u.email : '') + ' · KYC verified'}</T>
        </View>
      </Card>
      <Section t="Items" />
      <KV rows={[...items, ['Price', 'By quotation']]} />
      <Section t="Delivery address" />
      {FIELDS.map(([k, l]) => (
        <Field key={k} label={l} value={s.ship[k] || ''} err={e[k]} keyboard={k === 'mobile' ? 'phone-pad' : undefined}
          onChange={t => store.setState(x => ({ ship: { ...x.ship, [k]: t }, shipErr: {} }))} />
      ))}
    </View>
  );
}
