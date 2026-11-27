import React from 'react';
import { Share, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { Alert, FLabel, Input, KV, Press, RadioCard, Section, Spinner } from '../../components/mb/kit';
import { UploadPicker } from '../../components/UploadPicker';
import { paymentNeedsReference } from '../../lib/mappers';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { NavyCard } from './OrderTrackingScreen';
import { currentOrder } from './orderVals';

const OPTS: [string, string][] = [['UPI', 'Google Pay, PhonePe, Paytm or any UPI app'], ['Net banking', 'Pay from your bank account online'], ['Bank transfer', 'NEFT, RTGS or SWIFT · upload the receipt'], ['Bitcoin', 'On-chain BTC · rate locked for 15 minutes']];

/** Make payment (`scr_pay`). Instructions and the Bitcoin quote come from the API; submit is the screen CTA. */
export function PaymentScreen() {
  const store = useStore(), s = store.state;
  const o = currentOrder(store);
  if (!o) return null;
  const pm = s.pmethod || 'UPI', est = !!(o.quote && o.quote.est), amount = o.quote ? (est ? 'From ' : '') + MB.money(o.quote.total) : '';
  const ins = s.instr, btc = s.om[o.id] && s.om[o.id].btc;
  const btcLeft = btc ? Math.max(0, btc.lockExpiresAt - Date.now()) : 0, btcExpired = !!btc && btcLeft <= 0;
  const btcAmt = btc ? (btc.amountSats / 1e8).toFixed(8) : '', btcLock = store.left(btcLeft).slice(3);
  const f = o.form || {}, NA = ins ? '—' : 'Loading…';
  const acct: [string, string][] = [['Beneficiary', ins ? ins.beneficiary : NA], ['Bank', ins ? ins.bank : NA], ['Account', ins ? ins.account : NA], ['SWIFT', ins ? ins.swift : NA], ['Reference', o.id]];
  const rows: [string, string][] = pm === 'UPI' ? [['Pay to UPI ID', ins ? ins.upiId || 'Not available. Use bank transfer.' : NA], ['Payee', ins ? ins.beneficiary : NA], ['Note / reference', o.id], ['Limit', 'Check your bank’s UPI daily limit']]
    : pm === 'Bitcoin' ? (btc ? [['Amount', btcAmt + ' BTC'], ['Rate', '1 BTC = ' + MB.money(btc.rateMinorPerBtc / 100)], ['Network', 'Bitcoin (on-chain)'], ['Address', btc.address], ['Memo', o.id]] : [['Bitcoin quote', s.paying ? 'Requesting…' : 'Not requested yet']])
      : pm === 'Net banking' ? [['Bank', 'Choose your bank on the next step'], ['Payee', ins ? ins.beneficiary : NA], ['Reference', o.id], ['Gateway', 'Redirects to your bank to authorise']]
        : f.method === 'Letter of credit' ? [['Issuing bank', 'Your bank'], ['Beneficiary', ins ? ins.beneficiary : NA], ['Reference', o.id]] : acct;
  const head = pm === 'Bitcoin' ? 'Send Bitcoin to' : pm === 'Bank transfer' ? 'Transfer to' : pm === 'Net banking' ? 'Net banking' : 'UPI details';
  const askOther = () => { store.setState({ msg: 'Hi, I would like to pay ' + o.id + ' (' + amount + ') by letter of credit or another method. Please advise.' }); store.go('chat'); };
  const pick = (id: string) => { store.setState({ pmethod: id, payErr: '', payRef: '' }); if (id === 'Bitcoin') void store.task(store.remote.btcQuote()); };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <NavyCard>
        <T s={10.5} w={800} c={D.GOLD} ls={0.08}>{'AMOUNT DUE · ' + o.id}</T>
        <T s={30} w={800} c={D.white} style={{ marginTop: 6 }}>{amount}</T>
        <T s={12.5} w={600} c={D.navyMute} style={{ marginTop: 4 }}>{(est ? 'Indicative amount. The binding amount is on your quotation and invoice. ' : '') + 'Pay in full to release the order for dispatch'}</T>
      </NavyCard>
      <Section t="Pay with" />
      <View style={{ gap: 8 }}>{OPTS.map(([id, sub]) => <RadioCard key={id} on={pm === id} name={id} sub={sub} onPress={() => pick(id)} />)}</View>
      <Section t={head} />
      <KV rows={rows} />
      {pm === 'Bitcoin' && btc ? (
        <>
          <View style={{ marginTop: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 14 }}>
            <T s={11} w={800} c={D.MUT}>SEND EXACTLY</T>
            <T s={18} w={800}>{btcAmt + ' BTC'}</T>
            <T s={12} w={600} c={btcExpired ? D.DANGER : D.MUT} style={{ marginTop: 2 }}>{btcExpired ? 'Rate lock expired' : <>Rate locked for <T s={12} w={800} c={D.MUT}>{btcLock}</T></>}</T>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
              <Press onPress={() => { Share.share({ message: btc.address }).catch(() => {}); }}><T s={12.5} w={800} c={D.GD}>Copy address</T></Press>
              {btcExpired ? <Press onPress={() => { void store.task(store.remote.btcQuote(true)); }}><T s={12.5} w={800} c={D.GD}>Refresh quote</T></Press> : null}
            </View>
          </View>
          <FLabel t="Bitcoin transaction ID" mt={14} />
          <Input accessibilityLabel="Bitcoin transaction ID" value={s.btcTx || ''} placeholder="Paste the TXID from your wallet" autoCapitalize="none" autoCorrect={false} onChangeText={t => store.setState({ btcTx: t.trim(), payErr: '' })} />
          <T s={11.5} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 8 }}>Available in supported countries. Confirmed after the required network confirmations; if the rate lock expires, the BTC amount is recalculated.</T>
        </>
      ) : null}
      {pm === 'Bitcoin' && !btc ? <Press onPress={() => { void store.task(store.remote.btcQuote()); }} style={{ marginTop: 12, alignItems: 'center' }}><T s={13.5} w={800} c={D.GD}>Get Bitcoin quote</T></Press> : null}
      {paymentNeedsReference(pm) ? (
        <>
          <FLabel t={pm === 'UPI' ? 'UPI transaction reference' : 'Payment reference'} mt={14} />
          <Input accessibilityLabel="Payment reference" value={s.payRef || ''} placeholder="Reference shown after you pay" autoCapitalize="characters" autoCorrect={false} onChangeText={t => store.setState({ payRef: t, payErr: '' })} />
        </>
      ) : null}
      {pm !== 'Bitcoin' && pm !== 'UPI' && pm !== 'Net banking' ? (
        <>
          <Section t="Proof of payment" />
          <UploadPicker bucket="proof" purpose="payment_proof" icon="upload" title="Upload transfer receipt or bank advice" max={3} />
        </>
      ) : null}
      {s.paying ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: D.TINT }}>
          <Spinner sz={18} />
          <T s={13} w={700}>{pm === 'Net banking' ? 'Waiting for your bank to authorise…' : pm === 'UPI' ? 'Waiting for approval in your UPI app…' : 'Submitting your payment details…'}</T>
        </View>
      ) : null}
      <Alert msg={s.payErr} />
      <T s={11.5} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 12 }}>Your payment shows as processing until Mineral Bridge confirms the funds have arrived. A transaction reference is issued only after confirmation.</T>
      <Press scale={0.985} onPress={askOther} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR }}>
        <Ic name="help" s={18} c={D.GD} />
        <View style={{ flex: 1 }}>
          <T s={13} w={800}>Need letter of credit or another method?</T>
          <T s={11.5} w={600} c={D.MUT}>LC, escrow or split payments are arranged by our support team.</T>
        </View>
        <T s={12.5} w={800} c={D.GD}>Contact</T>
      </Press>
    </View>
  );
}
