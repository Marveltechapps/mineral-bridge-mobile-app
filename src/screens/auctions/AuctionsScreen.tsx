import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Pill, Segmented } from '../../components/ui/Blocks';
import { RadialBlob } from '../../components/ui/Gradient';
import { Drift, FadeUp, Pulse } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';
import type { Auction } from '../../types/mineralBridge';
import { aucCard, mineOf } from './auctionVals';

export function AuctionsScreen() {
  const store = useStore(), s = store.state, A = s.auctions || [];
  const TABS: [string, string, (a: Auction) => boolean][] = [['live', 'Live', a => a.status === 'live'], ['upcoming', 'Upcoming', a => a.status === 'upcoming'], ['ended', 'Ended', a => a.status === 'ended'], ['mine', 'My bids', a => mineOf(a) || !!s.reminders[a.id]]];
  const tab = TABS.find(t => t[0] === s.atab) || TABS[0], list = A.filter(tab[2]);
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.hero}>
        <Drift dur={10000} pointerEvents="none" style={{ position: 'absolute', right: -70, top: -90 }}>
          <RadialBlob size={200} color="rgba(217,180,86,.4)" style={{ position: 'relative' }} />
        </Drift>
        <Label c={c.gold}>VERIFIED LOTS · LIVE BIDDING</Label>
        <Txt serif s={26} lh={1.1} c={c.paper} style={{ marginTop: 6 }}>Bid on inspected lots</Txt>
        <Txt s={12.5} c={c.soft} lh={1.45} style={{ marginTop: 6 }}>Each bid must beat the current bid by at least the minimum step. The highest bid when the timer ends wins, then you pay to release the lot.</Txt>
      </View>
      <Segmented style={{ marginTop: 14 }} h={38} items={TABS.map(([id, label, f]) => {
        const n = A.filter(f).length, on = s.atab === id;
        return {
          on, onPress: () => store.setState({ atab: id }),
          label: <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Txt s={12.5} w={600} c={on ? c.paper : c.muted} lines={1}>{label}</Txt>{n ? <Txt mono s={10.5} c={on ? c.paper : c.muted} style={{ opacity: 0.7 }}>{String(n)}</Txt> : null}</View>,
        };
      })} />
      <View style={{ gap: 10, marginTop: 14 }}>
        {list.map(a => {
          const x = aucCard(store, a);
          return (
            <FadeUp key={a.id} dist={18} dur={350}>
              <Tap scale={0.985} onPress={x.tap}>
                <Card style={{ padding: 10, flexDirection: 'row', gap: 12 }}>
                  <View style={{ width: 96, height: 96, borderRadius: 14, overflow: 'hidden' }}>
                    <Image source={x.img} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
                    <View style={[st.pill, { backgroundColor: x.pillBg }]}>
                      {x.live ? <Pulse><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} /></Pulse> : null}
                      <Txt s={10} w={700} ls={0.3} c={x.pillFg}>{x.pill}</Txt>
                    </View>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt mono s={10} c={c.muted2}>{x.id} · {x.qty}</Txt>
                    <Txt s={14.5} w={600} lines={1} style={{ marginTop: 2 }}>{x.name}</Txt>
                    <View style={{ flex: 1 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                      <View><Txt s={11} c={c.muted}>{x.priceLabel}</Txt><Txt mono s={16} w={600}>{x.price}</Txt></View>
                      <View style={{ alignItems: 'flex-end' }}><Txt s={11} c={c.muted} right>{x.timeLabel}</Txt><Txt mono s={12.5} w={600} c={x.timeFg} right>{x.time}</Txt></View>
                    </View>
                    {x.myTag ? <Pill label={x.myTag} bg={x.myBg} fg={x.myFg} s={10.5} pad={[2, 8]} style={{ alignSelf: 'flex-start', marginTop: 6 }} /> : null}
                  </View>
                </Card>
              </Tap>
            </FadeUp>
          );
        })}
      </View>
      {!list.length ? (
        <Card style={{ padding: 24, alignItems: 'center' }}>
          <Txt s={15} w={600} center>{s.atab === 'mine' ? 'You have not bid on any auction yet' : 'No ' + tab[1].toLowerCase() + ' auctions right now'}</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>{s.auctionsLoading ? 'Loading auctions…' : 'Live auctions are listed here as they open.'}</Txt>
        </Card>
      ) : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  hero: { overflow: 'hidden', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.ink },
  pill: { position: 'absolute', left: 6, top: 6, flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99 },
});
