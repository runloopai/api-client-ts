import { ScenarioRun } from '@runloop/api-client/sdk';
import { makeClient, THIRTY_SECOND_TIMEOUT, uniqueName } from '../utils';

const client = makeClient();

describe('smoketest: object-oriented scenario-run', () => {
  let scenarioId: string | undefined;
  let runId: string | undefined;
  let devboxId: string | undefined;

  // Create a scenario to use for testing
  beforeAll(async () => {
    const scenario = await client.scenarios.create({
      name: uniqueName('sdk-scenario-run-test'),
      input_context: { problem_statement: 'Test problem statement' },
      scoring_contract: {
        scoring_function_parameters: [
          {
            name: 'test-scorer',
            scorer: { type: 'command_scorer', command: 'true' },
            weight: 1,
          },
        ],
      },
    });
    scenarioId = scenario.id;
  }, THIRTY_SECOND_TIMEOUT);

  afterAll(async () => {
    // Cleanup: shutdown devbox if still running
    if (devboxId) {
      try {
        await client.devboxes.shutdown(devboxId);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('ScenarioRun lifecycle', () => {
    let run: ScenarioRun;

    test(
      'create scenario run from API and wrap with ScenarioRun',
      async () => {
        // Start a scenario run using the base API
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-run'),
        });

        expect(runView).toBeDefined();
        expect(runView.id).toBeTruthy();
        expect(runView.devbox_id).toBeTruthy();

        runId = runView.id;
        devboxId = runView.devbox_id;

        // Wrap with ScenarioRun
        run = ScenarioRun.fromId(client, runView.id, runView.devbox_id);

        expect(run).toBeInstanceOf(ScenarioRun);
        expect(run.id).toBe(runView.id);
        expect(run.devboxId).toBe(runView.devbox_id);
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'awaitEnvReady - wait for devbox to be ready',
      async () => {
        expect(run).toBeDefined();

        const result = await run.awaitEnvReady({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(runId);
        expect(['running', 'scoring', 'scored', 'completed']).toContain(result.state);
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('getInfo - retrieve scenario run info', async () => {
      expect(run).toBeDefined();

      const info = await run.getInfo();

      expect(info).toBeDefined();
      expect(info.id).toBe(runId);
      expect(info.devbox_id).toBe(devboxId);
      expect(info.scenario_id).toBe(scenarioId);
    });

    test('devbox property - access the devbox', async () => {
      expect(run).toBeDefined();

      const devbox = run.devbox;

      expect(devbox).toBeDefined();
      expect(devbox.id).toBe(devboxId);

      // Verify devbox is functional
      const result = await devbox.cmd.exec('echo "Hello from ScenarioRun devbox"');
      expect(result.exitCode).toBe(0);
      const output = await result.stdout();
      expect(output).toContain('Hello from ScenarioRun devbox');
    });

    test(
      'scoreAndComplete - score and complete the run',
      async () => {
        expect(run).toBeDefined();

        const result = await run.scoreAndComplete({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });

        expect(result).toBeDefined();
        expect(['completed', 'scored', 'failed', 'timeout', 'canceled']).toContain(result.state);
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('getScore - retrieve scoring result', async () => {
      expect(run).toBeDefined();

      const score = await run.getScore();

      // Score should be available after scoreAndComplete
      if (score) {
        expect(typeof score.score).toBe('number');
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(1);
        expect(Array.isArray(score.scoring_function_results)).toBe(true);
      }
    });
  });

  describe('ScenarioRun cancellation', () => {
    let run: ScenarioRun;
    let cancelDevboxId: string | undefined;

    afterAll(async () => {
      // Cleanup
      if (cancelDevboxId) {
        try {
          await client.devboxes.shutdown(cancelDevboxId);
        } catch (e) {
          // Ignore
        }
      }
    });

    test(
      'cancel - cancel a running scenario',
      async () => {
        // Start a new run
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-run-cancel'),
        });

        cancelDevboxId = runView.devbox_id;
        run = ScenarioRun.fromId(client, runView.id, runView.devbox_id);

        // Wait for environment to be ready
        await run.awaitEnvReady({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });

        // Cancel the run
        const result = await run.cancel();

        expect(result).toBeDefined();
        expect(['canceled', 'completed', 'failed']).toContain(result.state);
      },
      THIRTY_SECOND_TIMEOUT,
    );
  });

  describe('ScenarioRun score and await separately', () => {
    let run: ScenarioRun;
    let scoreDevboxId: string | undefined;

    afterAll(async () => {
      // Cleanup
      if (scoreDevboxId) {
        try {
          await client.devboxes.shutdown(scoreDevboxId);
        } catch (e) {
          // Ignore
        }
      }
    });

    test(
      'score and awaitScored - score then wait separately',
      async () => {
        // Start a new run
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-run-score-await'),
        });

        scoreDevboxId = runView.devbox_id;
        run = ScenarioRun.fromId(client, runView.id, runView.devbox_id);

        // Wait for environment to be ready
        await run.awaitEnvReady({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });

        // Score
        const scoreResult = await run.score();
        expect(scoreResult).toBeDefined();
        expect(['scoring', 'scored', 'completed', 'failed']).toContain(scoreResult.state);

        // Wait for scoring to complete
        const awaitResult = await run.awaitScored({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });
        expect(awaitResult).toBeDefined();
        expect(['scored', 'completed', 'failed']).toContain(awaitResult.state);

        // Complete the run
        await run.complete();
      },
      THIRTY_SECOND_TIMEOUT,
    );
  });

  describe('ScenarioRun scoreAndAwait', () => {
    let run: ScenarioRun;
    let scoreAwaitDevboxId: string | undefined;

    afterAll(async () => {
      // Cleanup
      if (scoreAwaitDevboxId) {
        try {
          await client.devboxes.shutdown(scoreAwaitDevboxId);
        } catch (e) {
          // Ignore
        }
      }
    });

    test(
      'scoreAndAwait - score and wait in one call',
      async () => {
        // Start a new run
        const runView = await client.scenarios.startRun({
          scenario_id: scenarioId!,
          run_name: uniqueName('sdk-run-score-and-await'),
        });

        scoreAwaitDevboxId = runView.devbox_id;
        run = ScenarioRun.fromId(client, runView.id, runView.devbox_id);

        // Wait for environment to be ready
        await run.awaitEnvReady({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });

        // Score and await in one call
        const result = await run.scoreAndAwait({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: 20 * 60 * 1000 },
        });
        expect(result).toBeDefined();
        expect(['scored', 'completed', 'failed']).toContain(result.state);

        // Complete the run
        await run.complete();
      },
      THIRTY_SECOND_TIMEOUT,
    );
  });
});
