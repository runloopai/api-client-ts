import { resolveHttp2Fetch } from '../../src/lib/http2-transport';

describe('resolveHttp2Fetch', () => {
  test('defaults to HTTP/2 and shares a single pool across clients', () => {
    const a = resolveHttp2Fetch({});
    const b = resolveHttp2Fetch({});
    const explicitTrue = resolveHttp2Fetch({ http2: true });
    expect(a).toBeDefined();
    // Same instance — short-lived clients must not each open their own pool.
    expect(b).toBe(a);
    expect(explicitTrue).toBe(a);
  });

  test('http2: false falls back to HTTP/1.1 (undefined fetch)', () => {
    expect(resolveHttp2Fetch({ http2: false })).toBeUndefined();
  });

  test('H2FetchOptions gets a dedicated pool, not the shared default', () => {
    const shared = resolveHttp2Fetch({});
    const tuned = resolveHttp2Fetch({ http2: { maxConnections: 2 } });
    expect(tuned).toBeDefined();
    expect(tuned).not.toBe(shared);
  });

  test('bare httpAgent keeps HTTP/1.1 and warns once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(resolveHttp2Fetch({ httpAgent: {} })).toBeUndefined();
      expect(resolveHttp2Fetch({ httpAgent: {} })).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('HTTP/1.1');
    } finally {
      warn.mockRestore();
    }
  });

  test('http2 + httpAgent uses H2 and warns that httpAgent is ignored', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const shared = resolveHttp2Fetch({});
      expect(resolveHttp2Fetch({ http2: true, httpAgent: {} })).toBe(shared);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('httpAgent');
    } finally {
      warn.mockRestore();
    }
  });
});
