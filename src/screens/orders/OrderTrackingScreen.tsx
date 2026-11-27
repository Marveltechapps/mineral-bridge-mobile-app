import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Grad, Ic, T } from '../../components/mb/base';
import { Btn, Card, ContactRow, DemoBox, DocLine, Pill, Press, Row, Section } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D, SHADOW } from '../../theme';
import { auditRows, contactItems, currentOrder, orderDocs, orderLines, phaseRows, refundView } from './orderVals';

/** Navy gradient card (150deg #14284B → #0A1428) used across the order screens. */
export function NavyCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ borderRadius: 22, padding: 18, overflow: 'hidden', backgroundColor: D.G }, style]}>
      <Grad angle={150} stops={[[0, D.G], [1, D.deep]]} />
      {children}
    </View>
  );
}

function LinkRow({ icon, text, onPress, c = D.INK, ic = D.GD }: { icon: string; text: string; onPress: () => void; c?: string; ic?: string }) {
  return (
    <Press scale={0.98} onPress={onPress} style={st.link}>
      <Ic name={icon} s={18} c={ic} />
      <T s={13.5} w={800} c={c} style={{ flex: 1 }}>{text}</T>
      <Ic name="chevronRight" s={16} c={D.MUT} />
    </Press>
  );
}

/** Order / sell-request tracking (`scr_order` with the refund additions). */
export function OrderTrackingScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const v = store.view(o), sh = o.ship, ci = store.cancelInfo(o), rf = refundView(o), docs = orderDocs(store, o), sell = o.kind === 'sell';
  const showTrack = !!sh && !(o.refund && o.refund.status === 'refunded');
  const goAction = () => { if (v.actionScreen === 'quote' && !o.quote) return; store.prefillForms(o); store.go(v.actionScreen as never); };
  const rejAlt = () => { if (sell) return store.jump('sellCats'); const p = MB.product(o.items[0] && o.items[0].pid); store.jump('cats', { cat: '', search: p ? MB.mineralName(p.mineral) : '' }); };
  const hasDisc = o.hold === 'discrepancy';
  const extra = (
    <>
      {hasDisc ? (
        <View style={st.disc}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T s={10.5} w={800} c={D.DANGER} ls={0.06}>DELIVERY DISCREPANCY</T>
            <T s={11} w={800} c={D.AMBER}>Under review</T>
          </View>
          {o.disc && o.disc.qty ? <T s={13} w={800} style={{ marginTop: 6 }}>{o.disc.qty + ' received · condition ' + o.disc.cond.toLowerCase() + ' · ' + o.disc.photos + (o.disc.photos === 1 ? ' photo' : ' photos')}</T> : null}
          <T s={12.5} w={600} lh={1.45} style={{ marginTop: 6 }}>Mineral Bridge reviews the delivery photos and carrier records, then either ships the missing quantity or you can ask for money back for the difference.</T>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <View style={{ flex: 1 }}><Btn label="Refund the difference" size="sm" onPress={() => store.openRefund(o, { reason: 'Quantity or quality issue', note: 'Delivery discrepancy: ' + ((o.disc || { note: '' }).note || ''), type: 'partial' })} /></View>
            <View style={{ flex: 1 }}><Btn label="Discuss in chat" size="sm" kind="ghost" onPress={() => store.go('chat', { oid: o.id })} /></View>
          </View>
        </View>
      ) : null}
      {store.refundable(o) && !hasDisc ? <LinkRow icon="refund" text="Request a refund" onPress={() => store.openRefund(o)} /> : null}
      {rf ? (
        <View style={st.box}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T s={11} w={800} c={D.MUT}>{'REFUND · ' + rf.ref}</T>
            <Pill label={rf.statusLabel} bg={rf.pillBg} fg={rf.pillFg} pad={[3, 9]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <T s={14} w={800}>{rf.typeLabel}</T>
            <T s={14} w={800} c={D.GD}>{rf.amount}</T>
          </View>
          <T s={12} w={600} c={D.MUT} style={{ marginTop: 2 }}>{rf.reason + ' · to ' + rf.to}</T>
          {rf.declined ? <T s={12} w={700} c={D.DANGER} lh={1.4} style={{ marginTop: 8 }}>{rf.declineReason}</T> : (
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
              {rf.steps.map(t => (
                <View key={t.l} style={{ flex: 1 }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: t.bar }} />
                  <T s={9} w={t.w} c={t.fg} lh={1.2} style={{ marginTop: 4 }}>{t.l}</T>
                </View>
              ))}
            </View>
          )}
          {rf.bankRef ? <T s={11.5} w={700} c={D.green} style={{ marginTop: 8 }}>{'Bank reference ' + rf.bankRef}</T> : null}
        </View>
      ) : null}
      {v.canDeclineRefund ? <View style={{ marginTop: 8 }}><Btn label="Simulate: refund declined with reason" kind="danger" size="sm" onPress={() => store.demo('refundDecline')} /></View> : null}
    </>
  );
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 24 }}>
      <NavyCard style={{ boxShadow: SHADOW.dark }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <T s={10.5} w={800} c={D.GOLD} ls={0.08}>{v.step}</T>
          <Pill label={v.status} bg={v.pillBg} fg={v.pillFg} pad={[4, 9]} />
        </View>
        <T s={20} w={800} c={D.white} lh={1.2} style={{ marginTop: 10 }}>{v.headline}</T>
        <T s={12.5} w={600} c={D.navyMute} lh={1.45} style={{ marginTop: 5 }}>{v.next}</T>
        <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.14)', marginTop: 14, overflow: 'hidden' }}>
          <View style={{ width: v.pct as `${number}%`, height: '100%', backgroundColor: D.GOLD }} />
        </View>
        <T s={11} w={600} c={D.navyFaint} style={{ marginTop: 8 }}>{'Updated ' + v.updated}</T>
      </NavyCard>
      {!v.you ? extra : null}
      {v.you ? (
        <Press onPress={goAction} style={st.action}>
          <T s={15} w={800} c={D.G}>{v.actionLabel}</T>
          <Ic name="arrowRight" s={18} c={D.G} w={2.4} />
        </Press>
      ) : null}
      {v.you ? extra : null}
      {showTrack && sh ? <LinkRow icon="truck" text={'Track shipment · ' + sh.status} onPress={() => store.go('shipment')} /> : null}
      {ci.mode !== 'none' ? <LinkRow icon="x" ic={D.MUT} c={D.MUT} text={ci.mode === 'refund' ? 'Cancel order and get a refund' : sell ? 'Cancel sell request' : 'Cancel order'} onPress={() => store.openCancel(o)} /> : null}
      {v.rej ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1 }}><Btn label={sell ? 'Sell another mineral' : 'Find a similar lot'} size="sm" onPress={rejAlt} /></View>
          <View style={{ flex: 1 }}><Btn label="Contact support" size="sm" kind="ghost" onPress={() => store.go('chat')} /></View>
        </View>
      ) : null}
      {v.canDemo ? (
        <DemoBox title="DEMO · STEPS OWNED BY MINERAL BRIDGE, SGS OR LOGISTICS">
          <Btn label={v.demoLabel} kind="dark" size="sm" onPress={() => store.demo('')} />
          {v.canReject ? <Btn label="Simulate: order rejected with reason" kind="danger" size="sm" onPress={() => store.demo('reject')} /> : null}
          {v.canChanges ? <Btn label="Simulate: changes requested" kind="subtle" size="sm" onPress={() => store.demo('changes')} /> : null}
        </DemoBox>
      ) : null}

      <Section t={sell ? 'Sell request' : 'Order'} />
      <Card>
        {orderLines(o).map((l, i) => (
          <View key={i} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: D.BOR }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <T s={13.5} w={800} style={{ flexShrink: 1 }}>{l.n}</T>
              <T s={13.5} w={800}>{l.q}</T>
            </View>
            <T s={12} w={600} c={D.MUT} style={{ marginTop: 2 }}>{l.g}</T>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: o.insp ? 1 : 0, borderBottomColor: D.BOR }}>
          <T s={12.5} w={700} c={D.MUT}>{sell ? 'Agreed price' : o.quote && o.quote.est ? 'Estimated total' : 'Quoted total'}</T>
          <T s={14} w={800} c={D.GD}>{o.quote ? MB.money(o.quote.total) : 'By quotation'}</T>
        </View>
        {o.insp ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 11 }}>
            <T s={12.5} w={700} c={D.MUT}>Inspection</T>
            <T s={12.5} w={800} right style={{ flexShrink: 1 }}>{o.insp.when + ' · ' + ((o.form || {}).address || '')}</T>
          </View>
        ) : null}
      </Card>

      <Section t="Progress" />
      <Card style={{ paddingTop: 2, paddingBottom: 8 }}>
        {phaseRows(o).map((p, i) => (
          <View key={p.n} style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch' }}>
            <View style={{ alignItems: 'center', width: 24 }}>
              <View style={[st.dot, { backgroundColor: p.dot, borderColor: p.dotBorder }]}>
                {p.done ? <Ic name="check" s={12} c={D.GOLD} w={3} /> : <T s={10.5} w={800} c={p.now ? D.G : D.MUT}>{String(i + 1)}</T>}
              </View>
              {!p.last ? <View style={{ flex: 1, width: 2, minHeight: 10, backgroundColor: p.line }} /> : null}
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
              <T s={13.5} w={p.done || p.now ? 800 : 600} c={p.fg} style={{ flexShrink: 1 }}>{p.l}</T>
              {p.tag ? <T s={10.5} w={800} c={p.tagFg}>{p.tag}</T> : null}
            </View>
          </View>
        ))}
      </Card>

      {docs.length ? (
        <>
          <Section t="Documents" />
          <Card>{docs.map((d, i) => <DocLine key={d.n + i} n={d.n} f={d.f} onPress={d.tap} last={i === docs.length - 1} />)}</Card>
        </>
      ) : null}
      <Section t="Contact Mineral Bridge" />
      <ContactRow items={contactItems(store)} />
      <Section t="Approvals & history" />
      <Card>
        {auditRows(o).map((a, i) => (
          <Row key={i} last={a.last} style={{ alignItems: 'flex-start' }}>
            <View style={[st.avatar, { backgroundColor: a.youBg }]}><T s={9.5} w={800} c={a.youFg}>{a.ini}</T></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <T s={13} w={800} style={{ flexShrink: 1 }}>{a.text}</T>
                <T s={10.5} w={600} c={D.MUT}>{a.at}</T>
              </View>
              <T s={11.5} w={700} c={D.MUT} style={{ marginTop: 1 }}>{a.who}</T>
              {a.note ? <T s={12} w={600} c={D.INK} lh={1.4} style={{ marginTop: 3, opacity: 0.8 }}>{a.note}</T> : null}
            </View>
          </Row>
        ))}
      </Card>
    </View>
  );
}

const st = StyleSheet.create({
  action: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 14, backgroundColor: D.GOLD, boxShadow: SHADOW.gold },
  link: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 14, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR },
  disc: { marginTop: 12, backgroundColor: D.white, borderWidth: 1.5, borderColor: D.redLine, borderRadius: 18, padding: 14 },
  box: { marginTop: 12, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, borderRadius: 18, padding: 14 },
  dot: { width: 22, height: 22, borderRadius: 11, marginTop: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
