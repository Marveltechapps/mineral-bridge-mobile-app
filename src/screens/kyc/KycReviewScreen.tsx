import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { CheckBadge, KeyValueRows } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS, ID_TYPES } from '../../lib/catalog';
import { setAppState, useApp } from '../../context/appStore';
import { shadows } from '../../theme';

/** K5 · KYC review — summary of what will be sent, plus consent. */
export function KycReviewScreen() {
  const { idType, tierIdx, consent } = useApp(s => ({
    idType: s.idType,
    tierIdx: s.tierIdx,
    consent: s.kycConsent,
  }));
  const rows = [
    { k: 'FULL NAME', v: 'Adaeze Chioma Okafor' },
    { k: 'DATE OF BIRTH', v: '14 March 1989' },
    { k: 'ID TYPE', v: ID_TYPES[idType].name },
    { k: 'ID NUMBER', v: ID_TYPES[idType].num },
    { k: 'MOBILE', v: '+234 802 441 9087' },
    { k: 'ACCOUNT TIER', v: ACCOUNT_TIERS[tierIdx].name },
  ];
  const tone = consent ? '#16a34a' : '#c9cdd8';
  return (
    <ScreenContainer screen="kycReview" contentStyle={styles.content}>
      <Text style={styles.title}>Check before you send</Text>
      <View style={styles.card}>
        <KeyValueRows rows={rows} valueWeight="600" />
        <View style={styles.captured}>
          <CheckBadge size={20} radius={8} iconSize={12} />
          <Text style={styles.capturedText}>ID photo and selfie captured</Text>
        </View>
      </View>
      <PressableScale
        onPress={() => setAppState(p => ({ kycConsent: !p.kycConsent }))}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
        style={[styles.consent, { borderColor: tone }]}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: tone,
              backgroundColor: consent ? '#16a34a' : 'transparent',
            },
          ]}
        >
          <Icon name="check" size={14} color="#fff" strokeWidth={3.5} />
        </View>
        <Text style={styles.consentText} leading={1.55}>
          I confirm these details are mine and allow Mineral Bridge to check
          them against the national identity database and share the result with
          regulators where required.
        </Text>
      </PressableScale>
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
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7ec',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: shadows.cardRaised,
  },
  captured: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  capturedText: { fontSize: 12.5, fontWeight: '600', color: '#15803d' },
  consent: {
    marginTop: 16,
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
  consentText: { flex: 1, fontSize: 12.5, color: '#4a5170' },
});
