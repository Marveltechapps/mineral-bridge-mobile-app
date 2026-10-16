import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pop, ease } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { Text } from '../../components/common/Text';
import {
  CheckBadge,
  DashedBox,
  IconTile,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ID_TYPES } from '../../lib/catalog';
import { flash } from '../../navigation/flow';
import { useApp } from '../../context/appStore';

const TIPS = [
  'All four corners inside the frame',
  'No flash glare across the photo page',
  'Text sharp enough to read',
];

/** K3 · Document capture — front captured, back still to shoot. */
export function KycDocScreen() {
  const idShort = useApp(s => ID_TYPES[s.idType].label);
  return (
    <ScreenContainer screen="kycDoc" contentStyle={styles.content}>
      <Text style={styles.title}>{'Photograph your ' + idShort}</Text>
      <Text style={styles.sub} leading={1.5}>
        Lay it flat, fill the frame, avoid glare.
      </Text>
      <SectionLabel style={styles.label}>FRONT SIDE</SectionLabel>
      <View style={styles.capture}>
        <View style={styles.preview}>
          <View style={styles.frame} />
          <Pop duration={350} easing={ease.out} style={styles.captured}>
            <Icon name="check" size={10} color="#fff" strokeWidth={3.5} />
            <Text style={styles.capturedText}>CAPTURED</Text>
          </Pop>
        </View>
        <View style={styles.file}>
          <Text style={styles.fileName}>nin-front.jpg</Text>
          <Text style={styles.retake}>Retake</Text>
        </View>
      </View>
      <SectionLabel style={styles.label}>BACK SIDE</SectionLabel>
      <DashedBox
        onPress={() => flash('Back side captured')}
        style={styles.shoot}
      >
        <IconTile
          size={46}
          radius={11}
          bgColor="#1e2a5a"
          color="#fff"
          name="camera"
          iconSize={22}
        />
        <Text style={styles.shootTitle}>Take a photo</Text>
        <Text style={styles.shootSub}>or upload from your gallery</Text>
      </DashedBox>
      <View style={styles.tips}>
        {TIPS.map(t => (
          <View key={t} style={styles.tip}>
            <CheckBadge size={20} radius={8} iconSize={11} variant="soft" />
            <Text style={styles.tipText}>{t}</Text>
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
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 7 },
  label: { marginTop: 20, marginBottom: 9 },
  capture: {
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
  },
  preview: {
    height: 132,
    experimental_backgroundImage: 'linear-gradient(135deg,#f0f2f6,#dfe5f5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '78%',
    height: '74%',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(30,42,90,0.32)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  captured: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capturedText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  file: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1a1f36' },
  retake: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  shoot: { borderRadius: 13, padding: 26, alignItems: 'center', gap: 7 },
  shootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 3,
  },
  shootSub: { fontSize: 12, color: '#8890ad' },
  tips: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: '#4a5170' },
});
