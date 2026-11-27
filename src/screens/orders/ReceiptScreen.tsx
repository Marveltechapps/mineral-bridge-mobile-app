import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { T } from '../../components/mb/base';
import { Alert, Chips, FLabel, Input, KV, Section, Summary } from '../../components/mb/kit';
import { UploadPicker } from '../../components/UploadPicker';
import { unitOfItem } from '../../lib/mb4';
import { D } from '../../theme';
import { currentOrder, orderIm } from './orderVals';

/** Confirm receipt (`scr_receipt`). Accept delivery / Raise a discrepancy are the screen CTAs. */
export function ReceiptScreen() {
  const store = useStore(), s = store.state, rc = s.rc;
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o);
  const setRc = (p: Partial<AppState['rc']>) => store.setState(x => ({ rc: { ...x.rc, ...p }, rcErr: '' }));
  const expected = o.kind === 'buy' ? o.items.map(it => it.qty + ' ' + unitOfItem(it)).join(' + ') : '';
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Summary im={orderIm(o)} id={o.id} title={v.title} sub={v.qtyLine} />
      <KV style={{ marginTop: 12 }} rows={[['Expected quantity', expected]]} />
      <FLabel t="Quantity received" mt={14} />
      <Input accessibilityLabel="Quantity received" value={rc.qty} placeholder="e.g. 2 kg" onChangeText={t => setRc({ qty: t })} />
      <Section t="Condition" />
      <Chips list={['Good', 'Minor damage', 'Damaged']} value={rc.cond} onPick={c => setRc({ cond: c })} />
      <Section t="Photos" />
      <UploadPicker bucket="receipt" purpose="delivery_photo" title="Add delivery photo" max={6} />
      <View style={{ marginTop: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: D.amberBg }}>
        <T s={12.5} w={600} c={D.amberInk} lh={1.45}><T s={12.5} w={700} c={D.amberInk}>Something wrong? </T>Raise a discrepancy if the quantity or condition does not match. Mineral Bridge will either send the missing quantity or refund the difference.</T>
      </View>
      <FLabel t="Note (needed to raise a discrepancy)" mt={14} />
      <Input accessibilityLabel="Delivery note" multiline value={rc.note} onChangeText={t => setRc({ note: t })} />
      <Alert msg={s.rcErr} />
    </View>
  );
}
