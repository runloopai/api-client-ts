import { ScenarioRun } from '../../src/sdk/scenario-run';
import { Devbox } from '../../src/sdk/devbox';
import type { ScenarioRunView, ScoringContractResultView } from '../../src/resources/scenarios/scenarios';
import type { DevboxView } from '../../src/resources/devboxes/devboxes';

// Mock the Runloop client
jest.mock('../../src/index');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
  },
  constants: {
    W_OK: 2,
  },
}));

describe('ScenarioRun', () => {
  let mockClient: any;
  let mockScenarioRunData: ScenarioRunView;
  let mockDevboxData: DevboxView;
  let mockScoringResult: ScoringContractResultView;

  beforeEach(() => {
    // Create mock client instance with proper structure
    mockClient = {
      scenarios: {
        runs: {
          retrieve: jest.fn(),
          score: jest.fn(),
          awaitScored: jest.fn(),
          scoreAndAwait: jest.fn(),
          scoreAndComplete: jest.fn(),
          complete: jest.fn(),
          cancel: jest.fn(),
          downloadLogs: jest.fn(),
        },
      },
      devboxes: {
        retrieve: jest.fn(),
        awaitRunning: jest.fn(),
        createAndAwaitRunning: jest.fn(),
        shutdown: jest.fn(),
      },
    } as any;

    // Mock scoring result
    mockScoringResult = {
      score: 0.85,
      scoring_function_results: [
        {
          scoring_function_name: 'test-scorer',
          score: 0.85,
          output: 'Test passed',
          state: 'complete',
        },
      ],
    };

    // Mock scenario run data
    mockScenarioRunData = {
      id: 'run-123',
      devbox_id: 'devbox-456',
      scenario_id: 'scenario-789',
      state: 'running',
      metadata: {},
    };

    // Mock devbox data
    mockDevboxData = {
      id: 'devbox-456',
      status: 'running',
      capabilities: [],
      create_time_ms: Date.now(),
      end_time_ms: null,
      launch_parameters: {},
      metadata: {},
      state_transitions: [],
    };
  });

  describe('fromId', () => {
    it('should create a ScenarioRun instance from ID', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');

      expect(run).toBeInstanceOf(ScenarioRun);
      expect(run.id).toBe('run-123');
      expect(run.devboxId).toBe('devbox-456');
    });
  });

  describe('properties', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should expose devbox property with lazy loading', () => {
      const devbox = run.devbox;

      expect(devbox).toBeInstanceOf(Devbox);
      expect(devbox.id).toBe('devbox-456');
    });

    it('should cache devbox instance', () => {
      const devbox1 = run.devbox;
      const devbox2 = run.devbox;

      expect(devbox1).toBe(devbox2);
    });
  });

  describe('getInfo', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should retrieve scenario run info from API', async () => {
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const info = await run.getInfo();

      expect(mockClient.scenarios.runs.retrieve).toHaveBeenCalledWith('run-123', undefined);
      expect(info).toEqual(mockScenarioRunData);
    });

    it('should pass options to the API client', async () => {
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);
      const options = { timeout: 30000 };

      await run.getInfo(options);

      expect(mockClient.scenarios.runs.retrieve).toHaveBeenCalledWith('run-123', options);
    });
  });

  describe('awaitEnvReady', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should wait for devbox to be running and return run info', async () => {
      mockClient.devboxes.awaitRunning.mockResolvedValue(mockDevboxData);
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const result = await run.awaitEnvReady();

      expect(mockClient.devboxes.awaitRunning).toHaveBeenCalledWith('devbox-456', undefined);
      expect(mockClient.scenarios.runs.retrieve).toHaveBeenCalledWith('run-123', undefined);
      expect(result).toEqual(mockScenarioRunData);
    });

    it('should pass polling options to awaitRunning', async () => {
      mockClient.devboxes.awaitRunning.mockResolvedValue(mockDevboxData);
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);
      const options = { polling: { maxAttempts: 10 } };

      await run.awaitEnvReady(options);

      expect(mockClient.devboxes.awaitRunning).toHaveBeenCalledWith('devbox-456', options);
    });
  });

  describe('score', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should submit run for scoring', async () => {
      const scoringRun = { ...mockScenarioRunData, state: 'scoring' as const };
      mockClient.scenarios.runs.score.mockResolvedValue(scoringRun);

      const result = await run.score();

      expect(mockClient.scenarios.runs.score).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('scoring');
    });
  });

  describe('awaitScored', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should wait for scoring to complete', async () => {
      const scoredRun = {
        ...mockScenarioRunData,
        state: 'scored' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.awaitScored.mockResolvedValue(scoredRun);

      const result = await run.awaitScored();

      expect(mockClient.scenarios.runs.awaitScored).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('scored');
      expect(result.scoring_contract_result).toEqual(mockScoringResult);
    });
  });

  describe('scoreAndAwait', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should score and wait for completion', async () => {
      const scoredRun = {
        ...mockScenarioRunData,
        state: 'scored' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.scoreAndAwait.mockResolvedValue(scoredRun);

      const result = await run.scoreAndAwait();

      expect(mockClient.scenarios.runs.scoreAndAwait).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('scored');
    });
  });

  describe('scoreAndComplete', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should score, wait, and complete the run', async () => {
      const completedRun = {
        ...mockScenarioRunData,
        state: 'completed' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.scoreAndComplete.mockResolvedValue(completedRun);

      const result = await run.scoreAndComplete();

      expect(mockClient.scenarios.runs.scoreAndComplete).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('completed');
    });

    it('should pass polling options', async () => {
      const completedRun = {
        ...mockScenarioRunData,
        state: 'completed' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.scoreAndComplete.mockResolvedValue(completedRun);
      const options = { polling: { maxAttempts: 100 } };

      await run.scoreAndComplete(options);

      expect(mockClient.scenarios.runs.scoreAndComplete).toHaveBeenCalledWith('run-123', options);
    });
  });

  describe('complete', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should complete the run', async () => {
      const completedRun = { ...mockScenarioRunData, state: 'completed' as const };
      mockClient.scenarios.runs.complete.mockResolvedValue(completedRun);

      const result = await run.complete();

      expect(mockClient.scenarios.runs.complete).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('completed');
    });
  });

  describe('cancel', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should cancel the run', async () => {
      const canceledRun = { ...mockScenarioRunData, state: 'canceled' as const };
      mockClient.scenarios.runs.cancel.mockResolvedValue(canceledRun);

      const result = await run.cancel();

      expect(mockClient.scenarios.runs.cancel).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('canceled');
    });
  });

  describe('downloadLogs', () => {
    let run: ScenarioRun;
    const fs = require('fs');

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
      jest.clearAllMocks();
    });

    it('should validate parent directory and download logs to file', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      mockClient.scenarios.runs.downloadLogs.mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      });

      await run.downloadLogs('/some/path/logs.zip');

      expect(fs.promises.access).toHaveBeenCalledWith('/some/path', fs.constants.W_OK);
      expect(mockClient.scenarios.runs.downloadLogs).toHaveBeenCalledWith('run-123', undefined);
      expect(fs.promises.writeFile).toHaveBeenCalledWith('/some/path/logs.zip', expect.any(Buffer));
    });

    it('should throw error when parent directory is not writable', async () => {
      fs.promises.access.mockRejectedValueOnce(new Error('ENOENT'));

      await expect(run.downloadLogs('/invalid/path/logs.zip')).rejects.toThrow(
        "Cannot write to /invalid/path/logs.zip: parent directory '/invalid/path' does not exist or is not writable",
      );

      expect(mockClient.scenarios.runs.downloadLogs).not.toHaveBeenCalled();
    });
  });

  describe('getScore', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should return scoring result when available', async () => {
      const scoredRun = {
        ...mockScenarioRunData,
        state: 'scored' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.retrieve.mockResolvedValue(scoredRun);

      const score = await run.getScore();

      expect(score).toEqual(mockScoringResult);
      expect(score?.score).toBe(0.85);
    });

    it('should return null when not yet scored', async () => {
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const score = await run.getScore();

      expect(score).toBeNull();
    });

    it('should return null when scoring_contract_result is undefined', async () => {
      const runWithoutScore = { ...mockScenarioRunData };
      delete (runWithoutScore as any).scoring_contract_result;
      mockClient.scenarios.runs.retrieve.mockResolvedValue(runWithoutScore);

      const score = await run.getScore();

      expect(score).toBeNull();
    });
  });

  describe('error handling', () => {
    let run: ScenarioRun;

    beforeEach(() => {
      run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-456');
    });

    it('should propagate errors from getInfo', async () => {
      const error = new Error('API error');
      mockClient.scenarios.runs.retrieve.mockRejectedValue(error);

      await expect(run.getInfo()).rejects.toThrow('API error');
    });

    it('should propagate errors from score', async () => {
      const error = new Error('Scoring failed');
      mockClient.scenarios.runs.score.mockRejectedValue(error);

      await expect(run.score()).rejects.toThrow('Scoring failed');
    });

    it('should propagate errors from awaitEnvReady', async () => {
      const error = new Error('Devbox startup failed');
      mockClient.devboxes.awaitRunning.mockRejectedValue(error);

      await expect(run.awaitEnvReady()).rejects.toThrow('Devbox startup failed');
    });
  });
});
