import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import { FadeIn, Ic, T } from '../../components/mb/base';
import { Alert, Card, Press, Row, Section } from '../../components/mb/kit';
import { D, SHADOW } from '../../theme';
import { idDocs } from './kycHelpers';

/** Upload one KYC document (`scr_kycDoc`). Camera and library pickers upload through the store. */
export function KycDocScreen() {
  const store = useStore(), s = store.state, k = s.kyc;
  const id = s.kycDocId || 'front', info = KYC_INFO[id], f = k[id];
  const docs = idDocs(store), lab = (docs.find(d => d[0] === id) || [id, info.title])[1];
  const flag = store.kycFlag(id), busy = s.kycUploading;
  const onPicked = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) return store.setState({ kycDocErr: res.errorCode === 'camera_unavailable' ? 'Camera is not available on this device. Upload a file instead.' : res.errorCode === 'permission' ? 'Allow camera and photo access in Settings to upload.' : 'This image could not be read. Try another file.' });
    const a = res.assets && res.assets[0];
    if (a && a.uri) store.saveKycFile({ uri: a.uri, fileName: a.fileName, fileSize: a.fileSize, type: a.type });
  };
  const opts = { mediaType: 'photo' as const, maxWidth: 1100, maxHeight: 1100, quality: 0.8 as const };
  const takePhoto = () => launchCamera({ ...opts, cameraType: id === 'selfie' ? 'front' : 'back', saveToPhotos: false }).then(onPicked).catch(() => store.setState({ kycDocErr: 'Camera is not available on this device. Upload a file instead.' }));
  const uploadFile = () => launchImageLibrary({ ...opts, selectionLimit: 1 }).then(onPicked).catch(() => store.setState({ kycDocErr: 'This image could not be read. Try another file.' }));
  const fileBtn = (icn: 'camera' | 'upload', t: string, onPress: () => void) => {
    const cam = icn === 'camera';
    return (
      <Press onPress={onPress} disabled={busy} style={[st.fileBtn, cam ? { backgroundColor: D.G, boxShadow: SHADOW.primary } : { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR }, { opacity: busy ? 0.6 : 1 }]}>
        <Ic name={icn} s={18} c={cam ? D.white : D.G} />
        <T s={14} w={800} c={cam ? D.white : D.G}>{busy ? 'Uploading…' : t}</T>
      </Press>
    );
  };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 22 }}>
      <T s={22} w={800} ls={-0.02}>{lab}</T>
      <T s={13.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 8 }}>{info.desc}</T>
      {flag ? (
        <View accessibilityRole="alert" style={st.flag}>
          <T s={12.5} w={600} c={D.DANGER} lh={1.45}><T s={12.5} w={700} c={D.DANGER}>Re-upload requested by compliance. </T>{flag}</T>
        </View>
      ) : null}
      <View style={[st.frame, f ? { backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderStyle: 'solid' } : null]}>
        {!f ? (
          <View style={{ alignItems: 'center', gap: 10, padding: 20 }}>
            <View style={{ width: id === 'selfie' ? 90 : 150, height: 90, borderRadius: id === 'selfie' ? 45 : 12, borderWidth: 2, borderColor: D.G, opacity: 0.55 }} />
            <T s={12.5} w={700} c={D.MUT} center>{info.hint}</T>
          </View>
        ) : null}
        {f && f.kind === 'img' && f.src ? <FadeIn style={StyleSheet.absoluteFill}><Image accessibilityLabel={'Preview of ' + lab} source={{ uri: f.src }} resizeMode="cover" style={StyleSheet.absoluteFill} /></FadeIn> : null}
        {f && f.kind === 'pdf' ? (
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={st.pdf}><T s={14} w={800} c={D.DANGER}>PDF</T></View>
            <T s={12.5} w={700} lines={1}>{f.name}</T>
          </View>
        ) : null}
      </View>
      {f ? (
        <View style={st.file}>
          <View style={st.ok}><Ic name="check" s={14} c={D.white} w={3} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={13} w={800} lines={1}>{f.name}</T>
            <T s={11.5} w={600} c={D.MUT}>{f.size + ' · added just now'}</T>
          </View>
          <Press disabled={busy} onPress={() => { store.removeKycFile(id); store.flash('Document removed'); }}><T s={12.5} w={800} c={D.DANGER}>Remove</T></Press>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        {fileBtn('camera', f ? 'Retake' : 'Take photo', takePhoto)}
        {fileBtn('upload', f ? 'Replace' : 'Upload file', uploadFile)}
      </View>
      <Alert msg={s.kycDocErr} />
      <Section t="Make sure" />
      <Card>
        {info.tips.map((t, i) => (
          <Row key={i} last={i === info.tips.length - 1}>
            <View style={st.tip}><Ic name="check" s={12} c={D.G} w={3} /></View>
            <T s={13} w={600} style={{ flex: 1 }}>{t}</T>
          </Row>
        ))}
      </Card>
      <T s={11.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 12 }}>JPG, PNG or PDF up to 10 MB. Files are encrypted and only seen by the Mineral Bridge compliance team.</T>
    </View>
  );
}

const st = StyleSheet.create({
  flag: { marginTop: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: D.dangerBg },
  frame: { marginTop: 16, height: 200, borderRadius: 20, backgroundColor: D.paper2, borderWidth: 2, borderStyle: 'dashed', borderColor: D.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pdf: { width: 64, height: 80, borderRadius: 10, backgroundColor: D.dangerBg, alignItems: 'center', justifyContent: 'center' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingVertical: 11, paddingHorizontal: 13, borderRadius: 14, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR },
  ok: { width: 26, height: 26, borderRadius: 13, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' },
  fileBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14 },
  tip: { width: 20, height: 20, borderRadius: 10, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center' },
});
