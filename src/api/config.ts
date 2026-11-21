import { Platform } from 'react-native';
import { ENV } from '../config/env';

/** REST base (includes `/v2`). Overridable in `src/config/env.ts`. */
export const API_BASE_URL: string = ENV.API_BASE_URL.replace(/\/+$/, '');

/** WebSocket origin (no path). WS routes are `/v1/ws/...` - see `src/services/realtime.ts`. */
export const WS_BASE_URL: string = ENV.WS_BASE_URL.replace(/\/+$/, '');

export const CLIENT_VERSION: string = ENV.CLIENT_VERSION;
export const IS_PROD: boolean = ENV.IS_PROD;

/** Value of the `X-Client` header. Backend accepts `mobile` or the `mineralbridge-mobile` prefix. */
export const CLIENT_HEADER = `mineralbridge-mobile/${CLIENT_VERSION}`;

/** Value of the `X-Platform` header. */
export const PLATFORM_HEADER: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android';

/** Default request timeout in ms. Uploads use `UPLOAD_TIMEOUT_MS`. */
export const REQUEST_TIMEOUT_MS = 30_000;
export const UPLOAD_TIMEOUT_MS = 120_000;
