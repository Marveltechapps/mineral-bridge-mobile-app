import React, { useState } from 'react';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SampleScreen } from '../screens/sample/SampleScreen';
import type { ScreenName } from './types';

export function RootNavigator() {
  const [screen, setScreen] = useState<ScreenName>('home');
  return screen === 'samples' ? <SampleScreen onBack={() => setScreen('home')} /> : <HomeScreen onSamples={() => setScreen('samples')} />;
}
