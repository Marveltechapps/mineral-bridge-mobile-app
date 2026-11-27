import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { FilePurpose } from '../api';
import { useStore } from '../context/AppStore';
import type { UploadBucket } from '../context/state';
import { D } from '../theme';
import { Ic, T } from './mb/base';
import { Press } from './mb/kit';

/**
 * Picks images from the library, uploads them (`POST /files`) and lists what is attached. The file ids are kept in
 * `store.state.uploads[bucket]` and sent with the order action that needs them.
 */
export function UploadPicker({ bucket, purpose, title, count, max = 10, multi = true, label, icon = 'camera', errBorder }: { bucket: UploadBucket; purpose: FilePurpose; title: string; count?: string; max?: number; multi?: boolean; label?: string; icon?: string; errBorder?: boolean }) {
  const store = useStore(), s = store.state, list = s.uploads[bucket];
  const busy = s.uploading;
  return (
    <View>
      {list.length ? (
        <View style={st.grid}>
          {list.map((u, i) => (
            <View key={u.fileId} style={st.thumb}>
              {/^image\//.test(u.type) || !u.type ? <Image accessibilityLabel={u.name} source={{ uri: u.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <T s={10.5} w={800} c={D.DANGER}>FILE</T>}
              <Press label={'Remove ' + u.name} onPress={() => store.remote.removeUpload(bucket, i)} style={st.x}><Ic name="x" s={11} c={D.white} w={3} /></Press>
            </View>
          ))}
        </View>
      ) : null}
      <Press scale={0.985} disabled={busy || list.length >= max} onPress={() => { void store.task(store.remote.pickFiles(bucket, purpose, { limit: multi ? max : 1, max, label })); }}
        style={[st.add, { opacity: busy ? 0.6 : 1, borderColor: errBorder ? D.DANGER : D.dash }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Ic name={icon} s={18} c={D.GD} />
          <T s={13.5} w={800} style={{ flexShrink: 1 }}>{busy ? 'Uploading…' : title}</T>
        </View>
        <T s={12.5} w={800} c={D.GD}>{count ?? list.length + ' added'}</T>
      </Press>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  thumb: { width: 74, height: 74, borderRadius: 16, overflow: 'hidden', backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center' },
  x: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(14,26,51,.75)', alignItems: 'center', justifyContent: 'center' },
  add: { width: '100%', padding: 15, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', backgroundColor: D.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
});
