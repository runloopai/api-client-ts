// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Runloop } from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource blueprints', () => {
  test('create: only required params', async () => {
    const responsePromise = client.blueprints.create({ name: 'name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: required and optional params', async () => {
    const response = await client.blueprints.create({
      name: 'name',
      base_blueprint_id: 'base_blueprint_id',
      base_blueprint_name: 'base_blueprint_name',
      build_args: { foo: 'string' },
      build_context: { object_id: 'object_id', type: 'object' },
      code_mounts: [
        {
          repo_name: 'repo_name',
          repo_owner: 'repo_owner',
          token: 'token',
          install_command: 'install_command',
        },
      ],
      dockerfile: 'dockerfile',
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
      secrets: { foo: 'string' },
      services: [
        {
          image: 'image',
          name: 'name',
          credentials: { password: 'password', username: 'username' },
          env: { foo: 'string' },
          options: 'options',
          port_mappings: ['string'],
        },
      ],
      system_setup_commands: ['string'],
    });
  });

  test('create rejects large file_mount', () => {
    const tooLargeContent = 'a'.repeat(131_000 + 1);
    expect(() =>
      client.blueprints.create({
        name: 'name',
        file_mounts: { '/tmp/large.txt': tooLargeContent },
      }),
    ).toThrow(/over the limit/);
  });

  test('create rejects total file_mount size', () => {
    const perFileMax = 131_000;
    const file_mounts: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      file_mounts[`/tmp/${i}.txt`] = 'a'.repeat(perFileMax);
    }
    file_mounts['/tmp/extra.txt'] = 'x';
    expect(() =>
      client.blueprints.create({
        name: 'name',
        file_mounts,
      }),
    ).toThrow(/total file_mounts size .* over the limit/);
  });

  test('retrieve', async () => {
    const responsePromise = client.blueprints.retrieve('id');
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
    await expect(client.blueprints.retrieve('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list', async () => {
    const responsePromise = client.blueprints.list();
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
    await expect(client.blueprints.list({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.blueprints.list(
        {
          limit: 0,
          name: 'name',
          starting_after: 'starting_after',
          status: 'status',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('delete', async () => {
    const responsePromise = client.blueprints.delete('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('delete: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.blueprints.delete('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('createFromInspection: only required params', async () => {
    const responsePromise = client.blueprints.createFromInspection({
      inspection_source: { inspection_id: 'inspection_id' },
      name: 'name',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createFromInspection: required and optional params', async () => {
    const response = await client.blueprints.createFromInspection({
      inspection_source: { inspection_id: 'inspection_id', github_auth_token: 'github_auth_token' },
      name: 'name',
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
      secrets: { foo: 'string' },
      system_setup_commands: ['string'],
    });
  });

  test('listPublic', async () => {
    const responsePromise = client.blueprints.listPublic();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listPublic: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.blueprints.listPublic({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('listPublic: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.blueprints.listPublic(
        {
          limit: 0,
          name: 'name',
          starting_after: 'starting_after',
          status: 'status',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('logs', async () => {
    const responsePromise = client.blueprints.logs('id');
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
    await expect(client.blueprints.logs('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('preview: only required params', async () => {
    const responsePromise = client.blueprints.preview({ name: 'name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('preview: required and optional params', async () => {
    const response = await client.blueprints.preview({
      name: 'name',
      base_blueprint_name: 'base_blueprint_name',
      build_args: { foo: 'string' },
      build_context: { object_id: 'object_id', type: 'object' },
      code_mounts: [
        {
          repo_name: 'repo_name',
          repo_owner: 'repo_owner',
          token: 'token',
          install_command: 'install_command',
        },
      ],
      dockerfile: 'dockerfile',
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
      secrets: { foo: 'string' },
      services: [
        {
          image: 'image',
          name: 'name',
          credentials: { password: 'password', username: 'username' },
          env: { foo: 'string' },
          options: 'options',
          port_mappings: ['string'],
        },
      ],
      system_setup_commands: ['string'],
    });
  });
});
