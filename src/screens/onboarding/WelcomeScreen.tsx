import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { BgImage } from '../../components/ui/Blocks';
import { LinearFill } from '../../components/ui/Gradient';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { colors as c } from '../../theme';
import type { ScreenProps } from '../types';

export function WelcomeScreen({ onOpenStarter }: ScreenProps) {
  const store = useStore();
  const signup = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signup' }, authErr: '' })); store.go('auth'); };
  const signin = () => { store.setState(x => ({ auth: { ...x.auth, mode: 'signin' }, authErr: '' })); store.go('auth'); };
  return (
    <FadeUp fadeOnly dur={500} style={st.wrap}>
      <Tap role="none" onLongPress={onOpenStarter} delayLongPress={900} label="Mineral Bridge">
        <BgImage source={imgFor('hero-grain')} style={st.hero}>
          <LinearFill stops={[[0.4, 'rgba(18,18,20,0)'], [1, 'rgba(18,18,20,.75)']]} />
          <Label c={c.gold} style={st.kicker}>VERIFIED MINERAL TRADING</Label>
        </BgImage>
      </Tap>
      <Txt serif s={44} lh={1} ls={-0.6} style={{ marginTop: 24 }}>Buy and sell minerals, verified at every step.</Txt>
      <Txt s={14} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>Inspected lots, agreed quotations, e-contracts and tracked delivery for buyers and sellers worldwide.</Txt>
      <View style={{ flex: 1 }} />
      <View style={st.btns}>
        <Tap scale={0.98} onPress={signup} style={[st.btn, { backgroundColor: c.ink }]}><Txt s={15} w={600} c={c.paper}>Create account</Txt></Tap>
        <Tap scale={0.98} onPress={signin} style={[st.btn, st.btnLight]}><Txt s={15} w={600}>Sign in</Txt></Tap>
        <Tap onPress={() => store.jump('cats')} style={st.guest}><Txt s={14} w={600} c={c.muted}>Browse as guest</Txt></Tap>
      </View>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 26 },
  hero: { height: 330, marginTop: 4, marginHorizontal: -8, borderRadius: 30 },
  kicker: { position: 'absolute', left: 20, bottom: 18 },
  btns: { gap: 8, marginTop: 24 },
  btn: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnLight: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  guest: { height: 44, alignItems: 'center', justifyContent: 'center' },
});
