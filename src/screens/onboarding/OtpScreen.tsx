import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { ErrBox, InfoBox } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

export function OtpScreen() {
  const store = useStore(), s = store.state, a = s.auth;
  const input = useRef<TextInput>(null);
  useEffect(() => { const t = setTimeout(() => input.current?.focus(), 350); return () => clearTimeout(t); }, []);
  const email = a.method === 'email';
  const to = email ? (a.value || 'your email') : (a.cc || '+234') + ' ' + (a.value.trim().replace(/^0+/, '') || 'your number');
  return (
    <FadeUp style={{ paddingTop: 10, paddingHorizontal: 22, paddingBottom: 24 }}>
      <Txt serif s={32} lh={1.05} ls={-0.3}>Enter the 4-digit code</Txt>
      <Txt s={14} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>Sent by {email ? 'email' : 'WhatsApp'} to <Txt s={14} w={700}>{to}</Txt></Txt>
      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[st.box, { borderColor: s.otp.length === i ? c.ink : c.line }]}>
              <Txt mono s={24} w={600}>{s.otp[i] || ''}</Txt>
            </View>
          ))}
        </View>
        <TextInput ref={input} accessibilityLabel="Verification code" value={s.otp} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={4}
          onChangeText={t => store.setState({ otp: t.replace(/\D/g, '').slice(0, 4), otpErr: '' })} caretHidden style={st.hidden} />
      </View>
      {s.otpErr ? <ErrBox>{s.otpErr}</ErrBox> : null}
      <View style={st.row}>
        <Txt s={13.5} c={c.muted}>Didn’t get it?</Txt>
        <Tap onPress={() => store.flash('A new code was requested')}><Txt s={13.5} w={600} c={c.goldInk}>Resend code</Txt></Tap>
      </View>
      <InfoBox mt={20}>Demo mode: no message is sent. Enter any 4 digits.</InfoBox>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  box: { flex: 1, height: 60, borderRadius: 14, backgroundColor: c.white, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  hidden: { ...StyleSheet.absoluteFillObject, opacity: 0.011, color: 'transparent', fontSize: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
});
