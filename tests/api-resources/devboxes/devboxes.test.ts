// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop, { toFile } from '@runloop/api-client';
import { Response } from 'node-fetch';
import { APIError } from '../../../src/error';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource devboxes', () => {
  test('create', async () => {
    const responsePromise = client.devboxes.create();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.create({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('create: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.create(
        {
          blueprint_id: 'blueprint_id',
          blueprint_name: 'blueprint_name',
          code_mounts: [
            {
              repo_name: 'repo_name',
              repo_owner: 'repo_owner',
              token: 'token',
              install_command: 'install_command',
            },
          ],
          entrypoint: 'entrypoint',
          environment_variables: { foo: 'string' },
          file_mounts: { foo: 'string' },
          launch_parameters: {
            after_idle: { idle_time_seconds: 0, on_idle: 'shutdown' },
            architecture: 'x86_64',
            available_ports: [0],
            custom_cpu_cores: 0,
            custom_disk_size: 0,
            custom_gb_memory: 0,
            keep_alive_time_seconds: 0,
            launch_commands: ['string'],
            required_services: ['string'],
            resource_size_request: 'X_SMALL',
            user_parameters: { uid: 0, username: 'username' },
          },
          metadata: { foo: 'string' },
          mounts: [{ object_id: 'object_id', object_path: 'object_path', type: 'object_mount' }],
          name: 'name',
          repo_connection_id: 'repo_connection_id',
          secrets: { foo: 'string' },
          snapshot_id: 'snapshot_id',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('retrieve', async () => {
    const responsePromise = client.devboxes.retrieve('id');
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
    await expect(client.devboxes.retrieve('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('update', async () => {
    const responsePromise = client.devboxes.update('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('update: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.update('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('update: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.update(
        'id',
        { metadata: { foo: 'string' }, name: 'name' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('list', async () => {
    const responsePromise = client.devboxes.list();
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
    await expect(client.devboxes.list({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.list(
        { limit: 0, starting_after: 'starting_after', status: 'provisioning' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('createSSHKey', async () => {
    const responsePromise = client.devboxes.createSSHKey('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createSSHKey: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.createSSHKey('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('createTunnel: only required params', async () => {
    const responsePromise = client.devboxes.createTunnel('id', { port: 0 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createTunnel: required and optional params', async () => {
    const response = await client.devboxes.createTunnel('id', { port: 0 });
  });

  test('deleteDiskSnapshot', async () => {
    const responsePromise = client.devboxes.deleteDiskSnapshot('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('deleteDiskSnapshot: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.deleteDiskSnapshot('id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  // prism can't support octet
  test.skip('downloadFile: required and optional params', async () => {
    const response = await client.devboxes.downloadFile('id', { path: 'path' });
  });

  test('execute: only required params', async () => {
    const responsePromise = client.devboxes.execute('id', { command: 'command', command_id: 'command_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('execute: required and optional params', async () => {
    const response = await client.devboxes.execute('id', {
      command: 'command',
      command_id: 'command_id',
      last_n: 'last_n',
      optimistic_timeout: 0,
      shell_name: 'shell_name',
    });
  });

  test('executeAsync: only required params', async () => {
    const responsePromise = client.devboxes.executeAsync('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('executeAsync: required and optional params', async () => {
    const response = await client.devboxes.executeAsync('id', {
      command: 'command',
      attach_stdin: true,
      shell_name: 'shell_name',
    });
  });

  test('executeSync: only required params', async () => {
    const responsePromise = client.devboxes.executeSync('id', { command: 'command' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('executeSync: required and optional params', async () => {
    const response = await client.devboxes.executeSync('id', {
      command: 'command',
      attach_stdin: true,
      shell_name: 'shell_name',
    });
  });

  test('keepAlive', async () => {
    const responsePromise = client.devboxes.keepAlive('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('keepAlive: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.keepAlive('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('listDiskSnapshots', async () => {
    const responsePromise = client.devboxes.listDiskSnapshots();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listDiskSnapshots: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.listDiskSnapshots({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('listDiskSnapshots: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.listDiskSnapshots(
        {
          devbox_id: 'devbox_id',
          limit: 0,
          'metadata[key]': 'metadata[key]',
          'metadata[key][in]': 'metadata[key][in]',
          starting_after: 'starting_after',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('readFileContents: only required params', async () => {
    const responsePromise = client.devboxes.readFileContents('id', { file_path: 'file_path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('readFileContents: required and optional params', async () => {
    const response = await client.devboxes.readFileContents('id', { file_path: 'file_path' });
  });

  test('removeTunnel: only required params', async () => {
    const responsePromise = client.devboxes.removeTunnel('id', { port: 0 });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('removeTunnel: required and optional params', async () => {
    const response = await client.devboxes.removeTunnel('id', { port: 0 });
  });

  test('resume', async () => {
    const responsePromise = client.devboxes.resume('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('resume: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.resume('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('shutdown', async () => {
    const responsePromise = client.devboxes.shutdown('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('shutdown: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.shutdown('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('snapshotDisk', async () => {
    const responsePromise = client.devboxes.snapshotDisk('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('snapshotDisk: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.snapshotDisk('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('snapshotDisk: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.snapshotDisk(
        'id',
        { commit_message: 'commit_message', metadata: { foo: 'string' }, name: 'name' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('snapshotDiskAsync', async () => {
    const responsePromise = client.devboxes.snapshotDiskAsync('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('snapshotDiskAsync: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.snapshotDiskAsync('id', { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('snapshotDiskAsync: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.snapshotDiskAsync(
        'id',
        { commit_message: 'commit_message', metadata: { foo: 'string' }, name: 'name' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('suspend', async () => {
    const responsePromise = client.devboxes.suspend('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('suspend: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.suspend('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('uploadFile: only required params', async () => {
    const responsePromise = client.devboxes.uploadFile('id', { path: 'path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('uploadFile: required and optional params', async () => {
    const response = await client.devboxes.uploadFile('id', {
      path: 'path',
      file: await toFile(Buffer.from('# my file contents'), 'README.md'),
    });
  });

  test('waitForCommand: only required params', async () => {
    const responsePromise = client.devboxes.waitForCommand('devbox_id', 'execution_id', {
      statuses: ['queued'],
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('waitForCommand: required and optional params', async () => {
    const response = await client.devboxes.waitForCommand('devbox_id', 'execution_id', {
      statuses: ['queued'],
      last_n: 'last_n',
      timeout_seconds: 0,
    });
  });

  test('writeFileContents: only required params', async () => {
    const responsePromise = client.devboxes.writeFileContents('id', {
      contents: 'contents',
      file_path: 'file_path',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('writeFileContents: required and optional params', async () => {
    const response = await client.devboxes.writeFileContents('id', {
      contents: 'contents',
      file_path: 'file_path',
    });
  });

  test('awaitRunning: polls until devbox reaches running state', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    // Mock the polling responses - first provisioning, then running
    mockPost
      .mockResolvedValueOnce({ id: 'test-id', status: 'provisioning' })
      .mockResolvedValueOnce({ id: 'test-id', status: 'running' });

    const result = await client.devboxes.awaitRunning('test-id');

    expect(result).toEqual({ id: 'test-id', status: 'running' });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenCalledWith('/v1/devboxes/test-id/wait_for_status', {
      body: { statuses: ['running', 'failure', 'shutdown'] },
    });

    mockPost.mockRestore();
  });

  test('awaitRunning: handles 408 timeout errors and continues polling', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    // Mock 408 error followed by success
    const timeoutError = new APIError(408, undefined, 'Request timeout', {});

    mockPost.mockRejectedValueOnce(timeoutError).mockResolvedValueOnce({ id: 'test-id', status: 'running' });

    const result = await client.devboxes.awaitRunning('test-id');

    expect(result).toEqual({ id: 'test-id', status: 'running' });
    expect(mockPost).toHaveBeenCalledTimes(2);

    mockPost.mockRestore();
  });

  test('awaitRunning: throws error when devbox reaches failure state', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    mockPost.mockResolvedValueOnce({ id: 'test-id', status: 'failure' });

    await expect(client.devboxes.awaitRunning('test-id')).rejects.toThrow(
      'Devbox test-id is in non-running state failure',
    );

    mockPost.mockRestore();
  });

  test('awaitRunning: throws error when devbox reaches shutdown state', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    mockPost.mockResolvedValueOnce({ id: 'test-id', status: 'shutdown' });

    await expect(client.devboxes.awaitRunning('test-id')).rejects.toThrow(
      'Devbox test-id is in non-running state shutdown',
    );

    mockPost.mockRestore();
  });

  test('awaitRunning: rethrows non-408 errors', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    const serverError = new APIError(500, undefined, 'Server error', {});

    mockPost.mockRejectedValueOnce(serverError);

    await expect(client.devboxes.awaitRunning('test-id')).rejects.toThrow('Server error');

    mockPost.mockRestore();
  });

  test('createAndAwaitRunning: creates devbox and waits for running state', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    // Mock create response followed by polling responses
    mockPost
      .mockResolvedValueOnce({ id: 'new-devbox-id', status: 'provisioning' })
      .mockResolvedValueOnce({ id: 'new-devbox-id', status: 'running' });

    const result = await client.devboxes.createAndAwaitRunning({ name: 'test-devbox' });

    expect(result).toEqual({ id: 'new-devbox-id', status: 'running' });
    expect(mockPost).toHaveBeenCalledTimes(2);

    // Check create call
    expect(mockPost).toHaveBeenNthCalledWith(1, '/v1/devboxes', {
      body: { name: 'test-devbox' },
    });

    // Check polling calls
    expect(mockPost).toHaveBeenNthCalledWith(2, '/v1/devboxes/new-devbox-id/wait_for_status', {
      body: { statuses: ['running', 'failure', 'shutdown'] },
    });

    mockPost.mockRestore();
  });

  test('createAndAwaitRunning: handles creation failure', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    const createError = new Error('Creation failed');
    mockPost.mockRejectedValueOnce(createError);

    await expect(client.devboxes.createAndAwaitRunning()).rejects.toThrow('Creation failed');

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith('/v1/devboxes', { body: {} });

    mockPost.mockRestore();
  });

  test('executeAndAwaitCompletion: passes last_n to waitForCommand when execute is not completed', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    // Mock the execute call to return a non-completed status
    const executeResponse = {
      execution_id: 'exec-123',
      status: 'running', // Not completed
      command_id: 'cmd-123',
    };
    mockPost.mockResolvedValueOnce(executeResponse);

    // Mock the waitForCommand call to return completed status (both initial and polling calls)
    const waitForCommandResponse = {
      devbox_id: 'devbox-123',
      execution_id: 'exec-123',
      status: 'completed',
      shell_name: 'bash',
      stdout: 'hello',
      stderr: '',
      exit_status: 0,
    };
    mockPost.mockResolvedValueOnce(waitForCommandResponse);

    const result = await client.devboxes.executeAndAwaitCompletion(
      'devbox-123',
      {
        command: 'echo hello',
        last_n: '10', // This should be passed to waitForCommand
      },
      {
        polling: {
          maxAttempts: 1,
          pollingIntervalMs: 10,
        },
      },
    );

    expect(result.status).toBe('completed');
    expect(result.execution_id).toBe('exec-123');

    // Verify execute was called
    expect(mockPost).toHaveBeenCalledTimes(2); // execute + waitForCommand
    expect(mockPost).toHaveBeenNthCalledWith(1, '/v1/devboxes/devbox-123/execute', {
      body: expect.objectContaining({
        command: 'echo hello',
        command_id: expect.any(String),
      }),
      query: { last_n: '10' },
      polling: {
        maxAttempts: 1,
        pollingIntervalMs: 10,
      },
      timeout: 600000,
    });

    // Verify waitForCommand was called with last_n
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      '/v1/devboxes/devbox-123/executions/exec-123/wait_for_status',
      {
        query: { last_n: '10' },
        body: {
          statuses: ['completed'],
        },
      },
    );

    mockPost.mockRestore();
  });

  test('executeAndAwaitCompletion: does not pass last_n to waitForCommand when not provided', async () => {
    const mockPost = jest.spyOn(client.devboxes['_client'], 'post');

    // Mock the execute call to return a non-completed status
    const executeResponse = {
      execution_id: 'exec-123',
      status: 'running', // Not completed
      command_id: 'cmd-123',
    };
    mockPost.mockResolvedValueOnce(executeResponse);

    // Mock the waitForCommand call to return completed status (both initial and polling calls)
    const waitForCommandResponse = {
      devbox_id: 'devbox-123',
      execution_id: 'exec-123',
      status: 'completed',
      shell_name: 'bash',
      stdout: 'hello',
      stderr: '',
      exit_status: 0,
    };
    mockPost.mockResolvedValueOnce(waitForCommandResponse);

    const result = await client.devboxes.executeAndAwaitCompletion(
      'devbox-123',
      {
        command: 'echo hello',
        // No last_n parameter
      },
      {
        polling: {
          maxAttempts: 1,
          pollingIntervalMs: 10,
        },
      },
    );

    expect(result.status).toBe('completed');
    expect(result.execution_id).toBe('exec-123');

    // Verify execute was called
    expect(mockPost).toHaveBeenCalledTimes(2); // execute + waitForCommand
    expect(mockPost).toHaveBeenNthCalledWith(1, '/v1/devboxes/devbox-123/execute', {
      body: expect.objectContaining({
        command: 'echo hello',
        command_id: expect.any(String),
      }),
      query: { last_n: undefined },
      polling: {
        maxAttempts: 1,
        pollingIntervalMs: 10,
      },
      timeout: 600000,
    });

    // Verify waitForCommand was called without last_n
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      '/v1/devboxes/devbox-123/executions/exec-123/wait_for_status',
      {
        query: { last_n: undefined }, // Should be undefined when not provided
        body: {
          statuses: ['completed'],
        },
      },
    );

    mockPost.mockRestore();
  });
});
