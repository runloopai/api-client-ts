# Smoke tests

End-to-end smoke tests run against the real API to validate critical flows (devboxes, snapshots, blueprints, agents, executions/log tailing, scenarios/benchmarks) and verify custom helpers like `poll()` are importable.

- Local run (requires `RUNLOOP_API_KEY`):

```bash
export RUNLOOP_API_KEY=...  # required
# optionally override API base
# export RUNLOOP_BASE_URL=https://api.runloop.ai

npm run build

# Run all tests
RUN_SMOKETESTS=1 ./node_modules/.bin/jest tests/smoketests --runInBand --verbose

# Run a single file:
RUN_SMOKETESTS=1 ./node_modules/.bin/jest tests/smoketests/devboxes.test.ts --runInBand --verbose

# Run a single test:
RUN_SMOKETESTS=1 ./node_modules/.bin/jest -t "createAndAwaitRunning timeout" --runInBand
```

- GitHub Actions: add repo secret `RUNLOOP_API_KEY` (and optionally `RUNLOOP_BASE_URL`). The workflow `.github/workflows/smoke.yml` runs on PRs and pushes to `main`.
