import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { ListCard, Toggle } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

/** Notification channels. At least one channel must stay on. */
export function PrefsScreen() {
  const store = useStore(), s = store.state, u = s.user;
  const rows: [keyof AppState['prefs'], string, string][] = [['email', 'Email', (u && u.email) || 'Add an email in Edit profile'], ['sms', 'SMS', (u && u.phone) || 'Add a mobile number'], ['whatsapp', 'WhatsApp', (u && u.phone) || 'Add a mobile number'], ['push', 'App notifications', 'On this device']];
  const toggle = (k: keyof AppState['prefs']) => {
    const p = s.prefs;
    if (p[k] && Object.values(p).filter(Boolean).length <= 1) return store.flash('Keep at least one channel on');
    store.setState({ prefs: { ...p, [k]: !p[k] } });
  };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <Txt s={13.5} c={c.muted} lh={1.5} style={{ marginHorizontal: 4, marginBottom: 12 }}>Every stage update is sent on the channels you keep on.</Txt>
      <ListCard>
        {rows.map(([k, l, sub]) => (
          <Tap key={k} role="switch" checked={s.prefs[k]} onPress={() => toggle(k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt s={14.5} w={500}>{l}</Txt>
              <Txt s={12} c={c.muted} style={{ marginTop: 1 }}>{sub}</Txt>
            </View>
            <Toggle on={s.prefs[k]} />
          </Tap>
        ))}
      </ListCard>
    </FadeUp>
  );
}
