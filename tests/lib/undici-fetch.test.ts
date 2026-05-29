import http from 'node:http';
import { Readable } from 'node:stream';
import { Runloop } from '@runloop/api-client';
import { Stream } from '@runloop/api-client/streaming';
import { undiciFetch } from '@runloop/api-client/lib/undici-fetch';
import { MultipartBody } from '@runloop/api-client/_shims/MultipartBody';

describe('undiciFetch', () => {
  let server: http.Server;
  let baseURL: string;
  const requests: Array<{ method: string; url: string; body: string }> = [];

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        server = http.createServer((req, res) => {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            requests.push({ method: req.method ?? '', url: req.url ?? '', body });

            if (req.url === '/json') {
              res.writeHead(200, { 'content-type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
              return;
            }

            if (req.url === '/error') {
              res.writeHead(401, { 'content-type': 'application/json' });
              res.end(JSON.stringify({ error: { message: 'invalid token' } }));
              return;
            }

            if (req.url === '/sse') {
              res.writeHead(200, { 'content-type': 'text/event-stream' });
              res.write('data: {"value":1}\n\n');
              res.end();
              return;
            }

            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ body }));
          });

          server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (address && typeof address === 'object') {
              baseURL = `http://127.0.0.1:${address.port}`;
            }
            resolve();
          });
        });
      }),
  );

  afterAll(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  beforeEach(() => {
    requests.length = 0;
  });

  test('parses a JSON response through SDK core', async () => {
    const client = new Runloop({
      bearerToken: 'test-token',
      baseURL,
      maxRetries: 0,
      http2: true,
    });

    await expect(client.get('/json')).resolves.toEqual({ ok: true });
  });

  test('rejects error responses with a readable body through SDK core', async () => {
    const client = new Runloop({
      bearerToken: 'test-token',
      baseURL,
      maxRetries: 0,
      http2: true,
    });

    await expect(client.get('/error')).rejects.toMatchObject({
      status: 401,
      message: expect.stringMatching(/invalid token/i),
    });
  });

  test('keeps streamed SSE responses consumable', async () => {
    const response = await undiciFetch(`${baseURL}/sse`);
    const stream = Stream.fromSSEResponse<{ value: number }>(response as any, new AbortController());

    const events = [];
    for await (const event of stream) {
      events.push(event);
    }

    expect(events).toEqual([{ value: 1 }]);
  });

  test.each([
    ['string', 'hello'],
    ['buffer', Buffer.from('hello')],
    ['array buffer', new TextEncoder().encode('hello').buffer],
    ['typed array', new Uint8Array(Buffer.from('hello'))],
    ['readable', Readable.from(['hello'])],
    ['multipart body', new MultipartBody(Readable.from(['hello']))],
  ])('normalizes %s request bodies', async (_label, body) => {
    const response = await undiciFetch(`${baseURL}/echo`, {
      method: 'POST',
      body: body as any,
      agent: { shouldBeIgnored: true } as any,
    } as any);

    await expect(response.json()).resolves.toEqual({ body: 'hello' });
  });
});
