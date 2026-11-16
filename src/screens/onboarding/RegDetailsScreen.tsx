import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { CheckRow, ErrBox, Field } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

export function RegDetailsScreen() {
  const store = useStore(), s = store.state, r = s.reg, a = s.auth;
  const setR = (p: Partial<AppState['reg']>) => store.setState(x => ({ reg: { ...x.reg, ...p }, regErr: '' }));
  const biz = store.isBusiness(r);
  const contact = (a.method === 'email' ? 'Email · ' + (a.value || '—') : 'WhatsApp · ' + (a.cc || '+234') + ' ' + a.value.trim().replace(/^0+/, '')) + ' · verified';
  return (
    <FadeUp style={{ paddingTop: 10, paddingHorizontal: 22, paddingBottom: 24 }}>
      <Txt serif s={32} lh={1.05} ls={-0.3}>{biz ? 'Your business details' : 'Your details'}</Txt>
      <View style={{ marginTop: 14, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.greenBg }}>
        <Txt s={13} w={500} c={c.green}>{contact}</Txt>
      </View>
      <Label style={{ marginTop: 18, marginHorizontal: 2, marginBottom: 8 }}>{biz ? 'BUSINESS OR TRADING NAME' : 'TRADING NAME (OPTIONAL)'}</Label>
      <Field accessibilityLabel="Business name" value={r.business} onChangeText={t => setR({ business: t })} placeholder={biz ? 'Kestrel Metals Ltd' : 'Leave blank if you trade as an individual'} />
      <Label style={{ marginTop: 18, marginHorizontal: 2, marginBottom: 8 }}>COUNTRY</Label>
      <Field accessibilityLabel="Country" value={r.country} onChangeText={t => setR({ country: t })} />
      <View style={{ marginTop: 16 }}>
        <CheckRow on={r.terms} onPress={() => setR({ terms: !r.terms })}>I accept the Mineral Bridge terms of use and privacy policy.</CheckRow>
      </View>
      {s.regErr ? <ErrBox>{s.regErr}</ErrBox> : null}
    </FadeUp>
  );
}
