import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { FilePurpose } from '../api';
import { useStore } from '../context/AppStore';
import type { UploadBucket } from '../context/state';
import { Tap } from './ui/Tap';
import { Txt } from './ui/Txt';
import { colors as c } from '../theme';

/**
 * Picks images from the library, uploads them (`POST /files`) and lists what is attached. The file ids are kept in
 * `store.state.uploads[bucket]` and sent with the order action that needs them.
 */
export function UploadPicker({ bucket, purpose, title, count, max = 10, multi = true, label }: { bucket: UploadBucket; purpose: FilePurpose; title: string; count?: string; max?: number; multi?: boolean; label?: string }) {
  const store = useStore(), s = store.state, list = s.uploads[bucket];
  const busy = s.uploading;
  return (
    <View>
      {list.length ? (
        <View style={st.grid}>
          {list.map((u, i) => (
            <View key={u.fileId} style={st.thumb}>
              {/^image\//.test(u.type) || !u.type ? <Image accessibilityLabel={u.name} source={{ uri: u.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Txt mono s={10} w={700} c={c.red}>FILE</Txt>}
              <Tap label={'Remove ' + u.name} onPress={() => store.remote.removeUpload(bucket, i)} style={st.x}><Txt s={11} w={700} c="#fff">×</Txt></Tap>
            </View>
          ))}
        </View>
      ) : null}
      <Tap disabled={busy || list.length >= max} onPress={() => { void store.task(store.remote.pickFiles(bucket, purpose, { limit: multi ? max : 1, max, label })); }}
        style={[st.add, { opacity: busy ? 0.6 : 1 }]}>
        <Txt s={13.5} w={600}>{busy ? 'Uploading…' : title}</Txt>
        <Txt s={13.5} w={600} mono c={c.goldInk}>{count ?? list.length + ' added'}</Txt>
      </Tap>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  thumb: { width: 74, height: 74, borderRadius: 12, overflow: 'hidden', backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  x: { position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(18,18,20,.75)', alignItems: 'center', justifyContent: 'center' },
  add: { padding: 16, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.dash, backgroundColor: c.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
