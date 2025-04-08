// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import { isRequestOptions } from '../../core';
import * as Core from '../../core';
import * as ScenariosAPI from './scenarios';
import { ScenarioScorersCursorIDPage, type ScenarioScorersCursorIDPageParams } from '../../pagination';

export class Scorers extends APIResource {
  /**
   * Create a custom scenario scorer.
   */
  create(body: ScorerCreateParams, options?: Core.RequestOptions): Core.APIPromise<ScorerCreateResponse> {
    return this._client.post('/v1/scenarios/scorers', { body, ...options });
  }

  /**
   * Retrieve Scenario Scorer.
   */
  retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<ScorerRetrieveResponse> {
    return this._client.get(`/v1/scenarios/scorers/${id}`, options);
  }

  /**
   * Update a scenario scorer.
   */
  update(
    id: string,
    body: ScorerUpdateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScorerUpdateResponse> {
    return this._client.post(`/v1/scenarios/scorers/${id}`, { body, ...options });
  }

  /**
   * List all Scenario Scorers matching filter.
   */
  list(
    query?: ScorerListParams,
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScorerListResponsesScenarioScorersCursorIDPage, ScorerListResponse>;
  list(
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScorerListResponsesScenarioScorersCursorIDPage, ScorerListResponse>;
  list(
    query: ScorerListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.PagePromise<ScorerListResponsesScenarioScorersCursorIDPage, ScorerListResponse> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList('/v1/scenarios/scorers', ScorerListResponsesScenarioScorersCursorIDPage, {
      query,
      ...options,
    });
  }

  /**
   * Validate a scenario scorer.
   */
  validate(
    id: string,
    body: ScorerValidateParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<ScorerValidateResponse> {
    return this._client.post(`/v1/scenarios/scorers/${id}/validate`, { body, ...options });
  }
}

export class ScorerListResponsesScenarioScorersCursorIDPage extends ScenarioScorersCursorIDPage<ScorerListResponse> {}

/**
 * A ScenarioScorerView represents a custom scoring function for a Scenario.
 */
export interface ScorerCreateResponse {
  /**
   * ID for the scenario scorer.
   */
  id: string;

  /**
   * Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.
   */
  bash_script: string;

  /**
   * Name of the type of scenario scorer.
   */
  type: string;
}

/**
 * A ScenarioScorerView represents a custom scoring function for a Scenario.
 */
export interface ScorerRetrieveResponse {
  /**
   * ID for the scenario scorer.
   */
  id: string;

  /**
   * Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.
   */
  bash_script: string;

  /**
   * Name of the type of scenario scorer.
   */
  type: string;
}

/**
 * A ScenarioScorerView represents a custom scoring function for a Scenario.
 */
export interface ScorerUpdateResponse {
  /**
   * ID for the scenario scorer.
   */
  id: string;

  /**
   * Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.
   */
  bash_script: string;

  /**
   * Name of the type of scenario scorer.
   */
  type: string;
}

/**
 * A ScenarioScorerView represents a custom scoring function for a Scenario.
 */
export interface ScorerListResponse {
  /**
   * ID for the scenario scorer.
   */
  id: string;

  /**
   * Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.
   */
  bash_script: string;

  /**
   * Name of the type of scenario scorer.
   */
  type: string;
}

export interface ScorerValidateResponse {
  /**
   * Name of the custom scorer.
   */
  name: string;

  /**
   * Json context that gets passed to the custom scorer
   */
  scoring_context: unknown;

  /**
   * Result of the scoring function.
   */
  scoring_result: ScenariosAPI.ScoringFunctionResultView;

  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenariosAPI.ScenarioEnvironment;
}

export interface ScorerCreateParams {
  /**
   * Bash script for the custom scorer taking context as a json object
   * $RL_SCORER_CONTEXT.
   */
  bash_script: string;

  /**
   * Name of the type of custom scorer.
   */
  type: string;
}

export interface ScorerUpdateParams {
  /**
   * Bash script for the custom scorer taking context as a json object
   * $RL_SCORER_CONTEXT.
   */
  bash_script: string;

  /**
   * Name of the type of custom scorer.
   */
  type: string;
}

export interface ScorerListParams extends ScenarioScorersCursorIDPageParams {}

export interface ScorerValidateParams {
  /**
   * Json context that gets passed to the custom scorer
   */
  scoring_context: unknown;

  /**
   * The Environment in which the Scenario will run.
   */
  environment_parameters?: ScenariosAPI.ScenarioEnvironment;
}

Scorers.ScorerListResponsesScenarioScorersCursorIDPage = ScorerListResponsesScenarioScorersCursorIDPage;

export declare namespace Scorers {
  export {
    type ScorerCreateResponse as ScorerCreateResponse,
    type ScorerRetrieveResponse as ScorerRetrieveResponse,
    type ScorerUpdateResponse as ScorerUpdateResponse,
    type ScorerListResponse as ScorerListResponse,
    type ScorerValidateResponse as ScorerValidateResponse,
    ScorerListResponsesScenarioScorersCursorIDPage as ScorerListResponsesScenarioScorersCursorIDPage,
    type ScorerCreateParams as ScorerCreateParams,
    type ScorerUpdateParams as ScorerUpdateParams,
    type ScorerListParams as ScorerListParams,
    type ScorerValidateParams as ScorerValidateParams,
  };
}
