# h2-transport load tests

Standalone scripts that exercise `src/lib/h2-transport/` under load. Each boots
an in-process h2 server and runs the client until completion or a fixed
duration. Not part of `npm test`; run on demand.

## Scripts

| Script | Purpose |
|---|---|
| `h2-multiplex.ts` | Fire N concurrent requests, report throughput + p50/p95/p99. |
| `h2-pool-growth.ts` | Ramp 1 → 50 → 200 → 50 → 1 concurrent. Observe pool size over time. |
| `h2-leak.ts` | Soak at 50 r/s. Sample heap + FD count. Periodic GOAWAY injection. |
| `h2-chaos.ts` | Server randomly drops sockets / RSTs / GOAWAYs / delays. Asserts ≥50 % GET success. |
| `h2load.sh` | Wraps `nghttp2`'s `h2load` against a long-running test server. |
| `sse-test.ts` | Pre-existing manual SSE round-trip. |

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
