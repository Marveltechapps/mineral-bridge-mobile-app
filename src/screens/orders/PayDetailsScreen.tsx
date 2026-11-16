import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { PAY, TERMS } from '../../context/store';
import type { AppState } from '../../context/state';
import { CheckRow, Chips, ErrBox, Field, LabeledField, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label } from '../../components/ui/Txt';
import { currentOrder } from './orderVals';

/** "payInsp": payment details form for buy orders. */
export function PayDetailsScreen() {
  const store = useStore(), s = store.state, pf = s.pf, pe = s.pfErr || {};
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o);
  const setPf = (p: Partial<AppState['pf']>) => store.setState(x => ({ pf: { ...x.pf, ...p }, pfErr: {} }));
  const errList = Object.values(pe).filter(Boolean).join(' · ');
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>PAYMENT METHOD</Label>
      <Chips list={PAY} value={pf.method} onPick={v => setPf({ method: v })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>PAYMENT TERMS</Label>
      <Chips list={TERMS} value={pf.terms} onPick={v => setPf({ terms: v })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>BILLING</Label>
      <View style={{ gap: 10 }}>
        <LabeledField label="BILLING NAME" value={pf.billName} err={pe.billName} onChangeText={t => setPf({ billName: t })} />
        <LabeledField label="BILLING ADDRESS" value={pf.billAddr} err={pe.billAddr} onChangeText={t => setPf({ billAddr: t })} />
      </View>
      <Label s={9.5} style={{ marginTop: 10, marginHorizontal: 4, marginBottom: 5 }}>PAYMENT INSTRUCTIONS (OPTIONAL)</Label>
      <Field accessibilityLabel="Payment instructions" multiline value={pf.instr} onChangeText={t => setPf({ instr: t })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>CONFIRMATION</Label>
      <CheckRow r={16} pv={13} on={pf.c1} onPress={() => setPf({ c1: !pf.c1 })}>The payment details above are correct.</CheckRow>
      {errList ? <ErrBox>{errList}</ErrBox> : null}
    </FadeUp>
  );
}
