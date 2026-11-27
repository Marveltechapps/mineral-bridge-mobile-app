import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Alert, Check, Chips, FLabel, Input, Section, Summary } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm } from './orderVals';

/** Cancel an order or sell request (screen of the existing app, in the final design's style). */
export function CancelScreen() {
  const store = useStore(), s = store.state, cx = s.cx || { reason: '', note: '', agree: false };
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), ci = store.cancelInfo(o), sell = o.kind === 'sell', refund = ci.mode === 'refund';
  const setC = (p: Partial<typeof cx>) => store.setState(x => ({ cx: { ...(x.cx || { reason: '', note: '', agree: false }), ...p }, cxErr: '' }));
  const srvR = (s.om[o.id] && s.om[o.id].cancelInfo && s.om[o.id].cancelInfo!.reasons) || [];
  const R = srvR.length ? srvR : sell ? ['Sold elsewhere', 'Price too low', 'Changed my mind', 'Cannot meet inspection dates', 'Other'] : ['Ordered by mistake', 'Found another supplier', 'No longer needed', 'Delivery time too long', 'Other'];
  const paid = o.quote ? MB.money(o.quote.total - (o.refundedSoFar || 0)) : '';
  const pts = refund ? ['You have paid ' + paid + '. Cancelling needs a full refund, which you request on the next screen.', 'The order is paused while Mineral Bridge reviews the refund, usually within 2 working days.', 'Once the refund is completed the order closes as Cancelled and refunded. Dispatch will not go ahead.']
    : sell ? ['Nothing has been inspected or paid, so there is no charge.', 'Any agreed price and signed e-contract are withdrawn.', 'You can submit a new sell request for this mineral at any time.']
      : ['Nothing has been paid, so there is no charge.', 'Any quotation or e-contract on this order is withdrawn.', 'The reserved quantity goes back to the marketplace.'];
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id + ' · ' + v.status} title={v.title} sub={v.qtyLine + ' · ' + v.value} />
      <View style={{ marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: refund ? D.amberBg : D.TINT }}>
        <T s={13.5} w={800} c={refund ? D.amberInk : D.GD}>{refund ? 'Cancelling after payment' : 'Cancel before ' + (sell ? 'inspection' : 'payment')}</T>
        <View style={{ gap: 6, marginTop: 8 }}>
          {pts.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 9 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: refund ? D.AMBER : D.GD, marginTop: 7 }} />
              <T s={12.5} w={600} c={refund ? D.amberInk : D.INK} lh={1.45} style={{ flex: 1 }}>{t}</T>
            </View>
          ))}
        </View>
      </View>
      <Section t="Why are you cancelling?" />
      <Chips list={R} value={cx.reason} onPick={x => setC({ reason: x })} />
      <FLabel t={cx.reason === 'Other' ? 'Tell us why' : 'Note (optional)'} mt={16} />
      <Input accessibilityLabel="Cancellation note" multiline value={cx.note || ''} placeholder="Anything Mineral Bridge should know" onChangeText={t => setC({ note: t })} />
      <Check on={!!cx.agree} onPress={() => setC({ agree: !cx.agree })} text={refund ? 'I want to cancel this order and request a full refund.' : sell ? 'I understand this sell request will be closed and cannot be reopened.' : 'I understand this order will be closed and cannot be reopened.'} />
      <Alert msg={s.cxErr} />
    </View>
  );
}
