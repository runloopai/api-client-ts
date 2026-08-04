# h2-transport load tests

Standalone scripts that exercise `src/lib/h2-transport/` under load. Each boots
an in-process h2 server and runs the client until completion or a fixed
duration. Not part of `npm test`; run on demand.

## Scripts

| Script              | Purpose                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| `h2-multiplex.ts`   | Fire N concurrent requests, report throughput + p50/p95/p99.                        |
| `h2-pool-growth.ts` | Ramp 1 → 50 → 200 → 50 → 1 concurrent. Observe pool size over time.                 |
| `h2-leak.ts`        | Soak at 50 r/s. Sample heap + FD count. Periodic GOAWAY injection.                  |
| `h2-chaos.ts`       | Server randomly drops sockets / RSTs / GOAWAYs / delays. Asserts ≥50 % GET success. |
| `h2load.sh`         | Wraps `nghttp2`'s `h2load` against a long-running test server.                      |
| `sse-test.ts`       | Pre-existing manual SSE round-trip.                                                 |
| `push-to-loki.ts`   | Runs all four timed tests and pushes results to Loki for Grafana.                   |

## End-to-end transport comparison (real API)

Unlike the in-process scripts above, these hit a real Runloop API (`RUNLOOP_API_KEY`,
optional `RUNLOOP_BASE_URL`). They send a burst of `devboxes.create` calls against a
**deliberately nonexistent blueprint** (`bp_nonexistent_loadtest_00000`), so every
request fails fast server-side (HTTP `400`) and **no devboxes are created** — isolating
client + server _request handling_ from provisioning.

| Script                                                       | Transport under test                                                                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `loadtest.ts`                                                | The **SDK** itself. `USE_HTTP2=0` → HTTP/1.1 (`node-fetch`); default / `USE_HTTP2=1` → HTTP/2 (native `node:http2`). Imports `../src/sdk.ts`, so it always runs against the SDK code in this checkout. |
| `undici-test.ts`, `undici-single-conn.ts`, `undici-debug.ts` | Raw [undici](https://github.com/nodejs/undici) HTTP/2 pool, bypassing the SDK.                                                                                                                         |
| `h2-test.ts`, `h2-single-conn.ts`                            | Raw `node:http2`, bypassing the SDK.                                                                                                                                                                   |
| `raw-fetch-test.ts`                                          | Raw `node:https` (HTTP/1.1 keep-alive agent).                                                                                                                                                          |
| `alpn-check.ts`                                              | Confirms the origin negotiates `h2` via TLS ALPN.                                                                                                                                                      |

The raw-transport probes compare undici's HTTP/2 multiplexing against `node:http2`
(and HTTP/1.1) directly — the comparison that motivated building the SDK's own
`node:http2` transport. They're kept so that comparison stays reproducible.

```sh
# SDK: HTTP/2 (default) vs HTTP/1.1, 2000-request burst
source ~/env && REQUEST_COUNT=2000 npx tsx loadtest/loadtest.ts                 # HTTP/2
source ~/env && REQUEST_COUNT=2000 USE_HTTP2=0 npx tsx loadtest/loadtest.ts     # HTTP/1.1

# Raw undici vs node:http2 comparison (undici comes from loadtest/package.json)
cd loadtest && npm install && source ~/env && npx tsx undici-test.ts
```

HTTP/1.1 opens a socket per in-flight request; for large bursts raise the file-descriptor
limit (`ulimit -n 65536`) or keep `REQUEST_COUNT` under it.

## Automated daily runs

The `.github/workflows/h2-loadtest.yml` workflow fires at 06:00 UTC every day.
It connects to the dev Tailscale network and runs `push-to-loki.ts`, which
executes each script with CI-appropriate durations (multiplex N=1000,
chaos 30 s, leak 120 s) and posts one structured JSON log line per test to
Loki under `{job="h2-loadtest", test="<name>"}`.

Results are visible in the **H2 Transport Load Tests** Grafana dashboard on
dev-grafana. Each panel uses `last_over_time(...[1d])` to produce one data
point per daily run, so regressions show up as step changes on the trend lines.

To push results from a local run (requires Tailscale + access to dev-loki):

```sh
LOKI_URL=https://dev-loki npx tsx loadtest/push-to-loki.ts
```

## Run

```sh
npx tsx loadtest/h2-multiplex.ts          # default N=1000
npx tsx loadtest/h2-multiplex.ts 10000
npx tsx loadtest/h2-pool-growth.ts
npx tsx loadtest/h2-leak.ts 600           # 10 min soak
npx tsx loadtest/h2-chaos.ts 60
./loadtest/h2load.sh 100000 100 32        # needs nghttp2 in $PATH
```

For the leak test, run with `node --expose-gc $(which npx) tsx loadtest/h2-leak.ts`
so the periodic `global.gc()` calls fire — otherwise heap-growth signal is
noisy with retained but reclaimable buffers.

## Reading the output

Each script prints a single JSON object at the end. Useful invariants:

- `failures === 0` for `h2-multiplex` and `h2-pool-growth`.
- `heapGrowthMB < 50` for `h2-leak`.
- `getSuccessRate > 0.99` for `h2-chaos` once retries land; today we only
  assert `> 0.50` because POST requests are not retried on session loss.

Throughput numbers depend on the host and should be compared like-for-like,
not against an absolute target.
