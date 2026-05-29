import http from 'node:http';
import http2 from 'node:http2';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Readable } from 'node:stream';
import diagnostics_channel from 'node:diagnostics_channel';
import { Agent, fetch as undiciFetchImpl } from 'undici';
import {
  undiciFetch,
  normalizeBody,
  __closeDispatchersForTest,
  H2_MAX_CONNECTIONS,
  H2_MAX_CONCURRENT_STREAMS,
} from '../../src/lib/undici-fetch';
import { MultipartBody } from '../../src/_shims/MultipartBody';

describe('undiciFetch adapter', () => {
  // ── normalizeBody: maps core.ts's body shapes onto valid undici BodyInit ──
  describe('normalizeBody', () => {
    test('passes string / Buffer / typed array through unchanged (non-stream)', () => {
      expect(normalizeBody('hi')).toEqual({ body: 'hi', isStream: false });
      const buf = Buffer.from('b');
      expect(normalizeBody(buf)).toEqual({ body: buf, isStream: false });
      const u8 = new Uint8Array([1, 2]);
      expect(normalizeBody(u8)).toEqual({ body: u8, isStream: false });
    });

    test('wraps an ArrayBuffer in a Buffer', () => {
      const out = normalizeBody(new Uint8Array([1, 2, 3]).buffer);
      expect(out.isStream).toBe(false);
      expect(Buffer.isBuffer(out.body)).toBe(true);
    });

    test('returns an undefined body for null / undefined', () => {
      expect(normalizeBody(null)).toEqual({ body: undefined, isStream: false });
      expect(normalizeBody(undefined)).toEqual({ body: undefined, isStream: false });
    });

    test('converts a Node Readable to a web ReadableStream and flags isStream', () => {
      const out = normalizeBody(Readable.from(['x']));
      expect(out.isStream).toBe(true);
      expect(typeof out.body.getReader).toBe('function'); // WHATWG ReadableStream
    });

    test('unwraps MultipartBody to its inner stream', () => {
      const out = normalizeBody(new MultipartBody(Readable.from(['x'])));
      expect(out.isStream).toBe(true);
      expect(typeof out.body.getReader).toBe('function');
    });
  });

  // ── multiplexing: the shipped pool config multiplexes streams over few sessions ──
  // jest workers don't honor a runtime NODE_TLS_REJECT_UNAUTHORIZED, so the adapter's
  // module-scoped Agent can't reach a self-signed cert here. Instead we build an Agent from
  // the adapter's *exported* constants with an explicit `connect.rejectUnauthorized:false`
  // (which jest does honor) — verifying the values the adapter ships actually multiplex.
  describe('HTTP/2 multiplexing (shipped pool config)', () => {
    let server: http2.Http2SecureServer;
    let url: string;
    let agent: Agent;
    const state = { sessions: 0, inFlight: 0, maxInFlight: 0 };
    const alpn: string[] = [];
    const onConnected = (m: unknown) => {
      const p = (m as { socket?: { alpnProtocol?: string } } | undefined)?.socket?.alpnProtocol;
      if (p) alpn.push(p);
    };

    beforeAll(async () => {
      diagnostics_channel.subscribe('undici:client:connected', onConnected);
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2cert-'));
      const k = path.join(dir, 'k');
      const c = path.join(dir, 'c');
      execFileSync(
        'openssl',
        // prettier-ignore
        ['req','-x509','-newkey','rsa:2048','-nodes','-keyout',k,'-out',c,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],
        { stdio: 'ignore' },
      );
      server = http2.createSecureServer({
        key: fs.readFileSync(k),
        cert: fs.readFileSync(c),
        settings: { maxConcurrentStreams: 200 },
      });
      server.on('session', () => {
        state.sessions++;
      });
      server.on('request', (_req, res) => {
        state.inFlight++;
        state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
        setTimeout(() => {
          state.inFlight--;
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end('{"ok":true}');
        }, 25);
      });
      await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
      url = `https://127.0.0.1:${(server.address() as { port: number }).port}/`;
      agent = new Agent({
        allowH2: true,
        connections: H2_MAX_CONNECTIONS,
        pipelining: H2_MAX_CONCURRENT_STREAMS,
        connect: { rejectUnauthorized: false },
      });
    });

    afterAll(async () => {
      diagnostics_channel.unsubscribe('undici:client:connected', onConnected);
      await agent.close();
      await new Promise<void>((r) => server.close(() => r()));
    });

    test('N concurrent requests reuse <= H2_MAX_CONNECTIONS sessions and overlap', async () => {
      const N = 50;
      const responses = await Promise.all(
        Array.from({ length: N }, () => undiciFetchImpl(url, { dispatcher: agent })),
      );
      const bodies = await Promise.all(responses.map((r) => r.json()));

      expect(bodies).toHaveLength(N);
      expect((bodies as Array<{ ok?: boolean }>).every((b) => b.ok === true)).toBe(true);
      expect(alpn).toContain('h2'); // really h2, not an h1 fallback
      expect(state.sessions).toBeLessThanOrEqual(H2_MAX_CONNECTIONS); // bounded pool, not 1-per-request
      // Genuine stream concurrency: many requests in flight at once. A `pipelining: 1` regression
      // would cap maxInFlight at the connection count, so this is what guards the multiplexing.
      expect(state.maxInFlight).toBeGreaterThan(H2_MAX_CONNECTIONS);
    });
  });

  // ── abort: the real adapter forwards the AbortSignal (plain http, no TLS needed) ──
  describe('abort handling (real undiciFetch)', () => {
    let server: http.Server;
    let base: string;

    beforeAll(async () => {
      server = http.createServer((req, res) => {
        const timer = setTimeout(() => {
          res.writeHead(200);
          res.end('{}');
        }, 10_000);
        timer.unref?.();
        req.on('close', () => clearTimeout(timer));
      });
      await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
      base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    });

    afterAll(async () => {
      await __closeDispatchersForTest();
      await new Promise<void>((r) => server.close(() => r()));
    });

    test('rejects with AbortError when the request signal is aborted', async () => {
      const controller = new AbortController();
      const promise = undiciFetch(`${base}/slow`, { method: 'GET', signal: controller.signal } as any);
      setTimeout(() => controller.abort(), 50);
      await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    });
  });
});
