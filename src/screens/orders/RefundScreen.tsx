import React from 'react';
import { TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { REFUND_REASONS } from '../../context/store';
import type { RefundForm } from '../../context/state';
import { jakarta, T } from '../../components/mb/base';
import { Alert, Check, Chips, FieldErr, FLabel, Input, RadioCard, Section, SegTrack, Summary } from '../../components/mb/kit';
import { UploadPicker } from '../../components/UploadPicker';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm } from './orderVals';

const RF_DEST = (m: string): [RefundForm['dest'], string, string][] => [
  ['original', 'Original payment method', m + ' · back to the account or wallet you paid from'],
  ['bank', 'Bank account', 'NEFT, RTGS or SWIFT transfer to any bank account'],
  ['upi', 'UPI', 'Instant transfer to a UPI ID (India)'],
  ['btc', 'Bitcoin wallet', 'On-chain BTC to your wallet address'],
];
const RF_FIELDS: Record<string, [keyof RefundForm, string, string, ('numeric' | undefined)?][]> = {
  bank: [['holder', 'Account holder name', 'As shown on the bank account'], ['bank', 'Bank name', 'e.g. HDFC Bank, Zenith Bank'], ['account', 'Account number', '', 'numeric'], ['account2', 'Confirm account number', '', 'numeric'], ['code', 'IFSC / SWIFT / sort code', 'e.g. HDFC0001234 or ZEIBNGLA'], ['country', 'Bank country', 'e.g. India']],
  upi: [['upi', 'UPI ID', 'name@bank'], ['upiName', 'Name on UPI', 'As shown in your UPI app']],
  btc: [['addr', 'Wallet address', 'bc1q…'], ['addr2', 'Confirm wallet address', 'Paste the address again']],
};
const NOTE: Record<string, string> = { bank: 'The account must be in your name or your business’s name. We verify it before sending the refund.', upi: 'We send a ₹1 test credit to confirm the UPI ID before the refund.', btc: 'The USD amount is fixed. We convert at the rate on the day of payout and send to this address on the Bitcoin network.' };

/** Request a refund (`scr_refund`). "Submit refund request" is the screen CTA. */
export function RefundScreen() {
  const store = useStore(), s = store.state, r = s.rf, fe = s.rfFieldErr || {};
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), setR = (p: Partial<RefundForm>) => store.setState(x => ({ rf: { ...x.rf, ...p }, rfErr: '' }));
  const method = (o.form || {}).method || 'Bank transfer', paid = (o.quote ? o.quote.total : 0) - (o.refundedSoFar || 0);
  const fields = RF_FIELDS[r.dest] || [];
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: D.G }}>
        <T s={12.5} w={600} c={D.navyMute} style={{ flexShrink: 1 }}>{'Paid · ' + method + (o.refundedSoFar ? ' · ' + MB.money(o.refundedSoFar) + ' already refunded' : '')}</T>
        <T s={15} w={800} c={D.GOLD}>{o.quote ? MB.money(paid) : ''}</T>
      </View>
      <Section t="Reason" />
      <Chips list={REFUND_REASONS} value={r.reason} onPick={x => setR({ reason: x })} />
      <FLabel t="Tell us what happened" mt={16} />
      <Input accessibilityLabel="Refund details" multiline value={r.note} placeholder="At least 10 characters" onChangeText={t => setR({ note: t })} />
      <Section t="Refund amount" />
      <SegTrack items={[['full', 'Full refund'], ['partial', 'Partial refund']]} value={r.type} onPick={x => setR({ type: x as RefundForm['type'] })} s={13} />
      {r.type === 'partial' ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.BOR, borderRadius: 14, paddingHorizontal: 14 }}>
            <T s={16} w={800} c={D.MUT}>$</T>
            <TextInput accessibilityLabel="Refund amount" keyboardType="decimal-pad" value={r.amount} allowFontScaling={false} onChangeText={t => setR({ amount: t.replace(/[^\d.]/g, '') })}
              style={{ flex: 1, height: 46, fontFamily: jakarta(800), fontSize: 16, color: D.INK, paddingVertical: 0 }} />
          </View>
          <T s={12} w={600} c={D.MUT} style={{ marginTop: 6 }}>The order continues; only this amount is returned.</T>
        </>
      ) : <T s={12} w={700} c={D.AMBER} lh={1.45} style={{ marginTop: 8 }}>A full refund cancels the order. Any shipment in progress is returned to Mineral Bridge.</T>}
      <Section t="Refund to" />
      <View style={{ gap: 8 }}>{RF_DEST(method).map(([k, n, sub]) => <RadioCard key={k} on={r.dest === k} name={n} sub={sub} onPress={() => setR({ dest: k })} />)}</View>
      {fields.length ? (
        <View style={{ marginTop: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, paddingTop: 4, paddingHorizontal: 14, paddingBottom: 14 }}>
          {fields.map(([k, l, ph, mode]) => (
            <View key={k}>
              <FLabel t={l} mt={12} />
              <Input accessibilityLabel={l} placeholder={ph} value={String(r[k] || '')} err={!!fe[k]} keyboard={mode === 'numeric' ? 'number-pad' : undefined} autoCapitalize="none"
                onChangeText={t => store.setState(x => ({ rf: { ...x.rf, [k]: t }, rfErr: '', rfFieldErr: { ...x.rfFieldErr, [k]: '' } }))} />
              <FieldErr msg={fe[k]} />
            </View>
          ))}
          <T s={11.5} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 10 }}>{NOTE[r.dest]}</T>
        </View>
      ) : null}
      <Section t="Evidence (optional)" />
      <UploadPicker bucket="refund" purpose="refund_evidence" icon="upload" title="Add photo or document" max={5} />
      <Check on={r.agree} text="I understand the order is paused while Mineral Bridge reviews this request, and refunds take 3–7 working days after approval." onPress={() => setR({ agree: !r.agree })} />
      <Alert msg={s.rfErr} />
    </View>
  );
}
