import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from './src/context/AppStore';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return <SafeAreaProvider><AppStoreProvider><RootNavigator /></AppStoreProvider></SafeAreaProvider>;
}
