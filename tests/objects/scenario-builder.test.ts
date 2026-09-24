import { ScenarioBuilder } from '../../src/sdk/scenario-builder';
import { Scenario } from '../../src/sdk/scenario';
import { Blueprint } from '../../src/sdk/blueprint';
import { Snapshot } from '../../src/sdk/snapshot';
import type { ScenarioView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('ScenarioBuilder', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      scenarios: {
        create: jest.fn().mockResolvedValue({ id: 'scn_created' } as ScenarioView),
      },
    };
  });

  describe('name getter', () => {
    it('should return the name set in constructor', () => {
      const builder = new ScenarioBuilder('test-scenario', mockClient);
      expect(builder.name).toBe('test-scenario');
    });
  });

  describe('build()', () => {
    it('should produce correct params with all options and all scorer types', () => {
      const mockBlueprint = Blueprint.fromId(mockClient, 'bp_123');

      const params = new ScenarioBuilder('full-test', mockClient)
        .fromBlueprint(mockBlueprint)
        .withWorkingDirectory('/app')
        .withProblemStatement('Fix the bug')
        .withAdditionalContext({ hint: 'check main.py' })
        .addTestCommandScorer('test-scorer', {
          test_command: 'pytest',
          weight: 2,
          test_files: [{ file_path: 'test.py', file_contents: 'def test(): pass' }],
        })
        .addShellCommandScorer('cmd-scorer', { command: 'echo pass', weight: 3 })
        .addBashScriptScorer('bash-scorer', { bash_script: 'echo "score=1.0"', weight: 1 })
        .addPythonScriptScorer('py-scorer', {
          python_script: 'print(1.0)',
          weight: 2,
          python_version_constraint: '>=3.11',
          requirements_contents: 'numpy==1.26',
        })
        .addAstGrepScorer('ast-scorer', { pattern: 'console.log($$$)', weight: 1, lang: 'javascript' })
        .addCustomScorer('custom-scorer', {
          custom_scorer_type: 'my_scorer',
          weight: 1,
          scorer_params: { threshold: 0.5 },
        })
        .withMetadata({ env: 'test' })
        .withReferenceOutput('diff --git a/main.py')
        .withRequiredEnvVars(['API_KEY'])
        .withRequiredSecrets(['DB_PASS'])
        .withValidationType('FORWARD')
        .build();

      // Required fields
      expect(params.name).toBe('full-test');
      expect(params.input_context.problem_statement).toBe('Fix the bug');
      expect(params.input_context.additional_context).toEqual({ hint: 'check main.py' });

      // Environment
      expect(params.environment_parameters?.blueprint_id).toBe('bp_123');
      expect(params.environment_parameters?.snapshot_id).toBeNull();
      expect(params.environment_parameters?.working_directory).toBe('/app');

      // Scorers - count and weight normalization
      const scorers = params.scoring_contract.scoring_function_parameters;
      expect(scorers).toHaveLength(6);
      const totalWeight = scorers.reduce((sum, s) => sum + s.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0);

      // Verify each scorer type
      expect(scorers[0]!.name).toBe('test-scorer');
      expect(scorers[0]!.scorer).toEqual({
        type: 'test_based_scorer',
        test_command: 'pytest',
        test_files: [{ file_path: 'test.py', file_contents: 'def test(): pass' }],
      });

      expect(scorers[1]!.scorer).toEqual({ type: 'command_scorer', command: 'echo pass' });
      expect(scorers[2]!.scorer).toEqual({ type: 'bash_script_scorer', bash_script: 'echo "score=1.0"' });
      expect(scorers[3]!.scorer).toEqual({
        type: 'python_script_scorer',
        python_script: 'print(1.0)',
        python_version_constraint: '>=3.11',
        requirements_contents: 'numpy==1.26',
      });
      expect(scorers[4]!.scorer).toEqual({
        type: 'ast_grep_scorer',
        pattern: 'console.log($$$)',
        search_directory: '.',
        lang: 'javascript',
      });
      expect(scorers[5]!.scorer).toEqual({
        type: 'custom_scorer',
        custom_scorer_type: 'my_scorer',
        scorer_params: { threshold: 0.5 },
      });

      // Metadata fields
      expect(params.metadata).toEqual({ env: 'test' });
      expect(params.reference_output).toBe('diff --git a/main.py');
      expect(params.required_environment_variables).toEqual(['API_KEY']);
      expect(params.required_secret_names).toEqual(['DB_PASS']);
      expect(params.validation_type).toBe('FORWARD');
    });

    it('should default search_directory to "." for ast grep scorer', () => {
      const params = new ScenarioBuilder('ast-test', mockClient)
        .withProblemStatement('test')
        .addAstGrepScorer('ast', { pattern: 'foo' })
        .build();

      expect((params.scoring_contract.scoring_function_parameters[0]!.scorer as any).search_directory).toBe(
        '.',
      );
    });

    it('should omit optional fields when not set', () => {
      const params = new ScenarioBuilder('minimal', mockClient)
        .withProblemStatement('test')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .build();

      expect(params.environment_parameters).toBeUndefined();
      expect(params.metadata).toBeUndefined();
      expect(params.reference_output).toBeUndefined();
      expect(params.required_environment_variables).toBeUndefined();
      expect(params.required_secret_names).toBeUndefined();
      expect(params.validation_type).toBeUndefined();
    });
  });

  describe('fromBlueprint / fromSnapshot mutual exclusion', () => {
    it('should clear snapshot when setting blueprint', () => {
      const snapshot = Snapshot.fromId(mockClient, 'snap_1');
      const blueprint = Blueprint.fromId(mockClient, 'bp_1');

      const params = new ScenarioBuilder('test', mockClient)
        .fromSnapshot(snapshot)
        .fromBlueprint(blueprint)
        .withProblemStatement('test')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .build();

      expect(params.environment_parameters?.blueprint_id).toBe('bp_1');
      expect(params.environment_parameters?.snapshot_id).toBeNull();
    });

    it('should clear blueprint when setting snapshot', () => {
      const blueprint = Blueprint.fromId(mockClient, 'bp_1');
      const snapshot = Snapshot.fromId(mockClient, 'snap_1');

      const params = new ScenarioBuilder('test', mockClient)
        .fromBlueprint(blueprint)
        .fromSnapshot(snapshot)
        .withProblemStatement('test')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .build();

      expect(params.environment_parameters?.snapshot_id).toBe('snap_1');
      expect(params.environment_parameters?.blueprint_id).toBeNull();
    });
  });

  describe('validation errors', () => {
    it('should throw when problem statement is missing', () => {
      const builder = new ScenarioBuilder('test', mockClient).addShellCommandScorer('s', {
        command: 'echo 1',
      });

      expect(() => builder.build()).toThrow('Problem statement is required');
    });

    it('should throw when no scorers are configured', () => {
      const builder = new ScenarioBuilder('test', mockClient).withProblemStatement('test');

      expect(() => builder.build()).toThrow('At least one scorer is required');
    });

    it('should throw when scorer weight is not a finite positive number', () => {
      const builder = new ScenarioBuilder('test', mockClient);

      expect(() => builder.addShellCommandScorer('s', { command: 'echo 1', weight: 0 })).toThrow(
        'Scorer weight must be a finite positive number',
      );

      expect(() => builder.addShellCommandScorer('s', { command: 'echo 1', weight: -1 })).toThrow(
        'Scorer weight must be a finite positive number',
      );

      expect(() => builder.addShellCommandScorer('s', { command: 'echo 1', weight: NaN })).toThrow(
        'Scorer weight must be a finite positive number',
      );

      expect(() => builder.addShellCommandScorer('s', { command: 'echo 1', weight: Infinity })).toThrow(
        'Scorer weight must be a finite positive number',
      );
    });
  });

  describe('push()', () => {
    it('should call client.scenarios.create with build output and return Scenario', async () => {
      const scenario = await new ScenarioBuilder('push-test', mockClient)
        .withProblemStatement('Fix it')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .push();

      expect(mockClient.scenarios.create).toHaveBeenCalledTimes(1);
      const callArgs = mockClient.scenarios.create.mock.calls[0];
      expect(callArgs[0].name).toBe('push-test');
      expect(callArgs[0].input_context.problem_statement).toBe('Fix it');

      expect(scenario).toBeInstanceOf(Scenario);
      expect(scenario.id).toBe('scn_created');
    });

    it('should pass request options through', async () => {
      const options = { timeout: 5000 };
      await new ScenarioBuilder('test', mockClient)
        .withProblemStatement('test')
        .addShellCommandScorer('s', { command: 'echo 1' })
        .push(options);

      expect(mockClient.scenarios.create).toHaveBeenCalledWith(expect.any(Object), options);
    });

    it('should throw build validation errors before calling API', async () => {
      const builder = new ScenarioBuilder('test', mockClient);

      await expect(builder.push()).rejects.toThrow('Problem statement is required');
      expect(mockClient.scenarios.create).not.toHaveBeenCalled();
    });
  });

  describe('fluent chaining', () => {
    it('should return the same builder instance from all methods', () => {
      const builder = new ScenarioBuilder('test', mockClient);
      const blueprint = Blueprint.fromId(mockClient, 'bp_1');
      const snapshot = Snapshot.fromId(mockClient, 'snap_1');

      expect(builder.fromBlueprint(blueprint)).toBe(builder);
      expect(builder.fromSnapshot(snapshot)).toBe(builder);
      expect(builder.withWorkingDirectory('/app')).toBe(builder);
      expect(builder.withProblemStatement('test')).toBe(builder);
      expect(builder.withAdditionalContext({})).toBe(builder);
      expect(builder.addTestCommandScorer('t', { test_command: 'pytest' })).toBe(builder);
      expect(builder.addShellCommandScorer('s', { command: 'echo 1' })).toBe(builder);
      expect(builder.addBashScriptScorer('b', { bash_script: 'echo 1' })).toBe(builder);
      expect(builder.addPythonScriptScorer('p', { python_script: 'print(1)' })).toBe(builder);
      expect(builder.addAstGrepScorer('a', { pattern: 'foo' })).toBe(builder);
      expect(builder.addCustomScorer('c', { custom_scorer_type: 'x' })).toBe(builder);
      expect(builder.withMetadata({})).toBe(builder);
      expect(builder.withReferenceOutput('ref')).toBe(builder);
      expect(builder.withRequiredEnvVars([])).toBe(builder);
      expect(builder.withRequiredSecrets([])).toBe(builder);
      expect(builder.withValidationType('FORWARD')).toBe(builder);
    });
  });
});
