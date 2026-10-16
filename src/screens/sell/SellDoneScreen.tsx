import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  RefPill,
  SuccessHero,
  SuccessNote,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useApp } from '../../context/appStore';
import { gradients, shadows } from '../../theme';
import { shrink } from '../../utils/style';
import { doneStyles } from '../buyer/OrderDoneScreen';

/** C6 · Evaluation booked — reassurance; the offer follows the evaluation. */
export function SellDoneScreen() {
  const visit = useApp(s => 'Sat ' + s.day + ' Sep · ' + s.slot);
  return (
    <ScreenContainer screen="qDone" contentStyle={doneStyles.content}>
      <SuccessHero />
      <Text style={doneStyles.title}>Evaluation booked</Text>
      <Text style={doneStyles.sub} leading={1.55}>
        Our evaluator will meet you at Ilesha Lease Site 4. You get a firm offer
        the same day.
      </Text>
      <View style={styles.visit}>
        <IconTile
          size={46}
          radius={11}
          bgColor={gradients.gold}
          color="#3d2c05"
          name="calendar"
          iconSize={22}
          strokeWidth={2.2}
        />
        <View style={shrink}>
          <Text style={styles.visitLabel}>EVALUATION VISIT</Text>
          <Text style={styles.visitValue}>{visit}</Text>
        </View>
      </View>
      <RefPill label="REQUEST ID" value="MB-S-90412" flat style={styles.ref} />
      <SuccessNote style={styles.note}>
        You keep the mineral until you accept our offer. Evaluation is always
        free.
      </SuccessNote>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  visit: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    boxShadow: shadows.cardRaised,
  },
  visitLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#8890ad',
  },
  visitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 3,
  },
  ref: { marginTop: 14 },
  note: { marginTop: 20, padding: 15 },
});
