import {
  SHORT_TIMEOUT,
  MEDIUM_TIMEOUT,
  uniqueName,
  makeClientSDK,
  cleanUpGatewayConfig,
  cleanUpPolicy,
} from '../utils';
import { GatewayConfig, Devbox, NetworkPolicy } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented gateway config', () => {
  describe('gateway config lifecycle', () => {
    let gatewayConfig: GatewayConfig | undefined;
    let gatewayConfigId: string | undefined;

    // Create gateway config in beforeAll to avoid test order dependency
    beforeAll(async () => {
      gatewayConfig = await sdk.gatewayConfig.create({
        name: uniqueName('sdk-gateway-config'),
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
        description: 'Test gateway config',
      });
      gatewayConfigId = gatewayConfig.id;
    }, SHORT_TIMEOUT);

    afterAll(async () => {
      await cleanUpGatewayConfig(gatewayConfig);
    });

    test('create gateway config', async () => {
      // Gateway config was created in beforeAll - just verify it exists
      expect(gatewayConfig).toBeDefined();
      expect(gatewayConfig!.id).toBeTruthy();
      expect(gatewayConfigId).toBeTruthy();
    });

    test('get gateway config info', async () => {
      expect(gatewayConfig).toBeDefined();
      const info = await gatewayConfig!.getInfo();
      expect(info.id).toBe(gatewayConfigId);
      expect(info.name).toContain('sdk-gateway-config');
      expect(info.endpoint).toBe('https://api.example.com');
      expect(info.auth_mechanism).toBeDefined();
      expect(info.auth_mechanism.type).toBe('bearer');
      expect(info.description).toBe('Test gateway config');
    });

    test('update gateway config', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        name: uniqueName('sdk-gateway-config-updated'),
        description: 'Updated test gateway config',
      });
      expect(updated.name).toContain('sdk-gateway-config-updated');
      expect(updated.description).toBe('Updated test gateway config');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.name).toContain('sdk-gateway-config-updated');
      expect(info.description).toBe('Updated test gateway config');
    });

    test('update gateway config - endpoint', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        endpoint: 'https://api.updated-example.com',
      });
      expect(updated.endpoint).toBe('https://api.updated-example.com');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.endpoint).toBe('https://api.updated-example.com');
    });

    test('update gateway config - auth_mechanism', async () => {
      expect(gatewayConfig).toBeDefined();
      const updated = await gatewayConfig!.update({
        auth_mechanism: { type: 'header', key: 'x-api-key' },
      });
      expect(updated.auth_mechanism.type).toBe('header');
      expect(updated.auth_mechanism.key).toBe('x-api-key');

      // Verify the update persisted
      const info = await gatewayConfig!.getInfo();
      expect(info.auth_mechanism.type).toBe('header');
      expect(info.auth_mechanism.key).toBe('x-api-key');
    });

    test('delete gateway config', async () => {
      expect(gatewayConfig).toBeDefined();
      await gatewayConfig!.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await gatewayConfig!.getInfo();
        fail('Expected gateway config to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Mark as deleted so afterAll doesn't try to delete again
      gatewayConfig = undefined;
    });
  });

  describe('gateway config list and retrieval', () => {
    test('list gateway configs', async () => {
      const configs = await sdk.gatewayConfig.list({ limit: 10 });
      expect(Array.isArray(configs)).toBe(true);
      // Should include system-provided configs like 'anthropic' and 'openai'
    });

    test('get gateway config by ID', async () => {
      // First create a gateway config
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-config-retrieve'),
          endpoint: 'https://api.retrieve-test.com',
          auth_mechanism: { type: 'bearer' },
        });
        expect(gatewayConfig?.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.gatewayConfig.fromId(gatewayConfig.id);
        expect(retrieved.id).toBe(gatewayConfig.id);

        // Verify we can get info
        const info = await retrieved.getInfo();
        expect(info.id).toBe(gatewayConfig.id);
        expect(info.name).toContain('sdk-gateway-config-retrieve');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });
  });

  describe('gateway config auth mechanisms', () => {
    test('create gateway config with bearer auth and verify roundtrip', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-bearer'),
          endpoint: 'https://api.bearer-test.com',
          auth_mechanism: { type: 'bearer' as const },
        });
        const info = await gatewayConfig.getInfo();

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('bearer');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });

    test('create gateway config with header auth and verify roundtrip', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-header'),
          endpoint: 'https://api.header-test.com',
          auth_mechanism: { type: 'header' as const, key: 'x-api-key' },
        });
        const info = await gatewayConfig.getInfo();

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('header');
        expect(info.auth_mechanism.key).toBe('x-api-key');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });

    test('create gateway config with Authorization header auth', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-auth-header'),
          endpoint: 'https://api.auth-header-test.com',
          auth_mechanism: { type: 'header' as const, key: 'Authorization' },
        });
        const info = await gatewayConfig.getInfo();

        expect(info.auth_mechanism).toBeDefined();
        expect(info.auth_mechanism.type).toBe('header');
        expect(info.auth_mechanism.key).toBe('Authorization');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });
  });

  // Test devbox creation with gateway config and secret
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('devbox with gateway config and secret', () => {
    test(
      'create devbox with gateway spec and verify environment variables',
      async () => {
        let devbox: Devbox | undefined;
        let gatewayConfig: GatewayConfig | undefined;
        const testSecretName = uniqueName('gateway-devbox-test-secret');

        try {
          // Create a secret for this test
          await sdk.api.secrets.create({
            name: testSecretName,
            value: 'test-secret-value-for-gateway',
          });

          // Create a custom gateway config for testing
          gatewayConfig = await sdk.gatewayConfig.create({
            name: uniqueName('sdk-gateway-devbox-test'),
            endpoint: 'https://api.anthropic.com',
            auth_mechanism: { type: 'header', key: 'x-api-key' },
            description: 'Gateway config for devbox test',
          });

          // Create a devbox with the gateway spec
          devbox = await sdk.devbox.create({
            name: uniqueName('devbox-with-gateway'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60,
            },
            gateways: {
              ANTHROPIC: {
                gateway: gatewayConfig.id,
                secret: testSecretName,
              },
            },
          });

          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          // Get devbox info and verify gateway spec is present
          const info = await devbox.getInfo();
          expect(info.gateway_specs).toBeDefined();
          expect(info.gateway_specs?.['ANTHROPIC']).toBeDefined();
          expect(info.gateway_specs?.['ANTHROPIC']?.gateway_config_id).toBe(gatewayConfig.id);

          // Verify environment variables are set correctly using exec
          // ANTHROPIC_URL should contain the gateway URL
          const urlResult = await devbox.cmd.exec('echo $ANTHROPIC_URL');
          expect(urlResult.exitCode).toBe(0);
          const urlValue = (await urlResult.stdout()).trim();
          expect(urlValue).toBeTruthy();
          expect(urlValue.startsWith('http')).toBe(true);

          // ANTHROPIC should start with 'gws_' (gateway secret token)
          const secretResult = await devbox.cmd.exec('echo $ANTHROPIC');
          expect(secretResult.exitCode).toBe(0);
          const secretValue = (await secretResult.stdout()).trim();
          expect(secretValue).toBeTruthy();
          expect(secretValue.startsWith('gws_')).toBe(true);
        } finally {
          // Clean up
          if (devbox) {
            try {
              await devbox.shutdown();
            } catch {
              // Ignore shutdown errors
            }
          }
          await cleanUpGatewayConfig(gatewayConfig);
          // Clean up the secret
          try {
            await sdk.api.secrets.delete(testSecretName);
          } catch {
            // Ignore if already deleted
          }
        }
      },
      MEDIUM_TIMEOUT,
    );
  });

  // Comprehensive end-to-end gateway tests
  // Tests various HTTP methods, request types, and response handling through the gateway
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)(
    'comprehensive gateway proxying tests',
    () => {
      let devbox: Devbox | undefined;
      let gatewayConfig: GatewayConfig | undefined;
      let networkPolicy: NetworkPolicy | undefined;
      const testSecretName = uniqueName('e2e-runloop-api-key');
      let gatewayUrl: string;
      let gatewayToken: string;

      // Helper to make curl requests through the gateway
      const curlRequest = async (
        method: string,
        path: string,
        options: {
          body?: string;
          contentType?: string;
          extraHeaders?: string[];
        } = {},
      ) => {
        const { body, contentType, extraHeaders = [] } = options;

        let curlCmd = `curl -s -w "\\nHTTP_CODE:%{http_code}" -X ${method}`;
        curlCmd += ` -H "Authorization: Bearer ${gatewayToken}"`;

        if (contentType) {
          curlCmd += ` -H "Content-Type: ${contentType}"`;
        }

        for (const header of extraHeaders) {
          curlCmd += ` -H "${header}"`;
        }

        if (body) {
          const escapedBody = body.replace(/'/g, "'\\''");
          curlCmd += ` -d '${escapedBody}'`;
        }

        curlCmd += ` "${gatewayUrl}${path}"`;

        const result = await devbox!.cmd.exec(curlCmd);
        const output = (await result.stdout()).trim();

        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const responseBody = lines.join('\n');
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        return { httpCode, responseBody, exitCode: result.exitCode };
      };

      beforeAll(async () => {
        const runloopApiKey = process.env['RUNLOOP_API_KEY'];
        expect(runloopApiKey).toBeTruthy();

        const baseUrl = process.env['RUNLOOP_BASE_URL'] || 'https://api.runloop.ai';

        networkPolicy = await sdk.networkPolicy.create({
          name: uniqueName('e2e-gateway-policy'),
          allow_all: true,
          description: 'Allow all traffic for comprehensive gateway tests',
        });

        await sdk.api.secrets.create({
          name: testSecretName,
          value: runloopApiKey!,
        });

        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('e2e-runloop-gateway'),
          endpoint: baseUrl,
          auth_mechanism: { type: 'bearer' },
          description: 'Gateway config for comprehensive e2e tests',
        });

        devbox = await sdk.devbox.create({
          name: uniqueName('e2e-gateway-devbox'),
          launch_parameters: {
            resource_size_request: 'X_SMALL',
            keep_alive_time_seconds: 300,
          },
          gateways: {
            RUNLOOP: {
              gateway: gatewayConfig.id,
              secret: testSecretName,
            },
          },
        });

        const urlResult = await devbox.cmd.exec('echo $RUNLOOP_URL');
        gatewayUrl = (await urlResult.stdout()).trim();

        const tokenResult = await devbox.cmd.exec('echo $RUNLOOP');
        gatewayToken = (await tokenResult.stdout()).trim();

        expect(gatewayUrl).toBeTruthy();
        expect(gatewayToken.startsWith('gws_')).toBe(true);
      }, MEDIUM_TIMEOUT);

      afterAll(async () => {
        if (devbox) {
          try {
            await devbox.shutdown();
          } catch {
            // Ignore
          }
        }

        await cleanUpGatewayConfig(gatewayConfig);
        await cleanUpPolicy(networkPolicy);

        try {
          await sdk.api.secrets.delete(testSecretName);
        } catch {
          // Ignore
        }
      });

      test('GET request - list devboxes', async () => {
        const { httpCode, responseBody } = await curlRequest('GET', '/v1/devboxes?limit=5');

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
        expect(Array.isArray(response.devboxes)).toBe(true);
      });

      test('GET request - get specific resource', async () => {
        const { httpCode, responseBody } = await curlRequest('GET', `/v1/devboxes/${devbox!.id}`);

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response.id).toBe(devbox!.id);
      });

      test('GET request - error for non-existent resource', async () => {
        const { httpCode } = await curlRequest('GET', '/v1/devboxes/dbx_nonexistent12345');

        expect(httpCode).toBe(400);
      });

      test('POST request - create a secret', async () => {
        const secretName = uniqueName('gateway-test-secret');
        const secretValue = 'test-value-from-gateway';

        const createResult = await curlRequest('POST', '/v1/secrets', {
          body: JSON.stringify({ name: secretName, value: secretValue }),
          contentType: 'application/json',
        });

        expect(createResult.httpCode).toBe(200);
        const created = JSON.parse(createResult.responseBody);
        expect(created.name).toBe(secretName);
      });

      test('POST request with JSON body - create blueprint', async () => {
        const blueprintName = uniqueName('gateway-test-blueprint');

        const createResult = await curlRequest('POST', '/v1/blueprints', {
          body: JSON.stringify({
            name: blueprintName,
            system_setup_commands: ['echo "test"'],
          }),
          contentType: 'application/json',
        });

        expect(createResult.httpCode).toBe(200);
        const created = JSON.parse(createResult.responseBody);
        expect(created.name).toBe(blueprintName);
      });

      test('GET request with query parameters', async () => {
        const { httpCode, responseBody } = await curlRequest(
          'GET',
          '/v1/devboxes?limit=2&status=running',
        );

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
        expect(Array.isArray(response.devboxes)).toBe(true);
        for (const dbx of response.devboxes) {
          expect(dbx.status).toBe('running');
        }
      });

      test('custom headers are passed through', async () => {
        const { httpCode, responseBody } = await curlRequest('GET', '/v1/devboxes?limit=1', {
          extraHeaders: ['X-Custom-Header: test-value', 'Accept: application/json'],
        });

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
      });

      test('large response handling - list many devboxes', async () => {
        const { httpCode, responseBody } = await curlRequest('GET', '/v1/devboxes?limit=100');

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
        expect(Array.isArray(response.devboxes)).toBe(true);
      });

      test('invalid JSON body returns error', async () => {
        const { httpCode } = await curlRequest('POST', '/v1/secrets', {
          body: 'not valid json{{{',
          contentType: 'application/json',
        });

        expect(httpCode).toBeGreaterThanOrEqual(400);
        expect(httpCode).toBeLessThan(500);
      });

      test('unauthorized request without token fails', async () => {
        const result = await devbox!.cmd.exec(
          `curl -s -w "\\nHTTP_CODE:%{http_code}" "${gatewayUrl}/v1/devboxes?limit=1"`,
        );
        const output = (await result.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect(httpCode).toBeGreaterThanOrEqual(400);
      });

      test('streaming response - execute command with output', async () => {
        const execResult = await devbox!.cmd.exec(`
          curl -s -w "\\nHTTP_CODE:%{http_code}" \\
            -X POST \\
            -H "Authorization: Bearer ${gatewayToken}" \\
            -H "Content-Type: application/json" \\
            -d '{"command": "echo line1; sleep 0.1; echo line2; sleep 0.1; echo line3"}' \\
            "${gatewayUrl}/v1/devboxes/${devbox!.id}/execute_sync"
        `);

        const output = (await execResult.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const responseBody = lines.join('\n');
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
        expect(response.stdout || response.output).toBeTruthy();
      });

      test('multipart form data - upload file via upload_file endpoint', async () => {
        const testFilePath = `gateway-multipart-test-${Date.now()}.txt`;
        const testFileContent = 'Hello from gateway multipart test!';

        await devbox!.cmd.exec(`echo '${testFileContent}' > /tmp/upload_test.txt`);

        const uploadResult = await devbox!.cmd.exec(`
          curl -s -w "\\nHTTP_CODE:%{http_code}" \\
            -X POST \\
            -H "Authorization: Bearer ${gatewayToken}" \\
            -F "file=@/tmp/upload_test.txt" \\
            -F "path=${testFilePath}" \\
            "${gatewayUrl}/v1/devboxes/${devbox!.id}/upload_file"
        `);

        const output = (await uploadResult.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect(httpCode).toBe(200);

        const verifyResult = await devbox!.cmd.exec(`cat ~/${testFilePath}`);
        const verifyContent = (await verifyResult.stdout()).trim();
        expect(verifyContent).toContain('Hello from gateway multipart test');
      });

      test('binary data - download file contents', async () => {
        const testFileName = `/tmp/gateway-binary-test-${Date.now()}.txt`;

        await curlRequest('POST', `/v1/devboxes/${devbox!.id}/write_file`, {
          body: JSON.stringify({
            file_path: testFileName,
            contents: 'Test binary content: special chars <>&"\' and unicode: 你好',
          }),
          contentType: 'application/json',
        });

        const { httpCode, responseBody } = await curlRequest(
          'POST',
          `/v1/devboxes/${devbox!.id}/read_file_contents`,
          {
            body: JSON.stringify({ file_path: testFileName }),
            contentType: 'application/json',
          },
        );

        expect(httpCode).toBe(200);
        expect(responseBody).toContain('special chars');
        expect(responseBody).toContain('你好');
      });

      test('large request body', async () => {
        const largeContent = 'x'.repeat(100 * 1024);
        const testFileName = `/tmp/gateway-large-body-${Date.now()}.txt`;

        const { httpCode } = await curlRequest('POST', `/v1/devboxes/${devbox!.id}/write_file`, {
          body: JSON.stringify({
            file_path: testFileName,
            contents: largeContent,
          }),
          contentType: 'application/json',
        });

        expect(httpCode).toBe(200);

        const sizeResult = await devbox!.cmd.exec(`wc -c < ${testFileName}`);
        const size = parseInt((await sizeResult.stdout()).trim(), 10);
        expect(size).toBe(largeContent.length);
      });

      test('special characters in URL path and query params', async () => {
        const specialName = uniqueName('gateway-special-!@#');

        const createResult = await curlRequest('POST', '/v1/secrets', {
          body: JSON.stringify({ name: specialName, value: 'test-value' }),
          contentType: 'application/json',
        });

        if (createResult.httpCode === 200) {
          await curlRequest('DELETE', `/v1/secrets/${encodeURIComponent(specialName)}`);
        }

        const { httpCode } = await curlRequest(
          'GET',
          `/v1/devboxes?limit=1&name=${encodeURIComponent('test with spaces & symbols')}`,
        );
        expect(httpCode).toBeLessThan(500);
      });

      test('concurrent requests', async () => {
        const concurrentScript = `bash -c '
          for i in 1 2 3; do
            (curl -s -o /dev/null -w "%{http_code}\\n" \\
              -H "Authorization: Bearer ${gatewayToken}" \\
              "${gatewayUrl}/v1/devboxes?limit=1") &
          done
          wait
        '`;

        const result = await devbox!.cmd.exec(concurrentScript);
        const output = (await result.stdout()).trim();
        const responseCodes = output.split('\n').filter((line) => /^\d{3}$/.test(line.trim()));

        expect(responseCodes.length).toBeGreaterThanOrEqual(1);
        for (const code of responseCodes) {
          expect(parseInt(code, 10)).toBe(200);
        }
      });

      test('HEAD request', async () => {
        const result = await devbox!.cmd.exec(`
          curl -s -I -w "\\nHTTP_CODE:%{http_code}" \\
            -H "Authorization: Bearer ${gatewayToken}" \\
            "${gatewayUrl}/v1/devboxes?limit=1"
        `);

        const output = (await result.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect([200, 405]).toContain(httpCode);
      });

      test('request timeout handling', async () => {
        const startTime = Date.now();
        const { httpCode } = await curlRequest(
          'POST',
          `/v1/devboxes/${devbox!.id}/execute_sync`,
          {
            body: JSON.stringify({ command: 'sleep 2 && echo done' }),
            contentType: 'application/json',
          },
        );
        const elapsed = Date.now() - startTime;

        expect(httpCode).toBe(200);
        expect(elapsed).toBeGreaterThan(2000);
        expect(elapsed).toBeLessThan(30000);
      });

      test('empty/minimal response body handling', async () => {
        // API requires limit > 0; use limit=1 for a minimal response body
        const { httpCode, responseBody } = await curlRequest('GET', '/v1/devboxes?limit=1');

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response.devboxes).toBeDefined();
      });

      test('response with various content types', async () => {
        const { httpCode } = await curlRequest('GET', '/v1/devboxes?limit=1', {
          extraHeaders: ['Accept: application/json'],
        });

        expect(httpCode).toBe(200);
      });

      test('unicode in request and response', async () => {
        const unicodeContent = '你好世界 🌍 émojis and spëcial çharacters';
        const testFileName = `/tmp/gateway-unicode-${Date.now()}.txt`;

        const { httpCode } = await curlRequest('POST', `/v1/devboxes/${devbox!.id}/write_file`, {
          body: JSON.stringify({
            file_path: testFileName,
            contents: unicodeContent,
          }),
          contentType: 'application/json',
        });

        expect(httpCode).toBe(200);

        const readResult = await curlRequest('POST', `/v1/devboxes/${devbox!.id}/read_file_contents`, {
          body: JSON.stringify({ file_path: testFileName }),
          contentType: 'application/json',
        });

        expect(readResult.httpCode).toBe(200);
        expect(readResult.responseBody).toContain('你好世界');
        expect(readResult.responseBody).toContain('🌍');
      });
    },
  );

  // Tests for gateway config with network policy interactions
  // Uses a shared devbox setup similar to 'comprehensive gateway proxying tests'
  //
  // KNOWN LIMITATION: As of this writing, gateway URLs (e.g., gateway.runloop.pro)
  // are not accessible from devboxes that have network policies applied, even with
  // allow_all: true. The gateway service runs on internal infrastructure and network
  // policies may not properly whitelist access to it. The setup tests below verify
  // that devboxes can be created with both gateway configs and network policies,
  // and that the configuration is properly applied. The actual gateway request tests
  // are skipped until the backend infrastructure supports this combination.
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)(
    'gateway config with network policy',
    () => {
      let devbox: Devbox | undefined;
      let gatewayConfig: GatewayConfig | undefined;
      let networkPolicy: NetworkPolicy | undefined;
      const testSecretName = uniqueName('gw-np-test-secret');
      let gatewayUrl: string;
      let gatewayToken: string;

      beforeAll(async () => {
        const runloopApiKey = process.env['RUNLOOP_API_KEY'];
        expect(runloopApiKey).toBeTruthy();
        const baseUrl = process.env['RUNLOOP_BASE_URL'] || 'https://api.runloop.ai';

        // Create network policy with allow_all for this test suite
        networkPolicy = await sdk.networkPolicy.create({
          name: uniqueName('gw-np-test-policy'),
          allow_all: true,
          description: 'Network policy for gateway + network policy tests',
        });

        // Create secret for gateway auth
        await sdk.api.secrets.create({
          name: testSecretName,
          value: runloopApiKey!,
        });

        // Create gateway config
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('gw-np-test-gateway'),
          endpoint: baseUrl,
          auth_mechanism: { type: 'bearer' },
        });

        // Create devbox with both gateway and network policy
        devbox = await sdk.devbox.create({
          name: uniqueName('gw-np-test-devbox'),
          launch_parameters: {
            resource_size_request: 'X_SMALL',
            keep_alive_time_seconds: 300,
            network_policy_id: networkPolicy.id,
          },
          gateways: {
            RUNLOOP: {
              gateway: gatewayConfig.id,
              secret: testSecretName,
            },
          },
        });

        // Get gateway URL and token
        const urlResult = await devbox.cmd.exec('echo $RUNLOOP_URL');
        gatewayUrl = (await urlResult.stdout()).trim();

        const tokenResult = await devbox.cmd.exec('echo $RUNLOOP');
        gatewayToken = (await tokenResult.stdout()).trim();

        expect(gatewayUrl).toBeTruthy();
        expect(gatewayToken.startsWith('gws_')).toBe(true);
      }, MEDIUM_TIMEOUT);

      afterAll(async () => {
        if (devbox) {
          try {
            await devbox.shutdown();
          } catch {
            // Ignore
          }
        }
        await cleanUpGatewayConfig(gatewayConfig);
        await cleanUpPolicy(networkPolicy);
        try {
          await sdk.api.secrets.delete(testSecretName);
        } catch {
          // Ignore
        }
      });

      test('devbox with network policy and gateway can be created', async () => {
        expect(devbox).toBeDefined();
        expect(devbox!.id).toBeTruthy();
      });

      test('devbox has network policy applied', async () => {
        expect(devbox).toBeDefined();
        const info = await devbox!.getInfo();
        expect(info.launch_parameters.network_policy_id).toBe(networkPolicy!.id);
      });

      test('devbox has gateway config applied', async () => {
        expect(devbox).toBeDefined();
        const info = await devbox!.getInfo();
        expect(info.gateway_specs).toBeDefined();
        expect(info.gateway_specs?.['RUNLOOP']).toBeDefined();
        expect(info.gateway_specs?.['RUNLOOP']?.gateway_config_id).toBe(gatewayConfig!.id);
      });

      test('gateway env vars are set correctly', async () => {
        expect(gatewayUrl).toBeTruthy();
        expect(gatewayUrl.startsWith('http')).toBe(true);
        expect(gatewayToken).toBeTruthy();
        expect(gatewayToken.startsWith('gws_')).toBe(true);
      });

      test('network policy info is retrievable', async () => {
        expect(networkPolicy).toBeDefined();
        const info = await networkPolicy!.getInfo();
        expect(info.id).toBe(networkPolicy!.id);
        expect(info.egress.allow_all).toBe(true);
      });

      test('gateway config info is retrievable', async () => {
        expect(gatewayConfig).toBeDefined();
        const info = await gatewayConfig!.getInfo();
        expect(info.id).toBe(gatewayConfig!.id);
        expect(info.auth_mechanism.type).toBe('bearer');
      });

      // The following tests are currently skipped because gateway URLs are not
      // accessible from devboxes with network policies applied (see comment above)
      // Uncomment these when the backend infrastructure is updated to support this.
      /*
      test('GET request through gateway with network policy', async () => {
        const curlCmd = `curl -s -w "\\nHTTP_CODE:%{http_code}" --connect-timeout 30 -H "Authorization: Bearer ${gatewayToken}" "${gatewayUrl}/v1/devboxes?limit=1"`;
        const result = await devbox!.cmd.exec(curlCmd);
        const output = (await result.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const responseBody = lines.join('\n');
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect(httpCode).toBe(200);
        const response = JSON.parse(responseBody);
        expect(response).toBeDefined();
        expect(Array.isArray(response.devboxes)).toBe(true);
      });

      test('POST request through gateway with network policy', async () => {
        const secretName = uniqueName('gw-np-created-secret');
        const curlCmd = `curl -s -w "\\nHTTP_CODE:%{http_code}" --connect-timeout 30 -X POST -H "Authorization: Bearer ${gatewayToken}" -H "Content-Type: application/json" -d '{"name": "${secretName}", "value": "test-value"}' "${gatewayUrl}/v1/secrets"`;
        const result = await devbox!.cmd.exec(curlCmd);
        const output = (await result.stdout()).trim();
        const lines = output.split('\n');
        const httpCodeLine = lines.pop() || '';
        const httpCode = parseInt(httpCodeLine.replace('HTTP_CODE:', ''), 10);

        expect(httpCode).toBe(200);

        // Clean up the created secret
        try {
          await sdk.api.secrets.delete(secretName);
        } catch {
          // Ignore
        }
      });
      */
    },
  );
});
