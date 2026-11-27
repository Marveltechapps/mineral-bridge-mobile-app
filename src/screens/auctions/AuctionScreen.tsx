import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Grad, Ic, jakarta, T } from '../../components/mb/base';
import { imBg, ImFill } from '../../components/mb/art';
import { Alert, Btn, Card, DemoBox, KV, Note, Press, Row, Section, Switch } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { aucCard, leadOf, mineOf, prodOf } from './auctionVals';

/** One auction (`scr_auction`). The main action (bid / remind / pay / browse) is the screen CTA. */
export function AuctionScreen() {
  const store = useStore(), s = store.state;
  const a = store.aucOf();
  if (!a) return null;
  const p = prodOf(a), x = aucCard(store, a), live = a.status === 'live', up = a.status === 'upcoming', lead = leadOf(a), mine = mineOf(a);
  const outbid = live && !!a.outbid && !lead, won = a.result === 'won', lost = a.status === 'ended' && a.result !== 'won';
  const inc = store.aucInc(a), amt = () => Math.round(parseFloat(String(s.bidAmt).replace(/[^\d.]/g, ''))) || store.aucMin(a);
  const bids = [...a.bids].reverse();
  const bidAgain = () => store.setState(st0 => { const min = store.aucMin(a), mx = parseFloat(st0.autoMax) || 0; return { bidAmt: String(min), bidErr: '', autoMax: st0.autoOn && mx < min ? String(min + 5000) : st0.autoMax }; });
  const full = x.im.kind === 'photo' && !x.im.bars;
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      {outbid ? (
        <View accessibilityRole="alert" style={st.outbid}>
          <T s={12.5} w={700} c={D.DANGER} style={{ flex: 1 }}>{'You have been outbid. Current bid ' + x.price + '.'}</T>
          <Press onPress={bidAgain}><T s={12.5} w={800} c={D.DANGER}>Bid again</T></Press>
        </View>
      ) : null}
      <View style={{ height: 190, borderRadius: 22, overflow: 'hidden', backgroundColor: imBg(x.im), alignItems: 'center', justifyContent: 'center' }}>
        <ImFill im={x.im} inset={full ? 1 : 0.64} />
        <Grad stops={[[0.45, 'rgba(14,26,51,0)'], [1, 'rgba(14,26,51,.85)']]} />
        <View style={{ position: 'absolute', left: 12, top: 12, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 8, backgroundColor: x.pillBg }}><T s={10.5} w={800} c={x.pillFg}>{x.pill}</T></View>
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
          <T s={11.5} w={700} c={D.GOLD}>{[a.id, p.form].filter(Boolean).join(' · ')}</T>
          <T s={20} w={800} c={D.white}>{p.name}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {([[x.priceLabel, x.price, a.bids.length + (a.bids.length === 1 ? ' bid' : ' bids') + (a.bids.length ? ' · step ' + MB.money(inc) : '')], [x.timeLabel, x.time, live ? 'until bidding closes' : up ? 'until bidding opens' : 'bidding closed']] as const).map(([k, v, sub], i) => (
          <View key={k} style={{ flex: 1, backgroundColor: i ? D.white : D.G, borderWidth: 1, borderColor: i ? D.BOR : D.G, borderRadius: 16, padding: 12 }}>
            <T s={11} w={700} c={i ? D.MUT : D.navyFaint}>{k}</T>
            <T s={19} w={800} c={i ? (x.urgent ? D.live : D.INK) : D.GOLD} style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>{v}</T>
            <T s={10.5} w={600} c={i ? D.MUT : D.navyFaint} style={{ marginTop: 2 }}>{sub}</T>
          </View>
        ))}
      </View>
      {live && lead ? (
        <View style={[st.note, { backgroundColor: D.greenBg }]}>
          <Ic name="check" s={15} c={D.green} w={3} />
          <T s={12.5} w={800} c={D.green} style={{ flex: 1 }}>{'You are the highest bidder' + (a.autoMax ? ' · auto-bid up to ' + MB.money(a.autoMax) : '')}</T>
        </View>
      ) : null}
      {lost ? (
        <View style={st.box}>
          <T s={14} w={800}>{'This lot sold for ' + x.price}</T>
          <T s={12.5} w={600} c={D.MUT} lh={1.45} style={{ marginTop: 4 }}>{mine ? 'Another bidder placed a higher bid. Turn on reminders for upcoming lots so you do not miss the next one.' : 'Bidding has closed for this lot.'}</T>
        </View>
      ) : null}
      {won ? (
        <View style={[st.box, { backgroundColor: D.greenBg, borderWidth: 0 }]}>
          <T s={14} w={800} c={D.green}>{'You won this lot at ' + x.price}</T>
          <T s={12.5} w={600} c={D.green} style={{ marginTop: 4 }}>Next: pay the winning bid to release it for dispatch.</T>
        </View>
      ) : null}
      {live ? (
        <>
          <Section t={'Your bid · minimum ' + MB.money(store.aucMin(a))} />
          <View style={{ backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Press label="Lower bid" onPress={() => store.setState({ bidAmt: String(Math.max(store.aucMin(a), amt() - inc)), bidErr: '' })} style={[st.step, { backgroundColor: D.TINT }]}><T s={22} w={800} c={D.G}>−</T></Press>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <T s={20} w={800} c={D.MUT}>$</T>
                <TextInput accessibilityLabel="Bid amount" keyboardType="number-pad" value={s.bidAmt} onChangeText={t => store.setState({ bidAmt: t.replace(/[^\d]/g, ''), bidErr: '' })} allowFontScaling={false}
                  style={[st.bidIn, { fontFamily: jakarta(800) }]} />
              </View>
              <Press label="Raise bid" onPress={() => store.setState({ bidAmt: String(amt() + inc), bidErr: '' })} style={[st.step, { backgroundColor: D.G }]}><T s={22} w={800} c={D.GOLD}>+</T></Press>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {[1, 2, 5].map(m => m * inc).map(v => (
                <Press key={v} onPress={() => store.setState({ bidAmt: String(store.aucCur(a) + v), bidErr: '' })} style={st.quick}><T s={12.5} w={800} c={D.GD}>{'+' + MB.money(v)}</T></Press>
              ))}
            </View>
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: s.autoOn }} onPress={() => {
              const next = !s.autoOn, maxStr = s.autoMax || String(amt() + 5000);
              store.setState({ autoOn: next, autoMax: maxStr });
              // BUG-017: register auto-bid with the server on toggle, not only after a manual bid.
              void store.task(store.remote.syncAutoBid(a, next, Math.round(parseFloat(maxStr) || 0)));
            }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T s={13.5} w={800}>Auto-bid</T>
                <T s={11.5} w={600} c={D.MUT}>{'We bid for you in ' + MB.money(inc) + ' steps up to your limit'}</T>
              </View>
              <Switch on={s.autoOn} goldKnob />
            </Pressable>
            {s.autoOn ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: D.BG, borderRadius: 12, paddingHorizontal: 12 }}>
                <T s={13} w={800} c={D.MUT}>Max $</T>
                <TextInput accessibilityLabel="Auto-bid limit" keyboardType="number-pad" value={s.autoMax} allowFontScaling={false}
                  onChangeText={t => store.setState({ autoMax: t.replace(/[^\d]/g, ''), bidErr: '' })}
                  onBlur={() => { if (!s.autoOn) return; const max = Math.round(parseFloat(s.autoMax) || 0); if (max > 0) void store.task(store.remote.syncAutoBid(a, true, max)); }}
                  style={{ flex: 1, height: 42, fontFamily: jakarta(800), fontSize: 15, color: D.INK, paddingVertical: 0 }} />
              </View>
            ) : null}
          </View>
          <Alert msg={s.bidErr} />
        </>
      ) : null}
      {up ? <Note mt={12}>{'Bidding opens ' + MB.fmt(a.startsAt || 0) + '. Starting bid ' + MB.money(a.start) + '. Turn on a reminder and we will message you when it opens.'}</Note> : null}
      <Section t="Lot" />
      <KV rows={[['Lot', a.id], ['Quantity', a.qty + ' ' + p.unit], ['Purity', p.lab ? p.grade : p.grade || 'Report on request'], ['Testing company', p.lab || '—'], !!p.origin && ['Origin', p.origin]]} />
      {bids.length ? (
        <>
          <Section t="Bid history" />
          <Card>
            {bids.map((b, i) => (
              <Row key={i} last={i === bids.length - 1} pv={10}>
                <View style={[st.av, { backgroundColor: b.who === 'You' ? D.G : i === 0 ? D.amberBg : D.BG }]}><T s={9.5} w={800} c={b.who === 'You' ? D.GOLD : D.INK}>{b.who === 'You' ? 'YOU' : 'B' + b.who.slice(-2)}</T></View>
                <View style={{ flex: 1 }}>
                  <T s={13} w={800}>{b.who === 'You' ? (b.auto ? 'You (auto-bid)' : 'You') : b.who}</T>
                  <T s={11} w={600} c={D.MUT}>{MB.fmt(b.at)}</T>
                </View>
                <T s={13.5} w={800} c={i === 0 ? D.GD : D.INK}>{MB.money(b.amt)}</T>
              </Row>
            ))}
          </Card>
        </>
      ) : null}
      {__DEV__ && live ? (
        <DemoBox title="DEMO · OTHER BIDDERS AND THE AUCTION CLOCK" style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Btn label="Another bidder bids" kind="dark" size="sm" onPress={() => store.simOutbid()} /></View>
            <View style={{ flex: 1 }}><Btn label="End auction now" kind="subtle" size="sm" onPress={() => store.endAuction(a.id)} /></View>
          </View>
        </DemoBox>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  outbid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: D.dangerBg },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13 },
  box: { marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR },
  step: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bidIn: { flexShrink: 1, minWidth: 60, maxWidth: 150, height: 44, textAlign: 'center', fontSize: 24, color: D.INK, paddingVertical: 0 },
  quick: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: D.BOR, alignItems: 'center' },
  av: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
