import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { T } from '../../components/mb/base';
import { Empty, Press } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import type { AppScreen } from '../../navigation/types';

/** Notifications (`scr_notifs`). "Read all" lives in the header. */
export function NotificationsScreen() {
  const store = useStore(), s = store.state;
  const via = 'Sent by ' + ((['email', 'sms', 'whatsapp', 'push'] as const).filter(k => s.prefs[k]).map(k => ({ email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', push: 'app' })[k]).join(' · ') || 'app');
  if (!s.notifs.length) return <Empty icon="bell" title="No notifications yet" msg="Order and sell-request updates appear here, and by your chosen channels." />;
  const open = (n: typeof s.notifs[number]) => {
    void store.task(store.remote.readNotif(n));
    if (n.oid) {
      const oid = n.oid;
      if (store.state.orders.some(o => o.id === oid)) store.go('order', { oid });
      else void store.task(store.remote.loadOrder(oid).then(() => { if (store.state.orders.some(o => o.id === oid)) store.go('order', { oid }); else store.flash('That order is not available'); }));
    } else if (/auction|outbid|won A-/i.test(n.title)) store.go('auctions', { atab: 'mine' });
    else if (n.to) store.go(n.to as AppScreen);
  };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 24, gap: 8 }}>
      {s.notifs.map(n => (
        <Press key={n.id} scale={0.985} onPress={() => open(n)} style={{ flexDirection: 'row', gap: 10, backgroundColor: n.read ? D.white : D.unreadBg, borderWidth: 1, borderColor: n.read ? D.BOR : D.unreadLine, borderRadius: 16, padding: 13 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: n.read ? 'transparent' : D.GOLD, marginTop: 6 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <T s={13.5} w={800} style={{ flexShrink: 1 }}>{n.title}</T>
              <T s={10.5} w={600} c={D.MUT}>{MB.fmt(n.at)}</T>
            </View>
            <T s={12.5} w={600} lh={1.4} style={{ marginTop: 3, opacity: 0.8 }}>{n.note}</T>
            <T s={11} w={600} c={D.MUT} style={{ marginTop: 4 }}>{via}</T>
          </View>
        </Press>
      ))}
    </View>
  );
}
