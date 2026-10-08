// Remote-handler tests must not initialize the local Deno runtime.
jest.mock('@valtown/deno-http-worker', () => ({ newDenoHTTPWorker: jest.fn() }));
jest.mock('../src/code-tool-paths.cjs', () => ({ workerPath: 'unused' }), { virtual: true });

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { Runloop } from '@runloop/api-client';
import { codeTool } from '../src/code-tool';
import { blockedMethodsForCodeTool, sdkMethods } from '../src/methods';
import { configureLogger } from '../src/logger';
import type { McpOptions } from '../src/options';

configureLogger({ level: 'error', pretty: false });

const client = new Runloop({ bearerToken: 'synthetic', http2: false });

afterEach(() => jest.restoreAllMocks());

test('the generated catalog is current and resolves against the packaged API surface', () => {
  execFileSync(process.execPath, [path.resolve(__dirname, '../scripts/sync-sdk-methods.cjs'), '--check']);
  for (const method of sdkMethods) {
    let value: any = client;
    for (const segment of method.fullyQualifiedName.split('.')) value = value[segment];
    expect(typeof value).toBe('function');
  }
  expect(sdkMethods.some((method) => /benchmark|scenario/.test(method.fullyQualifiedName))).toBe(false);
});

test.each([
  [{ codeAllowedMethods: ['^secrets.updateById$'] }, 'secrets.updateById', false],
  [{ codeAllowedMethods: ['^secrets.updateById$'] }, 'secrets.update', true],
  [{ codeBlockedMethods: ['^secrets.deleteById$'] }, 'secrets.deleteById', true],
  [{ codeBlockedMethods: ['^secrets.deleteById$'] }, 'secrets.delete', false],
  [{ codeAllowHttpGets: true }, 'secrets.retrieveById', false],
  [{ codeAllowHttpGets: true }, 'secrets.updateById', true],
  [{ codeAllowHttpGets: true }, 'secrets.deleteById', true],
] as const)('configured handler %j: %s blocked=%s', async (options, method, blocked) => {
  const remote = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({
        is_error: false,
        result: 'ok',
        log_lines: [],
        err_lines: [],
      }),
    ),
  );
  const tool = codeTool({
    blockedMethods: blockedMethodsForCodeTool(options as McpOptions),
    codeExecutionMode: 'stainless-sandbox',
  });
  const result = await tool.handler({
    reqContext: { client },
    args: { code: `async function run(client) { return client.${method}('synthetic'); }` },
  });
  expect(Boolean(result.isError)).toBe(blocked);
  expect(remote).toHaveBeenCalledTimes(blocked ? 0 : 1);
});

test('catalog generation rejects empty, duplicate, and unrecognized method input', () => {
  const {
    parseApiMd,
  }: { parseApiMd: (text: string) => unknown } = require('../scripts/sync-sdk-methods.cjs');
  const method =
    '<code title="post /v1/secrets/id/{id}/update">client.secrets.<a href="secrets.ts">updateById</a>';
  expect(() => parseApiMd('no methods')).toThrow('no SDK methods');
  expect(() => parseApiMd(`${method}\n${method}`)).toThrow('duplicate method');
  expect(() => parseApiMd(`${method}\n<code title="newverb /v1/test">client.test.call()`)).toThrow(
    'unrecognized SDK method',
  );
});
