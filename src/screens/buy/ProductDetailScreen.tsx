import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { UF, UNAME } from '../../context/store';
import { Ic, T } from '../../components/mb/base';
import { imBg, ImFill, prodIm } from '../../components/mb/art';
import { Alert, Card, DocLine, FLabel, Input, KV, Note, Press, Section } from '../../components/mb/kit';
import { mineralName, num, product } from '../../lib/mb4';
import { productHasLotDocuments, productIsSoldOut } from '../../lib/mappers';
import { D } from '../../theme';
import { CatalogueState } from './CatalogueState';
import { lotLine } from './lotCard';

const nf = (v: number) => num(+v.toFixed(4), 4);

/** Product details (`scr_detail`). Add to cart / See other lots is the screen CTA (store.primary). */
export function ProductDetailScreen() {
  const store = useStore(), s = store.state;
  const p = product(s.pid);
  if (!p) return <View style={{ paddingHorizontal: 18 }}><CatalogueState what="this lot" /></View>;
  const im = prodIm(p), u = store.unitOf(p), off = productIsSoldOut(p), c = s.cart.find(x => x.pid === p.id);
  const qn = parseFloat(s.qty), eq = UF[p.unit] && u !== p.unit && qn > 0 ? '= ' + nf(store.conv(qn, u, p.unit)) + ' ' + p.unit : '';
  const hasDocs = productHasLotDocuments(p);
  const docs = hasDocs ? ([['Test report', (p.lab || 'Laboratory') + (p.cert ? ' · ' + p.cert + '-TR.pdf' : '')], ['Certificate of analysis', (p.cert || p.id) + '.pdf'], ['Origin declaration', 'Mine of origin · ' + String(p.origin || '').split(' · ')[0]]] as const).map(([n, f], i) => {
    const t = ['lotReport', 'lotCoa', 'lotOrigin'][i], type = (['lot_test_report', 'certificate_of_analysis', 'origin_declaration'] as const)[i];
    return { n, f, tap: () => store.openProductDoc(p, type, t) };
  }) : [];
  const full = im.kind === 'photo' && !im.bars;
  return (
    <View style={{ paddingTop: 12, paddingHorizontal: 18 }}>
      <View style={{ height: 230, borderRadius: 24, overflow: 'hidden', backgroundColor: imBg(im), alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 30px -20px rgba(14,26,51,.5)' }}>
        <ImFill im={im} inset={full ? 1 : 0.72} />
        {p.lab ? (
          <View style={{ position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: D.G, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 9 }}>
            <Ic name="flask" s={12} c={D.GOLD} w={2.4} /><T s={10.5} w={800} c={D.GOLD}>LAB-TESTED</T>
          </View>
        ) : null}
      </View>
      <T s={11.5} w={800} c={D.GD} style={{ marginTop: 16 }}>{[mineralName(p.mineral), p.form, p.id].filter(Boolean).join(' · ')}</T>
      <T s={24} w={800} ls={-0.02} style={{ marginTop: 3 }}>{p.name}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
        <Ic name="pin" s={14} c={D.MUT} /><T s={13} w={600} c={D.MUT} style={{ flexShrink: 1 }}>{p.origin}</T>
      </View>
      {off ? <Alert msg={'This lot is sold out. Choose another lot of ' + mineralName(p.mineral) + '.'} /> : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        {([['Available', lotLine(p)], ['Purity', p.lab ? p.grade : 'On request']] as const).map(([k, v]) => (
          <View key={k} style={{ flex: 1, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 16, padding: 12 }}>
            <T s={11.5} w={700} c={D.MUT}>{k}</T>
            <T s={15} w={800} style={{ marginTop: 3 }}>{v}</T>
          </View>
        ))}
      </View>
      {hasDocs ? (
        <>
          <Section t="Testing & certification" />
          <KV rows={[['Testing company', p.lab || '—'], ['Certificate no.', p.cert || '—']]} />
          <Section t="Test reports & certificates" />
          <Card>{docs.map((d, i) => <DocLine key={d.n} n={d.n} f={d.f} onPress={d.tap} last={i === docs.length - 1} />)}</Card>
        </>
      ) : <Note>No third-party test report for this lot yet. Ask Mineral Bridge for quality details before you order.</Note>}
      {!off ? (
        <>
          <FLabel t="Quantity to order" mt={18} />
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Input wrap={{ flex: 1 }} accessibilityLabel="Quantity" keyboard="decimal-pad" value={s.qty} onChangeText={t => store.setState({ qty: t.replace(/[^\d.]/g, ''), qtyErr: '' })} />
            {!UF[p.unit] ? <T s={14} w={800} c={D.MUT}>{p.unit}</T> : null}
          </View>
          {UF[p.unit] ? (
            <View accessibilityRole="radiogroup" accessibilityLabel="Unit" style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {['g', 'kg', 't'].map(k => {
                const on = u === k;
                return (
                  <Press key={k} role="radio" selected={on} onPress={() => { if (on) return; const v = parseFloat(s.qty) || 0; store.setState({ qu: { pid: p.id, u: k }, qty: String(+store.conv(v, u, k).toFixed(4) || ''), qtyErr: '' }); }}
                    style={{ flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center', backgroundColor: on ? D.G : D.white, borderWidth: 1, borderColor: on ? D.G : D.BOR }}>
                    <T s={12.5} w={800} c={on ? D.white : D.INK}>{UNAME[k] + ' · ' + k}</T>
                  </Press>
                );
              })}
            </View>
          ) : null}
          {eq ? <T s={12} w={700} c={D.GD} style={{ marginTop: 6 }}>{eq}</T> : null}
          <T s={12} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 8 }}>{'Minimum order ' + nf(store.conv(p.min, p.unit, u)) + ' ' + u + (p.avail > 0 ? ' · up to ' + nf(store.conv(p.avail, p.unit, u)) + ' ' + u : '') + ' · price is confirmed by quotation'}</T>
          {c ? <T s={12} w={700} c={D.GD} style={{ marginTop: 6 }}>{'Already in your cart: ' + nf(c.qty) + ' ' + p.unit + '. Adding updates the quantity.'}</T> : null}
          <Alert msg={s.qtyErr} />
        </>
      ) : null}
    </View>
  );
}
