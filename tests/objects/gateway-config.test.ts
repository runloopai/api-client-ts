import { GatewayConfig } from '../../src/sdk/gateway-config';
import type { GatewayConfigView } from '../../src/resources/gateway-configs';

// Mock the Runloop client
jest.mock('../../src/index');

describe('GatewayConfig', () => {
  let mockClient: any;
  let mockGatewayConfigData: GatewayConfigView;

  beforeEach(() => {
    mockClient = {
      gatewayConfigs: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
      },
    } as any;

    mockGatewayConfigData = {
      id: 'gwc_123456789',
      name: 'test-gateway-config',
      endpoint: 'https://api.example.com',
      auth_mechanism: { type: 'bearer' },
      description: 'Test gateway config',
      create_time_ms: Date.now(),
    };
  });

  describe('create', () => {
    it('should create a gateway config and return a GatewayConfig instance', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);

      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'test-gateway-config',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'test-gateway-config',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        },
        undefined,
      );
      expect(gatewayConfig).toBeInstanceOf(GatewayConfig);
      expect(gatewayConfig.id).toBe('gwc_123456789');
    });

    it('should pass request options to the API client', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);

      await GatewayConfig.create(
        mockClient,
        {
          name: 'test-gateway-config',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        },
        { timeout: 5000 },
      );

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'test-gateway-config',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        },
        { timeout: 5000 },
      );
    });

    it('should create gateway config with bearer auth mechanism', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);

      await GatewayConfig.create(mockClient, {
        name: 'bearer-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'bearer-gateway',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        },
        undefined,
      );
    });

    it('should create gateway config with header auth mechanism', async () => {
      const headerAuthData = {
        ...mockGatewayConfigData,
        auth_mechanism: { type: 'header' as const, key: 'x-api-key' },
      };
      mockClient.gatewayConfigs.create.mockResolvedValue(headerAuthData);

      await GatewayConfig.create(mockClient, {
        name: 'header-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'header', key: 'x-api-key' },
      });

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'header-gateway',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'header', key: 'x-api-key' },
        },
        undefined,
      );
    });

    it('should create gateway config with description', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);

      await GatewayConfig.create(mockClient, {
        name: 'described-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
        description: 'A gateway with a description',
      });

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'described-gateway',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
          description: 'A gateway with a description',
        },
        undefined,
      );
    });
  });

  describe('fromId', () => {
    it('should create a GatewayConfig instance by ID without API call', () => {
      const gatewayConfig = GatewayConfig.fromId(mockClient, 'gwc_123456789');

      expect(gatewayConfig).toBeInstanceOf(GatewayConfig);
      expect(gatewayConfig.id).toBe('gwc_123456789');
      expect(mockClient.gatewayConfigs.retrieve).not.toHaveBeenCalled();
    });

    it('should work with any valid gateway config ID format', () => {
      const gatewayConfig = GatewayConfig.fromId(mockClient, 'gwc_abcdefghij');

      expect(gatewayConfig.id).toBe('gwc_abcdefghij');
    });
  });

  describe('instance methods', () => {
    let gatewayConfig: GatewayConfig;

    beforeEach(async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);
      gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'test-gateway-config',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });
    });

    describe('getInfo', () => {
      it('should get gateway config information from API', async () => {
        mockClient.gatewayConfigs.retrieve.mockResolvedValue(mockGatewayConfigData);

        const info = await gatewayConfig.getInfo();

        expect(mockClient.gatewayConfigs.retrieve).toHaveBeenCalledWith('gwc_123456789', undefined);
        expect(info.id).toBe('gwc_123456789');
        expect(info.name).toBe('test-gateway-config');
        expect(info.endpoint).toBe('https://api.example.com');
        expect(info.auth_mechanism.type).toBe('bearer');
      });

      it('should pass request options to retrieve call', async () => {
        mockClient.gatewayConfigs.retrieve.mockResolvedValue(mockGatewayConfigData);

        await gatewayConfig.getInfo({ timeout: 3000 });

        expect(mockClient.gatewayConfigs.retrieve).toHaveBeenCalledWith('gwc_123456789', { timeout: 3000 });
      });

      it('should return updated data on subsequent calls', async () => {
        const updatedData = { ...mockGatewayConfigData, name: 'updated-name' };
        mockClient.gatewayConfigs.retrieve.mockResolvedValue(updatedData);

        const info = await gatewayConfig.getInfo();

        expect(info.name).toBe('updated-name');
      });
    });

    describe('update', () => {
      it('should update gateway config name', async () => {
        const updatedData = { ...mockGatewayConfigData, name: 'updated-gateway-name' };
        mockClient.gatewayConfigs.update.mockResolvedValue(updatedData);

        const result = await gatewayConfig.update({ name: 'updated-gateway-name' });

        expect(mockClient.gatewayConfigs.update).toHaveBeenCalledWith(
          'gwc_123456789',
          { name: 'updated-gateway-name' },
          undefined,
        );
        expect(result.name).toBe('updated-gateway-name');
      });

      it('should update gateway config endpoint', async () => {
        const updatedData = { ...mockGatewayConfigData, endpoint: 'https://new-api.example.com' };
        mockClient.gatewayConfigs.update.mockResolvedValue(updatedData);

        const result = await gatewayConfig.update({ endpoint: 'https://new-api.example.com' });

        expect(mockClient.gatewayConfigs.update).toHaveBeenCalledWith(
          'gwc_123456789',
          { endpoint: 'https://new-api.example.com' },
          undefined,
        );
        expect(result.endpoint).toBe('https://new-api.example.com');
      });

      it('should update gateway config auth mechanism', async () => {
        const updatedData = {
          ...mockGatewayConfigData,
          auth_mechanism: { type: 'header' as const, key: 'Authorization' },
        };
        mockClient.gatewayConfigs.update.mockResolvedValue(updatedData);

        const result = await gatewayConfig.update({
          auth_mechanism: { type: 'header', key: 'Authorization' },
        });

        expect(mockClient.gatewayConfigs.update).toHaveBeenCalledWith(
          'gwc_123456789',
          { auth_mechanism: { type: 'header', key: 'Authorization' } },
          undefined,
        );
        expect(result.auth_mechanism.type).toBe('header');
        expect(result.auth_mechanism.key).toBe('Authorization');
      });

      it('should update gateway config description', async () => {
        const updatedData = { ...mockGatewayConfigData, description: 'Updated description' };
        mockClient.gatewayConfigs.update.mockResolvedValue(updatedData);

        const result = await gatewayConfig.update({ description: 'Updated description' });

        expect(result.description).toBe('Updated description');
      });

      it('should update multiple fields at once', async () => {
        const updatedData = {
          ...mockGatewayConfigData,
          name: 'new-name',
          endpoint: 'https://new-endpoint.com',
          description: 'New description',
        };
        mockClient.gatewayConfigs.update.mockResolvedValue(updatedData);

        const result = await gatewayConfig.update({
          name: 'new-name',
          endpoint: 'https://new-endpoint.com',
          description: 'New description',
        });

        expect(mockClient.gatewayConfigs.update).toHaveBeenCalledWith(
          'gwc_123456789',
          {
            name: 'new-name',
            endpoint: 'https://new-endpoint.com',
            description: 'New description',
          },
          undefined,
        );
        expect(result.name).toBe('new-name');
        expect(result.endpoint).toBe('https://new-endpoint.com');
        expect(result.description).toBe('New description');
      });

      it('should pass request options to update call', async () => {
        mockClient.gatewayConfigs.update.mockResolvedValue(mockGatewayConfigData);

        await gatewayConfig.update({ name: 'test' }, { timeout: 5000 });

        expect(mockClient.gatewayConfigs.update).toHaveBeenCalledWith(
          'gwc_123456789',
          { name: 'test' },
          { timeout: 5000 },
        );
      });
    });

    describe('delete', () => {
      it('should delete the gateway config', async () => {
        mockClient.gatewayConfigs.delete.mockResolvedValue(mockGatewayConfigData);

        const result = await gatewayConfig.delete();

        expect(mockClient.gatewayConfigs.delete).toHaveBeenCalledWith('gwc_123456789', {}, undefined);
        expect(result.id).toBe('gwc_123456789');
      });

      it('should pass request options to delete call', async () => {
        mockClient.gatewayConfigs.delete.mockResolvedValue(mockGatewayConfigData);

        await gatewayConfig.delete({ timeout: 3000 });

        expect(mockClient.gatewayConfigs.delete).toHaveBeenCalledWith('gwc_123456789', {}, { timeout: 3000 });
      });
    });

    describe('id property', () => {
      it('should expose gateway config ID', () => {
        expect(gatewayConfig.id).toBe('gwc_123456789');
      });

      it('should be read-only', () => {
        const originalId = gatewayConfig.id;
        // TypeScript prevents assignment, but we can verify the getter works consistently
        expect(gatewayConfig.id).toBe(originalId);
      });
    });
  });

  describe('error handling', () => {
    it('should handle gateway config creation failure', async () => {
      const error = new Error('Creation failed');
      mockClient.gatewayConfigs.create.mockRejectedValue(error);

      await expect(
        GatewayConfig.create(mockClient, {
          name: 'failing-gateway',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        }),
      ).rejects.toThrow('Creation failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Gateway config not found');
      mockClient.gatewayConfigs.retrieve.mockRejectedValue(error);

      const gatewayConfig = GatewayConfig.fromId(mockClient, 'gwc_nonexistent');
      await expect(gatewayConfig.getInfo()).rejects.toThrow('Gateway config not found');
    });

    it('should handle update errors', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);
      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'test-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      const error = new Error('Update failed');
      mockClient.gatewayConfigs.update.mockRejectedValue(error);

      await expect(gatewayConfig.update({ name: 'new-name' })).rejects.toThrow('Update failed');
    });

    it('should handle delete errors', async () => {
      mockClient.gatewayConfigs.create.mockResolvedValue(mockGatewayConfigData);
      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'test-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      const error = new Error('Delete failed');
      mockClient.gatewayConfigs.delete.mockRejectedValue(error);

      await expect(gatewayConfig.delete()).rejects.toThrow('Delete failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockClient.gatewayConfigs.create.mockRejectedValue(networkError);

      await expect(
        GatewayConfig.create(mockClient, {
          name: 'test',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'bearer' },
        }),
      ).rejects.toThrow('Network error');
    });
  });

  describe('edge cases', () => {
    it('should handle gateway config with minimal configuration', async () => {
      const minimalData = {
        id: 'gwc_minimal',
        name: 'minimal',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' as const },
        create_time_ms: Date.now(),
      };
      mockClient.gatewayConfigs.create.mockResolvedValue(minimalData);

      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'minimal',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      expect(gatewayConfig.id).toBe('gwc_minimal');
    });

    it('should handle empty string description', async () => {
      const dataWithEmptyDesc = { ...mockGatewayConfigData, description: '' };
      mockClient.gatewayConfigs.create.mockResolvedValue(dataWithEmptyDesc);

      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'test',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
        description: '',
      });

      expect(gatewayConfig).toBeInstanceOf(GatewayConfig);
    });

    it('should handle very long endpoint URLs', async () => {
      const longUrl = 'https://api.example.com/' + 'a'.repeat(1000);
      const dataWithLongUrl = { ...mockGatewayConfigData, endpoint: longUrl };
      mockClient.gatewayConfigs.create.mockResolvedValue(dataWithLongUrl);

      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: 'long-url-gateway',
        endpoint: longUrl,
        auth_mechanism: { type: 'bearer' },
      });

      expect(gatewayConfig).toBeInstanceOf(GatewayConfig);
    });

    it('should handle special characters in name', async () => {
      const specialName = 'gateway-config-!@#$%';
      const dataWithSpecialName = { ...mockGatewayConfigData, name: specialName };
      mockClient.gatewayConfigs.create.mockResolvedValue(dataWithSpecialName);

      const gatewayConfig = await GatewayConfig.create(mockClient, {
        name: specialName,
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'bearer' },
      });

      expect(gatewayConfig).toBeInstanceOf(GatewayConfig);
    });

    it('should handle header auth with custom key names', async () => {
      const customKeyData = {
        ...mockGatewayConfigData,
        auth_mechanism: { type: 'header' as const, key: 'X-Custom-Auth-Header' },
      };
      mockClient.gatewayConfigs.create.mockResolvedValue(customKeyData);

      await GatewayConfig.create(mockClient, {
        name: 'custom-header-gateway',
        endpoint: 'https://api.example.com',
        auth_mechanism: { type: 'header', key: 'X-Custom-Auth-Header' },
      });

      expect(mockClient.gatewayConfigs.create).toHaveBeenCalledWith(
        {
          name: 'custom-header-gateway',
          endpoint: 'https://api.example.com',
          auth_mechanism: { type: 'header', key: 'X-Custom-Auth-Header' },
        },
        undefined,
      );
    });
  });
});
