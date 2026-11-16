import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import { DemoBox, ListCard, SoftBtn } from '../../components/ui/Blocks';
import { FadeUp } from '../../components/ui/Motion';
import { Tap } from '../../components/ui/Tap';
import { Label, Txt } from '../../components/ui/Txt';
import * as MB from '../../lib/mb4';
import { colors as c } from '../../theme';
import type { KycDocId } from '../../types/mineralBridge';
import { kycDemo } from '../onboarding/kycDemo';
import { kycWordOf } from './ProfileScreen';

export function KycStatusScreen() {
  const store = useStore(), s = store.state, u = s.user, k = s.kyc;
  const demo = kycDemo(store);
  const ids = (['front', 'back', 'selfie', 'address', 'biz'] as KycDocId[]).filter(id => id !== 'back' || k.idType !== 'Passport').filter(id => id !== 'biz' || store.bizDocNeeded());
  const editable = !!u && (u.kyc === 'rejected' || u.kyc === 'none');
  const base = u && u.kyc === 'verified' ? 'Verified' : u && u.kyc === 'pending' ? 'Received' : '';
  return (
    <FadeUp style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ padding: 18, borderRadius: 22, backgroundColor: c.ink }}>
        <Label c={c.faint}>{u ? u.kycRef || '—' : ''}</Label>
        <Txt serif s={28} c={c.paper} style={{ marginTop: 6 }}>{u ? kycWordOf(u.kyc) : ''}</Txt>
        <Txt s={12.5} c={c.soft} style={{ marginTop: 4 }}>Submitted {u && u.kycAt ? MB.fmt(u.kycAt) : '14 Oct 2026'}</Txt>
      </View>
      {u && u.kyc === 'rejected' ? (
        <>
          <View accessibilityRole="alert" style={{ marginTop: 12, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.redBg }}>
            <Txt s={13} c={c.red} lh={1.5}><Txt s={13} w={700} c={c.red}>Action needed.</Txt> {u.kycReason || ''}</Txt>
          </View>
          <Tap onPress={() => store.go('kyc')} style={{ marginTop: 8, height: 50, borderRadius: 16, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}><Txt s={14} w={600} c={c.paper}>Upload a new document</Txt></Tap>
        </>
      ) : null}
      {u && u.kyc === 'none' ? <View style={{ marginTop: 12, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, backgroundColor: c.amberBg }}><Txt s={13} c={c.amberInk} lh={1.5}>You can browse now. Verification is needed before you buy or sell.</Txt></View> : null}
      <Label style={{ marginTop: 20, marginHorizontal: 4, marginBottom: 8 }}>DOCUMENTS</Label>
      <ListCard>
        {ids.map(id => {
          const f = k[id], fl = store.kycFlag(id), done = !!(u && u.kycFlags && u.kycFlags[id]) && !fl;
          const n = id === 'front' ? (k.idType === 'Passport' ? 'Passport photo page' : k.idType + ' · front') : id === 'back' ? k.idType + ' · back' : KYC_INFO[id].title;
          const v = fl ? 'Re-upload requested' : done ? 'Replaced · ready to resubmit' : f ? (base || 'Uploaded') + ' · ' + f.name : base || 'Not uploaded';
          const fg = fl ? c.red : done ? c.green : base === 'Verified' ? c.green : (f || base) ? c.ink : c.muted2;
          return (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt s={13.5} c={c.muted}>{n}</Txt>
                <Txt s={13.5} w={600} c={fg} style={{ marginTop: 2 }}>{v}</Txt>
                {fl ? <Txt s={12} c={c.red} lh={1.4} style={{ marginTop: 3 }}>{fl}</Txt> : null}
              </View>
              {editable || fl ? (
                <Tap onPress={() => store.go('kycDoc', { kycDocId: id, kycDocErr: '' })} style={{ height: 34, paddingHorizontal: 13, borderRadius: 11, justifyContent: 'center', backgroundColor: fl ? c.ink : c.white, borderWidth: 1, borderColor: fl ? c.ink : c.line }}>
                  <Txt s={12.5} w={600} c={fl ? c.paper : c.ink}>{fl ? 'Re-upload' : f ? 'Replace' : 'Upload'}</Txt>
                </Tap>
              ) : null}
            </View>
          );
        })}
      </ListCard>
      {u && u.kyc === 'pending' ? (
        <DemoBox title="DEMO · SIMULATE COMPLIANCE DECISION" r={16} pad={14} style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <SoftBtn label="Approve" bg={c.greenBg} fg={c.green} onPress={demo.approve} style={{ flex: 1 }} />
            <SoftBtn label="Ask for document" bg={c.redBg} fg={c.red} onPress={demo.reject} style={{ flex: 1 }} />
          </View>
        </DemoBox>
      ) : null}
    </FadeUp>
  );
}
