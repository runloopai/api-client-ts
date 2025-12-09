import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ObjectView,
  ObjectCreateParams,
  ObjectDownloadURLView,
  ObjectListParams,
} from '../resources/objects';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as tar from 'tar';
import {
  createIgnoreMatcher,
  loadIgnoreMatcher,
  loadIgnoreMatcherFromFile,
  type IgnoreMatcher,
} from '../lib/ignore-matcher';

// Extract the content type from the API types
type ContentType = ObjectCreateParams['content_type'];

// Content-type mapping for file extensions
const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  // Text
  '.txt': 'text',
  '.html': 'text',
  '.css': 'text',
  '.js': 'text',
  '.json': 'text',
  '.xml': 'text',
  '.yaml': 'text',
  '.yml': 'text',
  '.md': 'text',
  '.csv': 'text',
  // Archives
  '.gz': 'gzip',
  '.tar': 'tar',
  '.tgz': 'tgz',
  '.tar.gz': 'tgz',
  // Default to unspecified for unknown
};

function detectContentType(filePath: string): ContentType {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 'tgz';
  const ext = path.extname(lower);
  return CONTENT_TYPE_MAP[ext] || 'unspecified';
}

function assertNodeEnvironment(): void {
  if (typeof process === 'undefined' || !process.versions?.node) {
    throw new Error('File upload methods are only available in Node.js environment');
  }
}

/**
 * Object-oriented interface for working with Storage Objects.
 *
 * ## Overview
 *
 * The `StorageObject` class provides a high-level API for managing storage objects,
 * which are files stored in Runloop's object storage. Storage objects can be uploaded,
 * downloaded, and managed with metadata.
 *
 * ## Quickstart
 *
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client-ts';
 *
 * const runloop = new RunloopSDK();
 * const storageObject = await runloop.storageObject.uploadFromFile(
 *   './my-file.txt',
 *   'my-file.txt',
 *   { metadata: { project: 'demo' } },
 * );
 * const text = await storageObject.downloadAsText();
 * ```
 */
export class StorageObject {
  private client: Runloop;
  private _id: string;
  private _uploadUrl?: string | null;

  private constructor(client: Runloop, id: string, uploadUrl?: string | null) {
    this.client = client;
    this._id = id;
    this._uploadUrl = uploadUrl ?? null;
  }

  /**
   * Create a new Storage Object.
   * This method returns a StorageObject instance that you can use to upload content.
   *
   * You should use the uploadFromFile() or uploadFromBuffer() methods to upload content and handle the complete process for you. If you need more control, you can use the uploadContent() method.
   *
   * To upload content:
   * 1. To upload you call uploadContent() or use the getDownloadUrl() method to get the upload URL and upload the content manually.
   * 2. You must call complete() to mark the upload as complete.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * // Step 1: Create object
   * const object = await runloop.storageObject.create({
   *   name: 'my-file.txt',
   *   content_type: 'text',
   * });
   *
   * // Step 2: Upload content
   * await object.uploadContent('File contents');
   *
   * // Step 3: Mark as complete
   * await object.complete();
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {ObjectCreateParams} params - Parameters for creating the object
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance with upload URL
   */
  static async create(
    client: Runloop,
    params: ObjectCreateParams,
    options?: Core.RequestOptions,
  ): Promise<StorageObject> {
    const objectData = await client.objects.create(params, options);
    return new StorageObject(client, objectData.id, objectData.upload_url);
  }

  /**
   * Create a StorageObject instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * See the {@link StorageObjectOps.fromId} method for calling this
   * @private
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} id - The object ID
   * @returns {StorageObject} A {@link StorageObject} instance
   */
  static fromId(client: Runloop, id: string): StorageObject {
    return new StorageObject(client, id, null);
  }

