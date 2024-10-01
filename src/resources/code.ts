// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import * as CodeAPI from './code';

export class Code extends APIResource {}

export interface CodeMountParameters {
  /**
   * The authentication token necessary to pull repo.
   */
  token?: string;

  /**
   * Installation command to install and setup repository.
   */
  install_command?: string;

  /**
   * The name of the repo to mount. By default, code will be mounted at
   * /home/user/{repo_name}s.
   */
  repo_name?: string;

  /**
   * The owner of the repo.
   */
  repo_owner?: string;
}

export namespace Code {
  export import CodeMountParameters = CodeAPI.CodeMountParameters;
}
