import { Scenario, ScenarioRun } from '@runloop/api-client/sdk';
import { makeClient, SHORT_TIMEOUT, uniqueName } from '../utils';

const client = makeClient();

describe('smoketest: object-oriented scenario', () => {
  let scenarioId: string | undefined;
  let devboxId: string | undefined;

  // Create a scenario to use for testing
  beforeAll(async () => {
    const scenarioView = await client.scenarios.create({
      name: uniqueName('sdk-scenario-test'),
      input_context: { problem_statement: 'Test problem statement for Scenario class' },
      scoring_contract: {
        scoring_function_parameters: [
          {
            name: 'test-scorer',
            scorer: { type: 'command_scorer', command: 'echo 1.0' },
            weight: 1,
          },
        ],
      },
    });
    scenarioId = scenarioView.id;
  }, SHORT_TIMEOUT);

  afterAll(async () => {
    // Cleanup: shutdown devbox if still running
    if (devboxId) {
      try {
        await client.devboxes.shutdown(devboxId);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Scenario basic operations', () => {
    let scenario: Scenario;

    beforeAll(() => {
      scenario = Scenario.fromId(client, scenarioId!);
    });

    test(
      'getInfo - retrieves scenario details',
      async () => {
        const info = await scenario.getInfo();

        expect(info).toBeDefined();
        expect(info.id).toBe(scenarioId);
        expect(info.name).toContain('sdk-scenario-test');
        expect(info.input_context?.problem_statement).toBe(
          'Test problem statement for Scenario class',
        );
      },
      SHORT_TIMEOUT,
    );

    test(
      'update - updates scenario metadata',
      async () => {
        const updated = await scenario.update({
          metadata: { test_key: 'test_value' },
        });

        expect(updated).toBeDefined();
        expect(updated.id).toBe(scenarioId);
        expect(updated.metadata).toEqual({ test_key: 'test_value' });
      },
      SHORT_TIMEOUT,
    );
  });

  describe('Scenario run methods', () => {
    let scenario: Scenario;

    beforeAll(() => {
      scenario = Scenario.fromId(client, scenarioId!);
    });

    test(
      'runAsync - starts run without waiting for devbox',
      async () => {
        const run = await scenario.runAsync({ run_name: uniqueName('sdk-run-async') });

        expect(run).toBeInstanceOf(ScenarioRun);
        expect(run.id).toBeTruthy();
        expect(run.devboxId).toBeTruthy();

        // Store for cleanup
        devboxId = run.devboxId;

        // Wait for devbox and cancel the run
        await run.awaitEnvReady({
          polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: SHORT_TIMEOUT },
        });
        await run.cancel();
      },
      SHORT_TIMEOUT,
    );

    test(
      'run - starts run and waits for devbox to be ready',
      async () => {
        const run = await scenario.run(
          { run_name: uniqueName('sdk-run-sync') },
          { polling: { maxAttempts: 120, pollingIntervalMs: 5_000, timeoutMs: SHORT_TIMEOUT } },
        );

        expect(run).toBeInstanceOf(ScenarioRun);
        expect(run.id).toBeTruthy();
        expect(run.devboxId).toBeTruthy();

        // Update devboxId for cleanup
        devboxId = run.devboxId;

        // Verify devbox is ready by getting run info
        const info = await run.getInfo();
        expect(['running', 'scoring', 'scored', 'completed']).toContain(info.state);

        // Clean up
        await run.cancel();
      },
      SHORT_TIMEOUT,
    );
  });
});
