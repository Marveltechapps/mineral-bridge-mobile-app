import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Alert, Empty, FLabel, Input, KV, Press, Section, Summary } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm } from './orderVals';

/** Inspection reports (`scr_report`) — Mineral Bridge inspection + SGS test for sell requests. */
export function ReportScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), has = !!(o.company || o.sgs);
  const docOf = (type: string) => (o.docs || []).find(d => d.type === type);
  const open = (type: string) => { const d = docOf(type); if (d) store.openDoc({ t: type, num: d.number, oid: o.id }); };
  const link = (type: string, l: string) => (docOf(type) ? <Press onPress={() => open(type)} style={{ marginTop: 8, marginHorizontal: 2 }}><T s={13} w={800} c={D.GD}>{l}</T></Press> : null);
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      {!has ? <Empty icon="file" title="Reports not uploaded yet" msg="They appear here after the inspection." /> : null}
      {o.company ? (
        <>
          <Section t="1 · Mineral Bridge inspection" />
          <KV rows={[['Inspected by', o.company.by], ['Date', MB.fmt(o.company.at)], ['Result', o.company.result]]} />
          {link('inspection_report', 'Open inspection report')}
        </>
      ) : null}
      {o.sgs ? (
        <>
          <Section t="2 · Third-party test (SGS)" />
          <KV rows={[['Report no.', o.sgs.no], !!o.sell && ['Net weight', o.sell.qty + ' ' + o.sell.unit], !!(o.sell && o.sell.grade) && ['Grade', o.sell!.grade], !!o.sgs.result && ['Result', o.sgs.result], ['Issued', MB.fmt(o.sgs.at)]]} />
          {link('test_certificate', 'Open test report')}
        </>
      ) : null}
      {has ? (
        <>
          <FLabel t="Note (needed to request clarification)" mt={16} />
          <Input accessibilityLabel="Clarification note" multiline value={s.repNote} placeholder="What needs clarifying?" onChangeText={t => store.setState({ repNote: t, repErr: '' })} />
          <Alert msg={s.repErr} />
        </>
      ) : null}
    </View>
  );
}
