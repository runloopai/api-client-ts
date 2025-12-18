import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  BenchmarkView,
  BenchmarkUpdateParams,
  BenchmarkStartRunParams,
  BenchmarkRunView,
} from '../resources/benchmarks/benchmarks';
import { BenchmarkRun } from './benchmark-run';

/**
 * Object-oriented interface for working with Benchmarks.
 *
 * @category Benchmark
 *
 * @remarks
 * A `Benchmark` is a grouped set of Scenarios that can be executed as a BenchmarkRun.
 * Use {@link BenchmarkOps} (via `runloop.benchmark`) to create and retrieve benchmarks.
 */
export class Benchmark {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, benchmarkId: string) {
    this.client = client;
    this._id = benchmarkId;
  }

  /**
   * Create a Benchmark instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The benchmark ID
   * @returns {Benchmark} A Benchmark instance
   */
  static fromId(client: Runloop, id: string): Benchmark {
    return new Benchmark(client, id);
  }

  /**
   * Get the benchmark ID.
   * @returns {string} The benchmark ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Retrieve current benchmark details from the API.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkView>} Current benchmark info
   */
  async getInfo(options?: Core.RequestOptions): Promise<BenchmarkView> {
    return this.client.benchmarks.retrieve(this._id, options);
  }

  /**
   * Update the benchmark.
   *
   * @param {BenchmarkUpdateParams} params - Update parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkView>} Updated benchmark info
   */
  async update(params: BenchmarkUpdateParams, options?: Core.RequestOptions): Promise<BenchmarkView> {
    return this.client.benchmarks.update(this._id, params, options);
  }

  /**
   * Start a new benchmark run.
   *
   * @param {Omit<BenchmarkStartRunParams, 'benchmark_id'>} [params] - Run parameters (benchmark_id is automatically set)
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<BenchmarkRun>} BenchmarkRun instance for managing the run
   */
  async startRun(
    params?: Omit<BenchmarkStartRunParams, 'benchmark_id'>,
    options?: Core.RequestOptions,
  ): Promise<BenchmarkRun> {
    const runView: BenchmarkRunView = await this.client.benchmarks.startRun(
      {
        ...params,
        benchmark_id: this._id,
      },
      options,
    );
    return BenchmarkRun.fromRunView(this.client, runView);
  }
}
