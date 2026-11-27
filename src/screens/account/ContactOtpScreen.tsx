import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Alert, Note, Press } from '../../components/mb/kit';
import { D } from '../../theme';

const WHERE: Record<string, string> = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'email' };

/** Verification code for a phone/email change (`POST /me/contact-change`). Styled like the sign-in OTP screen. */
export function ContactOtpScreen() {
  const store = useStore(), s = store.state, ch = s.contact;
  const input = useRef<TextInput>(null);
  const [, setNow] = useState(0);
  useEffect(() => { const t = setTimeout(() => input.current?.focus(), 350); return () => clearTimeout(t); }, []);
  const resendAt = ch ? ch.resendAt : 0;
  useEffect(() => { if (resendAt <= Date.now()) return undefined; const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, [resendAt]);
  if (!ch) return <View style={{ paddingHorizontal: 22 }}><Note>This change expired. Go back and tap Change again.</Note></View>;
  const wait = Math.max(0, Math.ceil((ch.resendAt - Date.now()) / 1000));
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 22, alignItems: 'center' }}>
      <T s={24} w={800} center>Enter the 4-digit code</T>
      <T s={13.5} w={600} c={D.MUT} center style={{ marginTop: 8 }}>{'Sent by ' + (WHERE[ch.channel] || ch.channel) + ' to your new ' + (ch.field === 'email' ? 'email' : 'number')}</T>
      <T s={14} w={800} center style={{ marginTop: 3 }}>{ch.masked || ch.identifier}</T>
      <Press scale={1} onPress={() => input.current?.focus()} style={{ flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 26 }}>
        {[0, 1, 2, 3].map(i => {
          const d = s.contactCode[i] || '';
          return <View key={i} style={[st.box, { borderColor: s.contactErr ? D.DANGER : d ? D.G : D.BOR, backgroundColor: d ? D.paper3 : D.white }]}><T s={24} w={800}>{d}</T></View>;
        })}
        <TextInput ref={input} accessibilityLabel="Verification code" value={s.contactCode} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={4}
          onChangeText={t => store.setState({ contactCode: t.replace(/\D/g, '').slice(0, 4), contactErr: '' })} caretHidden style={st.hidden} />
      </Press>
      <View style={{ alignSelf: 'stretch' }}><Alert msg={s.contactErr} /></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
        <T s={13} w={700} c={D.MUT}>Didn’t get it? </T>
        <Press disabled={s.contactBusy || wait > 0} onPress={() => { void store.task(store.remote.resendContactChange()); }}>
          <T s={13} w={800} c={wait > 0 ? D.MUT : D.G}>{wait > 0 ? 'Resend code in ' + wait + 's' : 'Resend code'}</T>
        </Press>
      </View>
      <View style={{ alignSelf: 'stretch' }}>
        <Note mt={20}>{'Your current ' + (ch.field === 'email' ? 'email' : 'number') + ' stays active until you verify the new one.'}</Note>
        {__DEV__ && ch.devOtp ? <Note mt={12}>{'Development build: the server returned the code ' + ch.devOtp + '. Production builds never show this.'}</Note> : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  box: { width: 56, height: 62, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  hidden: { ...StyleSheet.absoluteFillObject, opacity: 0.011, color: 'transparent', fontSize: 24 },
});
