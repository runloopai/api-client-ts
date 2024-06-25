// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export interface FunctionInvocationDetail {
  /**
   * Unique ID of the invocation.
   */
  id?: string;

  error?: string;

  /**
   * Unique name of the function.
   */
  function_name?: string;

  /**
   * Unique name of the project associated with function.
   */
  project_name?: string;

  result?: unknown;

  status?: 'created' | 'running' | 'success' | 'failure' | 'canceled' | 'suspended';
}
