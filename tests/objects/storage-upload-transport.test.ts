import { createServer, type Server, type IncomingHttpHeaders } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RunloopSDK } from '../../src/sdk';

// Exercise the generated create response and the real signed PUT together.
describe('signed storage upload contract', () => {
  let server: Server;
  let baseURL: string;
  let sdk: RunloopSDK;
  let directory: string;
  let status: number;
  let uploadHeaders: Record<string, string> | null | undefined;
  let uploads: Array<{ path: string; headers: IncomingHttpHeaders; body: Buffer }>;
  let completed: string[];

  beforeEach(async () => {
    status = 200;
    uploadHeaders = { 'x-ms-blob-type': 'BlockBlob' };
    uploads = [];
    completed = [];
    directory = await mkdtemp(join(tmpdir(), 'storage-contract-'));
    await writeFile(join(directory, 'hello.txt'), 'hello');
    server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const body = Buffer.concat(chunks);
      if (req.method === 'PUT') {
        uploads.push({ path: req.url!, headers: req.headers, body });
        res.writeHead(status, { location: `${baseURL}/must-not-follow` });
        res.end('synthetic-storage-secret');
        return;
      }
      const id = req.url!.includes('/complete') ? req.url!.split('/')[3]! : JSON.parse(body.toString()).name;
      if (req.url!.includes('/complete')) completed.push(id);
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify({
          id,
          upload_url: `${baseURL}/upload/${id}?sig=synthetic-signed-secret`,
          upload_headers: uploadHeaders && { ...uploadHeaders, 'x-upload-object': id },
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server address');
    baseURL = `http://127.0.0.1:${address.port}`;
    sdk = new RunloopSDK({
      bearerToken: 'synthetic-api-secret',
      baseURL,
      maxRetries: 0,
      http2: false,
      defaultHeaders: { 'x-api-default': 'private', cookie: 'session=private' },
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
  });

  test.each(['direct', 'text', 'buffer', 'file', 'directory'] as const)(
    '%s carries the create-time headers without API credentials',
    async (method) => {
      const options = { headers: { 'x-api-option': 'private' } };
      switch (method) {
        case 'direct': {
          const object = await sdk.storageObject.create({ name: method, content_type: 'text' }, options);
          await object.uploadContent('hello');
          await object.complete();
          break;
        }
        case 'text':
          await sdk.storageObject.uploadFromText('hello', method, options);
          break;
        case 'buffer':
          await sdk.storageObject.uploadFromBuffer(Buffer.from('hello'), method, 'text', options);
          break;
        case 'file':
          await sdk.storageObject.uploadFromFile(join(directory, 'hello.txt'), method, options);
          break;
        case 'directory':
          await sdk.storageObject.uploadFromDir(directory, { name: method }, options);
          break;
      }
      expect(completed).toEqual([method]);
      expect(uploads).toHaveLength(1);
      const upload = uploads[0]!;
      expect(upload.headers['x-ms-blob-type']).toBe('BlockBlob');
      expect(upload.headers['x-upload-object']).toBe(method);
      for (const key of ['authorization', 'cookie', 'x-api-default', 'x-api-option']) {
        expect(upload.headers[key]).toBeUndefined();
      }
      if (method !== 'directory') expect(upload.body.toString()).toBe('hello');
      else expect(upload.body.subarray(0, 2)).toEqual(Buffer.from([0x1f, 0x8b]));
    },
  );

  test.each([undefined, null, {}])('accepts URL-only storage instructions: %j', async (headers) => {
    uploadHeaders = headers;
    await sdk.storageObject.uploadFromText('hello', 'url-only');
    expect(uploads).toHaveLength(1);
    expect(uploads[0]!.headers['x-ms-blob-type']).toBeUndefined();
    expect(completed).toEqual(['url-only']);
  });

  test('concurrent distinct objects keep their own signed instructions', async () => {
    const objects = await Promise.all(
      ['first', 'second'].map((name) => sdk.storageObject.create({ name, content_type: 'text' })),
    );
    await Promise.all(objects.map((object) => object.uploadContent(object.id)));
    expect(uploads).toHaveLength(2);
    for (const upload of uploads) {
      expect(upload.headers['x-upload-object']).toBe(upload.body.toString());
      expect(upload.path).toContain(`/upload/${upload.body.toString()}?`);
    }
  });

  test.each([307, 403, 500])(
    'failure %i does not complete, retry, redirect, or expose credentials',
    async (code) => {
      status = code;
      const result = sdk.storageObject.uploadFromText('hello', 'failure');
      await expect(result).rejects.toThrow(code === 307 ? 'during transport' : `HTTP ${code}`);
      await expect(result).rejects.not.toThrow(/synthetic|sig=|http:\/\//);
      expect(uploads).toHaveLength(1);
      expect(completed).toEqual([]);
    },
  );
});
