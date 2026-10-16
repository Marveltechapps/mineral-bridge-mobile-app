import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SampleCard } from '../../components/SampleCard';
import { getSamples } from '../../services/sample.service';
import type { SampleItem } from '../../types/sample';
import { errorMessage } from '../../utils/errorMessage';
import { colors, spacing } from '../../theme';

export function SampleScreen({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    getSamples(controller.signal).then(setItems).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(reason));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <SafeAreaView style={styles.container}>
    <Button title="Back" onPress={onBack} />
    <Text style={styles.title}>Sample items</Text>
    {loading ? <Text accessibilityRole="text">Loading samples…</Text> : error ?
      <View><Text accessibilityRole="alert">{error}</Text><Text>Start the service and check src/api/config.ts.</Text></View> :
      <FlatList data={items} keyExtractor={item => item.id} renderItem={({ item }) => <SampleCard item={item} />} ListEmptyComponent={<Text>No sample items.</Text>} />}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.large, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '600', marginVertical: spacing.medium, color: colors.text },
});
