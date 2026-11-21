import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { REFUND_REASONS } from '../../context/store';
import type { RefundForm } from '../../context/state';
import { Card, CheckRow, Chips, ErrBox, Field, LabeledField, OptionCard, Segmented } from '../../components/ui/Blocks';
import { Icon } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { UploadPicker } from '../../components/UploadPicker';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

const RF_DEST = (m: string): [RefundForm['dest'], string, string, string][] => [
  ['original', 'Original payment method', m + ' · back to the account or wallet you paid from', 'M1 4h22v16H1zM1 10h22'],
  ['bank', 'Bank account', 'NEFT, RTGS or SWIFT transfer to any bank account', 'M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-7 10 7z'],
  ['upi', 'UPI', 'Instant transfer to a UPI ID (India)', 'M13 2L3 14h9l-1 8 10-12h-9z'],
  ['btc', 'Bitcoin wallet', 'On-chain BTC to your wallet address', 'M9 4v16M13 4v3M13 17v3M7 7h7a3 3 0 0 1 0 6H7M7 13h8a3 3 0 0 1 0 6H7'],
];
const RF_FIELDS: Record<string, [keyof RefundForm, string, string, ('numeric' | undefined)?][]> = {
  bank: [['holder', 'ACCOUNT HOLDER NAME', 'As shown on the bank account'], ['bank', 'BANK NAME', 'e.g. HDFC Bank, Zenith Bank'], ['account', 'ACCOUNT NUMBER', '', 'numeric'], ['account2', 'CONFIRM ACCOUNT NUMBER', '', 'numeric'], ['code', 'IFSC / SWIFT / SORT CODE', 'e.g. HDFC0001234 or ZEIBNGLA'], ['country', 'BANK COUNTRY', 'e.g. India']],
  upi: [['upi', 'UPI ID', 'name@bank'], ['upiName', 'NAME ON UPI', 'As shown in your UPI app']],
  btc: [['addr', 'WALLET ADDRESS', 'bc1q…'], ['addr2', 'CONFIRM WALLET ADDRESS', 'Paste the address again']],
};

export function RefundScreen() {
  const store = useStore(), s = store.state, r = s.rf;
  const o = currentOrder(store);
  if (!o) return null;
  const setR = (p: Partial<RefundForm>) => store.setState(x => ({ rf: { ...x.rf, ...p }, rfErr: '' }));
  const method = (o.form || {}).method || 'Bank transfer';
  const fields = RF_FIELDS[r.dest] || [];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ padding: 16, borderRadius: 22, backgroundColor: c.ink }}>
        <Label c={c.faint}>{o.id}</Label>
        <Txt s={15} w={600} c={c.paper} style={{ marginTop: 6 }}>{MB.titleOf(o)}</Txt>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)' }}>
          <Txt s={12.5} c={c.soft} style={{ flexShrink: 1 }}>Paid · {method + (o.refundedSoFar ? ' · ' + MB.money(o.refundedSoFar) + ' already refunded' : '')}</Txt>
          <Txt mono s={18} w={600} c={c.gold}>{o.quote ? MB.money(o.quote.total - (o.refundedSoFar || 0)) : ''}</Txt>
        </View>
      </View>
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>REASON</Label>
      <Chips list={REFUND_REASONS} value={r.reason} onPick={v => setR({ reason: v })} />
      <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 6 }}>TELL US WHAT HAPPENED</Label>
      <Field accessibilityLabel="Refund details" multiline value={r.note} placeholder="At least 10 characters" onChangeText={t => setR({ note: t })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>REFUND AMOUNT</Label>
      <Segmented r={14} h={38} ir={11} s={13} items={([['full', 'Full refund'], ['partial', 'Partial refund']] as const).map(([v, l]) => ({ label: l, on: r.type === v, onPress: () => setR({ type: v }) }))} />
      {r.type === 'partial' ? (
        <>
          <View style={{ marginTop: 10 }}>
            <Field accessibilityLabel="Refund amount" keyboard="decimal-pad" mono value={r.amount} onChangeText={t => setR({ amount: t.replace(/[^\d.]/g, '') })} style={{ paddingLeft: 28 }} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 15, top: 0, bottom: 0, justifyContent: 'center' }}><Txt mono s={15} c={c.muted2}>$</Txt></View>
          </View>
          <Txt s={12} c={c.muted} style={{ marginTop: 6, marginHorizontal: 4 }}>The order continues; only this amount is returned.</Txt>
        </>
      ) : <Txt s={12} c={c.muted} style={{ marginTop: 8, marginHorizontal: 4 }}>A full refund cancels the order. Any shipment in progress is returned to Mineral Bridge.</Txt>}
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>REFUND TO</Label>
      <View style={{ gap: 8 }}>
        {RF_DEST(method).map(([v, name, sub, icon]) => (
          <OptionCard key={v} on={r.dest === v} title={name} sub={sub} titleS={14} onPress={() => setR({ dest: v })}
            left={<View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' }}><Icon d={icon} size={17} /></View>} />
        ))}
      </View>
      {fields.length ? (
        <Card r={18} style={{ marginTop: 10, padding: 14 }}>
          <Label s={9.5} style={{ marginHorizontal: 2, marginBottom: 10 }}>{({ bank: 'BANK ACCOUNT DETAILS', upi: 'UPI DETAILS', btc: 'BITCOIN WALLET' } as Record<string, string>)[r.dest]}</Label>
          <View style={{ gap: 10 }}>
            {fields.map(([k, l, ph, mode]) => (
              <LabeledField key={k} label={l} placeholder={ph} value={String(r[k] || '')} err={(s.rfFieldErr || {})[k]} keyboard={mode === 'numeric' ? 'number-pad' : undefined}
                ff={/account|code|upi|addr/.test(k) ? 'mono' : undefined} bg={c.field2} h={50}
                onChangeText={t => store.setState(x => ({ rf: { ...x.rf, [k]: t }, rfErr: '', rfFieldErr: { ...x.rfFieldErr, [k]: '' } }))} />
            ))}
          </View>
          <Txt s={12} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>{({ bank: 'The account must be in your name or your business’s name. We verify it before sending the refund.', upi: 'We send a ₹1 test credit to confirm the UPI ID before the refund.', btc: 'The USD amount is fixed. We convert at the rate on the day of payout and send to this address on the Bitcoin network.' } as Record<string, string>)[r.dest]}</Txt>
        </Card>
      ) : null}
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>EVIDENCE (OPTIONAL)</Label>
      <UploadPicker bucket="refund" purpose="refund_evidence" title="Add photo or document" max={5} />
      <CheckRow r={16} pv={13} s={13} on={r.agree} onPress={() => setR({ agree: !r.agree })} style={{ marginTop: 14 }}>I understand the order is paused while Mineral Bridge reviews this request, and refunds take 3–7 working days after approval.</CheckRow>
      {s.rfErr ? <ErrBox>{s.rfErr}</ErrBox> : null}
    </FadeUp>
  );
}
