/**
 * Push notification registration (FCM Android / APNs iOS via @react-native-firebase/messaging).
 *
 * Firebase is OPTIONAL at build time. Without `android/app/google-services.json` (and the iOS
 * GoogleService-Info.plist + APNs key), this module no-ops so release builds still compile.
 *
 * Setup checklist (ops):
 * 1. Add google-services.json / GoogleService-Info.plist from the Firebase console.
 * 2. npm i @react-native-firebase/app @react-native-firebase/messaging
 * 3. Apply the Google Services Gradle plugin when the JSON file is present (already wired).
 * 4. Enable push capability + upload APNs key in Apple Developer + Firebase.
 */
import { Platform, PermissionsAndroid } from 'react-native';
import { ENV } from '../config/env';
import { getDeviceId } from '../api/session';
import * as notifSvc from './notifications.service';

type MessagingModule = {
  default: () => {
    requestPermission: () => Promise<number>;
    getToken: () => Promise<string>;
    onTokenRefresh: (cb: (token: string) => void) => () => void;
    registerDeviceForRemoteMessages?: () => Promise<void>;
  };
  AuthorizationStatus: { AUTHORIZED: number; PROVISIONAL: number; DENIED: number };
};

let unsubscribeRefresh: (() => void) | null = null;
let currentToken: string | null = null;

function tryLoadMessaging(): MessagingModule | null {
  try {
    // Dynamic require so the app boots when Firebase packages are not installed.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging') as MessagingModule;
  } catch {
    return null;
  }
}

export function isPushAvailable(): boolean {
  return tryLoadMessaging() !== null;
}

async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** Register for remote push and POST the token to /v2/devices. Safe no-op without Firebase. */
export async function registerPush(): Promise<{ ok: boolean; reason?: string }> {
  const mod = tryLoadMessaging();
  if (!mod) return { ok: false, reason: 'firebase_not_configured' };

  if (!(await ensureAndroidPermission())) return { ok: false, reason: 'permission_denied' };

  const messaging = mod.default();
  if (Platform.OS === 'ios' && messaging.registerDeviceForRemoteMessages) {
    await messaging.registerDeviceForRemoteMessages();
  }

  const auth = await messaging.requestPermission();
  const allowed =
    auth === mod.AuthorizationStatus.AUTHORIZED || auth === mod.AuthorizationStatus.PROVISIONAL;
  if (!allowed) return { ok: false, reason: 'permission_denied' };

  const token = await messaging.getToken();
  if (!token || token.length < 10) return { ok: false, reason: 'no_token' };

  currentToken = token;
  await notifSvc.registerDevice({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    deviceId: await getDeviceId(),
    appVersion: ENV.CLIENT_VERSION,
  });

  if (unsubscribeRefresh) unsubscribeRefresh();
  unsubscribeRefresh = messaging.onTokenRefresh(async next => {
    try {
      if (currentToken && currentToken !== next) {
        try {
          await notifSvc.unregisterDevice(currentToken);
        } catch {
          /* continue */
        }
      }
      currentToken = next;
      await notifSvc.registerDevice({
        token: next,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        deviceId: await getDeviceId(),
        appVersion: ENV.CLIENT_VERSION,
      });
    } catch {
      /* non-fatal */
    }
  });

  return { ok: true };
}

/** Unregister the current device token from the backend (call on logout). */
export async function unregisterPush(): Promise<void> {
  if (unsubscribeRefresh) {
    unsubscribeRefresh();
    unsubscribeRefresh = null;
  }
  const token = currentToken;
  currentToken = null;
  if (!token) return;
  try {
    await notifSvc.unregisterDevice(token);
  } catch {
    /* non-fatal */
  }
}
