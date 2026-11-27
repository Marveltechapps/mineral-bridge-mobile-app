import React from 'react';
import { View } from 'react-native';
import { useStore } from '../../context/AppStore';
import { KYC_INFO } from '../../context/store';
import { T } from '../../components/mb/base';
import { Btn, Card, DemoBox, IconTile, Note, Press, Row, Section } from '../../components/mb/kit';
import * as MB from '../../lib/mb4';
import { D } from '../../theme';
import type { KycDocId } from '../../types/mineralBridge';
import { kycDemo } from '../onboarding/kycDemo';
import { NavyCard } from '../orders/OrderTrackingScreen';
import { kycWordOf } from './ProfileScreen';

/** KYC & documents (`scr_kycStatus`). "Start verification" is the screen CTA when nothing was submitted. */
export function KycStatusScreen() {
  const store = useStore(), s = store.state, u = s.user, k = s.kyc;
  const demo = kycDemo(store);
  const ids = (['front', 'back', 'selfie', 'address', 'biz'] as KycDocId[]).filter(id => id !== 'back' || k.idType !== 'Passport').filter(id => id !== 'biz' || store.bizDocNeeded());
  const editable = !!u && (u.kyc === 'rejected' || u.kyc === 'none');
  const base = u && u.kyc === 'verified' ? 'Verified' : u && u.kyc === 'pending' ? 'Received' : '';
  const dot = u && u.kyc === 'verified' ? '#4ADE80' : u && u.kyc === 'pending' ? D.GOLD : '#F87171';
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: u && u.kyc === 'none' ? 0 : 24 }}>
      <NavyCard>
        <T s={11.5} w={800} c={D.GOLD}>{u ? u.kycRef || '—' : '—'}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <T s={20} w={800} c={D.white}>{u ? kycWordOf(u.kyc) : ''}</T>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} />
        </View>
        <T s={12} w={600} c={D.navyFaint} style={{ marginTop: 4 }}>{'Submitted ' + (u && u.kycAt ? MB.fmt(u.kycAt) : '—')}</T>
      </NavyCard>
      {u && u.kyc === 'rejected' ? (
        <>
          <View accessibilityRole="alert" style={{ marginTop: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13, backgroundColor: D.dangerBg }}>
            <T s={12.5} w={600} c={D.DANGER} lh={1.45}><T s={12.5} w={700} c={D.DANGER}>Action needed. </T>{u.kycReason || 'Compliance asked you to re-upload documents. Replace them and resubmit.'}</T>
          </View>
          <View style={{ marginTop: 8 }}><Btn label="Upload a new document" size="sm" onPress={() => store.go('kyc')} /></View>
        </>
      ) : null}
      {u && u.kyc === 'none' ? <Note mt={12}>You can browse now. Verification is needed before you buy or sell.</Note> : null}
      <Section t="Documents" />
      <Card>
        {ids.map((id, i) => {
          const f = k[id], fl = store.kycFlag(id), done = !!(u && u.kycFlags && u.kycFlags[id]) && !fl;
          const n = id === 'front' ? (k.idType === 'Passport' ? 'Passport photo page' : k.idType + ' · front') : id === 'back' ? k.idType + ' · back' : KYC_INFO[id].title;
          const v = fl ? 'Re-upload requested' : done ? 'Replaced · ready to resubmit' : f ? (base || 'Uploaded') + ' · ' + f.name : base || 'Not uploaded';
          const fg = fl ? D.DANGER : done || base === 'Verified' ? D.green : (f || base) ? D.INK : D.MUT;
          return (
            <Row key={id} last={i === ids.length - 1} pv={12}>
              <IconTile icon={KYC_INFO[id].icon} c={D.GD} s={17} w={1.8} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T s={13.5} w={800}>{n}</T>
                <T s={11.5} w={700} c={fg} lines={1} style={{ marginTop: 1 }}>{v}</T>
                {fl ? <T s={11.5} w={600} c={D.DANGER} lh={1.35} style={{ marginTop: 2 }}>{fl}</T> : null}
              </View>
              {editable || fl ? (
                <Press onPress={() => store.go('kycDoc', { kycDocId: id, kycDocErr: '' })} style={{ paddingVertical: 7, paddingHorizontal: 11, borderRadius: 10, backgroundColor: fl ? D.G : D.white, borderWidth: 1, borderColor: fl ? D.G : D.BOR }}>
                  <T s={12} w={800} c={fl ? D.GOLD : D.INK}>{fl ? 'Re-upload' : f ? 'Replace' : 'Upload'}</T>
                </Press>
              ) : null}
            </Row>
          );
        })}
      </Card>
      {__DEV__ && u && u.kyc === 'pending' ? (
        <DemoBox title="DEMO · SIMULATE COMPLIANCE DECISION" style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Btn label="Approve" kind="subtle" size="sm" onPress={demo.approve} /></View>
            <View style={{ flex: 1 }}><Btn label="Ask for document" kind="danger" size="sm" onPress={demo.reject} /></View>
          </View>
        </DemoBox>
      ) : null}
    </View>
  );
}
