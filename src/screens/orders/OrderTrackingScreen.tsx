import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Chevron, ContactGrid, DemoBox, DocList, ListCard, Pill, SoftBtn } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp, ProgressFill } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { auditRows, contactItems, currentOrder, orderDocs, orderLines, phaseRows, refundView } from './orderVals';

export function OrderTrackingScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const ov = store.view(o), sh = o.ship, ci = store.cancelInfo(o), rf = refundView(o), docs = orderDocs(store, o);
  const showTrack = !!sh && !(o.refund && o.refund.status === 'refunded');
  const sell = o.kind === 'sell';
  const amount = o.quote ? MB.money(o.quote.total) : '';
  const canRefundBtn = store.refundable(o) && o.hold !== 'discrepancy';
  const hasDisc = o.hold === 'discrepancy' && !!o.disc;
  const goAction = () => { if (ov.actionScreen === 'quote' && !o.quote) return; store.prefillForms(o); store.go(ov.actionScreen as never); };
  const rejAlt = () => { if (sell) return store.jump('sellCats'); const m = (MB.product(o.items[0] && o.items[0].pid) || { mineral: 'gold' }).mineral; store.jump('lots', { mineral: m, fform: 'All', labOnly: false, search: '' }); };

  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.hero}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Label c={c.faint}>{ov.step}</Label>
          <Pill label={ov.status} bg={ov.pillBg} fg={ov.pillFg} pad={[4, 10]} />
        </View>
        <Txt serif s={28} lh={1.1} c={c.paper} style={{ marginTop: 10 }}>{ov.headline}</Txt>
        <Txt s={13} c={c.soft} lh={1.45} style={{ marginTop: 6 }}>{ov.next}</Txt>
        <View style={st.heroTrack}><ProgressFill pct={ov.pct} style={{ borderRadius: 2, backgroundColor: c.gold }} /></View>
        <Txt s={11.5} c={c.faint} style={{ marginTop: 8 }}>Updated {ov.updated}</Txt>
      </View>
      {ov.you ? (
        <Tap scale={0.98} onPress={goAction} style={st.action}>
          <Txt s={15} w={600}>{ov.actionLabel}</Txt>
          <Icon d={IC.chevron} size={15} sw={2.4} linejoin={false} />
        </Tap>
      ) : null}
      {showTrack && sh ? (
        <Tap scale={0.98} onPress={() => store.go('shipment')} style={st.track}>
          <Icon d={IC.truck} size={17} />
          <Txt s={14} w={600}>Track shipment · {sh.status}</Txt>
        </Tap>
      ) : null}
      {hasDisc && o.disc ? (
        <Card style={{ marginTop: 12, borderColor: c.redLine, paddingVertical: 15, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Label c={c.red}>DELIVERY DISCREPANCY</Label>
            <Pill label="Under review" bg={c.redBg} fg={c.red} />
          </View>
          <Txt s={14} w={600} style={{ marginTop: 8 }}>{o.disc.qty ? o.disc.qty + ' received · condition ' + o.disc.cond.toLowerCase() + ' · ' + o.disc.photos + (o.disc.photos === 1 ? ' photo' : ' photos') : 'Discrepancy raised'}</Txt>
          <Txt s={12.5} c={c.ink2} lh={1.5} style={{ marginTop: 4 }}>“{o.disc.note}”</Txt>
          <Txt s={12} c={c.muted} lh={1.5} style={{ marginTop: 8 }}>Mineral Bridge reviews the delivery photos and carrier records, then either ships the missing quantity or you can ask for money back for the difference.</Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Tap onPress={() => store.openRefund(o, { reason: 'Quantity or quality issue', note: 'Delivery discrepancy: ' + (o.disc || { note: '' }).note, type: 'partial' })} style={[st.half, { backgroundColor: c.ink }]}><Txt s={13} w={600} c={c.paper}>Refund the difference</Txt></Tap>
            <Tap onPress={() => store.go('chat')} style={[st.half, st.light]}><Txt s={13} w={600}>Discuss in chat</Txt></Tap>
          </View>
        </Card>
      ) : null}
      {canRefundBtn ? (
        <Tap scale={0.98} onPress={() => store.openRefund(o)} style={[st.btnRow, { height: 48, marginTop: 10, borderColor: c.redLine }]}>
          <Icon d={IC.refund} size={16} color={c.red} sw={2} />
          <Txt s={14} w={600} c={c.red}>Request a refund</Txt>
        </Tap>
      ) : null}
      {ci.mode !== 'none' ? (
        <Tap scale={0.98} onPress={() => store.openCancel(o)} style={[st.btnRow, { height: 46, marginTop: 8, backgroundColor: 'transparent' }]}>
          <Icon d="M15 9l-6 6M9 9l6 6" circles={[[12, 12, 9]]} size={15} color={c.muted} sw={2} linejoin={false} />
          <Txt s={13.5} w={600} c={c.muted}>{ci.mode === 'refund' ? 'Cancel order and get a refund' : sell ? 'Cancel sell request' : 'Cancel order'}</Txt>
        </Tap>
      ) : null}
      {rf ? (
        <Card style={{ marginTop: 12, paddingVertical: 15, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Label>REFUND · {rf.ref}</Label>
            <Pill label={rf.statusLabel} bg={rf.pillBg} fg={rf.pillFg} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
            <Txt s={13.5} c={c.muted}>{rf.typeLabel}</Txt>
            <Txt mono s={20} w={600}>{rf.amount}</Txt>
          </View>
          <Txt s={12.5} c={c.ink2} style={{ marginTop: 4 }}>{rf.reason} · to {rf.to}</Txt>
          {rf.declined ? <View style={st.declined}><Txt s={12.5} c={c.red} lh={1.45}>{rf.declineReason}</Txt></View> : null}
          {rf.showSteps ? (
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
              {rf.steps.map(t => (
                <View key={t.l} style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: t.bar }} />
                  <Txt s={10} lh={1.25} w={t.w} c={t.fg} style={{ marginTop: 5 }}>{t.l}</Txt>
                </View>
              ))}
            </View>
          ) : null}
          {rf.bankRef ? <Txt mono s={11.5} c={c.green} style={{ marginTop: 10 }}>Bank reference {rf.bankRef}</Txt> : null}
        </Card>
      ) : null}
      {ov.rej ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Tap onPress={rejAlt} style={[st.half, { height: 48, borderRadius: 16, backgroundColor: c.ink }]}><Txt s={13.5} w={600} c={c.paper}>{sell ? 'Sell another mineral' : 'Find a similar lot'}</Txt></Tap>
          <Tap onPress={() => store.go('chat')} style={[st.half, st.light, { height: 48, borderRadius: 16 }]}><Txt s={13.5} w={600}>Contact support</Txt></Tap>
        </View>
      ) : null}
      {ov.canDemo ? (
        <DemoBox title="DEV ONLY · LOCAL SIMULATION (NOT SENT TO THE SERVER)" style={{ marginTop: 10 }}>
          <SoftBtn label={ov.demoLabel} onPress={() => store.demo('')} style={{ marginTop: 8 }} />
          {ov.canDeclineRefund ? <SoftBtn label="Simulate: refund declined with reason" h={38} bg="transparent" fg={c.red} s={12.5} onPress={() => store.demo('refundDecline')} style={{ marginTop: 6 }} /> : null}
          {ov.canReject ? <SoftBtn label="Simulate: order rejected with reason" h={38} bg="transparent" fg={c.red} s={12.5} onPress={() => store.demo('reject')} style={{ marginTop: 6 }} /> : null}
          {ov.canChanges ? <SoftBtn label="Simulate: changes requested" h={38} bg="transparent" fg={c.amber} s={12.5} onPress={() => store.demo('changes')} style={{ marginTop: 6 }} /> : null}
        </DemoBox>
      ) : null}

      <Label style={st.sec}>ORDER</Label>
      <ListCard>
        {orderLines(o).map((l, i) => (
          <View key={i} style={st.lineRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Txt s={14} w={600} style={{ flexShrink: 1 }}>{l.n}</Txt>
              <Txt s={14} mono>{l.q}</Txt>
            </View>
            <Txt s={12} c={c.muted} style={{ marginTop: 3 }}>{l.g}</Txt>
          </View>
        ))}
        {amount ? (
          <View style={[st.rowKV, { borderBottomWidth: 1, borderBottomColor: c.hair }]}>
            <Txt s={13.5} c={c.muted}>{sell ? 'AGREED PRICE' : o.quote && o.quote.est ? 'ESTIMATED TOTAL' : 'QUOTED TOTAL'}</Txt>
            <Txt s={13.5} mono w={600}>{amount}</Txt>
          </View>
        ) : null}
        {o.insp ? (
          <View style={[st.rowKV, { borderBottomWidth: 1, borderBottomColor: c.hair, gap: 10 }]}>
            <Txt s={13.5} c={c.muted}>Inspection</Txt>
            <Txt s={13.5} w={600} right style={{ flexShrink: 1 }}>{o.insp.when + ' · ' + ((o.form || {}).address || '')}</Txt>
          </View>
        ) : null}
        {showTrack && sh ? (
          <Tap onPress={() => store.go('shipment')} style={[st.rowKV, { alignItems: 'center', gap: 10 }]}>
            <Txt s={13.5} c={c.muted}>Logistics</Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
              <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
                <Txt s={13.5} w={600} right>{sh.status}</Txt>
                <Txt s={12} c={c.muted} right>{sh.partner + ' · ' + sh.id}</Txt>
              </View>
              <Chevron />
            </View>
          </Tap>
        ) : null}
      </ListCard>

      <Label style={st.sec}>PROGRESS</Label>
      <Card style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }}>
        {phaseRows(o).map(p => (
          <View key={p.n} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={[st.dot, { backgroundColor: p.dot, borderColor: p.dotBorder }]}><Txt mono s={10.5} c={c.paper}>{p.n}</Txt></View>
              <View style={{ width: 2, flex: 1, minHeight: 12, backgroundColor: p.line }} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingTop: 2, paddingBottom: 14 }}>
              <Txt s={13.5} w={600} c={p.fg} style={{ flexShrink: 1 }}>{p.l}</Txt>
              <Txt mono s={10.5} c={c.goldInk}>{p.tag}</Txt>
            </View>
          </View>
        ))}
      </Card>
      {docs.length ? (<><Label style={st.sec}>DOCUMENTS</Label><DocList docs={docs} /></>) : null}
      <Label style={st.sec}>CONTACT MINERAL BRIDGE</Label>
      <ContactGrid items={contactItems(store)} />
      <Label style={st.sec}>APPROVALS & HISTORY</Label>
      <ListCard>
        {auditRows(o).map((a, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: a.line }}>
            <View style={[st.avatar, { backgroundColor: a.youBg }]}><Txt mono s={9} w={600} c={a.youFg}>{a.ini}</Txt></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Txt s={13.5} w={600} style={{ flexShrink: 1 }}>{a.text}</Txt>
                <Txt mono s={10.5} c={c.muted2}>{a.at}</Txt>
              </View>
              <Txt s={12} c={c.muted} style={{ marginTop: 2 }}>{a.who}</Txt>
              {a.note ? <Txt s={12.5} c={c.ink2} lh={1.45} style={{ marginTop: 4 }}>{a.note}</Txt> : null}
            </View>
          </View>
        ))}
      </ListCard>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  hero: { padding: 18, borderRadius: 24, backgroundColor: c.ink },
  heroTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.12)', marginTop: 14, overflow: 'hidden' },
  action: { marginTop: 10, height: 54, borderRadius: 18, backgroundColor: c.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  track: { marginTop: 10, height: 50, borderRadius: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  btnRow: { borderRadius: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  half: { flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  light: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line },
  declined: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: c.redBg },
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  lineRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair },
  rowKV: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
