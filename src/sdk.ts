export * from './sdk/index';
import type * as Core from './core';
import { Runloop, type ClientOptions } from './index';
import { Devbox } from './sdk/devbox';
import { Blueprint, type CreateParams as BlueprintCreateParams } from './sdk/blueprint';
import { Snapshot } from './sdk/snapshot';
import { StorageObject } from './sdk/storage-object';
import { Agent } from './sdk/agent';
import { Axon } from './sdk/axon';
import { Scorer } from './sdk/scorer';
import { NetworkPolicy } from './sdk/network-policy';
import { GatewayConfig } from './sdk/gateway-config';
import { McpConfig } from './sdk/mcp-config';
import { Scenario } from './sdk/scenario';
import { ScenarioBuilder } from './sdk/scenario-builder';
import { Secret } from './sdk/secret';

// Import types used in this file
import type {
  DevboxCreateParams,
  DevboxListParams,
  DevboxView,
  DevboxListDiskSnapshotsParams,
} from './resources/devboxes/devboxes';
import type { BlueprintListParams } from './resources/blueprints';
import type { ObjectCreateParams, ObjectListParams } from './resources/objects';
import type { AgentCreateParams, AgentListParams } from './resources/agents';
import type { AxonCreateParams, AxonListParams } from './resources/axons/axons';
import type { ScorerCreateParams, ScorerListParams } from './resources/scenarios/scorers';
import type { NetworkPolicyCreateParams, NetworkPolicyListParams } from './resources/network-policies';
import type { GatewayConfigCreateParams, GatewayConfigListParams } from './resources/gateway-configs';
import type { McpConfigCreateParams, McpConfigListParams } from './resources/mcp-configs';
import type { ScenarioListParams } from './resources/scenarios/scenarios';
import type {
  SecretCreateParams,
  SecretUpdateParams,
  SecretListParams,
  SecretView,
} from './resources/secrets';
import { LongPollRequestOptions, PollingOptions } from './lib/polling';
import * as Shared from './resources/shared';

// ============================================================================
// SDK-specific mount types for convenient StorageObject mounting
// ============================================================================

/**
 * A convenient mount format that maps a path to a StorageObject.
 * The key is the path on the devbox where the object will be mounted,
 * and the value is the StorageObject instance.
 *
 * @category SDK Types
 *
 * @example
 * ```typescript
 * { '/home/user/config.txt': storageObject }
 * ```
 */
export type InlineObjectMount = { [path: string]: StorageObject };

/**
 * Union type representing all valid mount inputs for the SDK.
 * Accepts both the standard API mount format and the convenient InlineObjectMount format.
 *
 * @category SDK Types
 */
export type MountInstance = Shared.Mount | InlineObjectMount;

/**
 * SDK-specific gateway spec that accepts Secret objects for credentials.
 *
 * @category SDK Types
 */
export interface SDKGatewaySpec {
  /**
   * The gateway config to use. Can be a gateway config ID (gwc_xxx) or name.
   */
  gateway: string;

  /**
   * The secret containing the credential. Can be a Secret object or string (ID or name).
   */
  secret: Secret | string;
}

/**
 * SDK-specific MCP spec that accepts Secret objects for credentials.
 *
 * @category SDK Types
 */
export interface SDKMcpSpec {
  /**
   * The MCP config to use. Can be an MCP config ID (mcp_xxx) or name.
   */
  mcp_config: string;

  /**
   * The secret containing the MCP server credential. Can be a Secret object or string (ID or name).
   */
  secret: Secret | string;
}

/**
 * Extended DevboxCreateParams that accepts the convenient SDK mount syntax and Secret objects.
 * Use this type when creating devboxes through the SDK's DevboxOps.create() method.
 *
 * @category SDK Types
 */
export interface SDKDevboxCreateParams
  extends Omit<DevboxCreateParams, 'mounts' | 'secrets' | 'gateways' | 'mcp'> {
  /**
   * A list of mounts to be included in the Devbox.
   * Accepts both standard API mount format and the convenient `{ path: StorageObject }` syntax.
   *
   * @example
   * ```typescript
   * mounts: [
   *   { '/home/user/file.txt': storageObject },
   *   { type: 'code_mount', repo_name: 'my-repo', repo_owner: 'owner' }
   * ]
   * ```
   */
  mounts?: Array<MountInstance> | null;

  /**
   * (Optional) Map of environment variable names to secrets. The secret values
   * will be securely injected as environment variables in the Devbox.
   * Values can be Secret objects or string names.
   *
   * @example
   * ```typescript
   * secrets: {
   *   'DB_PASS': secret,           // Using Secret object
   *   'API_KEY': 'MY_API_SECRET',  // Using string name
   * }
   * ```
   */
  secrets?: { [key: string]: Secret | string } | null;

  /**
   * (Optional) Agent gateway specifications for credential proxying.
   * The secret field can be a Secret object or string (ID or name).
   *
   * @example
   * ```typescript
   * gateways: {
   *   'GWS_ANTHROPIC': { gateway: 'anthropic', secret: mySecret },
   * }
   * ```
   */
  gateways?: { [key: string]: SDKGatewaySpec } | null;

  /**
   * [Beta] (Optional) MCP specifications for MCP server access.
   * The secret field can be a Secret object or string (ID or name).
   *
   * @example
   * ```typescript
   * mcp: {
   *   'MCP_SECRET': { mcp_config: 'github-readonly', secret: mySecret },
   * }
   * ```
   */
  mcp?: { [key: string]: SDKMcpSpec } | null;
}

/**
 * Type guard to check if a mount input is an InlineObjectMount (path-to-StorageObject mapping).
 * Standard Shared.Mount types have a 'type' discriminator property, while InlineObjectMount does not.
 *
 * @param mount - The mount input to check
 * @returns true if the mount is an InlineObjectMount
 */
function isInlineObjectMount(mount: MountInstance): mount is InlineObjectMount {
  if (typeof mount !== 'object' || mount === null || 'type' in mount) {
    return false;
  }
  // Exclude arrays
  if (Array.isArray(mount)) {
    return false;
  }
  // Validate that all values have an 'id' property (StorageObject shape)
  const values = Object.values(mount);
  return (
    values.length > 0 &&
    values.every((v) => v && typeof v === 'object' && 'id' in v && typeof v.id === 'string')
  );
}

/**
 * Transforms SDK mount inputs to the API-compatible Shared.Mount format.
 * Converts convenient `{ path: StorageObject }` syntax to `ObjectMountParameters`.
 *
 * @param mounts - Array of SDK mount inputs
 * @returns Array of API-compatible mounts
 */
function transformMounts(mounts: Array<MountInstance>): Array<Shared.Mount> {
  return mounts.flatMap((mount) => {
    if (isInlineObjectMount(mount)) {
      // Convert { "path": StorageObject } to ObjectMountParameters
      return Object.entries(mount).map(([path, obj]) => {
        if (!obj || typeof obj !== 'object' || typeof obj.id !== 'string') {
          throw new Error(
            `Invalid mount value for path "${path}": expected a StorageObject with an 'id' property, ` +
              `got ${obj === null ? 'null' : typeof obj}`,
          );
        }
        return {
          type: 'object_mount' as const,
          object_id: obj.id,
          object_path: path,
        };
      });
    }
    // Already a standard mount
    return mount;
  });
}

// ============================================================================
// SDK-specific secret types for convenient Secret object usage
// ============================================================================

/**
 * Resolves a Secret object or string name to a string name.
 * Used internally to normalize secret inputs for API calls.
 *
 * @param secret - Secret object or string name
 * @returns The secret name as a string
 */
function resolveSecretName(secret: Secret | string): string {
  return typeof secret === 'string' ? secret : secret.name;
}

