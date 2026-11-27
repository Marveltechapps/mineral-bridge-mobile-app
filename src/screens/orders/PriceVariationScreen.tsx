import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Alert, Card, FLabel, Input, KV, Note, Pill, Section, Summary } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { pendingVariation } from '../../lib/mappers';
import { D } from '../../theme';
import { currentOrder, orderIm } from './orderVals';

const REASON: Record<string, string> = {
  qty: 'The quantity we received or inspected differs from what you declared',
  grade: 'The grade or purity differs from what you declared',
  both: 'The quantity and the grade differ from what you declared',
  market: 'The market price moved since your offer',
  other: 'Mineral Bridge proposed a new price',
};
const STATUS: Record<string, [string, string, string]> = {
  awaiting_seller: ['Waiting for you', D.amberBg, D.AMBER], accepted: ['Accepted', D.greenBg, D.green], rejected: ['Rejected', D.redBg, D.DANGER], withdrawn: ['Withdrawn', D.chip, D.ink2],
};

/** A price update proposed by Mineral Bridge on a sell order; Accept / Reject are the screen CTAs. */
export function PriceVariationScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const pv = pendingVariation(o);
  const last = pv || (o.variations || [])[o.variations ? o.variations.length - 1 : 0];
  if (!last) return <View style={{ paddingHorizontal: 18 }}><Note>{'There is no price update on ' + o.id + '.'}</Note></View>;
  const delta = last.to - last.from, pct = last.from > 0 ? Math.abs(delta / last.from * 100) : 0;
  const tone = STATUS[last.status] || [last.status, D.chip, D.ink2];
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={MB.titleOf(o)} sub="Price update from Mineral Bridge" />
      <Card style={{ marginTop: 12, paddingVertical: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <T s={10.5} w={800} c={D.GD} ls={0.08}>PROPOSED TOTAL</T>
          <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} pad={[3, 9]} />
        </View>
        <T s={28} w={800} style={{ marginTop: 8 }}>{MB.money(last.to)}</T>
        <T s={12.5} w={600} c={D.MUT} style={{ marginTop: 4 }}>{'was ' + MB.money(last.from) + (delta !== 0 ? ' · ' + (delta < 0 ? '−' : '+') + MB.money(Math.abs(delta)) + (pct ? ' (' + pct.toFixed(1) + '%)' : '') : '')}</T>
      </Card>
      <Section t="Why the price changed" />
      <KV rows={[['Reason', REASON[last.reason] || REASON.other], !!last.note && ['Note from Mineral Bridge', '“' + last.note + '”']]} />
      {pv ? (
        <>
          <FLabel t="Your note (optional)" mt={16} />
          <Input accessibilityLabel="Your note" multiline value={s.varNote} onChangeText={t => store.setState({ varNote: t.slice(0, 500), varErr: '' })} placeholder="Add a note, for example why you disagree" />
          <Alert msg={s.varErr} />
          <Note>Accepting updates the agreed price on this order. Rejecting pauses the order while Mineral Bridge reviews it with you.</Note>
        </>
      ) : <Note>{last.decisionNote ? 'Your note: ' + last.decisionNote : 'This price update is closed. Nothing more to do.'}</Note>}
    </View>
  );
}
