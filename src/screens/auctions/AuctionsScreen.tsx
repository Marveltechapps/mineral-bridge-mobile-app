import React from 'react';
import { Image, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Floaty, T } from '../../components/mb/base';
import { IMG, Thumb } from '../../components/mb/art';
import { ChipRow, Empty, Press, Spinner } from '../../components/mb/kit';
import { D } from '../../theme';
import type { Auction } from '../../types/mineralBridge';
import { aucCard, mineOf } from './auctionVals';

/** Auctions (`scr_auctions`): hero, Live / Upcoming / Ended / My bids tabs, auction rows. */
export function AuctionsScreen() {
  const store = useStore(), s = store.state, A = s.auctions || [];
  const TABS: [string, string, (a: Auction) => boolean][] = [['live', 'Live', a => a.status === 'live'], ['upcoming', 'Upcoming', a => a.status === 'upcoming'], ['ended', 'Ended', a => a.status === 'ended'], ['mine', 'My bids', a => mineOf(a) || !!s.reminders[a.id]]];
  const tab = TABS.find(t => t[0] === s.atab) || TABS[0], list = A.filter(tab[2]);
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: D.G, padding: 18 }}>
        <Image source={IMG.bars} resizeMode="contain" style={{ position: 'absolute', right: -20, bottom: -10, width: 150, height: 125, opacity: 0.35 }} />
        <T s={10.5} w={800} c={D.GOLD} ls={0.08}>VERIFIED LOTS · LIVE BIDDING</T>
        <T s={21} w={800} c={D.white} style={{ marginTop: 6 }}>Bid on inspected lots</T>
        <T s={12.5} w={600} c={D.navyMute} lh={1.45} style={{ marginTop: 4, maxWidth: 260 }}>Each bid must beat the current bid by at least the minimum step. The highest bid when the timer ends wins, then you pay to release the lot.</T>
      </View>
      <ChipRow inset={18} style={{ marginTop: 14, marginBottom: 12 }}>
        {TABS.map(([id, l, f]) => {
          const n = A.filter(f).length, on = s.atab === id;
          return (
            <Press key={id} role="tab" selected={on} onPress={() => store.setState({ atab: id })}
              style={{ flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: on ? D.G : D.white, borderWidth: 1, borderColor: on ? D.G : D.BOR }}>
              <T s={12.5} w={800} c={on ? D.white : D.MUT}>{l}</T>
              {n ? <View style={{ minWidth: 18, height: 18, borderRadius: 9, backgroundColor: on ? D.GOLD : D.TINT, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><T s={10.5} w={800} c={on ? D.G : D.GD}>{String(n)}</T></View> : null}
            </Press>
          );
        })}
      </ChipRow>
      {!list.length ? (
        s.auctionsLoading ? <View style={{ alignItems: 'center', paddingVertical: 48 }}><Spinner sz={26} /></View>
          : <Empty icon="gavel" title={s.atab === 'mine' ? 'You have not bid on any auction yet' : 'No ' + tab[1].toLowerCase() + ' auctions right now'} msg="Live auctions are listed here as they open." />
      ) : (
        <View style={{ gap: 10, paddingBottom: 24 }}>
          {list.map(a => {
            const x = aucCard(store, a);
            return (
              <Press key={a.id} scale={0.985} onPress={x.tap} style={{ flexDirection: 'row', gap: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 10 }}>
                <View>
                  <Thumb im={x.im} sz={88} />
                  <View style={{ position: 'absolute', left: 6, top: 6, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, backgroundColor: x.pillBg }}>
                    {x.live ? <Floaty dur={1000} dist={2}><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: D.white }} /></Floaty> : null}
                    <T s={9} w={800} c={x.pillFg}>{x.pill}</T>
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T s={11} w={800} c={D.MUT}>{x.id + ' · ' + x.qty}</T>
                  <T s={14.5} w={800} lines={1} style={{ marginTop: 1 }}>{x.name}</T>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                    <View><T s={10.5} w={700} c={D.MUT}>{x.priceLabel}</T><T s={14} w={800} c={D.GD}>{x.price}</T></View>
                    <View><T s={10.5} w={700} c={D.MUT}>{x.timeLabel}</T><T s={13} w={800} c={x.urgent ? D.live : D.INK} style={{ fontVariant: ['tabular-nums'] }}>{x.time}</T></View>
                  </View>
                  {x.myTag ? <View style={{ alignSelf: 'flex-start', marginTop: 6, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: x.myBg }}><T s={10.5} w={800} c={x.myFg}>{x.myTag}</T></View> : null}
                </View>
              </Press>
            );
          })}
        </View>
      )}
    </View>
  );
}
