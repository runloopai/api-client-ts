/**
 * Standalone multiplex test server for h2load.sh.
 * Logs its port on startup and serves a 1KB JSON body for every request.
 */
import http2 from 'node:http2';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'h2load-srv-'));
const keyPath = path.join(tmp, 'key.pem');
const certPath = path.join(tmp, 'cert.pem');
execFileSync(
  'openssl',
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-days',
    '1',
    '-nodes',
    '-subj',
    '/CN=localhost',
  ],
  { stdio: ['ignore', 'ignore', 'ignore'] },
);
const payload = Buffer.from(JSON.stringify({ ok: true, data: 'x'.repeat(1000) }));

const server = http2.createSecureServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
});
server.on('stream', (stream) => {
  stream.on('error', () => {});
  stream.respond({ ':status': 200, 'content-type': 'application/json' });
  stream.end(payload);
});
server.listen(0, () => {
  const port = (server.address() as any).port;
  console.log(`listening on port ${port}`);
});

process.on('SIGTERM', () => {
  fs.rmSync(tmp, { recursive: true, force: true });
  server.close(() => process.exit(0));
});
