import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ObjectView,
  ObjectCreateParams,
  ObjectDownloadURLView,
  ObjectListParams,
} from '../resources/objects';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Content-type mapping for file extensions
const CONTENT_TYPE_MAP: Record<string, string> = {
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

function detectContentType(filePath: string): string {
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
 * Storage Objects are similar to S3 objects - they allow you to store
 * arbitrary data with metadata for later retrieval.
 *
 * Example usage:
 * ```typescript
 * // Make sure to set RUNLOOP_API_KEY environment variable
 * // export RUNLOOP_API_KEY="your-api-key"
 *
 * // Upload a file directly (Node.js only)
 * const obj = await StorageObject.uploadFromFile('./data.txt', 'my-data.txt');
 *
 * // Upload archive files (auto-detects content type)
 * const archive = await StorageObject.uploadFromFile('./files/test-archive.tar.gz', 'my-archive.tar.gz');
 *
 * // Upload from buffer
 * const buffer = Buffer.from('content');
 * const obj = await StorageObject.uploadFromBuffer(buffer, 'data.txt', 'text');
 *
 * // Traditional approach - create, upload, complete
 * const obj = await StorageObject.create({
 *   name: 'my-data.txt',
 *   content_type: 'text',
 *   metadata: { project: 'demo' }
 * });
 * await obj.uploadContent('Hello, World!');
 * await obj.complete();
 * ```
 */
export class StorageObject {
  private client: Runloop;
  private _id: string;

  private constructor(client: Runloop, id: string) {
    this.client = client;
    this._id = id;
  }

  /**
   * Create a new Storage Object.
   * This returns an object with an upload URL that you can use to upload content.
   *
   * @param params - Parameters for creating the object
   * @param options - Request options with optional client override
   * @returns An Object instance with upload URL
   */
  static async create(
    params: ObjectCreateParams,
    options?: Core.RequestOptions & { client?: Runloop },
  ): Promise<StorageObject> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const objectData = await client.objects.create(params, requestOptions);
    return new StorageObject(client, objectData.id);
  }

  /**
   * Create a StorageObject instance by ID without retrieving from API.
   * Use getInfo() to fetch the actual data when needed.
   *
   * @param id - The object ID
   * @param options - Request options with optional client override
   * @returns An Object instance
   */
  static fromId(id: string, options?: Core.RequestOptions & { client?: Runloop }): StorageObject {
    const client = options?.client || Runloop.getDefaultClient();
    return new StorageObject(client, id);
  }

  /**
   * List all storage objects with optional filters.
   *
   * @param params - Optional filter parameters
   * @param options - Request options with optional client override
   * @returns Array of Object instances
   */
  static async list(
    params?: ObjectListParams,
    options?: Core.RequestOptions & { client?: Runloop },
  ): Promise<StorageObject[]> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const objects = await client.objects.list(params, requestOptions);
    const result: StorageObject[] = [];

    for await (const obj of objects) {
      result.push(new StorageObject(client, obj.id));
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
   * @param filePath - Path to the file to upload
   * @param name - Name for the uploaded object
   * @param options - Request options with optional client, content type, and metadata
   * @returns A completed StorageObject instance
   */
  static async uploadFromFile(
    filePath: string,
    name: string,
    options?: Core.RequestOptions & {
      client?: Runloop;
      contentType?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    assertNodeEnvironment();

    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    // Check if file exists and get stats
    try {
      const stats = fs.statSync(filePath);
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
      fileBuffer = fs.readFileSync(filePath);
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
      content_type: contentType as any,
      metadata: options?.metadata || null,
    };

    const objectData = await client.objects.create(createParams, requestOptions);
    const storageObject = new StorageObject(client, objectData.id);

    const uploadUrl = objectData.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      const response = await (globalThis as any).fetch(uploadUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Length': fileBuffer.length.toString(),
        },
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
   * Upload content from a Buffer (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload buffer content to the provided URL
   * 3. Mark upload as complete
   *
   * @param buffer - The buffer content to upload
   * @param name - Name for the object
   * @param contentType - Content type for the object
   * @param options - Request options with optional client and metadata
   * @returns A completed StorageObject instance
   */
  static async uploadFromBuffer(
    buffer: Buffer,
    name: string,
    contentType: string,
    options?: Core.RequestOptions & {
      client?: Runloop;
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    assertNodeEnvironment();

    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    // Step 1: Create the object
    const createParams: ObjectCreateParams = {
      name,
      content_type: contentType as any,
      metadata: options?.metadata || null,
    };

    const objectData = await client.objects.create(createParams, requestOptions);
    const storageObject = new StorageObject(client, objectData.id);

    // Step 2: Upload the buffer content
    const objectInfo = await storageObject.getInfo();
    const uploadUrl = objectInfo.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    try {
      const response = await (globalThis as any).fetch(uploadUrl, {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Length': buffer.length.toString(),
        },
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
   * Get the object ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the complete object data from the API.
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
   * @param content - The content to upload (string or Buffer)
   * @param contentType - Optional content type header
   * @returns Promise that resolves when upload is complete
   */
  async uploadContent(content: string | Buffer, contentType?: string): Promise<void> {
    const objectInfo = await this.getInfo();
    const uploadUrl = objectInfo.upload_url;

    if (!uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const response = await (globalThis as any).fetch(uploadUrl, {
      method: 'PUT',
      body: content,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Mark the object's upload as complete, transitioning it from UPLOADING to READ_ONLY state.
   * Call this after you've finished uploading content via the upload URL.
   *
   * @param options - Request options
   */
  async complete(options?: Core.RequestOptions): Promise<void> {
    await this.client.objects.complete(this._id, {}, options);
  }

  /**
   * Get a presigned download URL for this object.
   * The URL will be valid for the specified duration (default: 1 hour).
   *
   * @param durationSeconds - How long the URL should be valid (default: 3600)
   * @param options - Request options
   * @returns Download URL information
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
   * @param options - Request options
   * @returns The object content as a string
   */
  async downloadAsText(options?: Core.RequestOptions): Promise<string> {
    const { download_url } = await this.getDownloadUrl(undefined, options);
    const response = await (globalThis as any).fetch(download_url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Download the content of this object as a Buffer.
   * This is a convenience method that fetches the download URL and retrieves the content.
   *
   * @param options - Request options
   * @returns The object content as a Buffer
   */
  async downloadAsBuffer(options?: Core.RequestOptions): Promise<Buffer> {
    const { download_url } = await this.getDownloadUrl(undefined, options);
    const response = await (globalThis as any).fetch(download_url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete this object. This action is irreversible.
   *
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<void> {
    await this.client.objects.delete(this._id, {}, options);
  }
}
