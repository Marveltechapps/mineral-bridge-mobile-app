import React from 'react';
import { Linking, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { Btn, Card, DocLine, KV, Row, Section } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { NavyCard } from './OrderTrackingScreen';
import { currentOrder, shipSteps } from './orderVals';

/** Shipment tracking (`scr_shipment`). */
export function ShipmentScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const sh = Object.assign({ id: '', status: '', from: '', to: '', partner: '', contact: '', mode: '', pickup: '', vehicle: '', driver: '', seals: '', eta: '', location: '', pod: '', events: [] as [string, number][], docs: [] as string[] }, o.ship || {});
  const docs = (o.docs || []).filter(d => d.type === 'consignment_note' || d.type === 'proof_of_delivery').map(d => ({ n: d.label + ' ' + d.number, f: sh.id + ' · ' + sh.partner, tap: () => store.openDoc({ t: d.type, num: d.number, oid: o.id }) }));
  const callPartner = () => { const num = /[\d+]{7,}/.test(sh.contact) ? sh.contact.replace(/[^\d+]/g, '') : ''; if (!num) return store.flash('No phone number for the logistics partner yet. Use chat.'); Linking.openURL('tel:' + num).catch(() => store.flash('Could not start a call on this device')); };
  const events = [...(sh.events || [])].reverse();
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <NavyCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <T s={12} w={800} c={D.GOLD}>{sh.id}</T>
          <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: 'rgba(217,180,86,.18)' }}><T s={11} w={800} c={D.GOLD}>{sh.status}</T></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 }}>
          <View style={{ flex: 1 }}><T s={10} w={800} c={D.navyFaint}>FROM</T><T s={12.5} w={700} c={D.white} lh={1.35} style={{ marginTop: 2 }}>{sh.from}</T></View>
          <Ic name="arrowRight" s={18} c={D.GOLD} />
          <View style={{ flex: 1 }}><T s={10} w={800} c={D.navyFaint}>TO</T><T s={12.5} w={700} c={D.white} lh={1.35} style={{ marginTop: 2 }}>{sh.to}</T></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
          {shipSteps(o).map(p => (
            <View key={p.l} style={{ flex: 1 }}>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: p.bar }} />
              <T s={10} w={700} c={p.fg} style={{ marginTop: 5 }}>{p.l}</T>
            </View>
          ))}
        </View>
      </NavyCard>
      <Section t="Shipment" />
      <KV rows={[['Logistics partner', sh.partner], ['Contact', sh.contact], ['Mode', sh.mode], ['Pickup', sh.pickup], !!sh.vehicle && ['Vehicle', sh.vehicle], !!sh.driver && ['Driver', sh.driver], !!sh.seals && ['Seals', sh.seals], !!sh.eta && ['Estimated arrival', sh.eta], !!sh.location && ['Last location', sh.location], ['Tracking no.', sh.id], !!sh.pod && ['Proof of delivery', sh.pod]]} />
      {docs.length ? (
        <>
          <Section t="Transport documents" />
          <Card>{docs.map((d, i) => <DocLine key={d.n} n={d.n} f={d.f} onPress={d.tap} last={i === docs.length - 1} />)}</Card>
        </>
      ) : (sh.docs || []).length ? (
        <>
          <Section t="Transport documents" />
          <KV rows={(sh.docs || []).map(n => [n, sh.id] as [string, string])} />
        </>
      ) : null}
      <Section t="Tracking updates" />
      <Card>
        {events.map(([t, at], i) => (
          <Row key={i} last={i === events.length - 1} style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i === 0 ? D.GOLD : D.G, marginTop: 4 }} />
            <View style={{ flex: 1 }}>
              <T s={13} w={800}>{t}</T>
              <T s={11.5} w={600} c={D.MUT}>{MB.fmt(at)}</T>
            </View>
          </Row>
        ))}
      </Card>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, paddingBottom: 24 }}>
        <View style={{ flex: 1 }}><Btn label="Call logistics partner" kind="ghost" size="sm" onPress={callPartner} /></View>
        <View style={{ flex: 1 }}><Btn label="Chat with Mineral Bridge" kind="ghost" size="sm" onPress={() => store.go('chat')} /></View>
      </View>
    </View>
  );
}
