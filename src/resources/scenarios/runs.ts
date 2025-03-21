// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as ScenariosAPI from './scenarios';
import { ScenarioRunViewsBenchmarkRunsCursorIDPage } from './scenarios';
import { type BenchmarkRunsCursorIDPageParams } from '../../pagination';

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
   * Complete a currently running ScenarioRun. Calling complete will shutdown
   * underlying Devbox resource.
   */
  complete(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.post(`/v1/scenarios/runs/${id}/complete`, options);
  }

  /**
   * Score a currently running ScenarioRun.
   */
  score(id: string, options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunView> {
    return this._client.post(`/v1/scenarios/runs/${id}/score`, options);
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
