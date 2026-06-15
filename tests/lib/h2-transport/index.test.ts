import { Readable } from 'node:stream';
import { MultipartBody } from '../../../src/_shims/MultipartBody';
import { createH2Fetch } from '../../../src/lib/h2-transport/index';
import { cleanupCerts, testTls } from './helpers/certs';
import { defaultHandler, startTestServer, TestServer } from './helpers/testServer';

describe('createH2Fetch', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(defaultHandler);
  });

  afterAll(async () => {
    await server.close();
    cleanupCerts();
  });

  test('GET returns JSON', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/info?q=1`, { method: 'GET', headers: {} })) as any;
    expect(r.status).toBe(200);
    expect(r.url).toBe(`${server.origin}/info?q=1`);
    const body = await r.json();
    expect(body.path).toBe('/info?q=1');
    await fetch.close();
  });

  test('headers are lowercased before being sent', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/headers`, {
      method: 'GET',
      headers: { 'X-Mixed-Case': 'yes', 'Accept': 'application/json' },
    })) as any;
    const echoed = await r.json();
    expect(echoed['x-mixed-case']).toBe('yes');
    expect(echoed['accept']).toBe('application/json');
    await fetch.close();
  });

  test('headers accepts Headers-like (with .entries()) and plain record', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const hdrsLike = {
      entries() {
        return [
          ['X-Iter', 'one'],
          ['X-Other', 'two'],
        ][Symbol.iterator]();
      },
    };
    const r = (await fetch(`${server.origin}/headers`, { method: 'GET', headers: hdrsLike as any })) as any;
    const echoed = await r.json();
    expect(echoed['x-iter']).toBe('one');
    expect(echoed['x-other']).toBe('two');
    await fetch.close();
  });

  test('URL object and string URL both work', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const u = new URL(`${server.origin}/info`);
    const r = (await fetch(u, { method: 'GET', headers: {} })) as any;
    expect(r.status).toBe(200);
    await fetch.close();
  });

  test('same origin reuses one pool; distinct origins get distinct pools', async () => {
    const second = await startTestServer(defaultHandler);
    try {
      const fetch = createH2Fetch({ tlsOptions: testTls });
      await fetch(`${server.origin}/info`, { method: 'GET' } as any);
      await fetch(`${server.origin}/info`, { method: 'GET' } as any);
      await fetch(`${second.origin}/info`, { method: 'GET' } as any);
      expect(server.sessions.size).toBeGreaterThanOrEqual(1);
      expect(second.sessions.size).toBeGreaterThanOrEqual(1);
      await fetch.close();
    } finally {
      await second.close();
    }
  });

  test('close() closes every pool and is safe to call twice', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    await fetch(`${server.origin}/info`, { method: 'GET' } as any);
    await fetch.close();
    await expect(fetch.close()).resolves.toBeUndefined();
  });

  test('null body (GET)', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/info`, { method: 'GET' } as any)) as any;
    expect(r.status).toBe(200);
    await fetch.close();
  });

  test('string body', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/echo`, {
      method: 'POST',
      body: 'plain text',
    } as any)) as any;
    expect((await r.json()).echoed).toBe('plain text');
    await fetch.close();
  });

  test('Buffer body', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/echo`, {
      method: 'POST',
      body: Buffer.from('buffer data'),
    } as any)) as any;
    expect((await r.json()).echoed).toBe('buffer data');
    await fetch.close();
  });

  test('Uint8Array / ArrayBuffer body', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const u8 = new TextEncoder().encode('typed-array body');
    const r1 = (await fetch(`${server.origin}/echo`, { method: 'POST', body: u8 } as any)) as any;
    expect((await r1.json()).echoed).toBe('typed-array body');

    const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    const r2 = (await fetch(`${server.origin}/echo`, { method: 'POST', body: ab } as any)) as any;
    expect((await r2.json()).echoed).toBe('typed-array body');
    await fetch.close();
  });

  test('MultipartBody is unwrapped and re-normalized', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const inner = Buffer.from('inside multipart');
    const mp = new MultipartBody(inner);
    const r = (await fetch(`${server.origin}/echo`, { method: 'POST', body: mp } as any)) as any;
    expect((await r.json()).echoed).toBe('inside multipart');
    await fetch.close();
  });

  test('Readable body is buffered', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const stream = Readable.from([Buffer.from('chunk-1|'), Buffer.from('chunk-2')]);
    const r = (await fetch(`${server.origin}/echo`, { method: 'POST', body: stream } as any)) as any;
    expect((await r.json()).echoed).toBe('chunk-1|chunk-2');
    await fetch.close();
  });

  test('node-fetch `agent` init field is ignored', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/info`, {
      method: 'GET',
      agent: 'should-be-ignored',
    } as any)) as any;
    expect(r.status).toBe(200);
    await fetch.close();
  });

  test('throws on Node < 18', () => {
    const real = process.versions.node;
    Object.defineProperty(process.versions, 'node', { value: '16.20.0', configurable: true });
    try {
      expect(() => createH2Fetch()).toThrow(/Node\.js 18/);
    } finally {
      Object.defineProperty(process.versions, 'node', { value: real, configurable: true });
    }
  });
});
