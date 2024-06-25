// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';
import * as Shared from '../shared';

export class Logs extends APIResource {
  /**
   * Get list of all logs from a project.
   */
  list(id: string, options?: Core.RequestOptions): Core.APIPromise<Shared.ProjectLogsView> {
    return this._client.get(`/v1/projects/${id}/logs`, options);
  }
}
