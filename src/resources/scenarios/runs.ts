// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as ScenariosAPI from './scenarios';

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
  ): Core.APIPromise<ScenariosAPI.ScenarioRunListView>;
  list(options?: Core.RequestOptions): Core.APIPromise<ScenariosAPI.ScenarioRunListView>;
  list(
    query: RunListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScenariosAPI.ScenarioRunListView> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/scenarios/runs', { query, ...options });
  }

  /**
   * Complete a currently running ScenarioRun.
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

export interface RunListParams {
  /**
   * The limit of items to return. Default is 20.
   */
  limit?: number;

  /**
   * Filter runs associated to Scenario given ID
   */
  scenario_id?: string;

  /**
   * Load the next page of data starting after the item with the given ID.
   */
  starting_after?: string;
}

export declare namespace Runs {
  export { type RunListParams as RunListParams };
}
