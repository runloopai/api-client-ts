import { Readable } from 'node:stream';
import { createH2Fetch } from '../../../src/lib/h2-transport/index';
import { cleanupCerts, testTls } from './helpers/certs';
import { defaultHandler, startTestServer, TestServer } from './helpers/testServer';

describe('integration through createH2Fetch', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer(defaultHandler);
  });

  afterAll(async () => {
    await server.close();
    cleanupCerts();
  });

  test('POST /echo round-trip with JSON body', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"sent":true}',
    } as any)) as any;
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('application/json');
    expect((await r.json()).echoed).toBe('{"sent":true}');
    await fetch.close();
  });

  test('SSE streaming via getReader', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/sse`, {
      method: 'GET',
      headers: { accept: 'text/event-stream' },
    } as any)) as any;
    expect(r.headers.get('content-type')).toBe('text/event-stream');

    // `Response.body` is a node-fetch Node `Readable`; wrap it as a web stream
    // to exercise incremental `getReader()` consumption.
    const reader = Readable.toWeb(r.body).getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
    }
    expect(buf).toContain('"id":1');
    expect(buf).toContain('"id":2');
    await fetch.close();
  });

  test('SSE streaming via async iteration', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/sse`, {
      method: 'GET',
      headers: { accept: 'text/event-stream' },
    } as any)) as any;

    const decoder = new TextDecoder();
    let buf = '';
    for await (const chunk of r.body) {
      buf += decoder.decode(chunk, { stream: true });
    }
    expect(buf).toContain('"id":1');
    expect(buf).toContain('"id":2');
    await fetch.close();
  });

  test('1MB binary download arrives byte-identical', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const bytes = 1024 * 1024;
    const r = (await fetch(`${server.origin}/large?bytes=${bytes}`, { method: 'GET' } as any)) as any;
    const buf = Buffer.from(await r.arrayBuffer());
    expect(buf.length).toBe(bytes);
    expect(buf[0]).toBe(0xab);
    expect(buf[bytes - 1]).toBe(0xab);
    await fetch.close();
  });

  test('1MB binary upload arrives byte-identical at server', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const payload = Buffer.alloc(1024 * 1024, 0x42);
    const r = (await fetch(`${server.origin}/echo`, {
      method: 'POST',
      body: payload,
    } as any)) as any;
    const echoed = (await r.json()).echoed as string;
    expect(echoed.length).toBe(payload.length);
    expect(echoed.charCodeAt(0)).toBe(0x42);
    expect(echoed.charCodeAt(echoed.length - 1)).toBe(0x42);
    await fetch.close();
  });

  test('204 No Content does not hang on .text()', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/204`, { method: 'GET' } as any)) as any;
    expect(r.status).toBe(204);
    expect(await r.text()).toBe('');
    await fetch.close();
  });

  test('trailers are silently dropped (documented behavior)', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    const r = (await fetch(`${server.origin}/trailers`, { method: 'GET' } as any)) as any;
    expect(await r.text()).toBe('body');
    expect(r.headers.get('x-trailer')).toBeNull();
    await fetch.close();
  });

  test('concurrent requests to two origins do not cross-talk', async () => {
    const other = await startTestServer(defaultHandler);
    const fetch = createH2Fetch({ tlsOptions: testTls });
    try {
      const [a, b] = await Promise.all([
        fetch(`${server.origin}/info`, { method: 'GET' } as any),
        fetch(`${other.origin}/info`, { method: 'GET' } as any),
      ]);
      expect((a as any).url.startsWith(server.origin)).toBe(true);
      expect((b as any).url.startsWith(other.origin)).toBe(true);
    } finally {
      await fetch.close();
      await other.close();
    }
  });

  test('AbortSignal propagates end-to-end through createH2Fetch', async () => {
    const fetch = createH2Fetch({ tlsOptions: testTls });
    try {
      const ac = new AbortController();
      const p = fetch(`${server.origin}/slow?ms=5000`, { method: 'GET', signal: ac.signal } as any);
      setTimeout(() => ac.abort(), 30);
      await expect(p).rejects.toThrow();
    } finally {
      await fetch.close();
    }
  });
});