/**
 * Transforms SDK secrets map (with Secret objects) to API-compatible format (string names).
 *
 * @param secrets - Map of env var names to Secret objects or string names
 * @returns Map of env var names to string secret names
 */
function transformSecrets(
  secrets: { [key: string]: Secret | string } | null,
): { [key: string]: string } | null {
  if (secrets === null) {
    return null;
  }
  return Object.fromEntries(Object.entries(secrets).map(([k, v]) => [k, resolveSecretName(v)]));
}

/**
 * Transforms SDK gateway specs (with Secret objects) to API-compatible format.
 *
 * @param gateways - Map of gateway specs with Secret objects or string names
 * @returns Map of gateway specs with string secret names
 */
function transformGateways(
  gateways: { [key: string]: SDKGatewaySpec } | null,
): { [key: string]: DevboxCreateParams.Gateways } | null {
  if (gateways === null) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(gateways).map(([k, v]) => [
      k,
      {
        gateway: v.gateway,
        secret: resolveSecretName(v.secret),
      },
    ]),
  );
}

/**
 * Transforms SDK MCP specs (with Secret objects) to API-compatible format.
 *
 * @param mcp - Map of MCP specs with Secret objects or string names
 * @returns Map of MCP specs with string secret names
 */
function transformMcp(
  mcp: { [key: string]: SDKMcpSpec } | null,
): { [key: string]: DevboxCreateParams.Mcp } | null {
  if (mcp === null) {
    return null;
  }
  return Object.fromEntries(
    Object.entries(mcp).map(([k, v]) => [
      k,
      {
        mcp_config: v.mcp_config,
        secret: resolveSecretName(v.secret),
      },
    ]),
  );
}

/**
 * Transforms SDKDevboxCreateParams to DevboxCreateParams by converting SDK-specific types.
 * Handles mounts (StorageObject), secrets (Secret objects), gateways, and mcp.
 *
 * @param params - SDK devbox creation parameters
 * @returns API-compatible devbox creation parameters
 */
function transformSDKDevboxCreateParams(params?: SDKDevboxCreateParams): DevboxCreateParams | undefined {
  if (!params) {
    return undefined;
  }

  // Extract SDK-specific fields
  const { mounts, secrets, gateways, mcp, ...rest } = params;

  const result: DevboxCreateParams = { ...rest };

  // Transform mounts if provided
  if (mounts !== undefined) {
    if (mounts === null || mounts.length === 0) {
      result.mounts = mounts as Array<Shared.Mount> | null;
    } else {
      result.mounts = transformMounts(mounts);
    }
  }

  // Transform secrets if provided
  if (secrets !== undefined) {
    result.secrets = transformSecrets(secrets);
  }

  // Transform gateways if provided
  if (gateways !== undefined) {
    result.gateways = transformGateways(gateways);
  }

  // Transform mcp if provided
  if (mcp !== undefined) {
    result.mcp = transformMcp(mcp);
  }

  return result;
}

export * from './index';

/**
 * Primary Runloop API namespace used by the SDK.
 *
 * Prefer this over the legacy `Runloop` export so that generated docs highlight
 * the new name, while still preserving backwards compatibility for existing
 * customers that import `Runloop` directly.
 */
export import RunloopAPI = Runloop;

// Extract the content type from the API types
type ContentType = ObjectCreateParams['content_type'];

/**
 * Runloop SDK - The recommended way to interact with Runloop.
 * Provides both low-level API access and high-level object-oriented interfaces.
 *
 * @category SDK Client
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK(); // export RUNLOOP_API_KEY will automatically be used.
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * console.log(result.exitCode);
 * ```
 *
 * @remarks
 * ## Operations
 * - `devbox` - {@link DevboxOps}
 * - `blueprint` - {@link BlueprintOps}
 * - `snapshot` - {@link SnapshotOps}
 * - `storageObject` - {@link StorageObjectOps}
 * - `agent` - {@link AgentOps}
 * - `axon` - {@link AxonOps}
 * - `scorer` - {@link ScorerOps}
 * - `networkPolicy` - {@link NetworkPolicyOps}
 * - `gatewayConfig` - {@link GatewayConfigOps}
 * - `mcpConfig` - {@link McpConfigOps}
 * - `secret` - {@link SecretOps}
 *
 * See the documentation for each Operations class for more details.
 *
 */
export class RunloopSDK {
  /**
   * Low-level API client providing direct access to all Runloop API endpoints.
   * Use this when you need fine-grained control or access to features not yet exposed
   * through the high-level interfaces. Most users should prefer the specialized interfaces
   * (devbox, blueprint, etc.) for a more convenient API.
   */
  public readonly api: RunloopAPI;

  /**
   * **Devbox Operations** - {@link DevboxOps} for creating and accessing {@link Devbox} class instances.
   *
   * Devboxes are isolated development environments running in Runloop's cloud - the core resource
   * that provides you with a fully configured development environment. Use these operations to create
   * new devboxes or get existing ones by ID.
   */
  public readonly devbox: DevboxOps;

  /**
   * **Blueprint Operations** - {@link BlueprintOps} for creating and accessing {@link Blueprint} class instances.
   *
   * Blueprints are reusable templates that define the base configuration for devboxes, built from
   * Dockerfiles. They can be used to create multiple devboxes with consistent environments. Use these
   * operations to create new blueprints or get existing ones by ID.
   */
  public readonly blueprint: BlueprintOps;

  /**
   * **Snapshot Operations** - {@link SnapshotOps} for creating and accessing {@link Snapshot} class instances.
   *
   * Snapshots are point-in-time copies of a devbox's disk state, allowing you to save the complete
   * state of a devbox and restore it later or create new devboxes from saved states. Use these
   * operations to list snapshots or get existing ones by ID.
   */
  public readonly snapshot: SnapshotOps;

  /**
   * **Storage Object Operations** - {@link StorageObjectOps} for creating and accessing {@link StorageObject} class instances.
   *
   * Storage objects are files stored in Runloop's object storage system. They can be uploaded,
   * downloaded, and managed with metadata, useful for storing configuration files, data files, or
   * any other content you need to persist or share between devboxes. Use these operations to create
   * new storage objects or get existing ones by ID.
   */
  public readonly storageObject: StorageObjectOps;

  /**
   * **Agent Operations** - {@link AgentOps} for creating and accessing {@link Agent} class instances.
   *
   * Agents are registered AI agent entities that can be mounted into devboxes. Agents can be sourced
   * from npm, pip, git repositories, or object storage, and provide reusable agent code that can be
   * shared across multiple devboxes. Use these operations to create new agents or get existing ones by ID.
   */
  public readonly agent: AgentOps;

  /**
   * **Axon Operations** - {@link AxonOps} for creating and accessing {@link Axon} class instances.
   *
   * [Beta] Axons are event communication channels that support publishing events and subscribing
   * to event streams via server-sent events (SSE). Use these operations to create new axons,
   * get existing ones by ID, or list all active axons.
   */
  public readonly axon: AxonOps;

  /**
   * **Scorer Operations** - {@link ScorerOps} for creating and accessing {@link Scorer} class instances.
   *
   * Scorers are custom scoring functions that evaluate scenario outputs. They define scripts
   * that produce a score in the range [0.0, 1.0] for scenario runs.
   */
  public readonly scorer: ScorerOps;

  /**
   * **Network Policy Operations** - {@link NetworkPolicyOps} for creating and accessing {@link NetworkPolicy} class instances.
   *
   * Network policies define egress network access rules for devboxes. Policies can be applied to
   * blueprints, devboxes, and snapshot resumes to control network access.
   */
  public readonly networkPolicy: NetworkPolicyOps;

