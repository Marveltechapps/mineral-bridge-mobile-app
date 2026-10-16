import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from './screens';
import { SCREEN_IDS, type RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * One stack holds every screen. Screens swap in place (no slide), and each
 * screen's content runs the design's `fadeUp` entrance instead.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: '#0e1430' },
      }}
    >
      {SCREEN_IDS.map(id => (
        <Stack.Screen key={id} name={id} component={SCREENS[id]} />
      ))}
    </Stack.Navigator>
  );
}
