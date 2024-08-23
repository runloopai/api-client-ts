// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { isRequestOptions } from '../core';
import * as Core from '../core';
import * as DeploymentsAPI from './deployments';

export class Deployments extends APIResource {
  /**
   * Get details of a deployment
   */
  retrieve(deploymentId: string, options?: Core.RequestOptions): Core.APIPromise<DeploymentRetrieveResponse> {
    return this._client.get(`/v1/deployments/${deploymentId}`, options);
  }

  /**
   * Get list of all deployments for the authenticated user.
   */
  get(query?: DeploymentGetParams, options?: Core.RequestOptions): Core.APIPromise<DeploymentGetResponse>;
  get(options?: Core.RequestOptions): Core.APIPromise<DeploymentGetResponse>;
  get(
    query: DeploymentGetParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<DeploymentGetResponse> {
    if (isRequestOptions(query)) {
      return this.get({}, query);
    }
    return this._client.get('/v1/deployments', { query, ...options });
  }

  /**
   * Get list of all logs from a deployment.
   */
  logs(deploymentId: string, options?: Core.RequestOptions): Core.APIPromise<DeploymentLogsResponse> {
    return this._client.get(`/v1/deployments/${deploymentId}/logs`, options);
  }

  /**
   * Creates a deployment for a previously deployed version.
   */
  redeploy(deploymentId: string, options?: Core.RequestOptions): Core.APIPromise<DeploymentRedeployResponse> {
    return this._client.post(`/v1/deployments/${deploymentId}/redeploy`, options);
  }

  /**
   * Tails the logs for the given deployment with SSE streaming
   */
  tail(deploymentId: string, options?: Core.RequestOptions): Core.APIPromise<DeploymentTailResponse> {
    return this._client.get(`/v1/deployments/${deploymentId}/logs/tail`, options);
  }
}

export interface DeploymentRetrieveResponse {
  /**
   * ID of the deployment.
   */
  id?: string;

  /**
   * Associated Commit Message
   */
  deploy_commit_message?: string;

  /**
   * Associated Commit Sha
   */
  deploy_commit_sha?: string;

  /**
   * Associated Commit Time
   */
  deploy_commit_time_ms?: number;

  /**
   * Time the Deploy completed (Unix timestamp milliseconds).
   */
  deploy_end_time_ms?: number;

  /**
   * Time the Deploy was started (Unix timestamp milliseconds).
   */
  deploy_start_time_ms?: number;

  /**
   * The list of deployed functions.
   */
  deployed_functions?: Array<string>;

  /**
   * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
   * secrets_failure | provision_failure | runtime_failure). Only set on
   * deploy_failed.
   */
  failure_code?: string;

  /**
   * Failure message
   */
  failure_message?: string;

  /**
   * Project name associated with the deployment.
   */
  project_name?: string;

  /**
   * ID of original deployment this is redeployment for.
   */
  redeploy_of?: string;

  /**
   * Status of the deploy.
   */
  status?: 'scheduled' | 'skipped' | 'in_progress' | 'failed' | 'deployed';
}

export interface DeploymentGetResponse {
  /**
   * List of projects matching given query.
   */
  deployments?: Array<DeploymentGetResponse.Deployment>;

  has_more?: boolean;

  total_count?: number;
}

export namespace DeploymentGetResponse {
  export interface Deployment {
    /**
     * ID of the deployment.
     */
    id?: string;

    /**
     * Associated Commit Message
     */
    deploy_commit_message?: string;

    /**
     * Associated Commit Sha
     */
    deploy_commit_sha?: string;

    /**
     * Associated Commit Time
     */
    deploy_commit_time_ms?: number;

    /**
     * Time the Deploy completed (Unix timestamp milliseconds).
     */
    deploy_end_time_ms?: number;

    /**
     * Time the Deploy was started (Unix timestamp milliseconds).
     */
    deploy_start_time_ms?: number;

    /**
     * The list of deployed functions.
     */
    deployed_functions?: Array<string>;

    /**
     * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
     * secrets_failure | provision_failure | runtime_failure). Only set on
     * deploy_failed.
     */
    failure_code?: string;

    /**
     * Failure message
     */
    failure_message?: string;

    /**
     * Project name associated with the deployment.
     */
    project_name?: string;

    /**
     * ID of original deployment this is redeployment for.
     */
    redeploy_of?: string;

    /**
     * Status of the deploy.
     */
    status?: 'scheduled' | 'skipped' | 'in_progress' | 'failed' | 'deployed';
  }
}

export interface DeploymentLogsResponse {
  /**
   * ID of the given deployment.
   */
  deployment_id?: string;

  /**
   * List of logs for the given deployment.
   */
  logs?: Array<DeploymentLogsResponse.Log>;
}

export namespace DeploymentLogsResponse {
  export interface Log {
    /**
     * Log line severity level.
     */
    level?: string;

    /**
     * Log line message.
     */
    message?: string;

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms?: number;
  }
}

export interface DeploymentRedeployResponse {
  /**
   * ID of the deployment.
   */
  id?: string;

  /**
   * Associated Commit Message
   */
  deploy_commit_message?: string;

  /**
   * Associated Commit Sha
   */
  deploy_commit_sha?: string;

  /**
   * Associated Commit Time
   */
  deploy_commit_time_ms?: number;

  /**
   * Time the Deploy completed (Unix timestamp milliseconds).
   */
  deploy_end_time_ms?: number;

  /**
   * Time the Deploy was started (Unix timestamp milliseconds).
   */
  deploy_start_time_ms?: number;

  /**
   * The list of deployed functions.
   */
  deployed_functions?: Array<string>;

  /**
   * Failure code (generic_failure | git_clone_failure | not_runloop_repo |
   * secrets_failure | provision_failure | runtime_failure). Only set on
   * deploy_failed.
   */
  failure_code?: string;

  /**
   * Failure message
   */
  failure_message?: string;

  /**
   * Project name associated with the deployment.
   */
  project_name?: string;

  /**
   * ID of original deployment this is redeployment for.
   */
  redeploy_of?: string;

  /**
   * Status of the deploy.
   */
  status?: 'scheduled' | 'skipped' | 'in_progress' | 'failed' | 'deployed';
}

export interface DeploymentTailResponse {
  /**
   * ID of the given deployment.
   */
  deployment_id?: string;

  /**
   * List of logs for the given deployment.
   */
  logs?: Array<DeploymentTailResponse.Log>;
}

export namespace DeploymentTailResponse {
  export interface Log {
    /**
     * Log line severity level.
     */
    level?: string;

    /**
     * Log line message.
     */
    message?: string;

    /**
     * Time of log (Unix timestamp milliseconds).
     */
    timestamp_ms?: number;
  }
}

export interface DeploymentGetParams {
  /**
   * Page Limit
   */
  limit?: string;

  /**
   * Load the next page starting after the given token.
   */
  starting_after?: string;
}

export namespace Deployments {
  export import DeploymentRetrieveResponse = DeploymentsAPI.DeploymentRetrieveResponse;
  export import DeploymentGetResponse = DeploymentsAPI.DeploymentGetResponse;
  export import DeploymentLogsResponse = DeploymentsAPI.DeploymentLogsResponse;
  export import DeploymentRedeployResponse = DeploymentsAPI.DeploymentRedeployResponse;
  export import DeploymentTailResponse = DeploymentsAPI.DeploymentTailResponse;
  export import DeploymentGetParams = DeploymentsAPI.DeploymentGetParams;
}
