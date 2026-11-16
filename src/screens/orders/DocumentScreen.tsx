import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { FadeUp } from '../../components/ui/Motion';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

const OK: Record<string, number> = { SIGNED: 1, PAID: 1, CONFIRMED: 1, COMPLETED: 1, COMPLIANT: 1, CERTIFIED: 1, VALID: 1, RELEASED: 1, DELIVERED: 1, REFUNDED: 1, WON: 1, DECLARED: 1 };

/** In-app preview of an order or lot document. */
export function DocumentScreen() {
  const store = useStore(), s = store.state;
  const d = store.docData(s.doc), ok = !!OK[d.status];
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={st.paper}>
        <View style={st.top}>
          <View>
            <Txt serif s={19} lh={1} c={c.paper}>Mineral Bridge</Txt>
            <Txt mono s={8.5} ls={0.8} c={c.gold} style={{ marginTop: 4 }}>VERIFIED MINERAL TRADING</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
            <Txt mono s={9} ls={0.6} c={c.faint} right>{d.issuer}</Txt>
            <Txt mono s={10.5} c={c.paper} right style={{ marginTop: 3 }}>{d.no}</Txt>
          </View>
        </View>
        <View style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <Txt serif s={24} lh={1.1} style={{ flexShrink: 1 }}>{d.title}</Txt>
            {d.status ? <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99, backgroundColor: ok ? c.greenBg : c.amberBg }}><Txt s={10.5} w={700} ls={0.3} c={ok ? c.green : c.amber}>{d.status}</Txt></View> : null}
          </View>
          <Txt s={11.5} c={c.muted} style={{ marginTop: 4 }}>Issued {d.date}</Txt>
          {d.parties.length ? (
            <View style={st.parties}>
              {d.parties.map(([k, v]) => (
                <View key={k} style={{ flex: 1, minWidth: 0 }}>
                  <Txt mono s={8.5} ls={0.6} c={c.muted2}>{k}</Txt>
                  <Txt s={12} w={600} lh={1.35} style={{ marginTop: 3 }}>{v}</Txt>
                </View>
              ))}
            </View>
          ) : null}
          {d.sections.map(sec => (
            <View key={sec.h} style={{ marginTop: 14 }}>
              <Txt mono s={9} ls={0.7} c={c.goldInk} style={st.secHead}>{sec.h}</Txt>
              {sec.rows.map((r, i) => (
                <View key={i} style={st.row}>
                  <Txt s={12} c={c.muted} style={{ flexShrink: 1 }}>{r.k}</Txt>
                  <Txt s={12} w={r.w === 700 ? 700 : 500} mono={r.mono} right style={{ flexShrink: 1 }}>{r.v}</Txt>
                </View>
              ))}
            </View>
          ))}
          {d.note ? <Txt s={11} c={c.muted} lh={1.5} style={{ marginTop: 12 }}>{d.note}</Txt> : null}
        </View>
        <View style={st.foot}>
          <View style={{ flexShrink: 1 }}>
            <Txt serif italic s={18}>{d.signer}</Txt>
            <Txt mono s={8.5} ls={0.6} c={c.muted2} style={{ marginTop: 2 }}>{d.signerRole}</Txt>
          </View>
          <View style={st.stamp}><Txt mono s={7.5} ls={0.4} lh={1.2} c={c.goldInk} center>{'MB\nVERIFIED'}</Txt></View>
        </View>
      </View>
      <Txt s={11.5} c={c.muted2} center style={{ marginTop: 12 }}>Preview · {store.docFile(d)}</Txt>
    </FadeUp>
  );
}

const st = StyleSheet.create({
  paper: { borderRadius: 6, backgroundColor: c.white, boxShadow: '0 1px 2px rgba(18,18,20,.06), 0 12px 32px rgba(18,18,20,.10)', borderWidth: 1, borderColor: c.line, overflow: 'hidden' },
  top: { paddingTop: 16, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: c.ink, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  parties: { flexDirection: 'row', gap: 10, marginTop: 14, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, backgroundColor: c.field2 },
  secHead: { paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: c.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.hair },
  foot: { marginTop: 14, marginHorizontal: 18, marginBottom: 16, paddingTop: 12, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: c.dash, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  stamp: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: c.gold, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
});
