// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { castToError, Headers } from './core';
import {
  type RunloopErrorDetails,
  normalizeResponseError,
  normalizeTransportError,
} from './lib/error-normalization';

export class RunloopError extends Error {}

export class APIError<
  TStatus extends number | undefined = number | undefined,
  THeaders extends Headers | undefined = Headers | undefined,
  TError extends Object | undefined = Object | undefined,
> extends RunloopError {
  /** HTTP status for the response that caused the error */
  readonly status: TStatus;
  /** HTTP headers for the response that caused the error */
  readonly headers: THeaders;
  /** JSON body of the response that caused the error */
  readonly error: TError;
  readonly code: string | undefined;
  readonly phase: string | undefined;
  readonly retryable: boolean | undefined;
  readonly requestID: string | undefined;
  readonly retryAfter: number | undefined;
  readonly attempts: number | undefined;
  declare readonly cause: Error | undefined;

  constructor(
    status: TStatus,
    error: TError,
    message: string | undefined,
    headers: THeaders,
    details: RunloopErrorDetails = {},
  ) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
    this.code = details.code;
    this.phase = details.phase;
    this.retryable = details.retryable;
    this.requestID = details.requestID;
    this.retryAfter = details.retryAfter;
    this.attempts = details.attempts;
    if (details.cause) Object.defineProperty(this, 'cause', { value: details.cause, enumerable: false });
  }

  private static makeMessage(status: number | undefined, error: any, message: string | undefined) {
    const msg =
      error?.message ?
        typeof error.message === 'string' ?
          error.message
        : JSON.stringify(error.message)
      : typeof error?.error === 'string' ? error.error
      : error ? JSON.stringify(error)
      : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return '(no status code or body)';
  }

  static generate(
    status: number | undefined,
    errorResponse: Object | undefined,
    message: string | undefined,
    headers: Headers | undefined,
    attempts = 1,
  ): APIError {
    if (!status || !headers) {
      const cause = castToError(errorResponse);
      return APIConnectionError.fromCause(cause, attempts, message);
    }

    const error = errorResponse as Record<string, any>;
    const details = normalizeResponseError(error, headers, attempts);

    if (status === 400) {
      return new BadRequestError(status, error, message, headers, details);
    }

    if (status === 401) {
      return new AuthenticationError(status, error, message, headers, details);
    }

    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers, details);
    }

    if (status === 404) {
      return new NotFoundError(status, error, message, headers, details);
    }

    if (status === 409) {
      return new ConflictError(status, error, message, headers, details);
    }

    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers, details);
    }

    if (status === 429) {
      return new RateLimitError(status, error, message, headers, details);
    }

    if (status >= 500) {
      return new InternalServerError(status, error, message, headers, details);
    }

    return new APIError(status, error, message, headers, details);
  }
}

export class APIUserAbortError extends APIError<undefined, undefined, undefined> {
  constructor({ message }: { message?: string } = {}) {
    super(undefined, undefined, message || 'Request was aborted.', undefined);
  }
}

export class APIConnectionError extends APIError<undefined, undefined, undefined> {
  constructor({
    message,
    cause,
    details,
  }: {
    message?: string | undefined;
    cause?: Error | undefined;
    details?: RunloopErrorDetails | undefined;
  }) {
    super(undefined, undefined, message || 'Connection error.', undefined, {
      ...details,
      ...(cause ? { cause } : {}),
    });
  }

  static fromCause(cause: Error, attempts = 1, message?: string | undefined): APIConnectionError {
    const details = normalizeTransportError(cause, attempts);
    if (details.code === 'request_timeout' || details.code === 'connection_timeout') {
      return new APIConnectionTimeoutError({ message, details });
    }
    return new APIConnectionError({ message, details });
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor({
    message,
    cause,
    details,
  }: {
    message?: string | undefined;
    cause?: Error | undefined;
    details?: RunloopErrorDetails | undefined;
  } = {}) {
    super({ message: message ?? 'Request timed out.', cause, details });
  }
}

export class BadRequestError extends APIError<400, Headers> {}

export class AuthenticationError extends APIError<401, Headers> {}

export class PermissionDeniedError extends APIError<403, Headers> {}

export class NotFoundError extends APIError<404, Headers> {}

export class ConflictError extends APIError<409, Headers> {}

export class UnprocessableEntityError extends APIError<422, Headers> {}

export class RateLimitError extends APIError<429, Headers> {}

export class InternalServerError extends APIError<number, Headers> {}
