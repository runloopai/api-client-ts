// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as Core from '@runloop/api-client/core';
import { APIResource } from '@runloop/api-client/resource';
import { isRequestOptions } from '@runloop/api-client/core';
import * as CodeHandlesAPI from '@runloop/api-client/resources/code-handles';

export class CodeHandles extends APIResource {
  /**
   * Create a new code handle for a given repository. This can be referenced in other
   * parts of the system to refer to a specific version of a repository.
   */
  create(body?: CodeHandleCreateParams, options?: Core.RequestOptions): Core.APIPromise<CodeHandle>;
  create(options?: Core.RequestOptions): Core.APIPromise<CodeHandle>;
  create(
    body: CodeHandleCreateParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<CodeHandle> {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post('/v1/code_handles', { body, ...options });
  }

  /**
   * List the code handles that are available for use.
   */
  list(query?: CodeHandleListParams, options?: Core.RequestOptions): Core.APIPromise<CodeHandleList>;
  list(options?: Core.RequestOptions): Core.APIPromise<CodeHandleList>;
  list(
    query: CodeHandleListParams | Core.RequestOptions = {},
    options?: Core.RequestOptions,
  ): Core.APIPromise<CodeHandleList> {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get('/v1/code_handles', { query, ...options });
  }
}

export interface CodeHandle {
  /**
   * The id of the CodeHandle.
   */
  id?: string;

  /**
   * The git commit hash associated with the code.
   */
  commit_hash?: string;

  /**
   * The owner of the repository.
   */
  owner?: string;

  /**
   * The name of the source repository.
   */
  repo_name?: string;
}

export interface CodeHandleList {
  /**
   * List of code handles matching given query.
   */
  code_handles?: Array<CodeHandle>;
}

export interface CodeHandleCreateParams {
  /**
   * A short lived, scoped authentication token.
   */
  auth_token?: string;

  /**
   * Branch or tag to checkout instead of main.
   */
  branch?: string;

  /**
   * The name of the code repository.
   */
  name?: string;

  /**
   * The account that owns the repository.
   */
  owner?: string;
}

export interface CodeHandleListParams {
  /**
   * Repo owner name.
   */
  owner?: string;

  /**
   * Repo name.
   */
  repo_name?: string;
}

export namespace CodeHandles {
  export import CodeHandle = CodeHandlesAPI.CodeHandle;
  export import CodeHandleList = CodeHandlesAPI.CodeHandleList;
  export import CodeHandleCreateParams = CodeHandlesAPI.CodeHandleCreateParams;
  export import CodeHandleListParams = CodeHandlesAPI.CodeHandleListParams;
}