  /**
   * **Gateway Config Operations** - {@link GatewayConfigOps} for creating and accessing {@link GatewayConfig} class instances.
   *
   * Gateway configs define how to proxy API requests through the credential gateway. They specify
   * the target endpoint and how credentials should be applied. Use with devboxes to securely
   * proxy requests to external APIs without exposing API keys.
   */
  public readonly gatewayConfig: GatewayConfigOps;

  /**
   * **MCP Config Operations** - {@link McpConfigOps} for creating and accessing {@link McpConfig} class instances.
   *
   * MCP configs define how to connect to upstream MCP (Model Context Protocol) servers. They specify
   * the target endpoint and which tools are allowed. Use with devboxes to securely connect to
   * MCP servers.
   */
  public readonly mcpConfig: McpConfigOps;

  /**
   * **Scenario Operations** - {@link ScenarioOps} for accessing {@link Scenario} class instances.
   *
   * Scenarios define repeatable AI coding evaluation tests with starting environments and
   * success criteria. Use these operations to get existing scenarios by ID or list all scenarios.
   */
  public readonly scenario: ScenarioOps;

  /**
   * **Secret Operations** - {@link SecretOps} for managing secrets.
   *
   * Secrets are encrypted key-value pairs that can be injected into devboxes as environment
   * variables. Use these operations to create, update, list, and delete secrets.
   */
  public readonly secret: SecretOps;

  /**
   * Creates a new RunloopSDK instance.
   * @param {ClientOptions} [options] - Optional client configuration options.
   */
  constructor(options?: ClientOptions) {
    this.api = new RunloopAPI(options);
    this.devbox = new DevboxOps(this.api);
    this.blueprint = new BlueprintOps(this.api);
    this.snapshot = new SnapshotOps(this.api);
    this.storageObject = new StorageObjectOps(this.api);
    this.agent = new AgentOps(this.api);
    this.axon = new AxonOps(this.api);
    this.scorer = new ScorerOps(this.api);
    this.networkPolicy = new NetworkPolicyOps(this.api);
    this.gatewayConfig = new GatewayConfigOps(this.api);
    this.mcpConfig = new McpConfigOps(this.api);
    this.scenario = new ScenarioOps(this.api);
    this.secret = new SecretOps(this.api);
  }
}

/**
 * Devbox SDK interface for managing devboxes.
 *
 * @category Devbox
 *
 * @remarks
 * ## Overview
 *
 * The `DevboxOps` class provides a high-level abstraction for managing devboxes,
 * which are isolated development environments running in Runloop's cloud infrastructure.
 * Devboxes can be created from blueprints or snapshots, and support command execution,
 * file operations, and lifecycle management.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.devbox}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * const result = await devbox.cmd.exec('echo "Hello, World!"');
 * ```
 */
export class DevboxOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new Devbox and wait for it to reach the running state.
   * This is the recommended way to create a devbox as it ensures it's ready to use.
   *
   * Supports the convenient SDK mount syntax for StorageObjects:
   * ```typescript
   * mounts: [{ '/path/on/devbox': storageObject }]
   * ```
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
   *
   * devbox.cmd.exec('echo "Hello, World!"');
   * ```
   *
   * @example
   * ```typescript
   * // Create devbox with mounted storage object
   * const storageObject = await runloop.storageObject.uploadFromFile('./config.txt', 'config.txt');
   * const devbox = await runloop.devbox.create({
   *   name: 'devbox-with-file',
   *   mounts: [{ '/home/user/config.txt': storageObject }]
   * });
   * ```
   *
   * @param {SDKDevboxCreateParams} [params] - Parameters for creating the devbox, with SDK mount syntax support.
   * @param {LongPollRequestOptions<DevboxView>} [options] - Request options with optional long-poll configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async create(
    params?: SDKDevboxCreateParams,
    options?: LongPollRequestOptions<DevboxView>,
  ): Promise<Devbox> {
    const transformedParams = transformSDKDevboxCreateParams(params);
    return Devbox.create(this.client, transformedParams, options);
  }

  /**
   * Create a new devbox from a blueprint ID.
   * @param {string} blueprintId - The ID of the blueprint to use.
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding blueprint_id, snapshot_id, and blueprint_name).
   * @param {LongPollRequestOptions<DevboxView>} [options] - Request options with optional long-poll configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromBlueprintId(
    blueprintId: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: LongPollRequestOptions<DevboxView>,
  ): Promise<Devbox> {
    return Devbox.createFromBlueprintId(this.client, blueprintId, params, options);
  }

  /**
   * Create a new devbox from a blueprint name.
   * @param {string} blueprintName - The name of the blueprint to use.
   * @param {Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding blueprint_id, snapshot_id, and blueprint_name).
   * @param {LongPollRequestOptions<DevboxView>} [options] - Request options with optional long-poll configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromBlueprintName(
    blueprintName: string,
    params?: Omit<DevboxCreateParams, 'blueprint_id' | 'snapshot_id' | 'blueprint_name'>,
    options?: LongPollRequestOptions<DevboxView>,
  ): Promise<Devbox> {
    return Devbox.createFromBlueprintName(this.client, blueprintName, params, options);
  }

  /**
   * Create a new devbox from a snapshot.
   *
   * @example
   * ```typescript
   * const devbox = await Devbox.createFromSnapshot(
   *   runloop,
   *   snapshot.id,
   *   { name: 'restored-devbox' }
   * );
   * ```
   *
   * @param {string} snapshotId - The ID of the snapshot to use.
   * @param {Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>} [params] - Additional parameters for creating the devbox (excluding snapshot_id, blueprint_id, and blueprint_name).
   * @param {LongPollRequestOptions<DevboxView>} [options] - Request options with optional long-poll configuration.
   * @returns {Promise<Devbox>} A {@link Devbox} instance.
   */
  async createFromSnapshot(
    snapshotId: string,
    params?: Omit<DevboxCreateParams, 'snapshot_id' | 'blueprint_id' | 'blueprint_name'>,
    options?: LongPollRequestOptions<DevboxView>,
  ): Promise<Devbox> {
    return Devbox.createFromSnapshot(this.client, snapshotId, params, options);
  }

  /**
   * Get a devbox object by its ID.
   * @param {string} id - The ID of the devbox.
   * @returns {Devbox} A {@link Devbox} instance.
   */
  fromId(id: string): Devbox {
    return Devbox.fromId(this.client, id);
  }

  /**
   * List devboxes with optional filters (paginated).
   * @param {DevboxListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Devbox[]>} An array of {@link Devbox} instances.
   */
  async list(params?: DevboxListParams, options?: Core.RequestOptions): Promise<Devbox[]> {
    const result = await this.client.devboxes.list(params, options);
    const devboxes: Devbox[] = [];

    for (const devbox of result.devboxes) {
      devboxes.push(Devbox.fromId(this.client, devbox.id));
    }

    return devboxes;
  }
}

/**
 * Blueprint SDK interface for managing blueprints.
 *
 * @category Blueprint
 *
 * @remarks
 * ## Overview
 *
 * The `BlueprintOps` class provides a high-level abstraction for managing blueprints,
 * which define the base configuration for devboxes. Blueprints are built from Dockerfiles
 * and can be used to create multiple devboxes with consistent environments.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.blueprint}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const blueprint = await runloop.blueprint.create({
 *   name: 'my-blueprint',
 *   dockerfile: `FROM ubuntu:22.04
 *                RUN apt-get update`,
 * });
 * const devbox = await runloop.devbox.createFromBlueprintId(blueprint.id, { name: 'my-devbox' });
 * ```
 *
 * To use a local directory as a build context, use an object.
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const obj = await runloop.storageObject.uploadFromDir(
 *   './',
 *   {
 *     name: 'build-context',
 *     ttl_ms: 3600000, // 1 hour
 *   }
 * );
 * const blueprint = await runloop.blueprint.create({
 *   name: 'my-blueprint-with-context',
 *   dockerfile: `FROM ubuntu:22.04
 *                COPY . .`,
 *   build_context: obj,
 * });
 * ```
 */
export class BlueprintOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new blueprint.
   * @param {BlueprintCreateParams} params - Parameters for creating the blueprint.
   * @param {Core.RequestOptions & { polling?: Partial<PollingOptions<RunloopAPI.Blueprints.BlueprintView>> }} [options] - Request options including polling configuration.
   * @returns {Promise<Blueprint>} A {@link Blueprint} instance.
   */
  async create(
    params: BlueprintCreateParams,
    options?: Core.RequestOptions & {
      polling?: Partial<PollingOptions<RunloopAPI.Blueprints.BlueprintView>>;
    },
  ): Promise<Blueprint> {
    return Blueprint.create(this.client, params, options);
  }

  /**
   * Get a blueprint object by its ID.
   * @param {string} id - The ID of the blueprint.
   * @returns {Blueprint} A {@link Blueprint} instance.
   */
  fromId(id: string): Blueprint {
    return Blueprint.fromId(this.client, id);
  }

  /**
   * List blueprints with optional filters (paginated).
   * @param {BlueprintListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Blueprint[]>} An array of {@link Blueprint} instances.
   */
  async list(params?: BlueprintListParams, options?: Core.RequestOptions): Promise<Blueprint[]> {
    const result = await this.client.blueprints.list(params, options);
    const blueprints: Blueprint[] = [];

    for (const blueprint of result.blueprints) {
      blueprints.push(Blueprint.fromId(this.client, blueprint.id));
    }

    return blueprints;
  }
}

/**
 * Snapshot SDK interface for managing disk snapshots.
 *
 * @category Snapshot
 *
 * @remarks
 * ## Overview
 *
 * The `SnapshotOps` class provides a high-level abstraction for managing disk snapshots,
 * which capture the complete state of a devbox's disk. Snapshots can be used to restore
 * devboxes to a previous state or create new devboxes from saved states.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.snapshot}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const snapshot = await devbox.snapshotDisk({ name: 'backup' });
 * ...
 * const devbox = await snapshot.createDevbox();
 * ```
 */
