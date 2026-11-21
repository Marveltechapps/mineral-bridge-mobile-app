import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ErrBox, Field, InfoBox, KV, ListCard, Pill, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { pendingVariation } from '../../lib/mappers';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

const REASON: Record<string, string> = {
  qty: 'The quantity we received or inspected differs from what you declared',
  grade: 'The grade or purity differs from what you declared',
  both: 'The quantity and the grade differ from what you declared',
  market: 'The market price moved since your offer',
  other: 'Mineral Bridge proposed a new price',
};
const STATUS: Record<string, [string, string, string]> = {
  awaiting_seller: ['Waiting for you', c.amberBg, c.amber], accepted: ['Accepted', c.greenBg, c.green], rejected: ['Rejected', c.redBg, c.red], withdrawn: ['Withdrawn', c.chip, c.ink2],
};

/** A price update proposed by Mineral Bridge on a sell order: the seller accepts or rejects it (CTAs live in the CTA bar). */
export function PriceVariationScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const pv = pendingVariation(o);
  const last = pv || (o.variations || [])[o.variations ? o.variations.length - 1 : 0];
  if (!last) return <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}><InfoBox>There is no price update on {o.id}.</InfoBox></FadeUp>;
  const delta = last.to - last.from, pct = last.from > 0 ? Math.abs(delta / last.from * 100) : 0;
  const tone = STATUS[last.status] || [last.status, c.chip, c.ink2];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={o.id} title={MB.titleOf(o)} sub="Price update from Mineral Bridge" />
      <Card style={{ marginTop: 12, paddingVertical: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Label>PROPOSED TOTAL</Label>
          <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} />
        </View>
        <Txt mono s={30} w={600} style={{ marginTop: 8 }}>{MB.money(last.to)}</Txt>
        <Txt s={12.5} c={c.muted} style={{ marginTop: 4 }}>
          {'was ' + MB.money(last.from) + (delta !== 0 ? ' · ' + (delta < 0 ? '−' : '+') + MB.money(Math.abs(delta)) + (pct ? ' (' + pct.toFixed(1) + '%)' : '') : '')}
        </Txt>
      </Card>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>WHY THE PRICE CHANGED</Label>
      <ListCard>
        <KV k="Reason" v={REASON[last.reason] || REASON.other} line={!!last.note} gap={12} />
        {last.note ? <View style={{ paddingVertical: 12 }}><Label s={9.5}>NOTE FROM MINERAL BRIDGE</Label><Txt s={13.5} c={c.ink2} lh={1.5} style={{ marginTop: 5 }}>{'“' + last.note + '”'}</Txt></View> : null}
      </ListCard>
      {pv ? (
        <>
          <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>YOUR NOTE (OPTIONAL)</Label>
          <Field accessibilityLabel="Your note" multiline value={s.varNote} onChangeText={t => store.setState({ varNote: t.slice(0, 500), varErr: '' })} placeholder="Add a note, for example why you disagree" />
          {s.varErr ? <ErrBox>{s.varErr}</ErrBox> : null}
          <InfoBox mt={14}>Accepting updates the agreed price on this order. Rejecting pauses the order while Mineral Bridge reviews it with you.</InfoBox>
        </>
      ) : (
        <InfoBox mt={14}>{last.decisionNote ? 'Your note: ' + last.decisionNote : 'This price update is closed. Nothing more to do.'}</InfoBox>
      )}
    </FadeUp>
  );
}
