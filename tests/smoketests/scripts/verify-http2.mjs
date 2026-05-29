/**
 * Plain-node verification harness for the HTTP/2 (undici) transport.
 *
 * Runs OUTSIDE jest against the BUILT package — which is exactly how real
 * clients consume the SDK, and the only place a `"type": "commonjs"` interop
 * regression would surface. It proves three things a green smoke run cannot:
 *
 *   1. h2 is actually NEGOTIATED (not a silent HTTP/1.1 fallback) — asserted by
 *      reading the TLS socket's ALPN protocol via undici's diagnostics channel.
 *   2. A success response body parses (exercises Response.json()).
 *   3. A non-2xx response REJECTS with a readable error and does NOT crash the
 *      process — the exact failure mode of the old got adapter on a 401.
 *
 * Usage: RUNLOOP_API_KEY=... [RUNLOOP_BASE_URL=...] node tests/smoketests/scripts/verify-http2.mjs
 * Exit code 0 = all checks passed, 1 = a check failed, 2 = misconfigured.
 */
import diagnostics_channel from 'node:diagnostics_channel';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const distPath = new URL('../../../dist/index.js', import.meta.url).pathname;
const { Runloop } = require(distPath);

const apiKey = process.env.RUNLOOP_API_KEY;
const baseURL = process.env.RUNLOOP_BASE_URL; // falls back to SDK default (prod) if unset
if (!apiKey) {
  console.error('RUNLOOP_API_KEY is required');
  process.exit(2);
}

// Capture the negotiated ALPN protocol for every undici connection. Channels are
// keyed by name globally, so this catches the SDK's own undici regardless of
// which module instance created the connection.
const alpnSeen = [];
let connectCount = 0;
diagnostics_channel.subscribe('undici:client:connected', (msg) => {
  connectCount++;
  const proto = msg?.socket?.alpnProtocol;
  if (proto) alpnSeen.push(proto);
});

let failures = 0;
const check = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${label}`);
  if (!cond) failures++;
};

const newClient = (overrides) =>
  new Runloop({ bearerToken: apiKey, baseURL, maxRetries: 0, timeout: 30_000, ...overrides });

// ── Pass A: HTTP/2 success path ───────────────────────────────────────────
alpnSeen.length = 0;
try {
  const res = await newClient({ http2: true }).devboxes.list({ limit: 1 });
  check(res != null, 'h2: GET devboxes.list resolved with a parsed body');
} catch (e) {
  check(false, `h2: GET devboxes.list resolved (threw ${e?.constructor?.name}: ${e?.message})`);
}
check(alpnSeen.includes('h2'), `h2: TLS ALPN negotiated 'h2' (saw: ${alpnSeen.join(', ') || 'none'})`);

// ── Pass B: HTTP/2 error path must reject cleanly, not crash ──────────────
try {
  await newClient({ http2: true, bearerToken: 'ak_invalid_token_for_verify' }).devboxes.list({ limit: 1 });
  check(false, 'h2: bad token rejected (it unexpectedly succeeded)');
} catch (e) {
  check(true, 'h2: bad token rejected without crashing the process');
  check(
    /401|unauthor|invalid|authentication/i.test(`${e?.status ?? ''} ${e?.message ?? ''}`),
    `h2: error carries a readable body (${e?.constructor?.name}: ${(e?.message || '').slice(0, 70)})`,
  );
}

// ── Pass C: HTTP/1.1 control path still works ─────────────────────────────
try {
  const res = await newClient({ http2: false }).devboxes.list({ limit: 1 });
  check(res != null, 'h1: GET devboxes.list resolved (node-fetch control)');
} catch (e) {
  check(false, `h1: GET devboxes.list resolved (threw ${e?.constructor?.name}: ${e?.message})`);
}

// ── Pass D: HTTP/2 multiplexing — many concurrent requests reuse few connections ──
// The whole point of the bounded H2 pool: N concurrent requests share a small number of
// TLS sessions instead of one connection per request. Default config (pipelining=1) or the
// pre-fix undici Agent would open ~N connections here.
try {
  const N = 25;
  const before = connectCount;
  const client = newClient({ http2: true });
  const results = await Promise.allSettled(Array.from({ length: N }, () => client.devboxes.list({ limit: 1 })));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const opened = connectCount - before;
  check(ok === N, `h2: ${N} concurrent requests all resolved (${ok}/${N})`);
  check(opened <= 4, `h2: ${N} concurrent requests multiplexed over <= 4 connections (opened ${opened})`);
} catch (e) {
  check(false, `h2: concurrent multiplexing pass threw ${e?.constructor?.name}: ${e?.message}`);
}

console.log(failures === 0 ? '\n✓ ALL HTTP/2 CHECKS PASSED' : `\n✗ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
