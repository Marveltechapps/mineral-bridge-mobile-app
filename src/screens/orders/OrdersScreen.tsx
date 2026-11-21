import React from 'react';
import { Image, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Pill, Segmented } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';
import { aucOrderCard } from './orderVals';

export function OrdersScreen() {
  const store = useStore(), s = store.state;
  const mine = store.myAucs();
  const tabs = ([['buy', 'Buying'], ['sell', 'Selling'], ['auction', 'Auctions']] as const).map(([id, l]) => ({
    label: l + ' · ' + (id === 'auction' ? mine.length : s.orders.filter(x => x.kind === id && !x.auction).length), on: s.otab === id, onPress: () => store.setState({ otab: id }),
  }));
  const list = s.otab === 'auction' ? mine.map(a => aucOrderCard(store, a)) : s.orders.filter(x => x.kind === s.otab && !x.auction).map(x => ({ ...store.view(x), qtyLine: store.view(x).qtyLine, tap: () => store.go('order', { oid: x.id }) }));
  const empty = s.otab === 'auction' ? !mine.length : !s.orders.some(x => x.kind === s.otab && !x.auction);
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <Segmented items={tabs} />
      <View style={{ gap: 10, marginTop: 14 }}>
        {list.map(v => (
          <Tap key={v.id} scale={0.985} onPress={v.tap}>
            <Card style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Image source={v.img} style={{ width: 58, height: 58, borderRadius: 13 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <Txt mono s={11} c={c.muted2} lines={1} style={{ flexShrink: 1 }}>{v.id}</Txt>
                    <Pill label={v.status} bg={v.pillBg} fg={v.pillFg} />
                  </View>
                  <Txt s={14.5} w={600} lines={1} style={{ marginTop: 4 }}>{v.title}</Txt>
                  <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{v.qtyLine} · {v.value}</Txt>
                </View>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: c.hair, marginTop: 12, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 2, backgroundColor: c.ink, width: v.pct as `${number}%` }} />
              </View>
              <Txt s={12.5} c={c.ink2} lh={1.4} style={{ marginTop: 8 }}>{v.next}</Txt>
            </Card>
          </Tap>
        ))}
      </View>
      {empty ? (
        <Card style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' }}>
          <Txt s={15} w={600}>{s.ordersLoading ? 'Loading your orders…' : 'Nothing here yet'}</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>Orders and sell requests appear here with full tracking.</Txt>
          <Tap onPress={() => (s.otab === 'auction' ? store.go('auctions', { atab: 'live' }) : store.jump(s.otab === 'buy' ? 'cats' : 'sellCats'))}
            style={{ marginTop: 14, width: 170, height: 44, borderRadius: 14, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Txt s={13.5} w={600} c={c.paper}>{s.otab === 'buy' ? 'Browse minerals' : s.otab === 'auction' ? 'Browse auctions' : 'Sell a mineral'}</Txt>
          </Tap>
        </Card>
      ) : null}
    </FadeUp>
  );
}
