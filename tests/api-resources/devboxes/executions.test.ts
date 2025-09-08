// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';
import { APIError } from '../../../src/error';

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

  test.skip('streamStderrUpdates', async () => {
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

  test.skip('streamStdoutUpdates', async () => {
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

  test('awaitCompleted: polls until execution reaches completed state', async () => {
    const mockPost = jest.spyOn(client.devboxes.executions['_client'], 'post');

    // Mock the polling responses - first running, then completed
    mockPost
      .mockResolvedValueOnce({
        devbox_id: 'devbox-id',
        execution_id: 'exec-id',
        status: 'running',
      })
      .mockResolvedValueOnce({
        devbox_id: 'devbox-id',
        execution_id: 'exec-id',
        status: 'completed',
        exit_status: 0,
        stdout: 'Success',
        stderr: '',
      });

    const result = await client.devboxes.executions.awaitCompleted('devbox-id', 'exec-id');

    expect(result).toEqual({
      devbox_id: 'devbox-id',
      execution_id: 'exec-id',
      status: 'completed',
      exit_status: 0,
      stdout: 'Success',
      stderr: '',
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenCalledWith('/v1/devboxes/devbox-id/executions/exec-id/wait_for_status', {
      body: { statuses: ['completed'] },
    });

    mockPost.mockRestore();
  });

  test('awaitCompleted: handles 408 timeout errors and continues polling', async () => {
    const mockPost = jest.spyOn(client.devboxes.executions['_client'], 'post');

    // Mock 408 error followed by success
    const timeoutError = new APIError(408, undefined, 'Request timeout', {});

    mockPost.mockRejectedValueOnce(timeoutError).mockResolvedValueOnce({
      devbox_id: 'devbox-id',
      execution_id: 'exec-id',
      status: 'completed',
      exit_status: 0,
      stdout: 'Success',
      stderr: '',
    });

    const result = await client.devboxes.executions.awaitCompleted('devbox-id', 'exec-id');

    expect(result).toEqual({
      devbox_id: 'devbox-id',
      execution_id: 'exec-id',
      status: 'completed',
      exit_status: 0,
      stdout: 'Success',
      stderr: '',
    });
    expect(mockPost).toHaveBeenCalledTimes(2);

    mockPost.mockRestore();
  });

  test('awaitCompleted: rethrows non-408 errors', async () => {
    const mockPost = jest.spyOn(client.devboxes.executions['_client'], 'post');

    const serverError = new APIError(500, undefined, 'Server error', {});

    mockPost.mockRejectedValueOnce(serverError);

    await expect(client.devboxes.executions.awaitCompleted('devbox-id', 'exec-id')).rejects.toThrow(
      'Server error',
    );

    mockPost.mockRestore();
  });

  test('awaitCompleted: stops polling when execution status is completed', async () => {
    const mockPost = jest.spyOn(client.devboxes.executions['_client'], 'post');

    // Mock immediate success
    mockPost.mockResolvedValueOnce({
      devbox_id: 'devbox-id',
      execution_id: 'exec-id',
      status: 'completed',
      exit_status: 0,
      stdout: 'Success',
      stderr: '',
    });

    const result = await client.devboxes.executions.awaitCompleted('devbox-id', 'exec-id');

    expect(result.status).toBe('completed');
    // The poll function calls the longPoll function for both initial and polling - but since it's immediately completed, it should only call once
    expect(mockPost).toHaveBeenCalledTimes(1);

    mockPost.mockRestore();
  });

  test('awaitCompleted: continues polling when execution status is queued', async () => {
    const mockPost = jest.spyOn(client.devboxes.executions['_client'], 'post');

    // Mock queued then completed
    mockPost
      .mockResolvedValueOnce({
        devbox_id: 'devbox-id',
        execution_id: 'exec-id',
        status: 'queued',
      })
      .mockResolvedValueOnce({
        devbox_id: 'devbox-id',
        execution_id: 'exec-id',
        status: 'completed',
        exit_status: 0,
        stdout: 'Success',
        stderr: '',
      });

    const result = await client.devboxes.executions.awaitCompleted('devbox-id', 'exec-id');

    expect(result.status).toBe('completed');
    expect(mockPost).toHaveBeenCalledTimes(2);

    mockPost.mockRestore();
  });
});
