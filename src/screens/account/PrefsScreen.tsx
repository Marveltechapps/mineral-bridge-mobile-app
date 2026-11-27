import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { T } from '../../components/mb/base';
import { Card, IconTile, Row, Switch } from '../../components/mb/kit';
import { D } from '../../theme';

const ICON: Record<string, string> = { email: 'mail', sms: 'msg', whatsapp: 'wa', push: 'bell' };

/** Notification channels (`scr_prefs`). At least one channel must stay on. */
export function PrefsScreen() {
  const store = useStore(), s = store.state, u = s.user;
  const rows: [keyof AppState['prefs'], string, string][] = [['email', 'Email', (u && u.email) || 'Add an email in Edit profile'], ['sms', 'SMS', (u && u.phone) || 'Add a mobile number'], ['whatsapp', 'WhatsApp', (u && u.phone) || 'Add a mobile number'], ['push', 'App notifications', 'On this device']];
  const toggle = (k: keyof AppState['prefs']) => {
    if (s.prefs[k] && Object.values(s.prefs).filter(Boolean).length <= 1) return store.flash('Keep at least one channel on');
    void store.task(store.remote.togglePref(k));
  };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <T s={13.5} w={600} c={D.MUT} lh={1.45} style={{ marginHorizontal: 2, marginBottom: 12 }}>Every stage update is sent on the channels you keep on.</T>
      <Card>
        {rows.map(([k, l, sub], i) => (
          <Row key={k} last={i === rows.length - 1} pv={13} style={{ gap: 12 }} onPress={() => toggle(k)}>
            <IconTile icon={ICON[k]} sz={38} r={12} c={D.GD} />
            <View style={{ flex: 1, minWidth: 0 }} accessibilityRole="switch" accessibilityState={{ checked: s.prefs[k] }}>
              <T s={14} w={800}>{l}</T>
              <T s={12} w={600} c={D.MUT}>{sub}</T>
            </View>
            <Switch on={s.prefs[k]} goldKnob />
          </Row>
        ))}
      </Card>
    </View>
  );
}
