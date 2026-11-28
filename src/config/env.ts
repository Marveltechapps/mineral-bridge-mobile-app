/**
 * Environment configuration for the Mineral Bridge mobile app.
 *
 * This file is COMMITTED. Never put secrets in it — everything here ships inside the app bundle.
 *
 * HOW TO OVERRIDE
 * ---------------
 * Development (`__DEV__ === true`, debug builds that load JavaScript from Metro):
 * - Android emulator -> host machine:   http://10.0.2.2:5001/v2
 * - iOS simulator -> host machine:      http://localhost:5001/v2
 * - Physical device: set DEV_HOST to your computer's LAN IP
 * - Port 5001 is the backend the Admin Dashboard uses, so the catalogue photos are the uploaded originals.
 *
 * Production / release (`__DEV__ === false`):
 * - URLs are injected at bundle time. They are NOT stored as empty literals in a shippable release.
 * - Set MB_PROD_API_BASE_URL (https://<host>/v2) and MB_PROD_WS_BASE_URL (wss://<host>)
 *   in the environment or in android/prod-endpoints.properties, then assemble the release.
 * - The Android release task runs scripts/require-prod-urls.mjs and fails if either value is missing,
 *   not https/wss, or still a placeholder host.
 * - MB_RELEASE_CLEARTEXT=true is only for an isolated test artifact (http/ws to the test API).
 *   It is not a Play Store configuration. Store releases must leave it unset.
 *
 * The identifiers MB_PROD_* below are replaced with string literals by babel.config.js.
 *
 * API vs WebSocket paths
 * ----------------------
 * - REST (and SSE) live under `/v2` -> `API_BASE_URL` already includes the `/v2` suffix.
 * - WebSockets live under `/v1/ws/...` (backend mounts them on the raw HTTP server),
 *   so `WS_BASE_URL` is an ORIGIN ONLY (no path); `src/services/realtime.ts` appends `/v1/ws/...`.
 */
import { Platform } from 'react-native';

/* global MB_PROD_API_BASE_URL, MB_PROD_WS_BASE_URL, MB_RELEASE_CLEARTEXT */
declare const MB_PROD_API_BASE_URL: string;
declare const MB_PROD_WS_BASE_URL: string;
declare const MB_RELEASE_CLEARTEXT: string;

/**
 * Local backend port for debug builds.
 * Port 5001 is the running API (same database as the Admin Dashboard catalogue).
 * Do not point automated write tests at that database.
 */
const DEV_PORT = 5001;

/**
 * Host used in development. Android emulators reach the host machine through 10.0.2.2.
 * Set this to your LAN IP when testing on a physical device.
 */
const DEV_HOST: string = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

/** Inlined by Babel from MB_PROD_API_BASE_URL. Empty only when the release gate was bypassed. */
const PROD_API_BASE_URL = typeof MB_PROD_API_BASE_URL === 'string' ? MB_PROD_API_BASE_URL : '';
/** Inlined by Babel from MB_PROD_WS_BASE_URL. */
const PROD_WS_BASE_URL = typeof MB_PROD_WS_BASE_URL === 'string' ? MB_PROD_WS_BASE_URL : '';
/**
 * 'true' only for an isolated release-mode test build that must speak cleartext HTTP to the test API.
 * Store releases leave this unset, which forces https/wss.
 */
const RELEASE_CLEARTEXT = MB_RELEASE_CLEARTEXT === 'true';

const IS_PROD = !__DEV__;

const PLACEHOLDER_HOSTS = ['api.mineralbridge.com', 'example.com', 'localhost', '10.0.2.2', '127.0.0.1'];

function hostOf(url: string): string {
  const m = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)/i.exec(url);
  if (!m) return '';
  return m[1].replace(/^.*@/, '').replace(/:\d+$/, '').toLowerCase();
}

function isPlaceholderHost(host: string): boolean {
  return PLACEHOLDER_HOSTS.some(p => host === p || host.endsWith(`.${p}`));
}

function isConfiguredProdUrl(url: string): boolean {
  if (!url || !/^https:\/\//i.test(url)) return false;
  const host = hostOf(url);
  if (!host || !url.toLowerCase().includes('/v2')) return false;
  return !isPlaceholderHost(host);
}

function isConfiguredProdWs(url: string): boolean {
  if (!url || !/^wss:\/\//i.test(url)) return false;
  const host = hostOf(url);
  if (!host) return false;
  return !isPlaceholderHost(host);
}

function isCleartextTestApi(url: string): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  return hostOf(url).length > 0 && /\/v2\/?$/i.test(url.split('?')[0]);
}

function isCleartextTestWs(url: string): boolean {
  if (!url || !/^wss?:\/\//i.test(url)) return false;
  return hostOf(url).length > 0 && !/\/v2/i.test(url);
}

const prodApiOk = RELEASE_CLEARTEXT ? isCleartextTestApi(PROD_API_BASE_URL) : isConfiguredProdUrl(PROD_API_BASE_URL);
const prodWsOk = RELEASE_CLEARTEXT ? isCleartextTestWs(PROD_WS_BASE_URL) : isConfiguredProdWs(PROD_WS_BASE_URL);

/** True when this release bundle has non-empty endpoints that match its build mode. */
export const PROD_ENDPOINTS_CONFIGURED = prodApiOk && prodWsOk;

if (IS_PROD && !PROD_ENDPOINTS_CONFIGURED) {
  console.error(
    '[MineralBridge] Release build is missing real production endpoints. ' +
      'Set MB_PROD_API_BASE_URL (https://<host>/v2) and MB_PROD_WS_BASE_URL (wss://<host>) before assembling the release. ' +
      'Empty values are refused by scripts/require-prod-urls.mjs.',
  );
}

export const ENV = {
  /** REST base URL including the `/v2` prefix and no trailing slash. */
  API_BASE_URL: IS_PROD
    ? PROD_API_BASE_URL.replace(/\/$/, '')
    : `http://${DEV_HOST}:${DEV_PORT}/v2`,
  /** WebSocket ORIGIN (no path). Paths like `/v1/ws/auctions/:id` are appended by realtime.ts. */
  WS_BASE_URL: IS_PROD ? PROD_WS_BASE_URL.replace(/\/$/, '') : `ws://${DEV_HOST}:${DEV_PORT}`,
  /** Sent as `X-Client: mineralbridge-mobile/<CLIENT_VERSION>`. */
  CLIENT_VERSION: '0.1.0',
  IS_PROD,
  /** When false, the app must not be distributed as a production release. */
  PROD_ENDPOINTS_CONFIGURED,
};
