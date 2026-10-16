/**
 * Mineral Bridge — React Native app root.
 *
 * @format
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';
import { Overlays } from './src/components/overlays/Overlays';
import { useDevStates } from './src/lib/hooks/useDevStates';
import { useHardwareBack } from './src/lib/hooks/useHardwareBack';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/flow';
import { linking } from './src/navigation/linking';

// Screens left behind in the history stop re-rendering until they return.
enableFreeze(true);

function Root() {
  useHardwareBack();
  useDevStates();
  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
      <Overlays />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1430' },
});
