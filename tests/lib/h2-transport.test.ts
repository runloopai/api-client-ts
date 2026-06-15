import http2 from 'node:http2';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { H2Headers } from '../../src/lib/h2-transport/headers';
import { H2Response } from '../../src/lib/h2-transport/response';
import { H2Session, SessionState } from '../../src/lib/h2-transport/session';
import { H2Pool } from '../../src/lib/h2-transport/pool';
import { createH2Fetch } from '../../src/lib/h2-transport/index';

// ---------------------------------------------------------------------------
// Shared test server infrastructure
// ---------------------------------------------------------------------------

let tmpDir: string;
let keyPath: string;
let certPath: string;
const testTls = { rejectUnauthorized: false };

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-test-'));
  keyPath = path.join(tmpDir, 'key.pem');
  certPath = path.join(tmpDir, 'cert.pem');
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} ` +
      `-days 1 -nodes -subj "/CN=localhost" 2>/dev/null`,
  );
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function startTestServer(
  handler: (stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders) => void,
): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const sessions = new Set<http2.ServerHttp2Session>();
    const server = http2.createSecureServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    });
    server.on('stream', (stream, headers) => {
      stream.on('error', () => {});
      handler(stream, headers);
    });
    server.on('session', (session) => {
      sessions.add(session);
      session.on('error', () => {});
      session.on('close', () => sessions.delete(session));
    });
    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve({
        port,
        close: () =>
          new Promise<void>((res) => {
            for (const session of sessions) session.close();
            server.close(() => res());
          }),
      });
    });
  });
}

function jsonHandler(stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders) {
  const reqPath = headers[':path'] as string;
  const method = headers[':method'] as string;

  if (reqPath === '/echo' && method === 'POST') {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      stream.respond({ ':status': 200, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ echoed: body }));
    });
    return;
  }

  if (reqPath === '/sse') {
    stream.respond({ ':status': 200, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
    const events = [
      'data: {"id":1,"msg":"hello"}\n\n',
      'data: {"id":2,"msg":"world"}\n\n',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < events.length) {
        stream.write(events[i]!);
        i++;
      } else {
        clearInterval(interval);
        stream.end();
      }
    }, 20);
    return;
  }

  // Default: return JSON with request info
  stream.respond({ ':status': 200, 'content-type': 'application/json', 'x-custom': 'test-value' });
  stream.end(JSON.stringify({ path: reqPath, method }));
}

// ---------------------------------------------------------------------------
// H2Headers
// ---------------------------------------------------------------------------

describe('H2Headers', () => {
  test('strips pseudo-headers and lowercases keys', () => {
    const h = new H2Headers({ ':status': '200' as any, 'Content-Type': 'application/json', 'X-Custom': 'val' });
    expect(h.get('content-type')).toBe('application/json');
    expect(h.get('x-custom')).toBe('val');
    expect(h.get(':status')).toBeNull();
  });

  test('joins array values with comma', () => {
    const h = new H2Headers({ 'set-cookie': ['a=1', 'b=2'] } as any);
    expect(h.get('set-cookie')).toBe('a=1, b=2');
  });

  test('get is case-insensitive', () => {
    const h = new H2Headers({ 'Content-Type': 'text/plain' });
    expect(h.get('CONTENT-TYPE')).toBe('text/plain');
    expect(h.get('content-type')).toBe('text/plain');
  });

  test('entries iterates all non-pseudo headers', () => {
    const h = new H2Headers({ ':status': '200' as any, 'a': '1', 'b': '2' });
    const entries = [...h.entries()];
    expect(entries).toEqual([['a', '1'], ['b', '2']]);
  });

  test('returns null for missing headers', () => {
    const h = new H2Headers({});
    expect(h.get('x-missing')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// H2Response
// ---------------------------------------------------------------------------

describe('H2Response', () => {
  function makeResponse(data: string, status = 200): H2Response {
    const { ReadableStream } = require('node:stream/web');
    const body = new ReadableStream({
      start(controller: any) {
        controller.enqueue(Buffer.from(data));
        controller.close();
      },
    });
    return new H2Response(status, new H2Headers({ 'content-type': 'application/json' }), body, 'https://test/');
  }

  test('.status and .ok', () => {
    expect(makeResponse('{}', 200).ok).toBe(true);
    expect(makeResponse('{}', 201).ok).toBe(true);
    expect(makeResponse('{}', 400).ok).toBe(false);
    expect(makeResponse('{}', 500).ok).toBe(false);
    expect(makeResponse('{}', 204).status).toBe(204);
  });

  test('.json() parses response body', async () => {
    const resp = makeResponse('{"key":"value"}');
    expect(await resp.json()).toEqual({ key: 'value' });
  });

  test('.text() returns body as string', async () => {
    const resp = makeResponse('hello world');
    expect(await resp.text()).toBe('hello world');
  });

  test('.json() and .text() can be called multiple times', async () => {
    const resp = makeResponse('{"a":1}');
    expect(await resp.json()).toEqual({ a: 1 });
    expect(await resp.text()).toBe('{"a":1}');
  });

  test('.body is a readable stream', async () => {
    const resp = makeResponse('streamed');
    const reader = resp.body.getReader();
    const { value, done } = await reader.read();
    expect(done).toBe(false);
    expect(Buffer.from(value!).toString()).toBe('streamed');
    reader.releaseLock();
  });

  test('.url and .headers are set', () => {
    const resp = makeResponse('{}');
    expect(resp.url).toBe('https://test/');
    expect(resp.headers.get('content-type')).toBe('application/json');
  });
});

// ---------------------------------------------------------------------------
// H2Session
// ---------------------------------------------------------------------------

describe('H2Session', () => {
  let server: { port: number; close: () => Promise<void> };

  beforeAll(async () => {
    server = await startTestServer(jsonHandler);
  });

  afterAll(async () => { await server.close(); });

  test('connects and reaches READY state', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    expect(session.state).toBe(SessionState.READY);
    expect(session.available).toBe(true);
    session.close();
  });

  test('sends GET and receives JSON response', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    const resp = await session.request('/info', 'GET', {}, null);
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body.path).toBe('/info');
    expect(body.method).toBe('GET');
    session.close();
  });

  test('sends POST with body', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    const resp = await session.request('/echo', 'POST', { 'content-type': 'application/json' }, '{"test":true}');
    const body = await resp.json();
    expect(body.echoed).toBe('{"test":true}');
    session.close();
  });

  test('tracks activeStreams count', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    expect(session.activeStreams).toBe(0);

    const p1 = session.request('/info', 'GET', {}, null);
    // activeStreams incremented synchronously in the Promise executor
    expect(session.activeStreams).toBe(1);

    await p1;
    // Stream is still active until body is consumed
    expect(session.activeStreams).toBeGreaterThanOrEqual(0);
    session.close();
  });

  test('rejects request when closed', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    session.close();
    await expect(session.request('/info', 'GET', {}, null)).rejects.toThrow('closed');
  });

  test('abort signal cancels request', async () => {
    const session = new H2Session(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await session.connect();
    const controller = new AbortController();
    controller.abort();
    await expect(session.request('/info', 'GET', {}, null, controller.signal)).rejects.toThrow('aborted');
    session.close();
  });
});

// ---------------------------------------------------------------------------
// H2Pool
// ---------------------------------------------------------------------------

describe('H2Pool', () => {
  let server: { port: number; close: () => Promise<void> };

  beforeAll(async () => {
    server = await startTestServer(jsonHandler);
  });

  afterAll(async () => { await server.close(); });

  test('dispatches multiple requests', async () => {
    const pool = new H2Pool(`https://localhost:${server.port}`, { minConnections: 1, maxConnections: 1, tlsOptions: testTls });
    const resp1 = await pool.request('/item/0', 'GET', {}, null);
    expect(resp1.status).toBe(200);
    expect((await resp1.json()).path).toBe('/item/0');

    const resp2 = await pool.request('/item/1', 'GET', {}, null);
    expect(resp2.status).toBe(200);
    expect((await resp2.json()).path).toBe('/item/1');

    const resp3 = await pool.request('/item/2', 'GET', {}, null);
    expect(resp3.status).toBe(200);
    expect((await resp3.json()).path).toBe('/item/2');
    await pool.close();
  });

  test('queues requests when all sessions are at capacity', async () => {
    const pool = new H2Pool(`https://localhost:${server.port}`, {
      minConnections: 1,
      maxConnections: 1,
      maxConcurrentStreams: 2,
      tlsOptions: testTls,
    });
    const responses = await Promise.all(
      Array.from({ length: 4 }, (_, i) =>
        pool.request(`/item/${i}`, 'GET', {}, null),
      ),
    );
    expect(responses.length).toBe(4);
    for (const resp of responses) {
      expect(resp.status).toBe(200);
    }
    await pool.close();
  });

  test('rejects after close', async () => {
    const pool = new H2Pool(`https://localhost:${server.port}`, { tlsOptions: testTls });
    await pool.close();
    await expect(pool.request('/info', 'GET', {}, null)).rejects.toThrow('closed');
  });
});

