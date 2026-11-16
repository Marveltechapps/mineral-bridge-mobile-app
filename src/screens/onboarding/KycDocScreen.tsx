import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import { Card, ErrBox } from '../../components/ui/Blocks';
import { LinearFill, RadialBlob } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp, ScanLine } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { fmt } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { idDocs } from './kycHelpers';

export function KycDocScreen() {
  const store = useStore(), s = store.state, k = s.kyc;
  const id = s.kycDocId || 'front', info = KYC_INFO[id], f = k[id];
  const docs = idDocs(store), lab = (docs.find(d => d[0] === id) || [id, info.title])[1], pos = docs.findIndex(d => d[0] === id);
  const flag = store.kycFlag(id);
  const { width } = useWindowDimensions();
  const frameW = Math.floor(width - 36), frameH = Math.round(frameW / info.ratio);
  const setDoc = (v: typeof f) => store.setState(x => ({ kyc: { ...x.kyc, [id]: v }, kycErr: '' }));
  const useSample = () => { setDoc({ kind: 'sample', src: '', name: 'sample-' + id + '.jpg', size: '1.2 MB', at: Date.now() }); store.setState({ kycDocErr: '' }); };
  const onPicked = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) return store.setState({ kycDocErr: res.errorCode === 'camera_unavailable' ? 'Camera is not available on this device. Upload a file instead.' : res.errorCode === 'permission' ? 'Allow camera and photo access in Settings to upload.' : 'This image could not be read. Try another file.' });
    const a = res.assets && res.assets[0];
    if (a && a.uri) store.saveKycFile({ uri: a.uri, fileName: a.fileName, fileSize: a.fileSize, type: a.type });
  };
  const opts = { mediaType: 'photo' as const, maxWidth: 1100, maxHeight: 1100, quality: 0.8 as const };
  const takePhoto = () => launchCamera({ ...opts, cameraType: id === 'selfie' ? 'front' : 'back', saveToPhotos: false }).then(onPicked).catch(() => store.setState({ kycDocErr: 'Camera is not available on this device. Upload a file instead.' }));
  const uploadFile = () => launchImageLibrary({ ...opts, selectionLimit: 1 }).then(onPicked).catch(() => store.setState({ kycDocErr: 'This image could not be read. Try another file.' }));
  const sampleHead = id === 'address' ? 'UTILITY BILL · OCT 2026' : id === 'biz' ? 'CERTIFICATE OF INCORPORATION' : id === 'selfie' ? 'SELFIE WITH ID' : (k.idType || 'NATIONAL ID').toUpperCase();
  const mrz = id === 'front' ? 'IDNGA<<OKAFOR<<ADAEZE<<<<<<<<<<<' : id === 'back' ? '<<<<<<<<<<<<<<<<<<<<A0482216<<<' : '';
  const corner = (pos2: object) => <View style={[st.corner, pos2]} />;

  return (
    <FadeUp style={{ paddingTop: 6, paddingHorizontal: 18, paddingBottom: 24 }}>
      <Label style={{ marginHorizontal: 4 }}>{'DOCUMENT ' + (pos + 1) + ' OF ' + docs.length}</Label>
      <Txt serif s={30} lh={1.05} style={{ marginTop: 6, marginHorizontal: 4 }}>{lab}</Txt>
      <Txt s={13.5} c={c.muted} lh={1.5} style={{ marginTop: 8, marginHorizontal: 4 }}>{info.desc}</Txt>
      {flag ? (
        <View accessibilityRole="alert" style={st.flagBox}>
          <Txt s={13} c={c.red} lh={1.5}><Txt s={13} w={700} c={c.red}>Re-upload requested by compliance.</Txt> {flag}</Txt>
        </View>
      ) : null}
      <View style={[st.frame, { width: frameW, height: frameH }]}>
        {!f ? (
          <>
            <RadialBlob size={frameH * 1.4 || 300} color="rgba(217,180,86,.18)" style={{ left: '-40%', top: '-50%' }} />
            <View style={[st.inner, { borderRadius: id === 'selfie' ? 999 : 14 }]}>
              {corner({ left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 10 })}
              {corner({ right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 10 })}
              {corner({ left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 10 })}
              {corner({ right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 10 })}
              {frameH > 0 ? (
                <ScanLine height={frameH * 0.72} style={st.scan}>
                  <LinearFill angle={90} stops={[[0, 'rgba(217,180,86,0)'], [0.5, '#D9B456'], [1, 'rgba(217,180,86,0)']]} />
                </ScanLine>
              ) : null}
            </View>
            <Txt s={12.5} c={c.soft} center style={st.hint}>{info.hint}</Txt>
          </>
        ) : null}
        {f && f.kind === 'img' ? <FadeUp fadeOnly dur={400} style={StyleSheet.absoluteFill}><Image accessibilityLabel={'Preview of ' + lab} source={{ uri: f.src }} resizeMode="contain" style={{ width: '100%', height: '100%', backgroundColor: c.ink }} /></FadeUp> : null}
        {f && f.kind === 'pdf' ? (
          <FadeUp fadeOnly dur={400} style={[StyleSheet.absoluteFill, st.pdf]}>
            <View style={st.pdfDoc}><View style={st.pdfBadge}><Txt mono s={11} w={700} c="#fff">PDF</Txt></View></View>
            <Txt s={13} w={600} lines={1} style={{ maxWidth: '80%' }}>{f.name}</Txt>
          </FadeUp>
        ) : null}
        {f && f.kind === 'sample' ? (
          <FadeUp fadeOnly dur={400} style={[StyleSheet.absoluteFill, st.sampleWrap]}>
            <View style={st.sampleCard}>
              <LinearFill angle={135} stops={[[0, '#E8E3D3'], [1, '#CFC6AA']]} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Txt mono s={9.5} ls={0.8} c={c.ink2}>{sampleHead}</Txt>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.goldInk }} />
              </View>
              <View style={{ flex: 1, flexDirection: 'row', gap: 12, marginTop: 10 }}>
                {id === 'front' || id === 'selfie' ? <View style={{ width: '30%', borderRadius: 8, overflow: 'hidden' }}><LinearFill stops={[[0, '#9C9AA0'], [1, '#6B6A70']]} /></View> : null}
                <View style={{ flex: 1, gap: 7, justifyContent: 'center' }}>
                  <View style={[st.bar, { height: 7, width: '80%', backgroundColor: c.ink2 }]} />
                  <View style={[st.bar, { width: '60%' }]} /><View style={[st.bar, { width: '70%' }]} /><View style={[st.bar, { width: '45%' }]} />
                </View>
              </View>
              {mrz ? <Txt mono s={9} ls={1} c={c.ink2} lines={1} style={{ marginTop: 8 }}>{mrz}</Txt> : null}
              <View style={st.demoTag}><Txt mono s={9} c={c.paper}>DEMO SAMPLE</Txt></View>
            </View>
          </FadeUp>
        ) : null}
      </View>

      {f ? (
        <>
          <FadeUp dist={18} dur={350}>
            <Card r={18} style={st.fileCard}>
              <View style={st.fileOk}><Icon d={IC.check} size={14} color={c.green} sw={3.2} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt s={13.5} w={600} lines={1}>{f.name}</Txt>
                <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{f.size + ' · added ' + fmt(f.at)}</Txt>
              </View>
            </Card>
          </FadeUp>
          <View style={st.grid2}>
            <Tap onPress={uploadFile} style={st.light46}><Icon d={IC.replace} size={16} color={c.ink} sw={1.9} /><Txt s={13.5} w={600}>Replace</Txt></Tap>
            <Tap onPress={() => { setDoc(false); store.flash('Document removed'); }} style={[st.light46, { borderColor: c.redLine }]}><Txt s={13.5} w={600} c={c.red}>Remove</Txt></Tap>
          </View>
          {flag ? <Tap onPress={useSample} style={{ marginTop: 10 }}><Txt s={12.5} w={600} c={c.goldInk} center>Use a new sample document (demo)</Txt></Tap> : null}
        </>
      ) : (
        <>
          <View style={[st.grid2, { marginTop: 12 }]}>
            <Tap onPress={takePhoto} style={[st.big, { backgroundColor: c.ink }]}><Icon d={IC.camera} size={17} color={c.gold} sw={1.9} /><Txt s={14} w={600} c={c.paper}>Take photo</Txt></Tap>
            <Tap onPress={uploadFile} style={[st.big, { backgroundColor: c.white, borderWidth: 1, borderColor: c.line }]}><Icon d={IC.upload} size={17} color={c.ink} sw={1.9} /><Txt s={14} w={600}>Upload file</Txt></Tap>
          </View>
          <Tap onPress={useSample} style={{ marginTop: 10 }}><Txt s={12.5} w={600} c={c.goldInk} center>Use a sample document (demo)</Txt></Tap>
        </>
      )}
      {s.kycDocErr ? <ErrBox>{s.kycDocErr}</ErrBox> : null}
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>MAKE SURE</Label>
      <Card style={{ paddingVertical: 4, paddingHorizontal: 15 }}>
        {info.tips.map((t, i) => (
          <View key={i} style={[st.tip, { borderBottomColor: i === info.tips.length - 1 ? 'transparent' : c.hair }]}>
            <View style={st.tipDot}><Icon d={IC.check} size={10} color={c.gold} sw={3.2} /></View>
            <Txt s={13} lh={1.45} style={{ flex: 1 }}>{t}</Txt>
          </View>
        ))}
      </Card>
      <Txt s={11.5} c={c.muted2} lh={1.5} style={{ marginTop: 12, marginHorizontal: 4 }}>JPG, PNG or PDF up to 10 MB. Files are encrypted and only seen by the Mineral Bridge compliance team.</Txt>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  flagBox: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.redBg, borderWidth: 1, borderColor: c.redLine },
  frame: { marginTop: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: c.ink },
  inner: { position: 'absolute', left: '14%', right: '14%', top: '14%', bottom: '14%' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: c.gold },
  scan: { position: 'absolute', left: '6%', right: '6%', top: 0, height: 2, boxShadow: '0 0 12px #D9B456' },
  hint: { position: 'absolute', left: 0, right: 0, bottom: 14 },
  pdf: { alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: c.paper },
  pdfDoc: { width: 74, height: 94, borderRadius: 8, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, boxShadow: '0 8px 20px rgba(18,18,20,.10)', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  pdfBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5, backgroundColor: c.red },
  sampleWrap: { alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: '#2A2A2E' },
  sampleCard: { width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 26px rgba(0,0,0,.35)', padding: 14 },
  bar: { height: 6, borderRadius: 4, backgroundColor: c.muted },
  demoTag: { position: 'absolute', right: 10, bottom: 10, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: 'rgba(18,18,20,.75)' },
  fileCard: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileOk: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.greenBg, alignItems: 'center', justifyContent: 'center' },
  grid2: { flexDirection: 'row', gap: 8, marginTop: 10 },
  light46: { flex: 1, height: 46, borderRadius: 14, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  big: { flex: 1, height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  tip: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingVertical: 11, borderBottomWidth: 1 },
  tipDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
