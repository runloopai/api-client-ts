// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource deployments', () => {
  test('retrieve', async () => {
    const responsePromise = client.deployments.retrieve('deployment_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('retrieve: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.deployments.retrieve('deployment_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('get', async () => {
    const responsePromise = client.deployments.get();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('get: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.deployments.get({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('get: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.deployments.get(
        { limit: 'limit', starting_after: 'starting_after' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('logs', async () => {
    const responsePromise = client.deployments.logs('deployment_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('logs: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.deployments.logs('deployment_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('redeploy', async () => {
    const responsePromise = client.deployments.redeploy('deployment_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('redeploy: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.deployments.redeploy('deployment_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  // cannot test text/event-stream
  test.skip('tail', async () => {
    const responsePromise = client.deployments.tail('deployment_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // cannot test text/event-stream
  test.skip('tail: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.deployments.tail('deployment_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });
});
