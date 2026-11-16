import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useStore } from '../../context/AppStore';
import { UF, UNAME } from '../../context/store';
import { Card, DocList, ErrBox, Field, KV, ListCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { mineralName, num, PRODUCTS } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { lotLine } from './lotCard';

/** CSS background positioning: size = 'cover' or a % of the box width, position as fractions. */
function Bg({ source, w, h, size = 'cover', px = 0.5, py = 0.5, flip }: { source: ImageSourcePropType; w: number; h: number; size?: 'cover' | number; px?: number; py?: number; flip?: boolean }) {
  const meta = Image.resolveAssetSource(source);
  const ar = meta && meta.width && meta.height ? meta.width / meta.height : 1.2;
  let iw: number, ih: number;
  if (size !== 'cover') { iw = w * size; ih = iw / ar; } else if (w / h > ar) { iw = w; ih = w / ar; } else { ih = h; iw = h * ar; }
  return (
    <View style={{ width: w, height: h, borderRadius: 24, overflow: 'hidden', transform: flip ? [{ scaleX: -1 }] : undefined }}>
      <Image source={source} style={{ position: 'absolute', width: iw, height: ih, left: (w - iw) * px, top: (h - ih) * py }} />
    </View>
  );
}

export function ProductDetailScreen() {
  const store = useStore(), s = store.state;
  const p = PRODUCTS.find(x => x.id === s.pid) || PRODUCTS[0];
  const img = imgFor(p.img), pu = p.unit, u = store.unitOf(p), can = !!UF[pu];
  const nf = (v: number) => num(+v.toFixed(6)), q = parseFloat(s.qty);
  const inCart = s.cart.find(x => x.pid === p.id);
  const docs = p.lab ? ([['Test report', p.lab + ' · ' + p.cert + '-TR.pdf'], ['Certificate of analysis', p.cert + '.pdf'], ['Origin declaration', 'Mine of origin · ' + p.origin.split(' · ')[0]]] as const).map(([n, f], i) => {
    const t = ['lotReport', 'lotCoa', 'lotOrigin'][i];
    return { n, f, tap: () => store.openDoc({ t, pid: p.id }), dl: () => store.downloadDoc({ t, pid: p.id }) };
  }) : [];
  const minShown = can ? nf(store.conv(p.min, pu, u)) + ' ' + u : p.min + ' ' + pu;
  const maxShown = can ? nf(store.conv(p.avail, pu, u)) + ' ' + u : p.avail + ' ' + pu;
  const equiv = can && q > 0 ? '= ' + ['g', 'kg', 't'].filter(k => k !== u).map(k => nf(store.conv(q, u, k)) + ' ' + k).join(' = ') : '';

  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={308} decelerationRate="fast" style={{ marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        <Bg source={img} w={300} h={220} />
        <Bg source={img} w={300} h={220} px={0.3} py={0.7} flip />
        <Bg source={img} w={300} h={220} size={1.8} />
      </ScrollView>
      <View style={{ paddingTop: 16, paddingHorizontal: 4 }}>
        <Label>{mineralName(p.mineral)} · {p.form} · {p.id}</Label>
        <Txt serif s={30} lh={1.05} style={{ marginTop: 6 }}>{p.name}</Txt>
        <Txt s={13} c={c.muted} style={{ marginTop: 6 }}>{p.origin}</Txt>
      </View>
      {p.avail <= 0 ? <View accessibilityRole="alert" style={st.off}><Txt s={13.5} w={600} c={c.red}>This lot is sold out. Choose another lot of {mineralName(p.mineral)}.</Txt></View> : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <Card r={18} style={st.tile}><Label>AVAILABLE</Label><Txt s={16} w={600} style={{ marginTop: 6 }}>{lotLine(p)}</Txt></Card>
        <Card r={18} style={st.tile}><Label>PURITY</Label>{p.lab ? <Txt s={16} w={600} style={{ marginTop: 6 }}>{p.grade}</Txt> : <Txt s={13.5} w={600} c={c.muted} style={{ marginTop: 6 }}>On request</Txt>}</Card>
      </View>
      {p.lab ? (
        <>
          <Label style={st.sec}>TESTING & CERTIFICATION</Label>
          <ListCard>
            <KV k="Testing company" v={p.lab} gap={12} />
            <KV k="Certificate no." v={p.cert} mono gap={12} line={false} />
          </ListCard>
          <Label style={st.sec}>TEST REPORTS & CERTIFICATES</Label>
          <DocList docs={docs} />
        </>
      ) : (
        <View style={st.noLab}><Txt s={13} c={c.ink2} lh={1.5}>No third-party test report for this lot yet. Ask Mineral Bridge for quality details before you order.</Txt></View>
      )}
      {p.avail > 0 ? (
        <>
          <Label style={st.sec}>QUANTITY TO ORDER</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}><Field accessibilityLabel="Quantity" keyboard="decimal-pad" value={s.qty} onChangeText={t => store.setState({ qty: t.replace(/[^\d.]/g, ''), qtyErr: '' })} /></View>
            {!can ? <View style={st.unit}><Txt mono s={14} c={c.paper}>{p.unit}</Txt></View> : null}
          </View>
          {can ? (
            <>
              <View accessibilityRole="radiogroup" accessibilityLabel="Unit" style={st.units}>
                {['g', 'kg', 't'].map(k => {
                  const on = u === k;
                  return (
                    <Tap key={k} role="radio" selected={on} style={[st.unitBtn, { backgroundColor: on ? c.ink : 'transparent' }]}
                      onPress={() => { if (k === u) return; const v = parseFloat(s.qty); store.setState({ qu: { pid: p.id, u: k }, qty: v > 0 ? String(store.conv(v, u, k)) : s.qty, qtyErr: '' }); }}>
                      <Txt s={13} w={600} c={on ? c.paper : c.muted}>{UNAME[k]}</Txt>
                      <Txt mono s={9.5} c={on ? c.paper : c.muted} style={{ opacity: 0.7 }}>{k}</Txt>
                    </Tap>
                  );
                })}
              </View>
              {equiv ? <Txt mono s={12} c={c.ink2} style={{ marginTop: 8, marginHorizontal: 4 }}>{equiv}</Txt> : null}
            </>
          ) : null}
          <Txt s={12} c={c.muted} style={{ marginTop: 7, marginHorizontal: 4 }}>Minimum order {minShown} · up to {maxShown} · price is confirmed by quotation</Txt>
          {inCart ? <Txt s={12} w={600} c={c.goldInk} style={{ marginTop: 5, marginHorizontal: 4 }}>{'In your cart: ' + (inCart.uIn ? inCart.qIn + ' ' + inCart.uIn : inCart.qty + ' ' + p.unit)}</Txt> : null}
          {s.qtyErr ? <ErrBox>{s.qtyErr}</ErrBox> : null}
        </>
      ) : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  off: { marginTop: 14, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.redBg },
  tile: { flex: 1, minWidth: 0, padding: 14 },
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  noLab: { marginTop: 14, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.chip },
  unit: { width: 58, height: 52, borderRadius: 14, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
  units: { flexDirection: 'row', gap: 3, padding: 4, borderRadius: 14, backgroundColor: c.track, marginTop: 8 },
  unitBtn: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
