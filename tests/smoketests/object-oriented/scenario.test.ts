import { Scenario, ScenarioBuilder, ScenarioRun } from '@runloop/api-client/sdk';
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

  describe('ScenarioBuilder', () => {
    test('builder() returns a ScenarioBuilder instance', () => {
      const builder = sdk.scenario.builder('test-builder');
      expect(builder).toBeInstanceOf(ScenarioBuilder);
      expect(builder.name).toBe('test-builder');
    });

    test('build() produces valid params with all scorer types and normalizes weights', () => {
      const blueprint = sdk.blueprint.fromId('bp_fake');

      const params = sdk.scenario
        .builder('build-test')
        .fromBlueprint(blueprint)
        .withWorkingDirectory('/app')
        .withProblemStatement('Test problem')
        .withAdditionalContext({ hint: 'test' })
        .addTestCommandScorer('test', { test_command: 'pytest', weight: 2 })
        .addShellCommandScorer('cmd', { command: 'echo 1.0', weight: 1 })
        .addBashScriptScorer('bash', { bash_script: 'echo "score=1.0"', weight: 1 })
        .addPythonScriptScorer('python', { python_script: 'print(1.0)', weight: 1 })
        .addAstGrepScorer('ast', { pattern: 'console.log($$$)', weight: 1 })
        .addCustomScorer('custom', { custom_scorer_type: 'test_type', weight: 1 })
        .withMetadata({ env: 'test' })
        .withReferenceOutput('reference')
        .withRequiredEnvVars(['TEST_VAR'])
        .withRequiredSecrets(['TEST_SECRET'])
        .withValidationType('EVALUATION')
        .build();

      expect(params.name).toBe('build-test');
      expect(params.input_context.problem_statement).toBe('Test problem');
      expect(params.environment_parameters?.blueprint_id).toBe('bp_fake');
      expect(params.scoring_contract.scoring_function_parameters).toHaveLength(6);

      const totalWeight = params.scoring_contract.scoring_function_parameters.reduce(
        (sum, s) => sum + s.weight,
        0,
      );
      expect(totalWeight).toBeCloseTo(1.0);
    });

    test('build() with fromSnapshot sets snapshot_id', () => {
      const snapshot = sdk.snapshot.fromId('snap_fake');
      const params = sdk.scenario
        .builder('snap-test')
        .fromSnapshot(snapshot)
        .withProblemStatement('test')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .build();

      expect(params.environment_parameters?.snapshot_id).toBe('snap_fake');
      expect(params.environment_parameters?.blueprint_id).toBeNull();
    });

    test('build() throws without problem statement', () => {
      const builder = sdk.scenario.builder('test').addShellCommandScorer('s', { command: 'echo 1' });
      expect(() => builder.build()).toThrow('Problem statement is required');
    });

    test('build() throws without scorers', () => {
      const builder = sdk.scenario.builder('test').withProblemStatement('test');
      expect(() => builder.build()).toThrow('At least one scorer is required');
    });

    test(
      'push() creates scenario on platform',
      async () => {
        const scenario = await sdk.scenario
          .builder(uniqueName('sdk-builder-push'))
          .withProblemStatement('Builder push test')
          .addShellCommandScorer('s', { command: 'echo 1.0' })
          .push();

        expect(scenario).toBeInstanceOf(Scenario);
        expect(scenario.id).toBeTruthy();
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
          longPoll: { timeoutMs: SHORT_TIMEOUT },
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
          { polling: { timeoutMs: SHORT_TIMEOUT } },
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
