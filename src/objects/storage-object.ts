import { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ObjectView,
  ObjectCreateParams,
  ObjectDownloadURLView,
  ObjectListParams,
} from '../resources/objects';
import { ObjectOptions } from './types';

/**
 * Object-oriented interface for working with Storage Objects.
 *
 * Storage Objects are similar to S3 objects - they allow you to store
 * arbitrary data with metadata for later retrieval.
 *
 * Example usage:
 * ```typescript
 * // Create and upload a text object
 * const obj = await StorageObject.create(client, {
 *   name: 'my-data.txt',
 *   content_type: 'text',
 *   metadata: { project: 'demo' }
 * });
 *
 * // Get object information
 * const info = await obj.getInfo();
 * console.log(info.name, info.state);
 *
 * // Upload content to the presigned URL
 * await obj.uploadContent('Hello, World!');
 *
 * // Mark upload as complete
 * await obj.complete();
 *
 * // Later: download the object
 * const downloadUrl = await obj.getDownloadUrl();
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
  static async create(params: ObjectCreateParams, options?: ObjectOptions): Promise<StorageObject> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    const objectData = await client.objects.create(params, requestOptions);
    return new StorageObject(client, objectData.id);
  }

  /**
   * Load an existing Storage Object by ID.
   *
   * @param id - The object ID
   * @param options - Request options with optional client override
   * @returns An Object instance
   */
  static async get(id: string, options?: ObjectOptions): Promise<StorageObject> {
    const client = options?.client || Runloop.getDefaultClient();
    const requestOptions = options;

    // Verify the object exists by retrieving it
    await client.objects.retrieve(id, requestOptions);
    return new StorageObject(client, id);
  }

  /**
   * List all storage objects with optional filters.
   *
   * @param params - Optional filter parameters
   * @param options - Request options with optional client override
   * @returns Array of Object instances
   */
  static async list(params?: ObjectListParams, options?: ObjectOptions): Promise<StorageObject[]> {
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
