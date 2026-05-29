/**
 * HTTP/2 transport micro-benchmark — settles "#791 lacks the perf bump that #792 adds".
 *
 * Runs entirely locally against a self-signed node:http2 server (no API key, no network).
 * The SERVER counts how many TLS connections / H2 sessions each transport opens for N
 * concurrent requests — that is the ground truth for "does it multiplex?". We also record
 * latency percentiles, wall time, failures, and whether a transport crashes the process.
 *
 * Transports under test (faithful to each branch's src/lib/undici-fetch.ts):
 *   - undici-allowH2   = PR #791  (undici Agent({ allowH2:true }), default pipelining=1 → no multiplexing)
 *   - undici-Pool/Agent pipelining=64 = THIS branch (bounded pool that multiplexes; needs undici >= 7.23.0)
 *   - node-http2-pool  = PR #792  (verbatim copy of the hand-rolled H2Pool, types stripped)
 *   - undici-h1        = baseline (undici Agent({ allowH2:false, connections:4 }))
 *
 * Usage (needs undici resolvable from cwd; >= 7.23.0 for the pipelining variants — multiplexed
 * H2 assert-crashes on 6.x, see undici PR #4845):
 *   node h2-transport-bench.mjs
 *   REQUESTS=2000 SERVER_DELAY_MS=25 MAX_STREAMS=100 node h2-transport-bench.mjs
 *   ONLY=poolpipe,agentpipe,792 node h2-transport-bench.mjs
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // localhost self-signed cert only

import http2 from 'node:http2';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import diagnosticsChannel from 'node:diagnostics_channel';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { Readable } from 'node:stream';
import { Agent, Pool, Headers, Response, fetch as undiciFetchImpl, request as undiciRequest } from 'undici';

const REQUESTS = Number(process.env.REQUESTS ?? 1000);
const SERVER_DELAY_MS = Number(process.env.SERVER_DELAY_MS ?? 20);
const MAX_STREAMS = Number(process.env.MAX_STREAMS ?? 100); // server's SETTINGS_MAX_CONCURRENT_STREAMS

let crashes = 0;
const crashMsgs = new Set();
process.on('uncaughtException', (e) => { crashes++; crashMsgs.add(String(e?.message ?? e)); });
process.on('unhandledRejection', (e) => { crashes++; crashMsgs.add(String(e?.message ?? e)); });

// ───────────────────────── transport #791: undici Agent allowH2 ─────────────────────────
const agent791 = new Agent({ allowH2: true, keepAliveTimeout: 600000, keepAliveMaxTimeout: 600000 });
function fetch791(url, init) {
  const { agent: _a, signal, ...rest } = init ?? {};
  return undiciFetchImpl(url, { ...rest, dispatcher: agent791, signal: signal ?? undefined });
}

// ───────────────────────── baseline: undici h1 (4 connections) ─────────────────────────
const agentH1 = new Agent({ allowH2: false, connections: 4, keepAliveTimeout: 600000, keepAliveMaxTimeout: 600000 });
function fetchH1(url, init) {
  const { agent: _a, signal, ...rest } = init ?? {};
  return undiciFetchImpl(url, { ...rest, dispatcher: agentH1, signal: signal ?? undefined });
}

// ════════════════ transport #792: verbatim copy of H2Pool (types stripped) ════════════════
// Source: PR #792 tode/http2-updates-shared-pool-test:src/lib/undici-fetch.ts. Re-sync if it changes.
class MultipartBody { constructor(body) { this.body = body; } }
const MAX_H2_SESSIONS = 4;
const MAX_H2_STREAMS_PER_SESSION = 64;
const KEEP_ALIVE_TIMEOUT_MS = 10 * 60 * 1000;
const h1Dispatcher = new Agent({ allowH2: false, connections: 4, keepAliveTimeout: KEEP_ALIVE_TIMEOUT_MS, keepAliveMaxTimeout: KEEP_ALIVE_TIMEOUT_MS });
const connectedChannel = diagnosticsChannel.channel('undici:client:connected');
const pools = new Map();
function normalizeBody(body) {
  if (body == null) return undefined;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof MultipartBody) return normalizeBody(body.body);
  if (body instanceof Readable) return body;
  if (ArrayBuffer.isView(body)) return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  return String(body);
}
function toResponseHeaders(headers) {
  const responseHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) { for (const item of value) responseHeaders.append(name, item); }
    else responseHeaders.append(name, value);
  }
  return responseHeaders;
}
function statusMustNotHaveBody(status) { return status === 204 || status === 205 || status === 304; }
function abortError() { const e = new Error('The operation was aborted'); e.name = 'AbortError'; return e; }
function originFor(url) { return `${url.protocol}//${url.host}`; }
function pathFor(url) { return `${url.pathname}${url.search}`; }
function filterH2RequestHeaders(headers) {
  const filtered = {};
  if (!headers) return filtered;
  for (const [rawName, rawValue] of Object.entries(headers)) {
    if (rawValue == null) continue;
    const name = rawName.toLowerCase();
    if (name === 'connection' || name === 'keep-alive' || name === 'proxy-connection' || name === 'transfer-encoding' || name === 'upgrade' || name === 'host') continue;
    filtered[name] = String(rawValue);
  }
  return filtered;
}
function toH2ResponseHeaders(headers) {
  const responseHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (name.startsWith(':') || value === undefined) continue;
    if (Array.isArray(value)) { for (const item of value) responseHeaders.append(name, String(item)); }
    else responseHeaders.append(name, String(value));
  }
  return responseHeaders;
}
function getPool(url) {
  const origin = originFor(url);
  let pool = pools.get(origin);
  if (!pool) { pool = new H2Pool(origin); pools.set(origin, pool); }
  return pool;
}
class H2Pool {
  constructor(origin) { this.origin = origin; this.sessions = []; this.waiters = []; }
  async request(url, init) {
    const entry = await this.acquire();
    try { await entry.ready; } catch (error) { this.release(entry); throw error; }
    if (entry.alpnProtocol !== 'h2') {
      this.release(entry);
      entry.session.close();
      throw new Error(`HTTP/2 was not negotiated; ALPN=${String(entry.alpnProtocol || 'none')}`);
    }
    return this.dispatch(entry, url, init);
  }
  acquire() {
    const existing = this.sessions.find((entry) => !entry.closed && entry.activeStreams < MAX_H2_STREAMS_PER_SESSION);
    if (existing) {
      if (existing.idleTimer) { clearTimeout(existing.idleTimer); existing.idleTimer = undefined; }
      existing.session.ref?.();
      existing.activeStreams++;
      return Promise.resolve(existing);
    }
    if (this.sessions.filter((entry) => !entry.closed).length < MAX_H2_SESSIONS) {
      const created = this.createSession();
      created.session.ref?.();
      created.activeStreams++;
      return Promise.resolve(created);
    }
    return new Promise((resolve) => { this.waiters.push(resolve); });
  }
  createSession() {
    const session = http2.connect(this.origin, { ALPNProtocols: ['h2', 'http/1.1'] });
    const entry = { session, activeStreams: 0, ready: Promise.resolve(), alpnProtocol: undefined, closed: false, idleTimer: undefined };
    entry.ready = new Promise((resolve, reject) => {
      session.once('connect', () => {
        entry.alpnProtocol = session.socket.alpnProtocol;
        connectedChannel.publish({ socket: session.socket });
        resolve();
      });
      session.once('error', reject);
    });
    session.once('close', () => {
      entry.closed = true;
      if (entry.idleTimer) clearTimeout(entry.idleTimer);
      this.sessions = this.sessions.filter((item) => item !== entry);
      this.drainWaiters();
    });
    session.on('error', () => { entry.closed = true; });
    this.sessions.push(entry);
    return entry;
  }
  dispatch(entry, url, init) {
    return new Promise((resolve, reject) => {
      if (init.signal?.aborted) { this.release(entry); reject(abortError()); return; }
      const body = normalizeBody(init.body);
      const requestHeaders = {
        ...filterH2RequestHeaders(init.headers),
        [http2.constants.HTTP2_HEADER_METHOD]: init.method ?? 'GET',
        [http2.constants.HTTP2_HEADER_SCHEME]: url.protocol.slice(0, -1),
        [http2.constants.HTTP2_HEADER_AUTHORITY]: url.host,
        [http2.constants.HTTP2_HEADER_PATH]: pathFor(url),
      };
      const stream = entry.session.request(requestHeaders, { endStream: body === undefined });
      let settled = false, released = false;
      const releaseOnce = () => { if (released) return; released = true; this.release(entry); };
      const rejectOnce = (error) => { if (settled) return; settled = true; releaseOnce(); reject(error); };
      const onAbort = () => { stream.close(http2.constants.NGHTTP2_CANCEL); rejectOnce(abortError()); };
      init.signal?.addEventListener('abort', onAbort, { once: true });
      stream.once('response', (headers) => {
        if (settled) return;
        settled = true;
        const status = Number(headers[http2.constants.HTTP2_HEADER_STATUS] ?? 0);
        const responseBody = statusMustNotHaveBody(status) || init.method === 'HEAD' ? null : stream;
        if (responseBody === null) stream.resume();
        const response = new Response(responseBody, { status, headers: toH2ResponseHeaders(headers) });
        Object.defineProperty(response, 'url', { value: String(url) });
        stream.once('end', releaseOnce);
        stream.once('close', releaseOnce);
        stream.once('error', releaseOnce);
        resolve(response);
      });
      stream.once('error', (error) => { rejectOnce(error); });
      stream.once('close', () => {
        init.signal?.removeEventListener('abort', onAbort);
        if (!settled) rejectOnce(new Error('HTTP/2 stream closed before response headers'));
      });
      if (body instanceof Readable) { body.once('error', (error) => stream.destroy(error)); body.pipe(stream); }
      else if (body !== undefined) { stream.end(body); }
    });
  }
  release(entry) {
    entry.activeStreams = Math.max(0, entry.activeStreams - 1);
    this.drainWaiters();
    if (entry.activeStreams === 0 && !entry.closed && !entry.idleTimer) {
      entry.session.unref?.();
      entry.idleTimer = setTimeout(() => { entry.session.close(); }, KEEP_ALIVE_TIMEOUT_MS);
      entry.idleTimer.unref?.();
    }
  }
  drainWaiters() {
    while (this.waiters.length > 0) {
      const entry = this.sessions.find((candidate) => !candidate.closed && candidate.activeStreams < MAX_H2_STREAMS_PER_SESSION);
      if (!entry) return;
      if (entry.idleTimer) { clearTimeout(entry.idleTimer); entry.idleTimer = undefined; }
      entry.session.ref?.();
      entry.activeStreams++;
      const resolve = this.waiters.shift();
      resolve?.(entry);
    }
  }
}
async function undiciFallbackFetch(url, init) {
  const result = await undiciRequest(url, { ...init, body: normalizeBody(init.body), dispatcher: h1Dispatcher });
  const responseBody = statusMustNotHaveBody(result.statusCode) || init.method === 'HEAD' ? null : result.body;
  if (responseBody === null) await result.body.dump();
  const response = new Response(responseBody, { status: result.statusCode, headers: toResponseHeaders(result.headers) });
  Object.defineProperty(response, 'url', { value: String(url) });
  return response;
}
const fetch792 = async (url, init) => {
  const { agent: _a, body: rawBody, duplex: _d, redirect, signal, ...rest } = init ?? {};
  const requestURL = new URL(String(url));
  const requestInit = { ...rest, body: rawBody, maxRedirections: redirect === 'manual' || redirect === 'error' ? 0 : 20, signal: signal ?? undefined };
  if (requestURL.protocol !== 'https:') return undiciFallbackFetch(requestURL, requestInit);
  try {
    return await getPool(requestURL).request(requestURL, requestInit);
  } catch (error) {
    if (error instanceof Error && /^HTTP\/2 was not negotiated/.test(error.message)) return undiciFallbackFetch(requestURL, requestInit);
    throw error;
  }
};
// ════════════════════════════════ end #792 copy ════════════════════════════════

// ───────────────────────────────── local h2 server ─────────────────────────────────
function makeCert() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2cert-'));
  const keyPath = path.join(dir, 'key.pem'), certPath = path.join(dir, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', certPath,
    '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
  return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath), dir };
}

const counters = { tls: 0, sessions: 0, reqs: 0 };
function startServer() {
  const { key, cert } = makeCert();
  const server = http2.createSecureServer({ key, cert, allowHTTP1: true, settings: { maxConcurrentStreams: MAX_STREAMS } });
  server.on('secureConnection', () => counters.tls++);
  server.on('session', () => counters.sessions++);
  // Use ONLY the http1/http2 compatibility `request` API — it serves BOTH h1 and h2
  // and responds exactly once per request (no 'stream' listener => no double-respond).
  server.on('request', (req, res) => {
    counters.reqs++;
    req.resume();
    const send = () => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":true}'); };
    SERVER_DELAY_MS ? setTimeout(send, SERVER_DELAY_MS) : send();
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

// ───────────────────────────────── load driver ─────────────────────────────────
function pct(sorted, p) { return sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)] : 0; }
function r(n) { return Math.round(n); }

async function runPass(name, fetchFn, url) {
  const snap = { ...counters };
  const crashStart = crashes;
  const lat = [];
  let fails = 0;
  const t0 = performance.now();
  await Promise.all(Array.from({ length: REQUESTS }, async () => {
    const r0 = performance.now();
    try {
      const res = await fetchFn(url, { method: 'GET', headers: { accept: 'application/json' } });
      await res.text(); // consume body so the stream completes & releases
      if (!res.ok) fails++;
    } catch { fails++; }
    lat.push(performance.now() - r0);
  }));
  const wall = performance.now() - t0;
  await new Promise((res) => setTimeout(res, 300)); // let late async H2 uncaught errors surface
  lat.sort((a, b) => a - b);
  return {
    transport: name,
    tlsConns: counters.tls - snap.tls,
    h2sessions: counters.sessions - snap.sessions,
    reqsServed: counters.reqs - snap.reqs,
    fails,
    crashes: crashes - crashStart,
    p50: r(pct(lat, 50)), p90: r(pct(lat, 90)), p99: r(pct(lat, 99)), max: r(lat.at(-1) ?? 0),
    wallMs: r(wall),
  };
}

async function main() {
  console.log(`node ${process.version} | undici ${(await import('undici/package.json', { with: { type: 'json' } })).default.version} | REQUESTS=${REQUESTS} concurrent | server delay=${SERVER_DELAY_MS}ms | server maxConcurrentStreams=${MAX_STREAMS}\n`);
  const { server, port } = await startServer();
  const url = `https://127.0.0.1:${port}/health`;

  // Bounded undici Pool with allowH2, default pipelining=1 — pools connections but does NOT
  // multiplex streams (one in-flight request per session) → as slow as h1.
  const pool4 = new Pool(`https://127.0.0.1:${port}`, { allowH2: true, connections: 4, keepAliveTimeout: 600000, keepAliveMaxTimeout: 600000 });
  const fetchPool4 = (u, init) => { const { agent: _a, signal, ...rest } = init ?? {}; return undiciFetchImpl(u, { ...rest, dispatcher: pool4, signal: signal ?? undefined }); };

  // Bounded undici Pool with pipelining>1 — the approach this branch ships: real H2 stream
  // multiplexing over a few sessions. 4 x 64 matches src/lib/undici-fetch.ts.
  // (On undici < 7.23.0 this assert-crashes; on >= 7.23.0 it is fast and stable.)
  const pool4pipe = new Pool(`https://127.0.0.1:${port}`, { allowH2: true, connections: 4, pipelining: 64, keepAliveTimeout: 600000, keepAliveMaxTimeout: 600000 });
  const fetchPool4pipe = (u, init) => { const { agent: _a, signal, ...rest } = init ?? {}; return undiciFetchImpl(u, { ...rest, dispatcher: pool4pipe, signal: signal ?? undefined }); };

  // Same, via Agent (what the SDK actually constructs) instead of a single-origin Pool.
  const agentPipe = new Agent({ allowH2: true, connections: 4, pipelining: 64, keepAliveTimeout: 600000, keepAliveMaxTimeout: 600000 });
  const fetchAgentPipe = (u, init) => { const { agent: _a, signal, ...rest } = init ?? {}; return undiciFetchImpl(u, { ...rest, dispatcher: agentPipe, signal: signal ?? undefined }); };

  const all = [
    ['h1', 'undici-h1 (baseline)', fetchH1],
    ['791', 'undici-allowH2 Agent (#791)', fetch791],
    ['pool', 'undici-Pool allowH2 conns=4 (pipelining=1)', fetchPool4],
    ['poolpipe', 'undici-Pool conns=4 pipelining=64', fetchPool4pipe],
    ['agentpipe', 'undici-Agent conns=4 pipelining=64', fetchAgentPipe],
    ['792', 'node-http2-pool (#792)', fetch792],
  ];
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const selected = only ? all.filter(([k]) => only.includes(k)) : all;
  const rows = [];
  for (const [, name, fn] of selected) rows.push(await runPass(name, fn, url));

  console.log('Each row = ' + REQUESTS + ' requests fired concurrently:\n');
  console.table(
    rows.map((x) => ({
      transport: x.transport,
      'TLS conns opened': x.tlsConns,
      'h2 sessions': x.h2sessions,
      'reqs served': x.reqsServed,
      fails: x.fails,
      crashes: x.crashes,
      'p50 ms': x.p50, 'p90 ms': x.p90, 'p99 ms': x.p99,
      'wall ms': x.wallMs,
    })),
  );
  console.log(`\ntotal process-crashing errors: ${crashes}  (unique: ${[...crashMsgs].join(' | ') || 'none'})`);
  await pool4.close().catch(() => {});
  await pool4pipe.close().catch(() => {});
  await agentPipe.close().catch(() => {});
  console.log('\nKey question: for ' + REQUESTS + ' concurrent requests, how many TLS conns / h2 sessions did #791 open vs #792?');
  console.log('  - If #791 opens few sessions & is as fast as #792 -> #791 already has the perf bump.');
  console.log('  - If #791 opens ~1 per request or is far slower -> it does not multiplex.');

  await agent791.close().catch(() => {});
  await agentH1.close().catch(() => {});
  await h1Dispatcher.close().catch(() => {});
  for (const pool of pools.values()) for (const e of pool.sessions) try { e.session.close(); } catch {}
  server.close();
  setTimeout(() => process.exit(0), 200).unref();
}

main().catch((e) => { console.error('bench failed:', e); process.exit(1); });
