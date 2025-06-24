// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as ScenariosAPI from './scenarios';
import { ScenarioRunViewsBenchmarkRunsCursorIDPage } from './scenarios';
import { type BenchmarkRunsCursorIDPageParams } from '../../pagination';
import { PollingOptions, poll } from '@runloop/api-client/lib/polling';
import { RunloopError } from '../..';
import { type Response } from '../../_shims/index';

export class Runs extends APIResource {
  /**
   * Get a ScenarioRun given ID.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.get(`/v1/scenarios/runs/${id}`, options);
  }

  /**
   * List all ScenarioRuns matching filter.
   */
  list(
    query?: RunListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView>;
  list(
    query: RunListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScenarioRunViewsBenchmarkRunsCursorIDPage, ScenariosAPI.ScenarioRunView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/scenarios/runs', ScenarioRunViewsBenchmarkRunsCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Cancel a currently running Scenario run. This will shutdown the underlying
   * Devbox resource.
   */
  cancel(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.post(`/v1/scenarios/runs/${id}/cancel`, options);
  }

  /**
   * Complete a currently running ScenarioRun. Calling complete will shutdown
   * underlying Devbox resource.
   */
  complete(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.post(`/v1/scenarios/runs/${id}/complete`, options);
  }

  /**
   * Download a zip file containing all logs for a Scenario run from the associated
   * devbox.
   */
  downloadLogs(id: string, options?: Core.RequestOptions): Core.APIPromise<Response> {
    return this._client.post(`/v1/scenarios/runs/${id}/download_logs`, {
      ...options,
      headers: { Accept: 'application/zip', ...options?.headers },
      __binaryResponse: true,
    });
  }

  /**
   * Score a currently running ScenarioRun.
   */
  score(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.post(`/v1/scenarios/runs/${id}/score`, options);
  }

  /**
   * Wait for a scenario run to finish scoring.
   * Polls the scenario run status until it reaches a terminal state.
   */
  async awaitScored(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenariosAPI.ScenarioRunView>> },
  ): Promise<ScenariosAPI.ScenarioRunView> {
    const finalResult = await poll(
      () => this.retrieve(id, options),
      () => this.retrieve(id, options),
      {
        ...options?.polling,
        shouldStop: (result) => {
          return result.state !== 'scoring';
        },
      },
    );

    // Check if the run was scored successfully, otherwise throw an error
    if (finalResult.state !== 'scored') {
      throw new RunloopError(
        `Scenario run ${id} failed to transition to scored state. Final state: ${finalResult.state}`,
      );
    }

    return finalResult;
  }

  /**
   * Score a scenario run and wait for it to finish scoring.
   * This is a convenience method that combines score() and awaitScoring().
   */
  async scoreAndAwait(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenariosAPI.ScenarioRunView>> },
  ): Promise<ScenariosAPI.ScenarioRunView> {
    const run = await this.score(id, options);
    return this.awaitScored(run.id, options);
  }

  /**
   * Score a scenario run, wait for scoring to complete, and then complete the run.
   * This is a convenience method that combines scoreAndAwait() and complete().
   */
  async scoreAndComplete(
    id: string,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<ScenariosAPI.ScenarioRunView>> },
  ): Promise<ScenariosAPI.ScenarioRunView> {
    const scoredRun = await this.scoreAndAwait(id, options);
    return this.complete(scoredRun.id, options);
  }
}

export interface RunListParams extends BenchmarkRunsCursorIDPageParams {
  /**
   * Filter runs associated to Scenario given ID
   */
  scenario_id?: string;
}

export declare namespace Runs {
  export { type RunListParams as RunListParams };
}

export { ScenarioRunViewsBenchmarkRunsCursorIDPage };
