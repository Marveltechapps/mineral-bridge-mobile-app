import React from 'react';
import { View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import { LabeledField } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';

type K = keyof NonNullable<AppState['edit']>;
const FIELDS: [K, string, KeyboardTypeOptions?][] = [['name', 'FULL NAME'], ['business', 'BUSINESS NAME'], ['phone', 'MOBILE', 'phone-pad'], ['email', 'EMAIL', 'email-address'], ['country', 'COUNTRY']];

export function EditProfileScreen() {
  const store = useStore(), s = store.state, ed = s.edit || { name: '', business: '', email: '', phone: '', country: '' }, ee = s.editErr || {};
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ gap: 12 }}>
        {FIELDS.map(([k, l, kb]) => (
          <LabeledField key={k} label={l} value={ed[k] || ''} err={ee[k]} keyboard={kb}
            onChangeText={t => store.setState(x => ({ edit: { ...(x.edit || { name: '', business: '', email: '', phone: '', country: '' }), [k]: t }, editErr: {} }))} />
        ))}
      </View>
    </FadeUp>
  );
}
