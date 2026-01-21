import { Scenario } from '../../src/sdk/scenario';
import { ScenarioRun } from '../../src/sdk/scenario-run';
import type { ScenarioView, ScenarioRunView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Scenario', () => {
  let mockClient: any;
  let mockScenarioData: ScenarioView;
  let mockScenarioRunData: ScenarioRunView;

  beforeEach(() => {
    mockScenarioData = {
      id: 'scenario-123',
      name: 'Test Scenario',
      input_context: {
        problem_statement: 'Solve this problem',
      },
      environment_parameters: {},
      scoring_contract: {
        scoring_function_parameters: [],
      },
      metadata: {},
    } as ScenarioView;

    mockScenarioRunData = {
      id: 'run-456',
      devbox_id: 'devbox-789',
      scenario_id: 'scenario-123',
      state: 'running',
    } as ScenarioRunView;

    mockClient = {
      scenarios: {
        retrieve: jest.fn().mockResolvedValue(mockScenarioData),
        update: jest.fn().mockResolvedValue(mockScenarioData),
        startRun: jest.fn().mockResolvedValue(mockScenarioRunData),
        startRunAndAwaitEnvReady: jest.fn().mockResolvedValue(mockScenarioRunData),
      },
    };
  });

  describe('fromId', () => {
    it('should create a Scenario instance with correct id', () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      expect(scenario).toBeInstanceOf(Scenario);
      expect(scenario.id).toBe('scenario-123');
    });
  });

  describe('getInfo', () => {
    it('should retrieve scenario info from API', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      const info = await scenario.getInfo();

      expect(mockClient.scenarios.retrieve).toHaveBeenCalledWith('scenario-123', undefined);
      expect(info.id).toBe('scenario-123');
      expect(info.name).toBe('Test Scenario');
    });

    it('should pass options to the API client', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');
      const options = { timeout: 5000 };

      await scenario.getInfo(options);

      expect(mockClient.scenarios.retrieve).toHaveBeenCalledWith('scenario-123', options);
    });
  });

  describe('update', () => {
    it('should update scenario with provided params', async () => {
      const updatedData = { ...mockScenarioData, name: 'Updated Name' };
      mockClient.scenarios.update.mockResolvedValue(updatedData);
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      const result = await scenario.update({ name: 'Updated Name' });

      expect(mockClient.scenarios.update).toHaveBeenCalledWith(
        'scenario-123',
        { name: 'Updated Name' },
        undefined,
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should allow calling update without params', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      await scenario.update();

      expect(mockClient.scenarios.update).toHaveBeenCalledWith('scenario-123', undefined, undefined);
    });
  });

  describe('runAsync', () => {
    it('should start a run and return ScenarioRun instance', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      const run = await scenario.runAsync({ run_name: 'test-run' });

      expect(mockClient.scenarios.startRun).toHaveBeenCalledWith(
        { scenario_id: 'scenario-123', run_name: 'test-run' },
        undefined,
      );
      expect(run).toBeInstanceOf(ScenarioRun);
      expect(run.id).toBe('run-456');
      expect(run.devboxId).toBe('devbox-789');
    });

    it('should work without params', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      const run = await scenario.runAsync();

      expect(mockClient.scenarios.startRun).toHaveBeenCalledWith(
        { scenario_id: 'scenario-123' },
        undefined,
      );
      expect(run).toBeInstanceOf(ScenarioRun);
    });
  });

  describe('run', () => {
    it('should start a run and wait for devbox, returning ScenarioRun instance', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      const run = await scenario.run({ run_name: 'test-run' });

      expect(mockClient.scenarios.startRunAndAwaitEnvReady).toHaveBeenCalledWith(
        { scenario_id: 'scenario-123', run_name: 'test-run' },
        undefined,
      );
      expect(run).toBeInstanceOf(ScenarioRun);
      expect(run.id).toBe('run-456');
      expect(run.devboxId).toBe('devbox-789');
    });

    it('should pass polling options', async () => {
      const scenario = Scenario.fromId(mockClient, 'scenario-123');
      const options = { polling: { pollingIntervalMs: 1000 } };

      await scenario.run({ run_name: 'test-run' }, options);

      expect(mockClient.scenarios.startRunAndAwaitEnvReady).toHaveBeenCalledWith(
        { scenario_id: 'scenario-123', run_name: 'test-run' },
        options,
      );
    });
  });

  describe('error handling', () => {
    it('should propagate errors from getInfo', async () => {
      const error = new Error('API error');
      mockClient.scenarios.retrieve.mockRejectedValue(error);
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      await expect(scenario.getInfo()).rejects.toThrow('API error');
    });

    it('should propagate errors from startRun', async () => {
      const error = new Error('Failed to start run');
      mockClient.scenarios.startRun.mockRejectedValue(error);
      const scenario = Scenario.fromId(mockClient, 'scenario-123');

      await expect(scenario.runAsync()).rejects.toThrow('Failed to start run');
    });
  });
});
