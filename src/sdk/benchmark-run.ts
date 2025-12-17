import { Runloop } from '../index';
import type * as Core from '../core';
import type { BenchmarkRunView } from '../resources/benchmarks/benchmarks';
import type { RunListScenarioRunsParams } from '../resources/benchmarks/runs';
import { ScenarioRun } from './scenario-run';

/**
 * Object-oriented interface for working with Benchmark Runs.
 *
 * @category Benchmark
 *
 * @remarks
 * ## Overview
 *
 * The `BenchmarkRun` class provides a high-level API for managing benchmark runs.
 * A benchmark run represents an execution of a benchmark across multiple scenarios,
 * allowing you to evaluate agent performance at scale.
 *
 * ## Usage
 *
 * Obtain instances via benchmark operations or API calls:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 *
 * // Start a benchmark run
 * const runView = await runloop.api.benchmarks.startRun({ benchmark_id: 'bench-xxx' });
 * const run = BenchmarkRun.fromRunView(runloop.api, runView);
 *
 * // Get info and manage the run
 * const info = await run.getInfo();
 * console.log(`Run state: ${info.state}`);
 *
 * // List scenario runs
 * const scenarioRuns = await run.listScenarioRuns();
 * for (const scenarioRun of scenarioRuns) {
 *   console.log(`Scenario run: ${scenarioRun.id}`);
 * }
 *
 * // Complete the benchmark run
 * await run.complete();
 * ```
 */
export class BenchmarkRun {
  private client: Runloop;
  private _id: string;
  private _benchmarkId: string;

  private constructor(client: Runloop, runId: string, benchmarkId: string) {
    this.client = client;
    this._id = runId;
    this._benchmarkId = benchmarkId;
  }

  /**
   * Create a BenchmarkRun instance from a BenchmarkRunView.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {BenchmarkRunView} runView - The benchmark run view from the API
   * @returns {BenchmarkRun} A BenchmarkRun instance
   */
  static fromRunView(client: Runloop, runView: BenchmarkRunView): BenchmarkRun {
    return new BenchmarkRun(client, runView.id, runView.benchmark_id);
  }

  /**
   * Create a BenchmarkRun instance by ID and benchmark ID.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} runId - The benchmark run ID
   * @param {string} benchmarkId - The parent benchmark ID
   * @returns {BenchmarkRun} A BenchmarkRun instance
   */
  static fromId(client: Runloop, runId: string, benchmarkId: string): BenchmarkRun {
    return new BenchmarkRun(client, runId, benchmarkId);
  }

  /**
   * Get the benchmark run ID.
   * @returns {string} The benchmark run ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the parent benchmark ID.
   * @returns {string} The parent benchmark ID
   */
  get benchmarkId(): string {
    return this._benchmarkId;
  }

  /**
   * Retrieve current benchmark run status and metadata.
   *
   * @example
   * ```typescript
   * const info = await run.getInfo();
   * console.log(`Run state: ${info.state}`);
   * console.log(`Started: ${info.start_time_ms}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkRunView>} Current benchmark run state info
   */
  async getInfo(options?: Core.RequestOptions): Promise<BenchmarkRunView> {
    return this.client.benchmarks.runs.retrieve(this._id, options);
  }

  /**
   * Cancel the benchmark run.
   *
   * Stops all running scenario runs and marks the benchmark run as canceled.
   *
   * @example
   * ```typescript
   * await run.cancel();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkRunView>} Updated benchmark run state
   */
  async cancel(options?: Core.RequestOptions): Promise<BenchmarkRunView> {
    return this.client.benchmarks.runs.cancel(this._id, options);
  }

  /**
   * Complete the benchmark run.
   *
   * Marks the run as completed. Call this after all scenarios have finished.
   *
   * @example
   * ```typescript
   * await run.complete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkRunView>} Completed benchmark run state
   */
  async complete(options?: Core.RequestOptions): Promise<BenchmarkRunView> {
    return this.client.benchmarks.runs.complete(this._id, options);
  }

  /**
   * List all scenario runs for this benchmark run.
   *
   * @example
   * ```typescript
   * const scenarioRuns = await run.listScenarioRuns();
   * for (const scenarioRun of scenarioRuns) {
   *   const score = await scenarioRun.getScore();
   *   console.log(`${scenarioRun.id}: ${score?.score ?? 'not scored'}`);
   * }
   *
   * // Filter by state
   * const completedRuns = await run.listScenarioRuns({ state: 'completed' });
   * ```
   *
   * @param {RunListScenarioRunsParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ScenarioRun[]>} List of scenario run objects
   */
  async listScenarioRuns(
    params?: RunListScenarioRunsParams,
    options?: Core.RequestOptions,
  ): Promise<ScenarioRun[]> {
    const page = await this.client.benchmarks.runs.listScenarioRuns(this._id, params, options);
    const runs: ScenarioRun[] = [];

    for await (const runView of page) {
      runs.push(ScenarioRun.fromRunView(this.client, runView));
    }

    return runs;
  }
}

