import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { BgImage, Card, DemoBox, ErrBox, KV, ListCard, SoftBtn, Toggle } from '../../components/ui/Blocks';
import { LinearFill } from '../../components/ui/Gradient';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp, Pulse } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { aucCard, leadOf, mineOf, prodOf } from './auctionVals';

export function AuctionScreen() {
  const store = useStore(), s = store.state;
  const a = store.aucOf();
  if (!a) return null;
  const p = prodOf(a), x = aucCard(store, a), live = a.status === 'live', up = a.status === 'upcoming', lead = leadOf(a), mine = mineOf(a);
  const outbid = live && !!a.outbid && !lead, won = a.result === 'won', lost = a.status === 'ended' && a.result !== 'won';
  const amt = () => Math.round(parseFloat(String(s.bidAmt).replace(/[^\d.]/g, ''))) || store.aucMin(a);
  const rows: [string, string][] = [['Lot', p.id], ['Quantity', a.qty + ' ' + p.unit], ['Purity', p.lab ? p.grade : 'Report on request'], ['Testing company', p.lab || '—'], ['Origin', p.origin]];
  const bids = [...a.bids].reverse();
  const bidAgain = () => store.setState(st0 => { const min = store.aucMin(a), mx = parseFloat(st0.autoMax) || 0; return { bidAmt: String(min), bidErr: '', autoMax: st0.autoOn && mx < min ? String(min + 5000) : st0.autoMax }; });

  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      {outbid ? (
        <FadeUp dist={18} dur={300} style={st.outbid}>
          <Txt s={13.5} w={600} c={c.red} style={{ flex: 1 }}>You have been outbid. Current bid {x.price}.</Txt>
          <Tap onPress={bidAgain}><Txt s={13} w={700} c={c.red} style={{ textDecorationLine: 'underline' }}>Bid again</Txt></Tap>
        </FadeUp>
      ) : null}
      <BgImage source={x.img} style={{ height: 200, borderRadius: 24 }}>
        <LinearFill stops={[[0.35, 'rgba(18,18,20,0)'], [1, 'rgba(18,18,20,.85)']]} />
        <View style={[st.pill, { backgroundColor: x.pillBg }]}>
          {live ? <Pulse><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' }} /></Pulse> : null}
          <Txt s={11} w={700} c={x.pillFg}>{x.pill}</Txt>
        </View>
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
          <Label c={c.gold}>{a.id} · {p.form}</Label>
          <Txt serif s={26} lh={1.1} c={c.paper} style={{ marginTop: 4 }}>{p.name}</Txt>
        </View>
      </BgImage>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <View style={[st.stat, { backgroundColor: c.ink }]}>
          <Label s={9.5} c={c.faint}>{x.priceLabel}</Label>
          <Txt mono s={21} w={600} c={c.gold} style={{ marginTop: 6 }}>{x.price}</Txt>
          <Txt s={11.5} c={c.soft} style={{ marginTop: 3 }}>{a.bids.length + (a.bids.length === 1 ? ' bid' : ' bids') + (a.bids.length ? ' · step $500' : '')}</Txt>
        </View>
        <Card style={st.stat}>
          <Label s={9.5}>{x.timeLabel}</Label>
          <Txt mono s={21} w={600} c={x.timeFg} style={{ marginTop: 6 }}>{x.time}</Txt>
          <Txt s={11.5} c={c.muted} style={{ marginTop: 3 }}>{live ? 'until bidding closes' : up ? 'until bidding opens' : 'bidding closed'}</Txt>
        </Card>
      </View>
      {live && lead ? (
        <FadeUp dist={18} dur={300} style={[st.box, { backgroundColor: c.greenBg, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14 }]}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}><Icon d={IC.check} size={12} color="#fff" sw={3.2} /></View>
          <Txt s={13.5} w={600} c={c.green} style={{ flex: 1 }}>You are the highest bidder{a.autoMax ? ' · auto-bid up to ' + MB.money(a.autoMax) : ''}</Txt>
        </FadeUp>
      ) : null}
      {lost ? (
        <View style={[st.box, { backgroundColor: c.chip }]}>
          <Txt s={14} w={600}>This lot sold for {x.price}</Txt>
          <Txt s={12.5} c={c.ink2} lh={1.45} style={{ marginTop: 4 }}>{mine ? 'Another bidder placed a higher bid. Turn on reminders for upcoming lots so you do not miss the next one.' : 'Bidding has closed for this lot.'}</Txt>
          <Tap onPress={() => store.jump('lots', { mineral: p.mineral, fform: 'All', labOnly: false, search: '' })} style={{ marginTop: 10 }}><Txt s={13} w={600} c={c.goldInk}>Browse similar lots →</Txt></Tap>
        </View>
      ) : null}
      {won ? (
        <View style={[st.box, { backgroundColor: c.greenBg }]}>
          <Txt s={14} w={600} c={c.green}>You won this lot at {x.price}</Txt>
          <Txt s={12.5} c={c.greenInk} style={{ marginTop: 4 }}>Next: pay the winning bid to release it for dispatch.</Txt>
        </View>
      ) : null}
      {live ? (
        <>
          <Label style={st.sec}>YOUR BID · MINIMUM {MB.money(store.aucMin(a))}</Label>
          <Card style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Tap label="Lower bid" onPress={() => store.setState({ bidAmt: String(Math.max(store.aucMin(a), amt() - 500)), bidErr: '' })} style={[st.step, { backgroundColor: c.chip }]}><Txt s={22}>−</Txt></Tap>
              <View style={{ flex: 1 }}>
                <TextInput accessibilityLabel="Bid amount" keyboardType="number-pad" value={s.bidAmt} onChangeText={t => store.setState({ bidAmt: t.replace(/[^\d]/g, ''), bidErr: '' })} allowFontScaling={false} style={st.bidIn} />
                <View pointerEvents="none" style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center' }}><Txt mono s={18} c={c.muted2}>$</Txt></View>
              </View>
              <Tap label="Raise bid" onPress={() => store.setState({ bidAmt: String(amt() + 500), bidErr: '' })} style={[st.step, { backgroundColor: c.ink }]}><Txt s={22} c={c.gold}>+</Txt></Tap>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {[500, 1000, 2500].map(inc => (
                <Tap key={inc} onPress={() => store.setState({ bidAmt: String(store.aucCur(a) + inc), bidErr: '' })} style={st.quick}><Txt mono s={12.5} w={600}>{'+' + MB.money(inc)}</Txt></Tap>
              ))}
            </View>
            <Tap role="switch" checked={s.autoOn} onPress={() => store.setState({ autoOn: !s.autoOn, autoMax: s.autoMax || String(amt() + 5000) })} style={st.auto}>
              <View style={{ flex: 1 }}>
                <Txt s={13.5} w={600}>Auto-bid</Txt>
                <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>We bid for you in $500 steps up to your limit</Txt>
              </View>
              <Toggle on={s.autoOn} />
            </Tap>
            {s.autoOn ? (
              <FadeUp dist={18} dur={250} style={{ marginTop: 10 }}>
                <TextInput accessibilityLabel="Auto-bid limit" keyboardType="number-pad" value={s.autoMax} onChangeText={t => store.setState({ autoMax: t.replace(/[^\d]/g, ''), bidErr: '' })} allowFontScaling={false} style={st.autoIn} />
                <View pointerEvents="none" style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center' }}><Txt s={12} c={c.muted2}>Max $</Txt></View>
              </FadeUp>
            ) : null}
          </Card>
          {s.bidErr ? <ErrBox mt={10}>{s.bidErr}</ErrBox> : null}
        </>
      ) : null}
      {up ? <View style={[st.box, { marginTop: 12, backgroundColor: c.chip }]}><Txt s={13} c={c.ink2} lh={1.5}>Bidding opens {MB.fmt(a.startsAt || 0)}. Starting bid {MB.money(a.start)}. Turn on a reminder and we will message you when it opens.</Txt></View> : null}
      <Label style={st.sec}>LOT</Label>
      <ListCard>{rows.map(([k, v], i) => <KV key={k} k={k} v={v} gap={12} line={i === rows.length - 1 ? false : true} />)}</ListCard>
      {bids.length ? (
        <>
          <Label style={st.sec}>BID HISTORY</Label>
          <ListCard>
            {bids.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: i === bids.length - 1 ? 'transparent' : c.hair }}>
                <View style={[st.av, { backgroundColor: b.who === 'You' ? c.ink : i === 0 ? c.amberBg : c.chip }]}><Txt mono s={9.5} w={600} c={b.who === 'You' ? c.gold : c.ink2}>{b.who === 'You' ? 'YOU' : 'B' + b.who.slice(-2)}</Txt></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt s={13.5} w={600}>{b.who === 'You' ? (b.auto ? 'You (auto-bid)' : 'You') : b.who}</Txt>
                  <Txt mono s={10.5} c={c.muted2} style={{ marginTop: 2 }}>{MB.fmt(b.at)}</Txt>
                </View>
                <Txt mono s={14} w={600}>{MB.money(b.amt)}</Txt>
              </View>
            ))}
          </ListCard>
        </>
      ) : null}
      {live ? (
        <DemoBox title="DEMO · OTHER BIDDERS AND THE AUCTION CLOCK" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            <SoftBtn label="Another bidder bids" h={40} s={12.5} onPress={() => store.simOutbid()} style={{ flex: 1 }} />
            <SoftBtn label="End auction now" h={40} s={12.5} onPress={() => store.endAuction(a.id)} style={{ flex: 1 }} />
          </View>
        </DemoBox>
      ) : null}
    </FadeUp>
  );
}

const st = StyleSheet.create({
  outbid: { marginBottom: 12, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.redBg, borderWidth: 1, borderColor: c.redLine, flexDirection: 'row', gap: 10, alignItems: 'center' },
  pill: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99 },
  stat: { flex: 1, minWidth: 0, padding: 14, borderRadius: 18 },
  box: { marginTop: 10, paddingVertical: 14, paddingHorizontal: 15, borderRadius: 16 },
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  step: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bidIn: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: c.line, paddingLeft: 30, paddingRight: 14, fontFamily: 'GeistMono-SemiBold', fontSize: 20, textAlign: 'center', color: c.ink, backgroundColor: c.white, paddingVertical: 0 },
  quick: { flex: 1, height: 36, borderRadius: 11, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' },
  auto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.hair },
  autoIn: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: c.line, paddingLeft: 52, paddingRight: 14, fontFamily: 'GeistMono-SemiBold', fontSize: 15, color: c.ink, backgroundColor: c.white, paddingVertical: 0 },
  av: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
