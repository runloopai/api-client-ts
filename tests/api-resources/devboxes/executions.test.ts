// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource executions', () => {
  test('retrieve', async () => {
    const responsePromise = client.devboxes.executions.retrieve('devbox_id', 'execution_id');
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
      client.devboxes.executions.retrieve('devbox_id', 'execution_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('retrieve: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.executions.retrieve(
        'devbox_id',
        'execution_id',
        { last_n: 'last_n' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('executeAsync: only required params', async () => {
    const responsePromise = client.devboxes.executions.executeAsync('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('executeAsync: required and optional params', async () => {
    const response = await client.devboxes.executions.executeAsync('id', {
      command: 'command',
      shell_name: 'shell_name',
    });
  });

  test('executeSync: only required params', async () => {
    const responsePromise = client.devboxes.executions.executeSync('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('executeSync: required and optional params', async () => {
    const response = await client.devboxes.executions.executeSync('id', {
      command: 'command',
      shell_name: 'shell_name',
    });
  });

  test('kill', async () => {
    const responsePromise = client.devboxes.executions.kill('devbox_id', 'execution_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('kill: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.executions.kill('devbox_id', 'execution_id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('kill: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.executions.kill(
        'devbox_id',
        'execution_id',
        { kill_process_group: true },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('streamStderrUpdates', async () => {
    const responsePromise = client.devboxes.executions.streamStderrUpdates('devbox_id', 'execution_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('streamStderrUpdates: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.executions.streamStderrUpdates(
        'devbox_id',
        'execution_id',
        { offset: 'offset' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('streamStdoutUpdates', async () => {
    const responsePromise = client.devboxes.executions.streamStdoutUpdates('devbox_id', 'execution_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('streamStdoutUpdates: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.executions.streamStdoutUpdates(
        'devbox_id',
        'execution_id',
        { offset: 'offset' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });
});
