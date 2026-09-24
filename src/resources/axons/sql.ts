// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../resource';
import * as Core from '../../core';

export class Sql extends APIResource {
  /**
   * [Beta] Execute multiple SQL statements atomically within a single transaction
   * against an axon's SQLite database.
   */
  batch(
    id: string,
    body: SqlBatchParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<SqlBatchResultView> {
    return this._client.post(`/v1/axons/${id}/sql/batch`, { body, ...options });
  }

  /**
   * [Beta] Execute a single parameterized SQL statement against an axon's SQLite
   * database.
   */
  query(
    id: string,
    body: SqlQueryParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<SqlQueryResultView> {
    return this._client.post(`/v1/axons/${id}/sql/query`, { body, ...options });
  }
}

export interface SqlBatchParams {
  /**
   * The SQL statements to execute atomically within a transaction.
   */
  statements: Array<SqlStatementParams>;
}

export interface SqlBatchResultView {
  /**
   * One result per statement, in order.
   */
  results: Array<SqlStepResultView>;
}

export interface SqlColumnMetaView {
  /**
   * Column name or alias.
   */
  name: string;

  /**
   * Declared type (TEXT, INTEGER, REAL, BLOB, or empty).
   */
  type: string;
}

export interface SqlQueryResultView {
  /**
   * Column metadata.
   */
  columns: Array<SqlColumnMetaView>;

  /**
   * Execution metadata.
   */
  meta: SqlResultMetaView;

  /**
   * Result rows (empty for non-SELECT statements).
   */
  rows: Array<unknown>;
}

export interface SqlResultMetaView {
  /**
   * Rows modified by INSERT/UPDATE/DELETE.
   */
  changes: number;

  /**
   * Execution time in milliseconds.
   */
  duration_ms: number;

  /**
   * True when result was truncated at the row limit.
   */
  rows_read_limit_reached: boolean;
}

export interface SqlStatementParams {
  /**
   * SQL query with ?-style positional placeholders.
   */
  sql: string;

  /**
   * Positional parameter bindings for ? placeholders.
   */
  params?: Array<unknown>;
}

export interface SqlStepErrorView {
  /**
   * Error message.
   */
  message: string;
}

export interface SqlStepResultView {
  /**
   * Error on failure.
   */
  error?: SqlStepErrorView | null;

  /**
   * Result on success.
   */
  success?: SqlQueryResultView | null;
}

export interface SqlBatchParams {
  /**
   * The SQL statements to execute atomically within a transaction.
   */
  statements: Array<SqlStatementParams>;
}

export interface SqlQueryParams {
  /**
   * SQL query with ?-style positional placeholders.
   */
  sql: string;

  /**
   * Positional parameter bindings for ? placeholders.
   */
  params?: Array<unknown>;
}

export declare namespace Sql {
  export {
    type SqlBatchParams as SqlBatchParams,
    type SqlBatchResultView as SqlBatchResultView,
    type SqlColumnMetaView as SqlColumnMetaView,
    type SqlQueryResultView as SqlQueryResultView,
    type SqlResultMetaView as SqlResultMetaView,
    type SqlStatementParams as SqlStatementParams,
    type SqlStepErrorView as SqlStepErrorView,
    type SqlStepResultView as SqlStepResultView,
    type SqlQueryParams as SqlQueryParams,
  };
}
