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
  account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED';

  /**
   * Deprecated: use billing.stripe.active_subscription.
   */
  active_subscription?: string | null;

  /**
   * Deprecated: use billing.aws.customer_identifier.
   */
  external_billing_account_id?: string | null;

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
    account_billing_type: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED';

    /**
     * AWS Marketplace billing information.
     */
    aws?: Billing.Aws | null;

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
     * AWS Marketplace billing information.
     */
    export interface Aws {
      /**
       * The AWS account ID used for Marketplace billing (12-digit).
       */
      customer_identifier?: string | null;

      /**
       * The AWS Marketplace license ARN.
       */
      license_arn?: string | null;

      /**
       * The AWS Marketplace subscription status.
       */
      subscription_status?: string | null;
    }

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
