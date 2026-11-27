import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { SELLPAY, SLOTS } from '../../context/store';
import type { AppState } from '../../context/state';
import { Ic, T } from '../../components/mb/base';
import { Alert, Check, Chips, Field, Note, Section, Summary } from '../../components/mb/kit';
import { day } from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm } from '../orders/orderVals';

/** Seller confirmation form (`scr_sellConfirm`): payout, inspection & pickup. "Submit form" is the screen CTA. */
export function SellerConfirmScreen() {
  const store = useStore(), s = store.state, sc = s.sc, se = s.scErr || {};
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o);
  const setSc = (p: Partial<AppState['sc']>) => store.setState(x => ({ sc: { ...x.sc, ...p }, scErr: {} }));
  const days = Array.from({ length: 7 }, (_, i) => day(Date.now() + (i + 2) * 864e5));
  const upi = sc.method === 'UPI';
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      {o.hold === 'changes' ? <Note mt={12} bg={D.amberBg} fg={D.amberInk}>{'Changes requested: ' + (o.holdNote || 'please choose an inspection date within the next 10 days.')}</Note> : null}
      <Section t="How you want to be paid" />
      <Chips list={SELLPAY} value={sc.method} onPick={m => setSc({ method: m })} />
      <Field label={upi ? 'Account holder name' : 'Bank or wallet name'} value={sc.bank} err={se.bank} onChange={t => setSc({ bank: t })} />
      <Field label={upi ? 'UPI ID (e.g. name@bank)' : 'Account / wallet number'} value={sc.account} err={se.account} keyboard={upi ? 'email-address' : 'default'} autoCapitalize="none" onChange={t => setSc({ account: t })} />
      <Section t="Inspection & pickup date" />
      <Chips list={days} value={sc.date} onPick={d => setSc({ date: d })} />
      <Section t="Time" />
      <Chips list={SLOTS} value={sc.time} onPick={t => setSc({ time: t })} />
      <Field label="Inspection & pickup location" value={sc.address} err={se.address} onChange={t => setSc({ address: t })} />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: D.G }}>
        <Ic name="truck" s={20} c={D.GOLD} />
        <View style={{ flex: 1 }}>
          <T s={13.5} w={800} c={D.white}>Mineral Bridge inspects and collects</T>
          <T s={12} w={600} c={D.navyMute} lh={1.45} style={{ marginTop: 3 }}>Our inspector visits this location at the chosen time. After the reports are approved and you are paid, our logistics partner collects the product from the same place.</T>
        </View>
      </View>
      <Check on={sc.c1} text="The product will be ready at this location for inspection and pickup." onPress={() => setSc({ c1: !sc.c1 })} />
      <Alert msg={Object.values(se).filter(Boolean).join(' · ')} />
    </View>
  );
}
