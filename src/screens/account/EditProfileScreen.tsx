import React, { useState } from 'react';
import { View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { useStore } from '../../context/AppStore';
import type { AppState } from '../../context/state';
import type { OtpChannel } from '../../api/types';
import { Chips, Field, FieldErr, InfoBox, LabeledField, SoftBtn } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';

type K = keyof NonNullable<AppState['edit']>;
const FIELDS: [K, string, KeyboardTypeOptions?][] = [['name', 'FULL NAME'], ['business', 'BUSINESS NAME'], ['phone', 'MOBILE', 'phone-pad'], ['email', 'EMAIL', 'email-address'], ['country', 'COUNTRY']];
const PHONE_CHANNELS: [string, OtpChannel][] = [['WhatsApp', 'whatsapp'], ['SMS', 'sms']];

export function EditProfileScreen() {
  const store = useStore(), s = store.state, ed = s.edit || { name: '', business: '', email: '', phone: '', country: '' }, ee = s.editErr || {};
  // Phone / email are verified contacts: "Change" opens a new-value box that sends a code (contact-change flow).
  const [changing, setChanging] = useState<'' | 'phone' | 'email'>('');
  const [next, setNext] = useState('');
  const [channel, setChannel] = useState<OtpChannel>('whatsapp');
  const begin = (k: 'phone' | 'email') => { setChanging(k); setNext(''); setChannel(k === 'email' ? 'email' : 'whatsapp'); store.setState({ editErr: {} }); };
  const cancel = () => { setChanging(''); setNext(''); store.setState({ editErr: {} }); };
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ gap: 12 }}>
        {FIELDS.map(([k, l, kb]) => {
          const contact = k === 'phone' || k === 'email';
          if (!contact) {
            return (
              <LabeledField key={k} label={l} value={ed[k] || ''} err={ee[k]} keyboard={kb}
                onChangeText={t => store.setState(x => ({ edit: { ...(x.edit || { name: '', business: '', email: '', phone: '', country: '' }), [k]: t }, editErr: {} }))} />
            );
          }
          const open = changing === k;
          return (
            <View key={k}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: 5 }}>
                <Label s={9.5}>{open ? 'NEW ' + l : l + ' (VERIFIED)'}</Label>
                {!open ? (
                  <Tap label={'Change ' + (k === 'phone' ? 'mobile number' : 'email')} onPress={() => begin(k)} disabled={s.contactBusy} style={{ paddingVertical: 2, paddingHorizontal: 4 }}>
                    <Txt s={12.5} w={600} c={c.goldInk}>Change</Txt>
                  </Tap>
                ) : null}
              </View>
              {open ? (
                <>
                  {k === 'phone' ? <View style={{ marginBottom: 8 }}><Chips list={PHONE_CHANNELS.map(x => x[0])} value={(PHONE_CHANNELS.find(x => x[1] === channel) || PHONE_CHANNELS[0])[0]} onPick={v => setChannel((PHONE_CHANNELS.find(x => x[0] === v) || PHONE_CHANNELS[0])[1])} /></View> : null}
                  <Field accessibilityLabel={'New ' + l} value={next} onChangeText={t => { setNext(t); if (ee[k]) store.setState({ editErr: {} }); }} err={!!ee[k]} keyboard={kb} autoCapitalize="none" autoFocus
                    placeholder={k === 'email' ? 'name@example.com' : (s.auth.cc || '+234') + ' 803 412 7790'} />
                  {ee[k] ? <FieldErr>{ee[k]}</FieldErr> : null}
                  <InfoBox mt={8}>We will send a 4-digit code to the new {k === 'email' ? 'email' : 'number'}. Your current one stays active until you verify it.</InfoBox>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <SoftBtn label={s.contactBusy ? 'Sending…' : 'Send verification code'} bg={c.ink} fg={c.paper} style={{ flex: 1 }} onPress={() => store.startContactChange(k, k === 'email' ? 'email' : channel, next)} />
                    <SoftBtn label="Cancel" onPress={cancel} style={{ paddingHorizontal: 18 }} />
                  </View>
                </>
              ) : (
                <ReadOnlyField label={l} value={ed[k] || ''} kb={kb} />
              )}
            </View>
          );
        })}
      </View>
    </FadeUp>
  );
}

/** Read-only value without a second label (the row above already shows the label + Change). */
function ReadOnlyField({ label, value, kb }: { label: string; value: string; kb?: KeyboardTypeOptions }) {
  return <Field accessibilityLabel={label} editable={false} value={value} onChangeText={() => undefined} keyboard={kb} placeholder="Not set" />;
}
