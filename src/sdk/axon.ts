import { Runloop } from '../index';
import type * as Core from '../core';
import { Stream } from '../streaming';
import type {
  AxonView,
  AxonCreateParams,
  AxonPublishParams,
  AxonSubscribeSseParams,
  PublishResultView,
  AxonEventView,
} from '../resources/axons/axons';
import type {
  SqlBatchParams,
  SqlBatchResultView,
  SqlQueryParams,
  SqlQueryResultView,
} from '../resources/axons/sql';

/**
 * SQL operations for an axon's SQLite database.
 *
 * @category Axon
 */
export class AxonSqlOps {
  /**
   * @private
   */
  constructor(
    private client: Runloop,
    private axonId: string,
  ) {}

  /**
   * [Beta] Execute a single parameterized SQL statement against this axon's SQLite database.
   *
   * @param {SqlQueryParams} params - The SQL query and optional positional parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<SqlQueryResultView>} The query result with columns, rows, and metadata
   */
  async query(params: SqlQueryParams, options?: Core.RequestOptions): Promise<SqlQueryResultView> {
    return this.client.axons.sql.query(this.axonId, params, options);
  }

  /**
   * [Beta] Execute multiple SQL statements atomically within a single transaction
   * against this axon's SQLite database.
   *
   * @param {SqlBatchParams} params - The batch of SQL statements to execute
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<SqlBatchResultView>} One result per statement, in order
   */
  async batch(params: SqlBatchParams, options?: Core.RequestOptions): Promise<SqlBatchResultView> {
    return this.client.axons.sql.batch(this.axonId, params, options);
  }
}

/**
 * [Beta] Object-oriented interface for working with Axons.
 *
 * @category Axon
 *
 * @remarks
 * ## Overview
 *
 * The `Axon` class provides a high-level, object-oriented API for managing axons.
 * Axons are event communication channels that support publishing events and subscribing
 * to event streams via server-sent events (SSE).
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 *
 * const runloop = new RunloopSDK();
 * const axon = await runloop.axon.create();
 *
 * // Publish an event
 * await axon.publish({
 *   event_type: 'task_complete',
 *   origin: 'AGENT_EVENT',
 *   payload: JSON.stringify({ result: 'success' }),
 *   source: 'my-agent',
 * });
 *
 * // Subscribe to events
 * const stream = await axon.subscribeSse();
 * for await (const event of stream) {
 *   console.log(event.event_type, event.payload);
 * }
 *
 * // Execute SQL queries
 * await axon.sql.query({ sql: 'CREATE TABLE tasks (id INTEGER PRIMARY KEY, name TEXT)' });
 * const result = await axon.sql.query({ sql: 'SELECT * FROM tasks WHERE id = ?', params: [1] });
 * ```
 */
export class Axon {
  private client: Runloop;
  private _id: string;
  public readonly sql: AxonSqlOps;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
    this.sql = new AxonSqlOps(this.client, this._id);
  }

  /**
   * [Beta] Create a new Axon.
   *
   * See the {@link AxonOps.create} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {AxonCreateParams} [params] - Parameters for creating the axon
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Axon>} An {@link Axon} instance
   */
  static async create(
    client: Runloop,
    params?: AxonCreateParams,
    options?: Core.RequestOptions,
  ): Promise<Axon> {
    const axonData = await client.axons.create(params ?? {}, options);
    return new Axon(client, axonData.id);
  }

  /**
   * Create an Axon instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link AxonOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The axon ID
   * @returns {Axon} An {@link Axon} instance
   */
  static fromId(client: Runloop, id: string): Axon {
    return new Axon(client, id);
  }

  /**
   * Get the axon ID.
   * @returns {string} The axon ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * [Beta] Get the complete axon data from the API.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<AxonView>} The axon data
   */
  async getInfo(options?: Core.RequestOptions): Promise<AxonView> {
    return this.client.axons.retrieve(this._id, options);
  }

  /**
   * [Beta] Publish an event to this axon.
   *
   * @param {AxonPublishParams} params - Parameters for the event to publish
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<PublishResultView>} The publish result with sequence number and timestamp
   */
  async publish(params: AxonPublishParams, options?: Core.RequestOptions): Promise<PublishResultView> {
    return this.client.axons.publish(this._id, params, options);
  }

  /**
   * [Beta] Subscribe to this axon's event stream via server-sent events.
   *
   * @example
   * ```typescript
   * const stream = await axon.subscribeSse();
   * for await (const event of stream) {
   *   console.log(`[${event.source}] ${event.event_type}: ${event.payload}`);
   * }
   * ```
   *
   * @param {AxonSubscribeSseParams} [query] - Query parameters (e.g. after_sequence)
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Stream<AxonEventView>>} An async iterable stream of axon events
   */
  async subscribeSse(
    query?: AxonSubscribeSseParams,
    options?: Core.RequestOptions,
  ): Promise<Stream<AxonEventView>> {
    return this.client.axons.subscribeSse(this._id, query, options);
  }
}
