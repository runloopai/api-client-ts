import {
  Runloop,
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
} from '@runloop/api-client';
import { Response, type RequestInfo, type RequestInit } from 'node-fetch';
import { awaitTunnelServiceReady } from '../src/lib/tunnel-readiness';
import { PassThrough } from 'node:stream';

describe('stable Runloop error details', () => {
  test.each([
    ['UND_ERR_CONNECT_TIMEOUT', 'connection_timeout', 'connect', true],
    ['UND_ERR_HEADERS_TIMEOUT', 'response_headers_timeout', 'response_headers', false],
    ['UND_ERR_BODY_TIMEOUT', 'response_read_timeout', 'response_read', false],
    ['ECONNRESET', 'connection_reset', 'transport', false],
    ['ERR_HTTP2_STREAM_ERROR', 'http2_protocol_error', 'transport', false],
  ])('normalizes %s', async (nativeCode, code, phase, retryable) => {
    const cause = Object.assign(new Error(nativeCode), { code: nativeCode });
    const fetchError = Object.assign(new TypeError('fetch failed'), { cause });
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: (() => Promise.reject(fetchError)) as any,
    });

    const error: any = await client.get('/v1/test').catch((value) => value);
    expect(error).toBeInstanceOf(
      nativeCode === 'UND_ERR_CONNECT_TIMEOUT' ? APIConnectionTimeoutError : APIConnectionError,
    );
    expect(error).toMatchObject({ code, phase, retryable, attempts: 1, cause: fetchError });
  });

  test('distinguishes an SDK-owned AbortError deadline', async () => {
    const lowLevelAbort = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      timeout: 1,
      fetch: ((_url: RequestInfo, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(lowLevelAbort), { once: true });
        })) as any,
    });

    const error: any = await client.get('/v1/test').catch((value) => value);
    expect(error).toBeInstanceOf(APIConnectionTimeoutError);
    expect(error).toMatchObject({
      code: 'request_timeout',
      phase: 'request',
      retryable: true,
      attempts: 1,
      cause: lowLevelAbort,
    });
  });

  test('normalizes an injected HTTP/2 idle GOAWAY and preserves its cause', async () => {
    const cause = Object.assign(new Error('HTTP/2 connection terminated: idle_timeout'), {
      code: 'ERR_HTTP2_GOAWAY_SESSION',
    });
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: (() => Promise.reject(cause)) as any,
    });

    const error: any = await client.get('/v1/test').catch((value) => value);
    expect(error).toBeInstanceOf(APIConnectionError);
    expect(error).toMatchObject({
      code: 'http2_idle_timeout',
      phase: 'response_read',
      retryable: false,
      attempts: 1,
      cause,
    });
  });

  test('parses a tunnel readiness response with header precedence', async () => {
    const fetch = jest.fn((_url: RequestInfo, _init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'legacy_code',
            message: 'Tunnel service is starting',
            retryable: true,
            phase: 'readiness',
            request_id: 'body-request',
            details: { state: 'starting' },
          }),
          {
            status: 503,
            headers: {
              'content-type': 'application/json',
              'x-runloop-error-code': 'tunnel_service_not_ready',
              'x-runloop-request-id': 'header-request',
              'retry-after': '2',
              'x-should-retry': 'true',
            },
          },
        ),
      ),
    );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: fetch as any,
    });

    const error: any = await client.get('/v1/tunnels/readiness').catch((value) => value);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(InternalServerError);
    expect(error.message).toBe('503 Tunnel service is starting');
    expect(error).toMatchObject({
      code: 'tunnel_service_not_ready',
      phase: 'readiness',
      retryable: true,
      requestID: 'header-request',
      retryAfter: 2,
      attempts: 1,
    });
  });

  test('honors retry headers and reports attempts on the final normalized failure', async () => {
    const fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'tunnel_service_not_ready', retryable: true }), {
          status: 503,
          headers: {
            'content-type': 'application/json',
            'x-should-retry': 'true',
            'retry-after': '0',
          },
        }),
      ),
    );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 1,
      fetch: fetch as any,
    });

    const error: any = await client.get('/v1/tunnels/readiness').catch((value) => value);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(error).toMatchObject({ code: 'tunnel_service_not_ready', attempts: 2 });
  });

  test('does not retry execute calls with ambiguous server receipt', async () => {
    const fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'tunnel_unavailable', retryable: true }), {
          status: 503,
          headers: { 'content-type': 'application/json', 'x-should-retry': 'true' },
        }),
      ),
    );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 2,
      fetch: fetch as any,
    });

    const error: any = await client
      .post('/v1/devboxes/dbx/executions/execute', { body: { command: 'true' } })
      .catch((value) => value);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(error.attempts).toBe(1);
  });

  test('tunnel_unavailable remains terminal even when retry headers disagree', async () => {
    const fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'tunnel_unavailable', retryable: true }), {
          status: 503,
          headers: { 'content-type': 'application/json', 'x-should-retry': 'true' },
        }),
      ),
    );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 2,
      fetch: fetch as any,
    });

    const error: any = await client.get('/v1/tunnel').catch((value) => value);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ code: 'tunnel_unavailable', attempts: 1 });
  });

  test('does not blindly retry a response-idle failure', async () => {
    const fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: 'tunnel_backend_idle_timeout', retryable: false }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 2,
      fetch: fetch as any,
    });

    const error: any = await client.get('/v1/tunnel').catch((value) => value);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ code: 'tunnel_backend_idle_timeout', attempts: 1 });
  });

  test('bounds error response body reads with the request deadline', async () => {
    const body = new PassThrough();
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      timeout: 20,
      fetch: (() =>
        Promise.resolve(
          new Response(body, { status: 503, headers: { 'content-type': 'application/json' } }),
        )) as any,
    });

    try {
      const error: any = await client.get('/v1/stalled-error').catch((value) => value);
      expect(error).toBeInstanceOf(APIConnectionTimeoutError);
      expect(error).toMatchObject({ code: 'request_timeout', attempts: 1 });
    } finally {
      body.destroy();
    }
  });

  test('retries a safe request when an error response body reaches the SDK deadline', async () => {
    const stalled = new PassThrough();
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(stalled, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } }),
      );
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 1,
      timeout: 20,
      fetch: fetch as any,
    });

    try {
      await expect(client.get('/v1/retry-safe')).resolves.toEqual({ ok: true });
      expect(fetch).toHaveBeenCalledTimes(2);
    } finally {
      stalled.destroy();
    }
  });

  test('does not mask coded response parser failures as transport errors', async () => {
    const parserError = Object.assign(new Error('custom parser failed'), { code: 'APP_PARSE_ERROR' });
    const response = new Response('{}', { headers: { 'content-type': 'application/json' } });
    response.json = jest.fn().mockRejectedValue(parserError);
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: jest.fn().mockResolvedValue(response) as any,
    });

    await expect(client.get('/v1/custom-parser')).rejects.toBe(parserError);
  });

  test('does not mask uncoded TypeErrors from response parsers as transport errors', async () => {
    const parserError = new TypeError('response body has already been consumed');
    const response = new Response('{}', { headers: { 'content-type': 'application/json' } });
    response.json = jest.fn().mockRejectedValue(parserError);
    const client = new Runloop({
      bearerToken: 'test',
      baseURL: 'https://example.invalid',
      maxRetries: 0,
      fetch: jest.fn().mockResolvedValue(response) as any,
    });

    await expect(client.get('/v1/custom-parser')).rejects.toBe(parserError);
  });

  test('tunnel readiness helper retries only the explicit readiness failure', async () => {
    const notReady = InternalServerError.generate(
      503,
      { error: 'tunnel_service_not_ready', retryable: true, phase: 'readiness' },
      undefined,
      { 'retry-after': '0' },
    );
    const request = jest.fn().mockRejectedValueOnce(notReady).mockResolvedValueOnce('ready');

    await expect(awaitTunnelServiceReady(request, { timeoutMs: 1000, retryIntervalMs: 0 })).resolves.toBe(
      'ready',
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  test('tunnel_unavailable is terminal for tunnel readiness', async () => {
    const unavailable = InternalServerError.generate(
      503,
      { error: 'tunnel_unavailable', retryable: true, phase: 'tunnel_readiness' },
      undefined,
      {},
    );
    const request = jest.fn().mockRejectedValue(unavailable);

    await expect(awaitTunnelServiceReady(request, { timeoutMs: 1_000, retryIntervalMs: 0 })).rejects.toBe(
      unavailable,
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(unavailable.attempts).toBe(1);
  });
});
