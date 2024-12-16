// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Runloop from '@runloop/api-client';
import { Response } from 'node-fetch';

const client = new Runloop({
  bearerToken: 'My Bearer Token',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource lsp', () => {
  test('applyCodeAction: only required params', async () => {
    const responsePromise = client.devboxes.lsp.applyCodeAction('id', { title: 'title' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('applyCodeAction: required and optional params', async () => {
    const response = await client.devboxes.lsp.applyCodeAction('id', {
      title: 'title',
      command: { command: 'command', title: 'title', arguments: [{}] },
      edit: {
        changes: {
          foo: [
            {
              newText: 'newText',
              range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
            },
          ],
        },
      },
      isPreferred: true,
    });
  });

  test('codeActions: only required params', async () => {
    const responsePromise = client.devboxes.lsp.codeActions('id', { uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('codeActions: required and optional params', async () => {
    const response = await client.devboxes.lsp.codeActions('id', {
      uri: 'uri',
      context: {
        diagnostics: [
          {
            message: 'message',
            range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
            code: 0,
            codeDescription: { href: 'href' },
            data: {},
            relatedInformation: [
              {
                location: {
                  range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
                  uri: 'uri',
                },
                message: 'message',
              },
            ],
            severity: 1,
            source: 'source',
            tags: [1],
          },
        ],
        only: ['string'],
        triggerKind: 1,
      },
      range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
    });
  });

  test('diagnostics: only required params', async () => {
    const responsePromise = client.devboxes.lsp.diagnostics('id', { uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('diagnostics: required and optional params', async () => {
    const response = await client.devboxes.lsp.diagnostics('id', { uri: 'uri' });
  });

  test('documentSymbols: only required params', async () => {
    const responsePromise = client.devboxes.lsp.documentSymbols('id', { uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('documentSymbols: required and optional params', async () => {
    const response = await client.devboxes.lsp.documentSymbols('id', { uri: 'uri' });
  });

  test('file: only required params', async () => {
    const responsePromise = client.devboxes.lsp.file('id', { path: 'path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('file: required and optional params', async () => {
    const response = await client.devboxes.lsp.file('id', { path: 'path' });
  });

  test('fileDefinition: only required params', async () => {
    const responsePromise = client.devboxes.lsp.fileDefinition('id', { character: 0, line: 0, uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('fileDefinition: required and optional params', async () => {
    const response = await client.devboxes.lsp.fileDefinition('id', { character: 0, line: 0, uri: 'uri' });
  });

  test('files', async () => {
    const responsePromise = client.devboxes.lsp.files('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('files: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.lsp.files('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('formatting: only required params', async () => {
    const responsePromise = client.devboxes.lsp.formatting('id', { uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('formatting: required and optional params', async () => {
    const response = await client.devboxes.lsp.formatting('id', { uri: 'uri' });
  });

  test('getCodeActionsForDiagnostic: only required params', async () => {
    const responsePromise = client.devboxes.lsp.getCodeActionsForDiagnostic('id', {
      diagnostic: {
        message: 'message',
        range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
      },
      uri: 'uri',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('getCodeActionsForDiagnostic: required and optional params', async () => {
    const response = await client.devboxes.lsp.getCodeActionsForDiagnostic('id', {
      diagnostic: {
        message: 'message',
        range: { end: { character: 0, line: 0 }, start: { character: 0, line: 0 } },
        code: 0,
        severity: 1,
        source: 'source',
      },
      uri: 'uri',
    });
  });

  test('getCodeSegmentInfo: only required params', async () => {
    const responsePromise = client.devboxes.lsp.getCodeSegmentInfo('id', {
      symbolName: 'symbolName',
      uri: 'uri',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('getCodeSegmentInfo: required and optional params', async () => {
    const response = await client.devboxes.lsp.getCodeSegmentInfo('id', {
      symbolName: 'symbolName',
      uri: 'uri',
      symbolType: 'function',
    });
  });

  test('getSignatureHelp: only required params', async () => {
    const responsePromise = client.devboxes.lsp.getSignatureHelp('id', { character: 0, line: 0, uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('getSignatureHelp: required and optional params', async () => {
    const response = await client.devboxes.lsp.getSignatureHelp('id', { character: 0, line: 0, uri: 'uri' });
  });

  test('health', async () => {
    const responsePromise = client.devboxes.lsp.health('id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('health: request options instead of params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(client.devboxes.lsp.health('id', { path: '/_stainless_unknown_path' })).rejects.toThrow(
      Runloop.NotFoundError,
    );
  });

  test('references: only required params', async () => {
    const responsePromise = client.devboxes.lsp.references('id', { character: 0, line: 0, uri: 'uri' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('references: required and optional params', async () => {
    const response = await client.devboxes.lsp.references('id', { character: 0, line: 0, uri: 'uri' });
  });

  test('setWatchDirectory: only required params', async () => {
    const responsePromise = client.devboxes.lsp.setWatchDirectory('id', { path: 'path' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('setWatchDirectory: required and optional params', async () => {
    const response = await client.devboxes.lsp.setWatchDirectory('id', { path: 'path' });
  });
});
