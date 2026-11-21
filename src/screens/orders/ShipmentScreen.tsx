import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, DocList, KV, ListCard, Pill } from '../../components/ui/Blocks';
import { Icon, IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { currentOrder, shipSteps } from './orderVals';

export function ShipmentScreen() {
  const store = useStore();
  const o = currentOrder(store);
  if (!o) return null;
  const sh = Object.assign({ id: '', status: '', from: '', to: '', partner: '', contact: '', mode: '', pickup: '', vehicle: '', driver: '', seals: '', eta: '', location: '', pod: '', events: [] as [string, number][], docs: [] as string[] }, o.ship || {});
  const podDoc = (o.docs || []).find(d => d.type === 'proof_of_delivery');
  const docs = (o.docs || []).filter(d => d.type === 'consignment_note' || d.type === 'proof_of_delivery').map(d => { const spec = { t: d.type, num: d.number, oid: o.id }; return { n: d.label + ' ' + d.number, f: sh.id + ' · ' + sh.partner, tap: () => store.openDoc(spec), dl: () => store.downloadDoc(spec) }; });
  const callPartner = () => { const num = /[\d+]{7,}/.test(sh.contact) ? sh.contact.replace(/[^\d+]/g, '') : ''; if (!num) return store.flash('No phone number for the logistics partner yet. Use chat.'); Linking.openURL('tel:' + num).catch(() => store.flash('Could not start a call on this device')); };
  const events = [...(sh.events || [])].reverse();
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.hero}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <Label c={c.faint}>{sh.id}</Label>
          <Pill label={sh.status} bg={c.gold} fg={c.ink} pad={[4, 10]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <View style={{ flex: 1, minWidth: 0 }}><Label s={9.5} c={c.faint}>FROM</Label><Txt s={13} w={600} lh={1.35} c={c.paper} style={{ marginTop: 4 }}>{sh.from}</Txt></View>
          <Icon d={IC.arrow} w={34} h={14} view="0 0 34 14" color={c.gold} sw={1.6} linejoin={false} />
          <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}><Label s={9.5} c={c.faint}>TO</Label><Txt s={13} w={600} lh={1.35} c={c.paper} right style={{ marginTop: 4 }}>{sh.to}</Txt></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 16 }}>
          {shipSteps(o).map(p => (
            <View key={p.l} style={{ flex: 1 }}>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: p.bar }} />
              <Txt s={10.5} c={p.fg} style={{ marginTop: 6 }}>{p.l}</Txt>
            </View>
          ))}
        </View>
      </View>
      <Label style={st.sec}>SHIPMENT</Label>
      <ListCard>
        <KV k="Logistics partner" v={sh.partner} gap={14} keyNone />
        <KV k="Contact" v={sh.contact} gap={14} keyNone />
        <KV k="Mode" v={sh.mode} gap={14} keyNone />
        <KV k="Pickup" v={sh.pickup} gap={14} keyNone />
        {sh.vehicle ? (<><KV k="Vehicle" v={sh.vehicle} gap={14} keyNone /><KV k="Driver" v={sh.driver} gap={14} keyNone /><KV k="Seals" v={sh.seals} gap={14} keyNone /></>) : null}
        {sh.eta ? <KV k="Estimated arrival" v={sh.eta} gap={14} keyNone /> : null}
        {sh.location ? <KV k="Last location" v={sh.location} gap={14} keyNone /> : null}
        <KV k="Tracking no." v={sh.id} mono gap={14} line={false} />
      </ListCard>
      {sh.pod ? (
        <View style={st.pod}>
          <View style={st.podOk}><Icon d={IC.check} size={13} color="#fff" sw={3} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt s={13.5} w={600} c={c.green}>Proof of delivery</Txt>
            <Txt s={12} c={c.greenInk} style={{ marginTop: 2 }}>{sh.pod}</Txt>
          </View>
          {podDoc ? <Tap onPress={() => store.openDoc({ t: 'proof_of_delivery', num: podDoc.number, oid: o.id })}><Txt s={12.5} w={600} c={c.green}>View</Txt></Tap> : null}
        </View>
      ) : null}
      {docs.length ? (<><Label style={st.sec}>TRANSPORT DOCUMENTS</Label><DocList docs={docs} /></>) : null}
      <Label style={st.sec}>TRACKING UPDATES</Label>
      <Card style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 2 }}>
        {events.map(([t, at], i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 4, backgroundColor: i === 0 ? c.gold : c.ink }} />
              <View style={{ width: 2, flex: 1, minHeight: 14, backgroundColor: i === events.length - 1 ? 'transparent' : c.line }} />
            </View>
            <View style={{ flex: 1, paddingBottom: 14 }}>
              <Txt s={13.5} w={600}>{t}</Txt>
              <Txt mono s={10.5} c={c.muted2} style={{ marginTop: 3 }}>{MB.fmt(at)}</Txt>
            </View>
          </View>
        ))}
      </Card>
      <Label style={st.sec}>CONTACT</Label>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Tap onPress={callPartner} style={[st.btn, { backgroundColor: c.ink }]}><Txt s={13.5} w={600} c={c.paper}>Call logistics partner</Txt></Tap>
        <Tap onPress={() => store.go('chat')} style={[st.btn, { backgroundColor: c.white, borderWidth: 1, borderColor: c.line }]}><Txt s={13.5} w={600}>Chat with Mineral Bridge</Txt></Tap>
      </View>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  hero: { padding: 18, borderRadius: 24, backgroundColor: c.ink },
  sec: { marginTop: 20, marginHorizontal: 4, marginBottom: 8 },
  pod: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: c.greenBg, flexDirection: 'row', gap: 12, alignItems: 'center' },
  podOk: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
  btn: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
