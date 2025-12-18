import type { BenchmarkUpdateParams } from '@runloop/api-client/resources/benchmarks';
import type {
  ScenarioCreateParams,
  ScenarioUpdateParams,
  ScenarioRunView,
} from '@runloop/api-client/resources/scenarios';
import type * as Core from '@runloop/api-client/core';
import { Benchmark, Scenario, ScenarioRun } from '@runloop/api-client/sdk';
import { makeClientSDK, uniqueName } from '../utils';

const sdk = makeClientSDK();

const TEST_TIMEOUT_MS = 30_000;
const POLLING_TIMEOUT_MS = 20_000;
const POLLING_INTERVAL_MS = 2_000;

const SMOKETEST_METADATA = { smoketest: 'true' };

const SCENARIO_NAME = 'sdk-smoketest-oo-scenario-minimal';
const BENCHMARK_NAME = 'sdk-smoketest-oo-benchmark-minimal';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scenarioUpdateFromCreate(params: ScenarioCreateParams): ScenarioUpdateParams {
  const update: ScenarioUpdateParams = {};

  if (params.input_context) update.input_context = params.input_context;
  if (params.scoring_contract) update.scoring_contract = params.scoring_contract;
  if (params.environment_parameters) update.environment_parameters = params.environment_parameters;
  if (params.metadata) update.metadata = params.metadata;
  if (params.reference_output !== undefined) update.reference_output = params.reference_output;
  if (params.required_environment_variables !== undefined) {
    update.required_environment_variables = params.required_environment_variables;
  }
  if (params.required_secret_names !== undefined) update.required_secret_names = params.required_secret_names;
  if (params.validation_type !== undefined) update.validation_type = params.validation_type;

  return update;
}

async function pushOrUpdateScenario(options?: Core.RequestOptions): Promise<Scenario> {
  const builder = sdk.scenario
    .builder(SCENARIO_NAME)
    .withProblemStatement('OO smoketest minimal scenario')
    .withMetadata(SMOKETEST_METADATA)
    .addShellCommandScorer('smoke', { command: 'true' });

  const existing = await sdk.scenario.list({ name: SCENARIO_NAME, limit: 1 }, options);
  if (existing.length > 0) {
    const scenario = existing[0]!;
    const createParams = builder.build();
    await scenario.update(scenarioUpdateFromCreate(createParams), options);
    return scenario;
  }

  return builder.push(options);
}

async function createOrUpdateBenchmark(scenarioId: string, options?: Core.RequestOptions): Promise<Benchmark> {
  const existing = await sdk.benchmark.list({ name: BENCHMARK_NAME, limit: 1 }, options);
  if (existing.length > 0) {
    const benchmark = existing[0]!;
    const update: BenchmarkUpdateParams = { name: BENCHMARK_NAME, scenario_ids: [scenarioId] };
    await benchmark.update(update, options);
    return benchmark;
  }

  return sdk.benchmark.create({ name: BENCHMARK_NAME, scenario_ids: [scenarioId], metadata: SMOKETEST_METADATA }, options);
}

describe('smoketest: object-oriented scenarios and benchmarks', () => {
  test(
    'scenario lifecycle (builder -> run -> score+complete)',
    async () => {
      const requestOptions: Core.RequestOptions = { timeout: POLLING_TIMEOUT_MS };

      let run: ScenarioRun | undefined;
      try {
        const scenario = await pushOrUpdateScenario(requestOptions);
        const info = await scenario.getInfo(requestOptions);
        expect(info.name).toBe(SCENARIO_NAME);

        run = await scenario.runAsync({ run_name: uniqueName('oo-scenario-run') }, requestOptions);
        await run.awaitEnvReady({
          ...requestOptions,
          polling: { timeoutMs: POLLING_TIMEOUT_MS, pollingIntervalMs: POLLING_INTERVAL_MS, maxAttempts: 10 },
        });

        const echo = await run.devbox.cmd.exec('echo hello', undefined, requestOptions);
        expect(echo.exitCode).toBe(0);

        const completed = await run.scoreAndComplete({
          ...requestOptions,
          polling: { timeoutMs: POLLING_TIMEOUT_MS, pollingIntervalMs: POLLING_INTERVAL_MS, maxAttempts: 10 },
        });
        expect(completed.state).toBe('completed');
        expect(completed.scoring_contract_result?.score).not.toBeNull();
      } finally {
        if (run) {
          try {
            await run.cancel({ timeout: 5_000 });
          } catch {
            // Best-effort cleanup: cancel() already attempts to shutdown; ignore failures.
          }
        }
      }
    },
    TEST_TIMEOUT_MS,
  );

  test(
    'benchmark lifecycle (create/update -> start run -> score scenario runs -> complete)',
    async () => {
      const requestOptions: Core.RequestOptions = { timeout: POLLING_TIMEOUT_MS };

      let benchmarkRunId: string | undefined;
      let scenarioRunsToCleanup: ScenarioRunView[] = [];

      try {
        const scenario = await pushOrUpdateScenario(requestOptions);
        const benchmark = await createOrUpdateBenchmark(scenario.id, requestOptions);

        const run = await benchmark.startRun({ run_name: uniqueName('oo-benchmark-run') }, requestOptions);
        benchmarkRunId = run.id;

        // Wait briefly for the benchmark to spawn scenario runs (bounded).
        const start = Date.now();
        let runs: ScenarioRun[] = [];
        while (Date.now() - start < POLLING_TIMEOUT_MS) {
          runs = await run.listScenarioRuns(undefined, requestOptions);
          if (runs.length > 0) break;
          await sleep(POLLING_INTERVAL_MS);
        }
        expect(runs.length).toBeGreaterThan(0);

        // Score and complete each scenario run.
        for (const scenarioRun of runs) {
          const info = await scenarioRun.getInfo(requestOptions);
          scenarioRunsToCleanup.push(info);

          await scenarioRun.awaitEnvReady({
            ...requestOptions,
            polling: { timeoutMs: POLLING_TIMEOUT_MS, pollingIntervalMs: POLLING_INTERVAL_MS, maxAttempts: 10 },
          });

          const completed = await scenarioRun.scoreAndComplete({
            ...requestOptions,
            polling: { timeoutMs: POLLING_TIMEOUT_MS, pollingIntervalMs: POLLING_INTERVAL_MS, maxAttempts: 10 },
          });
          expect(completed.state).toBe('completed');
          expect(completed.scoring_contract_result?.score).not.toBeNull();
        }

        const completedBenchmark = await run.complete({ timeout: POLLING_TIMEOUT_MS });
        expect(completedBenchmark.state).toBe('completed');

        const info = await run.getInfo({ timeout: POLLING_TIMEOUT_MS });
        expect(info.state).toBe('completed');
        expect(info.score).not.toBeNull();
      } finally {
        // Best-effort cleanup: cancel benchmark run if it's still active.
        if (benchmarkRunId) {
          try {
            const benchRun = sdk.api.benchmarks.runs.retrieve(benchmarkRunId, { timeout: 5_000 });
            const info = await benchRun;
            if (info.state === 'running') {
              await sdk.api.benchmarks.runs.cancel(benchmarkRunId, { timeout: 5_000 });
            }
          } catch {
            // ignore
          }
        }

        // Also ensure devboxes are shutdown if scenario runs are still around (best-effort).
        for (const runView of scenarioRunsToCleanup) {
          try {
            await sdk.api.devboxes.shutdown(runView.devbox_id, { timeout: 5_000 });
          } catch {
            // ignore
          }
        }
      }
    },
    TEST_TIMEOUT_MS,
  );
});


