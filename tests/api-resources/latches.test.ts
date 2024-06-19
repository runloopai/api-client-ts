// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from 'runloop';
import { Response } from 'node-fetch';

const runloop = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource latches', () => {
  test('fulfill: only required params', async () => {
    const responsePromise = runloop.latches.fulfill('string', { result: {} });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('fulfill: required and optional params', async () => {
    const response = await runloop.latches.fulfill('string', { result: {} });
  });
});
