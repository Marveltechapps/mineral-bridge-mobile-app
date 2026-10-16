import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp } from '../../components/common/animations';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  DashedBox,
  IconTile,
  Pill,
  SectionLabel,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { DOCS } from '../../lib/catalog';
import { flash, go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';
import { ms } from '../../utils/style';

/** P5 · My documents — expiry warning, status pills and upload. */
export function DocumentsScreen() {
  return (
    <ScreenContainer screen="docs" contentStyle={styles.content}>
      <View style={styles.warning}>
        <IconTile
          size={34}
          radius={10}
          bgColor="#f6e6c4"
          color="#a1620b"
          name="clock"
          iconSize={17}
          strokeWidth={2.2}
        />
        <View style={styles.flex}>
          <Text style={styles.warnTitle}>One document expires in 21 days</Text>
          <Text style={styles.warnSub} leading={1.4}>
            Renew your export permit to keep selling in bulk.
          </Text>
        </View>
      </View>
      <SectionLabel style={styles.label}>ON FILE</SectionLabel>
      <View style={styles.list}>
        {DOCS.map((d, i) => (
          <FadeUp key={d.name} duration={500} delay={ms(d.delay)}>
            <PressableScale
              activeScale={0.985}
              onPress={() => {
                setAppState({ docIdx: i });
                go('docDetail');
              }}
              style={styles.doc}
            >
              <IconTile
                size={38}
                radius={11}
                bgColor={d.iconBg}
                color={d.iconFg}
                name="doc"
                iconSize={18}
                strokeWidth={2.1}
              />
              <View style={styles.flex}>
                <Text style={styles.docName}>{d.name}</Text>
                <Text style={styles.docMeta}>{d.meta}</Text>
              </View>
              <Pill
                label={d.status}
                bgColor={d.pillBg}
                border={d.pillBorder}
                fg={d.pillFg}
              />
            </PressableScale>
          </FadeUp>
        ))}
      </View>
      <DashedBox
        onPress={() => flash('Choose a file to upload')}
        pressScale={0.985}
        style={styles.upload}
      >
        <IconTile
          size={42}
          radius={12}
          bgColor="#f1f3f7"
          color="#33406e"
          name="upload"
          iconSize={20}
        />
        <Text style={styles.uploadTitle}>Upload a document</Text>
        <Text style={styles.uploadSub}>PDF or JPG · up to 10 MB</Text>
      </DashedBox>
    </ScreenContainer>
  );
}

/** P5a · Document — preview, metadata, download or remove. */
export function DocumentDetailScreen() {
  const docIdx = useApp(s => s.docIdx);
  const d = DOCS[docIdx];
  return (
    <ScreenContainer screen="docDetail" contentStyle={styles.content}>
      <View style={styles.preview}>
        <View style={styles.previewArea}>
          <View style={styles.paper}>
            <View
              style={[
                styles.line,
                { width: '52%', backgroundColor: '#e2e5ec' },
              ]}
            />
            <View style={[styles.line, { width: '78%' }]} />
            <View style={[styles.line, { width: '66%' }]} />
            <View style={[styles.line, { width: '40%' }]} />
          </View>
          <Pill
            label={d.status}
            bgColor={d.pillBg}
            border={d.pillBorder}
            fg={d.pillFg}
            padV={4}
            padH={9}
            style={styles.status}
          />
        </View>
      </View>
      <Text style={styles.name}>{d.name}</Text>
      <View style={styles.rows}>
        {d.rows.map(r => (
          <View key={r.k} style={styles.row}>
            <SectionLabel>{r.k}</SectionLabel>
            <Text style={[styles.rowValue, { color: r.fg }]}>{r.v}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <PressableScale
          onPress={() => flash('Downloading ' + d.name.toLowerCase())}
          style={[styles.action, styles.download]}
        >
          <Icon name="download" size={16} color="#243258" />
          <Text style={[styles.actionText, { color: '#243258' }]}>
            Download
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => flash('Document removed')}
          style={[styles.action, styles.remove]}
        >
          <Icon name="trash" size={16} color="#c0392b" />
          <Text style={[styles.actionText, { color: '#c0392b' }]}>Remove</Text>
        </PressableScale>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 26 },
  flex: { flex: 1 },
  warning: {
    backgroundColor: '#fbf3e4',
    borderWidth: 1,
    borderColor: '#eddfc0',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
  },
  warnTitle: { fontSize: 13, fontWeight: '600', color: '#8a5a09' },
  warnSub: { fontSize: 11.5, color: '#a1620b', marginTop: 2 },
  label: { marginTop: 20, marginHorizontal: 2, marginBottom: 10 },
  list: { gap: 11 },
  doc: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    boxShadow: shadows.xs,
  },
  docName: { fontSize: 13.5, fontWeight: '600', color: '#1a1f36' },
  docMeta: { fontSize: 11.5, color: '#8890ad', marginTop: 3 },
  upload: {
    marginTop: 12,
    borderRadius: 13,
    padding: 22,
    alignItems: 'center',
    gap: 6,
  },
  uploadTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 3,
  },
  uploadSub: { fontSize: 11.5, color: '#8890ad' },
  preview: {
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    backgroundColor: '#fff',
    boxShadow: shadows.xs,
  },
  previewArea: {
    height: 190,
    experimental_backgroundImage: 'linear-gradient(150deg,#f1f3f7,#e2e5ec)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: '64%',
    height: '78%',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe2e9',
    boxShadow: '0 1px 3px rgba(16,24,40,0.10)',
    gap: 7,
    padding: 16,
  },
  line: { height: 7, borderRadius: 4, backgroundColor: '#eceef2' },
  status: { position: 'absolute', top: 12, right: 12 },
  name: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  rows: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 15,
    boxShadow: shadows.xs,
  },
  row: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  download: { borderColor: '#d8dce5' },
  remove: { borderColor: '#f3d4d4' },
  actionText: { fontSize: 13.5, fontWeight: '600' },
});
