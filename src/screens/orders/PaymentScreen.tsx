import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, ErrBox, Field, InfoBox, ListCard, Radio } from '../../components/ui/Blocks';
import { RadialBlob } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { Drift, FadeUp, Pulse, Spin } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

const BTC_RATE = 68510;
const QR = '111111111101111101111111111111111111111111111111111111111111111101111111111111111';
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
  const pm = s.pmethod || 'UPI', amount = o.quote ? MB.money(o.quote.total) : '';
  const btcAmt = o.quote ? (o.quote.total / BTC_RATE).toFixed(6) : '0';
  const btcLock = store.left(Math.max(0, (s.btcLockAt || Date.now()) + 15 * 6e4 - Date.now())).slice(3);
  const f = o.form || {};
  const bank: [string, string][] = pm === 'UPI' ? [['Pay to UPI ID', 'mineralbridge@hdfcbank'], ['Payee', 'Mineral Bridge Ltd'], ['Note / reference', o.id], ['Limit', 'Check your bank’s UPI daily limit']]
    : pm === 'Bitcoin' ? [['Amount', btcAmt + ' BTC'], ['Rate', '1 BTC = ' + MB.money(BTC_RATE)], ['Network', 'Bitcoin (on-chain)'], ['Address', 'bc1q9m4x…8x4h'], ['Memo', o.id]]
      : pm === 'Net banking' ? [['Bank', 'Choose your bank on the next step'], ['Payee', 'Mineral Bridge Ltd'], ['Reference', o.id], ['Gateway', 'Redirects to your bank to authorise']]
        : f.method === 'Bitcoin' ? [['Network', 'Bitcoin'], ['Address', 'bc1q…8x4h (issued per order)'], ['Memo', o.id]]
          : f.method === 'Letter of credit' ? [['Issuing bank', 'Your bank'], ['Beneficiary', 'Mineral Bridge Ltd'], ['Reference', o.id]]
            : [['Beneficiary', 'Mineral Bridge Ltd'], ['Bank', 'Zenith Bank Plc · Lagos'], ['Account', '1014 2290 37'], ['SWIFT', 'ZEIBNGLA'], ['Reference', o.id]];
  const head = pm === 'Bitcoin' ? 'SEND BITCOIN TO' : pm === 'Bank transfer' ? 'TRANSFER TO' : pm === 'Net banking' ? 'NET BANKING' : 'UPI DETAILS';
  const askOther = () => { store.setState({ msg: 'Hi, I would like to pay ' + o.id + ' (' + amount + ') by letter of credit or another method. Please advise.' }); store.go('chat'); };

  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.hero}>
        <Drift dur={10000} pointerEvents="none" style={{ position: 'absolute', right: -60, top: -80 }}>
          <RadialBlob size={180} color="rgba(217,180,86,.35)" style={{ position: 'relative' }} />
        </Drift>
        <Label c={c.faint}>AMOUNT DUE · {o.id}</Label>
        <Txt mono s={30} w={600} c={c.gold} style={{ marginTop: 8 }}>{amount}</Txt>
        <Txt s={12.5} c={c.soft} style={{ marginTop: 6 }}>Pay in full to release the order for dispatch</Txt>
      </View>
      <Label style={st.sec}>PAY WITH</Label>
      <View style={{ gap: 8 }}>
        {QUICK.map(([id, sub, icon]) => {
          const on = pm === id;
          return (
            <Tap key={id} role="radio" selected={on} scale={0.985} onPress={() => store.setState({ pmethod: id, payErr: '', btcLockAt: id === 'Bitcoin' ? Date.now() : s.btcLockAt })}
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
      {pm === 'Bitcoin' ? (
        <>
          <Card style={st.btc}>
            <View accessibilityLabel="Bitcoin QR code" style={st.qr}>
              {Array.from({ length: 9 }, (_, r) => (
                <View key={r} style={{ flex: 1, flexDirection: 'row', gap: 1 }}>
                  {Array.from({ length: 9 }, (__, k) => <View key={k} style={{ flex: 1, borderRadius: 1, backgroundColor: QR[r * 9 + k] === '1' ? c.ink : 'transparent' }} />)}
                </View>
              ))}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Label s={9.5}>SEND EXACTLY</Label>
              <Txt mono s={19} w={600} c={c.goldInk} style={{ marginTop: 4 }}>{btcAmt} BTC</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Pulse><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.gold }} /></Pulse>
                <Txt s={12} c={c.muted}>Rate locked for <Txt mono s={12} w={700}>{btcLock}</Txt></Txt>
              </View>
              <Tap onPress={() => store.flash('Address copied')} style={{ marginTop: 8 }}><Txt s={12.5} w={600} c={c.goldInk}>Copy address</Txt></Tap>
            </View>
          </Card>
          <Label style={{ marginTop: 16, marginHorizontal: 4, marginBottom: 6 }}>BITCOIN TRANSACTION ID</Label>
          <Field accessibilityLabel="Bitcoin transaction ID" focusGold mono fs={13} h={50} value={s.btcTx || ''} placeholder="Paste the TXID from your wallet" autoCapitalize="none" autoCorrect={false} onChangeText={t => store.setState({ btcTx: t.trim(), payErr: '' })} style={{ paddingHorizontal: 14 }} />
          <Txt s={11.5} c={c.muted2} lh={1.45} style={{ marginTop: 6, marginHorizontal: 4 }}>Available in supported countries. Confirmed after 3 network confirmations; if the rate lock expires, the BTC amount is recalculated.</Txt>
        </>
      ) : null}
      {pm === 'Bank transfer' ? (
        <>
          <Label style={st.sec}>PROOF OF PAYMENT</Label>
          <Tap onPress={() => store.setState({ proof: !s.proof, payErr: '' })} style={[st.proof, { borderColor: s.proof ? c.greenLine : c.dash, backgroundColor: s.proof ? c.greenBg : c.white }]}>
            <Txt s={13.5} w={600} center>{s.proof ? 'transfer-receipt.pdf added ✓' : 'Upload transfer receipt or bank advice'}</Txt>
          </Tap>
        </>
      ) : null}
      {s.paying ? (
        <View style={st.paying}>
          <Spin dur={800} style={st.spinner} />
          <Txt s={13.5} c={c.paper}>{pm === 'Net banking' ? 'Waiting for your bank to authorise…' : 'Waiting for approval in your UPI app…'}</Txt>
        </View>
      ) : null}
      {s.payErr ? <ErrBox>{s.payErr}</ErrBox> : null}
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
