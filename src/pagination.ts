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

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
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

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
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

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
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

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
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

export interface BenchmarksCursorIDPageResponse<Item> {
  benchmarks: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface BenchmarksCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class BenchmarksCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements BenchmarksCursorIDPageResponse<Item>
{
  benchmarks: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: BenchmarksCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.benchmarks = body.benchmarks || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.benchmarks ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<BenchmarksCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const benchmarks = this.getPaginatedItems();
    if (!benchmarks.length) {
      return null;
    }

    const id = benchmarks[benchmarks.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface AgentsCursorIDPageResponse<Item> {
  agents: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface AgentsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class AgentsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements AgentsCursorIDPageResponse<Item>
{
  agents: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: AgentsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.agents = body.agents || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.agents ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<AgentsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const agents = this.getPaginatedItems();
    if (!agents.length) {
      return null;
    }

    const id = agents[agents.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface BenchmarkRunsCursorIDPageResponse<Item> {
  runs: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface BenchmarkRunsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class BenchmarkRunsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements BenchmarkRunsCursorIDPageResponse<Item>
{
  runs: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: BenchmarkRunsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.runs = body.runs || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.runs ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<BenchmarkRunsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const runs = this.getPaginatedItems();
    if (!runs.length) {
      return null;
    }

    const id = runs[runs.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface ScenariosCursorIDPageResponse<Item> {
  scenarios: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface ScenariosCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class ScenariosCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements ScenariosCursorIDPageResponse<Item>
{
  scenarios: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: ScenariosCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.scenarios = body.scenarios || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.scenarios ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<ScenariosCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const scenarios = this.getPaginatedItems();
    if (!scenarios.length) {
      return null;
    }

    const id = scenarios[scenarios.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface ScenarioRunsCursorIDPageResponse<Item> {
  runs: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface ScenarioRunsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class ScenarioRunsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements ScenarioRunsCursorIDPageResponse<Item>
{
  runs: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: ScenarioRunsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.runs = body.runs || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.runs ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<ScenarioRunsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const runs = this.getPaginatedItems();
    if (!runs.length) {
      return null;
    }

    const id = runs[runs.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface ScenarioScorersCursorIDPageResponse<Item> {
  scorers: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface ScenarioScorersCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class ScenarioScorersCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements ScenarioScorersCursorIDPageResponse<Item>
{
  scorers: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: ScenarioScorersCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.scorers = body.scorers || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.scorers ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<ScenarioScorersCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const scorers = this.getPaginatedItems();
    if (!scorers.length) {
      return null;
    }

    const id = scorers[scorers.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}

export interface ObjectsCursorIDPageResponse<Item> {
  objects: Array<Item>;

  has_more: boolean;

  total_count: number;
}

export interface ObjectsCursorIDPageParams {
  starting_after?: string;

  limit?: number;
}

export class ObjectsCursorIDPage<Item extends { id: string }>
  extends AbstractPage<Item>
  implements ObjectsCursorIDPageResponse<Item>
{
  objects: Array<Item>;

  has_more: boolean;

  total_count: number;

  constructor(
    client: APIClient,
    response: Response,
    body: ObjectsCursorIDPageResponse<Item>,
    options: FinalRequestOptions,
  ) {
    super(client, response, body, options);

    this.objects = body.objects || [];
    this.has_more = body.has_more || false;
    this.total_count = body.total_count || 0;
  }

  getPaginatedItems(): Item[] {
    return this.objects ?? [];
  }

  override hasNextPage(): boolean {
    if (this.has_more === false) {
      return false;
    }

    return super.hasNextPage();
  }

  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams(): Partial<ObjectsCursorIDPageParams> | null {
    const info = this.nextPageInfo();
    if (!info) return null;
    if ('params' in info) return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length) return null;
    return params;
  }

  nextPageInfo(): PageInfo | null {
    const objects = this.getPaginatedItems();
    if (!objects.length) {
      return null;
    }

    const id = objects[objects.length - 1]?.id;
    if (!id) {
      return null;
    }

    return { params: { starting_after: id } };
  }
}
