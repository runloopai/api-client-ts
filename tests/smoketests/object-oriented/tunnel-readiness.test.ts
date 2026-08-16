import { Devbox } from '../../../src/sdk/devbox';
import { InternalServerError } from '../../../src/error';
import { Response } from 'node-fetch';

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
        headers: { authorization: 'Bearer tunnel-token' },
      }),
    );
    expect(asResponse).toHaveBeenCalledTimes(1);
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
