import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { CC } from '../../context/store';
import type { AppState } from '../../context/state';
import { BgImage, ErrBox, Field, Toggle } from '../../components/ui/Blocks';
import { LinearFill, RadialBlob } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { Drift, FadeUp, Pop, Shimmer, Slide, Spin } from '../../components/ui/Motion';
import { SelectModal } from '../../components/ui/SelectModal';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { colors as c } from '../../theme';

export function AuthScreen() {
  const store = useStore(), s = store.state;
  const a = s.auth.method === 'email' || s.auth.method === 'whatsapp' ? s.auth : { ...s.auth, method: 'whatsapp' as const };
  const set = (p: Partial<AppState['auth']>) => store.setState(x => ({ auth: { ...x.auth, ...p }, authErr: '' }));
  const [tabW, setTabW] = useState(0);
  const [methodW, setMethodW] = useState(0);
  const [ccOpen, setCcOpen] = useState(false);
  const signin = a.mode === 'signin', email = a.method === 'email';
  const valid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.value.trim()) : (n => n >= 7 && n <= 12)(a.value.replace(/\D/g, '').replace(/^0+/, '').length);
  const methods: [typeof a.method, string, string][] = [['whatsapp', 'WhatsApp', IC.whatsappFull], ['email', 'Email', IC.email]];
  const cc = a.cc || '+234', flag = (CC.find(x => x[0] === cc) || ['', ''])[1];

  return (
    <View style={{ paddingTop: 6, paddingHorizontal: 18, paddingBottom: 24 }}>
      <FadeUp dist={18} dur={500} style={st.hero}>
        <BgImage source={imgFor('hero-grain')} style={StyleSheet.absoluteFill} imageStyle={{ opacity: 0.42 }} />
        <Drift dur={9000} dx={38} dy={22} sc={1.15} pointerEvents="none" style={{ position: 'absolute', left: -60, top: -80 }}>
          <RadialBlob size={220} color="rgba(217,180,86,.55)" style={{ position: 'relative' }} />
        </Drift>
        <Drift dur={11000} dx={-30} dy={-18} sc={0.9} pointerEvents="none" style={{ position: 'absolute', right: -50, bottom: -70 }}>
          <RadialBlob size={180} color="rgba(244,242,237,.22)" style={{ position: 'relative' }} />
        </Drift>
        <Spin dur={24000} pointerEvents="none" style={st.ring} />
        <View style={st.dot}><LinearFill angle={135} radius={16} stops={[[0, '#F0D78C'], [1, '#B8902F']]} /></View>
        <LinearFill stops={[[0.3, 'rgba(18,18,20,0)'], [1, 'rgba(18,18,20,.88)']]} />
        <View style={st.heroText}>
          <Label c={c.gold}>{signin ? 'WELCOME BACK' : 'VERIFIED MINERAL TRADING'}</Label>
          <Txt serif s={31} lh={1.05} c={c.paper} style={{ marginTop: 6 }}>{signin ? 'Sign in to Mineral Bridge' : 'Create your Mineral Bridge account'}</Txt>
        </View>
      </FadeUp>

      <FadeUp dist={18} dur={550} delay={80} style={st.card}>
        <View accessibilityRole="tablist" style={st.tabs} onLayout={e => setTabW(e.nativeEvent.layout.width)}>
          {tabW > 0 ? <Slide to={signin ? (tabW - 8) / 2 : 0} spring style={[st.thumb, { width: (tabW - 8) / 2 }]} /> : null}
          {([['signup', 'Sign up'], ['signin', 'Sign in']] as const).map(([id, label]) => (
            <Tap key={id} role="tab" selected={a.mode === id} onPress={() => set({ mode: id })} style={st.tab}>
              <Txt s={14} w={600} c={a.mode === id ? c.paper : c.muted}>{label}</Txt>
            </Tap>
          ))}
        </View>
        <Txt s={13.5} c={c.muted} lh={1.5} style={{ marginTop: 14, marginHorizontal: 2 }}>{signin ? 'We send a 4-digit code to the WhatsApp number or email on your account.' : 'Sign up with WhatsApp or email. We send a 4-digit code to verify it is you.'}</Txt>
        <Label style={{ marginTop: 16, marginHorizontal: 2, marginBottom: 8 }}>SEND CODE BY</Label>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {methods.map(([id, label, icon]) => {
            const on = a.method === id;
            return (
              <Tap key={id} role="tab" selected={on} scale={0.97} onPress={() => set({ method: id, value: '' })} onLayout={e => setMethodW(e.nativeEvent.layout.width)}
                style={[st.method, { backgroundColor: on ? c.ink : c.white, borderColor: on ? c.ink : c.line, boxShadow: on ? '0 10px 22px rgba(18,18,20,.22)' : undefined }]}>
                <View style={[st.methodIcon, { backgroundColor: on ? 'rgba(217,180,86,.18)' : c.chip }]}><Icon d={icon} size={16} color={on ? c.gold : c.ink} sw={1.9} /></View>
                <Txt s={14} w={600} c={on ? c.paper : c.ink}>{label}</Txt>
                {on && methodW > 0 ? (
                  <Shimmer width={methodW} style={[st.shimmer, { width: methodW * 0.4 }]}>
                    <LinearFill angle={90} stops={[[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]} />
                  </Shimmer>
                ) : null}
              </Tap>
            );
          })}
        </View>
        {!signin ? (
          <FadeUp dist={18} dur={350}>
            <Label style={{ marginTop: 16, marginHorizontal: 2, marginBottom: 8 }}>FULL NAME</Label>
            <Field accessibilityLabel="Full name" focusGold value={a.name} onChangeText={t => set({ name: t })} placeholder="Adaeze Okafor" autoCapitalize="words" textContentType="name" />
          </FadeUp>
        ) : null}
        <Label style={{ marginTop: 16, marginHorizontal: 2, marginBottom: 8 }}>{email ? 'EMAIL ADDRESS' : 'WHATSAPP NUMBER'}</Label>
        <View>
          <Field accessibilityLabel={email ? 'EMAIL ADDRESS' : 'WHATSAPP NUMBER'} focusGold value={a.value}
            onChangeText={t => set({ value: email ? t : t.replace(/[^\d\s]/g, '') })}
            placeholder={email ? 'you@company.com' : '803 000 0000'} keyboard={email ? 'email-address' : 'phone-pad'}
            autoCapitalize="none" autoCorrect={false} textContentType={email ? 'emailAddress' : 'telephoneNumber'}
            style={{ paddingLeft: email ? 42 : 120 }} />
          <View pointerEvents="none" style={st.fieldIcon}><Icon d={email ? IC.email : IC.whatsapp} size={17} color={c.goldInk} sw={1.9} /></View>
          {!email ? (
            <Tap label="Country code" onPress={() => setCcOpen(true)} style={st.cc}>
              <Txt s={14.5} w={600}>{flag} {cc}</Txt>
            </Tap>
          ) : null}
          {valid ? <Pop dur={350} style={st.valid}><Icon d={IC.check} size={12} color="#fff" sw={3.2} /></Pop> : null}
        </View>
        {s.authErr ? <ErrBox>{s.authErr}</ErrBox> : null}
        <Tap role="switch" checked={a.keep} onPress={() => set({ keep: !a.keep })} style={st.keep}>
          <Txt s={14}>Keep me signed in</Txt>
          <Toggle on={a.keep} spring />
        </Tap>
      </FadeUp>

      <FadeUp dist={18} dur={500} delay={200} style={st.note}>
        <Icon d={IC.shield} size={14} color={c.green} sw={2} />
        <Txt s={12} c={c.muted}>Codes expire in 10 minutes · we never share your contact</Txt>
      </FadeUp>
      <Tap onPress={() => set({ mode: signin ? 'signup' : 'signin' })} style={{ marginTop: 12 }}>
        <Txt s={13.5} c={c.muted} center>{signin ? 'New to Mineral Bridge?' : 'Already have an account?'} <Txt s={13.5} w={700} c={c.goldInk}>{signin ? 'Create account' : 'Sign in'}</Txt></Txt>
      </Tap>
      <SelectModal open={ccOpen} title="Country code" value={cc} options={CC.map(([v, n]) => ({ v, l: n + ' ' + v }))} onPick={v => set({ cc: v })} onClose={() => setCcOpen(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  hero: { height: 196, borderRadius: 28, overflow: 'hidden', backgroundColor: c.ink },
  ring: { position: 'absolute', right: 22, top: 22, width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(217,180,86,.55)' },
  dot: { position: 'absolute', right: 38, top: 38, width: 32, height: 32, borderRadius: 16, boxShadow: '0 0 24px rgba(217,180,86,.55)' },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 18 },
  card: { marginTop: -22, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,.88)', borderWidth: 1, borderColor: c.line, boxShadow: '0 18px 40px rgba(18,18,20,.10)' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, backgroundColor: c.hair },
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 12, backgroundColor: c.ink, boxShadow: '0 4px 12px rgba(18,18,20,.22)' },
  tab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  method: { flex: 1, height: 58, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderWidth: 1.5, overflow: 'hidden' },
  methodIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shimmer: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  fieldIcon: { position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center' },
  cc: { position: 'absolute', left: 6, top: 6, bottom: 6, width: 104, borderRightWidth: 1, borderRightColor: c.line, paddingLeft: 34, paddingRight: 4, justifyContent: 'center' },
  valid: { position: 'absolute', right: 12, top: 14, width: 24, height: 24, borderRadius: 12, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
  keep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 2 },
  note: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
});