export class SnapshotOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Get a snapshot object by its ID.
   * @param {string} id - The ID of the snapshot.
   * @returns {Snapshot} A {@link Snapshot} instance.
   */
  fromId(id: string): Snapshot {
    return Snapshot.fromId(this.client, id);
  }

  /**
   * List snapshots with optional filters (paginated).
   * @param {DevboxListDiskSnapshotsParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Snapshot[]>} An array of {@link Snapshot} instances.
   */
  async list(params?: DevboxListDiskSnapshotsParams, options?: Core.RequestOptions): Promise<Snapshot[]> {
    return Snapshot.list(this.client, params, options);
  }
}

/**
 * Storage object management interface
 *
 * @category Storage Object
 *
 * @remarks
 * ## Overview
 *
 * The `StorageObjectOps` class provides a high-level abstraction for managing storage objects,
 * which are files stored in Runloop's object storage. Storage objects can be uploaded,
 * downloaded, and managed with metadata.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.storageObject}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const storageObject = await runloop.storageObject.uploadFromFile("./my-file.txt", "my-file.txt");
 * const objects = await runloop.storageObject.list();
 * ```
 */
export class StorageObjectOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new storage object. This is for advanced users and for basic operations you should use the {@link StorageObjectOps.uploadFromFile uploadFromFile()}, {@link StorageObjectOps.uploadFromText uploadFromText()}, or {@link StorageObjectOps.uploadFromBuffer uploadFromBuffer()} methods instead.
   *
   * @example
   * ```typescript
   * const storageObject = await runloop.storageObject.create({
   *   name: 'my-file.txt',
   *   content_type: 'text',
   *   metadata: { project: 'demo' },
   * });
   * storageObject.uploadContent('Hello, World!');
   * // this will mark the object as complete and make it read-only
   * storageObject.complete();
   * ```
   * @param params - Parameters for creating the object.
   * @param options - Request options.
   * @returns A {@link StorageObject} instance.
   */
  async create(
    params: ObjectCreateParams,
    options?: Core.RequestOptions & { polling?: Partial<PollingOptions<RunloopAPI.Objects.ObjectView>> },
  ): Promise<StorageObject> {
    return StorageObject.create(this.client, params, options);
  }

  /**
   * Get a storage object by its ID.
   *
   * @param {string} id - The ID of the storage object.
   * @returns {StorageObject} A {@link StorageObject} instance.
   */
  fromId(id: string): StorageObject {
    return StorageObject.fromId(this.client, id);
  }

  /**
   * List storage objects with optional filters (paginated).
   * @param {ObjectListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<StorageObject[]>} An array of {@link StorageObject} instances.
   */
  async list(params?: ObjectListParams, options?: Core.RequestOptions): Promise<StorageObject[]> {
    const result = await this.client.objects.list(params, options);
    const storageObjects: StorageObject[] = [];
    for (const storageObject of result.objects) {
      storageObjects.push(StorageObject.fromId(this.client, storageObject.id));
    }
    return storageObjects;
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
   * @param {string} filePath - The path to the file to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {Core.RequestOptions & { contentType?: ContentType; metadata?: Record<string, string> }} [options] - Request options including content type and metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromFile(
    filePath: string,
    name: string,
    options?: Core.RequestOptions & {
      contentType?: ContentType;
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromFile(this.client, filePath, name, options);
  }

  /**
   * Upload text content directly.
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload text content to the provided URL
   * 3. Mark upload as complete
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
   * @param {string} text - The text content to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options including metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromText(
    text: string,
    name: string,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromText(this.client, text, name, options);
  }

  /**
   * Upload content from a Buffer (Node.js only).
   * This method handles the complete three-step upload process:
   * 1. Create object and get upload URL
   * 2. Upload buffer content to the provided URL
   * 3. Mark upload as complete
   *
   * @example
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
   * @param {Buffer} buffer - The buffer containing the content to upload.
   * @param {string} name - The name to use for the storage object.
   * @param {ContentType} contentType - The content type of the buffer.
   * @param {Core.RequestOptions & { metadata?: Record<string, string> }} [options] - Request options including metadata.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromBuffer(
    buffer: Buffer,
    name: string,
    contentType: ContentType,
    options?: Core.RequestOptions & {
      metadata?: Record<string, string>;
    },
  ): Promise<StorageObject> {
    return StorageObject.uploadFromBuffer(this.client, buffer, name, contentType, options);
  }

  /**
   * Upload a local directory as a gzipped tarball (Node.js only).
   * This method creates a tar archive of the directory contents, gzips it, and uploads it.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * const object = await runloop.storageObject.uploadFromDir(
   *   './my-project',
   *   {
   *     name: 'my-project.tar.gz',
   *     ttl_ms: 3600000, // 1 hour
   *     metadata: { project: 'demo' }
   *   }
   * );
   * console.log(`Uploaded directory as ${object.id}`);
   * ```
   *
   * @param {string} dirPath - The path to the directory to upload.
   * @param {Omit<ObjectCreateParams, 'content_type'} params - Parameters for creating the object.
   * @param {Core.RequestOptions} options - Request options.
   * @returns {Promise<StorageObject>} A {@link StorageObject} instance.
   */
  async uploadFromDir(
    dirPath: string,
    params: Omit<ObjectCreateParams, 'content_type'>,
    options?: Core.RequestOptions,
  ): Promise<StorageObject> {
    return StorageObject.uploadFromDir(this.client, dirPath, params, options);
  }
}

/**
 * Agent SDK interface for managing agents.
 *
 * @category Agent
 *
 * @remarks
 * ## Overview
 *
 * The `AgentOps` class provides a high-level abstraction for managing AI agent entities.
 * Agents can be sourced from npm, pip, git repositories, or object storage, and mounted
 * into devboxes for execution.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.agent}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const agent = await runloop.agent.create({
 *   name: 'my-npm-agent',
 *   source: {
 *     type: 'npm',
 *     npm: { package_name: '@my-org/agent' }
 *   }
 * });
 * const devbox = await agent.createDevbox({
 *   name: 'devbox-with-agent',
 *   agent_path: '/home/user/agent'
 * });
 * ```
 */
export class AgentOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new agent.
   *
   * @example
   * Create an agent from an NPM package:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.create({
   *   name: 'my-agent',
   *   source: {
   *     type: 'npm',
   *     npm: {
   *       package_name: '@my-org/agent',
   *       npm_version: '1.0.0'
   *     }
   *   }
   * });
   * console.log(`Created agent: ${agent.id}`);
   * ```
   *
   * @example
   * Create an agent from a Git repository:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.create({
   *   name: 'my-git-agent',
   *   source: {
   *     type: 'git',
   *     git: {
   *       repository: 'https://github.com/my-org/agent-repo',
   *       ref: 'main'
   *     }
   *   }
   * });
   * ```
   *
   * @example
   * Create an agent from a storage object:
   * ```typescript
   * const runloop = new RunloopSDK();
   * // First, upload your agent code as a storage object
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent',
   *   { name: 'agent-package' }
   * );
   *
   * // Then create an agent from it
   * const agent = await runloop.agent.create({
   *   name: 'my-object-agent',
   *   source: {
   *     type: 'object',
   *     object: {
   *       object_id: storageObject.id
   *     }
   *   }
   * });
   * ```
   *
   * @param {AgentCreateParams} params - Parameters for creating the agent.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async create(params: AgentCreateParams, options?: Core.RequestOptions): Promise<Agent> {
    return Agent.create(this.client, params, options);
  }

  /**
   * Create an agent from an NPM package.
   *
   * @example
   * Basic usage:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'my-npm-agent',
   *   package_name: '@my-org/agent'
   * });
   * ```
   *
   * @example
   * With version and setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'my-npm-agent',
   *   package_name: '@my-org/agent',
   *   npm_version: '^1.2.0',
   *   agent_setup: ['npm run build', 'chmod +x ./run.sh']
   * });
   * ```
   *
   * @example
   * Using a private registry:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromNpm({
   *   name: 'private-agent',
   *   package_name: '@my-org/private-agent',
   *   registry_url: 'https://npm.mycompany.com'
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.package_name - NPM package name.
   * @param {string} [params.npm_version] - NPM version constraint.
   * @param {string} [params.registry_url] - NPM registry URL.
   * @param {string[]} [params.agent_setup] - Setup commands to run after installation.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromNpm(
    params: Omit<AgentCreateParams, 'source'> & {
      package_name: string;
      npm_version?: string;
      registry_url?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { package_name, npm_version, registry_url, agent_setup, ...restParams } = params;

    const npmConfig: any = { package_name };
    if (npm_version !== undefined) npmConfig.npm_version = npm_version;
    if (registry_url !== undefined) npmConfig.registry_url = registry_url;
    if (agent_setup !== undefined) npmConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'npm', npm: npmConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a Pip package.
   *
   * @example
   * Basic usage:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'my-python-agent',
   *   package_name: 'my-agent-package'
   * });
   * ```
   *
   * @example
   * With version constraint:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'my-python-agent',
   *   package_name: 'my-agent-package',
   *   pip_version: '>=1.0.0,<2.0.0'
   * });
   * ```
   *
   * @example
   * Using a private PyPI registry:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromPip({
   *   name: 'private-python-agent',
   *   package_name: 'my-private-agent',
   *   registry_url: 'https://pypi.mycompany.com/simple',
   *   agent_setup: ['python setup.py install']
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.package_name - Pip package name.
   * @param {string} [params.pip_version] - Pip version constraint.
   * @param {string} [params.registry_url] - Pip registry URL.
   * @param {string[]} [params.agent_setup] - Setup commands to run after installation.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromPip(
    params: Omit<AgentCreateParams, 'source'> & {
      package_name: string;
      pip_version?: string;
      registry_url?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { package_name, pip_version, registry_url, agent_setup, ...restParams } = params;

    const pipConfig: any = { package_name };
    if (pip_version !== undefined) pipConfig.pip_version = pip_version;
    if (registry_url !== undefined) pipConfig.registry_url = registry_url;
    if (agent_setup !== undefined) pipConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'pip', pip: pipConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a Git repository.
   *
   * @example
   * Basic usage with public repository:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo'
   * });
   * ```
   *
   * @example
   * With specific branch and setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo',
   *   ref: 'develop',
   *   agent_setup: [
   *     'npm install',
   *     'npm run build'
   *   ]
   * });
   * ```
   *
   * @example
   * Using a specific commit:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = await runloop.agent.createFromGit({
   *   name: 'my-git-agent',
   *   repository: 'https://github.com/my-org/agent-repo',
   *   ref: 'a1b2c3d4e5f6'
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.repository - Git repository URL.
   * @param {string} [params.ref] - Optional Git ref (branch/tag/commit), defaults to main/HEAD.
   * @param {string[]} [params.agent_setup] - Setup commands to run after cloning.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromGit(
    params: Omit<AgentCreateParams, 'source'> & {
      repository: string;
      ref?: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { repository, ref, agent_setup, ...restParams } = params;

    const gitConfig: any = { repository };
    if (ref !== undefined) gitConfig.ref = ref;
    if (agent_setup !== undefined) gitConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'git', git: gitConfig },
      },
      options,
    );
  }

  /**
   * Create an agent from a storage object.
   *
   * @example
   * Upload agent code and create agent:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * // Upload agent directory as a storage object
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent-code',
   *   { name: 'agent-package' }
   * );
   *
   * // Create agent from the storage object
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-object-agent',
   *   object_id: storageObject.id
   * });
   * ```
   *
   * @example
   * With setup commands:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent-code',
   *   { name: 'agent-package' }
   * );
   *
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-object-agent',
   *   object_id: storageObject.id,
   *   agent_setup: [
   *     'chmod +x setup.sh',
   *     './setup.sh',
   *     'pip install -r requirements.txt'
   *   ]
   * });
   * ```
   *
   * @example
   * Complete workflow: storage object → agent → devbox:
   * ```typescript
   * const runloop = new RunloopSDK();
   *
   * // 1. Upload agent code
   * const storageObject = await runloop.storageObject.uploadFromDir(
   *   './my-agent',
   *   { name: 'agent-v1' }
   * );
   *
   * // 2. Create agent from storage object
   * const agent = await runloop.agent.createFromObject({
   *   name: 'my-agent',
   *   object_id: storageObject.id
   * });
   *
   * // 3. Create devbox with agent mounted
   * const devbox = await runloop.devbox.create({
   *   name: 'devbox-with-agent',
   *   mounts: [{
   *     type: 'agent_mount',
   *     agent_id: agent.id,
   *     agent_name: null,
   *     agent_path: '/home/user/agent'
   *   }]
   * });
   * ```
   *
   * @param {object} params - Parameters for creating the agent.
   * @param {string} params.object_id - Storage object ID.
   * @param {string[]} [params.agent_setup] - Setup commands to run after unpacking.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent>} An {@link Agent} instance.
   */
  async createFromObject(
    params: Omit<AgentCreateParams, 'source'> & {
      object_id: string;
      agent_setup?: string[];
    },
    options?: Core.RequestOptions,
  ): Promise<Agent> {
    const { object_id, agent_setup, ...restParams } = params;

    const objectConfig: any = { object_id };
    if (agent_setup !== undefined) objectConfig.agent_setup = agent_setup;

    return this.create(
      {
        ...restParams,
        source: { type: 'object', object: objectConfig },
      },
      options,
    );
  }

  /**
   * Get an agent object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agent = runloop.agent.fromId('agt_1234567890');
   *
   * // Get agent information
   * const info = await agent.getInfo();
   * console.log(`Agent name: ${info.name}`);
   * ```
   *
   * @param {string} id - The ID of the agent.
   * @returns {Agent} An {@link Agent} instance.
   */
  fromId(id: string): Agent {
    return Agent.fromId(this.client, id);
  }

  /**
   * List agents with optional filters (paginated).
   *
   * @example
   * List all agents:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agents = await runloop.agent.list();
   *
   * for (const agent of agents) {
   *   const info = await agent.getInfo();
   *   console.log(`${info.name}: ${info.source?.type}`);
   * }
   * ```
   *
   * @example
   * List with filters:
   * ```typescript
   * const runloop = new RunloopSDK();
   * const agents = await runloop.agent.list({
   *   name: 'my-agent',
   *   limit: 10
   * });
   * ```
   *
   * @param {AgentListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Agent[]>} An array of {@link Agent} instances.
   */
  async list(params?: AgentListParams, options?: Core.RequestOptions): Promise<Agent[]> {
    return Agent.list(this.client, params, options);
  }
}

