import { apiRequest, ApiError, clearSession, getAccessToken, getRefreshToken, setTokens } from '../src/api';
import { createSseParser } from '../src/services/realtime';
import { uuidv4 } from '../src/lib/uuid';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers });

describe('api client', () => {
  const realFetch = globalThis.fetch;
  afterEach(async () => {
    globalThis.fetch = realFetch;
    await clearSession('cleared');
  });

  it('adds client headers and parses error envelopes', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      json(422, { code: 'validation/failed', message: 'Bad', fields: { code: 'Invalid' }, requestId: 'r1' }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    await expect(apiRequest('/auth/otp/verify', { method: 'POST', body: {}, skipAuth: true })).rejects.toMatchObject({
      status: 422,
      code: 'validation/failed',
      requestId: 'r1',
      fields: { code: 'Invalid' },
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/v2/auth/otp/verify');
    const h = init.headers as Record<string, string>;
    expect(h['X-Client']).toMatch(/^mineralbridge-mobile\//);
    expect(['android', 'ios']).toContain(h['X-Platform']);
    expect(h['X-Device-Id']).toBeTruthy();
    expect(h.Authorization).toBeUndefined();
  });

  it('refreshes once (single flight) on 401 token-expired and retries', async () => {
    await setTokens({ accessToken: 'old', refreshToken: 'refresh-token-1' });
    let refreshCalls = 0;
    const fetchMock = jest.fn().mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return json(200, { accessToken: 'new', refreshToken: 'refresh-token-2', expiresIn: 900 });
      }
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === 'Bearer new' ? json(200, { ok: true }) : json(401, { code: 'auth/token-expired', message: 'x' });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const [a, b] = await Promise.all([apiRequest('/me'), apiRequest('/cart')]);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe('new');
    expect(getRefreshToken()).toBe('refresh-token-2');
  });

  it('clears the session when refresh is rejected', async () => {
    await setTokens({ accessToken: 'old', refreshToken: 'refresh-token-1' });
    globalThis.fetch = jest.fn().mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh')
        ? json(401, { code: 'auth/session-expired', message: 'gone' })
        : json(401, { code: 'auth/token-expired', message: 'x' }),
    ) as unknown as typeof fetch;
    await expect(apiRequest('/me')).rejects.toBeInstanceOf(ApiError);
    expect(getAccessToken()).toBeNull();
  });

  it('sends Idempotency-Key and resolves undefined on 204', async () => {
    const fetchMock = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const out = await apiRequest('/x', { method: 'DELETE', idempotencyKey: true });
    expect(out).toBeUndefined();
    const h = (fetchMock.mock.calls[0] as [string, RequestInit])[1].headers as Record<string, string>;
    expect(h['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('helpers', () => {
  it('parses SSE frames across chunks', () => {
    const events: { event: string; id?: string; data: Record<string, unknown> }[] = [];
    const feed = createSseParser(e => events.push(e));
    feed('retry: 3000\n\nid: 7\nevent: notification.created\ndata: {"a":');
    feed('1}\n\n: ping\n\n');
    expect(events).toEqual([{ id: '7', event: 'notification.created', data: { a: 1 } }]);
  });

  it('generates v4 uuids', () => {
    expect(uuidv4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
