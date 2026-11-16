import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { CheckRow, Chips, ErrBox, Field, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

export function CancelScreen() {
  const store = useStore(), s = store.state, cx = s.cx || { reason: '', note: '', agree: false };
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o), ci = store.cancelInfo(o), sell = o.kind === 'sell', refund = ci.mode === 'refund';
  const setC = (p: Partial<typeof cx>) => store.setState(x => ({ cx: { ...(x.cx || { reason: '', note: '', agree: false }), ...p }, cxErr: '' }));
  const R = sell ? ['Sold elsewhere', 'Price too low', 'Changed my mind', 'Cannot meet inspection dates', 'Other'] : ['Ordered by mistake', 'Found another supplier', 'No longer needed', 'Delivery time too long', 'Other'];
  const paid = o.quote ? MB.money(o.quote.total - (o.refundedSoFar || 0)) : '';
  const pts = refund ? ['You have paid ' + paid + '. Cancelling needs a full refund, which you request on the next screen.', 'The order is paused while Mineral Bridge reviews the refund, usually within 2 working days.', 'Once the refund is completed the order closes as Cancelled and refunded. Dispatch will not go ahead.']
    : sell ? ['Nothing has been inspected or paid, so there is no charge.', 'Any agreed price and signed e-contract are withdrawn.', 'You can submit a new sell request for this mineral at any time.']
      : ['Nothing has been paid, so there is no charge.', 'Any quotation or e-contract on this order is withdrawn.', 'The reserved quantity goes back to the marketplace.'];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id + ' · ' + ov.status} title={ov.title} sub={ov.qtyLine + ' · ' + ov.value} />
      <View style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 15, borderRadius: 16, backgroundColor: refund ? c.amberBg : c.chip, borderWidth: 1, borderColor: refund ? c.amberLine : c.line }}>
        <Txt s={13.5} w={600} c={refund ? c.amberInk : c.ink}>{refund ? 'Cancelling after payment' : 'Cancel before ' + (sell ? 'inspection' : 'payment')}</Txt>
        <View style={{ gap: 6, marginTop: 8 }}>
          {pts.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 9 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.muted2, marginTop: 7 }} />
              <Txt s={12.5} c={c.ink2} lh={1.45} style={{ flex: 1 }}>{t}</Txt>
            </View>
          ))}
        </View>
      </View>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>WHY ARE YOU CANCELLING?</Label>
      <Chips list={R} value={cx.reason} onPick={v => setC({ reason: v })} />
      <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 6 }}>{cx.reason === 'Other' ? 'TELL US WHY' : 'NOTE (OPTIONAL)'}</Label>
      <Field accessibilityLabel="Cancellation note" multiline value={cx.note || ''} placeholder="Anything Mineral Bridge should know" onChangeText={t => setC({ note: t })} style={{ minHeight: 76 }} />
      <CheckRow r={16} pv={13} on={!!cx.agree} onPress={() => setC({ agree: !cx.agree })} style={{ marginTop: 14 }}>
        {refund ? 'I want to cancel this order and request a full refund.' : sell ? 'I understand this sell request will be closed and cannot be reopened.' : 'I understand this order will be closed and cannot be reopened.'}
      </CheckRow>
      {s.cxErr ? <ErrBox>{s.cxErr}</ErrBox> : null}
    </FadeUp>
  );
}