/**
 * [Beta] Axon SDK interface for managing axons.
 *
 * @category Axon
 *
 * @remarks
 * ## Overview
 *
 * The `AxonOps` class provides a high-level abstraction for managing axons,
 * which are event communication channels. Axons support publishing events
 * and subscribing to event streams via server-sent events (SSE).
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.axon}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const axon = await runloop.axon.create();
 *
 * // Publish an event
 * await axon.publish({
 *   event_type: 'task_complete',
 *   origin: 'AGENT_EVENT',
 *   payload: JSON.stringify({ result: 'success' }),
 *   source: 'my-agent',
 * });
 *
 * // Subscribe to events
 * const stream = await axon.subscribeSse();
 * for await (const event of stream) {
 *   console.log(event.event_type, event.payload);
 * }
 * ```
 */
export class AxonOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * [Beta] Create a new axon.
   *
   * @param {AxonCreateParams} [params] - Parameters for creating the axon.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Axon>} An {@link Axon} instance.
   */
  async create(params?: AxonCreateParams, options?: Core.RequestOptions): Promise<Axon> {
    return Axon.create(this.client, params, options);
  }

  /**
   * Get an axon object by its ID.
   *
   * @param {string} id - The ID of the axon.
   * @returns {Axon} An {@link Axon} instance.
   */
  fromId(id: string): Axon {
    return Axon.fromId(this.client, id);
  }

  /**
   * [Beta] List all active axons.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const axons = await runloop.axon.list({ limit: 10 });
   * console.log(axons.map((a) => a.id));
   * ```
   *
   * @param {AxonListParams} [params] - Optional filter/pagination parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Axon[]>} An array of {@link Axon} instances.
   */
  async list(params?: AxonListParams, options?: Core.RequestOptions): Promise<Axon[]> {
    const result = await this.client.axons.list(params, options);
    const axons: Axon[] = [];
    for await (const axon of result) {
      axons.push(Axon.fromId(this.client, axon.id));
    }
    return axons;
  }
}

