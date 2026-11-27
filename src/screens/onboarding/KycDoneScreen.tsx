import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../context/AppStore';
import { Grad, Ic, PopIn, T } from '../../components/mb/base';
import { Btn, RefPill } from '../../components/mb/kit';
import { D, SHADOW } from '../../theme';
import { kycDemo } from './kycDemo';

/** KYC submitted (`scr_kycDone`). */
export function KycDoneScreen() {
  const store = useStore(), s = store.state, u = s.user || { kyc: 'pending', kycRef: '' };
  const insets = useSafeAreaInsets();
  const demo = kycDemo(store), m = store.meta();
  const verified = u.kyc === 'verified';
  return (
    <View style={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 26 + insets.bottom }}>
      <Grad stops={[[0, D.cream], [1, D.BG]]} style={{ left: 0, right: 0 }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
        <PopIn><View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: verified ? D.G : D.INK, alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.badge }}><Ic name={verified ? 'check' : 'clock'} s={44} c={D.white} w={2.6} /></View></PopIn>
        <T s={23} w={800} center style={{ marginTop: 22 }}>{verified ? 'KYC approved' : u.kyc === 'rejected' ? 'Documents need re-upload' : 'KYC submitted for review'}</T>
        <T s={14} w={600} c={D.MUT} lh={1.5} center style={{ marginTop: 8, maxWidth: 290 }}>{'Most reviews finish within one working day. ' + (s.returnTo ? 'When approved, you can continue where you left off.' : 'We will notify you by email, SMS and WhatsApp when it is approved.')}</T>
        <RefPill k="REF" v={u.kycRef || '—'} />
        {__DEV__ ? (
          <View style={{ width: '100%', marginTop: 26, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: D.sand, backgroundColor: 'rgba(255,255,255,.5)' }}>
            <T s={11} w={800} c={D.MUT} ls={0.04}>DEMO · SIMULATE COMPLIANCE DECISION</T>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1 }}><Btn label="Approve" kind="subtle" size="sm" onPress={demo.approve} /></View>
              <View style={{ flex: 1 }}><Btn label="Ask for document" kind="danger" size="sm" onPress={demo.reject} /></View>
            </View>
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 20 }}><Btn label={m.cta || 'Go to home'} icon="arrowRight" onPress={() => store.primary()} /></View>
    </View>
  );
}
