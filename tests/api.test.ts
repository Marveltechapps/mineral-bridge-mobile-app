import {
  ApiError,
  CLIENT_ERROR_CODES,
  NO_RESPONSE_STATUS,
  TIMEOUT_STATUS,
  apiRequest,
  isApiError,
  isDemoMode,
} from '../src/api';
import { env } from '../src/config/env';

/**
 * The API layer. `@env` values are inlined by the dotenv babel plugin, so there
 * is no runtime module to mock — these set `env` directly instead, which is why
 * `isDemoMode` reads it per call rather than at import.
 */

const BASE = 'https://api.mineralbridge.test/v1';

type FetchCall = { url: string; init: RequestInit };

const originalBaseUrl = env.API_BASE_URL;
const originalTimeout = env.API_TIMEOUT_MS;
const originalFetch = globalThis.fetch;

function stubFetch(handler: (call: FetchCall) => Promise<Response>) {
  const calls: FetchCall[] = [];
  globalThis.fetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(input), init });
    return handler({ url: String(input), init });
  }) as typeof fetch;
  return calls;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** A fetch that never settles until its signal aborts, as the real one behaves. */
const pendingFetch = ((_input: RequestInfo | URL, init: RequestInit = {}) =>
  new Promise<Response>((_resolve, reject) => {
    const { signal } = init;
    const fail = () => {
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      reject(error);
    };
    if (signal?.aborted) fail();
    else signal?.addEventListener('abort', fail);
  })) as typeof fetch;

beforeEach(() => {
  env.API_BASE_URL = BASE;
  env.API_TIMEOUT_MS = 50;
});

afterEach(() => {
  env.API_BASE_URL = originalBaseUrl;
  env.API_TIMEOUT_MS = originalTimeout;
  globalThis.fetch = originalFetch;
});

describe('demo mode', () => {
  it('is on when no API is configured, and fails fast rather than hanging', async () => {
    env.API_BASE_URL = '';
    const calls = stubFetch(() => Promise.resolve(json({})));

    expect(isDemoMode()).toBe(true);
    const error = await apiRequest('/orders').catch((e: unknown) => e);

    expect(isApiError(error)).toBe(true);
    expect((error as ApiError).code).toBe(CLIENT_ERROR_CODES.demoMode);
    expect((error as ApiError).status).toBe(NO_RESPONSE_STATUS);
    // Nothing should reach the network when there is no host to reach.
    expect(calls).toHaveLength(0);
  });

  it('is off once a base URL is set', () => {
    expect(isDemoMode()).toBe(false);
  });
});

describe('apiRequest', () => {
  it('returns the decoded body and sends JSON headers', async () => {
    const calls = stubFetch(() => Promise.resolve(json({ id: 'gold' })));

    await expect(apiRequest('/catalog/products/gold')).resolves.toEqual({
      id: 'gold',
    });

    expect(calls[0].url).toBe(`${BASE}/catalog/products/gold`);
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Accept).toBe('application/json');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('lets the caller override a header', async () => {
    const calls = stubFetch(() => Promise.resolve(json({})));

    await apiRequest('/me', { headers: { 'Content-Type': 'text/plain' } });

    expect((calls[0].init.headers as Record<string, string>)['Content-Type']).toBe(
      'text/plain',
    );
  });

  it('returns undefined for a 204 with no body', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 204 })));

    await expect(apiRequest('/notifications/read')).resolves.toBeUndefined();
  });

  it('reports a body that is not valid JSON', async () => {
    stubFetch(() =>
      Promise.resolve(new Response('<html>nope</html>', { status: 200 })),
    );

    const error = await apiRequest('/orders').catch((e: unknown) => e);

    expect((error as ApiError).code).toBe(CLIENT_ERROR_CODES.malformedResponse);
  });

  it('reports a network failure', async () => {
    stubFetch(() => Promise.reject(new TypeError('Network request failed')));

    const error = await apiRequest('/orders').catch((e: unknown) => e);

    expect((error as ApiError).code).toBe(CLIENT_ERROR_CODES.network);
    expect((error as ApiError).status).toBe(NO_RESPONSE_STATUS);
  });
});

