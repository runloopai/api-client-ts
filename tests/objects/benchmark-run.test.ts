import { BenchmarkRun } from '../../src/sdk/benchmark-run';
import { ScenarioRun } from '../../src/sdk/scenario-run';
import type { BenchmarkRunView } from '../../src/resources/benchmarks/benchmarks';
import type { ScenarioRunView } from '../../src/resources/scenarios/scenarios';

// Mock the Runloop client
jest.mock('../../src/index');

describe('BenchmarkRun', () => {
  let mockClient: any;
  let mockBenchmarkRunData: BenchmarkRunView;
  let mockScenarioRunViews: ScenarioRunView[];

  beforeEach(() => {
    mockScenarioRunViews = [
      {
        id: 'run-1',
        scenario_id: 'scn-1',
        devbox_id: 'devbox-1',
        state: 'completed',
        metadata: {},
      },
      {
        id: 'run-2',
        scenario_id: 'scn-2',
        devbox_id: 'devbox-2',
        state: 'running',
        metadata: {},
      },
    ];

    // Create an async iterable for the paginated response
    const createAsyncIterable = (items: ScenarioRunView[]) => ({
      [Symbol.asyncIterator]: async function* () {
        for (const item of items) {
          yield item;
        }
      },
    });

    mockClient = {
      benchmarks: {
        runs: {
          retrieve: jest.fn(),
          cancel: jest.fn(),
          complete: jest.fn(),
          listScenarioRuns: jest.fn().mockResolvedValue(createAsyncIterable(mockScenarioRunViews)),
        },
      },
    } as any;

    mockBenchmarkRunData = {
      id: 'bench-run-123',
      benchmark_id: 'bench-456',
      state: 'running',
      metadata: {},
      start_time_ms: Date.now(),
    };
  });

  describe('fromRunView', () => {
    it('should create a BenchmarkRun instance from run view', () => {
      const run = BenchmarkRun.fromRunView(mockClient, mockBenchmarkRunData);

      expect(run).toBeInstanceOf(BenchmarkRun);
      expect(run.id).toBe('bench-run-123');
      expect(run.benchmarkId).toBe('bench-456');
    });
  });

  describe('fromId', () => {
    it('should create a BenchmarkRun instance by IDs', () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');

      expect(run).toBeInstanceOf(BenchmarkRun);
      expect(run.id).toBe('bench-run-123');
      expect(run.benchmarkId).toBe('bench-456');
    });
  });

  describe('properties', () => {
    it('should return correct id', () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      expect(run.id).toBe('bench-run-123');
    });

    it('should return correct benchmarkId', () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      expect(run.benchmarkId).toBe('bench-456');
    });
  });

  describe('getInfo', () => {
    it('should retrieve benchmark run information', async () => {
      mockClient.benchmarks.runs.retrieve.mockResolvedValue(mockBenchmarkRunData);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const info = await run.getInfo();

      expect(mockClient.benchmarks.runs.retrieve).toHaveBeenCalledWith('bench-run-123', undefined);
      expect(info).toEqual(mockBenchmarkRunData);
      expect(info.state).toBe('running');
    });

    it('should pass options to the API client', async () => {
      mockClient.benchmarks.runs.retrieve.mockResolvedValue(mockBenchmarkRunData);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      await run.getInfo({ timeout: 5000 });

      expect(mockClient.benchmarks.runs.retrieve).toHaveBeenCalledWith('bench-run-123', { timeout: 5000 });
    });
  });

  describe('cancel', () => {
    it('should cancel the benchmark run', async () => {
      const canceledRun = { ...mockBenchmarkRunData, state: 'canceled' as const };
      mockClient.benchmarks.runs.cancel.mockResolvedValue(canceledRun);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const result = await run.cancel();

      expect(mockClient.benchmarks.runs.cancel).toHaveBeenCalledWith('bench-run-123', undefined);
      expect(result.state).toBe('canceled');
    });

    it('should pass options to the API client', async () => {
      mockClient.benchmarks.runs.cancel.mockResolvedValue(mockBenchmarkRunData);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      await run.cancel({ timeout: 10000 });

      expect(mockClient.benchmarks.runs.cancel).toHaveBeenCalledWith('bench-run-123', { timeout: 10000 });
    });
  });

  describe('complete', () => {
    it('should complete the benchmark run', async () => {
      const completedRun = { ...mockBenchmarkRunData, state: 'completed' as const };
      mockClient.benchmarks.runs.complete.mockResolvedValue(completedRun);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const result = await run.complete();

      expect(mockClient.benchmarks.runs.complete).toHaveBeenCalledWith('bench-run-123', undefined);
      expect(result.state).toBe('completed');
    });

    it('should pass options to the API client', async () => {
      mockClient.benchmarks.runs.complete.mockResolvedValue(mockBenchmarkRunData);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      await run.complete({ timeout: 10000 });

      expect(mockClient.benchmarks.runs.complete).toHaveBeenCalledWith('bench-run-123', { timeout: 10000 });
    });
  });

  describe('listScenarioRuns', () => {
    it('should list all scenario runs for the benchmark run', async () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const scenarioRuns = await run.listScenarioRuns();

      expect(mockClient.benchmarks.runs.listScenarioRuns).toHaveBeenCalledWith(
        'bench-run-123',
        undefined,
        undefined,
      );
      expect(scenarioRuns).toHaveLength(2);
      expect(scenarioRuns[0]).toBeInstanceOf(ScenarioRun);
      expect(scenarioRuns[0]?.id).toBe('run-1');
      expect(scenarioRuns[1]?.id).toBe('run-2');
    });

    it('should pass filter params to the API client', async () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      await run.listScenarioRuns({ state: 'completed' });

      expect(mockClient.benchmarks.runs.listScenarioRuns).toHaveBeenCalledWith(
        'bench-run-123',
        { state: 'completed' },
        undefined,
      );
    });

    it('should return empty array when no scenario runs exist', async () => {
      mockClient.benchmarks.runs.listScenarioRuns.mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {},
      });

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const scenarioRuns = await run.listScenarioRuns();

      expect(scenarioRuns).toHaveLength(0);
    });

    it('should correctly map scenario run data to ScenarioRun instances', async () => {
      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');
      const scenarioRuns = await run.listScenarioRuns();

      // Verify the first scenario run
      expect(scenarioRuns[0]?.id).toBe('run-1');
      expect(scenarioRuns[0]?.devboxId).toBe('devbox-1');

      // Verify the second scenario run
      expect(scenarioRuns[1]?.id).toBe('run-2');
      expect(scenarioRuns[1]?.devboxId).toBe('devbox-2');
    });
  });

  describe('error handling', () => {
    it('should handle API errors on getInfo', async () => {
      const error = new Error('Benchmark run not found');
      mockClient.benchmarks.runs.retrieve.mockRejectedValue(error);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-nonexistent', 'bench-456');

      await expect(run.getInfo()).rejects.toThrow('Benchmark run not found');
    });

    it('should handle API errors on cancel', async () => {
      const error = new Error('Cannot cancel benchmark run');
      mockClient.benchmarks.runs.cancel.mockRejectedValue(error);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');

      await expect(run.cancel()).rejects.toThrow('Cannot cancel benchmark run');
    });

    it('should handle API errors on complete', async () => {
      const error = new Error('Cannot complete benchmark run');
      mockClient.benchmarks.runs.complete.mockRejectedValue(error);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');

      await expect(run.complete()).rejects.toThrow('Cannot complete benchmark run');
    });

    it('should handle API errors on listScenarioRuns', async () => {
      const error = new Error('Failed to list scenario runs');
      mockClient.benchmarks.runs.listScenarioRuns.mockRejectedValue(error);

      const run = BenchmarkRun.fromId(mockClient, 'bench-run-123', 'bench-456');

      await expect(run.listScenarioRuns()).rejects.toThrow('Failed to list scenario runs');
    });
  });
});