/**
 * Scorer SDK interface for managing custom scorers.
 *
 * @category Scorer
 *
 * @remarks
 * ## Overview
 *
 * Scorers are custom scoring functions used to evaluate scenario outputs. A scorer is a
 * script that runs and prints a score in the range [0.0, 1.0], e.g. `echo "0.5"`.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.scorer}. Create scorers with {@link ScorerOps.create}
 * or reference an existing scorer by ID with {@link ScorerOps.fromId} to obtain a {@link Scorer} instance.
 *
 * @example
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 *
 * const runloop = new RunloopSDK();
 *
 * // Create a scorer
 * const scorer = await runloop.scorer.create({
 *   type: 'my_scorer',
 *   bash_script: 'echo "1.0"',
 * });
 *
 * // Update the scorer
 * await scorer.update({ bash_script: 'echo "0.5"' });
 * ```
 *
 * @example
 * Get scorer info (typical usage):
 * ```typescript
 * const runloop = new RunloopSDK();
 * const scorer = await runloop.scorer.create({
 *   type: 'my_scorer',
 *   bash_script: 'echo "1.0"',
 * });
 *
 * const info = await scorer.getInfo();
 * console.log(`Scorer ${info.id} (${info.type})`);
 * ```
 */
export class ScorerOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new custom scorer.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorer = await runloop.scorer.create({
   *   type: 'my_scorer',
   *   bash_script: 'echo "1.0"',
   * });
   *
   * const info = await scorer.getInfo();
   * console.log(info.id);
   * ```
   *
   * @param {ScorerCreateParams} params - Parameters for creating the scorer
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer>} A {@link Scorer} instance
   */
  async create(params: ScorerCreateParams, options?: Core.RequestOptions): Promise<Scorer> {
    return Scorer.create(this.client, params, options);
  }

  /**
   * Get a scorer object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorer = runloop.scorer.fromId('scs_123');
   * const info = await scorer.getInfo();
   * console.log(info.type);
   * ```
   *
   * @param {string} id - The ID of the scorer
   * @returns {Scorer} A {@link Scorer} instance
   */
  fromId(id: string): Scorer {
    return Scorer.fromId(this.client, id);
  }

  /**
   * List scorers with optional filters (paginated).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scorers = await runloop.scorer.list({ limit: 10 });
   * console.log(scorers.map((s) => s.id));
   * ```
   *
   * @param {ScorerListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scorer[]>} An array of {@link Scorer} instances
   */
  async list(params?: ScorerListParams, options?: Core.RequestOptions): Promise<Scorer[]> {
    return Scorer.list(this.client, params, options);
  }
}

/**
 * Network Policy SDK interface for managing network policies.
 *
 * @category Network Policy
 *
 * @remarks
 * ## Overview
 *
 * The `NetworkPolicyOps` class provides a high-level abstraction for managing network policies,
 * which define egress network access rules for devboxes. Policies can be applied to blueprints,
 * devboxes, and snapshot resumes to control network access.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.networkPolicy}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const policy = await runloop.networkPolicy.create({
 *   name: 'restricted-policy',
 *   allow_all: false,
 *   allowed_hostnames: ['github.com', 'api.openai.com'],
 * });
 *
 * const info = await policy.getInfo();
 * console.log(`Policy: ${info.name}`);
 * ```
 */
export class NetworkPolicyOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new network policy.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const policy = await runloop.networkPolicy.create({
   *   name: 'my-policy',
   *   allow_all: false,
   *   allowed_hostnames: ['github.com', '*.npmjs.org'],
   *   allow_devbox_to_devbox: true,
   *   description: 'Policy for restricted network access',
   * });
   * ```
   *
   * @param {NetworkPolicyCreateParams} params - Parameters for creating the network policy.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<NetworkPolicy>} A {@link NetworkPolicy} instance.
   */
  async create(params: NetworkPolicyCreateParams, options?: Core.RequestOptions): Promise<NetworkPolicy> {
    return NetworkPolicy.create(this.client, params, options);
  }

  /**
   * Get a network policy object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const policy = runloop.networkPolicy.fromId('npol_1234567890');
   * const info = await policy.getInfo();
   * console.log(`Policy name: ${info.name}`);
   * ```
   *
   * @param {string} id - The ID of the network policy.
   * @returns {NetworkPolicy} A {@link NetworkPolicy} instance.
   */
  fromId(id: string): NetworkPolicy {
    return NetworkPolicy.fromId(this.client, id);
  }

  /**
   * List network policies with optional filters (paginated).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const policies = await runloop.networkPolicy.list({ limit: 10 });
   * console.log(policies.map((p) => p.id));
   * ```
   *
   * @param {NetworkPolicyListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<NetworkPolicy[]>} An array of {@link NetworkPolicy} instances.
   */
  async list(params?: NetworkPolicyListParams, options?: Core.RequestOptions): Promise<NetworkPolicy[]> {
    const result = await this.client.networkPolicies.list(params, options);
    const policies: NetworkPolicy[] = [];

    for await (const policy of result) {
      policies.push(NetworkPolicy.fromId(this.client, policy.id));
    }

    return policies;
  }
}