describe('cancellation', () => {
  it("honours the caller's signal", async () => {
    // The defect this covers: the wrapper used to pass only its own timeout
    // signal to fetch, so an unmounting screen could not cancel its request.
    globalThis.fetch = pendingFetch;
    const controller = new AbortController();

    const pending = apiRequest('/orders', { signal: controller.signal });
    controller.abort();

    // A cancellation is the caller's own, so it arrives unchanged rather than
    // dressed up as a request failure.
    const error = await pending.catch((e: unknown) => e);
    expect(isApiError(error)).toBe(false);
  });

  it('does not send a request whose signal is already aborted', async () => {
    globalThis.fetch = pendingFetch;
    const controller = new AbortController();
    controller.abort();

    await expect(
      apiRequest('/orders', { signal: controller.signal }),
    ).rejects.toBeTruthy();
  });

  it('still times out when the caller passes a signal it never aborts', async () => {
    globalThis.fetch = pendingFetch;
    const controller = new AbortController();

    const error = await apiRequest('/orders', {
      signal: controller.signal,
      timeoutMs: 10,
    }).catch((e: unknown) => e);

    expect((error as ApiError).code).toBe(CLIENT_ERROR_CODES.timeout);
    expect((error as ApiError).status).toBe(TIMEOUT_STATUS);
  });

  it('times out at the configured limit', async () => {
    globalThis.fetch = pendingFetch;

    const error = await apiRequest('/orders').catch((e: unknown) => e);

    expect((error as ApiError).code).toBe(CLIENT_ERROR_CODES.timeout);
  });
});

describe('error responses', () => {
  it('carries the status and the server code', async () => {
    stubFetch(() =>
      Promise.resolve(
        json({ code: 'kyc/not-approved', message: 'Verify your identity first' }, 403),
      ),
    );

    const error = await apiRequest('/auctions/a1/bids').catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(403);
    expect((error as ApiError).code).toBe('kyc/not-approved');
    expect((error as ApiError).message).toBe('Verify your identity first');
  });

  it('tells a sold lot apart from an expired session', async () => {
    stubFetch(() => Promise.resolve(json({ code: 'lot/sold' }, 409)));
    const conflict = await apiRequest('/orders').catch((e: unknown) => e);

    stubFetch(() => Promise.resolve(json({ code: 'auth/expired' }, 401)));
    const expired = await apiRequest('/orders').catch((e: unknown) => e);

    expect((conflict as ApiError).status).toBe(409);
    expect((conflict as ApiError).code).toBe('lot/sold');
    expect((expired as ApiError).status).toBe(401);
    expect((expired as ApiError).code).toBe('auth/expired');
  });

  it('reads per-field messages from a 422', async () => {
    stubFetch(() =>
      Promise.resolve(
        json(
          { code: 'validation/failed', fields: { qty: 'Above the available stock' } },
          422,
        ),
      ),
    );

    const error = await apiRequest('/sell/estimates', { method: 'POST' }).catch(
      (e: unknown) => e,
    );

    expect((error as ApiError).fields).toEqual({
      qty: 'Above the available stock',
    });
  });

  it('accepts the array spelling of field errors', async () => {
    stubFetch(() =>
      Promise.resolve(json({ errors: { phone: ['Enter a valid number'] } }, 422)),
    );

    const error = await apiRequest('/auth/otp/request').catch((e: unknown) => e);

    expect((error as ApiError).fields).toEqual({
      phone: 'Enter a valid number',
    });
  });

  it('reads a nested error envelope', async () => {
    stubFetch(() =>
      Promise.resolve(
        json({ error: { code: 'payout/blocked', message: 'Payouts are on hold' } }, 400),
      ),
    );

    const error = await apiRequest('/payouts/withdrawals').catch((e: unknown) => e);

    expect((error as ApiError).code).toBe('payout/blocked');
    expect((error as ApiError).message).toBe('Payouts are on hold');
  });

  it('still carries the status when the body is not JSON at all', async () => {
    stubFetch(() =>
      Promise.resolve(new Response('<html>Bad Gateway</html>', { status: 502 })),
    );

    const error = await apiRequest('/orders').catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).code).toBe('http/502');
  });
});
