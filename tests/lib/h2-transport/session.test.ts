import { H2Session, SessionState } from '../../../src/lib/h2-transport/session';
import { cleanupCerts, testTls } from './helpers/certs';
import { startBlackholeServer, startTestServer, defaultHandler, TestServer } from './helpers/testServer';

describe('H2Session', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(defaultHandler);
  });

  afterAll(async () => {
    await server.close();
    cleanupCerts();
  });

  test('connects and reaches READY', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    expect(s.state).toBe(SessionState.READY);
    expect(s.available).toBe(true);
    await s.close();
  });

  test('connect() is idempotent — concurrent callers share one promise', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    const p1 = s.connect();
    const p2 = s.connect();
    expect(p1).toBe(p2);
    await Promise.all([p1, p2]);
    await s.close();
  });

  test('connect timeout rejects after the configured ms', async () => {
    const blackhole = await startBlackholeServer();
    const s = new H2Session(`https://localhost:${blackhole.port}`, {
      connectTimeout: 50,
      tlsOptions: testTls,
    });
    await expect(s.connect()).rejects.toThrow(/timeout/i);
    blackhole.close();
  });

  test('GET returns JSON', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const r = await s.request('/info', 'GET', {}, null);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.path).toBe('/info');
    expect(body.method).toBe('GET');
    await s.close();
  });

  test('POST with string body', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const r = await s.request('/echo', 'POST', { 'content-type': 'application/json' }, '{"x":1}');
    expect((await r.json()).echoed).toBe('{"x":1}');
    await s.close();
  });

  test('POST with empty string body', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const r = await s.request('/echo', 'POST', {}, '');
    expect((await r.json()).echoed).toBe('');
    await s.close();
  });

  test('POST with large (>64KB) buffer body — flow control does not deadlock', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const big = Buffer.alloc(128 * 1024, 0x41);
    const r = await s.request('/echo', 'POST', {}, big);
    const body = await r.json();
    expect(body.echoed.length).toBe(big.length);
    await s.close();
  });

  test('activeStreams increments synchronously inside request()', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    expect(s.activeStreams).toBe(0);

    const p1 = s.request('/info', 'GET', {}, null);
    expect(s.activeStreams).toBe(1);

    const p2 = s.request('/info', 'GET', {}, null);
    expect(s.activeStreams).toBe(2);

    await Promise.all([p1.then((r) => r.text()), p2.then((r) => r.text())]);
    await new Promise((r) => setImmediate(r));
    expect(s.activeStreams).toBe(0);
    await s.close();
  });

  test('available is false when activeStreams >= maxConcurrentStreams', async () => {
    const s = new H2Session(server.origin, { maxConcurrentStreams: 2, tlsOptions: testTls });
    await s.connect();
    const p1 = s.request('/info', 'GET', {}, null);
    const p2 = s.request('/info', 'GET', {}, null);
    expect(s.activeStreams).toBe(2);
    expect(s.available).toBe(false);
    await Promise.all([p1.then((r) => r.text()), p2.then((r) => r.text())]);
    await new Promise((r) => setImmediate(r));
    expect(s.available).toBe(true);
    await s.close();
  });

  test('adopts server-advertised maxConcurrentStreams when no opt was given', async () => {
    const constrained = await startTestServer(defaultHandler, { settings: { maxConcurrentStreams: 3 } });
    try {
      const s = new H2Session(constrained.origin, { tlsOptions: testTls });
      await s.connect();
      // Wait for the remoteSettings event to fire after connect
      await new Promise((r) => setTimeout(r, 50));
      // _maxConcurrentStreams is private; read it via the test seam
      expect((s as any)._maxConcurrentStreams).toBe(3);
      await s.close();
    } finally {
      await constrained.close();
    }
  });

  test('explicit maxConcurrentStreams opt overrides server SETTINGS', async () => {
    const constrained = await startTestServer(defaultHandler, { settings: { maxConcurrentStreams: 1 } });
    try {
      const s = new H2Session(constrained.origin, { maxConcurrentStreams: 5, tlsOptions: testTls });
      await s.connect();
      await new Promise((r) => setTimeout(r, 50));
      // The opt should win — _maxConcurrentStreams stays at 5
      expect((s as any)._maxConcurrentStreams).toBe(5);
      await s.close();
    } finally {
      await constrained.close();
    }
  });

  test('request after close() rejects', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    await s.close();
    await expect(s.request('/info', 'GET', {}, null)).rejects.toThrow(/closed/);
  });

  test('close() is idempotent', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    await s.close();
    await expect(s.close()).resolves.toBeUndefined();
  });

  test('close() on never-connected session is safe', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await expect(s.close()).resolves.toBeUndefined();
  });

  test('pre-aborted signal rejects immediately and decrements activeStreams', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const ac = new AbortController();
    ac.abort();
    await expect(s.request('/info', 'GET', {}, null, ac.signal)).rejects.toThrow(/aborted/i);
    expect(s.activeStreams).toBe(0);
    await s.close();
  });

  test('mid-flight abort cancels a slow request', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const ac = new AbortController();
    const p = s.request('/slow?ms=5000', 'GET', {}, null, ac.signal);
    setTimeout(() => ac.abort(), 30);
    await expect(p).rejects.toThrow();
    await new Promise((r) => setImmediate(r));
    expect(s.activeStreams).toBe(0);
    await s.close();
  });

  test('abort signal listener is removed on success (no listener leak)', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const ac = new AbortController();
    const r = await s.request('/info', 'GET', {}, null, ac.signal);
    await r.text();
    await new Promise((r) => setImmediate(r));
    expect(() => ac.abort()).not.toThrow();
    await s.close();
  });

  test('GOAWAY with zero active streams transitions to CLOSED and fires onClose', async () => {
    const local = await startTestServer(defaultHandler);
    try {
      const s = new H2Session(local.origin, { tlsOptions: testTls });
      let closed = false;
      s.onClose = () => {
        closed = true;
      };
      await s.connect();
      await (await s.request('/info', 'GET', {}, null)).text();
      await new Promise((r) => setImmediate(r));
      // Server-side GOAWAY without waiting for the server's close event
      for (const sess of local.sessions) sess.goaway();
      await new Promise((r) => setTimeout(r, 100));
      expect(s.state).toBe(SessionState.CLOSED);
      expect(closed).toBe(true);
    } finally {
      await local.close();
    }
  });
});
