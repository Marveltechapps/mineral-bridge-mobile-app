import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { CC } from '../../context/store';
import type { AppState } from '../../context/state';
import { Grad, Ic, jakarta, PopIn, T } from '../../components/mb/base';
import { Logo } from '../../components/mb/art';
import { Alert, Btn, FLabel, Input, Press, SegTrack, Switch } from '../../components/mb/kit';
import { SelectModal } from '../../components/ui/SelectModal';
import { D } from '../../theme';

/** WhatsApp / Email switch: light track with a sliding white thumb. */
function MethodTrack({ value, onPick }: { value: 'whatsapp' | 'email'; onPick: (v: 'whatsapp' | 'email') => void }) {
  const [w, setW] = useState(0);
  const v = useRef(new Animated.Value(value === 'email' ? 1 : 0)).current;
  useEffect(() => { Animated.timing(v, { toValue: value === 'email' ? 1 : 0, duration: 340, easing: Easing.bezier(0.65, 0.05, 0.36, 1), useNativeDriver: true }).start(); }, [v, value]);
  const tw = w ? (w - 2) / 2 - 4 : 0;
  const items: ['whatsapp' | 'email', string, string][] = [['whatsapp', 'WhatsApp', 'wa'], ['email', 'Email', 'mail']];
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)} style={st.method}>
      {w ? <Animated.View style={[st.methodThumb, { width: tw, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, tw] }) }] }]} /> : null}
      {items.map(([id, l, icn]) => {
        const on = value === id;
        return (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={l} onPress={() => onPick(id)} style={st.methodBtn}>
            <Ic name={icn} s={15} c={on ? D.G : D.MUT} />
            <T s={12.5} w={800} c={on ? D.GD : D.MUT}>{l}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Sign up / sign in (`scr_auth`). Validation and the OTP request stay in the store (`primary()`). */
export function AuthScreen() {
  const store = useStore(), s = store.state;
  const insets = useSafeAreaInsets();
  const a = s.auth.method === 'email' || s.auth.method === 'whatsapp' ? s.auth : { ...s.auth, method: 'whatsapp' as const };
  const set = (p: Partial<AppState['auth']>) => store.setState(x => ({ auth: { ...x.auth, ...p }, authErr: '' }));
  const [ccOpen, setCcOpen] = useState(false);
  const signup = a.mode === 'signup', email = a.method === 'email';
  const valid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.value.trim()) : (n => n >= 7 && n <= 12)(a.value.replace(/\D/g, '').replace(/^0+/, '').length);
  const cc = a.cc || '+234', flag = (CC.find(x => x[0] === cc) || ['', ''])[1];
  const m = store.meta();

  return (
    <View style={{ flexGrow: 1, backgroundColor: D.white }}>
      <View style={st.head}>
        <Grad stops={[[0, D.cream], [1, D.cream2]]} radius={[0, 0, 28, 28]} />
        {s.stack.length > 0 ? <Press label="Back" onPress={() => store.back()} style={st.back}><Ic name="chevronLeft" s={20} c={D.INK} /></Press> : null}
        <View style={{ alignSelf: 'center' }}><Logo sz={92} /></View>
        <T s={10.5} w={800} c={D.G} ls={0.08} center style={{ marginTop: 12 }}>{signup ? 'VERIFIED MINERAL TRADING' : 'WELCOME BACK'}</T>
        <T s={21} w={800} ls={-0.02} lh={1.2} center style={{ marginTop: 4 }}>{signup ? 'Create your Mineral Bridge account' : 'Sign in to Mineral Bridge'}</T>
        <T s={12} w={600} c={D.MUT} lh={1.45} center style={{ marginTop: 6 }}>{signup ? 'Sign up with WhatsApp or email. We send a 4-digit code to verify it is you.' : 'We send a 4-digit code to the WhatsApp number or email on your account.'}</T>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 26 + insets.bottom, marginTop: 16 }}>
        <SegTrack items={[['signup', 'Sign up'], ['signin', 'Sign in']]} value={a.mode} onPick={v => set({ mode: v as AppState['auth']['mode'] })} pad={5} py={11} s={14} shadow />
        <FLabel t="Send code by" mt={18} />
        <MethodTrack value={a.method} onPick={v => set({ method: v, value: '' })} />
        {signup ? (
          <>
            <FLabel t="Full name" mt={16} />
            <Input accessibilityLabel="Full name" value={a.name} onChangeText={t => set({ name: t })} placeholder="Adaeze Okafor" w={600} autoCapitalize="words" textContentType="name" />
          </>
        ) : null}
        <FLabel t={email ? 'Email address' : 'WhatsApp number'} mt={16} />
        <View style={st.wrap}>
          {!email ? (
            <Press label="Country code" scale={1} onPress={() => setCcOpen(true)} style={st.cc}>
              <T s={15} w={800}>{flag + ' ' + cc}</T>
              <Ic name="chevronDown" s={13} c={D.MUT} w={2.6} />
            </Press>
          ) : <Ic name="mail" s={18} c={D.MUT} />}
          <TextInput accessibilityLabel={email ? 'Email address' : 'WhatsApp number'} value={a.value}
            onChangeText={t => set({ value: email ? t : t.replace(/[^\d\s]/g, '') })} onSubmitEditing={() => store.primary()}
            placeholder={email ? 'you@company.com' : '803 000 0000'} placeholderTextColor={D.placeholder} allowFontScaling={false}
            keyboardType={email ? 'email-address' : 'phone-pad'} autoCapitalize="none" autoCorrect={false} textContentType={email ? 'emailAddress' : 'telephoneNumber'}
            style={[st.field, { fontFamily: jakarta(600) }]} />
          {valid ? <PopIn dur={300} style={st.ok}><Ic name="check" s={13} c={D.white} w={3} /></PopIn> : null}
        </View>
        <Alert msg={s.authErr} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }}>
          <Ic name="shield" s={15} c={D.G} />
          <T s={12} w={600} c={D.MUT} style={{ flexShrink: 1 }}>Codes expire in 10 minutes · we never share your contact</T>
        </View>
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: a.keep }} onPress={() => set({ keep: !a.keep })} style={st.keep}>
          <T s={13.5} w={700}>Keep me signed in</T>
          <Switch on={a.keep} />
        </Pressable>
        <View style={{ marginTop: 20 }}><Btn label={m.cta || 'Send verification code'} disabled={s.authBusy} onPress={() => store.primary()} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 }}>
          <T s={13} w={600} c={D.MUT}>{signup ? 'Already have an account? ' : 'New to Mineral Bridge? '}</T>
          <Press onPress={() => set({ mode: signup ? 'signin' : 'signup' })}><T s={13} w={800} c={D.GD}>{signup ? 'Sign in' : 'Create account'}</T></Press>
        </View>
        <Press onPress={() => store.jump('cats')} style={{ alignSelf: 'center', marginTop: 14 }}><T s={12.5} w={700} c={D.MUT}>Skip · Browse as guest</T></Press>
      </View>
      <SelectModal open={ccOpen} title="Country code" value={cc} options={CC.map(([v, n]) => ({ v, l: n + ' ' + v }))} onPick={v => set({ cc: v })} onClose={() => setCcOpen(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  head: { paddingTop: 22, paddingHorizontal: 24, paddingBottom: 26 },
  back: { position: 'absolute', left: 14, top: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,.8)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  method: { flexDirection: 'row', gap: 4, backgroundColor: D.BG, borderWidth: 1, borderColor: D.BOR, borderRadius: 12, padding: 4 },
  methodThumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 9, backgroundColor: D.white, boxShadow: '0 2px 6px -3px rgba(20,40,75,.4)' },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 9 },
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.BOR, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2 },
  cc: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 10, borderRightWidth: 1, borderRightColor: D.BOR, alignSelf: 'stretch' },
  field: { flex: 1, minWidth: 0, height: 46, fontSize: 15, color: D.INK, paddingVertical: 0 },
  ok: { width: 22, height: 22, borderRadius: 11, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
  keep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
});
