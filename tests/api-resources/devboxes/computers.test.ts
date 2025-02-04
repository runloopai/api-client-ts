// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource computers', () => {
  test('create', async () => {
    const responsePromise = client.devboxes.computers.create();
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
    await expect(client.devboxes.computers.create({ path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('create: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.devboxes.computers.create(
        { display_dimensions: { display_height_px: 0, display_width_px: 0 }, name: 'name' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Runloop.NotFoundError);
  });

  test('keyboardInteraction: only required params', async () => {
    const responsePromise = client.devboxes.computers.keyboardInteraction('id', { action: 'key' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('keyboardInteraction: required and optional params', async () => {
    const response = await client.devboxes.computers.keyboardInteraction('id', {
      action: 'key',
      text: 'text',
    });
  });

  test('mouseInteraction: only required params', async () => {
    const responsePromise = client.devboxes.computers.mouseInteraction('id', { action: 'mouse_move' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('mouseInteraction: required and optional params', async () => {
    const response = await client.devboxes.computers.mouseInteraction('id', {
      action: 'mouse_move',
      coordinate: { x: 0, y: 0 },
    });
  });

  test('screenInteraction: only required params', async () => {
    const responsePromise = client.devboxes.computers.screenInteraction('id', { action: 'screenshot' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('screenInteraction: required and optional params', async () => {
    const response = await client.devboxes.computers.screenInteraction('id', { action: 'screenshot' });
  });
});
