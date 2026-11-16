import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import type { AppState } from '../../context/state';
import { CheckRow, ErrBox } from '../../components/ui/Blocks';
import { LinearFill } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp, Pop, ProgressFill } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';
import { idDocs } from './kycHelpers';

export function KycScreen() {
  const store = useStore(), s = store.state, k = s.kyc;
  const setK = (p: Partial<AppState['kyc']>) => store.setState(x => ({ kyc: { ...x.kyc, ...p }, kycErr: '' }));
  const docs = idDocs(store), done = docs.filter(([id]) => k[id]).length;
  return (
    <FadeUp style={{ paddingTop: 10, paddingHorizontal: 22, paddingBottom: 24 }}>
      <Txt serif s={32} lh={1.05} ls={-0.3}>Verify your identity</Txt>
      <Txt s={14} c={c.muted} lh={1.5} style={{ marginTop: 10 }}>Every buyer and seller is verified before trading. Your documents are encrypted and only seen by our compliance team.</Txt>
      <Label style={{ marginTop: 22, marginHorizontal: 2, marginBottom: 8 }}>ID TYPE</Label>
      <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
        {['National ID', 'Passport', "Driver's licence"].map(t => (
          <Tap key={t} role="radio" selected={k.idType === t} onPress={() => setK({ idType: t, front: false, back: false })} style={[st.idChip, { backgroundColor: k.idType === t ? c.ink : c.white }]}>
            <Txt s={13} w={600} c={k.idType === t ? c.paper : c.ink}>{t}</Txt>
          </Tap>
        ))}
      </View>
      <View style={st.docsHead}>
        <Label>DOCUMENTS</Label>
        <Txt mono s={11.5} w={600} c={c.goldInk}>{done + ' of ' + docs.length + ' uploaded'}</Txt>
      </View>
      <View style={st.track}>
        <ProgressFill pct={Math.round(100 * done / docs.length)} dur={500} style={{ borderRadius: 3, overflow: 'hidden' }}>
          <LinearFill angle={90} stops={[[0, '#B8902F'], [1, '#D9B456']]} />
        </ProgressFill>
      </View>
      <View style={{ gap: 8 }}>
        {docs.map(([id, label]) => {
          const f = k[id], fl = store.kycFlag(id);
          const border = fl ? c.redLine : f ? c.greenLine : c.line;
          return (
            <Tap key={id} scale={0.985} onPress={() => store.go('kycDoc', { kycDocId: id, kycDocErr: '' })} style={[st.doc, { borderColor: border }]}>
              <View style={st.thumb}>
                {f && f.kind === 'img' ? <Image accessibilityLabel={label} source={{ uri: f.src }} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" /> : null}
                {f && f.kind === 'pdf' ? <Txt mono s={10} w={700} c={c.red}>PDF</Txt> : null}
                {f && f.kind === 'sample' ? (
                  <View style={st.sample}>
                    <LinearFill angle={135} stops={[[0, '#1E2A20'], [1, '#3F5A45']]} />
                    <View style={{ width: 16, height: 20, borderRadius: 3, backgroundColor: c.soft }} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.7)' }} />
                      <View style={{ height: 3, width: '70%', borderRadius: 2, backgroundColor: 'rgba(255,255,255,.5)' }} />
                      <View style={{ height: 3, width: '50%', borderRadius: 2, backgroundColor: 'rgba(255,255,255,.5)' }} />
                    </View>
                  </View>
                ) : null}
                {!f ? <Icon d={KYC_INFO[id].icon} size={18} color={c.muted2} sw={1.8} /> : null}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt s={14} w={600} lines={1}>{label}</Txt>
                <Txt s={12} lines={1} c={fl ? c.red : f ? c.green : c.muted} style={{ marginTop: 2 }}>{fl ? 'Re-upload requested · ' + fl : f ? 'Uploaded · ' + f.name : KYC_INFO[id].short}</Txt>
              </View>
              {fl ? <View style={st.flag}><Txt s={11.5} w={600} c="#fff">Re-upload</Txt></View> : null}
              {f && !fl ? <Pop dur={350} style={st.ok}><Icon d={IC.check} size={12} color="#fff" sw={3.2} /></Pop> : null}
              {!f ? <Txt s={12.5} w={600} c={c.goldInk}>Upload</Txt> : null}
            </Tap>
          );
        })}
      </View>
      <View style={{ marginTop: 14 }}>
        <CheckRow on={k.consent} onPress={() => setK({ consent: !k.consent })}>I confirm these documents are genuine and consent to identity checks.</CheckRow>
      </View>
      {s.kycErr ? <ErrBox>{s.kycErr}</ErrBox> : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  idChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: c.line },
  docsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginHorizontal: 2, marginBottom: 8 },
  track: { height: 5, borderRadius: 3, backgroundColor: c.track, overflow: 'hidden', marginBottom: 12 },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10, paddingLeft: 10, paddingRight: 12, borderRadius: 18, backgroundColor: c.white, borderWidth: 1.5 },
  thumb: { width: 62, height: 46, borderRadius: 10, overflow: 'hidden', backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  sample: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', gap: 4, padding: 5, overflow: 'hidden' },
  flag: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: 99, backgroundColor: c.red },
  ok: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
});
