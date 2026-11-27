import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { Draft } from '../../context/state';
import { Ic, PopIn, T } from '../../components/mb/base';
import { Chips, FieldErr, FLabel, Input, Press, Section } from '../../components/mb/kit';
import { D } from '../../theme';

const DOCS = ['Test / assay report', 'Certificate of origin', 'Mining licence or permit'];

/** Sell request form (`scr_sellForm`): photos, quantity + unit, grade, form, details, certificates. */
export function SellFormScreen() {
  const store = useStore(), s = store.state, d = s.draft, de = s.draftErr || {};
  const setD = (p: Partial<Draft>) => store.setState(x => ({ draft: { ...x.draft, ...p }, draftErr: {} }));
  const photos = s.uploads.sellPhotos, n = photos.length, busy = s.uploading;
  const add = () => { if (!busy) void store.task(store.remote.pickFiles('sellPhotos', 'sell_photo', { limit: 10, max: 10 })); };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginHorizontal: 2, marginBottom: 10 }}>
        <T s={12.5} w={800} c={D.MUT}>Photos</T>
        <T s={12} w={800} c={n >= 3 ? D.green : D.GD}>{busy ? 'Uploading…' : n + ' of 3 minimum'}</T>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        {Array.from({ length: Math.max(3, n) }, (_, i) => i < n ? (
          <PopIn key={photos[i].fileId} dur={300}>
            <Press label="Remove photo" onPress={() => store.remote.removeUpload('sellPhotos', i)} style={[st.tile, { backgroundColor: D.TINT }]}>
              <Image source={{ uri: photos[i].uri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
              <View style={st.x}><Ic name="x" s={11} c={D.white} w={3} /></View>
            </Press>
          </PopIn>
        ) : (
          <Press key={'e' + i} label="Add photo" onPress={add} style={[st.tile, st.empty, { borderColor: de.photos ? D.DANGER : D.sand }]}><Ic name="camera" s={22} c={D.GD} /></Press>
        ))}
        <Press onPress={add} style={[st.tile, { backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' }]}><T s={12} w={800} c={D.GOLD}>+ Add more</T></Press>
      </ScrollView>
      <FieldErr msg={de.photos} />
      <FLabel t="Quantity" mt={16} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Input wrap={{ flex: 1 }} accessibilityLabel="Quantity" keyboard="decimal-pad" value={d.qty} err={!!de.qty} onChangeText={t => setD({ qty: t.replace(/[^\d.]/g, '') })} />
        <View accessibilityRole="radiogroup" style={st.units}>
          {['g', 'kg', 't', 'ct'].map(k => (
            <Press key={k} role="radio" selected={d.unit === k} onPress={() => setD({ unit: k })} style={[st.unit, { backgroundColor: d.unit === k ? D.G : 'transparent' }]}>
              <T s={13} w={800} c={d.unit === k ? D.white : D.MUT}>{k}</T>
            </Press>
          ))}
        </View>
      </View>
      <FieldErr msg={de.qty} />
      <FLabel t="Quality / grade" mt={16} />
      <Input accessibilityLabel="Quality or grade" value={d.grade} err={!!de.grade} placeholder="e.g. Au 88% or unknown" onChangeText={t => setD({ grade: t })} />
      <FieldErr msg={de.grade} />
      <Section t="Form" />
      <Chips list={['Raw', 'Semi-finished', 'Finished']} value={d.form} onPick={v => setD({ form: v })} />
      <FLabel t="Details" mt={16} />
      <Input accessibilityLabel="Details" multiline value={d.details} err={!!de.details} placeholder="Where it is from, how it is stored, anything we should know" style={{ minHeight: 90 }} onChangeText={t => setD({ details: t })} />
      <FieldErr msg={de.details} />
      <Section t="Certificates & test reports (if available)" />
      <View style={{ gap: 8 }}>
        {DOCS.map(name => {
          const on = s.uploads.sellDocs.some(x => x.label === name);
          return (
            <Press key={name} disabled={busy} onPress={() => { if (on) store.remote.removeUpload('sellDocs', name); else void store.task(store.remote.pickFiles('sellDocs', 'sell_document', { label: name, limit: 1 })); }}
              style={[st.doc, { backgroundColor: on ? D.greenBg : D.white, borderColor: on ? D.greenLine : D.dash, borderStyle: on ? 'solid' : 'dashed' }]}>
              <Ic name="file" s={17} c={on ? D.green : D.GD} />
              <T s={13.5} w={700} style={{ flex: 1 }}>{name}</T>
              <T s={12.5} w={800} c={on ? D.green : D.GD}>{on ? 'Added ✓' : busy ? 'Uploading…' : 'Upload'}</T>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  tile: { width: 86, height: 86, borderRadius: 16, overflow: 'hidden' },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', backgroundColor: D.paper2, alignItems: 'center', justifyContent: 'center' },
  x: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(14,26,51,.75)', alignItems: 'center', justifyContent: 'center' },
  units: { flexDirection: 'row', gap: 3, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 14, padding: 3 },
  unit: { width: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5 },
});
