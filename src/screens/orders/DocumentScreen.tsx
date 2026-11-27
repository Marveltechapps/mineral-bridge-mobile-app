import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Logo } from '../../components/mb/art';
import { Empty, Pill } from '../../components/mb/kit';
import { D } from '../../theme';
import { NavyCard } from './OrderTrackingScreen';

const OK: Record<string, number> = { SIGNED: 1, PAID: 1, CONFIRMED: 1, COMPLETED: 1, COMPLIANT: 1, CERTIFIED: 1, VALID: 1, RELEASED: 1, DELIVERED: 1, REFUNDED: 1, WON: 1, DECLARED: 1 };

/** In-app preview of an order or lot document. Download / Share are the screen CTAs. */
export function DocumentScreen() {
  const store = useStore(), s = store.state;
  if (s.doc && s.doc.num && !s.docs[s.doc.num]) return <Empty icon="file" title={s.docLoading ? 'Loading document…' : 'Document unavailable'} msg={s.docLoading ? undefined : 'This document is not available right now. Go back and try again.'} />;
  const d = store.docData(s.doc), ok = !!OK[d.status];
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <View style={st.paper}>
        <NavyCard style={{ borderRadius: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo sz={34} flat />
            <View>
              <T s={15} w={800} c={D.white}>Mineral Bridge</T>
              <T s={9} w={800} c={D.GOLD} ls={0.08}>VERIFIED MINERAL TRADING</T>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
            <T s={9} w={700} c={D.navyFaint} right>{d.issuer}</T>
            <T s={11} w={800} c={D.white} right style={{ marginTop: 2 }}>{d.no}</T>
          </View>
        </NavyCard>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <T s={20} w={800} lh={1.2} style={{ flexShrink: 1 }}>{d.title}</T>
            {d.status ? <Pill label={d.status} bg={ok ? D.greenBg : D.amberBg} fg={ok ? D.green : D.AMBER} pad={[3, 9]} /> : null}
          </View>
          <T s={11.5} w={600} c={D.MUT} style={{ marginTop: 4 }}>{'Issued ' + d.date}</T>
          {d.parties.length ? (
            <View style={st.parties}>
              {d.parties.map(([k, v]) => (
                <View key={k} style={{ flex: 1, minWidth: 0 }}>
                  <T s={9.5} w={800} c={D.GD} ls={0.06}>{k}</T>
                  <T s={12} w={800} lh={1.35} style={{ marginTop: 3 }}>{v}</T>
                </View>
              ))}
            </View>
          ) : null}
          {d.sections.map(sec => (
            <View key={sec.h} style={{ marginTop: 14 }}>
              <T s={10.5} w={800} c={D.GD} ls={0.06} style={{ paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: D.G }}>{sec.h}</T>
              {sec.rows.map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: D.BOR }}>
                  <T s={12} w={700} c={D.MUT} style={{ flexShrink: 1 }}>{r.k}</T>
                  <T s={12} w={800} right style={{ flexShrink: 1 }}>{r.v}</T>
                </View>
              ))}
            </View>
          ))}
          {d.note ? <T s={11.5} w={600} c={D.MUT} lh={1.5} style={{ marginTop: 12 }}>{d.note}</T> : null}
          <View style={st.foot}>
            <View style={{ flexShrink: 1 }}>
              <T s={16} w={700} italic>{d.signer}</T>
              <T s={9} w={800} c={D.MUT} ls={0.06} style={{ marginTop: 2 }}>{d.signerRole}</T>
            </View>
            <View style={st.stamp}><T s={8} w={800} c={D.GD} lh={1.2} center>{'MB\nVERIFIED'}</T></View>
          </View>
        </View>
      </View>
      <T s={11.5} w={600} c={D.MUT} center style={{ marginTop: 12 }}>{'Preview · ' + store.docFile(d)}</T>
    </View>
  );
}

const st = StyleSheet.create({
  paper: { borderRadius: 18, backgroundColor: D.white, borderWidth: 1, borderColor: D.BOR, overflow: 'hidden', boxShadow: '0 8px 22px -16px rgba(14,26,51,.5)' },
  parties: { flexDirection: 'row', gap: 10, marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: D.TINT },
  foot: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: D.dash, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  stamp: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: D.GOLD, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
});
