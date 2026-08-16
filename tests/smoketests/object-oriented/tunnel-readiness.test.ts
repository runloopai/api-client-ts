import { Devbox } from '../../../src/sdk/devbox';
import { APIError, InternalServerError } from '../../../src/error';
import { Runloop } from '../../../src';
import { Headers, Response, type RequestInfo, type RequestInit } from 'node-fetch';

describe('object-oriented tunnel readiness', () => {
  test('net helper requests the optional health path through the established tunnel', async () => {
    const response = new Response('ok');
    const asResponse = jest.fn().mockResolvedValue(response);
    const signal = new AbortController().signal;
    const client: any = {
      baseURL: 'https://api.runloop.ai',
      devboxes: {
        retrieve: jest.fn().mockResolvedValue({
          tunnel: {
            tunnel_key: 'tunnel-key',
            auth_mode: 'authenticated',
            auth_token: 'tunnel-token',
          },
        }),
      },
      get: jest.fn().mockReturnValue({ asResponse }),
    };
    const devbox = Devbox.fromId(client, 'dbx');

    await expect(
      devbox.net.awaitTunnelReady(8080, {
        path: '/healthz?ready=1',
        timeoutMs: 1_000,
        signal,
      }),
    ).resolves.toBe(response);

    expect(client.devboxes.retrieve).toHaveBeenCalledWith('dbx', {
      maxRetries: 0,
      timeout: 1_000,
      signal,
    });
    expect(client.get).toHaveBeenCalledWith(
      'https://8080-tunnel-key.tunnel.runloop.ai/healthz?ready=1',
      expect.objectContaining({
        maxRetries: 0,
        signal,
        redirect: 'manual',
        headers: {
          authorization: null,
          'x-runloop-tunnel-authorization': 'Bearer tunnel-token',
        },
      }),
    );
    expect(asResponse).toHaveBeenCalledTimes(1);
  });

  test('does not send API or tunnel credentials to a cross-origin redirect', async () => {
    const calls: Array<{
      url: string;
      authorization: string | null;
      tunnelAuthorization: string | null;
      redirect: string | undefined;
    }> = [];
    const fetch = jest.fn(async (request: RequestInfo, init?: RequestInit): Promise<Response> => {
      const url = request.toString();
      const headers = new Headers(init?.headers);
      const authorization = headers.get('authorization');
      const tunnelAuthorization = headers.get('x-runloop-tunnel-authorization');
      calls.push({ url, authorization, tunnelAuthorization, redirect: init?.redirect });

      if (url === 'https://api.runloop.ai/v1/devboxes/dbx') {
        return new Response(
          JSON.stringify({
            id: 'dbx',
            tunnel: {
              tunnel_key: 'tunnel-key',
              auth_mode: 'authenticated',
              auth_token: 'tunnel-token',
            },
          }),
          { headers: { 'content-type': 'application/json' } },
        );
      }
      if (url === 'https://8080-tunnel-key.tunnel.runloop.ai/health') {
        if (init?.redirect === 'manual') {
          return new Response(undefined, {
            status: 302,
            headers: { location: 'https://attacker.invalid/collect' },
          });
        }
        return fetch('https://attacker.invalid/collect', init);
      }
      return new Response('captured', { status: 200 });
    });
    const client = new Runloop({
      bearerToken: 'api-bearer',
      baseURL: 'https://api.runloop.ai',
      maxRetries: 0,
      fetch: fetch as any,
    });
    const devbox = Devbox.fromId(client, 'dbx');

    const error = await devbox
      .awaitTunnelReady(8080, { path: '/health', timeoutMs: 1_000 })
      .catch((value) => value);

    expect(error).toBeInstanceOf(APIError);
    expect(error).toMatchObject({ status: 302, attempts: 1 });

    expect(calls).toEqual([
      {
        url: 'https://api.runloop.ai/v1/devboxes/dbx',
        authorization: 'Bearer api-bearer',
        tunnelAuthorization: null,
        redirect: undefined,
      },
      {
        url: 'https://8080-tunnel-key.tunnel.runloop.ai/health',
        authorization: null,
        tunnelAuthorization: 'Bearer tunnel-token',
        redirect: 'manual',
      },
    ]);
    expect(calls.filter((call) => call.url.includes('.tunnel.runloop.ai/health'))).toHaveLength(1);
    expect(calls.some((call) => call.url === 'https://attacker.invalid/collect')).toBe(false);
    expect(calls[1]).not.toEqual(
      expect.objectContaining({ authorization: 'Bearer api-bearer', tunnelAuthorization: null }),
    );
  });

  test('Devbox helper delegates to its network operations', async () => {
    const client: any = { baseURL: 'https://api.runloop.ai' };
    const devbox = Devbox.fromId(client, 'dbx');
    const response = new Response('ok');
    const ready = jest.spyOn(devbox.net, 'awaitTunnelReady').mockResolvedValue(response as any);

    await expect(devbox.awaitTunnelReady(3000, { path: '/ready' })).resolves.toBe(response);
    expect(ready).toHaveBeenCalledWith(3000, { path: '/ready' });
  });

  test('tunnel_unavailable is terminal in the object-oriented helper', async () => {
    const unavailable = InternalServerError.generate(
      503,
      { error: 'tunnel_unavailable', retryable: true },
      undefined,
      { 'x-should-retry': 'true' },
    );
    const asResponse = jest.fn().mockRejectedValue(unavailable);
    const client: any = {
      baseURL: 'https://api.runloop.ai',
      devboxes: {
        retrieve: jest.fn().mockResolvedValue({
          tunnel: { tunnel_key: 'tunnel-key', auth_mode: 'open', auth_token: null },
        }),
      },
      get: jest.fn().mockReturnValue({ asResponse }),
    };
    const devbox = Devbox.fromId(client, 'dbx');

    await expect(
      devbox.awaitTunnelReady(8080, { path: '/health', timeoutMs: 1_000, retryIntervalMs: 0 }),
    ).rejects.toBe(unavailable);
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(asResponse).toHaveBeenCalledTimes(1);
    expect(unavailable.attempts).toBe(1);
  });
});