/**
 * Gateway Config SDK interface for managing gateway configurations.
 *
 * @category Gateway Config
 *
 * @remarks
 * ## Overview
 *
 * The `GatewayConfigOps` class provides a high-level abstraction for managing gateway configurations,
 * which define how to proxy API requests through the credential gateway. Gateway configs specify
 * the target endpoint and how credentials should be applied, enabling secure API proxying without
 * exposing API keys.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.gatewayConfig}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const gatewayConfig = await runloop.gatewayConfig.create({
 *   name: 'my-api-gateway',
 *   endpoint: 'https://api.example.com',
 *   auth_mechanism: { type: 'bearer' },
 * });
 *
 * // Use with a devbox
 * const devbox = await runloop.devbox.create({
 *   name: 'my-devbox',
 *   gateways: {
 *     'MY_API': {
 *       gateway: gatewayConfig.id,
 *       secret: 'my-api-key-secret',
 *     },
 *   },
 * });
 * ```
 */
export class GatewayConfigOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new gateway config.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const gatewayConfig = await runloop.gatewayConfig.create({
   *   name: 'my-gateway',
   *   endpoint: 'https://api.example.com',
   *   auth_mechanism: { type: 'header', key: 'x-api-key' },
   *   description: 'Gateway for My API',
   * });
   * ```
   *
   * @param {GatewayConfigCreateParams} params - Parameters for creating the gateway config.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<GatewayConfig>} A {@link GatewayConfig} instance.
   */
  async create(params: GatewayConfigCreateParams, options?: Core.RequestOptions): Promise<GatewayConfig> {
    return GatewayConfig.create(this.client, params, options);
  }

  /**
   * Get a gateway config object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const gatewayConfig = runloop.gatewayConfig.fromId('gwc_1234567890');
   * const info = await gatewayConfig.getInfo();
   * console.log(`Gateway Config name: ${info.name}`);
   * ```
   *
   * @param {string} id - The ID of the gateway config.
   * @returns {GatewayConfig} A {@link GatewayConfig} instance.
   */
  fromId(id: string): GatewayConfig {
    return GatewayConfig.fromId(this.client, id);
  }

  /**
   * List gateway configs with optional filters (paginated).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const configs = await runloop.gatewayConfig.list({ limit: 10 });
   * console.log(configs.map((c) => c.id));
   * ```
   *
   * @param {GatewayConfigListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<GatewayConfig[]>} An array of {@link GatewayConfig} instances.
   */
  async list(params?: GatewayConfigListParams, options?: Core.RequestOptions): Promise<GatewayConfig[]> {
    const result = await this.client.gatewayConfigs.list(params, options);
    const configs: GatewayConfig[] = [];

    for await (const config of result) {
      configs.push(GatewayConfig.fromId(this.client, config.id));
    }

    return configs;
  }
}

/**
 * MCP Config SDK interface for managing MCP configurations.
 *
 * @category MCP Config
 *
 * @remarks
 * ## Overview
 *
 * The `McpConfigOps` class provides a high-level abstraction for managing MCP configurations,
 * which define how to connect to upstream MCP (Model Context Protocol) servers. MCP configs
 * specify the target endpoint and which tools are allowed.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.mcpConfig}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const mcpConfig = await runloop.mcpConfig.create({
 *   name: 'my-mcp-server',
 *   endpoint: 'https://mcp.example.com',
 *   allowed_tools: ['*'],
 * });
 *
 * const info = await mcpConfig.getInfo();
 * console.log(`MCP Config: ${info.name}`);
 * ```
 */
export class McpConfigOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new MCP config.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const mcpConfig = await runloop.mcpConfig.create({
   *   name: 'my-mcp-server',
   *   endpoint: 'https://mcp.example.com',
   *   allowed_tools: ['*'],
   *   description: 'MCP server for my tools',
   * });
   * ```
   *
   * @param {McpConfigCreateParams} params - Parameters for creating the MCP config.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<McpConfig>} A {@link McpConfig} instance.
   */
  async create(params: McpConfigCreateParams, options?: Core.RequestOptions): Promise<McpConfig> {
    return McpConfig.create(this.client, params, options);
  }

  /**
   * Get an MCP config object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const mcpConfig = runloop.mcpConfig.fromId('mcp_1234567890');
   * const info = await mcpConfig.getInfo();
   * console.log(`MCP Config name: ${info.name}`);
   * ```
   *
   * @param {string} id - The ID of the MCP config.
   * @returns {McpConfig} A {@link McpConfig} instance.
   */
  fromId(id: string): McpConfig {
    return McpConfig.fromId(this.client, id);
  }

  /**
   * List MCP configs with optional filters (paginated).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const configs = await runloop.mcpConfig.list({ limit: 10 });
   * console.log(configs.map((c) => c.id));
   * ```
   *
   * @param {McpConfigListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<McpConfig[]>} An array of {@link McpConfig} instances.
   */
  async list(params?: McpConfigListParams, options?: Core.RequestOptions): Promise<McpConfig[]> {
    const result = await this.client.mcpConfigs.list(params, options);
    const configs: McpConfig[] = [];

    for await (const config of result) {
      configs.push(McpConfig.fromId(this.client, config.id));
    }

    return configs;
  }
}

/**
 * Scenario SDK interface for managing scenarios.
 *
 * @category Scenario
 *
 * @remarks
 * ## Overview
 *
 * The `ScenarioOps` class provides a high-level abstraction for managing scenarios.
 *
 * ## Quickstart
 *
 * Use `fromId()` to get a {@link Scenario} by ID, `list()` to retrieve all scenarios,
 * or `builder()` to construct a new scenario with a fluent API.
 * Once you have a scenario, call `scenario.run()` to start a {@link ScenarioRun} with
 * your agent mounted.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.scenario}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 * const scenario = runloop.scenario.fromId('scn_123');
 *
 * // Get scenario details
 * const info = await scenario.getInfo();
 * console.log(info.name);
 *
 * // Start a run with agent mounted and wait for the devbox to be ready
 * const run = await scenario.run({
 *   run_name: 'my-run',
 *   runProfile: {
 *     mounts: [{
 *       type: 'agent_mount',
 *       agent_id: 'agt_123',
 *       agent_name: null,
 *       agent_path: '/home/user/agent',
 *     }],
 *   },
 * });
 *
 * // Execute your agent on the devbox
 * await run.devbox.cmd.exec('python /home/user/agent/main.py');
 *
 * // Score and complete
 * await run.scoreAndComplete();
 * ```
 */
