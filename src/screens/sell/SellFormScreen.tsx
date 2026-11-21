import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { Draft } from '../../context/state';
import { Chips, Field, FieldErr } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { UploadPicker } from '../../components/UploadPicker';
import { catOf } from '../../lib/mb4';
import { colors as c } from '../../theme';

const DOCS = ['Test / assay report', 'Certificate of origin', 'Mining licence or permit'];

export function SellFormScreen() {
  const store = useStore(), s = store.state, d = s.draft, de = s.draftErr || {};
  const setD = (p: Partial<Draft>) => store.setState(x => ({ draft: { ...x.draft, ...p }, draftErr: {} }));
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <Label style={{ marginHorizontal: 4 }}>{(catOf(d.mineral || 'gold') || { name: '' }).name}</Label>
      <Label style={st.sec}>{'PHOTOS · ' + s.uploads.sellPhotos.length + ' of 3 minimum'}</Label>
      <UploadPicker bucket="sellPhotos" purpose="sell_photo" title="Add photos" count={s.uploads.sellPhotos.length + ' of 3 minimum'} max={10} />
      {de.photos ? <Txt s={12} c={c.red} style={{ marginTop: 6, marginHorizontal: 4 }}>{de.photos}</Txt> : null}
      <Label style={[st.sec, { marginBottom: 6 }]}>QUANTITY</Label>
      <Field accessibilityLabel="Quantity" keyboard="decimal-pad" value={d.qty} err={!!de.qty} onChangeText={t => setD({ qty: t.replace(/[^\d.]/g, '') })} />
      <View style={{ marginTop: 8 }}><Chips list={['g', 'kg', 't', 'ct']} value={d.unit} onPick={v => setD({ unit: v })} /></View>
      {de.qty ? <Txt s={12} c={c.red} style={{ marginTop: 6, marginHorizontal: 4 }}>{de.qty}</Txt> : null}
      <Label style={[st.sec, { marginBottom: 6 }]}>QUALITY / GRADE</Label>
      <Field accessibilityLabel="Quality or grade" value={d.grade} err={!!de.grade} placeholder="e.g. Au 88% or unknown" onChangeText={t => setD({ grade: t })} />
      {de.grade ? <Txt s={12} c={c.red} style={{ marginTop: 6, marginHorizontal: 4 }}>{de.grade}</Txt> : null}
      <Label style={st.sec}>FORM</Label>
      <Chips list={['Raw', 'Semi-finished', 'Finished']} value={d.form} onPick={v => setD({ form: v })} />
      <Label style={[st.sec, { marginBottom: 6 }]}>DETAILS</Label>
      <Field accessibilityLabel="Details" multiline value={d.details} err={!!de.details} placeholder="Where it is from, how it is stored, anything we should know" onChangeText={t => setD({ details: t })} />
      {de.details ? <FieldErr>{de.details}</FieldErr> : null}
      <Label style={st.sec}>CERTIFICATES & TEST REPORTS (IF AVAILABLE)</Label>
      <View style={{ gap: 8 }}>
        {DOCS.map(n => {
          const on = s.uploads.sellDocs.some(u => u.label === n);
          return (
            <Tap key={n} disabled={s.uploading} onPress={() => { if (on) store.remote.removeUpload('sellDocs', n); else void store.task(store.remote.pickFiles('sellDocs', 'sell_document', { label: n, limit: 1 })); }} style={[st.doc, { borderColor: on ? c.greenLine : c.dash, backgroundColor: on ? c.greenBg : c.white }]}>
              <Txt s={13.5} w={500} style={{ flex: 1 }}>{n}</Txt>
              {on ? <Txt s={12.5} w={600} c={c.green}>Added ✓ · tap to remove</Txt> : <Txt s={12.5} w={600} c={c.goldInk}>{s.uploading ? 'Uploading…' : 'Upload'}</Txt>}
            </Tap>
          );
        })}
      </View>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed' },
});
