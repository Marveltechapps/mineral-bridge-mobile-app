import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SampleScreen } from '../screens/sample/SampleScreen';
import { AppShell } from './AppShell';
import type { ScreenName } from './types';

export function RootNavigator() {
  const [screen, setScreen] = useState<ScreenName>('app');
  // Hardware back from the starter screens returns to the app.
  useEffect(() => {
    if (screen === 'app') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { setScreen(screen === 'samples' ? 'home' : 'app'); return true; });
    return () => sub.remove();
  }, [screen]);
  if (screen === 'samples') return <SampleScreen onBack={() => setScreen('home')} />;
  if (screen === 'home') return <HomeScreen onSamples={() => setScreen('samples')} />;
  return <AppShell onOpenStarter={__DEV__ ? () => setScreen('home') : undefined} />;
}