export class ScenarioOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new {@link ScenarioBuilder} for constructing a scenario with a fluent API.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scenario = await runloop.scenario
   *   .builder('my-scenario')
   *   .withProblemStatement('Fix the bug in main.py')
   *   .addTestCommandScorer('tests', { test_command: 'pytest' })
   *   .push();
   * ```
   *
   * @param {string} name - Name for the scenario
   * @returns {ScenarioBuilder} A {@link ScenarioBuilder} instance
   */
  builder(name: string): ScenarioBuilder {
    return new ScenarioBuilder(name, this.client);
  }

  /**
   * Get a scenario object by its ID.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scenario = runloop.scenario.fromId('scn_123');
   * const info = await scenario.getInfo();
   * console.log(info.name);
   * ```
   *
   * @param {string} id - The ID of the scenario
   * @returns {Scenario} A {@link Scenario} instance
   */
  fromId(id: string): Scenario {
    return Scenario.fromId(this.client, id);
  }

  /**
   * List scenarios with optional filters (paginated).
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const scenarios = await runloop.scenario.list({ limit: 10 });
   * console.log(scenarios.map((s) => s.id));
   * ```
   *
   * @param {ScenarioListParams} [params] - Optional filter parameters
   * @param {Core.RequestOptions} [options] - Request options
   * @returns {Promise<Scenario[]>} An array of {@link Scenario} instances
   */
  async list(params?: ScenarioListParams, options?: Core.RequestOptions): Promise<Scenario[]> {
    const result = await this.client.scenarios.list(params, options);
    const scenarios: Scenario[] = [];

    for (const scenario of result.scenarios) {
      scenarios.push(Scenario.fromId(this.client, scenario.id));
    }

    return scenarios;
  }
}

/**
 * Secret SDK interface for managing secrets.
 *
 * @category Secret
 *
 * @remarks
 * ## Overview
 *
 * The `SecretOps` class provides methods for managing secrets, which are encrypted key-value
 * pairs that can be injected into devboxes as environment variables. Secrets are identified
 * by their globally unique name.
 *
 * ## Usage
 *
 * This interface is accessed via {@link RunloopSDK.secret}. You should construct
 * a {@link RunloopSDK} instance and use it from there:
 *
 * @example
 * ```typescript
 * const runloop = new RunloopSDK();
 *
 * // Create a secret
 * const secret = await runloop.secret.create({
 *   name: 'MY_API_KEY',
 *   value: process.env.SOME_API_KEY,
 * });
 *
 * // Use the secret object directly in a devbox
 * const devbox = await runloop.devbox.create({
 *   name: 'my-devbox',
 *   secrets: { 'API_KEY': secret },  // Can use Secret object or string name
 * });
 *
 * // The secret is now available as $API_KEY in the devbox
 * const result = await devbox.cmd.exec('echo $API_KEY');
 * ```
 */
export class SecretOps {
  /**
   * @private
   */
  constructor(private client: RunloopAPI) {}

  /**
   * Create a new secret.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const secret = await runloop.secret.create({
   *   name: 'DATABASE_PASSWORD',
   *   value: 'my-secure-password',
   * });
   * console.log(`Created secret: ${secret.name}`);
   * ```
   *
   * @param {SecretCreateParams} params - Parameters for creating the secret.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Secret>} The created {@link Secret} instance.
   */
  async create(params: SecretCreateParams, options?: Core.RequestOptions): Promise<Secret> {
    const view = await this.client.secrets.create(params, options);
    return Secret.fromView(this.client, view);
  }

  /**
   * Get a Secret instance by name without making an API call.
   * Use getInfo() on the returned Secret to fetch the actual data.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const secret = runloop.secret.fromName('MY_API_KEY');
   * const info = await secret.getInfo();
   * console.log(`Secret ID: ${info.id}`);
   * ```
   *
   * @param {string} name - The globally unique name of the secret.
   * @returns {Secret} A {@link Secret} instance.
   */
  fromName(name: string): Secret {
    return Secret.fromName(this.client, name);
  }

  /**
   * Update an existing secret's value.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * // Using a secret name string
   * const updated = await runloop.secret.update('DATABASE_PASSWORD', {
   *   value: 'my-new-password',
   * });
   *
   * // Or using a Secret object
   * const secret = runloop.secret.fromName('DATABASE_PASSWORD');
   * const updated2 = await runloop.secret.update(secret, {
   *   value: 'another-new-password',
   * });
   * ```
   *
   * @param {Secret | string} secret - The secret to update (Secret object or name string).
   * @param {SecretUpdateParams} params - Parameters for updating the secret.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Secret>} The updated {@link Secret} instance.
   */
  async update(
    secret: Secret | string,
    params: SecretUpdateParams,
    options?: Core.RequestOptions,
  ): Promise<Secret> {
    const name = resolveSecretName(secret);
    const view = await this.client.secrets.update(name, params, options);
    return Secret.fromView(this.client, view);
  }

  /**
   * List all secrets.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * const secrets = await runloop.secret.list();
   * for (const secret of secrets) {
   *   console.log(`${secret.name}`);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // With pagination
   * const secrets = await runloop.secret.list({ limit: 10 });
   * ```
   *
   * @param {SecretListParams} [params] - Optional filter parameters.
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<Secret[]>} An array of {@link Secret} instances.
   */
  async list(params?: SecretListParams, options?: Core.RequestOptions): Promise<Secret[]> {
    const result = await this.client.secrets.list(params, options);
    return result.secrets.map((view) => Secret.fromView(this.client, view));
  }

  /**
   * Delete a secret.
   *
   * @example
   * ```typescript
   * const runloop = new RunloopSDK();
   * // Using a secret name string
   * const deleted = await runloop.secret.delete('DATABASE_PASSWORD');
   *
   * // Or using a Secret object
   * const secret = runloop.secret.fromName('MY_SECRET');
   * await runloop.secret.delete(secret);
   * ```
   *
   * @param {Secret | string} secret - The secret to delete (Secret object or name string).
   * @param {Core.RequestOptions} [options] - Request options.
   * @returns {Promise<SecretView>} The deleted secret metadata.
   */
  async delete(secret: Secret | string, options?: Core.RequestOptions): Promise<SecretView> {
    const name = resolveSecretName(secret);
    return this.client.secrets.delete(name, {}, options);
  }
}

// @deprecated Use {@link RunloopSDK} instead.
/**
 * @deprecated Use {@link RunloopSDK} instead.
 * @example
 * ```typescript
 * import { RunloopSDK } from '@runloop/api-client';
 * const runloop = new RunloopSDK();
 * const devbox = await runloop.devbox.create({ name: 'my-devbox' });
 * ```
 */
export default Runloop;

export declare namespace RunloopSDK {
  export {
    RunloopSDK as Client,
    DevboxOps as DevboxOps,
    BlueprintOps as BlueprintOps,
    SnapshotOps as SnapshotOps,
    StorageObjectOps as StorageObjectOps,
    AgentOps as AgentOps,
    AxonOps as AxonOps,
    ScorerOps as ScorerOps,
    NetworkPolicyOps as NetworkPolicyOps,
    GatewayConfigOps as GatewayConfigOps,
    McpConfigOps as McpConfigOps,
    ScenarioOps as ScenarioOps,
    SecretOps as SecretOps,
    Devbox as Devbox,
    Blueprint as Blueprint,
    Snapshot as Snapshot,
    StorageObject as StorageObject,
    Agent as Agent,
    Axon as Axon,
    Scorer as Scorer,
    NetworkPolicy as NetworkPolicy,
    GatewayConfig as GatewayConfig,
    McpConfig as McpConfig,
    Secret as Secret,
    Scenario as Scenario,
  };
}
// Export SDK classes from sdk/sdk.ts - these are separate from RunloopSDK to avoid circular dependencies
export {
  Devbox,
  DevboxCmdOps,
  DevboxFileOps,
  DevboxNetOps,
  type ExecuteStreamingCallbacks,
  Blueprint,
  Snapshot,
  StorageObject,
  Agent,
  Axon,
  Scorer,
  NetworkPolicy,
  McpConfig,
  Secret,
  Execution,
  ExecutionResult,
  Scenario,
  ScenarioRun,
} from './sdk/index';
