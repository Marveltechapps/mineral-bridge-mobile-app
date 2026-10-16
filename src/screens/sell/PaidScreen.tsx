import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientText } from '../../components/common/GradientText';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import {
  IconTile,
  RefPill,
  SectionLabel,
  SuccessHero,
} from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { flash } from '../../navigation/flow';
import { gradients, shadows } from '../../theme';
import { doneStyles } from '../buyer/OrderDoneScreen';
import { useEstimate } from '../../lib/hooks/useEstimate';

const DOCS = ['Sale agreement', 'Assay certificate', 'Payment advice'];

/** C9 · Sold and paid — title transferred, payment scheduled, documents ready. */
export function PaidScreen() {
  const { offer } = useEstimate();
  return (
    <ScreenContainer screen="sPaid" contentStyle={doneStyles.content}>
      <SuccessHero />
      <Text style={doneStyles.title}>Sold to Mineral Bridge</Text>
      <Text style={doneStyles.sub} leading={1.55}>
        Title has transferred and your payment is on its way.
      </Text>
      <View style={styles.paying}>
        <Text style={styles.kicker}>PAYING YOU</Text>
        <GradientText
          block
          style={styles.amount}
          containerStyle={styles.amountBox}
        >
          {offer}
        </GradientText>
        <View style={styles.eta}>
          <Icon name="clock" size={14} color="#86efac" strokeWidth={2.2} />
          <Text style={styles.etaText}>
            Arrives at GTBank ••4471 within 24 hours
          </Text>
        </View>
      </View>
      <RefPill
        label="SALE REF"
        value="MB-S-90412"
        labelStyle={styles.refLabel}
        style={styles.ref}
      />
      <View style={styles.docs}>
        <SectionLabel style={styles.docsLabel}>YOUR DOCUMENTS</SectionLabel>
        {DOCS.map(name => (
          <PressableScale
            key={name}
            activeScale={0.985}
            onPress={() => flash('Downloading ' + name.toLowerCase())}
            style={styles.doc}
          >
            <IconTile
              size={32}
              radius={10}
              bgColor="#f1f3f7"
              color="#33406e"
              name="doc"
              iconSize={15}
              strokeWidth={2.2}
            />
            <Text style={styles.docName}>{name}</Text>
            <Icon name="download" size={16} color="#b9c0d6" />
          </PressableScale>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  paying: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    experimental_backgroundImage: gradients.navyCard,
    padding: 20,
    boxShadow: shadows.hero,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#a9b5dd',
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center',
  },
  amountBox: { marginTop: 6 },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  etaText: { fontSize: 12, fontWeight: '600', color: '#86efac' },
  refLabel: { fontSize: 10.5, letterSpacing: 0.5, color: '#7b839c' },
  ref: { marginTop: 16 },
  docs: {
    marginTop: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 13,
    padding: 17,
    boxShadow: shadows.xs,
  },
  docsLabel: { marginBottom: 14 },
  doc: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  docName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1a1f36' },
});
