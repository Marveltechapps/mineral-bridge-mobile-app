import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { PAY, TERMS } from '../../context/store';
import type { AppState } from '../../context/state';
import { Alert, Check, Chips, Field, FLabel, Input, Section, Summary } from '../../components/mb/kit';
import { currentOrder, orderIm } from './orderVals';

/** Payment details form for buy orders ("payInsp"). "Submit details" is the screen CTA. */
export function PayDetailsScreen() {
  const store = useStore(), s = store.state, pf = s.pf, pe = s.pfErr || {};
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o);
  const setPf = (p: Partial<AppState['pf']>) => store.setState(x => ({ pf: { ...x.pf, ...p }, pfErr: {} }));
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      <Section t="Payment method" />
      <Chips list={PAY} value={pf.method} onPick={m => setPf({ method: m })} />
      <Section t="Payment terms" />
      <Chips list={TERMS} value={pf.terms} onPick={t => setPf({ terms: t })} />
      <Section t="Billing" />
      <Field label="Billing name" mt={0} value={pf.billName} err={pe.billName} onChange={t => setPf({ billName: t })} />
      <Field label="Billing address" value={pf.billAddr} err={pe.billAddr} onChange={t => setPf({ billAddr: t })} />
      <FLabel t="Payment instructions (optional)" mt={12} />
      <Input accessibilityLabel="Payment instructions" multiline value={pf.instr} onChangeText={t => setPf({ instr: t })} />
      <Check on={pf.c1} text="The payment details above are correct." onPress={() => setPf({ c1: !pf.c1 })} />
      <Alert msg={Object.values(pe).filter(Boolean).join(' · ')} />
    </View>
  );
}
