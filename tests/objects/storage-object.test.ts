import { StorageObject } from '../../src/objects/storage-object';
import { Runloop } from '../../src/index';
import type { ObjectView, ObjectDownloadURLView } from '../../src/resources/objects';

// Mock the Runloop client
jest.mock('../../src/index');

// Mock fetch globally
global.fetch = jest.fn();

// Mock fs and path modules
jest.mock('node:fs', () => ({
  statSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('node:path', () => ({
  basename: jest.fn((path) => path.split('/').pop()),
  extname: jest.fn((path) => {
    const ext = path.split('.').pop();
    return ext ? `.${ext}` : '';
  }),
}));

describe('StorageObject (New API)', () => {
  let mockClient: jest.Mocked<Runloop>;
  let mockObjectData: ObjectView;
  let mockFs: any;
  let mockPath: any;

  beforeEach(() => {
    // Get mocked modules
    mockFs = require('node:fs');
    mockPath = require('node:path');

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

      const obj = await StorageObject.create(
        {
          name: 'test-file.txt',
          content_type: 'text',
          metadata: { project: 'demo' },
        },
        { client: mockClient },
      );

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        {
          name: 'test-file.txt',
          content_type: 'text',
          metadata: { project: 'demo' },
        },
        { client: mockClient },
      );
      expect(obj).toBeInstanceOf(StorageObject);
      expect(obj.id).toBe('object-123');
    });

    it('should support different content types', async () => {
      const binaryObjectData = { ...mockObjectData, content_type: 'binary' as const };
      mockClient.objects.create.mockResolvedValue(binaryObjectData);

      const obj = await StorageObject.create(
        {
          name: 'data.bin',
          content_type: 'binary',
        },
        { client: mockClient },
      );

      expect(obj.id).toBe('object-123');
    });
  });

  describe('fromId', () => {
    it('should create a StorageObject instance by ID without API call', () => {
      const obj = StorageObject.fromId('object-123', { client: mockClient });

      expect(obj).toBeInstanceOf(StorageObject);
      expect(obj.id).toBe('object-123');
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

      const objects = await StorageObject.list(undefined, { client: mockClient });

      expect(mockClient.objects.list).toHaveBeenCalledWith(undefined, { client: mockClient });
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

      await StorageObject.list(
        {
          content_type: 'text',
          search: 'test',
        },
        { client: mockClient },
      );

      expect(mockClient.objects.list).toHaveBeenCalledWith(
        {
          content_type: 'text',
          search: 'test',
        },
        { client: mockClient },
      );
    });
  });

  describe('instance methods', () => {
    let storageObject: StorageObject;

    beforeEach(async () => {
      mockClient.objects.create.mockResolvedValue(mockObjectData);
      storageObject = await StorageObject.create(
        {
          name: 'test-file.txt',
          content_type: 'text',
        },
        { client: mockClient },
      );
    });

    describe('getInfo', () => {
      it('should get object information from API', async () => {
        const updatedData = { ...mockObjectData, state: 'READ_ONLY' as const };
        mockClient.objects.retrieve.mockResolvedValue(updatedData);

        const info = await storageObject.getInfo();

        expect(mockClient.objects.retrieve).toHaveBeenCalledWith('object-123', undefined);
        expect(info.state).toBe('READ_ONLY');
        expect(info.id).toBe('object-123');
      });
    });

    describe('uploadContent', () => {
      it('should upload string content', async () => {
        // Mock getInfo to return object data with upload_url
        mockClient.objects.retrieve.mockResolvedValue(mockObjectData);

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
        // Mock getInfo to return object data with upload_url
        mockClient.objects.retrieve.mockResolvedValue(mockObjectData);

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
        const completedObj = StorageObject.fromId('object-123', { client: mockClient });

        await expect(completedObj.uploadContent('test')).rejects.toThrow('No upload URL available');
      });

      it('should throw error when upload fails', async () => {
        // Mock getInfo to return object data with upload_url
        mockClient.objects.retrieve.mockResolvedValue(mockObjectData);

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
      });
    });

    describe('id property', () => {
      it('should expose object ID', () => {
        expect(storageObject.id).toBe('object-123');
      });
    });
  });

  describe('complete workflow', () => {
    it('should create, upload, complete, and download an object', async () => {
      // Create
      mockClient.objects.create.mockResolvedValue(mockObjectData);
      const obj = await StorageObject.create(
        {
          name: 'workflow-test.txt',
          content_type: 'text',
        },
        { client: mockClient },
      );

      // Upload - mock getInfo for uploadContent
      mockClient.objects.retrieve.mockResolvedValue(mockObjectData);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      await obj.uploadContent('Test content');

      // Complete
      const completedData = { ...mockObjectData, state: 'READ_ONLY', size_bytes: 12 };
      mockClient.objects.complete.mockResolvedValue(completedData);
      await obj.complete();

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

  describe('uploadFromFile', () => {
    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
    });

    it('should upload a text file with auto-detected content-type', async () => {
      const mockFileBuffer = Buffer.from('test content');
      mockFs.statSync.mockReturnValue({ isFile: () => true });
      mockFs.readFileSync.mockReturnValue(mockFileBuffer);

      const mockObjectData = { id: 'file-123', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile('./test.txt', 'test.txt', { client: mockClient });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'test.txt', content_type: 'text', metadata: null },
        { client: mockClient },
      );
      expect(mockFs.readFileSync).toHaveBeenCalledWith('./test.txt');
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('file-123');
    });

    it('should upload a file with explicit content-type and custom name', async () => {
      const mockFileBuffer = Buffer.from('binary content');
      mockFs.statSync.mockReturnValue({ isFile: () => true });
      mockFs.readFileSync.mockReturnValue(mockFileBuffer);

      const mockObjectData = { id: 'file-456', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'custom.bin', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile('./data.bin', 'custom.bin', {
        client: mockClient,
        contentType: 'binary',
        metadata: { source: 'test' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'custom.bin', content_type: 'binary', metadata: { source: 'test' } },
        { client: mockClient, contentType: 'binary', metadata: { source: 'test' } },
      );
      expect(result.id).toBe('file-456');
    });

    it('should throw error in browser environment', async () => {
      // Mock browser environment
      const originalProcess = global.process;
      delete (global as any).process;

      await expect(StorageObject.uploadFromFile('./test.txt', 'test.txt')).rejects.toThrow(
        'File upload methods are only available in Node.js environment',
      );

      // Restore process
      global.process = originalProcess;
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(
        StorageObject.uploadFromFile('./nonexistent.txt', 'nonexistent.txt', { client: mockClient }),
      ).rejects.toThrow('Failed to access file ./nonexistent.txt: File not found');
    });

    it('should handle upload failures gracefully', async () => {
      const mockFileBuffer = Buffer.from('test content');
      mockFs.statSync.mockReturnValue({ isFile: () => true });
      mockFs.readFileSync.mockReturnValue(mockFileBuffer);

      const mockObjectData = { id: 'file-789', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        StorageObject.uploadFromFile('./test.txt', 'test.txt', { client: mockClient }),
      ).rejects.toThrow('Failed to upload file: Upload failed: 500 Internal Server Error');
    });

    it('should upload an archive file with auto-detected content-type', async () => {
      const mockArchiveBuffer = Buffer.from('compressed archive content');
      mockFs.statSync.mockReturnValue({ isFile: () => true });
      mockFs.readFileSync.mockReturnValue(mockArchiveBuffer);

      const mockObjectData = { id: 'archive-123', upload_url: 'https://upload.example.com/archive' };
      const mockObjectInfo = { ...mockObjectData, name: 'project.tar.gz', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile('./project.tar.gz', 'project.tar.gz', {
        client: mockClient,
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'project.tar.gz', content_type: 'tgz', metadata: null },
        { client: mockClient },
      );
      expect(mockFs.readFileSync).toHaveBeenCalledWith('./project.tar.gz');
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('archive-123');
    });
  });

  describe('uploadFromBuffer', () => {
    it('should upload buffer with specified content-type and name', async () => {
      const buffer = Buffer.from('buffer content');
      const mockObjectData = { id: 'buffer-123', upload_url: 'https://upload.example.com/buffer' };
      const mockObjectInfo = { ...mockObjectData, name: 'buffer.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromBuffer(buffer, 'buffer.txt', 'text', {
        client: mockClient,
        metadata: { source: 'buffer' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'buffer.txt', content_type: 'text', metadata: { source: 'buffer' } },
        { client: mockClient, metadata: { source: 'buffer' } },
      );
      expect(global.fetch).toHaveBeenCalledWith('https://upload.example.com/buffer', {
        method: 'PUT',
        body: buffer,
        headers: { 'Content-Length': buffer.length.toString() },
      });
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('buffer-123');
    });

    it('should throw error in browser environment', async () => {
      // Mock browser environment
      const originalProcess = global.process;
      delete (global as any).process;

      const buffer = Buffer.from('test');
      await expect(StorageObject.uploadFromBuffer(buffer, 'test.txt', 'text')).rejects.toThrow(
        'File upload methods are only available in Node.js environment',
      );

      // Restore process
      global.process = originalProcess;
    });

    it('should handle upload failures gracefully', async () => {
      const buffer = Buffer.from('test content');
      const mockObjectData = { id: 'buffer-456', upload_url: 'https://upload.example.com/buffer' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        StorageObject.uploadFromBuffer(buffer, 'test.txt', 'text', { client: mockClient }),
      ).rejects.toThrow('Failed to upload buffer: Upload failed: 403 Forbidden');
    });

    it('should complete full upload lifecycle', async () => {
      const buffer = Buffer.from('lifecycle test');
      const mockObjectData = { id: 'lifecycle-123', upload_url: 'https://upload.example.com/lifecycle' };
      const mockObjectInfo = { ...mockObjectData, name: 'lifecycle.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromBuffer(buffer, 'lifecycle.txt', 'text', {
        client: mockClient,
      });

      // Verify all three steps were called
      expect(mockClient.objects.create).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockClient.objects.complete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(StorageObject);
    });
  });

  describe('error handling', () => {
    it('should handle create errors', async () => {
      const error = new Error('Create failed');
      mockClient.objects.create.mockRejectedValue(error);

      await expect(
        StorageObject.create(
          {
            name: 'test.txt',
            content_type: 'text',
          },
          { client: mockClient },
        ),
      ).rejects.toThrow('Create failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Not found');
      mockClient.objects.retrieve.mockRejectedValue(error);

      const obj = StorageObject.fromId('non-existent', { client: mockClient });
      await expect(obj.getInfo()).rejects.toThrow('Not found');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.objects.list.mockRejectedValue(error);

      await expect(StorageObject.list(undefined, { client: mockClient })).rejects.toThrow('List failed');
    });
  });
});
