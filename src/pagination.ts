// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { AbstractPage, Response, APIClient, FinalRequestOptions, PageInfo } from './core';

export interface BlueprintsCursorIDPageResponse<Item> {
  blueprints: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface BlueprintsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class BlueprintsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements BlueprintsCursorIDPageResponse<Item>
{
  blueprints: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: BlueprintsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.blueprints = body.blueprints || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.blueprints ?? [];
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<BlueprintsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const blueprints = this.getPaginatedItems();
    if (!blueprints.length) {
      return null;
    }

    const id = blueprints[blueprints.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface DevboxesCursorIDPageResponse<Item> {
  devboxes: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface DevboxesCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class DevboxesCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements DevboxesCursorIDPageResponse<Item>
{
  devboxes: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: DevboxesCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.devboxes = body.devboxes || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.devboxes ?? [];
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<DevboxesCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const devboxes = this.getPaginatedItems();
    if (!devboxes.length) {
      return null;
    }

    const id = devboxes[devboxes.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface RepositoriesCursorIDPageResponse<Item> {
  repositories: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface RepositoriesCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class RepositoriesCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements RepositoriesCursorIDPageResponse<Item>
{
  repositories: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: RepositoriesCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.repositories = body.repositories || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.repositories ?? [];
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<RepositoriesCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const repositories = this.getPaginatedItems();
    if (!repositories.length) {
      return null;
    }

    const id = repositories[repositories.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface DiskSnapshotsCursorIDPageResponse<Item> {
  snapshots: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface DiskSnapshotsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class DiskSnapshotsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements DiskSnapshotsCursorIDPageResponse<Item>
{
  snapshots: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: DiskSnapshotsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.snapshots = body.snapshots || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.snapshots ?? [];
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<DiskSnapshotsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const snapshots = this.getPaginatedItems();
    if (!snapshots.length) {
      return null;
    }

    const id = snapshots[snapshots.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}
