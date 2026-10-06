import { Headers, Response } from 'node-fetch';
import { RunloopSDK, NotFoundError } from '../../src/sdk';
import type { Fetch } from '../../src/core';

describe('Secret request boundaries', () => {
  let sdk: RunloopSDK;
  let fetch: jest.Mock<ReturnType<Fetch>, Parameters<Fetch>>;

  beforeEach(() => {
    fetch = jest.fn<ReturnType<Fetch>, Parameters<Fetch>>(
      async () =>
        new Response(JSON.stringify({ message: 'Secret not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
    );
    sdk = new RunloopSDK({ bearerToken: 'synthetic', baseURL: 'https://sdk.invalid', maxRetries: 0, fetch });
  });

  test.each([
    ['getInfo', '', 'GET'],
    ['update', '/update', 'POST'],
    ['delete', '/delete', 'POST'],
  ] as const)('%s stays on the ID route and forwards request options', async (operation, suffix, method) => {
    const exact = sdk.secret.fromId('sec_missing');
    expect(fetch).not.toHaveBeenCalled();
    const options = { headers: { 'x-probe': 'probe' }, idempotencyKey: 'probe' };
    await expect(
      operation === 'update' ? exact.update({ value: 'synthetic' }, options) : exact[operation](options),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(fetch).toHaveBeenCalledTimes(1); // No fallback request to a name route.
    const [url, request] = fetch.mock.calls[0]!;
    expect(new URL(String(url)).pathname).toBe(`/v1/secrets/id/sec_missing${suffix}`);
    expect(request?.method).toBe(method);
    expect(new Headers(request?.headers).get('x-probe')).toBe('probe');
    if (operation !== 'getInfo') expect(new Headers(request?.headers).get('x-request-id')).toBe('probe');
    if (operation === 'update') expect(JSON.parse(String(request?.body))).toEqual({ value: 'synthetic' });
  });

  test.each([
    '',
    '.',
    '..',
    '../NAME',
    '%2e%2e',
    '..%2FNAME',
    'sec_x/../../NAME',
    '../NAME#',
    'sec_x?query',
    'sec_x\\..\\NAME',
    'sec_x\n',
  ])('raw ID operations reject unsafe segment %j without a request', (id) => {
    expect(() => sdk.api.secrets.retrieveById(id)).toThrow(TypeError);
    expect(() => sdk.api.secrets.updateById(id, { value: 'synthetic' })).toThrow(TypeError);
    expect(() => sdk.api.secrets.deleteById(id)).toThrow(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('unsupported ID handles cannot become the literal name undefined', async () => {
    const exact = sdk.secret.fromId('sec_missing');
    // @ts-expect-error ID handles are not name selectors, including for JavaScript callers.
    await expect(sdk.secret.delete(exact)).rejects.toThrow(TypeError);
    // @ts-expect-error Use exact.update(), not the legacy manager.
    await expect(sdk.secret.update(exact, { value: 'synthetic' })).rejects.toThrow(TypeError);
    // @ts-expect-error Environment-secret maps require names or name wrappers, not IDs.
    await expect(sdk.devbox.create({ secrets: { TOKEN: exact } })).rejects.toThrow(TypeError);
    await expect(
      // @ts-expect-error Pass exact.id explicitly to gateway bindings.
      sdk.devbox.create({ gateways: { API: { gateway: 'gwc_test', secret: exact } } }),
    ).rejects.toThrow(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
