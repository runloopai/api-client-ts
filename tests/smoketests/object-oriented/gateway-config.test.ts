import { SHORT_TIMEOUT, MEDIUM_TIMEOUT, uniqueName, makeClientSDK, cleanUpGatewayConfig } from '../utils';
import { GatewayConfig, Devbox } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented gateway config', () => {
  beforeAll(() => {
    console.log('RUNLOOP_API_KEY:', process.env['RUNLOOP_API_KEY']?.slice(0, 10) + '...');
    console.log('RUNLOOP_BASE_URL:', process.env['RUNLOOP_BASE_URL']);
  });

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
    test('create gateway config with bearer auth', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-bearer'),
          endpoint: 'https://api.bearer-test.com',
          auth_mechanism: { type: 'bearer' },
        });
        const info = await gatewayConfig.getInfo();
        expect(info.auth_mechanism.type).toBe('bearer');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });

    test('create gateway config with header auth', async () => {
      let gatewayConfig: GatewayConfig | undefined;
      try {
        gatewayConfig = await sdk.gatewayConfig.create({
          name: uniqueName('sdk-gateway-header'),
          endpoint: 'https://api.header-test.com',
          auth_mechanism: { type: 'header', key: 'x-api-key' },
        });
        const info = await gatewayConfig.getInfo();
        expect(info.auth_mechanism.type).toBe('header');
        expect(info.auth_mechanism.key).toBe('x-api-key');
      } finally {
        await cleanUpGatewayConfig(gatewayConfig);
      }
    });
  });

  // Test devbox creation with gateway config and secret
  // This test requires a pre-existing secret named 'GATEWAY_TEST_SECRET' in the account
  // Only run in CI where the secret is available
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('devbox with gateway config and secret', () => {
    test(
      'create devbox with gateway spec and verify environment variables',
      async () => {
        let devbox: Devbox | undefined;
        let gatewayConfig: GatewayConfig | undefined;

        try {
          // Create a custom gateway config for testing
          gatewayConfig = await sdk.gatewayConfig.create({
            name: uniqueName('sdk-gateway-devbox-test'),
            endpoint: 'https://api.anthropic.com',
            auth_mechanism: { type: 'header', key: 'x-api-key' },
            description: 'Gateway config for devbox test',
          });

          // Create a devbox with the gateway spec
          // Note: This requires a secret named 'GATEWAY_TEST_SECRET' to exist
          devbox = await sdk.devbox.create({
            name: uniqueName('devbox-with-gateway'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60,
            },
            gateways: {
              ANTHROPIC: {
                gateway: gatewayConfig.id,
                secret: 'GATEWAY_TEST_SECRET',
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
          // ANTHROPIC_HOST should contain a URL
          const hostResult = await devbox.cmd.exec('echo $ANTHROPIC_HOST');
          expect(hostResult.exitCode).toBe(0);
          const hostValue = (await hostResult.stdout()).trim();
          expect(hostValue).toBeTruthy();
          expect(hostValue.startsWith('http')).toBe(true);

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
        }
      },
      MEDIUM_TIMEOUT,
    );

    test(
      'create devbox with built-in gateway and verify environment variables',
      async () => {
        let devbox: Devbox | undefined;

        try {
          // Create a devbox using the built-in 'anthropic' gateway by name
          // Note: This requires a secret named 'GATEWAY_TEST_SECRET' to exist
          devbox = await sdk.devbox.create({
            name: uniqueName('devbox-with-builtin-gateway'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60,
            },
            gateways: {
              ANTHROPIC: {
                gateway: 'anthropic', // Use the built-in gateway name
                secret: 'GATEWAY_TEST_SECRET',
              },
            },
          });

          expect(devbox).toBeDefined();
          expect(devbox.id).toBeTruthy();

          // Get devbox info and verify gateway spec is present
          const info = await devbox.getInfo();
          expect(info.gateway_specs).toBeDefined();
          expect(info.gateway_specs?.['ANTHROPIC']).toBeDefined();

          // Verify environment variables are set correctly using exec
          // ANTHROPIC_HOST should contain a URL
          const hostResult = await devbox.cmd.exec('echo $ANTHROPIC_HOST');
          expect(hostResult.exitCode).toBe(0);
          const hostValue = (await hostResult.stdout()).trim();
          expect(hostValue).toBeTruthy();
          expect(hostValue.startsWith('http')).toBe(true);

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
        }
      },
      MEDIUM_TIMEOUT,
    );
  });
});
