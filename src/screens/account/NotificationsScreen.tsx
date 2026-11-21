import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { Card } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import type { AppScreen } from '../../navigation/types';

export function NotificationsScreen() {
  const store = useStore(), s = store.state;
  const unread = s.notifs.filter(n => !n.read).length;
  const via = 'Sent by ' + ((['email', 'sms', 'whatsapp', 'push'] as const).filter(k => s.prefs[k]).map(k => ({ email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', push: 'app' })[k]).join(' · ') || 'app');
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      {unread ? (
        <Tap onPress={() => { void store.task(store.remote.readAll()); }} style={{ alignSelf: 'flex-end', marginHorizontal: 4, marginBottom: 10 }}>
          <Txt s={13} w={600} c={c.goldInk} right>Mark all as read</Txt>
        </Tap>
      ) : null}
      <View style={{ gap: 8 }}>
        {s.notifs.map(n => (
          <Tap key={n.id} onPress={() => { void store.task(store.remote.readNotif(n)); if (n.oid) { const oid = n.oid; if (store.state.orders.some(o => o.id === oid)) store.go('order', { oid }); else void store.task(store.remote.loadOrder(oid).then(() => { if (store.state.orders.some(o => o.id === oid)) store.go('order', { oid }); else store.flash('That order is not available'); })); } else if (n.to) store.go(n.to as AppScreen); }}>
            <Card r={18} style={{ paddingVertical: 13, paddingHorizontal: 15, flexDirection: 'row', gap: 11 }}>
              <View style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: n.read ? 'transparent' : c.gold }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Txt s={14} w={600} style={{ flexShrink: 1 }}>{n.title}</Txt>
                  <Txt mono s={10.5} c={c.muted2}>{MB.fmt(n.at)}</Txt>
                </View>
                <Txt s={12.5} c={c.muted} lh={1.45} style={{ marginTop: 3 }}>{n.note}</Txt>
                <Txt mono s={10} c={c.muted2} style={{ marginTop: 6 }}>{via}</Txt>
              </View>
            </Card>
          </Tap>
        ))}
      </View>
      {!s.notifs.length ? (
        <Card style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' }}>
          <Txt s={15} w={600}>No notifications yet</Txt>
          <Txt s={13} c={c.muted} center style={{ marginTop: 6 }}>Order and sell-request updates appear here, and by your chosen channels.</Txt>
        </Card>
      ) : null}
    </FadeUp>
  );
}
