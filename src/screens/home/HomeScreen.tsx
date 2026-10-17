import React from 'react';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export function HomeScreen({ onSamples }: { onSamples: () => void }) {
  return <SafeAreaView style={styles.container}><Text style={styles.title}>Mineral Bridge</Text><Text>Project structure example.</Text><Button title="View sample items" onPress={onSamples} /></SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.screen },
  title: { fontSize: 28, fontWeight: '600', color: colors.ink, marginBottom: 12 },
});
