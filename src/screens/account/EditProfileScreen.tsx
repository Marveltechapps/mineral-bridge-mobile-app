import React, { useState } from 'react';
import { View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import type { OtpChannel } from '../../api/types';
import { T } from '../../components/mb/base';
import { Btn, Chips, Field, FieldErr, FLabel, Input, Note, Press } from '../../components/mb/kit';
import { D } from '../../theme';

type K = keyof NonNullable<AppState['edit']>;
const FIELDS: [K, string, KeyboardTypeOptions?][] = [['name', 'Full name'], ['business', 'Business name'], ['phone', 'Mobile', 'phone-pad'], ['email', 'Email', 'email-address'], ['country', 'Country']];
const PHONE_CHANNELS: [string, OtpChannel][] = [['WhatsApp', 'whatsapp'], ['SMS', 'sms']];
const EMPTY = { name: '', business: '', email: '', phone: '', country: '' };

/** Edit profile (`scr_editProfile`). Mobile and email are verified contacts: "Change" sends a code to the new value. */
export function EditProfileScreen() {
  const store = useStore(), s = store.state, ed = s.edit || EMPTY, ee = s.editErr || {};
  const [changing, setChanging] = useState<'' | 'phone' | 'email'>('');
  const [next, setNext] = useState('');
  const [channel, setChannel] = useState<OtpChannel>('whatsapp');
  const begin = (k: 'phone' | 'email') => { setChanging(k); setNext(''); setChannel(k === 'email' ? 'email' : 'whatsapp'); store.setState({ editErr: {} }); };
  const cancel = () => { setChanging(''); setNext(''); store.setState({ editErr: {} }); };
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
      <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 6 }}>
        <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: D.G, alignItems: 'center', justifyContent: 'center' }}><T s={26} w={800} c={D.GOLD}>{(String(ed.name || 'M').trim()[0] || 'M').toUpperCase()}</T></View>
      </View>
      {FIELDS.map(([k, l, kb]) => {
        if (k !== 'phone' && k !== 'email') {
          return <Field key={k} label={l} value={ed[k] || ''} err={ee[k]} keyboard={kb} onChange={t => store.setState(x => ({ edit: { ...(x.edit || EMPTY), [k]: t }, editErr: {} }))} />;
        }
        const open = changing === k;
        return (
          <View key={k}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <FLabel t={open ? 'New ' + l.toLowerCase() : l + ' (verified)'} mt={12} />
              {!open ? <Press label={'Change ' + (k === 'phone' ? 'mobile number' : 'email')} disabled={s.contactBusy} onPress={() => begin(k)} style={{ marginTop: 12, marginBottom: 7 }}><T s={12.5} w={800} c={D.GD}>Change</T></Press> : null}
            </View>
            {open ? (
              <>
                {k === 'phone' ? <View style={{ marginBottom: 8 }}><Chips list={PHONE_CHANNELS.map(x => x[0])} value={(PHONE_CHANNELS.find(x => x[1] === channel) || PHONE_CHANNELS[0])[0]} onPick={v => setChannel((PHONE_CHANNELS.find(x => x[0] === v) || PHONE_CHANNELS[0])[1])} /></View> : null}
                <Input accessibilityLabel={'New ' + l} value={next} err={!!ee[k]} keyboard={kb} autoCapitalize="none" autoFocus
                  placeholder={k === 'email' ? 'name@example.com' : (s.auth.cc || '+234') + ' 803 412 7790'} onChangeText={t => { setNext(t); if (ee[k]) store.setState({ editErr: {} }); }} />
                <FieldErr msg={ee[k]} />
                <Note mt={8}>{'We will send a 4-digit code to the new ' + (k === 'email' ? 'email' : 'number') + '. Your current one stays active until you verify it.'}</Note>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1 }}><Btn label={s.contactBusy ? 'Sending…' : 'Send verification code'} size="sm" disabled={s.contactBusy} onPress={() => store.startContactChange(k, k === 'email' ? 'email' : channel, next)} /></View>
                  <Btn label="Cancel" size="sm" kind="ghost" full={false} onPress={cancel} />
                </View>
              </>
            ) : <Input accessibilityLabel={l} editable={false} value={ed[k] || ''} placeholder="Not set" keyboard={kb} style={{ color: D.MUT }} />}
          </View>
        );
      })}
    </View>
  );
}