  /**
   * List all storage objects with optional filters.
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {ObjectListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<StorageObject[]>} Array of {@link StorageObject} instances
   */
  static async list(
    client: Runloop,
    params?: ObjectListParams,
    options?: Core.RequestOptions,
  ): Promise<StorageObject[]> {
    const objects = await client.objects.list(params, options);
    const result: StorageObject[] = [];

    for await (const obj of objects) {
      result.push(new StorageObject(client, obj.id, null));
    }

    return result;
  }

  /**
   * Upload a file directly from the filesystem (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload file content to the provided URL
   * 3. Mark upload as complete
   *
   * See the {@link StorageObjectOps.uploadFromFile} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = await runloop.storageObject.uploadFromFile(
   *   './package.json',
   *   'package.json',
   *   {
   *     contentType: 'text',
   *     metadata: { project: 'my-app' },
   *   }
   * );
   * console.log(`Uploaded: ${object.id}`);
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} filePath - Path to the file to upload
   * @param {string} name - Name for the uploaded object
   * @param {Core.RequestOptions & { contentType?: ContentType; metadata?: Record<string, string> }} [options] - Request options with optional client, content type, and metadata
   * @returns {Promise<StorageObject>} A completed {@link StorageObject} instance
   */
  static async uploadFromFile(
    client: Runloop,
    filePath: string,
    name: string,
    options?: Core.RequestOptions & {
      contentType?: ContentType;
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    assertNodeEnvironment();

    // Check if file exists and get stats
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to access file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Read file content immediately to fail fast if file doesn't exist
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Determine content type
    const contentType = options?.contentType || detectContentType(filePath);

    // Step 1: Create the object
    const createParams: ObjectCreateParams = {
      name,
      content_type: contentType,
      metadata: options?.metadata || null,
    };

    const objectData = await client.objects.create(createParams, options);
    const storageObject = new StorageObject(client, objectData.id, objectData.upload_url);

    const uploadUrl = objectData.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileBuffer,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 3: Mark upload as complete
    await storageObject.complete();

    return storageObject;
  }

  /**
   * Upload text content directly.
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload text content to the provided URL
   * 3. Mark upload as complete
   *
   * See the {@link StorageObjectOps.uploadFromText} method for calling this
   * @private
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = await runloop.storageObject.uploadFromText(
   *   'Hello, World!',
   *   'greeting.txt',
   *   { metadata: { type: 'greeting' } }
   * );
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {string} text - The text content to upload
   * @param {string} name - Name for the object
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options with optional metadata
   * @returns {Promise<StorageObject>} A completed {@link StorageObject} instance
   */
  static async uploadFromText(
    client: Runloop,
    text: string,
    name: string,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    const createParams: ObjectCreateParams = {
      name,
      content_type: 'text',
      metadata: options?.metadata || null,
    };

    const objectData = await client.objects.create(createParams, options);
    const storageObject = new StorageObject(client, objectData.id, objectData.upload_url);

    const uploadUrl = objectData.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: new Blob([text]),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to upload text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 3: Mark upload as complete
    await storageObject.complete();

    return storageObject;
  }

  /**
   * Upload content from a Buffer (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload buffer content to the provided URL
   * 3. Mark upload as complete
   *
   * @example
   * See the {@link StorageObjectOps.uploadFromBuffer} method for calling this
   * @private
   *
   * ```typescript
   * const runloop = new RunloopSDK();
   * const buffer = Buffer.from('Binary data');
   * const object = await runloop.storageObject.uploadFromBuffer(
   *   buffer,
   *   'data.bin',
   *   'unspecified',
   *   { metadata: { format: 'binary' } }
   * );
   * ```
   *
   * @param {Runloop} client - The Runloop client instance
   * @param {Buffer} buffer - The buffer content to upload
   * @param {string} name - Name for the object
   * @param {ContentType} contentType - Content type for the object
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options with optional client and metadata
   * @returns {Promise<StorageObject>} A completed {@link StorageObject} instance
   */
  static async uploadFromBuffer(
    client: Runloop,
    buffer: Buffer,
    name: string,
    contentType: ContentType,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    assertNodeEnvironment();

    // Step 1: Create the object
    const createParams: ObjectCreateParams = {
      name,
      content_type: contentType,
      metadata: options?.metadata || null,
    };

    const objectData = await client.objects.create(createParams, options);
    const storageObject = new StorageObject(client, objectData.id, objectData.upload_url);

    const uploadUrl = objectData.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: new Blob([buffer]),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to upload buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 3: Mark upload as complete
    await storageObject.complete();

    return storageObject;
  }

  /**
   * @hidden
   */
  static async uploadFromDir(
    client: Runloop,
    dirPath: string,
    params: Omit<ObjectCreateParams, 'content_type'>,
    options?: Core.RequestOptions & {
      /**
       * Optional ignore configuration for the directory:
       *  - an IgnoreMatcher instance, or
       *  - an array of docker-style glob patterns (as in .dockerignore)
       */
      ignore?: IgnoreMatcher | string[];

      /**
       * Optional path to a specific .dockerignore-style file to use instead of
       * the default `<dirPath>/.dockerignore`.
       */
      dockerignorePath?: string;
    },
  ): Promise<StorageObject> {
    assertNodeEnvironment();

    // Verify directory exists and is actually a directory
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to access directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Extract SDK-specific options to avoid leaking them to the API client
    const { ignore, dockerignorePath, ...requestOptions } = options || {};

    // Create a temporary file for the tarball
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runloop-upload-'));
    const tmpFilePath = path.join(tmpDir, 'upload.tar.gz');

    try {
      let matcher: IgnoreMatcher | null = null;

      if (ignore && typeof (ignore as any).matches === 'function') {
        matcher = ignore as IgnoreMatcher;
      } else if (ignore && Array.isArray(ignore)) {
        matcher = createIgnoreMatcher(ignore, 'docker');
      } else if (dockerignorePath) {
        matcher = await loadIgnoreMatcherFromFile(dockerignorePath, 'docker');
      } else {
        matcher = await loadIgnoreMatcher(dirPath, 'docker');
      }

      const tarStream = tar.create(
        {
          gzip: true,
          cwd: dirPath,
          filter: (entryPath: string) => {
            if (!matcher) return true;

            // Normalize to forward-slash relative paths
            let rel = entryPath.replace(/\\/g, '/');

            // tar may prefix entries with "./"
            if (rel.startsWith('./')) rel = rel.slice(2);
            if (!rel || rel === '.') return true;

            // Return true to include; matcher.matches == "ignored"
            return !matcher.matches(rel);
          },
        },
        ['.'],
      );

      // Pipe the tar stream to the temporary file
      await new Promise<void>((resolve, reject) => {
        const dest = fsSync.createWriteStream(tmpFilePath);
        dest.on('finish', resolve);
        dest.on('error', reject);
        tarStream.on('error', reject);
        tarStream.pipe(dest);
      });

      // Create the object.
      const createParams: ObjectCreateParams = { ...params, content_type: 'tgz' };
      // Cast requestOptions to Core.RequestOptions to satisfy the type checker,
      // assuming the caller provided valid options minus our custom ones.
      const objectData = await client.objects.create(createParams, requestOptions as Core.RequestOptions);
      const storageObject = new StorageObject(client, objectData.id, objectData.upload_url);

      const uploadUrl = objectData.upload_url;
      if (!uploadUrl) {
        throw new Error('No upload URL available. Object may already be completed or deleted.');
      }

      // Upload the file from disk
      try {
        const fileStream = fsSync.createReadStream(tmpFilePath);
        const stats = await fs.stat(tmpFilePath);

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: fileStream as any,
          headers: {
            'Content-Length': stats.size.toString(),
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        throw new Error(
          `Failed to upload tarball: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      await storageObject.complete();

      return storageObject;
    } catch (error) {
      // Re-throw errors related to tar creation or other steps
      if (error instanceof Error && error.message.startsWith('Failed to upload tarball')) {
        throw error;
      }
      throw new Error(
        `Failed to create tarball from directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      // Clean up temporary file and directory
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Get the object ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete object data from the API.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = runloop.storageObject.fromId('object-123');
   * const info = await object.getInfo();
   * console.log(`Name: ${info.name}, Size: ${info.size}, Type: ${info.content_type}`);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ObjectView>} The object data
   */
  async getInfo(options?: Core.RequestOptions): Promise<ObjectView> {
    return this.client.objects.retrieve(this._id, options);
  }

  /**
   * Upload content to the storage object using the presigned URL.
   * This is a convenience method that handles the HTTP PUT request.
   *
   * Note: For large files or binary content, you may want to use the uploadUrl directly
   * with your own upload logic.
   *
   * When this is done call complete() to mark the upload as complete.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = await runloop.storageObject.create({
   *   name: 'data.txt',
   *   content_type: 'text',
   * });
   * await object.uploadContent('Hello, World!');
   * await object.complete();
   * ```
   *
   * @param {string | Buffer} content - The content to upload (string or Buffer)
   * @returns {Promise<void>} Promise that resolves when upload is complete
   */
  async uploadContent(content: string | Buffer): Promise<void> {
    if (!this._uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      // Always convert to Buffer to ensure consistent handling
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');

      // Use fetch with absolutely minimal configuration
      const response = await fetch(this._uploadUrl, {
        method: 'PUT',
        body: buffer,
        // Absolutely no headers - let the presigned URL handle everything
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
    } catch (error) {
      throw new Error(
        `Upload failed to ${this._uploadUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Mark the object's upload as complete, transitioning it from UPLOADING to READ_ONLY state.
   * Call this after you've finished uploading content via the upload URL.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves when the upload is marked as complete
   */
  async complete(options?: Core.RequestOptions): Promise<void> {
    await this.client.objects.complete(this._id, {}, options);
  }

  /**
   * Get a presigned download URL for this object.
   * The URL will be valid for the specified duration (default: 1 hour).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = runloop.storageObject.fromId('object-123');
   * const { download_url } = await object.getDownloadUrl(3600); // Valid for 1 hour
   * console.log(`Download URL: ${download_url}`);
   * ```
   *
   * @param {number} [durationSeconds] - How long the URL should be valid (default: 3600)
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<ObjectDownloadURLView>} Download URL information
   */
  async getDownloadUrl(
    durationSeconds?: number,
    options?: Core.RequestOptions,
  ): Promise<ObjectDownloadURLView> {
    return this.client.objects.download(
      this._id,
      durationSeconds !== undefined ? { duration_seconds: durationSeconds } : {},
      options,
    );
  }

  /**
   * Download the content of this object as text.
   * This is a convenience method that fetches the download URL and retrieves the content.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = runloop.storageObject.fromId('object-123');
   * const content = await object.downloadAsText();
   * console.log(content);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<string>} The object content as a string
   */
  async downloadAsText(options?: Core.RequestOptions): Promise<string> {
    const { download_url } = await this.getDownloadUrl(undefined, options);
    const response = await fetch(download_url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Download the content of this object as a Buffer.
   * This is a convenience method that fetches the download URL and retrieves the content.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const object = runloop.storageObject.fromId('object-123');
   * const buffer = await object.downloadAsBuffer();
   * fs.writeFileSync('downloaded.bin', buffer);
   * ```
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Buffer>} The object content as a Buffer
   */
  async downloadAsBuffer(options?: Core.RequestOptions): Promise<Buffer> {
    const { download_url } = await this.getDownloadUrl(undefined, options);
    const response = await fetch(download_url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete this object. This action is irreversible.
   *
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<void>} Promise that resolves when the object is deleted
   */
  async delete(options?: Core.RequestOptions): Promise<void> {
    await this.client.objects.delete(this._id, {}, options);
  }
}
