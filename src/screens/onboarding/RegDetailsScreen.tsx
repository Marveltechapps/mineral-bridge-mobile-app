import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { Ic, T } from '../../components/mb/base';
import { Alert, Check, FLabel, Input } from '../../components/mb/kit';
import { D } from '../../theme';

/** Registration step 2 (`scr_regDetails`). */
export function RegDetailsScreen() {
  const store = useStore(), s = store.state, r = s.reg, a = s.auth;
  const setR = (p: Partial<AppState['reg']>) => store.setState(x => ({ reg: { ...x.reg, ...p }, regErr: '' }));
  const biz = store.isBusiness(r);
  const contact = (a.method === 'email' ? 'Email · ' + (a.value || '—') : 'WhatsApp · ' + (a.cc || '+234') + ' ' + a.value.trim().replace(/^0+/, '')) + ' · verified';
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 22 }}>
      <T s={24} w={800} ls={-0.02}>{biz ? 'Your business details' : 'Your details'}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: D.TINT, borderWidth: 1, borderColor: D.BOR }}>
        <Ic name="shield" s={16} c={D.G} />
        <T s={12.5} w={700} c={D.GD} style={{ flexShrink: 1 }}>{contact}</T>
      </View>
      <FLabel t={biz ? 'Business or trading name' : 'Trading name (optional)'} mt={20} />
      <Input accessibilityLabel="Business name" value={r.business} onChangeText={t => setR({ business: t })} placeholder={biz ? 'Kestrel Metals Ltd' : 'Leave blank if you trade as an individual'} />
      <FLabel t="Country" />
      <Input accessibilityLabel="Country" value={r.country} onChangeText={t => setR({ country: t })} />
      <Check on={r.terms} text="I accept the Mineral Bridge terms of use and privacy policy." onPress={() => setR({ terms: !r.terms })} />
      <Alert msg={s.regErr} />
    </View>
  );
}
