import { Blueprint } from '../../src/objects/blueprint';
import { Devbox } from '../../src/objects/devbox';
import { Runloop } from '../../src/index';
import type {
  BlueprintView,
  BlueprintBuildLogsListView,
  BlueprintPreviewView,
} from '../../src/resources/blueprints';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Blueprint (New API)', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockBlueprintData: BlueprintView;

  beforeEach(() => {
    // Create mock client instance with proper structure
    mockClient = {
      blueprints: {
        createAndAwaitBuildCompleted: jest.fn(),
        retrieve: jest.fn(),
        preview: jest.fn(),
        logs: jest.fn(),
        delete: jest.fn(),
      },
      devboxes: {
        createAndAwaitRunning: jest.fn(),
        retrieve: jest.fn(),
        execute: jest.fn(),
        executeAsync: jest.fn(),
        readFileContents: jest.fn(),
        writeFileContents: jest.fn(),
        downloadFile: jest.fn(),
        uploadFile: jest.fn(),
        shutdown: jest.fn(),
        suspend: jest.fn(),
        resume: jest.fn(),
        keepAlive: jest.fn(),
        snapshotDisk: jest.fn(),
        createSSHKey: jest.fn(),
        createTunnel: jest.fn(),
        removeTunnel: jest.fn(),
      },
      objects: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        delete: jest.fn(),
      },
      diskSnapshots: {
        queryStatus: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    // Mock blueprint data
    mockBlueprintData = {
      id: 'blueprint-123',
      create_time_ms: Date.now(),
      name: 'test-blueprint',
      parameters: {
        name: 'test-blueprint',
        system_setup_commands: ['apt-get update'],
      },
      state: 'created',
      status: 'build_complete',
    };
  });

  describe('create', () => {
    it('should create a blueprint and return a Blueprint instance', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);

      const blueprint = await Blueprint.create(mockClient, {
        name: 'test-blueprint',
        system_setup_commands: ['apt-get update'],
      });

      expect(mockClient.blueprints.createAndAwaitBuildCompleted).toHaveBeenCalledWith(
        {
          name: 'test-blueprint',
          system_setup_commands: ['apt-get update'],
        },
        undefined,
      );
      expect(blueprint).toBeInstanceOf(Blueprint);
      expect(blueprint.id).toBe('blueprint-123');
    });

    it('should pass polling options to the API client', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);

      await Blueprint.create(
        mockClient,
        {
          name: 'test-blueprint',
          system_setup_commands: [],
        },
        { polling: { maxAttempts: 5 } },
      );

      expect(mockClient.blueprints.createAndAwaitBuildCompleted).toHaveBeenCalledWith(
        {
          name: 'test-blueprint',
          system_setup_commands: [],
        },
        { polling: { maxAttempts: 5 } },
      );
    });

    it('should support complex blueprint configurations', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);

      await Blueprint.create(mockClient, {
        name: 'complex-blueprint',
        dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
        system_setup_commands: ['npm install'],
        metadata: { version: '1.0' },
      });

      expect(mockClient.blueprints.createAndAwaitBuildCompleted).toHaveBeenCalledWith(
        {
          name: 'complex-blueprint',
          dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update',
          system_setup_commands: ['npm install'],
          metadata: { version: '1.0' },
        },
        undefined,
      );
    });
  });

  describe('fromId', () => {
    it('should create a Blueprint instance by ID without API call', () => {
      const blueprint = Blueprint.fromId(mockClient, 'blueprint-123');

      expect(blueprint).toBeInstanceOf(Blueprint);
      expect(blueprint.id).toBe('blueprint-123');
    });
  });

  describe('preview', () => {
    it('should generate a dockerfile preview', async () => {
      const mockPreview: BlueprintPreviewView = {
        dockerfile: 'FROM ubuntu:22.04\nRUN apt-get update\nRUN apt-get install -y nodejs',
      };

      mockClient.blueprints.preview.mockResolvedValue(mockPreview);

      const preview = await Blueprint.preview(mockClient, {
        name: 'preview-blueprint',
        system_setup_commands: ['apt-get install -y nodejs'],
      });

      expect(mockClient.blueprints.preview).toHaveBeenCalledWith(
        {
          name: 'preview-blueprint',
          system_setup_commands: ['apt-get install -y nodejs'],
        },
        undefined,
      );
      expect(preview.dockerfile).toContain('FROM ubuntu:22.04');
      expect(preview.dockerfile).toContain('nodejs');
    });
  });

  describe('instance methods', () => {
    let blueprint: Blueprint;

    beforeEach(async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);
      blueprint = await Blueprint.create(mockClient, {
        name: 'test-blueprint',
        system_setup_commands: [],
      });
    });

    describe('getInfo', () => {
      it('should get blueprint information from API', async () => {
        const updatedData = { ...mockBlueprintData, status: 'failed' as const };
        mockClient.blueprints.retrieve.mockResolvedValue(updatedData);

        const info = await blueprint.getInfo();

        expect(mockClient.blueprints.retrieve).toHaveBeenCalledWith('blueprint-123', undefined);
        expect(info.status).toBe('failed');
        expect(info.id).toBe('blueprint-123');
      });
    });

    describe('logs', () => {
      it('should retrieve build logs', async () => {
        const mockLogs: BlueprintBuildLogsListView = {
          blueprint_id: 'blueprint-123',
          logs: [
            {
              level: 'info',
              message: 'Building blueprint...',
              timestamp_ms: Date.now(),
            },
            {
              level: 'info',
              message: 'Build complete',
              timestamp_ms: Date.now() + 1000,
            },
          ],
        };

        mockClient.blueprints.logs.mockResolvedValue(mockLogs);

        const logs = await blueprint.logs();

        expect(mockClient.blueprints.logs).toHaveBeenCalledWith('blueprint-123', undefined);
        expect(logs.logs).toHaveLength(2);
        expect(logs.logs[0].message).toBe('Building blueprint...');
      });
    });

    describe('delete', () => {
      it('should delete the blueprint', async () => {
        mockClient.blueprints.delete.mockResolvedValue(undefined);

        await blueprint.delete();

        expect(mockClient.blueprints.delete).toHaveBeenCalledWith('blueprint-123', undefined);
      });
    });

    describe('createDevbox', () => {
      it('should create a devbox from the blueprint', async () => {
        const mockDevboxData = {
          id: 'devbox-789',
          status: 'running' as const,
          capabilities: [],
          create_time_ms: Date.now(),
          end_time_ms: null,
          launch_parameters: {},
          metadata: {},
          state_transitions: [],
        };

        // Mock Devbox.create static method
        jest.spyOn(Devbox, 'create').mockResolvedValue(new Devbox(mockClient as any, 'devbox-789'));

        const result = await blueprint.createDevbox({
          name: 'blueprint-devbox',
          metadata: { created_from: 'blueprint-123' },
        });

        expect(Devbox.create).toHaveBeenCalledWith(
          mockClient,
          {
            name: 'blueprint-devbox',
            metadata: { created_from: 'blueprint-123' },
            blueprint_id: 'blueprint-123',
          },
          undefined,
        );
        expect(result).toBeInstanceOf(Devbox);
      });

      it('should create a devbox with only blueprint ID when no params provided', async () => {
        const mockDevboxData = {
          id: 'devbox-789',
          status: 'running' as const,
          capabilities: [],
          create_time_ms: Date.now(),
          end_time_ms: null,
          launch_parameters: {},
          metadata: {},
          state_transitions: [],
        };

        jest.spyOn(Devbox, 'create').mockResolvedValue(new Devbox(mockClient as any, 'devbox-789'));

        const result = await blueprint.createDevbox();

        expect(Devbox.create).toHaveBeenCalledWith(mockClient, { blueprint_id: 'blueprint-123' }, undefined);
        expect(result).toBeInstanceOf(Devbox);
      });
    });

    describe('id property', () => {
      it('should expose blueprint ID', () => {
        expect(blueprint.id).toBe('blueprint-123');
      });
    });
  });

  describe('error handling', () => {
    it('should handle blueprint creation failure', async () => {
      const error = new Error('Build failed');
      mockClient.blueprints.createAndAwaitBuildCompleted.mockRejectedValue(error);

      await expect(
        Blueprint.create(
          mockClient,
          {
            name: 'failing-blueprint',
            system_setup_commands: [],
          },
          { client: mockClient },
        ),
      ).rejects.toThrow('Build failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Blueprint not found');
      mockClient.blueprints.retrieve.mockRejectedValue(error);

      const blueprint = Blueprint.fromId(mockClient, 'non-existent');
      await expect(blueprint.getInfo()).rejects.toThrow('Blueprint not found');
    });

    it('should handle preview errors', async () => {
      const error = new Error('Preview generation failed');
      mockClient.blueprints.preview.mockRejectedValue(error);

      await expect(
        Blueprint.preview(mockClient, {
          name: 'invalid-blueprint',
          system_setup_commands: ['invalid-command'],
        }),
      ).rejects.toThrow('Preview generation failed');
    });

    it('should handle logs retrieval errors', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);
      const blueprint = await Blueprint.create(mockClient, {
        name: 'test-blueprint',
        system_setup_commands: [],
      });

      const error = new Error('Logs not available');
      mockClient.blueprints.logs.mockRejectedValue(error);

      await expect(blueprint.logs()).rejects.toThrow('Logs not available');
    });

    it('should handle delete errors', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);
      const blueprint = await Blueprint.create(mockClient, {
        name: 'test-blueprint',
        system_setup_commands: [],
      });

      const error = new Error('Delete failed');
      mockClient.blueprints.delete.mockRejectedValue(error);

      await expect(blueprint.delete()).rejects.toThrow('Delete failed');
    });
  });

  describe('edge cases', () => {
    it('should handle blueprint with minimal configuration', async () => {
      const minimalData = {
        ...mockBlueprintData,
        name: 'minimal',
        parameters: { name: 'minimal' },
      };
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(minimalData);

      const blueprint = await Blueprint.create(mockClient, { name: 'minimal' });

      expect(blueprint.id).toBe('blueprint-123');
    });

    it('should handle blueprint with empty logs', async () => {
      mockClient.blueprints.createAndAwaitBuildCompleted.mockResolvedValue(mockBlueprintData);
      const blueprint = await Blueprint.create(mockClient, {
        name: 'test-blueprint',
        system_setup_commands: [],
      });

      const emptyLogs = {
        blueprint_id: 'blueprint-123',
        logs: [],
      };
      mockClient.blueprints.logs.mockResolvedValue(emptyLogs);

      const logs = await blueprint.logs();
      expect(logs.logs).toHaveLength(0);
    });
  });
});
