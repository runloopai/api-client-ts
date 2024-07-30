// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import * as AccountAPI from './account';

export class Account extends APIResource {}

export type ResourceSize = 'MINI' | 'SMALL' | 'MEDIUM' | 'LARGE';

export namespace Account {
  export import ResourceSize = AccountAPI.ResourceSize;
}
