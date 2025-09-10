import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from './utils';

const client = makeClient();

describe('smoketest: scenarios and benchmarks', () => {
  let scenarioId: string | undefined;
  let runId: string | undefined;

  test(
    'create scenario',
    async () => {
      const scenario = await client.scenarios.create({
        name: uniqueName('scenario'),
        input_context: { problem_statement: 'echo hello' },
        scoring_contract: {
          scoring_function_parameters: [
            {
              name: 'cmd-zero',
              scorer: { type: 'command_scorer', command: 'true' },
              weight: 1,
            },
          ],
        },
      });
      scenarioId = scenario.id;
    },
    THIRTY_SECOND_TIMEOUT,
  );

  test(
    'start scenario run and await env ready',
    async () => {
      const run = await client.scenarios.startRunAndAwaitEnvReady(
        { scenario_id: scenarioId! },
        {
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        },
      );
      expect(run.scenario_id).toBe(scenarioId);
      runId = run.id;
    },
    THIRTY_SECOND_TIMEOUT,
  );

  test(
    'score and complete scenario run',
    async () => {
      const scored = await client.scenarios.runs.scoreAndComplete(runId!, {
        polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
      });
      expect(['completed', 'scored', 'running', 'failed', 'timeout', 'canceled']).toContain(scored.state);
    },
    THIRTY_SECOND_TIMEOUT,
  );

  test(
    'create benchmark and start run',
    async () => {
      const benchmark = await client.benchmarks.create({
        name: uniqueName('benchmark'),
        scenario_ids: [scenarioId!],
      });
      expect(benchmark.id).toBeTruthy();

      const run = await client.benchmarks.startRun({ benchmark_id: benchmark.id });
      expect(run.benchmark_id).toBe(benchmark.id);
    },
    THIRTY_SECOND_TIMEOUT,
  );
});
