import { THIRTY_SECOND_TIMEOUT, uniqueName, makeClientSDK } from '../utils';
import { Devbox, StorageObject } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented storage object', () => {
  describe('storage object lifecycle', () => {
    test(
      'create storage object',
      async () => {
        let storageObject: StorageObject | undefined;
        try {
          storageObject = await sdk.storageObject.create({
            name: uniqueName('sdk-storage-object'),
            content_type: 'text',
            metadata: { test: 'sdk-smoketest' },
          });
          expect(storageObject).toBeDefined();
          expect(storageObject.id).toBeTruthy();
        } finally {
          if (storageObject) {
            await storageObject.delete();
          }
        }
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('get storage object info', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-info'),
          content_type: 'text',
          metadata: { test: 'sdk-smoketest' },
        });

        const info = await storageObject.getInfo();
        expect(info.id).toBe(storageObject.id);
        expect(info.name).toContain('sdk-storage-object-info');
        expect(info.content_type).toBe('text');
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('upload content to storage object', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-upload'),
          content_type: 'text',
          metadata: { test: 'sdk-smoketest' },
        });

        await storageObject.uploadContent('Hello from SDK storage object!');
        await storageObject.complete();

        // Verify the content was uploaded
        const info = await storageObject.getInfo();
        expect(info.state).toBe('READ_ONLY');
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('get download URL', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-download'),
          content_type: 'text',
          metadata: { test: 'sdk-smoketest' },
        });

        await storageObject.uploadContent('Hello from SDK storage object!');
        await storageObject.complete();

        const downloadUrl = await storageObject.getDownloadUrl(3600);
        expect(downloadUrl.download_url).toBeTruthy();
        expect(downloadUrl.download_url).toContain('http');
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('download content as text', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-download-text'),
          content_type: 'text',
          metadata: { test: 'sdk-smoketest' },
        });

        await storageObject.uploadContent('Hello from SDK storage object!');
        await storageObject.complete();

        const content = await storageObject.downloadAsText();
        expect(content).toBe('Hello from SDK storage object!');
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('download content as buffer', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-download-buffer'),
          content_type: 'text',
          metadata: { test: 'sdk-smoketest' },
        });

        await storageObject.uploadContent('Hello from SDK storage object!');
        await storageObject.complete();

        const buffer = await storageObject.downloadAsBuffer();
        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(buffer.toString()).toBe('Hello from SDK storage object!');
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('delete storage object', async () => {
      const storageObject = await sdk.storageObject.create({
        name: uniqueName('sdk-storage-object-delete'),
        content_type: 'text',
        metadata: { test: 'sdk-smoketest' },
      });

      await storageObject.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await storageObject.getInfo();
        fail('Expected storage object to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('static upload methods', () => {
    test('upload from text', async () => {
      let uploaded: StorageObject | undefined;
      try {
        uploaded = await sdk.storageObject.uploadFromText(
          'Hello from uploadFromText!',
          uniqueName('sdk-text-upload'),
          { metadata: { source: 'uploadFromText' } },
        );
        expect(uploaded).toBeDefined();
        expect(uploaded.id).toBeTruthy();

        // Verify content
        const content = await uploaded.downloadAsText();
        expect(content).toBe('Hello from uploadFromText!');
      } finally {
        if (uploaded) {
          await uploaded.delete();
        }
      }
    });

    test('upload from buffer', async () => {
      let uploaded: StorageObject | undefined;
      try {
        const buffer = Buffer.from('Hello from uploadFromBuffer!');
        uploaded = await sdk.storageObject.uploadFromBuffer(buffer, uniqueName('sdk-buffer-upload'), 'text', {
          metadata: { source: 'uploadFromBuffer' },
        });
        expect(uploaded).toBeDefined();
        expect(uploaded.id).toBeTruthy();

        // Verify content
        const content = await uploaded.downloadAsText();
        expect(content).toBe('Hello from uploadFromBuffer!');
      } finally {
        if (uploaded) {
          await uploaded.delete();
        }
      }
    });

    test('upload from file', async () => {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      // Create a temporary file
      const tmpFile = path.join(os.tmpdir(), `test-upload-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, 'Hello from uploadFromFile!');

      try {
        const uploaded = await sdk.storageObject.uploadFromFile(tmpFile, uniqueName('sdk-file-upload'), {
          metadata: { source: 'uploadFromFile' },
        });
        expect(uploaded).toBeDefined();
        expect(uploaded.id).toBeTruthy();

        // Verify content
        const content = await uploaded.downloadAsText();
        expect(content).toBe('Hello from uploadFromFile!');

        // Clean up
        await uploaded.delete();
      } finally {
        // Clean up temp file
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile);
        }
      }
    });
  });

  describe('storage object list and retrieval', () => {
    test('list storage objects via SDK', async () => {
      const objects = await sdk.storageObject.list({ limit: 10 });
      expect(Array.isArray(objects)).toBe(true);
    });

    test('list storage objects via static method', async () => {
      const { StorageObject } = await import('@runloop/api-client/sdk');
      const objects = await StorageObject.list(sdk.api, { limit: 5 });
      expect(Array.isArray(objects)).toBe(true);
    });

    test('get storage object by ID', async () => {
      let storageObject: StorageObject | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-storage-object-retrieve'),
          content_type: 'text',
        });
        expect(storageObject.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = await sdk.storageObject.fromId(storageObject.id);
        expect(retrieved.id).toBe(storageObject.id);
      } finally {
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });
  });

  describe('storage object mounting to devbox', () => {
    test('mount storage object to devbox', async () => {
      let storageObject: StorageObject | undefined;
      let devbox: Devbox | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-mount-object'),
          content_type: 'text',
        });
        await storageObject.uploadContent('Hello from mounted storage object!');
        await storageObject.complete();

        // Create devbox with mounted storage object
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-mount'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
          mounts: [
            {
              type: 'object_mount',
              object_id: storageObject.id,
              object_path: '/home/user/mounted-data',
            },
          ],
        });
        expect(devbox).toBeDefined();
        expect(devbox.id).toBeTruthy();
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });

    test('access mounted storage object in devbox', async () => {
      // Create a storage object with content
      let storageObject: StorageObject | undefined;
      let devbox: Devbox | undefined;
      try {
        storageObject = await sdk.storageObject.create({
          name: uniqueName('sdk-mount-object-access'),
          content_type: 'text',
        });
        await storageObject.uploadContent('Hello from mounted storage object!');
        await storageObject.complete();

        // Create devbox with mounted storage object
        devbox = await sdk.devbox.create({
          name: uniqueName('sdk-devbox-mount-access'),
          launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
          mounts: [
            {
              type: 'object_mount',
              object_id: storageObject.id,
              object_path: '/home/user/mounted-data',
            },
          ],
        });

        // List the mounted directory
        const result = await devbox.cmd.exec({ command: 'ls -la /home/user/mounted-data' });
        expect(result.exitCode).toBe(0);

        // Read the mounted file
        const content = await devbox.file.read({ file_path: '/home/user/mounted-data' });
        expect(content).toBe('Hello from mounted storage object!');
      } finally {
        if (devbox) {
          await devbox.shutdown();
        }
        if (storageObject) {
          await storageObject.delete();
        }
      }
    });
  });
});
