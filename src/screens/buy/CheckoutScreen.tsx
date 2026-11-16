import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { Address } from '../../types/mineralBridge';
import { Card, LabeledField, ListCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import { product } from '../../lib/mb4';
import { colors as c } from '../../theme';

const FIELDS: [keyof Address, string][] = [['org', 'COMPANY / RECEIVER'], ['street', 'STREET ADDRESS'], ['city', 'CITY'], ['country', 'COUNTRY'], ['contact', 'CONTACT PERSON'], ['mobile', 'MOBILE']];

export function CheckoutScreen() {
  const store = useStore(), s = store.state, u = s.user;
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <Label style={{ marginTop: 4, marginHorizontal: 4, marginBottom: 8 }}>BUYER</Label>
      <Card style={{ paddingVertical: 14, paddingHorizontal: 15 }}>
        <Txt s={14.5} w={600}>{u ? u.name + ' · ' + u.business : ''}</Txt>
        <Txt s={12.5} c={c.muted} style={{ marginTop: 3 }}>{u ? (u.phone || u.email) : ''} · KYC verified</Txt>
      </Card>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>ITEMS</Label>
      <ListCard>
        {s.cart.map(it => {
          const x = product(it.pid);
          if (!x) return null;
          const qty = it.uIn && it.uIn !== x.unit ? it.qIn + ' ' + it.uIn + ' (' + (+it.qty.toFixed(4)) + ' ' + x.unit + ')' : it.qty + ' ' + x.unit;
          return (
            <View key={it.pid} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair }}>
              <Txt s={13.5} w={600} style={{ flexShrink: 1 }}>{x.name}</Txt>
              <Txt s={13.5} mono>{qty}</Txt>
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
          <Txt s={13.5} c={c.muted}>Price</Txt>
          <Txt s={13.5} w={600}>By quotation</Txt>
        </View>
      </ListCard>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>DELIVERY ADDRESS</Label>
      <View style={{ gap: 10 }}>
        {FIELDS.map(([k, l]) => (
          <LabeledField key={k} label={l} value={s.ship[k] || ''} err={(s.shipErr || {})[k]} keyboard={k === 'mobile' ? 'phone-pad' : undefined}
            onChangeText={t => store.setState(x => ({ ship: { ...x.ship, [k]: t }, shipErr: { ...x.shipErr, [k]: '' } }))} />
        ))}
      </View>
    </FadeUp>
  );
}
