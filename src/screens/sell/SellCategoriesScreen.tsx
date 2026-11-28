import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { ImFill, remotePhoto } from '../../components/mb/art';
import { Empty, Note, Press } from '../../components/mb/kit';
import { CATS, mineralImageUrl, mineralName } from '../../lib/mb4';
import { D } from '../../theme';
import { CatalogueState } from '../buy/CatalogueState';
import { SearchBox } from '../buy/CategoriesScreen';

/** Sticky top of the Sell tab. */
export function SellTop() {
  const store = useStore(), s = store.state;
  return (
    <View style={{ backgroundColor: 'rgba(244,242,237,.95)', paddingTop: 6, paddingHorizontal: 16, paddingBottom: 10, zIndex: 15 }}>
      <T s={20} w={800} accessibilityRole="header">Sell minerals</T>
      <T s={12.5} w={600} c={D.MUT} style={{ marginTop: 2 }}>Choose the mineral you want to sell to Mineral Bridge.</T>
      <SearchBox value={s.sellSearch} onChange={t => store.setState({ sellSearch: t })} placeholder="Search minerals" label="Search minerals" />
    </View>
  );
}

/** Sell tab (`scr_sell`): saved draft and every mineral as a 3-column grid. */
export function SellCategoriesScreen() {
  const store = useStore(), s = store.state, d = s.draft, u = s.user, q = s.sellSearch.trim().toLowerCase();
  const groups = CATS.map(c => ({ c, items: c.minerals.filter(([, n]) => !q || n.toLowerCase().includes(q)) })).filter(g => g.items.length);
  const pick = (id: string) => { store.setState(x => ({ draft: { ...x.draft, mineral: id }, draftErr: {} })); store.go('sellForm'); };
  const photos = s.uploads.sellPhotos.length;
  const rows = (items: [string, string, string][]) => { const out: [string, string, string][][] = []; items.forEach((it, i) => { if (i % 3 === 0) out.push([]); out[out.length - 1].push(it); }); return out; };
  return (
    <View style={{ paddingTop: 4, paddingHorizontal: 16, paddingBottom: 24 }}>
      {u && u.role === 'buyer' ? <Note mt={8}>Your account is set up for buying. You can prepare a sell request now and add a seller type when you submit.</Note> : null}
      {s.hasDraft && d.mineral ? (
        <View style={st.draft}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={10.5} w={800} c={D.GOLD} ls={0.08}>DRAFT SAVED</T>
            <T s={14} w={800} c={D.white} style={{ marginTop: 3 }}>{mineralName(d.mineral) + ' · ' + photos + (photos === 1 ? ' photo' : ' photos') + (d.qty ? ' · ' + d.qty + ' ' + d.unit : '')}</T>
          </View>
          <Press onPress={() => store.go('sellForm')} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: D.GOLD }}><T s={12.5} w={800} c={D.G}>Resume</T></Press>
          <Press onPress={() => store.setState({ sheet: 'discardDraft' })}><T s={12.5} w={800} c={D.navyMute}>Discard</T></Press>
        </View>
      ) : null}
      {!CATS.length ? <CatalogueState what="minerals" /> : null}
      {groups.map(g => (
        <View key={g.c.id} style={{ marginTop: 18 }}>
          <T s={15} w={800} style={{ marginBottom: 10 }}>{g.c.name}</T>
          <View style={{ gap: 10 }}>
            {rows(g.items).map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                {[0, 1, 2].map(k => {
                  const it = r[k];
                  if (!it) return <View key={k} style={{ flex: 1 }} />;
                  const [id, n, img] = it;
                  return (
                    <Press key={id} onPress={() => pick(id)} style={st.tile}>
                      <View style={st.circle}>
                        <ImFill im={remotePhoto(img || mineralImageUrl(id))} />
                      </View>
                      <T s={11.5} w={800} center lh={1.2}>{n}</T>
                    </Press>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ))}
      {CATS.length && !groups.length ? <Empty icon="search" title={'No mineral matches “' + s.sellSearch + '”.'} msg="Try another name." /> : null}
    </View>
  );
}

const st = StyleSheet.create({
  draft: { marginTop: 10, backgroundColor: D.G, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  tile: { flex: 1, minWidth: 0, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, paddingTop: 12, paddingHorizontal: 6, paddingBottom: 10, alignItems: 'center', gap: 6, boxShadow: '0 8px 18px -16px rgba(14,26,51,.5)' },
  circle: { width: 58, height: 58, borderRadius: 29, backgroundColor: D.TINT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
