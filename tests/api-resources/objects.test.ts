// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Runloop } from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource objects', () => {
  test('create: only required params', async () => {
    const responsePromise = client.objects.create({ content_type: 'unspecified', name: 'name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: required and optional params', async () => {
    const response = await client.objects.create({
      content_type: 'unspecified',
      name: 'name',
      metadata: { foo: 'string' },
      ttl_ms: 0,
    });
  });

  test('retrieve', async () => {
    const responsePromise = client.objects.retrieve('id');
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
    await expect(client.objects.retrieve('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list', async () => {
    const responsePromise = client.objects.list();
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
    await expect(client.objects.list({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.objects.list(
        {
          content_type: 'unspecified',
          limit: 0,
          name: 'name',
          search: 'search',
          starting_after: 'starting_after',
          state: 'UPLOADING',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('delete', async () => {
    const responsePromise = client.objects.delete('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('delete: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.objects.delete('id', {}, { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('complete', async () => {
    const responsePromise = client.objects.complete('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('complete: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.objects.complete('id', {}, { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('download', async () => {
    const responsePromise = client.objects.download('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('download: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.objects.download('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('download: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.objects.download('id', { duration_seconds: 0 }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('listPublic', async () => {
    const responsePromise = client.objects.listPublic();
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
    await expect(client.objects.listPublic({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('listPublic: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.objects.listPublic(
        {
          content_type: 'unspecified',
          limit: 0,
          name: 'name',
          search: 'search',
          starting_after: 'starting_after',
          state: 'UPLOADING',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });
});
