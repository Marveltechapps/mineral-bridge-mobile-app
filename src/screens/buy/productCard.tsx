import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { MBStore } from '../../context/store';
import { Ic, StepIn, T } from '../../components/mb/base';
import { imBg, ImFill, prodIm, tintOf } from '../../components/mb/art';
import { Press } from '../../components/mb/kit';
import { num } from '../../lib/mb4';
import { productIsSoldOut } from '../../lib/mappers';
import { lotCard } from './lotCard';
import { D, SHADOW } from '../../theme';
import type { Product } from '../../types/mineralBridge';

const nf = (v: number) => num(+v.toFixed(4), 4);
const unitWord = (p: Product, n: number) => (p.unit === 'bar' && n !== 1 ? 'bars' : p.unit);
export const byAvailable = (a: Product, b: Product) => Number(!productIsSoldOut(b)) - Number(!productIsSoldOut(a));

/** Open the product page, keeping the quantity/unit already in the cart (`openLot`). */
export function openLot(store: MBStore, p: Product) {
  const c = store.state.cart.find(x => x.pid === p.id);
  store.go('detail', { pid: p.id, qty: String(c ? (c.qIn || c.qty) : p.min), qtyErr: '', qu: c && c.uIn && c.uIn !== p.unit ? { pid: p.id, u: c.uIn } : null });
}

/** Add the minimum quantity to the cart from a card (`addLot(pid, p.min)`). */
function addMin(store: MBStore, p: Product) {
  if (productIsSoldOut(p)) return store.flash('This lot is no longer available');
  void store.task(store.remote.cartPut(p.id, p.min, p.unit, p.min).then(ok => { if (ok) store.flash('Added to cart'); }));
}

/** − / + on a card: steps by the lot minimum; below the minimum removes the line (`step(pid, dir)`). */
function step(store: MBStore, p: Product, dir: 1 | -1) {
  const c = store.state.cart.find(x => x.pid === p.id); if (!c) return;
  const q = +(c.qty + dir * p.min).toFixed(4);
  if (q < p.min) { void store.task(store.remote.cartRemove(p.id)); return; }
  if (p.avail > 0 && q > p.avail) { store.flash('Only ' + nf(p.avail) + ' ' + p.unit + ' available'); return; }
  void store.task(store.remote.cartPut(p.id, q, p.unit, q));
}

/** Catalogue card of the final design (`productCard(p)`): image, LAB-TESTED tag, heart, grade chip, quantity and add / stepper. */
export function ProductCard({ store, p }: { store: MBStore; p: Product }) {
  const s = store.state, c = s.cart.find(x => x.pid === p.id), oos = lotCard(store, p).off, wished = s.wish.includes(p.id), im = prodIm(p);
  const avail = oos ? 'Unavailable' : p.avail > 0 ? p.avail.toLocaleString('en-US') + ' ' + unitWord(p, p.avail) : 'On request';
  const toggleWish = () => store.setState(x => ({ wish: x.wish.includes(p.id) ? x.wish.filter(i => i !== p.id) : [...x.wish, p.id] }));
  return (
    <View style={[st.card, { opacity: oos ? 0.72 : 1 }]}>
      <View>
        <Press scale={1} label={p.name} onPress={() => openLot(store, p)} style={{ aspectRatio: 1, backgroundColor: imBg(im, tintOf(p.mineral)), overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <ImFill im={im} />
        </Press>
        {p.lab && !oos ? <View style={st.lab}><Ic name="flask" s={10} c={D.GOLD} w={2.4} /><T s={9.5} w={800} c={D.GOLD}>LAB-TESTED</T></View> : null}
        {oos ? <View style={[st.lab, { backgroundColor: D.ink2, boxShadow: undefined }]}><T s={9.5} w={800} c={D.white}>UNAVAILABLE</T></View> : null}
        <Press label="Save" role="button" selected={wished} onPress={toggleWish} style={st.heart}>
          <Ic name="heart" s={16} c={wished ? D.DANGER : D.heart} w={2.2} fill={wished ? D.DANGER : 'none'} />
        </Press>
      </View>
      <Press scale={1} onPress={() => openLot(store, p)} style={{ paddingTop: 10, paddingHorizontal: 10 }}>
        <T s={13} w={800} lh={1.25} lines={2} style={{ minHeight: 33 }}>{p.name}</T>
      </Press>
      <View style={{ paddingTop: 5, paddingHorizontal: 10, flexDirection: 'row' }}>
        <View style={st.grade}><T s={10.5} w={800} c={D.GD} lines={1}>{p.lab ? p.grade : 'Test report on request'}</T></View>
      </View>
      <View style={st.foot}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T s={13.5} w={800} c={oos ? D.MUT : D.GD} lines={1}>{avail}</T>
          <T s={10.5} w={700} c={D.MUT} lines={1} style={{ marginTop: 1 }}>{oos ? p.form : 'min ' + p.min + ' ' + p.unit + (p.form ? ' · ' + p.form : '')}</T>
        </View>
        {c ? (
          <StepIn style={st.stepper}>
            <Press label="Less" onPress={() => step(store, p, -1)} style={st.stepBtn}><T s={17} w={800} c={D.white}>−</T></Press>
            <T s={11.5} w={800} c={D.white} center style={{ minWidth: 14 }}>{nf(c.qty)}</T>
            <Press label="More" onPress={() => step(store, p, 1)} style={st.stepBtn}><T s={17} w={800} c={D.white}>+</T></Press>
          </StepIn>
        ) : (
          <Press label="Add to cart" disabled={oos} onPress={() => addMin(store, p)} style={[st.add, oos ? { backgroundColor: D.hair, boxShadow: undefined } : null]}>
            {oos ? <T s={8.5} w={800} c={D.faint} center lh={1.05}>{'SOLD\nOUT'}</T> : <Ic name="plus" s={18} c={D.white} w={2.6} />}
          </Press>
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card: { flex: 1, backgroundColor: D.white, borderRadius: 20, borderWidth: 1, borderColor: D.BOR, overflow: 'hidden', boxShadow: SHADOW.card },
  lab: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: D.G, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, boxShadow: '0 4px 10px -4px rgba(20,40,75,.6)' },
  heart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.92)', boxShadow: '0 3px 8px -3px rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center' },
  grade: { maxWidth: '100%', backgroundColor: D.TINT, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 7 },
  foot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, marginTop: 'auto', paddingTop: 8, paddingHorizontal: 10, paddingBottom: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 1, backgroundColor: D.G, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 3 },
  stepBtn: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
  add: { width: 38, height: 38, borderRadius: 19, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -8px rgba(20,40,75,.6)' },
});
