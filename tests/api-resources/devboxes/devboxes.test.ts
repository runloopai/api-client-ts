// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop, { toFile } from '@runloop/api-client';
import { Response } from 'node-fetch';

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
            {
              repo_name: 'repo_name',
              repo_owner: 'repo_owner',
              token: 'token',
              install_command: 'install_command',
            },
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
            available_ports: [0, 0, 0],
            keep_alive_time_seconds: 0,
            launch_commands: ['string', 'string', 'string'],
            resource_size_request: 'SMALL',
          },
          metadata: { foo: 'string' },
          name: 'name',
          prebuilt: 'prebuilt',
          setup_commands: ['string', 'string', 'string'],
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
        { limit: 0, starting_after: 'starting_after', status: 'status' },
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

  test('diskSnapshots', async () => {
    const responsePromise = client.devboxes.diskSnapshots();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('diskSnapshots: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.diskSnapshots({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('diskSnapshots: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.diskSnapshots(
        { limit: 0, starting_after: 'starting_after' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  // prism can't support octet
  test.skip('downloadFile: required and optional params', async () => {
    const response = await client.devboxes.downloadFile('id', { path: 'path' });
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
        { metadata: { foo: 'string' }, name: 'name' },
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

  test('uploadFile', async () => {
    const responsePromise = client.devboxes.uploadFile('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('uploadFile: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.uploadFile('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('uploadFile: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.uploadFile(
        'id',
        { file: await toFile(Buffer.from('# my file contents'), 'README.md'), path: 'path' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('writeFile: only required params', async () => {
    const responsePromise = client.devboxes.writeFile('id', { contents: 'contents', file_path: 'file_path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('writeFile: required and optional params', async () => {
    const response = await client.devboxes.writeFile('id', { contents: 'contents', file_path: 'file_path' });
  });
});
