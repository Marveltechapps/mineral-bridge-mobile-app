import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from '../context/appStore';

const KEY = 'mb.device-preferences';

/** Language, currency, units, and the settings switches. Kept across launches and logouts. */
export type DevicePreferences = {
  prefsVal: AppState['prefsVal'];
  prefs: AppState['prefs'];
};

export async function saveDevicePreferences(value: DevicePreferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

export async function loadDevicePreferences(): Promise<DevicePreferences | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DevicePreferences;
    if (!parsed?.prefsVal || typeof parsed.prefsVal.currency !== 'string') return null;
    if (!parsed.prefs || typeof parsed.prefs.marketing !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}
