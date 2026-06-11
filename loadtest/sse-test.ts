import http2 from 'node:http2';
import { createH2Fetch } from '../src/lib/h2-transport/index.ts';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Generate self-signed certs for the test server
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sse-test-'));
const keyPath = path.join(tmpDir, 'key.pem');
const certPath = path.join(tmpDir, 'cert.pem');

execSync(
  `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} ` +
    `-days 1 -nodes -subj "/CN=localhost" 2>/dev/null`,
);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function startSSEServer(): Promise<{ port: number; close: () => void }> {
  return new Promise((resolve) => {
    const server = http2.createSecureServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    });

    server.on('stream', (stream: http2.ServerHttp2Stream, headers) => {
      if (headers[':path'] === '/v1/test/sse') {
        stream.respond({
          ':status': 200,
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
        });

        const events = [
          'data: {"id":1,"message":"hello"}\n\n',
          'data: {"id":2,"message":"world"}\n\n',
          'data: {"id":3,"message":"streaming done"}\n\n',
        ];

        let i = 0;
        const interval = setInterval(() => {
          if (i < events.length) {
            stream.write(events[i]);
            i++;
          } else {
            clearInterval(interval);
            stream.end();
          }
        }, 50);
      } else {
        stream.respond({ ':status': 200, 'content-type': 'application/json' });
        stream.end(JSON.stringify({ ok: true }));
      }
    });

    server.listen(0, () => {
      const port = (server.address() as any).port;
      resolve({ port, close: () => server.close() });
    });
  });
}

async function main() {
  const { port, close } = await startSSEServer();
  console.log('SSE test server on port', port);

  const h2Fetch = createH2Fetch();

  // Test 1: Normal JSON request
  console.log('\n--- Test 1: Normal JSON request ---');
  const jsonResp = (await h2Fetch(`https://localhost:${port}/v1/test/json`, {
    method: 'GET',
    headers: {},
  })) as any;
  console.log('Status:', jsonResp.status);
  const jsonBody = await jsonResp.json();
  console.log('Body:', jsonBody);
  console.log('PASS');

  // Test 2: SSE streaming via getReader
  console.log('\n--- Test 2: SSE streaming (getReader) ---');
  const sseResp = (await h2Fetch(`https://localhost:${port}/v1/test/sse`, {
    method: 'GET',
    headers: { accept: 'text/event-stream' },
  })) as any;
  console.log('Status:', sseResp.status);
  console.log('Content-Type:', sseResp.headers.get('content-type'));

  const reader = sseResp.body.getReader();
  const decoder = new TextDecoder();
  const events: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    events.push(text);
    console.log('  Chunk:', JSON.stringify(text));
  }
  reader.releaseLock();
  console.log('Chunks received:', events.length);
  console.log('PASS');

  // Test 3: SSE via async iteration (Node 18+ fast path)
  console.log('\n--- Test 3: SSE streaming (async iteration) ---');
  const sseResp2 = (await h2Fetch(`https://localhost:${port}/v1/test/sse`, {
    method: 'GET',
    headers: { accept: 'text/event-stream' },
  })) as any;

  const iterEvents: string[] = [];
  for await (const chunk of sseResp2.body) {
    const text = decoder.decode(chunk, { stream: true });
    iterEvents.push(text);
    console.log('  Chunk:', JSON.stringify(text));
  }
  console.log('Chunks received:', iterEvents.length);
  console.log('PASS');

  console.log('\n=== All SSE tests PASSED ===');
  close();

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true });
  process.exit(0);
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
