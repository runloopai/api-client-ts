import { Scenario } from '../../src/sdk/scenario';
import type { ScenarioView, ScenarioRunView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Scenario', () => {
  let mockClient: any;
  let mockScenarioData: ScenarioView;
  let mockScenarioRunData: ScenarioRunView;

  beforeEach(() => {
    mockClient = {
      scenarios: {
        retrieve: jest.fn(),
        update: jest.fn(),
        startRun: jest.fn(),
        startRunAndAwaitEnvReady: jest.fn(),
        runs: {
          retrieve: jest.fn(),
        },
      },
      devboxes: {
        awaitRunning: jest.fn(),
      },
    } as any;

    mockScenarioData = {
      id: 'scn-123',
      name: 'test-scenario',
      input_context: {
        problem_statement: 'Fix the bug',
      },
      scoring_contract: {
        scoring_function_parameters: [],
      },
      metadata: {},
    };

    mockScenarioRunData = {
      id: 'run-456',
      scenario_id: 'scn-123',
      devbox_id: 'devbox-789',
      state: 'running',
      metadata: {},
    };
  });

  describe('fromId', () => {
    it('should create a Scenario instance by ID without API call', () => {
      const scenario = Scenario.fromId(mockClient, 'scn-123');

      expect(scenario).toBeInstanceOf(Scenario);
      expect(scenario.id).toBe('scn-123');
    });
  });

  describe('id property', () => {
    it('should return the scenario ID', () => {
      const scenario = Scenario.fromId(mockClient, 'scn-123');
      expect(scenario.id).toBe('scn-123');
    });
  });

  describe('getInfo', () => {
    it('should retrieve scenario information from API', async () => {
      mockClient.scenarios.retrieve.mockResolvedValue(mockScenarioData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      const info = await scenario.getInfo();

      expect(mockClient.scenarios.retrieve).toHaveBeenCalledWith('scn-123', undefined);
      expect(info).toEqual(mockScenarioData);
      expect(info.name).toBe('test-scenario');
    });

    it('should pass options to the API client', async () => {
      mockClient.scenarios.retrieve.mockResolvedValue(mockScenarioData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      await scenario.getInfo({ timeout: 5000 });

      expect(mockClient.scenarios.retrieve).toHaveBeenCalledWith('scn-123', { timeout: 5000 });
    });
  });

  describe('update', () => {
    it('should update scenario with provided parameters', async () => {
      const updatedData = { ...mockScenarioData, name: 'updated-scenario' };
      mockClient.scenarios.update.mockResolvedValue(updatedData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      const result = await scenario.update({ name: 'updated-scenario' });

      expect(mockClient.scenarios.update).toHaveBeenCalledWith('scn-123', { name: 'updated-scenario' }, undefined);
      expect(result.name).toBe('updated-scenario');
    });
  });

  describe('runAsync', () => {
    it('should start a scenario run without waiting for devbox', async () => {
      mockClient.scenarios.startRun.mockResolvedValue(mockScenarioRunData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      const run = await scenario.runAsync({ run_name: 'test-run' });

      expect(mockClient.scenarios.startRun).toHaveBeenCalledWith(
        { scenario_id: 'scn-123', run_name: 'test-run' },
        undefined,
      );
      expect(run.id).toBe('run-456');
      expect(run.devboxId).toBe('devbox-789');
    });
  });

  describe('run', () => {
    it('should start a scenario run and wait for devbox to be ready', async () => {
      mockClient.scenarios.startRunAndAwaitEnvReady.mockResolvedValue(mockScenarioRunData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      const run = await scenario.run({ run_name: 'test-run' });

      expect(mockClient.scenarios.startRunAndAwaitEnvReady).toHaveBeenCalledWith(
        { scenario_id: 'scn-123', run_name: 'test-run' },
        undefined,
      );
      expect(run.id).toBe('run-456');
    });

    it('should pass polling options to the API client', async () => {
      mockClient.scenarios.startRunAndAwaitEnvReady.mockResolvedValue(mockScenarioRunData);

      const scenario = Scenario.fromId(mockClient, 'scn-123');
      await scenario.run({}, { polling: { maxAttempts: 10 } });

      expect(mockClient.scenarios.startRunAndAwaitEnvReady).toHaveBeenCalledWith(
        { scenario_id: 'scn-123' },
        { polling: { maxAttempts: 10 } },
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors on getInfo', async () => {
      const error = new Error('Scenario not found');
      mockClient.scenarios.retrieve.mockRejectedValue(error);

      const scenario = Scenario.fromId(mockClient, 'scn-nonexistent');

      await expect(scenario.getInfo()).rejects.toThrow('Scenario not found');
    });

    it('should handle API errors on run', async () => {
      const error = new Error('Failed to start run');
      mockClient.scenarios.startRunAndAwaitEnvReady.mockRejectedValue(error);

      const scenario = Scenario.fromId(mockClient, 'scn-123');

      await expect(scenario.run()).rejects.toThrow('Failed to start run');
    });
  });
});

