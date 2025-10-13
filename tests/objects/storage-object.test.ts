import { StorageObject } from '../../src/objects/storage-object';
import { Runloop } from '../../src/index';
import type { ObjectView, ObjectDownloadURLView } from '../../src/resources/objects';

// Mock the Runloop client
jest.mock('../../src/index');

// Mock fetch globally
global.fetch = jest.fn();

describe('StorageObject', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockObjectData: ObjectView;

  beforeEach(() => {
    // Create mock client instance
    mockClient = {
      objects: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        complete: jest.fn(),
        download: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    // Mock object data
    mockObjectData = {
      id: 'object-123',
      content_type: 'text',
      name: 'test-file.txt',
      state: 'UPLOADING',
      size_bytes: null,
      upload_url: 'https://s3.example.com/upload/test-file.txt?signature=...',
    };

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  describe('create', () => {
    it('should create a storage object and return a StorageObject instance', async () => {
      mockClient.objects.create.mockResolvedValue(mockObjectData);

      const obj = await StorageObject.create(mockClient, {
        name: 'test-file.txt',
        content_type: 'text',
        metadata: { project: 'demo' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        {
          name: 'test-file.txt',
          content_type: 'text',
          metadata: { project: 'demo' },
        },
        undefined,
      );
      expect(obj).toBeInstanceOf(StorageObject);
      expect(obj.id).toBe('object-123');
      expect(obj.name).toBe('test-file.txt');
      expect(obj.uploadUrl).toBeTruthy();
    });

    it('should support different content types', async () => {
      const binaryObjectData = { ...mockObjectData, content_type: 'binary' as const };
      mockClient.objects.create.mockResolvedValue(binaryObjectData);

      const obj = await StorageObject.create(mockClient, {
        name: 'data.bin',
        content_type: 'binary',
      });

      expect(obj.contentType).toBe('binary');
    });
  });

  describe('get', () => {
    it('should retrieve an existing storage object by ID', async () => {
      const completedData = { ...mockObjectData, state: 'READ_ONLY', upload_url: null };
      mockClient.objects.retrieve.mockResolvedValue(completedData);

      const obj = await StorageObject.get(mockClient, 'object-123');

      expect(mockClient.objects.retrieve).toHaveBeenCalledWith('object-123', undefined);
      expect(obj.id).toBe('object-123');
      expect(obj.state).toBe('READ_ONLY');
    });
  });

  describe('list', () => {
    it('should list all storage objects', async () => {
      const obj1: ObjectView = {
        id: 'object-1',
        content_type: 'text',
        name: 'file1.txt',
        state: 'READ_ONLY',
      };

      const obj2: ObjectView = {
        id: 'object-2',
        content_type: 'binary',
        name: 'file2.bin',
        state: 'READ_ONLY',
      };

      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield obj1;
          yield obj2;
        },
      };

      mockClient.objects.list.mockResolvedValue(mockPage as any);

      const objects = await StorageObject.list(mockClient);

      expect(mockClient.objects.list).toHaveBeenCalledWith(undefined, undefined);
      expect(objects).toHaveLength(2);
      expect(objects[0].id).toBe('object-1');
      expect(objects[1].id).toBe('object-2');
    });

    it('should support filtering', async () => {
      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield mockObjectData;
        },
      };

      mockClient.objects.list.mockResolvedValue(mockPage as any);

      await StorageObject.list(mockClient, {
        content_type: 'text',
        search: 'test',
      });

      expect(mockClient.objects.list).toHaveBeenCalledWith(
        {
          content_type: 'text',
          search: 'test',
        },
        undefined,
      );
    });
  });

  describe('instance methods', () => {
    let storageObject: StorageObject;

    beforeEach(async () => {
      mockClient.objects.create.mockResolvedValue(mockObjectData);
      storageObject = await StorageObject.create(mockClient, {
        name: 'test-file.txt',
        content_type: 'text',
      });
    });

    describe('uploadContent', () => {
      it('should upload string content', async () => {
        const mockFetchResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        await storageObject.uploadContent('Hello, World!', 'text/plain');

        expect(global.fetch).toHaveBeenCalledWith(mockObjectData.upload_url, {
          method: 'PUT',
          body: 'Hello, World!',
          headers: { 'Content-Type': 'text/plain' },
        });
      });

      it('should upload buffer content', async () => {
        const mockFetchResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        await storageObject.uploadContent(buffer);

        expect(global.fetch).toHaveBeenCalledWith(mockObjectData.upload_url, {
          method: 'PUT',
          body: buffer,
          headers: {},
        });
      });

      it('should throw error when upload URL is not available', async () => {
        const completedData = { ...mockObjectData, upload_url: null };
        mockClient.objects.retrieve.mockResolvedValue(completedData);
        const completedObj = await StorageObject.get(mockClient, 'object-123');

        await expect(completedObj.uploadContent('test')).rejects.toThrow('No upload URL available');
      });

      it('should throw error when upload fails', async () => {
        const mockFetchResponse = {
          ok: false,
          status: 403,
          statusText: 'Forbidden',
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        await expect(storageObject.uploadContent('test')).rejects.toThrow('Upload failed: 403 Forbidden');
      });
    });

    describe('complete', () => {
      it('should mark upload as complete', async () => {
        const completedData = {
          ...mockObjectData,
          state: 'READ_ONLY',
          size_bytes: 13,
          upload_url: null,
        };

        mockClient.objects.complete.mockResolvedValue(completedData);

        await storageObject.complete();

        expect(mockClient.objects.complete).toHaveBeenCalledWith('object-123', {}, undefined);
        expect(storageObject.state).toBe('READ_ONLY');
        expect(storageObject.sizeBytes).toBe(13);
      });
    });

    describe('getDownloadUrl', () => {
      it('should generate a download URL', async () => {
        const mockDownloadUrl: ObjectDownloadURLView = {
          download_url: 'https://s3.example.com/download/test-file.txt?signature=...',
        };

        mockClient.objects.download.mockResolvedValue(mockDownloadUrl);

        const result = await storageObject.getDownloadUrl(3600);

        expect(mockClient.objects.download).toHaveBeenCalledWith(
          'object-123',
          { duration_seconds: 3600 },
          undefined,
        );
        expect(result.download_url).toBeTruthy();
      });

      it('should use default duration when not specified', async () => {
        const mockDownloadUrl: ObjectDownloadURLView = {
          download_url: 'https://s3.example.com/download/test-file.txt',
        };

        mockClient.objects.download.mockResolvedValue(mockDownloadUrl);

        await storageObject.getDownloadUrl();

        expect(mockClient.objects.download).toHaveBeenCalledWith(
          'object-123',
          { duration_seconds: undefined },
          undefined,
        );
      });
    });

    describe('downloadAsText', () => {
      it('should download content as text', async () => {
        const mockDownloadUrl: ObjectDownloadURLView = {
          download_url: 'https://s3.example.com/download/test-file.txt',
        };

        mockClient.objects.download.mockResolvedValue(mockDownloadUrl);

        const mockFetchResponse = {
          ok: true,
          text: jest.fn().mockResolvedValue('File contents'),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const content = await storageObject.downloadAsText();

        expect(global.fetch).toHaveBeenCalledWith(mockDownloadUrl.download_url);
        expect(content).toBe('File contents');
      });

      it('should throw error when download fails', async () => {
        const mockDownloadUrl: ObjectDownloadURLView = {
          download_url: 'https://s3.example.com/download/test-file.txt',
        };

        mockClient.objects.download.mockResolvedValue(mockDownloadUrl);

        const mockFetchResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found',
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        await expect(storageObject.downloadAsText()).rejects.toThrow('Download failed: 404 Not Found');
      });
    });

    describe('downloadAsBuffer', () => {
      it('should download content as buffer', async () => {
        const mockDownloadUrl: ObjectDownloadURLView = {
          download_url: 'https://s3.example.com/download/data.bin',
        };

        mockClient.objects.download.mockResolvedValue(mockDownloadUrl);

        const mockArrayBuffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer;
        const mockFetchResponse = {
          ok: true,
          arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const buffer = await storageObject.downloadAsBuffer();

        expect(global.fetch).toHaveBeenCalledWith(mockDownloadUrl.download_url);
        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(buffer.length).toBe(4);
      });
    });

    describe('delete', () => {
      it('should delete the storage object', async () => {
        const deletedData = { ...mockObjectData, state: 'DELETED' };
        mockClient.objects.delete.mockResolvedValue(deletedData);

        await storageObject.delete();

        expect(mockClient.objects.delete).toHaveBeenCalledWith('object-123', {}, undefined);
        expect(storageObject.state).toBe('DELETED');
      });
    });

    describe('refresh', () => {
      it('should refresh object data from API', async () => {
        const updatedData = { ...mockObjectData, state: 'READ_ONLY', size_bytes: 100 };
        mockClient.objects.retrieve.mockResolvedValue(updatedData);

        await storageObject.refresh();

        expect(mockClient.objects.retrieve).toHaveBeenCalledWith('object-123', undefined);
        expect(storageObject.state).toBe('READ_ONLY');
        expect(storageObject.sizeBytes).toBe(100);
      });
    });

    describe('property accessors', () => {
      it('should expose object properties', () => {
        expect(storageObject.id).toBe('object-123');
        expect(storageObject.name).toBe('test-file.txt');
        expect(storageObject.contentType).toBe('text');
        expect(storageObject.state).toBe('UPLOADING');
        expect(storageObject.sizeBytes).toBeNull();
        expect(storageObject.uploadUrl).toBeTruthy();
        expect(storageObject.data).toEqual(mockObjectData);
      });

    });
  });

  describe('complete workflow', () => {
    it('should create, upload, complete, and download an object', async () => {
      // Create
      mockClient.objects.create.mockResolvedValue(mockObjectData);
      const obj = await StorageObject.create(mockClient, {
        name: 'workflow-test.txt',
        content_type: 'text',
      });

      // Upload
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      await obj.uploadContent('Test content');

      // Complete
      const completedData = { ...mockObjectData, state: 'READ_ONLY', size_bytes: 12 };
      mockClient.objects.complete.mockResolvedValue(completedData);
      await obj.complete();

      expect(obj.state).toBe('READ_ONLY');
      expect(obj.sizeBytes).toBe(12);

      // Download
      const mockDownloadUrl: ObjectDownloadURLView = {
        download_url: 'https://s3.example.com/download/workflow-test.txt',
      };
      mockClient.objects.download.mockResolvedValue(mockDownloadUrl);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('Test content'),
      });

      const content = await obj.downloadAsText();
      expect(content).toBe('Test content');
    });
  });

  describe('error handling', () => {
    it('should handle create errors', async () => {
      const error = new Error('Create failed');
      mockClient.objects.create.mockRejectedValue(error);

      await expect(
        StorageObject.create(mockClient, {
          name: 'test.txt',
          content_type: 'text',
        }),
      ).rejects.toThrow('Create failed');
    });

    it('should handle retrieval errors', async () => {
      const error = new Error('Not found');
      mockClient.objects.retrieve.mockRejectedValue(error);

      await expect(StorageObject.get(mockClient, 'non-existent')).rejects.toThrow('Not found');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.objects.list.mockRejectedValue(error);

      await expect(StorageObject.list(mockClient)).rejects.toThrow('List failed');
    });
  });
});
