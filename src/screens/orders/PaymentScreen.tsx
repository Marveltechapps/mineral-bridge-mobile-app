import React from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ErrBox, Field, InfoBox, ListCard, Radio } from '../../components/ui/Blocks';
import { RadialBlob } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { Drift, FadeUp, Pulse, Spin } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { UploadPicker } from '../../components/UploadPicker';
import { Label, Txt } from '../../components/ui/Txt';
import { paymentNeedsReference } from '../../lib/mappers';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

const QUICK: [string, string, string][] = [
  ['UPI', 'Google Pay, PhonePe, Paytm or any UPI app', 'M7 3h10v18H7zM11 18h2'],
  ['Net banking', 'Pay from your bank account online', 'M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-7 10 7z'],
  ['Bank transfer', 'NEFT, RTGS or SWIFT · upload the receipt', 'M4 7h16v12H4zM4 11h16M8 15h3'],
  ['Bitcoin', 'On-chain BTC · rate locked for 15 minutes', 'M9 4v16M13 4v3M13 17v3M7 7h7a3 3 0 0 1 0 6H7M7 13h8a3 3 0 0 1 0 6H7'],
];

export function PaymentScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const pm = s.pmethod || 'UPI', est = !!(o.quote && o.quote.est), amount = o.quote ? (est ? 'From ' : '') + MB.money(o.quote.total) : '';
  const ins = s.instr, btc = s.om[o.id] && s.om[o.id].btc;
  const btcLeft = btc ? Math.max(0, btc.lockExpiresAt - Date.now()) : 0, btcExpired = !!btc && btcLeft <= 0;
  const btcAmt = btc ? (btc.amountSats / 1e8).toFixed(8) : '';
  const btcLock = store.left(btcLeft).slice(3);
  const f = o.form || {};
  const NA = ins ? '—' : 'Loading…';
  const acct: [string, string][] = [['Beneficiary', ins ? ins.beneficiary : NA], ['Bank', ins ? ins.bank : NA], ['Account', ins ? ins.account : NA], ['SWIFT', ins ? ins.swift : NA], ['Reference', o.id]];
  const bank: [string, string][] = pm === 'UPI' ? [['Pay to UPI ID', ins ? ins.upiId || 'Not available. Use bank transfer.' : NA], ['Payee', ins ? ins.beneficiary : NA], ['Note / reference', o.id]]
    : pm === 'Bitcoin' ? (btc ? [['Amount', btcAmt + ' BTC'], ['Rate', '1 BTC = ' + MB.money(btc.rateMinorPerBtc / 100)], ['Network', 'Bitcoin (on-chain)'], ['Address', btc.address], ['Memo', o.id]] : [['Bitcoin quote', s.paying ? 'Requesting…' : 'Not requested yet']])
      : pm === 'Net banking' ? acct
        : f.method === 'Letter of credit' ? [['Issuing bank', 'Your bank'], ['Beneficiary', ins ? ins.beneficiary : NA], ['Reference', o.id]]
          : acct;
  const head = pm === 'Bitcoin' ? 'SEND BITCOIN TO' : pm === 'Bank transfer' ? 'TRANSFER TO' : pm === 'Net banking' ? 'PAY FROM YOUR ONLINE BANKING TO' : 'UPI DETAILS';
  const askOther = () => { store.setState({ msg: 'Hi, I would like to pay ' + o.id + ' (' + amount + ') by letter of credit or another method. Please advise.' }); store.go('chat'); };
  const pick = (id: string) => { store.setState({ pmethod: id, payErr: '', payRef: '' }); if (id === 'Bitcoin') void store.task(store.remote.btcQuote()); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.hero}>
        <Drift dur={10000} pointerEvents="none" style={{ position: 'absolute', right: -60, top: -80 }}>
          <RadialBlob size={180} color="rgba(217,180,86,.35)" style={{ position: 'relative' }} />
        </Drift>
        <Label c={c.faint}>AMOUNT DUE · {o.id}</Label>
        <Txt mono s={30} w={600} c={c.gold} style={{ marginTop: 8 }}>{amount}</Txt>
        <Txt s={12.5} c={c.soft} style={{ marginTop: 6 }}>{est ? 'Indicative amount. The binding amount is on your quotation and invoice. ' : ''}Pay in full to release the order for dispatch</Txt>
      </View>
      <Label style={st.sec}>PAY WITH</Label>
      <View style={{ gap: 8 }}>
        {QUICK.map(([id, sub, icon]) => {
          const on = pm === id;
          return (
            <Tap key={id} role="radio" selected={on} scale={0.985} onPress={() => pick(id)}
              style={[st.quick, { borderColor: on ? c.ink : c.line, boxShadow: on ? '0 6px 18px rgba(18,18,20,.10)' : undefined }]}>
              <View style={[st.qIcon, { backgroundColor: on ? c.ink : c.chip }]}><Icon d={icon} size={18} color={on ? c.gold : c.ink} sw={1.9} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt s={14.5} w={600}>{id}</Txt>
                <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{sub}</Txt>
              </View>
              <Radio on={on} />
            </Tap>
          );
        })}
      </View>
      <Label style={st.sec}>{head}</Label>
      <ListCard>
        {bank.map(([k, v]) => (
          <View key={k} style={st.kv}>
            <Txt s={13.5} c={c.muted}>{k}</Txt>
            <Txt s={13.5} mono w={600} right style={{ flexShrink: 1 }}>{v}</Txt>
          </View>
        ))}
      </ListCard>
      {pm === 'Bitcoin' && btc ? (
        <>
          <Card style={st.btc}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Label s={9.5}>SEND EXACTLY</Label>
              <Txt mono s={19} w={600} c={c.goldInk} style={{ marginTop: 4 }}>{btcAmt} BTC</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Pulse><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: btcExpired ? c.red : c.gold }} /></Pulse>
                <Txt s={12} c={btcExpired ? c.red : c.muted}>{btcExpired ? 'Rate lock expired' : <>Rate locked for <Txt mono s={12} w={700}>{btcLock}</Txt></>}</Txt>
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <Tap onPress={() => { Share.share({ message: btc.address }).catch(() => {}); }}><Txt s={12.5} w={600} c={c.goldInk}>Share address</Txt></Tap>
                {btcExpired ? <Tap onPress={() => { void store.task(store.remote.btcQuote(true)); }}><Txt s={12.5} w={600} c={c.goldInk}>Refresh quote</Txt></Tap> : null}
              </View>
            </View>
          </Card>
          <Label style={{ marginTop: 16, marginHorizontal: 4, marginBottom: 6 }}>BITCOIN TRANSACTION ID</Label>
          <Field accessibilityLabel="Bitcoin transaction ID" focusGold mono fs={13} h={50} value={s.btcTx || ''} placeholder="Paste the TXID from your wallet" autoCapitalize="none" autoCorrect={false} onChangeText={t => store.setState({ btcTx: t.trim(), payErr: '' })} style={{ paddingHorizontal: 14 }} />
          <Txt s={11.5} c={c.muted2} lh={1.45} style={{ marginTop: 6, marginHorizontal: 4 }}>Confirmed after the required network confirmations. If the rate lock expires, request a new quote and send the new amount.</Txt>
        </>
      ) : null}
      {pm === 'Bitcoin' && !btc ? <Tap onPress={() => { void store.task(store.remote.btcQuote()); }} style={{ marginTop: 12 }}><Txt s={13.5} w={600} c={c.goldInk} center>Get Bitcoin quote</Txt></Tap> : null}
      {paymentNeedsReference(pm) ? (
        <>
          <Label style={st.sec}>{pm === 'UPI' ? 'UPI TRANSACTION REFERENCE' : 'PAYMENT REFERENCE'}</Label>
          <Field accessibilityLabel="Payment reference" focusGold mono fs={13} h={50} value={s.payRef || ''} placeholder="Reference shown after you pay" autoCapitalize="characters" autoCorrect={false} onChangeText={t => store.setState({ payRef: t, payErr: '' })} style={{ paddingHorizontal: 14 }} />
        </>
      ) : null}
      {pm !== 'Bitcoin' && pm !== 'UPI' && pm !== 'Net banking' ? (
        <>
          <Label style={st.sec}>PROOF OF PAYMENT</Label>
          <UploadPicker bucket="proof" purpose="payment_proof" title="Upload transfer receipt or bank advice" max={3} />
        </>
      ) : null}
      {s.paying ? (
        <View style={st.paying}>
          <Spin dur={800} style={st.spinner} />
          <Txt s={13.5} c={c.paper}>Submitting your payment details…</Txt>
        </View>
      ) : null}      {s.payErr ? <ErrBox>{s.payErr}</ErrBox> : null}
      <InfoBox>Your payment shows as processing until Mineral Bridge confirms the funds have arrived. A transaction reference is issued only after confirmation.</InfoBox>
      <Tap scale={0.985} onPress={askOther} style={st.other}>
        <View style={[st.qIcon, { backgroundColor: c.chip }]}><Icon d={IC.chat} size={18} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt s={14} w={600}>Need letter of credit or another method?</Txt>
          <Txt s={12} c={c.muted} lh={1.4} style={{ marginTop: 2 }}>LC, escrow or split payments are arranged by our support team.</Txt>
        </View>
        <Txt s={12.5} w={600} c={c.goldInk}>Contact</Txt>
      </Tap>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  hero: { overflow: 'hidden', padding: 18, borderRadius: 22, backgroundColor: c.ink },
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  quick: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.white, borderWidth: 1.5 },
  qIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair },
  btc: { marginTop: 12, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  qr: { width: 104, height: 104, borderRadius: 12, padding: 8, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, gap: 1 },
  proof: { padding: 18, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed' },
  paying: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', gap: 12 },
  spinner: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(217,180,86,.3)', borderTopColor: c.gold },
  other: { marginTop: 14, paddingVertical: 14, paddingHorizontal: 15, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dash, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
