import { Scenario, ScenarioRun } from '@runloop/api-client/sdk';
import { makeClientSDK, SHORT_TIMEOUT, uniqueName } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented scenario', () => {
  let scenarioId: string | undefined;
  let devboxId: string | undefined;

  beforeAll(async () => {
    const scenarioView = await sdk.api.scenarios.create({
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
    if (devboxId) {
      try {
        await sdk.api.devboxes.shutdown(devboxId);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Scenario basic operations', () => {
    let scenario: Scenario;

    beforeAll(() => {
      scenario = sdk.scenario.fromId(scenarioId!);
    });

    test('id getter - returns scenario ID', () => {
      expect(scenario.id).toBe(scenarioId);
    });

    test(
      'getInfo - retrieves scenario details',
      async () => {
        const info = await scenario.getInfo();

        expect(info).toBeDefined();
        expect(info.id).toBe(scenarioId);
        expect(info.name).toContain('sdk-scenario-test');
        expect(info.input_context?.problem_statement).toBe('Test problem statement for Scenario class');
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

  describe('Scenario list', () => {
    test(
      'list - returns scenarios via SDK',
      async () => {
        const scenarios = await sdk.scenario.list({ limit: 5 });
        expect(Array.isArray(scenarios)).toBe(true);
        expect(scenarios.length).toBeGreaterThan(0);

        for (const s of scenarios) {
          expect(s.id).toBeTruthy();
        }
      },
      SHORT_TIMEOUT,
    );
  });

  describe('Scenario run methods', () => {
    let scenario: Scenario;

    beforeAll(() => {
      scenario = sdk.scenario.fromId(scenarioId!);
    });

    test(
      'runAsync - starts run without waiting for devbox',
      async () => {
        const run = await scenario.runAsync({ run_name: uniqueName('sdk-run-async') });

        expect(run).toBeInstanceOf(ScenarioRun);
        expect(run.id).toBeTruthy();
        expect(run.devboxId).toBeTruthy();

        devboxId = run.devboxId;

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

        devboxId = run.devboxId;

        const info = await run.getInfo();
        expect(['running', 'scoring', 'scored', 'completed']).toContain(info.state);

        await run.cancel();
      },
      SHORT_TIMEOUT,
    );
  });
});
