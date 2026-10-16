import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '../../components/common/Icon';
import { PressableScale } from '../../components/common/PressableScale';
import { Text } from '../../components/common/Text';
import { SectionLabel } from '../../components/common/ui';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ACCOUNT_TIERS } from '../../lib/catalog';
import { flash, go } from '../../navigation/flow';
import { useApp } from '../../context/appStore';
import { gradients } from '../../theme';

type Field = {
  label: string;
  value: string;
  locked?: boolean;
  note?: string;
  chev?: boolean;
  onPress?: () => void;
};

/** P1a · Edit profile — avatar, identity, business and address fields. */
export function EditProfileScreen() {
  const tierIdx = useApp(s => s.tierIdx);
  const tier = ACCOUNT_TIERS[tierIdx];
  const changePhoto = () => flash('Choose a new profile photo');
  const sections: { label: string; fields: Field[] }[] = [
    {
      label: 'YOUR DETAILS',
      fields: [
        { label: 'FULL NAME', value: 'Adaeze Chioma Okafor' },
        {
          label: 'MOBILE NUMBER',
          value: '+234 802 441 9087',
          locked: true,
          note: 'Verified at signup. Contact support to change it.',
        },
        { label: 'EMAIL', value: 'adaeze.okafor@auroraref.ng' },
        {
          label: 'DATE OF BIRTH',
          value: '14 March 1989',
          locked: true,
          note: 'Taken from your verified ID.',
        },
      ],
    },
    {
      label: 'BUSINESS',
      fields: [
        { label: 'BUSINESS NAME', value: 'Aurora Refining Ltd.' },
        {
          label: 'ACCOUNT TIER',
          value: tier.name + ' · ' + tier.tag,
          chev: true,
          onPress: () => go('tier'),
        },
        { label: 'REGISTRATION NUMBER', value: 'RC-1140882' },
      ],
    },
    {
      label: 'ADDRESSES',
      fields: [
        {
          label: 'PICKUP LOCATION',
          value: 'Ilesha Lease Site 4\nOff Ijebu-Jesa Road, Osun State',
          chev: true,
        },
        {
          label: 'DELIVERY FACILITY',
          value: 'Aurora Refining Ltd.\n14 Creek Road, Apapa, Lagos',
          chev: true,
        },
      ],
    },
  ];

  return (
    <ScreenContainer screen="editProfile" contentStyle={styles.content}>
      <View style={styles.avatarCol}>
        <View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AO</Text>
          </View>
          <Pressable
            onPress={changePhoto}
            style={styles.camera}
            accessibilityLabel="Change photo"
          >
            <Icon name="camera" size={14} color="#fff" strokeWidth={2.2} />
          </Pressable>
        </View>
        <Pressable onPress={changePhoto} accessibilityRole="button">
          <Text style={styles.change}>Change photo</Text>
        </Pressable>
      </View>
      {sections.map(sec => (
        <View key={sec.label} style={styles.section}>
          <SectionLabel style={styles.sectionLabel}>{sec.label}</SectionLabel>
          <View style={styles.fields}>
            {sec.fields.map(f => (
              <View key={f.label}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <PressableScale
                  activeScale={0.99}
                  onPress={
                    f.onPress ??
                    (f.locked
                      ? () => flash('This field is locked to your verified ID')
                      : () => flash('Editing ' + f.label.toLowerCase()))
                  }
                  accessibilityHint={
                    f.locked ? 'Locked to your verified ID' : undefined
                  }
                  style={[styles.field, f.locked ? styles.locked : styles.open]}
                >
                  <Text
                    style={[
                      styles.value,
                      { color: f.locked ? '#606780' : '#1a1f36' },
                    ]}
                    leading={1.4}
                  >
                    {f.value}
                  </Text>
                  {f.locked ? (
                    <Icon name="lock" size={15} color="#a3abc4" />
                  ) : null}
                  {f.chev ? (
                    <Icon name="chevronRight" size={16} color="#b9c0d6" />
                  ) : null}
                </PressableScale>
                {f.note ? (
                  <Text style={styles.note} leading={1.4}>
                    {f.note}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 26 },
  avatarCol: { alignItems: 'center', gap: 11 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 24,
    experimental_backgroundImage: gradients.gold,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(16,24,40,0.16)',
  },
  avatarText: { color: '#2b1f04', fontSize: 27, fontWeight: '700' },
  camera: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e2a5a',
    borderWidth: 2,
    borderColor: '#f4f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  change: { fontSize: 12.5, fontWeight: '600', color: '#2563eb' },
  section: { marginTop: 22 },
  sectionLabel: { marginHorizontal: 2, marginBottom: 10 },
  fields: { gap: 13 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8890ad',
    marginBottom: 6,
  },
  field: {
    borderWidth: 1,
    borderRadius: 11,
    minHeight: 50,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  },
  open: { backgroundColor: '#fff', borderColor: '#e2e5ec' },
  locked: { backgroundColor: '#f4f5f7', borderColor: '#e5e7ec' },
  value: { flex: 1, fontSize: 14, fontWeight: '500' },
  note: { fontSize: 11.5, color: '#606780', marginTop: 6 },
});
