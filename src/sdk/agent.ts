import { Runloop } from '../index';
import type * as Core from '../core';
import type { AgentCreateParams, AgentListParams, AgentView } from '../resources/agents';

/**
 * Object-oriented interface for working with Agents.
 *
 * ## Overview
 *
 * The `Agent` class provides a high-level API for managing AI agent entities.
 * Agents represent registered AI agents that can be mounted into devboxes and
 * sourced from various package managers (npm, pip), git repositories, or object storage.
 *
 * ## Quickstart
 *
 * Agents are created and then mounted into devboxes via the mounts parameter:
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 *
 * // Create an agent from git
 * const agent = await runloop.agent.create({
 *   name: 'my-agent',
 *   source: {
 *     type: 'git',
 *     git: {
 *       repository: 'https://github.com/user/agent-repo',
 *       ref: 'main'
 *     }
 *   }
 * });
 *
 * // Mount agent into a devbox
 * const devbox = await runloop.devbox.create({
 *   name: 'devbox-with-agent',
 *   mounts: [{
 *     type: 'agent_mount',
 *     agent_id: agent.id,
 *     agent_path: '/home/user/agent'
 *   }]
 * });
 * ```
 *
 */
export class Agent {
  private client: Runloop;
  private _id: string;

  constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create an Agent instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link AgentOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The agent ID
   * @returns {Agent} An {@link Agent} instance
   */
  static fromId(client: Runloop, id: string): Agent {
    return new Agent(client, id);
  }

  /**
   * Create a new Agent.
   *
   * See the {@link AgentOps.create} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {AgentCreateParams} params - Agent creation parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Agent>} A new {@link Agent} instance
   */
  static async create(
    client: Runloop,
    params: AgentCreateParams,
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const agentData = await client.agents.create(params, options);
    return new Agent(client, agentData.id);
  }

  /**
   * List all agents, optionally filtered by name, public status, or search query.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * // List all agents
   * const agents = await runloop.agent.list();
   *
   * // Filter by name
   * const agents = await runloop.agent.list({ name: 'my-agent' });
   *
   * // Search by ID or name
   * const agents = await runloop.agent.list({ search: 'agent-123' });
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {AgentListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Agent[]>} Array of {@link Agent} instances
   */
  static async list(
    client: Runloop,
    params?: AgentListParams,
    options?: Core.RequestOptions,
  ): Promise<Agent[]> {
    const agents = await client.agents.list(params, options);
    const result: Agent[] = [];

    for await (const agent of agents) {
      result.push(new Agent(client, agent.id));
    }

    return result;
  }

  /**
   * Get the agent ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete agent data from the API.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<AgentView>} The agent data
   */
  async getInfo(options?: Core.RequestOptions): Promise<AgentView> {
    return await this.client.agents.retrieve(this._id, options);
  }
}
