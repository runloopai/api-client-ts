// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';

export class Code extends APIResource {}

export interface CodeMountParameters {
  /**
   * The name of the repo to mount. By default, code will be mounted at
   * /home/user/{repo_name}s.
   */
  repo_name: string;

  /**
   * The owner of the repo.
   */
  repo_owner: string;

  /**
   * The authentication token necessary to pull repo.
   */
  token?: string;

  /**
   * Installation command to install and setup repository.
   */
  install_command?: string;
}

export declare namespace Code {
  export { type CodeMountParameters as CodeMountParameters };
}
