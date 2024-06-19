// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from 'runloop';
import { Response } from 'node-fetch';

const runloop = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource functions', () => {
  test('list', async () => {
    const responsePromise = runloop.functions.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(runloop.functions.list({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('invokeAsync: only required params', async () => {
    const responsePromise = runloop.functions.invokeAsync('string', 'string', { request: {} });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('invokeAsync: required and optional params', async () => {
    const response = await runloop.functions.invokeAsync('string', 'string', {
      request: {},
      runloopMeta: { sessionId: 'string' },
    });
  });

  test('invokeSync: only required params', async () => {
    const responsePromise = runloop.functions.invokeSync('string', 'string', { request: {} });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('invokeSync: required and optional params', async () => {
    const response = await runloop.functions.invokeSync('string', 'string', {
      request: {},
      runloopMeta: { sessionId: 'string' },
    });
  });
});
