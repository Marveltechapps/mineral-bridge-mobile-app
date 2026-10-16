import { env } from '../config/env';

/**
 * Thin fetch wrapper for the Mineral Bridge API. Configuration comes from
 * `.env` (see `.env.example`); no secrets are bundled with the app.
 *
 * `ENDPOINTS` in `./config` lists the paths each screen will need. No API
 * exists yet, so with `API_BASE_URL` empty the app runs on the design's
 * bundled data (`src/lib/catalog.ts`) and every request fails fast in demo
 * mode rather than hanging on a host that is not there.
 */
/**
 * True while no API is configured.
 *
 * A function rather than a constant so it reflects `env` when it is called
 * rather than when this module was first imported — which is also what lets
 * the API layer be tested without mocking `@env` (the dotenv babel plugin
 * inlines those values at transform time, so there is no runtime module to
 * mock).
 */
export const isDemoMode = (): boolean => env.API_BASE_URL === '';

/** Codes the client raises itself, for failures that never reached the server. */
export const CLIENT_ERROR_CODES = {
  /** `API_BASE_URL` is empty: the app is running on bundled demo data. */
  demoMode: 'client/demo-mode',
  /** The request did not complete within `API_TIMEOUT_MS`. */
  timeout: 'client/timeout',
  /** `fetch` itself failed: offline, DNS, TLS. */
  network: 'client/network',
  /** A 2xx response whose body was not the JSON the caller expected. */
  malformedResponse: 'client/malformed-response',
} as const;

/** Status reported for a request that never produced an HTTP response. */
export const NO_RESPONSE_STATUS = 0;

/** Status reported when the client's own timeout fires. */
export const TIMEOUT_STATUS = 408;

/**
 * The error every failed request rejects with.
 *
 * A marketplace has failures that must be told apart — `401` session expired,
 * `403` KYC not approved, `409` lot already sold or bid outbid, `422` invalid
 * input — so callers need the status and a machine-readable `code` rather than
 * a message string they would have to match on. `fields` carries per-field
 * messages from a `422`, keyed as the form knows them.
 *
 * The argument order matches the web client's `ApiError`, so the two front ends
 * handle the same backend the same way.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly fields?: Record<string, string>,
    message?: string,
  ) {
    super(message ?? `Request failed (${status})`);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

/**
 * Per-field messages from a `422`. Accepts both `{ qty: 'Too high' }` and the
 * `{ qty: ['Too high'] }` spelling many frameworks produce.
 */
function readFields(
  body: Record<string, unknown>,
): Record<string, string> | undefined {
  const raw = asRecord(body.fields) ?? asRecord(body.errors);
  if (!raw) return undefined;
  const fields: Record<string, string> = {};
  for (const [name, value] of Object.entries(raw)) {
    const message = Array.isArray(value) ? asString(value[0]) : asString(value);
    if (message) fields[name] = message;
  }
  return Object.keys(fields).length ? fields : undefined;
}

/** Reads a response body as JSON, or `undefined` when there is no body. */
async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return undefined;
  }
  const text = await res.text();
  if (text.trim() === '') return undefined;
  return JSON.parse(text) as unknown;
}

/**
 * Builds the `ApiError` for a non-2xx response. Reads `{ code, message,
 * fields? }`, also `{ error: { code, message } }` and `{ detail }`, and still
 * produces an error carrying the real status when the body is not JSON at all
 * (an HTML error page from a proxy, say).
 */
async function errorFromResponse(res: Response): Promise<ApiError> {
  const body = asRecord(await readBody(res).catch(() => undefined));
  const nested = body ? asRecord(body.error) : undefined;
  const code =
    (body && asString(body.code)) ??
    (nested && asString(nested.code)) ??
    (body && asString(body.error)) ??
    `http/${res.status}`;
  const message =
    (body && (asString(body.message) ?? asString(body.detail))) ??
    (nested && asString(nested.message)) ??
    `Request failed (${res.status})`;
  return new ApiError(
    res.status,
    code,
    body ? readFields(body) : undefined,
    message,
  );
}

export interface ApiRequestOptions extends Omit<RequestInit, 'signal'> {
  /** Caller cancellation — pass the signal from the screen's effect cleanup. */
  signal?: AbortSignal | null;
  /** Overrides `API_TIMEOUT_MS` for this one request. */
  timeoutMs?: number;
}

export async function apiRequest<T>(
  path: string,
  { signal, timeoutMs, ...init }: ApiRequestOptions = {},
): Promise<T> {
  if (isDemoMode()) {
    throw new ApiError(
      NO_RESPONSE_STATUS,
      CLIENT_ERROR_CODES.demoMode,
      undefined,
      'No API configured: API_BASE_URL is empty, so the app is running on bundled demo data.',
    );
  }

  // The timeout and the caller each need to be able to cancel, so both feed one
  // controller. Passing the caller's signal straight to `fetch` would lose the
  // timeout; passing only the timeout's would ignore the caller — which is what
  // this wrapper used to do, so a screen could not cancel on unmount.
  const controller = new AbortController();
  let timedOut = false;
  const limit = timeoutMs ?? env.API_TIMEOUT_MS;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, limit);
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  signal?.addEventListener('abort', abortFromCaller);

  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init.headers,
      },
      signal: controller.signal,
    });
  } catch (error) {
    // The caller's cancellation is theirs: rethrow it unchanged so an unmounting
    // screen sees an ordinary abort rather than a failure worth reporting.
    if (signal?.aborted) throw error;
    if (timedOut) {
      throw new ApiError(
        TIMEOUT_STATUS,
        CLIENT_ERROR_CODES.timeout,
        undefined,
        `${init.method ?? 'GET'} ${path} timed out after ${limit}ms`,
      );
    }
    throw new ApiError(
      NO_RESPONSE_STATUS,
      CLIENT_ERROR_CODES.network,
      undefined,
      error instanceof Error
        ? error.message
        : `${init.method ?? 'GET'} ${path} could not be sent`,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  if (!res.ok) throw await errorFromResponse(res);

  try {
    return (await readBody(res)) as T;
  } catch {
    throw new ApiError(
      res.status,
      CLIENT_ERROR_CODES.malformedResponse,
      undefined,
      `${init.method ?? 'GET'} ${path} returned a body that is not valid JSON`,
    );
  }
}
