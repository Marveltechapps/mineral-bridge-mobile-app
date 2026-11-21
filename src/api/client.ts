import {
  API_BASE_URL,
  CLIENT_HEADER,
  PLATFORM_HEADER,
  REQUEST_TIMEOUT_MS,
} from './config';
import { ApiError, CLIENT_ERROR_CODES, apiErrorFromResponse } from './errors';
import {
  accessTokenTtlMs,
  clearSession,
  getAccessToken,
  getDeviceId,
  getRefreshToken,
  hydrateSession,
  setTokens,
} from './session';
import { uuidv4 } from '../lib/uuid';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: HttpMethod;
  /** Plain objects/arrays are JSON-encoded. FormData/string/Blob are sent as-is. */
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Send Authorization when a token exists (default true). Set false for public auth endpoints. */
  auth?: boolean;
  /** Alias for `auth: false`. */
  skipAuth?: boolean;
  /** `true` generates a UUID once per call (re-used on the automatic 401 retry); or pass your own. */
  idempotencyKey?: string | true;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** Return the raw `Response` (PDF/binary downloads). Errors are still parsed into ApiError. */
  raw?: boolean;
  timeoutMs?: number;
}

/** Fresh idempotency key (UUID v4). */
export const newIdempotencyKey = (): string => uuidv4();

let acceptLanguage: string | null = null;
export function setAcceptLanguage(tag: string): void {
  acceptLanguage = tag;
}
function getAcceptLanguage(): string {
  if (acceptLanguage) return acceptLanguage;
  try {
    const l = Intl.DateTimeFormat().resolvedOptions().locale;
    if (l) return l;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}${buildQuery(query)}`;
}

const isFormData = (b: unknown): b is FormData => typeof FormData !== 'undefined' && b instanceof FormData;

const PROACTIVE_REFRESH_MS = 30_000;

/* ------------------------------ refresh (single flight) ------------------------------ */

let refreshInFlight: Promise<void> | null = null;

/**
 * Exchange the stored refresh token for a new access (+ rotated refresh) token.
 * Concurrent callers share one network request. On a definitive auth failure the session is cleared
 * and listeners receive `expired`. Network failures keep the session and rethrow.
 */
export function refreshSession(): Promise<void> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    await hydrateSession();
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      await clearSession('expired');
      throw new ApiError({ status: 401, code: CLIENT_ERROR_CODES.sessionExpired, message: 'Your session has expired.' });
    }
    try {
      const res = await apiRequest<{ accessToken: string; expiresIn?: number; refreshToken?: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        skipAuth: true,
      });
      await setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken, expiresIn: res.expiresIn }, 'refreshed');
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) {
        await clearSession('expired');
        throw new ApiError({
          status: 401,
          code: CLIENT_ERROR_CODES.sessionExpired,
          message: 'Your session has expired. Please sign in again.',
          requestId: e.requestId,
        });
      }
      throw e;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/* ------------------------------ core request ------------------------------ */

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function execute<T>(path: string, opts: ApiRequestOptions, idemKey: string | undefined, retried: boolean): Promise<T> {
  await hydrateSession();
  const useAuth = opts.auth !== false && !opts.skipAuth;

  // Proactively refresh a token that is about to expire (only when we know its expiry).
  if (useAuth && !retried && getRefreshToken()) {
    const ttl = accessTokenTtlMs();
    if ((ttl !== null && ttl < PROACTIVE_REFRESH_MS) || (!getAccessToken() && ttl === null)) {
      await refreshSession();
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client': CLIENT_HEADER,
    'X-Platform': PLATFORM_HEADER,
    'X-Device-Id': await getDeviceId(),
    'Accept-Language': getAcceptLanguage(),
    ...opts.headers,
  };

  let body: RequestInit['body'];
  if (opts.body !== undefined && opts.body !== null) {
    if (isFormData(opts.body)) {
      body = opts.body; // fetch sets multipart boundary itself
    } else if (typeof opts.body === 'string') {
      body = opts.body;
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    } else {
      body = JSON.stringify(opts.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  const sentToken = useAuth ? getAccessToken() : null;
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`;
  if (idemKey) headers['Idempotency-Key'] = idemKey;

  // Timeout + caller signal -> one controller.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener('abort', onAbort);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? (body !== undefined ? 'POST' : 'GET'),
      headers,
      body,
      signal: controller.signal,
    });
  } catch (e) {
    if (timedOut) {
      throw new ApiError({ status: 0, code: CLIENT_ERROR_CODES.timeout, message: 'The request timed out. Check your connection and try again.' });
    }
    if (opts.signal?.aborted || (e instanceof Error && e.name === 'AbortError')) {
      throw new ApiError({ status: 0, code: CLIENT_ERROR_CODES.aborted, message: 'Request cancelled.' });
    }
    throw new ApiError({ status: 0, code: CLIENT_ERROR_CODES.network, message: 'Cannot reach Mineral Bridge. Check your connection and try again.' });
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }

  if (res.ok) {
    if (opts.raw) return res as unknown as T;
    return (await parseBody(res)) as T;
  }

  const errBody = await parseBody(res).catch(() => undefined);
  const err = apiErrorFromResponse(res.status, errBody, res.headers.get('x-request-id'));

  if (res.status === 401 && useAuth && sentToken) {
    if (!retried && (err.code === 'auth/token-expired' || err.code === 'auth/token-invalid') && getRefreshToken()) {
      await refreshSession(); // throws (and clears the session) if the refresh token is no longer valid
      return execute<T>(path, opts, idemKey, true);
    }
    if (err.code === 'auth/session-expired' || err.code === 'auth/token-invalid' || err.code === 'auth/token-expired') {
      await clearSession('expired');
    }
  }
  throw err;
}

/**
 * Typed fetch wrapper for the `/v2` API.
 *
 * - Prefixes API_BASE_URL, adds X-Client / X-Platform / X-Device-Id / Accept-Language / Authorization.
 * - JSON by default; FormData is passed through untouched (multipart).
 * - 401 `auth/token-expired`: single-flight POST /auth/refresh, then retries the request once.
 * - Errors become `ApiError`. 204 resolves `undefined`. `raw: true` returns the `Response`.
 */
export async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const idemKey = options.idempotencyKey === true ? newIdempotencyKey() : options.idempotencyKey;
  return execute<T>(path, options, idemKey, false);
}

/** Convenience verbs. */
export const api = {
  get: <T>(path: string, opts: Omit<ApiRequestOptions, 'method' | 'body'> = {}) => apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T = void>(path: string, opts: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
