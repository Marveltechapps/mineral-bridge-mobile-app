import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { DemoBox, RefPill, SoftBtn, SuccessBadge } from '../../components/ui/Blocks';
import { IC } from '../../components/ui/Icon';
import { FadeUp } from '../../components/ui/Motion';
import { Txt } from '../../components/ui/Txt';
import { colors as c } from '../../theme';
import { kycDemo } from './kycDemo';

export function KycDoneScreen() {
  const store = useStore(), s = store.state;
  const demo = kycDemo(store);
  return (
    <FadeUp style={{ paddingTop: 40, paddingHorizontal: 22, paddingBottom: 24 }}>
      <SuccessBadge d={IC.clock} sw={2.4} />
      <Txt serif s={32} lh={1.05} ls={-0.3} center style={{ marginTop: 22 }}>KYC submitted for review</Txt>
      <Txt s={14} c={c.muted} lh={1.5} center style={{ marginTop: 10 }}>Most reviews finish within one working day. {s.returnTo ? 'When approved, you can continue where you left off.' : 'We will notify you by email, SMS and WhatsApp when it is approved.'}</Txt>
      <RefPill k="REF" v={(s.user || { kycRef: '' }).kycRef || ''} />
      {__DEV__ ? <DemoBox title="DEV ONLY · LOCAL KYC DECISION (NOT SENT TO THE SERVER)" r={16} pad={14} style={{ marginTop: 22 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <SoftBtn label="Approve" bg={c.greenBg} fg={c.green} onPress={demo.approve} style={{ flex: 1 }} />
          <SoftBtn label="Ask for document" bg={c.redBg} fg={c.red} onPress={demo.reject} style={{ flex: 1 }} />
        </View>
      </DemoBox> : null}
    </FadeUp>
  );
}
