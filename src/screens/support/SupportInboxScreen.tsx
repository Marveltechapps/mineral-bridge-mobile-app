import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card, Chevron, ErrBox, InfoBox, ListCard, Pill, SoftBtn } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import { statusTone, topicLabel } from './supportVals';

/** Support tickets (`GET /support/threads`). The primary CTA starts a new general conversation. */
export function SupportInboxScreen() {
  const store = useStore(), s = store.state, list = s.supThreads;
  const refresh = () => { void store.task(store.remote.loadSupportThreads()); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: 8 }}>
        <Label>YOUR CONVERSATIONS</Label>
        <Tap label="Refresh" onPress={refresh} disabled={s.supLoading} style={{ paddingVertical: 2, paddingHorizontal: 4 }}>
          <Txt s={12.5} w={600} c={s.supLoading ? c.muted2 : c.goldInk}>{s.supLoading ? 'Refreshing…' : 'Refresh'}</Txt>
        </Tap>
      </View>
      {s.supErr && !list ? (
        <Card style={{ paddingVertical: 18, paddingHorizontal: 16 }}>
          <ErrBox mt={0}>{s.supErr}</ErrBox>
          <SoftBtn label="Try again" onPress={refresh} style={{ marginTop: 10 }} />
        </Card>
      ) : null}
      {!list && !s.supErr ? <Card style={{ paddingVertical: 18, paddingHorizontal: 16 }}><Txt s={13} c={c.muted} center>Loading your messages…</Txt></Card> : null}
      {list && !list.length ? (
        <Card style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
          <Txt s={14.5} w={600} center>No messages yet</Txt>
          <Txt s={13} c={c.muted} lh={1.5} center style={{ marginTop: 6 }}>Ask Mineral Bridge support anything. We reply here and on your chosen channels.</Txt>
        </Card>
      ) : null}
      {list && list.length ? (
        <ListCard>
          {list.map((t, i) => {
            const tone = statusTone(t.status), sub = t.subject && t.subject !== t.topic ? t.subject : '';
            return (
              <Tap key={t.ref} onPress={() => store.openSupport(t.ref)} style={{ paddingVertical: 13, borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: c.hair }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt s={14} w={600} lines={1}>{sub || topicLabel(t.topic)}</Txt>
                    <Txt s={11.5} c={c.muted2} lines={1} style={{ marginTop: 2 }}>{t.ref + ' · ' + topicLabel(t.topic) + ' · ' + MB.fmt(Date.parse(t.updatedAt) || Date.now())}</Txt>
                  </View>
                  <Pill label={tone[0]} bg={tone[1]} fg={tone[2]} />
                  <Chevron />
                </View>
              </Tap>
            );
          })}
        </ListCard>
      ) : null}
      {s.supErr && list ? <ErrBox>{s.supErr}</ErrBox> : null}
      <InfoBox mt={14}>For urgent help with an order, open the order and use its chat so we can see the details.</InfoBox>
    </FadeUp>
  );
}
