import { SHORT_TIMEOUT, MEDIUM_TIMEOUT, uniqueName, makeClientSDK, cleanUpMcpConfig } from '../utils';
import { McpConfig, Devbox } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

/** Placeholder endpoint for config-only tests (create/update/list); no real MCP traffic. */
const MCP_CONFIG_TEST_ENDPOINT = 'https://mcp.example.com';

/** Repo for GitHub MCP tool-call tests (create_issue, etc.). Override with GITHUB_MCP_TEST_REPO. */
const GITHUB_MCP_TEST_REPO = process.env['GITHUB_MCP_TEST_REPO'] || 'runloopai/api-client-ts';

/** GitHub MCP server — used only where we run real MCP protocol tests from the devbox. */
const GITHUB_MCP_ENDPOINT = 'https://api.githubcopilot.com/mcp/';

describe('smoketest: object-oriented mcp config', () => {
  describe('mcp config lifecycle', () => {
    let mcpConfig: McpConfig | undefined;
    let mcpConfigId: string | undefined;

    beforeAll(async () => {
      mcpConfig = await sdk.mcpConfig.create({
        name: uniqueName('sdk-mcp-config'),
        endpoint: MCP_CONFIG_TEST_ENDPOINT,
        allowed_tools: ['*'],
        description: 'Test MCP config',
      });
      mcpConfigId = mcpConfig.id;
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      await cleanUpMcpConfig(mcpConfig);
    });

    test('create mcp config', async () => {
      expect(mcpConfig).toBeDefined();
      expect(mcpConfig!.id).toBeTruthy();
      expect(mcpConfigId).toBeTruthy();
    });

    test('get mcp config info', async () => {
      expect(mcpConfig).toBeDefined();
      const info = await mcpConfig!.getInfo();
      expect(info.id).toBe(mcpConfigId);
      expect(info.name).toContain('sdk-mcp-config');
      expect(info.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);
      expect(info.allowed_tools).toBeDefined();
      expect(info.allowed_tools).toContain('*');
      expect(info.description).toBe('Test MCP config');
      expect(info.create_time_ms).toBeDefined();
      expect(info.create_time_ms).toBeGreaterThan(0);
    });

    test('update mcp config', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        name: uniqueName('sdk-mcp-config-updated'),
        description: 'Updated test MCP config',
      });
      expect(updated.name).toContain('sdk-mcp-config-updated');
      expect(updated.description).toBe('Updated test MCP config');

      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-config-updated');
      expect(info.description).toBe('Updated test MCP config');
    });

    test('update mcp config - endpoint', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        endpoint: MCP_CONFIG_TEST_ENDPOINT,
      });
      expect(updated.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);

      const info = await mcpConfig!.getInfo();
      expect(info.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);
    });

    test('update mcp config - allowed_tools', async () => {
      expect(mcpConfig).toBeDefined();
      const updated = await mcpConfig!.update({
        allowed_tools: ['github.search_*', 'github.get_*'],
      });
      expect(updated.allowed_tools).toContain('github.search_*');
      expect(updated.allowed_tools).toContain('github.get_*');
      expect(updated.allowed_tools.length).toBe(2);

      const info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('github.search_*');
      expect(info.allowed_tools).toContain('github.get_*');
    });

    test('delete mcp config', async () => {
      expect(mcpConfig).toBeDefined();
      await mcpConfig!.delete();

      await expect(mcpConfig!.getInfo()).rejects.toBeDefined();

      mcpConfig = undefined;
    });
  });

  describe('mcp config list and retrieval', () => {
    test('list mcp configs', async () => {
      const configs = await sdk.mcpConfig.list({ limit: 10 });
      expect(Array.isArray(configs)).toBe(true);
    });

    test('get mcp config by ID', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-config-retrieve'),
          endpoint: MCP_CONFIG_TEST_ENDPOINT,
          allowed_tools: ['*'],
        });
        expect(mcpConfig?.id).toBeTruthy();

        const retrieved = sdk.mcpConfig.fromId(mcpConfig.id);
        expect(retrieved.id).toBe(mcpConfig.id);

        const info = await retrieved.getInfo();
        expect(info.id).toBe(mcpConfig.id);
        expect(info.name).toContain('sdk-mcp-config-retrieve');
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });
  });

  describe('mcp config allowed_tools configurations', () => {
    test('create config with wildcard all tools', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-wildcard-all'),
          endpoint: MCP_CONFIG_TEST_ENDPOINT,
          allowed_tools: ['*'],
        });
        const info = await mcpConfig.getInfo();
        expect(info.allowed_tools).toContain('*');
        expect(info.allowed_tools.length).toBe(1);
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config with specific tool patterns', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        const tools = ['github.search_*', 'github.get_*', 'slack.post_message'];
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-specific-tools'),
          endpoint: MCP_CONFIG_TEST_ENDPOINT,
          allowed_tools: tools,
        });
        const info = await mcpConfig.getInfo();
        expect(info.allowed_tools.length).toBe(tools.length);
        for (const tool of tools) {
          expect(info.allowed_tools).toContain(tool);
        }
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config with description', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-with-desc'),
          endpoint: MCP_CONFIG_TEST_ENDPOINT,
          allowed_tools: ['*'],
          description: 'An MCP config with a description',
        });
        const info = await mcpConfig.getInfo();
        expect(info.description).toBe('An MCP config with a description');
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });

    test('create config without description', async () => {
      let mcpConfig: McpConfig | undefined;
      try {
        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-no-desc'),
          endpoint: MCP_CONFIG_TEST_ENDPOINT,
          allowed_tools: ['*'],
        });
        const info = await mcpConfig.getInfo();
        expect(info.description === null || info.description === undefined).toBe(true);
      } finally {
        await cleanUpMcpConfig(mcpConfig);
      }
    });
  });

  describe('mcp config update operations', () => {
    let mcpConfig: McpConfig | undefined;

    beforeEach(async () => {
      mcpConfig = await sdk.mcpConfig.create({
        name: uniqueName('sdk-mcp-update-test'),
        endpoint: MCP_CONFIG_TEST_ENDPOINT,
        allowed_tools: ['*'],
      });
    });

    afterEach(async () => {
      await cleanUpMcpConfig(mcpConfig);
      mcpConfig = undefined;
    });

    test('update name only', async () => {
      const newName = uniqueName('sdk-mcp-updated-name');
      const updated = await mcpConfig!.update({ name: newName });
      expect(updated.name).toContain('sdk-mcp-updated-name');

      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-updated-name');
    });

    test('update description only', async () => {
      const updated = await mcpConfig!.update({ description: 'New description' });
      expect(updated.description).toBe('New description');

      const info = await mcpConfig!.getInfo();
      expect(info.description).toBe('New description');
    });

    test('update endpoint only', async () => {
      const updated = await mcpConfig!.update({ endpoint: MCP_CONFIG_TEST_ENDPOINT });
      expect(updated.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);

      const info = await mcpConfig!.getInfo();
      expect(info.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);
    });

    test('update allowed_tools only', async () => {
      const newTools = ['github.search_*', 'github.get_*'];
      const updated = await mcpConfig!.update({ allowed_tools: newTools });
      expect(updated.allowed_tools.length).toBe(newTools.length);
      for (const tool of newTools) {
        expect(updated.allowed_tools).toContain(tool);
      }

      const info = await mcpConfig!.getInfo();
      expect(info.allowed_tools.length).toBe(newTools.length);
    });

    test('update multiple fields at once', async () => {
      const updated = await mcpConfig!.update({
        name: uniqueName('sdk-mcp-multi-update'),
        description: 'Multi-update description',
        endpoint: MCP_CONFIG_TEST_ENDPOINT,
        allowed_tools: ['slack.*', 'github.get_*'],
      });

      expect(updated.name).toContain('sdk-mcp-multi-update');
      expect(updated.description).toBe('Multi-update description');
      expect(updated.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);
      expect(updated.allowed_tools.length).toBe(2);
      expect(updated.allowed_tools).toContain('slack.*');
      expect(updated.allowed_tools).toContain('github.get_*');

      const info = await mcpConfig!.getInfo();
      expect(info.name).toContain('sdk-mcp-multi-update');
      expect(info.description).toBe('Multi-update description');
      expect(info.endpoint).toBe(MCP_CONFIG_TEST_ENDPOINT);
    });

    test('update allowed_tools from wildcard to specific', async () => {
      let info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('*');

      const specificTools = ['github.search_repos', 'github.get_repo'];
      const updated = await mcpConfig!.update({ allowed_tools: specificTools });
      expect(updated.allowed_tools.length).toBe(specificTools.length);
      for (const tool of specificTools) {
        expect(updated.allowed_tools).toContain(tool);
      }

      info = await mcpConfig!.getInfo();
      expect(info.allowed_tools.length).toBe(specificTools.length);
    });

    test('update allowed_tools from specific to wildcard', async () => {
      await mcpConfig!.update({ allowed_tools: ['github.search_*'] });
      let info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('github.search_*');

      const updated = await mcpConfig!.update({ allowed_tools: ['*'] });
      expect(updated.allowed_tools).toContain('*');
      expect(updated.allowed_tools.length).toBe(1);

      info = await mcpConfig!.getInfo();
      expect(info.allowed_tools).toContain('*');
      expect(info.allowed_tools.length).toBe(1);
    });
  });

  // MCP hub protocol integration tests using the remote GitHub MCP server as a real upstream.
  // Endpoint: https://api.githubcopilot.com/mcp/ (trailing slash required).
  // Auth: GitHub PAT with repo scope. `gh auth token` (gho_) may also work.
  // Run: GITHUB_MCP_TOKEN=$(gh auth token) RUN_SMOKETESTS=1 yarn jest tests/smoketests/object-oriented/mcp-config.test.ts
  //
  // If Moxy returns 4xx: the upstream rejected the request (bad token, missing scopes, wrong URL).
  // If Moxy returns 502: the upstream returned a non-JSON/HTML response; verify the endpoint URL has a trailing slash.
  (process.env['RUN_SMOKETESTS'] && process.env['GITHUB_MCP_TOKEN'] ? describe : describe.skip)(
    'mcp hub protocol integration (github)',
    () => {
      let devbox: Devbox | undefined;
      let mcpConfig: McpConfig | undefined;
      const testSecretName = uniqueName('mcp-hub-github-secret');
      let mcpUrl: string;
      let mcpToken: string;

      /**
       * Send an MCP JSON-RPC request via curl inside the devbox.
       * Requests application/json only (no text/event-stream) so the chain prefers JSON responses.
       */
      const mcpRequest = async (
        body: object,
      ): Promise<{
        httpCode: number;
        jsonRpc: any;
        rawOutput: string;
        stderr: string;
      }> => {
        let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
        curlCmd += ` -w "\\nHTTP_CODE:%{http_code}"`;
        curlCmd += ` -X POST "${mcpUrl}"`;
        curlCmd += ` -H "Authorization: Bearer ${mcpToken}"`;
        curlCmd += ` -H "Content-Type: application/json"`;
        curlCmd += ` -H "Accept: application/json"`;
        const bodyJson = JSON.stringify(body).replace(/'/g, "'\\''");
        curlCmd += ` -d '${bodyJson}'`;

        const result = await devbox!.cmd.exec(curlCmd);
        const output = (await result.stdout()).trim();
        const err = (await result.stderr()).trim();

        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const responseBody = lines.join('\n');
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10) || 0;

        let jsonRpc: any = null;
        try {
          jsonRpc = JSON.parse(responseBody);
        } catch {
          const dataLines = responseBody
            .split('\n')
            .filter((line) => line.startsWith('data: '))
            .map((line) => line.substring(6));
          if (dataLines.length > 0) {
            try {
              jsonRpc = JSON.parse(dataLines[dataLines.length - 1]!);
            } catch {
              // Could not parse response
            }
          }
        }

        return { httpCode, jsonRpc, rawOutput: output, stderr: err };
      };

      /** Send an MCP JSON-RPC notification (fire-and-forget). */
      const mcpNotify = async (body: object): Promise<number> => {
        let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
        curlCmd += ` -o /dev/null -w "%{http_code}"`;
        curlCmd += ` -X POST "${mcpUrl}"`;
        curlCmd += ` -H "Authorization: Bearer ${mcpToken}"`;
        curlCmd += ` -H "Content-Type: application/json"`;
        curlCmd += ` -H "Accept: application/json"`;
        const bodyJson = JSON.stringify(body).replace(/'/g, "'\\''");
        curlCmd += ` -d '${bodyJson}'`;

        const result = await devbox!.cmd.exec(curlCmd);
        return parseInt((await result.stdout()).trim(), 10);
      };

      /** Initialize an MCP session: send initialize, assert success, send initialized notification. */
      const initMcpSession = async (): Promise<void> => {
        const initResponse = await mcpRequest({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'runloop-sdk-test', version: '1.0.0' },
          },
          id: 1,
        });

        if (initResponse.httpCode !== 200) {
          console.error(
            `MCP init failed (url=${mcpUrl}): httpCode=${initResponse.httpCode} stdout=${initResponse.rawOutput} stderr=${initResponse.stderr}`,
          );
        }
        expect(initResponse.httpCode).toBe(200);
        expect(initResponse.jsonRpc?.result).toBeDefined();

        await mcpNotify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        });
      };

      beforeAll(async () => {
        const githubToken = process.env['GITHUB_MCP_TOKEN']!;

        await sdk.api.secrets.create({
          name: testSecretName,
          value: githubToken,
        });

        mcpConfig = await sdk.mcpConfig.create({
          name: uniqueName('sdk-mcp-github'),
          endpoint: GITHUB_MCP_ENDPOINT,
          allowed_tools: ['*'],
          description: 'GitHub MCP server for integration tests',
        });

        devbox = await sdk.devbox.create({
          name: uniqueName('devbox-mcp-github'),
          launch_parameters: {
            resource_size_request: 'X_SMALL',
            keep_alive_time_seconds: 300,
          },
          mcp: {
            MCP_SECRET: {
              mcp_config: mcpConfig.id,
              secret: testSecretName,
            },
          },
        });

        const urlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
        const baseUrl = (await urlResult.stdout()).trim();
        // Use RL_MCP_URL as the server gives it (LooperConfig: dev = mcp-gateway.runloop.pro, prod = .ai).
        // Use as-is if already the full MCP endpoint (has path or ends with /mcp); else append /mcp.
        mcpUrl =
          baseUrl.endsWith('/mcp') || baseUrl.includes('.ai/') || baseUrl.includes('.pro/') ?
            baseUrl
          : `${baseUrl.replace(/\/$/, '')}/mcp`;

        const tokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
        mcpToken = (await tokenResult.stdout()).trim();

        expect(baseUrl).toBeTruthy();
        expect(mcpToken).toBeTruthy();
      }, MEDIUM_TIMEOUT);

      afterAll(async () => {
        if (devbox) {
          try {
            await devbox.shutdown();
          } catch {
            // Ignore shutdown errors
          }
        }
        await cleanUpMcpConfig(mcpConfig);
        try {
          await sdk.api.secrets.delete(testSecretName);
        } catch {
          // Ignore if already deleted
        }
      });

      test('environment variables are set', async () => {
        expect(mcpUrl).toBeTruthy();
        expect(mcpUrl.startsWith('http')).toBe(true);
        expect(mcpUrl.endsWith('/mcp')).toBe(true);
        expect(mcpToken).toBeTruthy();
      });

      test(
        'initialize MCP session',
        async () => {
          const initResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'runloop-sdk-test', version: '1.0.0' },
            },
            id: 1,
          });

          if (initResponse.httpCode !== 200) {
            console.error(
              `MCP init failed (url=${mcpUrl}): httpCode=${initResponse.httpCode} stdout=${initResponse.rawOutput} stderr=${initResponse.stderr}`,
            );
          }

          expect(initResponse.httpCode).toBe(200);
          expect(initResponse.jsonRpc).toBeDefined();
          expect(initResponse.jsonRpc.jsonrpc).toBe('2.0');
          expect(initResponse.jsonRpc.id).toBe(1);

          const result = initResponse.jsonRpc.result;
          expect(result).toBeDefined();
          expect(result.protocolVersion).toBeDefined();
          expect(typeof result.protocolVersion).toBe('string');
          expect(result.capabilities).toBeDefined();
          expect(result.serverInfo).toBeDefined();
          expect(result.serverInfo.name).toBeTruthy();
        },
        SHORT_TIMEOUT,
      );

      test(
        'list tools from upstream MCP server',
        async () => {
          await initMcpSession();

          const toolsResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'tools/list',
            id: 2,
          });

          if (toolsResponse.httpCode !== 200) {
            console.error(
              `MCP tools/list failed (url=${mcpUrl}): httpCode=${toolsResponse.httpCode} stdout=${toolsResponse.rawOutput} stderr=${toolsResponse.stderr}`,
            );
          }
          expect(toolsResponse.httpCode).toBe(200);
          expect(toolsResponse.jsonRpc).toBeDefined();
          expect(toolsResponse.jsonRpc.jsonrpc).toBe('2.0');
          expect(toolsResponse.jsonRpc.id).toBe(2);

          // GitHub MCP server should return a non-empty tools array
          const result = toolsResponse.jsonRpc.result;
          expect(result).toBeDefined();
          expect(Array.isArray(result.tools)).toBe(true);
          expect(result.tools.length).toBeGreaterThan(0);

          // Each tool should conform to the MCP Tool schema
          for (const tool of result.tools) {
            expect(tool.name).toBeTruthy();
            expect(typeof tool.name).toBe('string');
            if (tool.description) {
              expect(typeof tool.description).toBe('string');
            }
            if (tool.inputSchema) {
              expect(typeof tool.inputSchema).toBe('object');
            }
          }
        },
        SHORT_TIMEOUT,
      );

      test(
        'call tools via MCP tools/call (get_me + search_repositories)',
        async () => {
          await initMcpSession();

          // get_me — simple tool with no org restrictions
          const meResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: 'get_me',
              arguments: {},
            },
            id: 2,
          });

          if (meResponse.httpCode !== 200 || meResponse.jsonRpc?.error) {
            console.error(
              `get_me response: httpCode=${meResponse.httpCode} jsonRpc=${JSON.stringify(meResponse.jsonRpc)} raw=${meResponse.rawOutput}`,
            );
          }
          expect(meResponse.httpCode).toBe(200);
          expect(meResponse.jsonRpc?.error).toBeUndefined();
          expect(meResponse.jsonRpc?.result).toBeDefined();

          const meContent = meResponse.jsonRpc.result.content;
          expect(Array.isArray(meContent)).toBe(true);
          expect(meContent.length).toBeGreaterThan(0);
          expect(meContent[0].text).toBeDefined();

          const meData = JSON.parse(meContent[0].text);
          expect(meData.login).toBeTruthy();

          // search_repositories — verifies argument passing
          const [owner, repo] = GITHUB_MCP_TEST_REPO.split('/');
          const searchResponse = await mcpRequest({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: 'search_repositories',
              arguments: {
                query: `${owner}/${repo}`,
              },
            },
            id: 3,
          });

          if (searchResponse.httpCode !== 200 || searchResponse.jsonRpc?.error) {
            console.error(
              `search_repositories response: httpCode=${searchResponse.httpCode} jsonRpc=${JSON.stringify(searchResponse.jsonRpc)}`,
            );
          }
          expect(searchResponse.httpCode).toBe(200);
          expect(searchResponse.jsonRpc?.error).toBeUndefined();
          expect(searchResponse.jsonRpc?.result).toBeDefined();

          const searchContent = searchResponse.jsonRpc.result.content;
          expect(Array.isArray(searchContent)).toBe(true);
          expect(searchContent.length).toBeGreaterThan(0);

          const searchData = JSON.parse(searchContent[0].text);
          expect(searchData.total_count).toBeGreaterThan(0);
          const repoNames = searchData.items.map((r: any) => r.full_name);
          expect(repoNames).toContain(GITHUB_MCP_TEST_REPO);
        },
        MEDIUM_TIMEOUT,
      );

      test(
        'MCP hub rejects requests without authentication',
        async () => {
          const bodyJson = JSON.stringify({
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'unauthorized-test', version: '1.0.0' },
            },
            id: 1,
          }).replace(/'/g, "'\\''");

          let curlCmd = `curl -s --connect-timeout 10 --max-time 30`;
          curlCmd += ` -o /dev/null -w "%{http_code}"`;
          curlCmd += ` -X POST "${mcpUrl}"`;
          curlCmd += ` -H "Content-Type: application/json"`;
          curlCmd += ` -H "Accept: application/json"`;
          curlCmd += ` -d '${bodyJson}'`;

          const result = await devbox!.cmd.exec(curlCmd);
          const httpCode = parseInt((await result.stdout()).trim(), 10) || 0;
          expect(httpCode).toBeGreaterThanOrEqual(400);
          expect(httpCode).toBeLessThan(500);
        },
        SHORT_TIMEOUT,
      );
    },
  );

  // Devbox integration tests that verify MCP config wiring (env vars, by-name lookup).
  // These use fake endpoints -- they don't need a real upstream MCP server.
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('devbox with mcp config', () => {
    test(
      'create devbox with mcp config by name and verify env vars',
      async () => {
        let devbox: Devbox | undefined;
        let mcpConfig: McpConfig | undefined;
        const testSecretName = uniqueName('mcp-name-test-secret');

        try {
          await sdk.api.secrets.create({
            name: testSecretName,
            value: 'test-secret-value-for-mcp-name',
          });

          const mcpConfigName = uniqueName('sdk-mcp-byname-test');
          mcpConfig = await sdk.mcpConfig.create({
            name: mcpConfigName,
            endpoint: MCP_CONFIG_TEST_ENDPOINT,
            allowed_tools: ['*'],
          });

          devbox = await sdk.devbox.create({
            name: uniqueName('devbox-mcp-byname'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60,
            },
            mcp: {
              MCP_SECRET: {
                mcp_config: mcpConfigName,
                secret: testSecretName,
              },
            },
          });

          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          const urlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
          expect(urlResult.exitCode).toBe(0);
          const urlValue = (await urlResult.stdout()).trim();

          expect(urlValue).toBeTruthy();
          expect(urlValue.startsWith('http')).toBe(true);

          const tokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
          expect(tokenResult.exitCode).toBe(0);
          const tokenValue = (await tokenResult.stdout()).trim();
          expect(tokenValue).toBeTruthy();
        } finally {
          if (devbox) {
            try {
              await devbox.shutdown();
            } catch {
              // Ignore shutdown errors
            }
          }
          await cleanUpMcpConfig(mcpConfig);
          try {
            await sdk.api.secrets.delete(testSecretName);
          } catch {
            // Ignore if already deleted
          }
        }
      },
      MEDIUM_TIMEOUT,
    );

    test(
      'create devbox with mcp config and gateway config together',
      async () => {
        let devbox: Devbox | undefined;
        let mcpConfig: McpConfig | undefined;
        const mcpSecretName = uniqueName('mcp-combo-secret');
        const gatewaySecretName = uniqueName('gw-combo-secret');

        try {
          await sdk.api.secrets.create({
            name: mcpSecretName,
            value: 'test-mcp-secret-value',
          });
          await sdk.api.secrets.create({
            name: gatewaySecretName,
            value: 'test-gateway-secret-value',
          });

          mcpConfig = await sdk.mcpConfig.create({
            name: uniqueName('sdk-mcp-combo-test'),
            endpoint: MCP_CONFIG_TEST_ENDPOINT,
            allowed_tools: ['*'],
          });

          const gatewayConfig = await sdk.gatewayConfig.create({
            name: uniqueName('sdk-gw-combo-test'),
            endpoint: 'https://api.example.com',
            auth_mechanism: { type: 'bearer' },
          });

          try {
            devbox = await sdk.devbox.create({
              name: uniqueName('devbox-mcp-gw-combo'),
              launch_parameters: {
                resource_size_request: 'X_SMALL',
                keep_alive_time_seconds: 60,
              },
              mcp: {
                MCP_SECRET: {
                  mcp_config: mcpConfig.id,
                  secret: mcpSecretName,
                },
              },
              gateways: {
                MY_API: {
                  gateway: gatewayConfig.id,
                  secret: gatewaySecretName,
                },
              },
            });

            expect(devbox).toBeDefined();
            expect(devbox.id).toBeTruthy();

            // Verify both MCP and gateway environment variables are set
            const mcpUrlResult = await devbox.cmd.exec('echo $RL_MCP_URL');
            expect(mcpUrlResult.exitCode).toBe(0);
            const mcpUrlValue = (await mcpUrlResult.stdout()).trim();

            expect(mcpUrlValue).toBeTruthy();
            expect(mcpUrlValue.startsWith('http')).toBe(true);

            const mcpTokenResult = await devbox.cmd.exec('echo $RL_MCP_TOKEN');
            expect(mcpTokenResult.exitCode).toBe(0);
            const mcpTokenValue = (await mcpTokenResult.stdout()).trim();
            expect(mcpTokenValue).toBeTruthy();

            const gwUrlResult = await devbox.cmd.exec('echo $MY_API_URL');
            expect(gwUrlResult.exitCode).toBe(0);
            const gwUrlValue = (await gwUrlResult.stdout()).trim();
            expect(gwUrlValue).toBeTruthy();

            const gwSecretResult = await devbox.cmd.exec('echo $MY_API');
            expect(gwSecretResult.exitCode).toBe(0);
            const gwSecretValue = (await gwSecretResult.stdout()).trim();
            expect(gwSecretValue).toBeTruthy();
            expect(gwSecretValue.startsWith('gws_')).toBe(true);
          } finally {
            try {
              await gatewayConfig.delete();
            } catch {
              // Ignore cleanup errors
            }
          }
        } finally {
          if (devbox) {
            try {
              await devbox.shutdown();
            } catch {
              // Ignore shutdown errors
            }
          }
          await cleanUpMcpConfig(mcpConfig);
          try {
            await sdk.api.secrets.delete(mcpSecretName);
          } catch {
            // Ignore if already deleted
          }
          try {
            await sdk.api.secrets.delete(gatewaySecretName);
          } catch {
            // Ignore if already deleted
          }
        }
      },
      MEDIUM_TIMEOUT,
    );
  });
});
