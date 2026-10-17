import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SampleItem } from '../types/sample';
import { colors } from '../theme';

export function SampleCard({ item }: { item: SampleItem }) {
  return <View style={styles.card}><Text style={styles.title}>{item.name}</Text><Text>{item.description}</Text><Text>{item.id}</Text></View>;
}
const styles = StyleSheet.create({
  card: { padding: 12, marginBottom: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  title: { fontSize: 20, color: colors.ink, fontWeight: '600', marginBottom: 8 },
});
