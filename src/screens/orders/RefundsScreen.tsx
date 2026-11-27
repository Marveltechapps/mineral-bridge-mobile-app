import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Empty, Pill, Press } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { refundTone } from './orderVals';

/** Refunds (`scr_refunds`). */
export function RefundsScreen() {
  const store = useStore(), s = store.state;
  const list = s.orders.filter(x => x.refund).sort((a, b) => b.refund!.at - a.refund!.at);
  if (!list.length) return <Empty icon="refund" title="No refund requests" msg="You can request a refund from any paid order that is not yet completed." cta="Go to orders" onCta={() => store.jump('orders')} />;
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18, gap: 10 }}>
      {list.map(x => {
        const r = x.refund!, t = refundTone(r.status);
        return (
          <Press key={x.id} scale={0.985} onPress={() => store.go('order', { oid: x.id })} style={{ backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <T s={11} w={800} c={D.MUT} style={{ flexShrink: 1 }}>{r.ref + ' · ' + x.id}</T>
              <Pill label={t[2]} bg={t[0]} fg={t[1]} pad={[3, 9]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
              <T s={14.5} w={800} style={{ flexShrink: 1 }}>{MB.titleOf(x)}</T>
              <T s={14.5} w={800} c={D.GD}>{MB.money(r.amount)}</T>
            </View>
            <T s={12} w={600} c={D.MUT} style={{ marginTop: 2 }}>{r.reason + ' · ' + MB.fmt(r.at)}</T>
          </Press>
        );
      })}
    </View>
  );
}
