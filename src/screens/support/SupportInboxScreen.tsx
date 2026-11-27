import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Ic, T } from '../../components/mb/base';
import { Alert, Btn, Card, Empty, Note, Pill, Press, Row, Section, Spinner } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import { statusTone, topicLabel } from './supportVals';

/** Support tickets (`GET /support/threads`). "New message" is the screen CTA. */
export function SupportInboxScreen() {
  const store = useStore(), s = store.state, list = s.supThreads;
  const refresh = () => { void store.task(store.remote.loadSupportThreads()); };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <Section t="Your conversations" right={<Press label="Refresh" disabled={s.supLoading} onPress={refresh}><T s={12.5} w={800} c={s.supLoading ? D.MUT : D.GD}>{s.supLoading ? 'Refreshing…' : 'Refresh'}</T></Press>} />
      {s.supErr && !list ? (
        <Card style={{ paddingVertical: 14 }}>
          <Alert msg={s.supErr} mt={0} />
          <View style={{ marginTop: 10 }}><Btn label="Try again" kind="subtle" size="sm" onPress={refresh} /></View>
        </Card>
      ) : null}
      {!list && !s.supErr ? <View style={{ alignItems: 'center', paddingVertical: 32 }}><Spinner sz={24} /></View> : null}
      {list && !list.length ? <Empty icon="msg" title="No messages yet" msg="Ask Mineral Bridge support anything. We reply here and on your chosen channels." /> : null}
      {list && list.length ? (
        <Card>
          {list.map((t, i) => {
            const tone = statusTone(t.status), sub = t.subject && t.subject !== t.topic ? t.subject : '';
            return (
              <Row key={t.ref} last={i === list.length - 1} pv={13} onPress={() => store.openSupport(t.ref)}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T s={14} w={800} lines={1}>{sub || topicLabel(t.topic)}</T>
                  <T s={11.5} w={600} c={D.MUT} lines={1} style={{ marginTop: 2 }}>{t.ref + ' · ' + topicLabel(t.topic) + ' · ' + MB.fmt(Date.parse(t.updatedAt) || Date.now())}</T>
                </View>
                <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} />
                <Ic name="chevronRight" s={16} c={D.MUT} />
              </Row>
            );
          })}
        </Card>
      ) : null}
      {s.supErr && list ? <Alert msg={s.supErr} /> : null}
      <Note>For urgent help with an order, open the order and use its chat so we can see the details.</Note>
    </View>
  );
}
