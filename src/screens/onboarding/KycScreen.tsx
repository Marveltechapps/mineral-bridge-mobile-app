import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import { Ic, T } from '../../components/mb/base';
import { Alert, Check, Chip, Press, Section } from '../../components/mb/kit';
import { D } from '../../theme';
import { idDocs } from './kycHelpers';

/** Registration step 3 (`scr_kyc`): ID type, document list with progress, consent. */
export function KycScreen() {
  const store = useStore(), s = store.state, k = s.kyc;
  const docs = idDocs(store), n = docs.filter(([id]) => k[id]).length;
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 22 }}>
      <T s={24} w={800} ls={-0.02}>Verify your identity</T>
      <T s={13.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 8 }}>Every buyer and seller is verified before trading. Your documents are encrypted and only seen by our compliance team.</T>
      <Section t="ID type" />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {['National ID', 'Passport', "Driver's licence"].map(t => <Chip key={t} label={t} on={k.idType === t} pad={[9, 14]} s={13} onPress={() => store.setIdType(t)} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginHorizontal: 2, marginBottom: 8 }}>
        <T s={12.5} w={800} c={D.MUT}>Documents</T>
        <T s={12} w={800} c={D.G}>{n + ' of ' + docs.length + ' uploaded'}</T>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: D.BOR, overflow: 'hidden', marginBottom: 12 }}>
        <View style={{ height: '100%', width: ((docs.length ? Math.round(100 * n / docs.length) : 0) + '%') as `${number}%`, backgroundColor: D.G }} />
      </View>
      <View style={{ gap: 8 }}>
        {docs.map(([id, label]) => {
          const f = k[id], fl = store.kycFlag(id), info = KYC_INFO[id];
          return (
            <Press key={id} scale={0.985} onPress={() => store.go('kycDoc', { kycDocId: id, kycDocErr: '' })} style={[st.doc, { borderColor: fl ? D.redLine : f ? D.goldLine : D.BOR }]}>
              <View style={[st.thumb, { backgroundColor: f ? D.TINT : D.chip }]}>
                {f && f.kind === 'img' && f.src ? <Image accessibilityLabel={label} source={{ uri: f.src }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : f && f.kind === 'pdf' ? <T s={10.5} w={800} c={D.DANGER}>PDF</T>
                    : <Ic name={info.icon} s={22} c={f ? D.G : D.MUT} w={1.7} />}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T s={13.5} w={800} lines={1}>{label}</T>
                <T s={11.5} w={600} lines={1} c={fl ? D.DANGER : f ? D.G : D.MUT} style={{ marginTop: 2 }}>{fl ? 'Re-upload requested · ' + fl : f ? 'Uploaded · ' + f.name : info.short}</T>
              </View>
              {fl ? <View style={st.re}><T s={12} w={800} c={D.white}>Re-upload</T></View>
                : f ? <View style={st.ok}><Ic name="check" s={14} c={D.white} w={3} /></View>
                  : <View style={st.up}><T s={12.5} w={800} c={D.G}>Upload</T></View>}
            </Press>
          );
        })}
      </View>
      <Check on={k.consent} text="I confirm these documents are genuine and consent to identity checks." onPress={() => store.setConsent(!k.consent)} />
      <Alert msg={s.kycErr} />
    </View>
  );
}

const st = StyleSheet.create({
  doc: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: D.white, borderWidth: 1.5, borderRadius: 16, padding: 11 },
  thumb: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  re: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: D.DANGER },
  ok: { width: 26, height: 26, borderRadius: 13, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
  up: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 10, borderWidth: 1.5, borderColor: D.G },
});
