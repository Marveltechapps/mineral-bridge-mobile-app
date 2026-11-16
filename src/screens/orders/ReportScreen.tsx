import React from 'react';
import { useStore } from '../../context/AppStore';
import { Card, ErrBox, Field, KV, ListCard, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

/** Inspection reports (Mineral Bridge inspection + SGS) for sell requests. */
export function ReportScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o);
  const rows: [string, string][] = o.kind === 'sell' && o.sell
    ? [['Net weight', o.sell.qty + ' ' + o.sell.unit], ['Grade', o.sell.grade], ['Sampling', 'ISO 3082 composite'], ['Result', 'Compliant']]
    : (o.items.map(it => { const p = MB.product(it.pid); return [p ? p.name : '', it.qty + ' ' + (p ? p.unit + ' · ' + p.grade : '')] as [string, string]; }) as [string, string][]).concat([['Sampling', 'ISO 3082 composite'], ['Result', 'Compliant']]);
  const has = !!(o.company || o.sgs);
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      {!has ? (
        <Card style={{ marginTop: 12, padding: 22, alignItems: 'center' }}>
          <Txt s={15} w={600}>Reports not uploaded yet</Txt>
          <Txt s={13} c={c.muted} style={{ marginTop: 6 }}>They appear here after the inspection.</Txt>
        </Card>
      ) : null}
      {o.company ? (
        <>
          <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>1 · MINERAL BRIDGE INSPECTION</Label>
          <ListCard>
            <KV k="Inspected by" v={o.company.by} />
            <KV k="Date" v={MB.fmt(o.company.at)} />
            <KV k="Result" v={o.company.result} vColor={c.green} line={false} />
          </ListCard>
        </>
      ) : null}
      {o.sgs ? (
        <>
          <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>2 · THIRD-PARTY TEST (SGS)</Label>
          <ListCard>
            <KV k="Report no." v={o.sgs.no} mono />
            {rows.map(([k, v]) => <KV key={k} k={k} v={v} />)}
            <KV k="Issued" v={MB.fmt(o.sgs.at)} line={false} />
          </ListCard>
        </>
      ) : null}
      {has ? (
        <>
          <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 6 }}>NOTE (NEEDED TO REQUEST CLARIFICATION)</Label>
          <Field accessibilityLabel="Clarification note" multiline value={s.repNote} placeholder="What needs clarifying?" onChangeText={t => store.setState({ repNote: t, repErr: '' })} />
          {s.repErr ? <ErrBox>{s.repErr}</ErrBox> : null}
        </>
      ) : null}
    </FadeUp>
  );
}
