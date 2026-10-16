import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Rule } from '../common/animations';
import { SectionLabel } from '../common/ui';
import { bg } from '../../utils/style';

/** Section label led by a short animated gradient rule. */
export function GroupHeader({ label, rule }: { label: string; rule: string }) {
  return (
    <View style={styles.row}>
      <Rule style={[styles.rule, bg(rule)]} />
      <SectionLabel>{label}</SectionLabel>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  rule: { width: 18, height: 3, borderRadius: 2 },
});