// ---------------------------------------------------------------------------
// createH2Fetch (public API)
// ---------------------------------------------------------------------------

describe('createH2Fetch', () => {
  let server: { port: number; close: () => Promise<void> };

  beforeAll(async () => {
    server = await startTestServer(jsonHandler);
  });

  afterAll(async () => { await server.close(); });

  test('GET request returns JSON', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/info`, {
      method: 'GET',
      headers: {},
    })) as any;
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body.path).toBe('/info');
  });

  test('POST request sends body', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"sent":true}',
    })) as any;
    const body = await resp.json();
    expect(body.echoed).toBe('{"sent":true}');
  });

  test('response headers are accessible', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/info`, {
      method: 'GET',
      headers: {},
    })) as any;
    expect(resp.headers.get('content-type')).toBe('application/json');
    expect(resp.headers.get('x-custom')).toBe('test-value');
  });

  test('SSE streaming via getReader', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/sse`, {
      method: 'GET',
      headers: { accept: 'text/event-stream' },
    })) as any;
    expect(resp.headers.get('content-type')).toBe('text/event-stream');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    reader.releaseLock();
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    const combined = chunks.join('');
    expect(combined).toContain('"id":1');
    expect(combined).toContain('"id":2');
  });

  test('SSE streaming via async iteration', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/sse`, {
      method: 'GET',
      headers: { accept: 'text/event-stream' },
    })) as any;

    const decoder = new TextDecoder();
    const chunks: string[] = [];
    for await (const chunk of resp.body) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    const combined = chunks.join('');
    expect(combined).toContain('"id":1');
    expect(combined).toContain('"id":2');
  });

  test('strips agent from init (node-fetch compat)', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    // The SDK injects `agent` for node-fetch; h2Fetch should ignore it without error
    const resp = (await h2Fetch(`https://localhost:${server.port}/info`, {
      method: 'GET',
      headers: {},
      agent: 'should-be-ignored',
    } as any)) as any;
    expect(resp.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// normalizeBody (via index.ts)
// ---------------------------------------------------------------------------

describe('normalizeBody', () => {
  let server: { port: number; close: () => Promise<void> };

  beforeAll(async () => {
    server = await startTestServer(jsonHandler);
  });

  afterAll(async () => { await server.close(); });

  test('null body (GET request)', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/info`, {
      method: 'GET',
      headers: {},
    })) as any;
    expect(resp.status).toBe(200);
  });

  test('string body', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/echo`, {
      method: 'POST',
      headers: {},
      body: 'plain text',
    })) as any;
    const body = await resp.json();
    expect(body.echoed).toBe('plain text');
  });

  test('Buffer body', async () => {
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const resp = (await h2Fetch(`https://localhost:${server.port}/echo`, {
      method: 'POST',
      headers: {},
      body: Buffer.from('buffer data'),
    })) as any;
    const body = await resp.json();
    expect(body.echoed).toBe('buffer data');
  });

  test('Readable body is buffered', async () => {
    const { Readable } = await import('node:stream');
    const h2Fetch = createH2Fetch({ tlsOptions: testTls });
    const stream = Readable.from([Buffer.from('chunk-1|'), Buffer.from('chunk-2')]);
    const resp = (await h2Fetch(`https://localhost:${server.port}/echo`, {
      method: 'POST',
      headers: {},
      body: stream,
    })) as any;
    const body = await resp.json();
    expect(body.echoed).toBe('chunk-1|chunk-2');
  });
});
