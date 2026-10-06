import type { Runloop } from '../index';
import type * as Core from '../core';
import type { SecretView, SecretUpdateByIDParams } from '../resources/secrets';

/**
 * An exact Secret row, unlike the name-bound {@link Secret}.
 *
 * Obtain one with `sdk.secret.fromId(id)`. Construction makes no request.
 * The ID never changes, but another writer can change the row's value. Requests
 * retain the generated client's retry policy; they are not exactly-once operations.
 * Use `getInfo()` for the name and other metadata. Values are never returned.
 *
 * @category Secret
 */
export class SecretById {
  private constructor(
    private readonly client: Runloop,
    private readonly _id: string,
  ) {}

  /** @internal Construct an ID-bound handle without fetching it. */
  static fromId(client: Runloop, id: string): SecretById {
    return new SecretById(client, id);
  }

  /** The exact row ID, not a name or a value-version identifier. */
  get id(): string {
    return this._id;
  }

  /** Retrieve metadata for this ID. A missing ID never falls back to a name. */
  async getInfo(options?: Core.RequestOptions): Promise<SecretView> {
    return this.client.secrets.retrieveById(this._id, options);
  }

  /** Replace this row's value. Existing devbox environments and issued tokens are unchanged. */
  async update(params: SecretUpdateByIDParams, options?: Core.RequestOptions): Promise<SecretView> {
    return this.client.secrets.updateById(this._id, params, options);
  }

  /** Delete only this row. An older same-name row may become visible to name readers. */
  async delete(options?: Core.RequestOptions): Promise<SecretView> {
    return this.client.secrets.deleteById(this._id, {}, options);
  }
}
