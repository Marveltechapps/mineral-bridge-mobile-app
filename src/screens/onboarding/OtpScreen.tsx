import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Ic, RadGrad, T } from '../../components/mb/base';
import { Btn, Press } from '../../components/mb/kit';
import { otpEmailForDisplay } from '../../lib/mappers';
import { D } from '../../theme';

const TRUST: [string, string][] = [['flask', 'Inspected'], ['badge', 'Certified'], ['truck', 'Tracked']];

/** Enter the 4-digit code (`scr_otp`). */
export function OtpScreen() {
  const store = useStore(), s = store.state, a = s.auth;
  const insets = useSafeAreaInsets();
  const input = useRef<TextInput>(null);
  const [, setNow] = useState(0);
  useEffect(() => { const t = setTimeout(() => input.current?.focus(), 350); return () => clearTimeout(t); }, []);
  // Re-render once a second while the resend countdown runs.
  useEffect(() => { if (s.resendAt <= Date.now()) return undefined; const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, [s.resendAt]);
  const email = a.method === 'email';
  const to = email ? otpEmailForDisplay(a.value, s.maskedDest) : (s.maskedDest || ((a.cc || '+234') + ' ' + (a.value.trim().replace(/^0+/, '') || 'your number')));
  const wait = Math.max(0, Math.ceil((s.resendAt - Date.now()) / 1000));
  const m = store.meta();
  return (
    <View style={{ flexGrow: 1, backgroundColor: D.white }}>
      <View style={{ flex: 1, paddingTop: 10, paddingHorizontal: 26, alignItems: 'center' }}>
        <View style={st.badge}>
          <RadGrad cx={0.5} cy={0.42} rx={0.77} stops={[[0, D.cream], [1, D.BG]]} radius={60} />
          <Ic name={email ? 'mail' : 'wa'} s={46} c={D.G} w={1.8} />
          <View style={st.lock}><Ic name="lock" s={15} c={D.white} w={2.4} /></View>
        </View>
        <T s={24} w={800} center style={{ marginTop: 20 }}>Enter the 4-digit code</T>
        <T s={13.5} w={600} c={D.MUT} center style={{ marginTop: 8 }}>{'Sent by ' + (email ? 'email' : 'WhatsApp') + ' to'}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <T s={14} w={800}>{to}</T>
          <Press onPress={() => store.back()}><T s={13} w={800} c={D.G}>Change</T></Press>
        </View>
        <Press scale={1} onPress={() => input.current?.focus()} style={{ flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 26 }}>
          {[0, 1, 2, 3].map(i => {
            const d = s.otp[i] || '';
            return (
              <View key={i} style={[st.box, { borderColor: s.otpErr ? D.DANGER : d ? D.G : D.BOR, backgroundColor: d ? D.paper3 : D.white }]}>
                <T s={24} w={800}>{d}</T>
              </View>
            );
          })}
          <TextInput ref={input} accessibilityLabel="Verification code" value={s.otp} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={4}
            onChangeText={t => store.setState({ otp: t.replace(/\D/g, '').slice(0, 4), otpErr: '' })} onSubmitEditing={() => store.primary()} caretHidden style={st.hidden} />
        </Press>
        {s.otpErr ? <T accessibilityRole="alert" s={12.5} w={700} c={D.DANGER} center style={{ marginTop: 14 }}>{s.otpErr}</T> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
          <T s={13} w={700} c={D.MUT}>Didn’t get it? </T>
          <Press disabled={s.authBusy || wait > 0} onPress={() => { void store.task(store.remote.resendOtp()); }}>
            <T s={13} w={800} c={wait > 0 ? D.MUT : D.G}>{wait > 0 ? 'Resend code in ' + wait + 's' : 'Resend code'}</T>
          </Press>
        </View>
        {__DEV__ && s.devOtp ? (
          <View style={st.demo}><T s={12} w={700} c={D.GD} center>Development build: the server returned the code {s.devOtp}. Production builds never show this.</T></View>
        ) : null}
      </View>
      <View style={{ paddingTop: 18, paddingHorizontal: 26 }}>
        <Btn label={m.cta || 'Verify and continue'} disabled={s.otp.length !== 4 || s.authBusy} onPress={() => store.primary()} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 20, marginBottom: 24 + insets.bottom }}>
        {TRUST.map(([icn, l]) => (
          <View key={l} style={{ alignItems: 'center', gap: 6 }}>
            <View style={st.trust}><Ic name={icn} s={17} c={D.G} /></View>
            <T s={10.5} w={700} c={D.MUT}>{l}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  badge: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  lock: { position: 'absolute', right: 22, bottom: 20, width: 34, height: 34, borderRadius: 17, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: D.white },
  box: { width: 56, height: 62, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  hidden: { ...StyleSheet.absoluteFillObject, opacity: 0.011, color: 'transparent', fontSize: 24 },
  demo: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: D.TINT },
  trust: { width: 36, height: 36, borderRadius: 18, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center' },
});
