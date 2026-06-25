import { H2Pool } from '../../../src/lib/h2-transport/pool';
import { cleanupCerts, testTls } from './helpers/certs';
import { defaultHandler, startTestServer, TestServer } from './helpers/testServer';

describe('H2Pool', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(defaultHandler);
  });

  afterAll(async () => {
    await server.close();
    cleanupCerts();
  });

  test('first request initializes the pool', async () => {
    const pool = new H2Pool(server.origin, { minConnections: 2, tlsOptions: testTls });
    const r = await pool.request('/info', 'GET', {}, null);
    expect(r.status).toBe(200);
    expect((pool as any)._sessions.length).toBeGreaterThanOrEqual(2);
    await pool.close();
  });

  test('dispatches multiple sequential requests on one pool', async () => {
    const pool = new H2Pool(server.origin, { minConnections: 1, maxConnections: 1, tlsOptions: testTls });
    for (let i = 0; i < 5; i++) {
      const r = await pool.request(`/item/${i}`, 'GET', {}, null);
      expect((await r.json()).path).toBe(`/item/${i}`);
    }
    await pool.close();
  });

  test('queues requests when sessions are saturated', async () => {
    const pool = new H2Pool(server.origin, {
      minConnections: 1,
      maxConnections: 1,
      maxConcurrentStreams: 2,
      tlsOptions: testTls,
    });
    const responses = await Promise.all(
      Array.from({ length: 6 }, (_, i) => pool.request(`/item/${i}`, 'GET', {}, null)),
    );
    expect(responses).toHaveLength(6);
    for (const r of responses) expect(r.status).toBe(200);
    await pool.close();
  });

  test('concurrent first requests share one _initPromise', async () => {
    const pool = new H2Pool(server.origin, { minConnections: 4, tlsOptions: testTls });
    const responses = await Promise.all(
      Array.from({ length: 8 }, (_, i) => pool.request(`/x/${i}`, 'GET', {}, null)),
    );
    for (const r of responses) expect(r.status).toBe(200);
    expect((pool as any)._sessions.length).toBeLessThanOrEqual(8);
    await pool.close();
  });

  test('init failure is not cached', async () => {
    const pool = new H2Pool('https://localhost:1', { minConnections: 1, tlsOptions: testTls });
    await expect(pool.request('/x', 'GET', {}, null)).rejects.toThrow();
    expect((pool as any)._initPromise).toBeNull();
    await pool.close();
  });

  test('grows past minConnections when saturated, up to maxConnections', async () => {
    const pool = new H2Pool(server.origin, {
      minConnections: 1,
      maxConnections: 3,
      maxConcurrentStreams: 1,
      tlsOptions: testTls,
    });
    await pool.request('/warm', 'GET', {}, null);
    await Promise.all(Array.from({ length: 9 }, (_, i) => pool.request(`/grow/${i}`, 'GET', {}, null)));
    expect((pool as any)._sessions.length).toBeGreaterThan(1);
    expect((pool as any)._sessions.length).toBeLessThanOrEqual(3);
    await pool.close();
  });

  test('_findAvailable picks the least-loaded READY session', async () => {
    const pool = new H2Pool(server.origin, {
      minConnections: 3,
      maxConnections: 3,
      maxConcurrentStreams: 10,
      tlsOptions: testTls,
    });
    await pool.request('/warm', 'GET', {}, null);
    await new Promise((r) => setImmediate(r));

    const sessions = (pool as any)._sessions as Array<{ activeStreams: number }>;
    const ps = Array.from({ length: 6 }, () => pool.request('/slow?ms=80', 'GET', {}, null));
    await new Promise((r) => setImmediate(r));
    const counts = sessions.map((s) => s.activeStreams);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    expect(max - min).toBeLessThanOrEqual(1);
    await Promise.all(ps);
    await pool.close();
  });

  test('close() rejects queued requests with "Pool is closed"', async () => {
    const pool = new H2Pool(server.origin, {
      minConnections: 1,
      maxConnections: 1,
      maxConcurrentStreams: 1,
      tlsOptions: testTls,
    });
    await pool.request('/warm', 'GET', {}, null);
    const slow = pool.request('/slow?ms=500', 'GET', {}, null);
    const queued = pool.request('/info', 'GET', {}, null);
    // Attach the assertion BEFORE close() to avoid an unhandled rejection window.
    const queuedAssertion = expect(queued).rejects.toThrow(/closed/);
    const slowSettled = slow.catch(() => {});
    await new Promise((r) => setImmediate(r));
    await pool.close();
    await queuedAssertion;
    await slowSettled;
  });

  test('request after close() rejects', async () => {
    const pool = new H2Pool(server.origin, { tlsOptions: testTls });
    await pool.close();
    await expect(pool.request('/x', 'GET', {}, null)).rejects.toThrow(/closed/);
  });

  test('close() before initialize() is safe', async () => {
    const pool = new H2Pool(server.origin, { tlsOptions: testTls });
    await expect(pool.close()).resolves.toBeUndefined();
  });
});
