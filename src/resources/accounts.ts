// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import * as Core from '../core';

export class Accounts extends APIResource {
  /**
   * Returns the account the API key or session is authenticated against, including
   * id, name, tier, and billing summary.
   */
  me(options?: Core.RequestOptions): Core.APIPromise<AccountView> {
    return this._client.get('/v1/accounts/me', options);
  }
}

/**
 * Account information.
 */
export interface AccountView {
  /**
   * The account ID.
   */
  id: string;

  /**
   * The account status.
   */
  account_status:
    | 'ACCOUNT_STATUS_INVALID'
    | 'ACCOUNT_STATUS_ONBOARDING'
    | 'ACCOUNT_STATUS_ENABLED'
    | 'ACCOUNT_STATUS_DISABLED_BY_ADMIN'
    | 'ACCOUNT_STATUS_DISABLED_QUOTA_REACHED'
    | 'ACCOUNT_STATUS_TRIAL_CANCELLED'
    | 'ACCOUNT_STATUS_STRIPE_PENDING_RESOURCES'
    | 'UNRECOGNIZED';

  /**
   * The account billing information.
   */
  billing: AccountView.Billing;

  /**
   * The account creation timestamp.
   */
  created_at: string;

  /**
   * The account name.
   */
  name: string;

  /**
   * The account tier.
   */
  tier:
    | 'ACCOUNT_TIER_INVALID'
    | 'ACCOUNT_TIER_BASIC'
    | 'ACCOUNT_TIER_PRO'
    | 'ACCOUNT_TIER_ENTERPRISE'
    | 'ACCOUNT_TIER_TRIAL'
    | 'UNRECOGNIZED';

  /**
   * Deprecated: use billing.account_billing_type.
   */
  account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'NONE' | 'UNRECOGNIZED';

  /**
   * Deprecated: use billing.stripe.active_subscription.
   */
  active_subscription?: string | null;

  /**
   * Deprecated: use billing.stripe.customer_id.
   */
  stripe_customer_id?: string | null;
}

export namespace AccountView {
  /**
   * The account billing information.
   */
  export interface Billing {
    /**
     * The account billing type.
     */
    account_billing_type: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'NONE' | 'UNRECOGNIZED';

    /**
     * Stripe billing information.
     */
    stripe?: Billing.Stripe | null;

    /**
     * Deprecated: use stripe.customer_id.
     */
    stripe_customer_id?: string | null;
  }

  export namespace Billing {
    /**
     * Stripe billing information.
     */
    export interface Stripe {
      /**
       * The active Stripe subscription ID.
       */
      active_subscription?: string | null;

      /**
       * The Stripe customer ID.
       */
      customer_id?: string | null;
    }
  }
}

export declare namespace Accounts {
  export { type AccountView as AccountView };
}
