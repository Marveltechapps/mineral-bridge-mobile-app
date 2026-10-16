import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  DashedBox,
  FieldBox,
  IconTile,
  Pill,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';

const FIELDS = [
  { label: 'FACILITY NAME', value: 'Ilesha Consolidated Minerals Ltd.' },
  { label: 'STREET ADDRESS', value: 'Plot 7, Ijebu-Jesa Industrial Way' },
  { label: 'CITY', value: 'Ilesha' },
  { label: 'STATE / REGION', value: 'Osun State' },
  { label: 'CONTACT PERSON', value: 'Tunde Balogun' },
  { label: 'CONTACT PHONE', value: '+234 703 118 2260' },
];

/** C9 · Bulk intake 2 — facility, export permit, compliance and proof of address. */
export function BulkStep2Screen() {
  const ack = useApp(s => s.ack);
  const tone = ack ? '#16a34a' : '#c9cdd8';
  return (
    <ScreenContainer screen="iStep2" contentStyle={styles.content}>
      <Text style={styles.title}>Where is this lot held?</Text>
      <View style={styles.fields}>
        {FIELDS.map(f => (
          <FieldBox key={f.label} label={f.label} value={f.value} />
        ))}
        <FieldBox
          label="EXPORT PERMIT NUMBER"
          value="NG-EXP-2026-11204"
          labelAccessory={
            <Pill
              label="REQUIRED"
              bgColor="#fbf3e4"
              border="#eddfc0"
              fg="#a1620b"
              spacing={0.5}
              padH={7}
            />
          }
        />
      </View>

      <PressableScale
        onPress={() => setAppState(p => ({ ack: !p.ack }))}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: ack }}
        style={[styles.ack, { borderColor: tone }]}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: tone,
              backgroundColor: ack ? '#16a34a' : 'transparent',
            },
          ]}
        >
          <Icon name="check" size={14} color="#fff" strokeWidth={3.5} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.ackTitle} leading={1.35}>
            Regulatory acknowledgment
          </Text>
          <Text style={styles.ackText} leading={1.5}>
            I confirm this lot is conflict-free, sourced under a valid lease,
            and that mining royalties have been remitted. Mineral Bridge may
            share these documents with regulators.
          </Text>
        </View>
      </PressableScale>

      <SectionLabel style={styles.label}>PROOF OF ADDRESS</SectionLabel>
      <DashedBox style={styles.upload}>
        <IconTile
          size={44}
          radius={11}
          bgColor="#f0f2f6"
          color="#1e2a5a"
          name="upload"
          iconSize={21}
        />
        <Text style={styles.uploadTitle}>Upload a utility bill or lease</Text>
        <Text style={styles.uploadSub}>PDF or JPG · up to 10 MB</Text>
      </DashedBox>
      <View style={styles.file}>
        <View style={styles.fileIcon}>
          <Icon name="doc" size={17} color="#15803d" strokeWidth={2.4} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.fileName}>eko-utility-aug2026.pdf</Text>
          <Text style={styles.fileMeta}>1.4 MB · uploaded</Text>
        </View>
        <Icon name="close" size={16} color="#b9c0d6" strokeWidth={2.5} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 26 },
  flex: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
  },
  fields: { marginTop: 18, gap: 15 },
  ack: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 13,
    padding: 16,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    boxShadow: shadows.xs,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackTitle: { fontSize: 14, fontWeight: '600', color: '#1a1f36' },
  ackText: { fontSize: 12.5, color: '#6b7290', marginTop: 5 },
  label: { marginTop: 22, marginBottom: 9 },
  upload: { borderRadius: 13, padding: 24, alignItems: 'center', gap: 7 },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 3,
  },
  uploadSub: { fontSize: 12, color: '#8890ad' },
  file: {
    marginTop: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  fileIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#edf7f1',
    borderWidth: 1,
    borderColor: '#cfe7d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontSize: 13, fontWeight: '600', color: '#1a1f36' },
  fileMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 2 },
});
