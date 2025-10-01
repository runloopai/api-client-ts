import type { Runloop } from '../index';
import type * as Core from '../core';
import type {
  ObjectView,
  ObjectCreateParams,
  ObjectDownloadURLView,
  ObjectListParams,
} from '../resources/objects';

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
  private objectData: ObjectView;

  private constructor(client: Runloop, objectData: ObjectView) {
    this.client = client;
    this.objectData = objectData;
  }

  /**
   * Create a new Storage Object.
   * This returns an object with an upload URL that you can use to upload content.
   *
   * @param client - The Runloop API client
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
    return new StorageObject(client, objectData);
  }

  /**
   * Load an existing Storage Object by ID.
   *
   * @param client - The Runloop API client
   * @param id - The object ID
   * @param options - Request options
   * @returns An Object instance
   */
  static async get(client: Runloop, id: string, options?: Core.RequestOptions): Promise<StorageObject> {
    const objectData = await client.objects.retrieve(id, options);
    return new StorageObject(client, objectData);
  }

  /**
   * List all storage objects with optional filters.
   *
   * @param client - The Runloop API client
   * @param params - Optional filter parameters
   * @param options - Request options
   * @returns Array of Object instances
   */
  static async list(
    client: Runloop,
    params?: ObjectListParams,
    options?: Core.RequestOptions,
  ): Promise<Object[]> {
    const objects = await client.objects.list(params, options);
    const result: StorageObject[] = [];

    for await (const obj of objects) {
      result.push(new StorageObject(client, obj));
    }

    return result;
  }

  /**
   * Get the object ID.
   */
  get id(): string {
    return this.objectData.id;
  }

  /**
   * Get the object name.
   */
  get name(): string {
    return this.objectData.name;
  }

  /**
   * Get the content type.
   */
  get contentType(): ObjectView['content_type'] {
    return this.objectData.content_type;
  }

  /**
   * Get the current state (UPLOADING, READ_ONLY, DELETED).
   */
  get state(): string {
    return this.objectData.state;
  }

  /**
   * Get the size in bytes (null until uploaded and completed).
   */
  get sizeBytes(): number | null {
    return this.objectData.size_bytes ?? null;
  }

  /**
   * Get the presigned upload URL (only available after creation, before completion).
   */
  get uploadUrl(): string | null {
    return this.objectData.upload_url ?? null;
  }

  /**
   * Get the complete object data.
   */
  get data(): ObjectView {
    return this.objectData;
  }

  /**
   * Refresh the object data from the API.
   */
  async refresh(options?: Core.RequestOptions): Promise<void> {
    this.objectData = await this.client.objects.retrieve(this.objectData.id, options);
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
    if (!this.uploadUrl) {
      throw new Error('No upload URL available. Object may already be completed or deleted.');
    }

    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const response = await fetch(this.uploadUrl, {
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
    this.objectData = await this.client.objects.complete(this.objectData.id, {}, options);
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
      this.objectData.id,
      { duration_seconds: durationSeconds },
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
    this.objectData = await this.client.objects.delete(this.objectData.id, {}, options);
  }

  /**
   * Access to the underlying objects API resource for advanced operations.
   */
  get api() {
    return this.client.objects;
  }
}
