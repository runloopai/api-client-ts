# HTTP/2 Transport — Testing Plan

This document proposes a thorough testing regimen for `src/lib/h2-transport/`. It builds on the 29 unit tests already shipped in PR #799 and adds breadth (more units), depth (regression suites around known/expected failure modes), and load tests (multiplexing, pool growth, leak detection).

The transport is a small but tricky surface — connection pooling, stream multiplexing, GOAWAY/RST_STREAM races, abort semantics, backpressure, and pseudo-header handling all have well-known footguns. The plan below tries to cover every code path in `headers.ts`, `response.ts`, `session.ts`, `pool.ts`, and `index.ts`, plus the integration seam with `createH2Fetch`.

---

## 1. Background — patterns we are borrowing from

A quick survey of how other production HTTP/2 clients are tested. These are the patterns this plan is modeled on:

- **`node:http2` itself** (`nodejs/node` test suite under `test/parallel/test-http2-*`) — in-process `http2.createSecureServer`, paired with explicit `goaway`, `rstStream`, `altsvc`, flow-control, and trailer cases. Servers are torn down per test; sessions are inspected via the `'frameError'`, `'goaway'`, `'remoteSettings'` events. This is the model the existing test file already uses.
- **`undici`** (`nodejs/undici`'s `test/http2-*.js`) — uses an in-process h2 server, asserts on `Pool`/`Client` state (`busy`, `connected`, `pending`, `size`), and has explicit "GOAWAY mid-flight retries on idempotent methods" tests. We mirror this for `H2Pool`.
- **`nghttp2`'s `h2load`** — the de-facto h2 load generator. Reports req/s, time-to-first-byte, header decode time, and stream concurrency. We use `h2load` as the external load tool for the `loadtest/` directory.
- **`grpc-node`** — exercises long-lived streams, server push, and abort propagation under load. Their "stress" tests open N concurrent streams against one session and assert no leaks. We borrow the leak-detection pattern (count `activeStreams` deltas around each test).
- **`hyper`/`h2` Rust** — fuzz CONTINUATION/HEADERS framing and large header lists. We don't need bytes-level fuzzing (we delegate framing to `node:http2`), but the *header-table* size and "many small headers" cases are worth keeping.
- **Wireshark / `http2-frame-test-case`** corpus — useful only if we hit a framing bug; out of scope for the first pass.

Common testing primitives used by all of the above and adopted here:

1. **In-process `http2.createSecureServer` with self-signed cert.** The existing test file already does this (`beforeAll` shells out to `openssl`). We'll keep that but factor it into a `testServer.ts` helper so each suite can spin up bespoke handlers without duplicating boilerplate.
2. **No real network, no real DNS, no `Thread.sleep`-equivalents.** Drive timing with explicit promises and event waits; never `setTimeout(…, 50)` to "let the server respond."
3. **Per-test session counters.** Expose `session.activeStreams` and `pool._sessions.length` (already public-ish) to assert no leaks across `beforeEach` / `afterEach`.
4. **Fault-injection server.** A handler that can be told, mid-test, to: send `GOAWAY`, `RST_STREAM` with a chosen code, drop the TCP connection, delay headers, withhold `END_STREAM`, or send a trickle of DATA frames. This is the engine for the regression suite.

---

## 2. Test layout

```
src/lib/h2-transport/
  __tests__/
    headers.test.ts          # unit
    response.test.ts         # unit
    session.test.ts          # unit + regression
    pool.test.ts             # unit + regression
    index.test.ts            # unit (createH2Fetch)
    integration.test.ts      # end-to-end through createH2Fetch
    regression.test.ts       # named bug cases — see §5
    helpers/
      testServer.ts          # shared in-process h2 server factory
      faultServer.ts         # fault-injection server (GOAWAY, RST, etc.)
      certs.ts               # one-time self-signed cert, cached in os.tmpdir
loadtest/
  h2-multiplex.ts            # node-driven concurrent-stream test
  h2-pool-growth.ts          # node-driven pool-scaling test
  h2load.sh                  # wraps nghttp2 h2load against a local server
  README.md
```

We move `tests/lib/h2-transport.test.ts` content into `__tests__/` colocated with the source — easier to find, and matches the pattern other libraries in this SDK use for internal modules.

Existing tests stay green; the split is mechanical.

---

## 3. Unit tests (per file)

Goal: each public method and each non-trivial branch has at least one explicit case. Many of these already exist in the PR — listed here for completeness so the matrix is auditable.

### 3.1 `headers.ts` — `H2Headers`
- [x] Strips `:status`, `:method`, `:path`, `:scheme`, `:authority` pseudo-headers.
- [x] Case-insensitive `get()`.
- [x] `entries()` yields lowercased keys.
- [ ] Multi-value (array) headers join with `", "` per RFC 7230.
- [ ] `undefined` values are dropped (not stored as the string `"undefined"`).
- [ ] Empty-string values are preserved (distinct from `null`).
- [ ] `set-cookie` array stays joined; document that we don't split per-cookie (or add splitting — decide).
- [ ] Header name containing `\r\n` or `:` from a malicious server is rejected or stripped (defense in depth; `node:http2` should already reject these, but we assert behavior).

### 3.2 `response.ts` — `H2Response`
- [x] `.json()` parses a JSON body.
- [x] `.text()` returns UTF-8 string.
- [x] `.ok` true for 2xx, false for 4xx/5xx.
- [ ] `.arrayBuffer()` returns a tight `ArrayBuffer` (no shared underlying buffer past `byteLength`).
- [ ] `.blob()` carries the `content-type`.
- [ ] Calling `.text()` twice returns the same string (memoization via `_bodyBytes`).
- [ ] Calling `.json()` after `.text()` returns the same parsed value (uses cached buffer).
- [ ] Reading `.body` directly and then calling `.text()` throws `"Body already consumed"`.
- [ ] `.json()` on empty body throws a `SyntaxError` (document this).
- [ ] `.url` echoes the request URL verbatim, including query string.

### 3.3 `session.ts` — `H2Session`
- [x] `connect()` resolves on `'connect'`.
- [x] Connect timeout: server that never SETTINGS-acks → rejects with `"H2 connect timeout"`. Drive via a raw `net.Server` that accepts the TCP socket but never speaks h2; we already do something similar.
- [x] `request()` after `CLOSED` rejects with `"H2 session is closed"`.
- [x] `request()` during `DRAINING` rejects with `"H2 session is draining"`.
- [x] `activeStreams` increments synchronously inside the `Promise` executor (the key invariant the PR's comment calls out).
- [x] `activeStreams` decrements after `'close'` (success and error paths).
- [ ] `available` is `false` when `activeStreams >= maxConcurrentStreams`.
- [ ] Server SETTINGS with a lower `maxConcurrentStreams` is adopted (assert `_maxConcurrentStreams` after `remoteSettings`).
- [ ] Server SETTINGS is **not** adopted if the caller passed an explicit `maxConcurrentStreams` opt.
- [x] `GOAWAY` with zero active streams transitions through `DRAINING` → `CLOSED` and fires `onClose`.
- [x] `GOAWAY` with active streams stays in `DRAINING` until last stream ends, then `_close()` fires.
- [ ] `signal.aborted === true` before `request()` is called → rejects immediately with `AbortError`; `activeStreams` is decremented; no listener leak on the signal.
- [ ] `signal.abort()` mid-flight after headers received but before body fully read → reader sees the abort error.
- [ ] `signal.abort()` mid-flight before headers → request rejects with `AbortError`.
- [ ] `signal.removeEventListener` is called on cleanup (assert with a `MockAbortSignal` that counts listeners).
- [ ] Server sends RST_STREAM with `INTERNAL_ERROR` → request rejects with the underlying stream error; session stays `READY`; pool keeps using it.
- [ ] `stream.on('error')` after `'response'` was already fired (mid-body error) → the body `ReadableStream` errors; the consumer of `.body` / `.text()` sees a rejection.
- [ ] Body `cancel()` (reader.cancel()) destroys the underlying stream and decrements `activeStreams`.
- [ ] `close()` is idempotent (calling twice resolves twice, no double `onClose`).
- [ ] `close()` on a not-yet-connected session is safe.
- [ ] Request body shapes: `null`, empty string, non-empty string, `Buffer`, large (>64KB) buffer. The large-buffer case verifies flow-control doesn't deadlock.

### 3.4 `pool.ts` — `H2Pool`
- [x] First `request()` triggers `_initialize()` (creates `minConnections` sessions).
- [x] Concurrent first requests share one `_initPromise`.
- [x] Init failure does not cache: a subsequent request retries.
- [ ] Init succeeds if *any* of `minConnections` sessions connects (matches `_anyOk` logic).
- [ ] Init fails (rejects) if *all* of `minConnections` sessions fail; the first rejection is propagated.
- [x] `_findAvailable` picks the least-loaded `READY` session.
- [x] Pool grows past `minConnections` when the queue is non-empty and all sessions are saturated.
- [ ] Pool does **not** grow past `maxConnections`. Queued requests stay queued; once a stream slot frees, queue drains.
- [ ] `_growPool` is serialized — concurrent triggers don't fire parallel `_addSession` calls (assert via a counter on session-creation).
- [ ] A session closing causes the pool to replenish back up to `minConnections`.
- [ ] A session closing **does not** replenish if `_closed === true`.
- [x] GOAWAY mid-request on a retryable method (`GET`/`HEAD`/`OPTIONS`/`PUT`/`DELETE`) is requeued and succeeds on another session.
- [ ] GOAWAY mid-request on `POST`/`PATCH` is **not** retried — the caller sees the error.
- [ ] `close()` rejects queued requests with `"Pool is closed"`.
- [ ] `close()` awaits all session closes (assert all sessions are `CLOSED` when the returned promise resolves).
- [ ] `close()` is safe to call before `_initialize()` runs.
- [ ] A queued request whose `signal` aborts before dispatch — currently *not handled* in `pool.ts`; this test will likely fail and surface a real bug. (See §5.)

### 3.5 `index.ts` — `createH2Fetch`
- [x] Node version guard: throws on Node < 18 (mock `process.versions.node`).
- [x] Distinct origins → distinct pools.
- [x] Same origin → shared pool (assert via two requests using the same backing session).
- [ ] `agent` field in init is silently ignored (regression — node-fetch injects it).
- [ ] `headers` accepts both a `Headers`-like object with `.entries()` and a plain record.
- [ ] Header keys are lowercased before being sent (verify via the server's received `headers`).
- [ ] Body normalization matrix:
  - `null` / `undefined` → no body.
  - `string` → sent as-is.
  - `Buffer` → sent as-is.
  - `Uint8Array` / `ArrayBuffer` → sent as bytes.
  - `MultipartBody` → unwrapped, then normalized.
  - `Readable` → buffered to `Buffer` and sent.
  - Unknown object → coerced via `String(body)`. Document or reject.
- [ ] `URL` instance and `string` URL both work.
- [ ] Path includes the query string.
- [ ] `close()` closes every pool and clears the map; subsequent calls are safe.

---

## 4. Integration tests (`integration.test.ts`)

End-to-end through `createH2Fetch`, exercised the way the SDK actually uses it.

- [x] Round-trip a `POST /echo` with a JSON body; assert `Content-Type`, status, and parsed body.
- [x] SSE-style streaming response: server flushes `event:`/`data:` frames with delays; the consumer reads them via `response.body` one at a time without buffering.
- [ ] Server sends `transfer-encoding: chunked`-equivalent (h2 has no chunked; just unbounded DATA) → body is concatenated correctly.
- [ ] 1MB binary body upload (assert byte-equality on the server side).
- [ ] 1MB binary body download (assert byte-equality on the client side, and that the `ReadableStream` honors `pull` backpressure — at minimum, finishes without OOM).
- [ ] Trailers — server sends an HTTP/2 trailer block. Document expected behavior (currently dropped); add an explicit `expect(headers.get('grpc-status')).toBeNull()` so a future change is intentional.
- [ ] Concurrent requests to two distinct origins — assert two pools, no cross-talk.
- [ ] AbortSignal propagation through `createH2Fetch` end-to-end.
- [ ] Server returns 100/101/204/304 — assert `.ok`, body handling. 204/304 must not hang on `.text()`.

---

## 5. Regression tests (`regression.test.ts`)

Named cases for behaviors the PR's code explicitly tries to get right. Each test maps to a comment in the source code.

| # | Source comment | Behavior under test |
|---|---|---|
| R1 | `pool.ts` "thundering herd" comment | Fire 100 concurrent `request()` calls before the pool finishes initializing. Assert all complete; assert no session exceeds `maxConcurrentStreams`; assert load is spread across multiple sessions, not piled on one. |
| R2 | `pool.ts` "GOAWAY race" retry | Server accepts a request, sends `GOAWAY` *after* the client has written headers but before the response. Assert that a `GET` is transparently retried on a fresh session; assert that a `POST` is **not** retried. |
| R3 | `pool.ts` `_growPool` serialization | Inject latency in `H2Session.connect`. Trigger 50 queued requests at once. Assert `_addSession` is invoked sequentially, not in parallel. |
| R4 | `pool.ts` init failure not cached | First `_initialize` fails (server refuses TCP). Start the server. Subsequent `request()` succeeds without restarting the pool. |
| R5 | `session.ts` synchronous `activeStreams++` | Fire 10 concurrent `session.request()` calls in a single tick. Assert that on the next microtask, `session.activeStreams === 10` and `available` reflects it. |
| R6 | `session.ts` DRAINING → CLOSED transition | Trigger `GOAWAY` while 3 streams are open; assert state stays `DRAINING`; complete streams one by one; assert `_close()` fires exactly when the last completes. |
| R7 | `session.ts` `signal.removeEventListener` on cleanup | Use a custom `AbortSignal` wrapper that counts `add`/`remove` calls. Confirm 1:1 across success, error, and abort paths — no leaks. |
| R8 | `index.ts` `agent` is ignored | Pass `init.agent = new (require('https').Agent)()`. Assert the request still goes through h2 (no fallback to h1). |
| R9 | `response.ts` body memoization | Call `.text()` and then `.json()`. Assert the underlying stream is read once (server saw one stream open/close). |
| R10 | `pool.ts` queued-request abort (likely-bug exploratory) | Queue a request, then `signal.abort()` it before any session is available. Currently the abort is not honored until dispatch. If the test fails, we file a fix in this PR. |
| R11 | Slow-loris server | Server delays sending response headers for 5s. Client `connectTimeout` is 30s, no per-request timeout exists. Assert that an `AbortController` with `setTimeout(abort, 100)` cleanly cancels. |
| R12 | Server max-concurrent-streams enforcement | Server SETTINGS announces `maxConcurrentStreams=2`. Fire 5 concurrent requests against one session. Assert no `PROTOCOL_ERROR` and that the client queues internally. |
| R13 | RST_STREAM with `REFUSED_STREAM` | Server refuses every other stream. The pool should retry on a different session for `GET`. |

---

## 6. Load / soak tests (`loadtest/`)

These run on demand (`npm run loadtest`), not in CI by default. CI gets a smoke version with smaller numbers.

### 6.1 In-process Node load (`h2-multiplex.ts`)
- Boot an in-process h2 server that responds with a 1KB JSON body after ~5ms of simulated CPU.
- `createH2Fetch({ minConnections: 4, maxConnections: 20 })`.
- Fire N concurrent requests (parametrized: 100, 1k, 10k).
- Measure: total throughput, p50/p95/p99 latency, peak `pool._sessions.length`, peak `activeStreams` per session, # of GOAWAY events, # of failed requests.
- Pass criteria:
  - 100% success.
  - Peak session count ≤ `Math.ceil(N / serverMaxConcurrentStreams)`.
  - p99 < 5× p50 (no long-tail meltdown).

### 6.2 Pool growth dynamics (`h2-pool-growth.ts`)
- Server advertises `maxConcurrentStreams = 10`.
- Ramp: 1 → 50 → 200 → 50 → 1 concurrent requests over 60s.
- Assert pool grows on ramp-up, **does not shrink** (current implementation has no shrinking — document this; it's a deliberate design choice or a future enhancement).
- Assert no unbounded growth beyond `maxConnections`.

### 6.3 Leak / soak (`h2-leak.ts`)
- 10-minute run at modest concurrency (~50 r/s).
- Periodically (every 30s) check:
  - `process.memoryUsage().heapUsed` trend — slope should be flat after warmup.
  - File-descriptor count via `lsof -p $PID | wc -l` (or `/proc/self/fd` on Linux).
  - `pool._sessions.length` stable.
  - `session.activeStreams` returns to 0 between bursts.
- Inject a GOAWAY every ~1000 requests; assert recovery and no FD leak.

### 6.4 External `h2load` (`h2load.sh`)
- Wraps `nghttp2`'s `h2load -n 100000 -c 100 -m 32 https://localhost:PORT/echo`.
- This is the apples-to-apples comparison against `undici` and node-fetch. Stash a baseline number in the script comment, not in CI.

### 6.5 Chaos (`h2-chaos.ts`)
- Server randomly: closes TCP socket (10% of streams), sends RST_STREAM (10%), sends GOAWAY (1%), delays headers up to 200ms (20%).
- 60s run; assert success rate ≥ 99% for `GET` (retryable) and that errors on `POST` are surfaced cleanly (no hung promises, no FD leak).

---

## 7. CI integration

- `npm test` (unchanged): runs everything under `__tests__/`. Target wall time < 30s.
- `npm run test:load:smoke`: runs §6.1 with N=100, §6.2 with the 50-peak variant, §6.3 with a 30s window. Target wall time < 90s. Goes in CI on `main`.
- `npm run test:load:full`: §6.1–§6.5 at full size. On-demand only.

CI machine notes: GitHub Actions runners are noisy; latency assertions should be ratios (p99/p50), not absolute numbers. Throughput numbers are recorded but not asserted on.

---

## 8. Coverage targets

- Per-file line coverage ≥ 95% for `headers.ts`, `response.ts`, `index.ts`.
- Per-file line coverage ≥ 90% for `session.ts`, `pool.ts` (the harder-to-cover error paths).
- Branch coverage ≥ 85% across the directory.

Measured with `jest --coverage` against `__tests__/` only (load tests excluded).

---

## 9. Open questions for review

1. **Trailers** — drop, expose as a second header set, or merge into `H2Headers`? Affects gRPC-style use cases.
2. **`POST` retry policy** — should we add an idempotency-key opt-in for `POST` retries on GOAWAY? Today they fail; tests R2/R13 will document the current behavior.
3. **Pool shrinking** — current pool never shrinks below high-water mark. Worth a follow-up? §6.2 documents the status quo either way.
4. **Per-request timeout** — none exists; only `connectTimeout`. Tests R11 documents the AbortController workaround. Should this be a built-in option?
5. **Body normalization fallback** — `String(body)` for unknown objects is surprising. Throw instead?

These don't block writing the tests; flagging so we can decide as we go.
