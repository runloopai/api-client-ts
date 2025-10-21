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
   * Example:
   * ```typescript
   * const storageObject = await StorageObject.create(client, {
   *   name: 'my-upload.txt',
   *   content_type: 'text',
   *   metadata: { project: 'demo' },
   * });
   * await storageObject.uploadContent('Hello, World!');
   * await storageObject.complete();
   *
   * Upload from file example:
   * ```typescript
   * const storageObject = await StorageObject.uploadFromFile(client, './my-file.txt', 'my-upload.txt');
   * console.log(storageObject.id);
   * ```
   *
   * @param client - The Runloop client instance
   * @param params - Parameters for creating the object
   * @param options - Request options
   * @returns An Object instance with upload URL
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
   * @param client - The Runloop client instance
   * @param id - The object ID
   * @returns An Object instance
   */
  static fromId(client: Runloop, id: string): StorageObject {
    return new StorageObject(client, id, null);
  }

  /**
   * List all storage objects with optional filters.
   *
   * @param client - The Runloop client instance
   * @param params - Optional filter parameters
   * @param options - Request options
   * @returns Array of Object instances
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
   * @param filePath - Path to the file to upload
   * @param name - Name for the uploaded object
   * @param options - Request options with optional client, content type, and metadata
   * @returns A completed StorageObject instance
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
   * @param text - The text content to upload
   * @param name - Name for the object
   * @param options - Request options with optional metadata
   * @returns A completed StorageObject instance
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
   * @param buffer - The buffer content to upload
   * @param name - Name for the object
   * @param contentType - Content type for the object
   * @param options - Request options with optional client and metadata
   * @returns A completed StorageObject instance
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
   * When this is done call complete() to mark the upload as complete.
   *
   * @param content - The content to upload (string or Buffer)
   * @returns Promise that resolves when upload is complete
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
   * @param options - Request options
   * @returns The object content as a Buffer
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
   * @param options - Request options
   */
  async delete(options?: Core.RequestOptions): Promise<void> {
    await this.client.objects.delete(this._id, {}, options);
  }
}
