import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let cached: { key: Buffer; cert: Buffer; tmpDir: string } | null = null;

/**
 * Generate (once per process) a self-signed cert for localhost and return the
 * key/cert buffers. Cleanup happens via cleanupCerts() in a global afterAll.
 *
 * Uses execFileSync (argv array, no shell) so paths containing spaces or
 * shell metacharacters — common on Windows/macOS user dirs — don't break.
 */
export function ensureCerts(): { key: Buffer; cert: Buffer } {
  if (cached) return { key: cached.key, cert: cached.cert };

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-test-'));
  const keyPath = path.join(tmpDir, 'key.pem');
  const certPath = path.join(tmpDir, 'cert.pem');
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
  cached = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    tmpDir,
  };
  return { key: cached.key, cert: cached.cert };
}

export function cleanupCerts(): void {
  if (cached) {
    fs.rmSync(cached.tmpDir, { recursive: true, force: true });
    cached = null;
  }
}

export const testTls = { rejectUnauthorized: false };
