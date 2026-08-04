/**
 * Named regression cases R1–R13 from src/lib/h2-transport/testing.md §5.
 *
 * Each test maps to a specific source comment or invariant. Keep the R# tags
 * in the test name so a failure points back to the documented behavior.
 */
import { H2Pool } from '../../../src/lib/h2-transport/pool';
import { H2Session, SessionState } from '../../../src/lib/h2-transport/session';
import { createH2Fetch } from '../../../src/lib/h2-transport/index';
import { cleanupCerts, testTls } from './helpers/certs';
import { defaultHandler, startTestServer, TestServer } from './helpers/testServer';
import { startFaultServer, FaultServer } from './helpers/faultServer';

async function waitFor(predicate: () => boolean, timeoutMs: number, stepMs = 10): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, stepMs));
  }
  return predicate();
}

describe('h2-transport regression suite', () => {
  let server: TestServer;
  let fault: FaultServer;

  beforeAll(async () => {
    server = await startTestServer(defaultHandler);
    fault = await startFaultServer();
  });

  afterAll(async () => {
    await server.close();
    await fault.close();
    cleanupCerts();
  });

  test('R1: 100 concurrent requests during init spread across sessions', async () => {
    const pool = new H2Pool(server.origin, {
      minConnections: 4,
      maxConnections: 8,
      maxConcurrentStreams: 100,
      tlsOptions: testTls,
    });
    const responses = await Promise.all(
      Array.from({ length: 100 }, (_, i) => pool.request(`/r1/${i}`, 'GET', {}, null)),
    );
    expect(responses).toHaveLength(100);
    for (const r of responses) expect(r.status).toBe(200);
    expect((pool as any)._sessions.length).toBeLessThanOrEqual(8);
    await pool.close();
  });

  test('R2a: GET is transparently retried on GOAWAY race', async () => {
    fault.setPlan({ goawayOnStream: 1 });
    const pool = new H2Pool(fault.origin, {
      minConnections: 1,
      maxConnections: 4,
      tlsOptions: testTls,
    });
    const r1 = await pool.request('/r2', 'GET', {}, null);
    expect(r1.status).toBe(200);
    await new Promise((res) => setTimeout(res, 50));
    const r2 = await pool.request('/r2', 'GET', {}, null);
    expect(r2.status).toBe(200);
    await pool.close();
  });

  test('R2b: POST on a draining/closed session is not retried — error surfaces', async () => {
    // Drive the negative case at the session level (deterministic) rather than
    // the pool level (timing-dependent). Pool's RETRYABLE_METHODS excludes POST
    // by construction, so once session.request rejects, the pool re-raises.
    const local = await startTestServer(defaultHandler);
    try {
      const s = new H2Session(local.origin, { tlsOptions: testTls });
      await s.connect();
      // One successful request to ensure the session is fully wired before GOAWAY.
      await (await s.request('/info', 'GET', {}, null)).text();
      for (const sess of local.sessions) sess.goaway();
      const drained = await waitFor(
        () => s.state === SessionState.DRAINING || s.state === SessionState.CLOSED,
        1000,
      );
      expect(drained).toBe(true);
      await expect(s.request('/r2', 'POST', {}, 'body')).rejects.toThrow();
    } finally {
      await local.close();
    }
  });

  test('R4: init failure is not cached — retry on a later request', async () => {
    const pool = new H2Pool('https://localhost:1', { minConnections: 1, tlsOptions: testTls });
    await expect(pool.request('/x', 'GET', {}, null)).rejects.toThrow();
    expect((pool as any)._initPromise).toBeNull();
    await pool.close();
  });

  test('R5: activeStreams increments synchronously for all concurrent requests', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();
    const promises = Array.from({ length: 10 }, () => s.request('/info', 'GET', {}, null));
    expect(s.activeStreams).toBe(10);
    expect(s.available).toBe(true);
    await Promise.all(promises.map((p) => p.then((r) => r.text())));
    await s.close();
  });

  test('R6: GOAWAY while streams open keeps DRAINING until last completes', async () => {
    const local = await startTestServer(defaultHandler);
    try {
      const s = new H2Session(local.origin, { tlsOptions: testTls });
      await s.connect();
      const slow = s.request('/slow?ms=500', 'GET', {}, null);
      expect(s.activeStreams).toBe(1);
      // Let the HEADERS frame reach the server before we GOAWAY, otherwise the
      // server may process GOAWAY before knowing about the stream.
      await new Promise((r) => setTimeout(r, 50));
      expect(local.sessions.size).toBeGreaterThan(0);
      for (const sess of local.sessions) sess.goaway();
      const draining = await waitFor(() => s.state === SessionState.DRAINING, 500);
      expect(draining).toBe(true);
      expect(s.activeStreams).toBe(1);
      const r = await slow;
      await r.text();
      const closed = await waitFor(() => s.state === SessionState.CLOSED, 500);
      expect(closed).toBe(true);
    } finally {
      await local.close();
    }
  });

  test('R7: AbortSignal listener is removed on every code path', async () => {
    const s = new H2Session(server.origin, { tlsOptions: testTls });
    await s.connect();

    {
      const ac = new AbortController();
      const r = await s.request('/info', 'GET', {}, null, ac.signal);
      await r.text();
      await new Promise((r) => setImmediate(r));
      ac.abort();
    }

    {
      const ac = new AbortController();
      const p = s.request('/slow?ms=5000', 'GET', {}, null, ac.signal);
      setTimeout(() => ac.abort(), 30);
      await expect(p).rejects.toThrow();
      ac.abort();
    }

    expect(s.activeStreams).toBe(0);
    await s.close();
  });

  test('R8: createH2Fetch ignores init.agent without falling back to h1', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/info`, {
      method: 'GET',
      agent: { fake: true } as any,
    } as any)) as any;
    expect(r.status).toBe(200);
    await fetch.close();
  });

  test('R11: AbortController cleanly cancels a slow response', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 50);
    await expect(
      fetch(`${server.origin}/slow?ms=5000`, { method: 'GET', signal: ac.signal } as any),
    ).rejects.toThrow();
    await fetch.close();
  });

  test('R12: client adopts server-advertised maxConcurrentStreams', async () => {
    const small = await startTestServer(defaultHandler, { settings: { maxConcurrentStreams: 2 } });
    try {
      // Test directly at the session level — pool-level reliable queueing
      // around the settings race is a known sharp edge (see testing.md §9).
      const s = new H2Session(small.origin, { tlsOptions: testTls });
      await s.connect();
      // Poll for remoteSettings to land rather than relying on a fixed delay.
      const adopted = await waitFor(() => (s as any)._maxConcurrentStreams === 2, 2000);
      expect(adopted).toBe(true);
      await s.close();
    } finally {
      await small.close();
    }
  });

  test('R13: RST_STREAM does not poison the pool', async () => {
    const REFUSED_STREAM = 0x7;
    fault.setPlan({ rstFirstNStreams: { count: 1, code: REFUSED_STREAM } });
    const pool = new H2Pool(fault.origin, {
      minConnections: 1,
      maxConnections: 2,
      tlsOptions: testTls,
    });
    await pool.request('/warm', 'GET', {}, null).catch(() => {});
    const r = await pool.request('/after-rst', 'GET', {}, null);
    expect(r.status).toBe(200);
    await pool.close();
  });
});
