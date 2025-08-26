// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource scenarios', () => {
  test('create: only required params', async () => {
    const responsePromise = client.scenarios.create({
      input_context: { problem_statement: 'problem_statement' },
      name: 'name',
      scoring_contract: {
        scoring_function_parameters: [
          {
            name: 'name',
            scorer: { pattern: 'pattern', search_directory: 'search_directory', type: 'ast_grep_scorer' },
            weight: 0,
          },
        ],
      },
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: required and optional params', async () => {
    const response = await client.scenarios.create({
      input_context: { problem_statement: 'problem_statement', additional_context: {} },
      name: 'name',
      scoring_contract: {
        scoring_function_parameters: [
          {
            name: 'name',
            scorer: {
              pattern: 'pattern',
              search_directory: 'search_directory',
              type: 'ast_grep_scorer',
              lang: 'lang',
            },
            weight: 0,
          },
        ],
      },
      environment_parameters: {
        blueprint_id: 'blueprint_id',
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
        snapshot_id: 'snapshot_id',
        working_directory: 'working_directory',
      },
      metadata: { foo: 'string' },
      reference_output: 'reference_output',
      required_environment_variables: ['string'],
      required_secret_names: ['string'],
      validation_type: 'FORWARD',
    });
  });

  test('retrieve', async () => {
    const responsePromise = client.scenarios.retrieve('id');
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
    await expect(client.scenarios.retrieve('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('update', async () => {
    const responsePromise = client.scenarios.update('id');
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
    await expect(client.scenarios.update('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('update: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.scenarios.update(
        'id',
        {
          environment_parameters: {
            blueprint_id: 'blueprint_id',
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
            snapshot_id: 'snapshot_id',
            working_directory: 'working_directory',
          },
          input_context: { additional_context: {}, problem_statement: 'problem_statement' },
          metadata: { foo: 'string' },
          name: 'name',
          reference_output: 'reference_output',
          required_environment_variables: ['string'],
          required_secret_names: ['string'],
          scoring_contract: {
            scoring_function_parameters: [
              {
                name: 'name',
                scorer: {
                  pattern: 'pattern',
                  search_directory: 'search_directory',
                  type: 'ast_grep_scorer',
                  lang: 'lang',
                },
                weight: 0,
              },
            ],
          },
          validation_type: 'FORWARD',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('list', async () => {
    const responsePromise = client.scenarios.list();
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
    await expect(client.scenarios.list({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.scenarios.list(
        { benchmark_id: 'benchmark_id', limit: 0, name: 'name', starting_after: 'starting_after' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('listPublic', async () => {
    const responsePromise = client.scenarios.listPublic();
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
    await expect(client.scenarios.listPublic({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('listPublic: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.scenarios.listPublic(
        { limit: 0, name: 'name', starting_after: 'starting_after' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('startRun: only required params', async () => {
    const responsePromise = client.scenarios.startRun({ scenario_id: 'scenario_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('startRun: required and optional params', async () => {
    const response = await client.scenarios.startRun({
      scenario_id: 'scenario_id',
      benchmark_run_id: 'benchmark_run_id',
      metadata: { foo: 'string' },
      run_name: 'run_name',
      runProfile: {
        envVars: { foo: 'string' },
        launchParameters: {
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
        purpose: 'purpose',
        secrets: { foo: 'string' },
      },
    });
  });
});
