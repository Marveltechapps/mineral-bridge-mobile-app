import React from 'react';
import { Image, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { imgFor } from '../../lib/images';
import { product } from '../../lib/mb4';
import { colors as c } from '../../theme';

const ISSUES: Record<string, string> = { withdrawn: 'This lot was withdrawn. Remove it to continue.', insufficient: 'Not enough stock for this quantity. Change the quantity.', unavailable: 'This lot is no longer available.', below_min: 'Below the minimum order quantity.' };

export function CartScreen() {
  const store = useStore(), s = store.state;
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      {s.cart.length ? (
        <>
          <View style={{ gap: 8 }}>
            {s.cart.map(it => {
              const x = product(it.pid), unit = x ? x.unit : it.unit || '', name = x ? x.name : it.name || it.pid;
              const qty = it.uIn && it.uIn !== unit ? it.qIn + ' ' + it.uIn + ' (' + (+it.qty.toFixed(4)) + ' ' + unit + ')' : it.qty + ' ' + unit;
              return (
                <Card key={it.pid} style={{ padding: 10, flexDirection: 'row', gap: 12 }}>
                  <Image source={imgFor(x ? x.img : 'cat-precious')} style={{ width: 70, height: 70, borderRadius: 13 }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt s={14.5} w={600}>{name}</Txt>
                    <Txt s={12.5} c={c.muted} style={{ marginTop: 3 }}>{qty} · {x && x.lab ? x.grade : 'Test report on request'}</Txt>
                    {it.issue ? <Txt s={12} c={c.red} style={{ marginTop: 3 }}>{ISSUES[it.issue] || 'This item needs your attention'}</Txt> : null}
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                      <Tap onPress={() => store.go('detail', { pid: it.pid, qty: String(it.qIn || it.qty), qu: { pid: it.pid, u: it.uIn || unit } })}><Txt s={12.5} w={600} c={c.goldInk}>Change quantity</Txt></Tap>
                      <Tap onPress={() => { void store.task(store.remote.cartRemove(it.pid)); store.flash('Removed from cart'); }}><Txt s={12.5} w={600} c={c.red}>Remove</Txt></Tap>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
          <View style={{ marginTop: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: c.ink }}>
            <Txt s={14} w={600} c={c.paper}>No payment now</Txt>
            <Txt s={12.5} c={c.soft} lh={1.5} style={{ marginTop: 4 }}>Mineral Bridge reviews your order and sends a quotation. You pay only after the price is agreed and the e-contract is signed.</Txt>
          </View>
        </>
      ) : (
        <Card style={{ paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', marginTop: 10 }}>
          <Txt serif s={26} center>Your cart is empty</Txt>
          <Txt s={13.5} c={c.muted} center style={{ marginTop: 6 }}>Browse verified lots and add the quantity you need.</Txt>
          <Tap onPress={() => store.jump('cats')} style={{ marginTop: 16, width: 180, height: 46, borderRadius: 14, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Txt s={14} w={600} c={c.paper}>Browse minerals</Txt>
          </Tap>
        </Card>
      )}
    </FadeUp>
  );
}
