import React from 'react';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

export function HomeScreen({ onSamples }: { onSamples: () => void }) {
  return <SafeAreaView style={styles.container}><Text style={styles.title}>Mineral Bridge</Text><Text>Project structure example.</Text><Button title="View sample items" onPress={onSamples} /></SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.large, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '600', color: colors.text, marginBottom: spacing.medium },
});
