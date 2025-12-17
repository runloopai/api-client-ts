import { ScenarioRun } from '../../src/sdk/scenario-run';
import { Devbox } from '../../src/sdk/devbox';
import type { ScenarioRunView, ScoringContractResultView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('ScenarioRun', () => {
  let mockClient: any;
  let mockScenarioRunData: ScenarioRunView;
  let mockScoringResult: ScoringContractResultView;

  beforeEach(() => {
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
        awaitRunning: jest.fn(),
        retrieve: jest.fn(),
      },
    } as any;

    mockScoringResult = {
      score: 0.85,
      scoring_function_results: [
        {
          scoring_function_name: 'test-scorer',
          score: 0.85,
          output: 'Tests passed',
          state: 'complete',
        },
      ],
    };

    mockScenarioRunData = {
      id: 'run-123',
      scenario_id: 'scn-456',
      devbox_id: 'devbox-789',
      state: 'running',
      metadata: {},
    };
  });

  describe('fromRunView', () => {
    it('should create a ScenarioRun instance from run view', () => {
      const run = ScenarioRun.fromRunView(mockClient, mockScenarioRunData);

      expect(run).toBeInstanceOf(ScenarioRun);
      expect(run.id).toBe('run-123');
      expect(run.devboxId).toBe('devbox-789');
    });
  });

  describe('fromId', () => {
    it('should create a ScenarioRun instance by IDs', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');

      expect(run).toBeInstanceOf(ScenarioRun);
      expect(run.id).toBe('run-123');
      expect(run.devboxId).toBe('devbox-789');
    });
  });

  describe('properties', () => {
    it('should return correct id', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      expect(run.id).toBe('run-123');
    });

    it('should return correct devboxId', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      expect(run.devboxId).toBe('devbox-789');
    });

    it('should return a Devbox instance', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const devbox = run.devbox;

      expect(devbox).toBeInstanceOf(Devbox);
      expect(devbox.id).toBe('devbox-789');
    });

    it('should return the same Devbox instance on subsequent accesses', () => {
      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const devbox1 = run.devbox;
      const devbox2 = run.devbox;

      expect(devbox1).toBe(devbox2);
    });
  });

  describe('getInfo', () => {
    it('should retrieve scenario run information', async () => {
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const info = await run.getInfo();

      expect(mockClient.scenarios.runs.retrieve).toHaveBeenCalledWith('run-123', undefined);
      expect(info).toEqual(mockScenarioRunData);
    });
  });

  describe('awaitEnvReady', () => {
    it('should wait for devbox to be running', async () => {
      mockClient.devboxes.awaitRunning.mockResolvedValue({ id: 'devbox-789', status: 'running' });
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.awaitEnvReady();

      expect(mockClient.devboxes.awaitRunning).toHaveBeenCalledWith('devbox-789', undefined);
      expect(mockClient.scenarios.runs.retrieve).toHaveBeenCalledWith('run-123', undefined);
      expect(result).toEqual(mockScenarioRunData);
    });
  });

  describe('score', () => {
    it('should submit the run for scoring', async () => {
      const scoringRun = { ...mockScenarioRunData, state: 'scoring' as const };
      mockClient.scenarios.runs.score.mockResolvedValue(scoringRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.score();

      expect(mockClient.scenarios.runs.score).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('scoring');
    });
  });

  describe('awaitScored', () => {
    it('should wait for scoring to complete', async () => {
      const scoredRun = { ...mockScenarioRunData, state: 'scored' as const };
      mockClient.scenarios.runs.awaitScored.mockResolvedValue(scoredRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.awaitScored();

      expect(mockClient.scenarios.runs.awaitScored).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('scored');
    });
  });

  describe('scoreAndAwait', () => {
    it('should score and wait for completion', async () => {
      const scoredRun = {
        ...mockScenarioRunData,
        state: 'scored' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.scoreAndAwait.mockResolvedValue(scoredRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.scoreAndAwait();

      expect(mockClient.scenarios.runs.scoreAndAwait).toHaveBeenCalledWith('run-123', undefined);
      expect(result.scoring_contract_result?.score).toBe(0.85);
    });
  });

  describe('scoreAndComplete', () => {
    it('should score, wait, and complete the run', async () => {
      const completedRun = {
        ...mockScenarioRunData,
        state: 'completed' as const,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.scoreAndComplete.mockResolvedValue(completedRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.scoreAndComplete();

      expect(mockClient.scenarios.runs.scoreAndComplete).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('completed');
    });
  });

  describe('complete', () => {
    it('should complete the run', async () => {
      const completedRun = { ...mockScenarioRunData, state: 'completed' as const };
      mockClient.scenarios.runs.complete.mockResolvedValue(completedRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.complete();

      expect(mockClient.scenarios.runs.complete).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('completed');
    });
  });

  describe('cancel', () => {
    it('should cancel the run', async () => {
      const canceledRun = { ...mockScenarioRunData, state: 'canceled' as const };
      mockClient.scenarios.runs.cancel.mockResolvedValue(canceledRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.cancel();

      expect(mockClient.scenarios.runs.cancel).toHaveBeenCalledWith('run-123', undefined);
      expect(result.state).toBe('canceled');
    });
  });

  describe('downloadLogs', () => {
    it('should download logs', async () => {
      const mockResponse = { blob: jest.fn() };
      mockClient.scenarios.runs.downloadLogs.mockResolvedValue(mockResponse);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const result = await run.downloadLogs();

      expect(mockClient.scenarios.runs.downloadLogs).toHaveBeenCalledWith('run-123', undefined);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getScore', () => {
    it('should return scoring result if scored', async () => {
      const scoredRun = {
        ...mockScenarioRunData,
        scoring_contract_result: mockScoringResult,
      };
      mockClient.scenarios.runs.retrieve.mockResolvedValue(scoredRun);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const score = await run.getScore();

      expect(score).toEqual(mockScoringResult);
      expect(score?.score).toBe(0.85);
    });

    it('should return null if not yet scored', async () => {
      mockClient.scenarios.runs.retrieve.mockResolvedValue(mockScenarioRunData);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');
      const score = await run.getScore();

      expect(score).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle API errors on score', async () => {
      const error = new Error('Failed to score');
      mockClient.scenarios.runs.score.mockRejectedValue(error);

      const run = ScenarioRun.fromId(mockClient, 'run-123', 'devbox-789');

      await expect(run.score()).rejects.toThrow('Failed to score');
    });
  });
});

