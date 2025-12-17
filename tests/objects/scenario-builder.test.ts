import { ScenarioBuilder, ScenarioPreview } from '../../src/sdk/scenario-builder';
import { Scenario } from '../../src/sdk/scenario';
import { Blueprint } from '../../src/sdk/blueprint';
import { Snapshot } from '../../src/sdk/snapshot';
import { RunloopError } from '../../src/error';
import type { ScenarioView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('ScenarioBuilder', () => {
  let mockClient: any;
  let mockBlueprint: Blueprint;
  let mockSnapshot: Snapshot;

  beforeEach(() => {
    mockClient = {
      scenarios: {
        create: jest.fn(),
      },
    } as any;

    mockBlueprint = { id: 'bp-123' } as Blueprint;
    mockSnapshot = { id: 'snap-456' } as Snapshot;
  });

  describe('basic construction', () => {
    it('should create a builder with the given name', () => {
      const builder = new ScenarioBuilder('test-scenario', mockClient);
      expect(builder.name).toBe('test-scenario');
    });
  });

  describe('environment configuration', () => {
    it('should set blueprint via fromBlueprint', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .fromBlueprint(mockBlueprint)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.environment_parameters?.blueprint_id).toBe('bp-123');
      expect((params.environment_parameters as any)?.snapshot_id).toBeUndefined();
    });

    it('should set snapshot via fromSnapshot', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .fromSnapshot(mockSnapshot)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.environment_parameters?.snapshot_id).toBe('snap-456');
      expect((params.environment_parameters as any)?.blueprint_id).toBeUndefined();
    });

    it('should clear blueprint when snapshot is set', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .fromBlueprint(mockBlueprint)
        .fromSnapshot(mockSnapshot)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.environment_parameters?.snapshot_id).toBe('snap-456');
      expect((params.environment_parameters as any)?.blueprint_id).toBeUndefined();
    });

    it('should set working directory', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withWorkingDirectory('/app')
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.environment_parameters?.working_directory).toBe('/app');
    });
  });

  describe('input context', () => {
    it('should set problem statement', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug in main.py')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.input_context.problem_statement).toBe('Fix the bug in main.py');
      expect((params.input_context as any).additional_context).toBeUndefined();
    });

    it('should set additional context', () => {
      const context = { hint: 'Check line 42' };
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withAdditionalContext(context)
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.input_context.additional_context).toEqual(context);
    });
  });

  describe('scorers', () => {
    it('should add test command scorer', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addTestCommandScorer('tests', { testCommand: 'pytest' });

      const params = builder.build();
      expect(params.scoring_contract.scoring_function_parameters).toHaveLength(1);
      expect(params.scoring_contract.scoring_function_parameters[0]?.scorer).toEqual({
        type: 'test_based_scorer',
        test_command: 'pytest',
      });
    });

    it('should add test command scorer with test files', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addTestCommandScorer('tests', {
          testCommand: 'pytest',
          testFiles: [{ file_path: 'test_new.py', file_contents: 'def test(): pass' }],
        });

      const params = builder.build();
      const scorer = params.scoring_contract.scoring_function_parameters[0]?.scorer as any;
      expect(scorer.test_files).toHaveLength(1);
    });

    it('should add shell command scorer', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addShellCommandScorer('lint', { command: 'npm run lint' });

      const params = builder.build();
      expect(params.scoring_contract.scoring_function_parameters[0]?.scorer).toEqual({
        type: 'command_scorer',
        command: 'npm run lint',
      });
    });

    it('should add bash script scorer', () => {
      const script = 'echo "score=1.0"';
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('custom', { bashScript: script });

      const params = builder.build();
      expect(params.scoring_contract.scoring_function_parameters[0]?.scorer).toEqual({
        type: 'bash_script_scorer',
        bash_script: script,
      });
    });

    it('should add python script scorer', () => {
      const script = 'print(1.0)';
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addPythonScriptScorer('python', {
          pythonScript: script,
          pythonVersionConstraint: '==3.11',
          requirementsContents: 'numpy',
        });

      const params = builder.build();
      const scorer = params.scoring_contract.scoring_function_parameters[0]?.scorer as any;
      expect(scorer.type).toBe('python_script_scorer');
      expect(scorer.python_script).toBe(script);
      expect(scorer.python_version_constraint).toBe('==3.11');
      expect(scorer.requirements_contents).toBe('numpy');
    });

    it('should add AST grep scorer', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addAstGrepScorer('pattern', { pattern: 'console.log($$$)', lang: 'typescript' });

      const params = builder.build();
      const scorer = params.scoring_contract.scoring_function_parameters[0]?.scorer as any;
      expect(scorer.type).toBe('ast_grep_scorer');
      expect(scorer.pattern).toBe('console.log($$$)');
      expect(scorer.lang).toBe('typescript');
    });

    it('should add custom scorer', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addCustomScorer('custom', {
          customScorerType: 'my_scorer',
          scorerParams: { threshold: 0.8 },
        });

      const params = builder.build();
      const scorer = params.scoring_contract.scoring_function_parameters[0]?.scorer as any;
      expect(scorer.type).toBe('custom_scorer');
      expect(scorer.custom_scorer_type).toBe('my_scorer');
      expect(scorer.scorer_params).toEqual({ threshold: 0.8 });
    });

    it('should default to weight=1.0 for a single scorer when no weights are provided', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo 1' });

      const params = builder.build();
      expect(params.scoring_contract.scoring_function_parameters).toHaveLength(1);
      expect(params.scoring_contract.scoring_function_parameters[0]?.weight).toBe(1.0);
    });

    it('should default to equal weights when no weights are provided', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer1', { bashScript: 'echo 1' })
        .addBashScriptScorer('scorer2', { bashScript: 'echo 2' })
        .addBashScriptScorer('scorer3', { bashScript: 'echo 3' });

      const params = builder.build();
      const weights = params.scoring_contract.scoring_function_parameters.map((s) => s.weight);
      expect(weights).toHaveLength(3);
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 12);
    });

    it('should throw if some scorers specify weights and others do not', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer1', { bashScript: 'echo 1', weight: 1.0 })
        .addBashScriptScorer('scorer2', { bashScript: 'echo 2' });

      expect(() => builder.build()).toThrow('Either provide weights for all scorers or for none');
    });

    it('should throw if provided weights do not sum to 1.0', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer1', { bashScript: 'echo 1', weight: 2 })
        .addBashScriptScorer('scorer2', { bashScript: 'echo 2', weight: 3 });

      expect(() => builder.build()).toThrow('Scorer weights must sum to 1.0');
    });

    it('should accept provided weights when they sum to 1.0', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer1', { bashScript: 'echo 1', weight: 0.25 })
        .addBashScriptScorer('scorer2', { bashScript: 'echo 2', weight: 0.75 });

      const params = builder.build();
      const weights = params.scoring_contract.scoring_function_parameters.map((s) => s.weight);
      expect(weights[0]).toBeCloseTo(0.25, 12);
      expect(weights[1]).toBeCloseTo(0.75, 12);
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 12);
    });

    it('should throw for non-finite weights', () => {
      expect(() =>
        new ScenarioBuilder('test', mockClient)
          .withProblemStatement('Fix the bug')
          .addBashScriptScorer('scorer', { bashScript: 'echo 1', weight: Number.NaN }),
      ).toThrow('Scorer weight must be a finite number');
    });

    it('should throw for invalid scorer names', () => {
      expect(() =>
        new ScenarioBuilder('test', mockClient)
          .withProblemStatement('Fix the bug')
          .addBashScriptScorer('bad name', { bashScript: 'echo 1' }),
      ).toThrow('Scorer name must only contain');
    });

    it('should throw error for non-positive weight', () => {
      const builder = new ScenarioBuilder('test', mockClient);

      expect(() => builder.addBashScriptScorer('scorer', { bashScript: 'echo 1', weight: 0 })).toThrow(
        'Scorer weight must be positive',
      );

      expect(() => builder.addBashScriptScorer('scorer', { bashScript: 'echo 1', weight: -1 })).toThrow(
        'Scorer weight must be positive',
      );
    });
  });

  describe('metadata and options', () => {
    it('should set metadata', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withMetadata({ version: '1', category: 'bugfix' })
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.metadata).toEqual({ version: '1', category: 'bugfix' });
    });

    it('should set reference output', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withReferenceOutput('diff --git a/main.py...')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.reference_output).toBe('diff --git a/main.py...');
    });

    it('should set required env vars', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withRequiredEnvVars(['API_KEY', 'DATABASE_URL'])
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.required_environment_variables).toEqual(['API_KEY', 'DATABASE_URL']);
    });

    it('should set required secrets', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withRequiredSecrets(['GITHUB_TOKEN'])
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.required_secret_names).toEqual(['GITHUB_TOKEN']);
    });

    it('should set validation type', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .withValidationType('FORWARD')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();
      expect(params.validation_type).toBe('FORWARD');
    });
  });

  describe('build', () => {
    it('should throw error if problem statement is missing', () => {
      const builder = new ScenarioBuilder('test', mockClient).addBashScriptScorer('scorer', {
        bashScript: 'echo "score=1.0"',
      });

      expect(() => builder.build()).toThrow('Problem statement is required');
    });

    it('should throw error if no scorers are provided', () => {
      const builder = new ScenarioBuilder('test', mockClient).withProblemStatement('Fix the bug');

      expect(() => builder.build()).toThrow('At least one scorer is required');
    });

    it('should build valid params with all required fields', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const params = builder.build();

      expect(params.name).toBe('test');
      expect(params.input_context.problem_statement).toBe('Fix the bug');
      expect(params.scoring_contract.scoring_function_parameters).toHaveLength(1);
    });
  });

  describe('preview', () => {
    it('should return preview without validation', () => {
      const builder = new ScenarioBuilder('test', mockClient);

      const preview = builder.preview();

      expect(preview.name).toBe('test');
      expect(preview.input_context.problem_statement).toBeNull();
      expect(preview.scoring_contract.scoring_function_parameters).toHaveLength(0);
    });

    it('should return full preview with all configuration', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .fromBlueprint(mockBlueprint)
        .withWorkingDirectory('/app')
        .withProblemStatement('Fix the bug')
        .withAdditionalContext({ hint: 'line 42' })
        .withMetadata({ version: '1' })
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const preview = builder.preview();

      expect(preview.name).toBe('test');
      expect(preview.environment?.blueprint_id).toBe('bp-123');
      expect(preview.environment?.working_directory).toBe('/app');
      expect(preview.input_context.problem_statement).toBe('Fix the bug');
      expect(preview.input_context.additional_context).toEqual({ hint: 'line 42' });
      expect(preview.metadata).toEqual({ version: '1' });
      expect(preview.scoring_contract.scoring_function_parameters).toHaveLength(1);
    });
  });

  describe('push', () => {
    it('should create scenario on platform', async () => {
      const mockScenarioView: ScenarioView = {
        id: 'scn-new-123',
        name: 'test',
        input_context: { problem_statement: 'Fix the bug' },
        scoring_contract: { scoring_function_parameters: [] },
        metadata: {},
      };
      mockClient.scenarios.create.mockResolvedValue(mockScenarioView);

      const builder = new ScenarioBuilder('test', mockClient)
        .withProblemStatement('Fix the bug')
        .addBashScriptScorer('scorer', { bashScript: 'echo "score=1.0"' });

      const scenario = await builder.push();

      expect(mockClient.scenarios.create).toHaveBeenCalled();
      expect(scenario).toBeInstanceOf(Scenario);
      expect(scenario.id).toBe('scn-new-123');
    });

    it('should throw error if required fields missing', async () => {
      const builder = new ScenarioBuilder('test', mockClient);

      await expect(builder.push()).rejects.toThrow('Problem statement is required');
    });
  });

  describe('fluent API', () => {
    it('should support method chaining', () => {
      const builder = new ScenarioBuilder('test', mockClient)
        .fromBlueprint(mockBlueprint)
        .withWorkingDirectory('/app')
        .withProblemStatement('Fix the bug')
        .withAdditionalContext({ hint: 'Check tests' })
        .addTestCommandScorer('tests', { testCommand: 'pytest', weight: 0.5 })
        .addBashScriptScorer('custom', { bashScript: 'echo "score=1.0"', weight: 0.5 })
        .withMetadata({ version: '1' })
        .withReferenceOutput('patch content')
        .withRequiredEnvVars(['API_KEY'])
        .withRequiredSecrets(['SECRET'])
        .withValidationType('FORWARD');

      expect(builder.name).toBe('test');

      const params = builder.build();
      expect(params.name).toBe('test');
      expect(params.environment_parameters?.blueprint_id).toBe('bp-123');
      expect(params.environment_parameters?.working_directory).toBe('/app');
      expect(params.scoring_contract.scoring_function_parameters).toHaveLength(2);
    });
  });
});

