import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Thumb } from '../../components/mb/art';
import type { Im } from '../../components/mb/art';
import { Empty, Pill, Press, SegTrack, Spinner } from '../../components/mb/kit';
import { D } from '../../theme';
import { aucOrderCard, orderIm } from './orderVals';

type Item = { id: string; im: Im; status: string; pillBg: string; pillFg: string; title: string; qtyLine: string; value: string; pct: string; next: string; you?: boolean; tap: () => void };

/** Orders tab (`scr_orders`): Buying / Selling (and auction orders) with progress. */
export function OrdersScreen() {
  const store = useStore(), s = store.state, u = s.user;
  if (!u) return <Empty icon="box" title="Sign in to see your orders" msg="Orders and sell requests appear here with full tracking." cta="Sign in" onCta={() => { store.setState(x => ({ auth: { ...x.auth, mode: 'signin' } })); store.go('auth'); }} />;
  const mine = store.myAucs();
  const count = (k: string) => (k === 'auction' ? mine.length : s.orders.filter(x => x.kind === k && !x.auction).length);
  const list: Item[] = s.otab === 'auction' ? mine.map(a => aucOrderCard(store, a))
    : s.orders.filter(x => x.kind === s.otab && !x.auction).map(x => { const v = store.view(x); return { ...v, im: orderIm(x), tap: () => store.go('order', { oid: x.id }) }; });
  const tabs: [string, string][] = [['buy', 'Buying · ' + count('buy')], ['sell', 'Selling · ' + count('sell')]];
  if (mine.length || s.otab === 'auction') tabs.push(['auction', 'Auctions · ' + count('auction')]);
  return (
    <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 20 }}>
      <SegTrack items={tabs} value={s.otab} onPick={v => store.setState({ otab: v as typeof s.otab })} />
      {!list.length ? (
        s.ordersLoading ? <View style={{ alignItems: 'center', paddingVertical: 48 }}><Spinner sz={26} /></View>
          : <Empty icon="box" title="Nothing here yet" msg="Orders and sell requests appear here with full tracking." cta={s.otab === 'buy' ? 'Browse minerals' : s.otab === 'auction' ? 'Browse auctions' : 'Sell a mineral'}
            onCta={() => (s.otab === 'auction' ? store.go('auctions', { atab: 'live' }) : store.jump(s.otab === 'buy' ? 'cats' : 'sellCats'))} />
      ) : (
        <View style={{ gap: 10, marginTop: 12 }}>
          {list.map(v => (
            <Press key={v.id} scale={0.985} onPress={v.tap} style={{ backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Thumb im={v.im} sz={56} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <T s={11} w={800} c={D.MUT} lines={1} style={{ flexShrink: 1 }}>{v.id}</T>
                    <Pill label={v.status} bg={v.pillBg} fg={v.pillFg} />
                  </View>
                  <T s={14.5} w={800} lines={1} style={{ marginTop: 3 }}>{v.title}</T>
                  <T s={12} w={600} c={D.MUT}>{v.qtyLine + ' · ' + v.value}</T>
                </View>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: D.BOR, marginTop: 10, overflow: 'hidden' }}>
                <View style={{ width: v.pct as `${number}%`, height: '100%', backgroundColor: D.GOLD }} />
              </View>
              <T s={12} w={700} c={v.you ? D.AMBER : D.MUT} style={{ marginTop: 7 }}>{v.next}</T>
            </Press>
          ))}
        </View>
      )}
    </View>
  );
}
