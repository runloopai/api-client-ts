import { StorageObject } from '../../src/sdk/storage-object';
import type { ObjectView, ObjectDownloadURLView } from '../../src/resources/objects';

// Mock the Runloop client
jest.mock('../../src/index');

// Mock fetch globally
(global as any).fetch = jest.fn();

// Mock fs and path modules
jest.mock('node:fs/promises', () => ({
  stat: jest.fn(),
  readFile: jest.fn(),
  mkdtemp: jest.fn(),
  rm: jest.fn(),
}));

jest.mock('node:fs', () => ({
  createWriteStream: jest.fn(),
  createReadStream: jest.fn(),
}));

jest.mock('node:path', () => ({
  basename: jest.fn((path) => path.split('/').pop()),
  extname: jest.fn((path) => {
    const ext = path.split('.').pop();
    return ext ? `.${ext}` : '';
  }),
  join: jest.fn((...paths) => paths.join('/')),
}));

// Mock tar module
jest.mock('tar', () => ({
  create: jest.fn(),
}));

// Mock ignore matcher so uploadFromDir doesn't hit the real filesystem
jest.mock('../../src/lib/ignore-matcher', () => ({
  loadIgnoreMatcher: jest.fn(),
}));

describe('StorageObject (New API)', () => {
  let mockClient: any;
  let mockObjectData: ObjectView;
  let mockFs: any;
  let mockFsSync: any;
  let mockPath: any;
  let mockIgnoreMatcher: any;

  beforeEach(() => {
    // Get mocked modules
    mockFs = require('node:fs/promises');
    mockFsSync = require('node:fs');
    mockPath = require('node:path');
    mockIgnoreMatcher = require('../../src/lib/ignore-matcher');
    mockIgnoreMatcher.loadIgnoreMatcher.mockResolvedValue(null);

    // Create mock client instance with proper structure
    mockClient = {
      objects: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        complete: jest.fn(),
        download: jest.fn(),
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
        listDiskSnapshots: jest.fn(),
      },
      blueprints: {
        createAndAwaitBuildCompleted: jest.fn(),
        retrieve: jest.fn(),
        preview: jest.fn(),
        logs: jest.fn(),
        delete: jest.fn(),
      },
      diskSnapshots: {
        queryStatus: jest.fn(),
        update: jest.fn(),
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
      create_time_ms: Date.now(),
    };

    // Reset fetch mock
    ((global as any).fetch as jest.Mock).mockReset();
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
    });

    it('should support different content types', async () => {
      const binaryObjectData = { ...mockObjectData, content_type: 'binary' as const };
      mockClient.objects.create.mockResolvedValue(binaryObjectData);

      const obj = await StorageObject.create(mockClient, {
        name: 'data.bin',
        content_type: 'binary',
      });

      expect(obj.id).toBe('object-123');
    });
  });

  describe('fromId', () => {
    it('should create a StorageObject instance by ID without API call', () => {
      const obj = StorageObject.fromId(mockClient, 'object-123');

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
        create_time_ms: Date.now(),
      };

      const obj2: ObjectView = {
        id: 'object-2',
        content_type: 'binary',
        name: 'file2.bin',
        state: 'READ_ONLY',
        create_time_ms: Date.now(),
      };

      const mockPage = {
        [Symbol.asyncIterator]: async function* () {
          yield obj1;
          yield obj2;
        },
      };

      mockClient.objects.list.mockResolvedValue(mockPage as any);

      const objects = await StorageObject.list(mockClient, undefined, {});

      expect(mockClient.objects.list).toHaveBeenCalledWith(undefined, {});
      expect(objects).toHaveLength(2);
      expect(objects[0]!.id).toBe('object-1');
      expect(objects[1]!.id).toBe('object-2');
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

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        await storageObject.uploadContent('Hello, World!');

        expect((global as any).fetch).toHaveBeenCalledWith(mockObjectData.upload_url, {
          method: 'PUT',
          body: Buffer.from('Hello, World!', 'utf-8'),
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

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        await storageObject.uploadContent(buffer);

        expect((global as any).fetch).toHaveBeenCalledWith(mockObjectData.upload_url, {
          method: 'PUT',
          body: buffer,
        });
      });

      it('should throw error when upload URL is not available', async () => {
        const completedData = { ...mockObjectData, upload_url: null };
        mockClient.objects.retrieve.mockResolvedValue(completedData);
        const completedObj = StorageObject.fromId(mockClient, 'object-123');

        await expect(completedObj.uploadContent('test')).rejects.toThrow('No upload URL available');
      });

      it('should throw error when upload fails', async () => {
        // Mock getInfo to return object data with upload_url
        mockClient.objects.retrieve.mockResolvedValue(mockObjectData);

        const mockFetchResponse = {
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          text: jest.fn().mockResolvedValue('Forbidden'),
        };

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        await expect(storageObject.uploadContent('test')).rejects.toThrow('Upload failed: 403');
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

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const content = await storageObject.downloadAsText();

        expect((global as any).fetch).toHaveBeenCalledWith(mockDownloadUrl.download_url);
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

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

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

        ((global as any).fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

        const buffer = await storageObject.downloadAsBuffer();

        expect((global as any).fetch).toHaveBeenCalledWith(mockDownloadUrl.download_url);
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
      const obj = await StorageObject.create(mockClient, {
        name: 'workflow-test.txt',
        content_type: 'text',
      });

      // Upload - mock getInfo for uploadContent
      mockClient.objects.retrieve.mockResolvedValue(mockObjectData);
      ((global as any).fetch as jest.Mock).mockResolvedValue({ ok: true });
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
      ((global as any).fetch as jest.Mock).mockResolvedValue({
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
      // Reset global fetch mock
      ((global as any).fetch as jest.Mock).mockClear();
    });

    it('should upload a text file with auto-detected content-type', async () => {
      const mockFileBuffer = Buffer.from('test content');
      mockFs.stat.mockResolvedValue({ isFile: () => true });
      mockFs.readFile.mockResolvedValue(mockFileBuffer);

      const mockObjectData = { id: 'file-123', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile(mockClient, './test.txt', 'test.txt');

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'test.txt', content_type: 'text', metadata: null },
        undefined,
      );
      expect(mockFs.readFile).toHaveBeenCalledWith('./test.txt');
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('file-123');
    });

    it('should upload a file with explicit content-type and custom name', async () => {
      const mockFileBuffer = Buffer.from('binary content');
      mockFs.stat.mockResolvedValue({ isFile: () => true });
      mockFs.readFile.mockResolvedValue(mockFileBuffer);

      const mockObjectData = { id: 'file-456', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'custom.bin', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile(mockClient, './data.bin', 'custom.bin', {
        contentType: 'binary',
        metadata: { source: 'test' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'custom.bin', content_type: 'binary', metadata: { source: 'test' } },
        { contentType: 'binary', metadata: { source: 'test' } },
      );
      expect(result.id).toBe('file-456');
    });

    it('should throw error in browser environment', async () => {
      // Mock browser environment
      const originalProcess = global.process;
      delete (global as any).process;

      await expect(StorageObject.uploadFromFile(mockClient, './test.txt', 'test.txt')).rejects.toThrow(
        'File upload methods are only available in Node.js environment',
      );

      // Restore process
      global.process = originalProcess;
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));

      await expect(
        StorageObject.uploadFromFile(mockClient, './nonexistent.txt', 'nonexistent.txt', {}),
      ).rejects.toThrow('Failed to access file ./nonexistent.txt: File not found');
    });

    it('should handle upload failures gracefully', async () => {
      const mockFileBuffer = Buffer.from('test content');
      mockFs.stat.mockResolvedValue({ isFile: () => true });
      mockFs.readFile.mockResolvedValue(mockFileBuffer);

      const mockObjectData = { id: 'file-789', upload_url: 'https://upload.example.com/file' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(StorageObject.uploadFromFile(mockClient, './test.txt', 'test.txt', {})).rejects.toThrow(
        'Failed to upload file: Upload failed: 500 Internal Server Error',
      );
    });

    it('should upload an archive file with auto-detected content-type', async () => {
      const mockArchiveBuffer = Buffer.from('compressed archive content');
      mockFs.stat.mockResolvedValue({ isFile: () => true });
      mockFs.readFile.mockResolvedValue(mockArchiveBuffer);

      const mockObjectData = { id: 'archive-123', upload_url: 'https://upload.example.com/archive' };
      const mockObjectInfo = { ...mockObjectData, name: 'project.tar.gz', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromFile(
        mockClient,
        './files/test-archive.tar.gz',
        'test-archive.tar.gz',
      );

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'test-archive.tar.gz', content_type: 'tgz', metadata: null },
        undefined,
      );
      expect(mockFs.readFile).toHaveBeenCalledWith('./files/test-archive.tar.gz');
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('archive-123');
    });
  });

  describe('uploadFromText', () => {
    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
      // Reset global fetch mock
      ((global as any).fetch as jest.Mock).mockClear();
    });

    it('should upload text content with text content-type', async () => {
      const textContent = 'Hello, World!';
      const mockObjectData = { id: 'text-123', upload_url: 'https://upload.example.com/text' };
      const mockObjectInfo = { ...mockObjectData, name: 'hello.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromText(mockClient, textContent, 'hello.txt');

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'hello.txt', content_type: 'text', metadata: null },
        undefined,
      );
      // uploadFromText uses Blob for fetch body
      const fetchCalls = ((global as any).fetch as jest.Mock).mock.calls;
      expect(fetchCalls[0][0]).toBe('https://upload.example.com/text');
      expect(fetchCalls[0][1].method).toBe('PUT');
      expect(fetchCalls[0][1].body).toBeInstanceOf(Blob);
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('text-123');
    });

    it('should upload text content with custom metadata', async () => {
      const textContent = '{"key": "value"}';
      const mockObjectData = { id: 'json-123', upload_url: 'https://upload.example.com/json' };
      const mockObjectInfo = { ...mockObjectData, name: 'data.json', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromText(mockClient, textContent, 'data.json', {
        metadata: { format: 'json' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'data.json', content_type: 'text', metadata: { format: 'json' } },
        { metadata: { format: 'json' } },
      );
      expect(result.id).toBe('json-123');
    });

    it('should handle upload failures gracefully', async () => {
      const textContent = 'test content';
      const mockObjectData = { id: 'text-456', upload_url: 'https://upload.example.com/text' };
      const mockObjectInfo = { ...mockObjectData, name: 'test.txt', state: 'UPLOADING' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(StorageObject.uploadFromText(mockClient, textContent, 'test.txt')).rejects.toThrow(
        'Failed to upload text: Upload failed: 403 Forbidden',
      );
    });

    it('should complete full upload lifecycle', async () => {
      const textContent = 'lifecycle test content';
      const mockObjectData = { id: 'lifecycle-text-123', upload_url: 'https://upload.example.com/lifecycle' };
      const mockObjectInfo = { ...mockObjectData, name: 'lifecycle.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromText(mockClient, textContent, 'lifecycle.txt');

      // Verify all three steps were called
      expect(mockClient.objects.create).toHaveBeenCalledTimes(1);
      expect((global as any).fetch).toHaveBeenCalledTimes(1);
      expect(mockClient.objects.complete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(StorageObject);
    });
  });

  describe('uploadFromBuffer', () => {
    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
      // Reset global fetch mock
      ((global as any).fetch as jest.Mock).mockClear();
    });

    it('should upload buffer with specified content-type and name', async () => {
      const buffer = Buffer.from('buffer content');
      const mockObjectData = { id: 'buffer-123', upload_url: 'https://upload.example.com/buffer' };
      const mockObjectInfo = { ...mockObjectData, name: 'buffer.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromBuffer(mockClient, buffer, 'buffer.txt', 'text', {
        metadata: { source: 'buffer' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'buffer.txt', content_type: 'text', metadata: { source: 'buffer' } },
        { metadata: { source: 'buffer' } },
      );
      // uploadFromBuffer uses Blob for fetch body
      const fetchCalls = ((global as any).fetch as jest.Mock).mock.calls;
      expect(fetchCalls[0][0]).toBe('https://upload.example.com/buffer');
      expect(fetchCalls[0][1].method).toBe('PUT');
      expect(fetchCalls[0][1].body).toBeInstanceOf(Blob);
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('buffer-123');
    });

    it('should throw error in browser environment', async () => {
      // Mock browser environment
      const originalProcess = global.process;
      delete (global as any).process;

      const buffer = Buffer.from('test');
      await expect(StorageObject.uploadFromBuffer(mockClient, buffer, 'test.txt', 'text')).rejects.toThrow(
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

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(StorageObject.uploadFromBuffer(mockClient, buffer, 'test.txt', 'text')).rejects.toThrow(
        'Failed to upload buffer: Upload failed: 403 Forbidden',
      );
    });

    it('should complete full upload lifecycle', async () => {
      const buffer = Buffer.from('lifecycle test');
      const mockObjectData = { id: 'lifecycle-123', upload_url: 'https://upload.example.com/lifecycle' };
      const mockObjectInfo = { ...mockObjectData, name: 'lifecycle.txt', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromBuffer(mockClient, buffer, 'lifecycle.txt', 'text');

      // Verify all three steps were called
      expect(mockClient.objects.create).toHaveBeenCalledTimes(1);
      expect((global as any).fetch).toHaveBeenCalledTimes(1);
      expect(mockClient.objects.complete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(StorageObject);
    });
  });

  describe('uploadFromDir', () => {
    let mockTar: any;

    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();
      // Reset global fetch mock
      ((global as any).fetch as jest.Mock).mockClear();
      // Get tar mock
      mockTar = require('tar');
      // Reset ignore matcher mock
      const ignoreMod = require('../../src/lib/ignore-matcher');
      ignoreMod.loadIgnoreMatcher.mockResolvedValue(null);
    });

    it('should upload a directory as gzipped tarball', async () => {
      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true, size: 100 });
      mockFs.mkdtemp.mockResolvedValue('/tmp/runloop-upload-123');
      
      // Mock write stream
      const mockWriteStream = {
        on: jest.fn().mockReturnThis(),
      };
      mockFsSync.createWriteStream.mockReturnValue(mockWriteStream);

      // Mock read stream
      const mockReadStream = {
        pipe: jest.fn(),
      };
      mockFsSync.createReadStream.mockReturnValue(mockReadStream);

      // Mock tar stream
      const mockTarStream = {
        pipe: jest.fn((dest) => {
            // Trigger finish immediately for test
            const finishCall = dest.on.mock.calls.find((c: any) => c[0] === 'finish');
            if (finishCall) finishCall[1]();
            return dest;
        }),
        on: jest.fn(),
      };
      mockTar.create.mockReturnValue(mockTarStream);

      const mockObjectData = { id: 'dir-123', upload_url: 'https://upload.example.com/dir' };
      const mockObjectInfo = { ...mockObjectData, name: 'project.tar.gz', state: 'UPLOADING' };
      const mockCompletedData = { ...mockObjectInfo, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.retrieve.mockResolvedValue(mockObjectInfo);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromDir(mockClient, './my-project', {
        name: 'project.tar.gz',
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'project.tar.gz', content_type: 'tgz' },
        expect.any(Object), // Match any options object, simplified check
      );
      expect(mockTar.create).toHaveBeenCalled();
      expect(mockFs.mkdtemp).toHaveBeenCalled();
      expect(mockFsSync.createWriteStream).toHaveBeenCalled();
      expect(mockFsSync.createReadStream).toHaveBeenCalled();
      expect(mockFs.rm).toHaveBeenCalledWith('/tmp/runloop-upload-123', { recursive: true, force: true });
      expect(result).toBeInstanceOf(StorageObject);
      expect(result.id).toBe('dir-123');
    });

    it('should respect ignore matcher when building tarball', async () => {
      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true, size: 100 });
      mockFs.mkdtemp.mockResolvedValue('/tmp/runloop-upload-123');

      // Mocks for streams
      const mockWriteStream = {
        on: jest.fn().mockReturnThis(),
      };
      mockFsSync.createWriteStream.mockReturnValue(mockWriteStream);
      mockFsSync.createReadStream.mockReturnValue({});

      // Provide a fake matcher
      const matcher = { matches: jest.fn() };
      const ignoreMod = require('../../src/lib/ignore-matcher');
      ignoreMod.loadIgnoreMatcher.mockResolvedValue(matcher);

      // Mock tar stream
      const mockTarStream = {
        pipe: jest.fn((dest) => {
            const finishCall = dest.on.mock.calls.find((c: any) => c[0] === 'finish');
            if (finishCall) finishCall[1]();
            return dest;
        }),
        on: jest.fn(),
      };
      mockTar.create.mockReturnValue(mockTarStream);

      const mockObjectData = { id: 'dir-ignore', upload_url: 'https://upload.example.com/dir' };
      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.complete.mockResolvedValue({ ...mockObjectData, state: 'READ_ONLY' });
      ((global as any).fetch as jest.Mock).mockResolvedValue({ ok: true });

      await StorageObject.uploadFromDir(mockClient, './my-project', {
        name: 'project.tar.gz',
      });

      // Ensure we attempted to load a matcher for the directory
      expect(ignoreMod.loadIgnoreMatcher).toHaveBeenCalledWith('./my-project', 'docker');

      // Inspect filter behavior
      expect(mockTar.create).toHaveBeenCalled(); // Fix brittle test: Assert called first
      const tarOptions = mockTar.create.mock.calls[0][0];
      expect(typeof tarOptions.filter).toBe('function');

      matcher.matches.mockReturnValue(true);
      expect(tarOptions.filter('ignored.txt')).toBe(false);

      matcher.matches.mockReturnValue(false);
      expect(tarOptions.filter('kept.txt')).toBe(true);
      // Normalization of ./ prefix
      expect(tarOptions.filter('./kept.txt')).toBe(true);
    });

    it('should upload directory with TTL and metadata', async () => {
      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true, size: 100 });
      mockFs.mkdtemp.mockResolvedValue('/tmp/runloop-upload-123');

      // Mocks for streams
      const mockWriteStream = {
        on: jest.fn().mockReturnThis(),
      };
      mockFsSync.createWriteStream.mockReturnValue(mockWriteStream);
      mockFsSync.createReadStream.mockReturnValue({});

      // Mock tar stream
      const mockTarStream = {
        pipe: jest.fn((dest) => {
            const finishCall = dest.on.mock.calls.find((c: any) => c[0] === 'finish');
            if (finishCall) finishCall[1]();
            return dest;
        }),
        on: jest.fn(),
      };
      mockTar.create.mockReturnValue(mockTarStream);

      const mockObjectData = { id: 'dir-456', upload_url: 'https://upload.example.com/dir' };
      const mockCompletedData = { ...mockObjectData, state: 'READ_ONLY' };

      mockClient.objects.create.mockResolvedValue(mockObjectData);
      mockClient.objects.complete.mockResolvedValue(mockCompletedData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await StorageObject.uploadFromDir(mockClient, './my-project', {
        name: 'project.tar.gz',
        ttl_ms: 3600000,
        metadata: { project: 'demo' },
      });

      expect(mockClient.objects.create).toHaveBeenCalledWith(
        { name: 'project.tar.gz', content_type: 'tgz', metadata: { project: 'demo' }, ttl_ms: 3600000 },
        expect.anything(),
      );
      expect(result.id).toBe('dir-456');
    });

    it('should throw error if path is not a directory', async () => {
      mockFs.stat.mockResolvedValue({ isDirectory: () => false });

      await expect(
        StorageObject.uploadFromDir(mockClient, './file.txt', { name: 'archive.tar.gz' }),
      ).rejects.toThrow('Path is not a directory: ./file.txt');
    });

    it('should throw error if directory does not exist', async () => {
      mockFs.stat.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(
        StorageObject.uploadFromDir(mockClient, './nonexistent', { name: 'archive.tar.gz' }),
      ).rejects.toThrow('Failed to access directory ./nonexistent');
    });

    it('should throw error in browser environment', async () => {
      const originalProcess = global.process;
      delete (global as any).process;

      await expect(
        StorageObject.uploadFromDir(mockClient, './project', { name: 'project.tar.gz' }),
      ).rejects.toThrow('File upload methods are only available in Node.js environment');

      global.process = originalProcess;
    });

    it('should handle upload failures gracefully', async () => {
      mockFs.stat.mockResolvedValue({ isDirectory: () => true, size: 100 });
      mockFs.mkdtemp.mockResolvedValue('/tmp/runloop-upload-123');
      
      const mockWriteStream = {
        on: jest.fn().mockReturnThis(),
      };
      mockFsSync.createWriteStream.mockReturnValue(mockWriteStream);
      mockFsSync.createReadStream.mockReturnValue({});

      const mockTarStream = {
        pipe: jest.fn((dest) => {
            const finishCall = dest.on.mock.calls.find((c: any) => c[0] === 'finish');
            if (finishCall) finishCall[1]();
            return dest;
        }),
        on: jest.fn(),
      };
      mockTar.create.mockReturnValue(mockTarStream);

      const mockObjectData = { id: 'dir-999', upload_url: 'https://upload.example.com/dir' };
      mockClient.objects.create.mockResolvedValue(mockObjectData);

      ((global as any).fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        StorageObject.uploadFromDir(mockClient, './project', { name: 'project.tar.gz' }),
      ).rejects.toThrow('Failed to upload tarball: Upload failed: 500 Internal Server Error');
    });
  });

  describe('error handling', () => {
    it('should handle create errors', async () => {
      const error = new Error('Create failed');
      mockClient.objects.create.mockRejectedValue(error);

      await expect(
        StorageObject.create(
          mockClient,
          {
            name: 'test.txt',
            content_type: 'text',
          },
          {},
        ),
      ).rejects.toThrow('Create failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Not found');
      mockClient.objects.retrieve.mockRejectedValue(error);

      const obj = StorageObject.fromId(mockClient, 'non-existent');
      await expect(obj.getInfo()).rejects.toThrow('Not found');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.objects.list.mockRejectedValue(error);

      await expect(StorageObject.list(mockClient, undefined, {})).rejects.toThrow('List failed');
    });
  });
});
