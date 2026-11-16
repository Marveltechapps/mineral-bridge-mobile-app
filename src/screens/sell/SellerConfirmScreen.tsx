import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { SELLPAY, SLOTS } from '../../context/store';
import type { AppState } from '../../context/state';
import { CheckRow, Chips, ErrBox, LabeledField, SummaryCard } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import { day } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from '../orders/orderVals';

/** "sellConfirm": seller confirmation form (payout, inspection & pickup). */
export function SellerConfirmScreen() {
  const store = useStore(), s = store.state, sc = s.sc, se = s.scErr || {};
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o);
  const setSc = (p: Partial<AppState['sc']>) => store.setState(x => ({ sc: { ...x.sc, ...p }, scErr: {} }));
  const days = Array.from({ length: 7 }, (_, i) => day(Date.now() + (i + 2) * 864e5));
  const upi = sc.method === 'UPI';
  const errList = Object.values(se).filter(Boolean).join(' · ');
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>HOW YOU WANT TO BE PAID</Label>
      <Chips list={SELLPAY} value={sc.method} onPick={v => setSc({ method: v })} />
      <View style={{ marginTop: 10, gap: 10 }}>
        <LabeledField label={upi ? 'ACCOUNT HOLDER NAME' : 'BANK OR WALLET NAME'} value={sc.bank} err={se.bank} onChangeText={t => setSc({ bank: t })} />
        <LabeledField label={upi ? 'UPI ID (e.g. name@bank)' : 'ACCOUNT / WALLET NUMBER'} value={sc.account} err={se.account} keyboard={upi ? 'email-address' : 'default'} onChangeText={t => setSc({ account: t })} />
      </View>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>INSPECTION & PICKUP DATE</Label>
      <Chips list={days} value={sc.date} onPick={v => setSc({ date: v })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>TIME</Label>
      <Chips list={SLOTS} value={sc.time} onPick={v => setSc({ time: v })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>LOCATION</Label>
      <LabeledField label="INSPECTION & PICKUP LOCATION" value={sc.address} err={se.address} onChangeText={t => setSc({ address: t })} />
      <View style={{ marginTop: 14, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.ink, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ marginTop: 1 }}><Icon d={IC.truck} size={18} color={c.gold} /></View>
        <View style={{ flex: 1 }}>
          <Txt s={13.5} w={600} c={c.paper}>Mineral Bridge inspects and collects</Txt>
          <Txt s={12.5} c={c.soft} lh={1.45} style={{ marginTop: 3 }}>Our inspector visits this location at the chosen time. After the reports are approved and you are paid, our logistics partner collects the product from the same place.</Txt>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <CheckRow r={16} pv={13} on={sc.c1} onPress={() => setSc({ c1: !sc.c1 })}>The product will be ready at this location for inspection and pickup.</CheckRow>
      </View>
      {errList ? <ErrBox>{errList}</ErrBox> : null}
    </FadeUp>
  );
}
