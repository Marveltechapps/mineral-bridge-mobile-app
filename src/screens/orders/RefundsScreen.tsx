import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Pill } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { refundTone } from './orderVals';

export function RefundsScreen() {
  const store = useStore(), s = store.state;
  const list = s.orders.filter(x => x.refund).sort((a, b) => b.refund!.at - a.refund!.at);
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ gap: 8 }}>
        {list.map(x => {
          const r = x.refund!, t = refundTone(r.status);
          return (
            <Tap key={x.id} onPress={() => store.go('order', { oid: x.id })}>
              <Card r={18} style={{ paddingVertical: 14, paddingHorizontal: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <Txt mono s={11} c={c.muted2} style={{ flexShrink: 1 }}>{r.ref} · {x.id}</Txt>
                  <Pill label={t[2]} bg={t[0]} fg={t[1]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                  <Txt s={14} w={600} style={{ flexShrink: 1 }}>{MB.titleOf(x)}</Txt>
                  <Txt mono s={15} w={600}>{MB.money(r.amount)}</Txt>
                </View>
                <Txt s={12} c={c.muted} style={{ marginTop: 3 }}>{r.reason} · {MB.fmt(r.at)}</Txt>
              </Card>
            </Tap>
          );
        })}
      </View>
      {!list.length ? (
        <Card style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' }}>
          <Txt s={15} w={600}>No refund requests</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>You can request a refund from any paid order that is not yet completed.</Txt>
        </Card>
      ) : null}
    </FadeUp>
  );
}
