import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  NetworkPolicyView,
  NetworkPolicyCreateParams,
  NetworkPolicyUpdateParams,
} from '../resources/network-policies';

/**
 * Object-oriented interface for working with Network Policies.
 *
 * @category Network Policy
 *
 * @remarks
 * ## Overview
 *
 * The `NetworkPolicy` class provides a high-level, object-oriented API for managing network policies.
 * Network policies define egress network access rules for devboxes and can be applied to blueprints,
 * devboxes, and snapshot resumes.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const policy = await runloop.networkPolicy.create({
 *   name: 'my-policy',
 *   allow_all: false,
 *   allowed_hostnames: ['github.com', '*.npmjs.org'],
 * });
 *
 * const info = await policy.getInfo();
 * console.log(`Policy: ${info.name}`);
 * ```
 */
export class NetworkPolicy {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new NetworkPolicy with the specified egress rules.
   * This is the recommended way to create a network policy.
   *
   * See the {@link NetworkPolicyOps.create} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const policy = await runloop.networkPolicy.create({
   *   name: 'restricted-policy',
   *   allow_all: false,
   *   allowed_hostnames: ['github.com', 'api.openai.com'],
   *   allow_devbox_to_devbox: true,
   *   description: 'Policy for restricted network access',
   * });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {NetworkPolicyCreateParams} params - Parameters for creating the network policy
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<NetworkPolicy>} A {@link NetworkPolicy} instance
   */
  static async create(
    client: Runloop,
    params: NetworkPolicyCreateParams,
    options?: Core.RequestOptions,
  ): Promise<NetworkPolicy> {
    const policyData = await client.networkPolicies.create(params, options);
    return new NetworkPolicy(client, policyData.id);
  }

  /**
   * Create a NetworkPolicy instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link NetworkPolicyOps.fromId} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const policy = runloop.networkPolicy.fromId('npol_1234567890');
   * const info = await policy.getInfo();
   * console.log(`Policy name: ${info.name}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The network policy ID
   * @returns {NetworkPolicy} A {@link NetworkPolicy} instance
   */
  static fromId(client: Runloop, id: string): NetworkPolicy {
    return new NetworkPolicy(client, id);
  }

  /**
   * Get the network policy ID.
   * @returns {string} The network policy ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete network policy data from the API.
   *
   * @example
   * ```typescript
   * const info = await policy.getInfo();
   * console.log(`Policy name: ${info.name}, allow_all: ${info.egress.allow_all}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<NetworkPolicyView>} The network policy data
   */
  async getInfo(options?: Core.RequestOptions): Promise<NetworkPolicyView> {
    return this.client.networkPolicies.retrieve(this._id, options);
  }

  /**
   * Update an existing NetworkPolicy. All fields are optional.
   *
   * @example
   * ```typescript
   * const updated = await policy.update({
   *   name: 'updated-policy-name',
   *   allow_all: true,
   *   description: 'Updated description',
   * });
   * ```
   *
   * @param {NetworkPolicyUpdateParams} params - Parameters for updating the network policy
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<NetworkPolicyView>} The updated network policy data
   */
  async update(params: NetworkPolicyUpdateParams, options?: Core.RequestOptions): Promise<NetworkPolicyView> {
    return this.client.networkPolicies.update(this._id, params, options);
  }

  /**
   * Delete this network policy. This action is irreversible.
   *
   * @private
   * See the {@link NetworkPolicyOps.delete} method for calling this
   *
   * @example
   * ```typescript
   * await policy.delete();
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<NetworkPolicyView>} The deleted network policy data
   */
  async delete(options?: Core.RequestOptions): Promise<NetworkPolicyView> {
    return this.client.networkPolicies.delete(this._id, {}, options);
  }
}
