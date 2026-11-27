import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { prodIm, Thumb } from '../../components/mb/art';
import { Empty, Press } from '../../components/mb/kit';
import { num, product } from '../../lib/mb4';
import { D } from '../../theme';
import { openLot } from './productCard';

const ISSUES: Record<string, string> = { withdrawn: 'This lot was withdrawn. Remove it to continue.', insufficient: 'Not enough stock for this quantity. Change the quantity.', unavailable: 'This lot is no longer available.', below_min: 'Below the minimum order quantity.' };
const nf = (v: number) => num(+v.toFixed(4), 4);

/** Cart (`scr_cart`). "Proceed to checkout" is the screen CTA. */
export function CartScreen() {
  const store = useStore(), s = store.state;
  if (!s.cart.length) return <Empty icon="cart" title="Your cart is empty" msg="Browse verified lots and add the quantity you need." cta="Browse minerals" onCta={() => store.jump('cats')} />;
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, gap: 10 }}>
      {s.cart.map(it => {
        const x = product(it.pid), unit = x ? x.unit : it.unit || '', name = x ? x.name : it.name || it.pid;
        const qty = it.uIn && it.uIn !== unit ? it.qIn + ' ' + it.uIn + ' (' + nf(it.qty) + ' ' + unit + ')' : nf(it.qty) + ' ' + unit;
        return (
          <View key={it.pid} style={{ flexDirection: 'row', gap: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 10 }}>
            <Thumb im={prodIm(x)} sz={72} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={14} w={800}>{name}</T>
              <T s={12} w={600} c={D.MUT} style={{ marginTop: 2 }}>{qty + ' · ' + (x && x.lab ? x.grade : 'Test report on request')}</T>
              {it.issue ? <T s={12} w={700} c={D.DANGER} style={{ marginTop: 3 }}>{ISSUES[it.issue] || 'This item needs your attention'}</T> : null}
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <Press onPress={() => (x ? openLot(store, x) : store.go('detail', { pid: it.pid, qty: String(it.qIn || it.qty), qtyErr: '' }))}><T s={12.5} w={800} c={D.GD}>Change quantity</T></Press>
                <Press onPress={() => { void store.task(store.remote.cartRemove(it.pid)); store.flash('Removed from cart'); }}><T s={12.5} w={800} c={D.DANGER}>Remove</T></Press>
              </View>
            </View>
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: D.G, borderRadius: 18, padding: 14, marginTop: 4 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(217,180,86,.18)', alignItems: 'center', justifyContent: 'center' }}><Ic name="shield" s={18} c={D.GOLD} /></View>
        <View style={{ flex: 1 }}>
          <T s={14} w={800} c={D.white}>No payment now</T>
          <T s={12.5} w={600} c={D.navyMute} lh={1.45} style={{ marginTop: 3 }}>Mineral Bridge reviews your order and sends a quotation. You pay only after the price is agreed and the e-contract is signed.</T>
        </View>
      </View>
    </View>
  );
}
