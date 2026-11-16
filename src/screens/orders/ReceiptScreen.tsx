import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { Chips, ErrBox, Field, ListCard, SummaryCard } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { product } from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder } from './orderVals';

export function ReceiptScreen() {
  const store = useStore(), s = store.state, rc = s.rc;
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o);
  const setRc = (p: Partial<AppState['rc']>) => store.setState(x => ({ rc: { ...x.rc, ...p }, rcErr: '' }));
  const expected = o.kind === 'buy' ? o.items.map(it => it.qty + ' ' + (product(it.pid) || { unit: '' }).unit).join(' + ') : '';
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <SummaryCard id={ov.id} title={ov.title} sub={ov.qtyLine} />
      <ListCard style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
          <Txt s={13.5} c={c.muted}>Expected quantity</Txt>
          <Txt s={13.5} mono w={600}>{expected}</Txt>
        </View>
      </ListCard>
      <Label style={{ marginTop: 18, marginHorizontal: 4, marginBottom: 6 }}>QUANTITY RECEIVED</Label>
      <Field accessibilityLabel="Quantity received" value={rc.qty} placeholder="e.g. 2 kg" onChangeText={t => setRc({ qty: t })} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>CONDITION</Label>
      <Chips list={['Good', 'Minor damage', 'Damaged']} value={rc.cond} onPick={v => store.setState(x => ({ rc: { ...x.rc, cond: v } }))} />
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>PHOTOS</Label>
      <Tap onPress={() => setRc({ photos: rc.photos + 1 })} style={{ padding: 16, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.dash, backgroundColor: c.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt s={13.5} w={600}>Add delivery photo</Txt>
        <Txt s={13.5} w={600} mono c={c.goldInk}>{rc.photos} added</Txt>
      </Tap>
      <View style={{ marginTop: 18, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.chip }}>
        <Txt s={12.5} c={c.ink2} lh={1.5}><Txt s={12.5} w={700} c={c.ink2}>Something wrong?</Txt> Raise a discrepancy if the quantity or condition does not match. Mineral Bridge will either send the missing quantity or refund the difference. For other money-back requests, use Request a refund on the order.</Txt>
      </View>
      <Label style={{ marginTop: 14, marginHorizontal: 4, marginBottom: 6 }}>NOTE (NEEDED TO RAISE A DISCREPANCY)</Label>
      <Field accessibilityLabel="Delivery note" multiline value={rc.note} onChangeText={t => setRc({ note: t })} />
      {s.rcErr ? <ErrBox>{s.rcErr}</ErrBox> : null}
    </FadeUp>
  );
}
