import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  DashedBox,
  Grid,
  IconTile,
  Photo,
  QtyStepper,
  SectionLabel,
  SuccessNote,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useQuantity } from '../../lib/hooks/useQuantity';
import { go } from '../../navigation/flow';
import { setAppState, useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';

/** C2 · Your mineral — photos, quantity and type feed the instant estimate. */
export function SellListScreen() {
  const nudge = useApp(s => s.nudge);
  const q = useQuantity();
  return (
    <ScreenContainer screen="qList" contentStyle={styles.content}>
      {nudge ? (
        <View style={styles.nudge}>
          <IconTile
            size={40}
            radius={10}
            bgColor="rgba(247,221,142,0.18)"
            color="#f3d27a"
            name="playOutline"
            iconSize={19}
          />
          <View style={styles.flex}>
            <Text style={styles.nudgeTitle} leading={1.35}>
              New to selling?
            </Text>
            <PressableScale
              onPress={() => go('lPlayer')}
              style={styles.start}
              accessibilityRole="link"
            >
              <Text style={styles.nudgeLink}>Watch a 2-minute intro</Text>
            </PressableScale>
          </View>
          <PressableScale
            onPress={() => setAppState({ nudge: false })}
            accessibilityLabel="Dismiss"
            hitSlop={8}
          >
            <Icon name="close" size={17} color="#8f9dcd" strokeWidth={2.5} />
          </PressableScale>
        </View>
      ) : null}
      <Text style={styles.title}>Tell us what you have</Text>
      <Text style={styles.sub} leading={1.5}>
        Three things and we can price it. Our evaluator confirms the rest in
        person.
      </Text>

      <SectionLabel style={styles.label20}>PHOTOS · 3 OF 3 ADDED</SectionLabel>
      <Grid columns={3} gap={10}>
        <Photo name="gold-dust" style={styles.photo} imageStyle={styles.r11}>
          <View style={styles.remove}>
            <Icon name="close" size={11} color="#fff" strokeWidth={3} />
          </View>
        </Photo>
        <Photo name="grain-shot" style={styles.photo} />
        <Photo name="gold-concentrate" style={styles.photo} />
      </Grid>
      <DashedBox style={styles.add}>
        <Icon name="upload" size={20} color="#1e2a5a" />
        <Text style={styles.addText}>Add another photo</Text>
      </DashedBox>

      <SectionLabel style={styles.label22}>QUANTITY</SectionLabel>
      <QtyStepper
        qty={q.qty}
        qtyText={q.qtyText}
        unit={q.unit}
        unitLabel={q.unitLabel}
        onDec={q.dec}
        onInc={q.inc}
        onUnit={q.setUnit}
        onChangeText={q.setText}
      />

      <SectionLabel style={styles.label22}>MINERAL TYPE</SectionLabel>
      <View style={styles.select}>
        <Photo name="gold-dust" style={styles.thumb} />
        <View style={styles.flex}>
          <Text style={styles.selectTitle}>Gold Dust · unrefined</Text>
          <Text style={styles.selectSub}>Tap to change</Text>
        </View>
        <Icon name="chevronDown" size={18} color="#8890ad" />
      </View>
      <SuccessNote center leading={1.45} style={styles.note}>
        No paperwork at this stage, and no obligation to accept our price.
      </SuccessNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 26 },
  flex: { flex: 1 },
  r11: { borderRadius: 11 },
  nudge: {
    experimental_backgroundImage: gradients.navyCard,
    borderRadius: 13,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    boxShadow: '0 10px 24px rgba(20,29,64,0.24)',
  },
  nudgeTitle: { fontSize: 13.5, fontWeight: '600', color: '#fff' },
  start: { alignSelf: 'flex-start', marginTop: 2 },
  nudgeLink: { fontSize: 12.5, color: '#f3d27a', fontWeight: '700' },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f36',
    letterSpacing: -0.4,
    marginTop: 18,
  },
  sub: { fontSize: 13.5, color: '#6b7290', marginTop: 6 },
  label20: { marginTop: 20, marginBottom: 8 },
  label22: { marginTop: 22, marginBottom: 8 },
  photo: { height: 86, borderRadius: 11, overflow: 'hidden' },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(14,20,48,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    marginTop: 10,
    height: 76,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addText: { fontSize: 12.5, fontWeight: '700', color: '#6b7290' },
  select: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: shadows.hairline,
  },
  thumb: { width: 40, height: 40, borderRadius: 9 },
  selectTitle: { fontSize: 14.5, fontWeight: '600', color: '#1a1f36' },
  selectSub: { fontSize: 12, color: '#8890ad', marginTop: 2 },
  note: { marginTop: 16 },
});
