import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Blip } from '../../components/common/animations';
import { Text } from '../../components/common/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { shadows } from '../../theme';
import { SelfieFrame } from '../../components/kyc/SelfieFrame';

const TIPS = [
  { n: '1', label: 'Look straight at the camera' },
  { n: '2', label: 'Remove hats, masks and sunglasses' },
  { n: '3', label: 'Stay still while the ring completes' },
];

/** K4 · Liveness selfie — animated scan frame and face detection. */
export function KycSelfieScreen() {
  return (
    <ScreenContainer screen="kycSelfie" contentStyle={styles.content}>
      <Text style={styles.title}>Now a quick selfie</Text>
      <Text style={styles.sub} leading={1.5}>
        We match your face to the ID. Nothing is shared with buyers or sellers.
      </Text>
      <SelfieFrame />
      <View style={styles.detected}>
        <Blip style={styles.dot} />
        <Text style={styles.detectedText}>Face detected — hold still</Text>
      </View>
      <View style={styles.tips}>
        {TIPS.map(t => (
          <View key={t.n} style={styles.tip}>
            <View style={styles.num}>
              <Text style={styles.numText}>{t.n}</Text>
            </View>
            <Text style={styles.tipText}>{t.label}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingHorizontal: 22, paddingBottom: 26 },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 7, textAlign: 'center' },
  detected: {
    marginTop: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    boxShadow: shadows.hairline,
  },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#16a34a' },
  detectedText: { fontSize: 12.5, fontWeight: '600', color: '#15803d' },
  tips: { marginTop: 20, gap: 10 },
  tip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    boxShadow: shadows.hairline,
  },
  num: {
    width: 22,
    height: 22,
    borderRadius: 9,
    backgroundColor: '#f0f2f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: '#1e2a5a', fontSize: 11, fontWeight: '700' },
  tipText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: '#4a5170' },
});
