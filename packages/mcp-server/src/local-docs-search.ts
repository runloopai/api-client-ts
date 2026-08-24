// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import MiniSearch from 'minisearch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getLogger } from './logger';

type PerLanguageData = {
  method?: string;
  example?: string;
};

type MethodEntry = {
  name: string;
  endpoint: string;
  httpMethod: string;
  summary: string;
  description: string;
  stainlessPath: string;
  qualified: string;
  params?: string[];
  response?: string;
  markdown?: string;
  perLanguage?: Record<string, PerLanguageData>;
};

type ProseChunk = {
  content: string;
  tag: string;
  sectionContext?: string;
  source?: string;
};

type MiniSearchDocument = {
  id: string;
  kind: 'http_method' | 'prose';
  name?: string;
  endpoint?: string;
  summary?: string;
  description?: string;
  qualified?: string;
  stainlessPath?: string;
  content?: string;
  sectionContext?: string;
  _original: Record<string, unknown>;
};

type SearchResult = {
  results: (string | Record<string, unknown>)[];
};

const EMBEDDED_METHODS: MethodEntry[] = [
  {
    name: 'me',
    endpoint: '/v1/accounts/me',
    httpMethod: 'get',
    summary: "Get the authenticated caller's account.",
    description:
      'Returns the account the API key or session is authenticated against, including id, name, tier, and billing summary.',
    stainlessPath: '(resource) accounts > (method) me',
    qualified: 'client.accounts.me',
    response:
      "{ id: string; account_status: string; billing: { account_billing_type: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; aws?: { customer_identifier?: string; license_arn?: string; subscription_status?: string; }; stripe?: { active_subscription?: string; customer_id?: string; }; stripe_customer_id?: string; }; created_at: string; name: string; tier: string; account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; active_subscription?: string; external_billing_account_id?: string; stripe_customer_id?: string; }",
    markdown:
      "## me\n\n`client.accounts.me(): { id: string; account_status: string; billing: object; created_at: string; name: string; tier: string; account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; active_subscription?: string; external_billing_account_id?: string; stripe_customer_id?: string; }`\n\n**get** `/v1/accounts/me`\n\nReturns the account the API key or session is authenticated against, including id, name, tier, and billing summary.\n\n### Returns\n\n- `{ id: string; account_status: string; billing: { account_billing_type: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; aws?: { customer_identifier?: string; license_arn?: string; subscription_status?: string; }; stripe?: { active_subscription?: string; customer_id?: string; }; stripe_customer_id?: string; }; created_at: string; name: string; tier: string; account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; active_subscription?: string; external_billing_account_id?: string; stripe_customer_id?: string; }`\n  Account information.\n\n  - `id: string`\n  - `account_status: string`\n  - `billing: { account_billing_type: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'; aws?: { customer_identifier?: string; license_arn?: string; subscription_status?: string; }; stripe?: { active_subscription?: string; customer_id?: string; }; stripe_customer_id?: string; }`\n  - `created_at: string`\n  - `name: string`\n  - `tier: string`\n  - `account_billing_type?: 'STRIPE' | 'AWS_MARKETPLACE' | 'STRIPE_PROJECTS' | 'UNRECOGNIZED'`\n  - `active_subscription?: string`\n  - `external_billing_account_id?: string`\n  - `stripe_customer_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst accountView = await client.accounts.me();\n\nconsole.log(accountView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/benchmarks',
    httpMethod: 'post',
    summary: 'Create a Benchmark.',
    description: 'Create a Benchmark with a set of Scenarios.',
    stainlessPath: '(resource) benchmarks > (method) create',
    qualified: 'client.benchmarks.create',
    params: [
      'name: string;',
      'attribution?: string;',
      'description?: string;',
      'metadata?: object;',
      'required_environment_variables?: string[];',
      'required_secret_names?: string[];',
      'scenario_ids?: string[];',
    ],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## create\n\n`client.benchmarks.create(name: string, attribution?: string, description?: string, metadata?: object, required_environment_variables?: string[], required_secret_names?: string[], scenario_ids?: string[]): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**post** `/v1/benchmarks`\n\nCreate a Benchmark with a set of Scenarios.\n\n### Parameters\n\n- `name: string`\n  The unique name of the Benchmark.\n\n- `attribution?: string`\n  Attribution information for the benchmark.\n\n- `description?: string`\n  Detailed description of the benchmark.\n\n- `metadata?: object`\n  User defined metadata to attach to the benchmark.\n\n- `required_environment_variables?: string[]`\n  Environment variables required to run the benchmark. If any required variables are not supplied, the benchmark will fail to start.\n\n- `required_secret_names?: string[]`\n  Secrets required to run the benchmark with (environment variable name will be mapped to the your user secret by name). If any of these secrets are not provided or the mapping is incorrect, the benchmark will fail to start.\n\n- `scenario_ids?: string[]`\n  The Scenario IDs that make up the Benchmark.\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkView = await client.benchmarks.create({ name: 'name' });\n\nconsole.log(benchmarkView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/benchmarks/{id}',
    httpMethod: 'get',
    summary: 'Get a Benchmark.',
    description: 'Get a previously created Benchmark.',
    stainlessPath: '(resource) benchmarks > (method) retrieve',
    qualified: 'client.benchmarks.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## retrieve\n\n`client.benchmarks.retrieve(id: string): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**get** `/v1/benchmarks/{id}`\n\nGet a previously created Benchmark.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkView = await client.benchmarks.retrieve('id');\n\nconsole.log(benchmarkView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/benchmarks/{id}',
    httpMethod: 'post',
    summary: 'Update a Benchmark.',
    description:
      'Update a Benchmark. Fields that are null will preserve the existing value. Fields that are provided (including empty values) will replace the existing value entirely.',
    stainlessPath: '(resource) benchmarks > (method) update',
    qualified: 'client.benchmarks.update',
    params: [
      'id: string;',
      'attribution?: string;',
      'description?: string;',
      'metadata?: object;',
      'name?: string;',
      'required_environment_variables?: string[];',
      'required_secret_names?: string[];',
      'scenario_ids?: string[];',
    ],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## update\n\n`client.benchmarks.update(id: string, attribution?: string, description?: string, metadata?: object, name?: string, required_environment_variables?: string[], required_secret_names?: string[], scenario_ids?: string[]): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**post** `/v1/benchmarks/{id}`\n\nUpdate a Benchmark. Fields that are null will preserve the existing value. Fields that are provided (including empty values) will replace the existing value entirely.\n\n### Parameters\n\n- `id: string`\n\n- `attribution?: string`\n  Attribution information for the benchmark. Pass in empty string to clear.\n\n- `description?: string`\n  Detailed description of the benchmark. Pass in empty string to clear.\n\n- `metadata?: object`\n  User defined metadata to attach to the benchmark. Pass in empty map to clear.\n\n- `name?: string`\n  The unique name of the Benchmark. Cannot be blank.\n\n- `required_environment_variables?: string[]`\n  Environment variables required to run the benchmark. If any required variables are not supplied, the benchmark will fail to start. Pass in empty list to clear.\n\n- `required_secret_names?: string[]`\n  Secrets required to run the benchmark with (environment variable name will be mapped to the your user secret by name). If any of these secrets are not provided or the mapping is incorrect, the benchmark will fail to start. Pass in empty list to clear.\n\n- `scenario_ids?: string[]`\n  The Scenario IDs that make up the Benchmark. Pass in empty list to clear.\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkView = await client.benchmarks.update('id');\n\nconsole.log(benchmarkView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/benchmarks',
    httpMethod: 'get',
    summary: 'List Benchmarks.',
    description: 'List all Benchmarks matching filter.',
    stainlessPath: '(resource) benchmarks > (method) list',
    qualified: 'client.benchmarks.list',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## list\n\n`client.benchmarks.list(include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**get** `/v1/benchmarks`\n\nList all Benchmarks matching filter.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `search?: string`\n  Search by benchmark ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const benchmarkView of client.benchmarks.list()) {\n  console.log(benchmarkView);\n}\n```",
  },
  {
    name: 'definitions',
    endpoint: '/v1/benchmarks/{id}/definitions',
    httpMethod: 'get',
    summary: 'Get scenario definitions for a Benchmark.',
    description: 'Get scenario definitions for a previously created Benchmark.',
    stainlessPath: '(resource) benchmarks > (method) definitions',
    qualified: 'client.benchmarks.definitions',
    params: ['id: string;', 'limit?: number;', 'starting_after?: string;'],
    response:
      "{ has_more: boolean; scenarios: { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }[]; total_count?: number; }",
    markdown:
      "## definitions\n\n`client.benchmarks.definitions(id: string, limit?: number, starting_after?: string): { has_more: boolean; scenarios: scenario_view[]; total_count?: number; }`\n\n**get** `/v1/benchmarks/{id}/definitions`\n\nGet scenario definitions for a previously created Benchmark.\n\n### Parameters\n\n- `id: string`\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ has_more: boolean; scenarios: { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }[]; total_count?: number; }`\n\n  - `has_more: boolean`\n  - `scenarios: { id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }[]`\n  - `total_count?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioDefinitionListView = await client.benchmarks.definitions('id');\n\nconsole.log(scenarioDefinitionListView);\n```",
  },
  {
    name: 'list_public',
    endpoint: '/v1/benchmarks/list_public',
    httpMethod: 'get',
    summary: 'List Public Benchmarks.',
    description: 'List all public benchmarks matching filter.',
    stainlessPath: '(resource) benchmarks > (method) list_public',
    qualified: 'client.benchmarks.listPublic',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## list_public\n\n`client.benchmarks.listPublic(include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**get** `/v1/benchmarks/list_public`\n\nList all public benchmarks matching filter.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `search?: string`\n  Search by benchmark ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const benchmarkView of client.benchmarks.listPublic()) {\n  console.log(benchmarkView);\n}\n```",
  },
  {
    name: 'start_run',
    endpoint: '/v1/benchmarks/start_run',
    httpMethod: 'post',
    summary: 'Start a new BenchmarkRun.',
    description: 'Start a new BenchmarkRun based on the provided Benchmark.',
    stainlessPath: '(resource) benchmarks > (method) start_run',
    qualified: 'client.benchmarks.startRun',
    params: [
      'benchmark_id: string;',
      'metadata?: object;',
      'run_name?: string;',
      "runProfile?: { envVars?: object; launchParameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; mounts?: object | object | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | object[]; purpose?: string; secrets?: object; };",
    ],
    response:
      "{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }",
    markdown:
      "## start_run\n\n`client.benchmarks.startRun(benchmark_id: string, metadata?: object, run_name?: string, runProfile?: { envVars?: object; launchParameters?: launch_parameters; mounts?: mount[]; purpose?: string; secrets?: object; }): { id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n\n**post** `/v1/benchmarks/start_run`\n\nStart a new BenchmarkRun based on the provided Benchmark.\n\n### Parameters\n\n- `benchmark_id: string`\n  ID of the Benchmark to run.\n\n- `metadata?: object`\n  User defined metadata to attach to the benchmark run for organization.\n\n- `run_name?: string`\n  Display name of the run.\n\n- `runProfile?: { envVars?: object; launchParameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; mounts?: object | object | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | object[]; purpose?: string; secrets?: object; }`\n  Runtime configuration to use for this benchmark run\n  - `envVars?: object`\n    Mapping of Environment Variable to Value. May be shown in devbox logging. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable 'DB_PASS' to the value 'DATABASE_PASSWORD_VALUE'.\n  - `launchParameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n    LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `mounts?: { object_id: string; object_path: string; type: 'object_mount'; } | { agent_id: string; agent_name: string; type: 'agent_mount'; agent_path?: string; auth_token?: string; } | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | { axon_id: string; type: 'broker_mount'; agent_binary?: string; launch_args?: string[]; protocol?: 'acp' | 'claude_json' | 'codex_json' | 'pi_json'; working_directory?: string; }[]`\n    A list of mounts to be included in the scenario run.\n  - `purpose?: string`\n    Purpose of the run.\n  - `secrets?: object`\n    Mapping of Environment Variable to User Secret Name. Never shown in devbox logging. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable 'DB_PASS' to the value of the secret 'DATABASE_PASSWORD'.\n\n### Returns\n\n- `{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n  A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark or created by a BenchmarkJob.\n\n  - `id: string`\n  - `metadata: object`\n  - `start_time_ms: number`\n  - `state: 'running' | 'canceled' | 'completed' | 'failed'`\n  - `benchmark_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `score?: number`\n  - `secrets_provided?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkRunView = await client.benchmarks.startRun({ benchmark_id: 'benchmark_id' });\n\nconsole.log(benchmarkRunView);\n```",
  },
  {
    name: 'update_scenarios',
    endpoint: '/v1/benchmarks/{id}/scenarios',
    httpMethod: 'post',
    summary: 'Modify scenarios for a Benchmark.',
    description: 'Add and/or remove Scenario IDs from an existing Benchmark.',
    stainlessPath: '(resource) benchmarks > (method) update_scenarios',
    qualified: 'client.benchmarks.updateScenarios',
    params: ['id: string;', 'scenarios_to_add?: string[];', 'scenarios_to_remove?: string[];'],
    response:
      "{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }",
    markdown:
      "## update_scenarios\n\n`client.benchmarks.updateScenarios(id: string, scenarios_to_add?: string[], scenarios_to_remove?: string[]): { id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n\n**post** `/v1/benchmarks/{id}/scenarios`\n\nAdd and/or remove Scenario IDs from an existing Benchmark.\n\n### Parameters\n\n- `id: string`\n\n- `scenarios_to_add?: string[]`\n  Scenario IDs to add to the Benchmark.\n\n- `scenarios_to_remove?: string[]`\n  Scenario IDs to remove from the Benchmark.\n\n### Returns\n\n- `{ id: string; metadata: object; name: string; scenarioIds: string[]; status: 'active' | 'archived'; attribution?: string; description?: string; is_public?: boolean; required_environment_variables?: string[]; required_secret_names?: string[]; }`\n  A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.\n\n  - `id: string`\n  - `metadata: object`\n  - `name: string`\n  - `scenarioIds: string[]`\n  - `status: 'active' | 'archived'`\n  - `attribution?: string`\n  - `description?: string`\n  - `is_public?: boolean`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkView = await client.benchmarks.updateScenarios('id');\n\nconsole.log(benchmarkView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/benchmark_runs/{id}',
    httpMethod: 'get',
    summary: 'Get a previously created BenchmarkRun.',
    description: 'Get a BenchmarkRun given ID.',
    stainlessPath: '(resource) benchmark_runs > (method) retrieve',
    qualified: 'client.benchmarkRuns.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }",
    markdown:
      "## retrieve\n\n`client.benchmarkRuns.retrieve(id: string): { id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n\n**get** `/v1/benchmark_runs/{id}`\n\nGet a BenchmarkRun given ID.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n  A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark or created by a BenchmarkJob.\n\n  - `id: string`\n  - `metadata: object`\n  - `start_time_ms: number`\n  - `state: 'running' | 'canceled' | 'completed' | 'failed'`\n  - `benchmark_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `score?: number`\n  - `secrets_provided?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkRunView = await client.benchmarkRuns.retrieve('id');\n\nconsole.log(benchmarkRunView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/benchmark_runs',
    httpMethod: 'get',
    summary: 'List BenchmarkRuns.',
    description: 'List all BenchmarkRuns matching filter.',
    stainlessPath: '(resource) benchmark_runs > (method) list',
    qualified: 'client.benchmarkRuns.list',
    params: [
      'benchmark_id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      'state?: string;',
    ],
    response:
      "{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }",
    markdown:
      "## list\n\n`client.benchmarkRuns.list(benchmark_id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, state?: string): { id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n\n**get** `/v1/benchmark_runs`\n\nList all BenchmarkRuns matching filter.\n\n### Parameters\n\n- `benchmark_id?: string`\n  The Benchmark ID to filter by.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `search?: string`\n  Search by benchmark run ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `state?: string`\n  Filter by state\n\n### Returns\n\n- `{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n  A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark or created by a BenchmarkJob.\n\n  - `id: string`\n  - `metadata: object`\n  - `start_time_ms: number`\n  - `state: 'running' | 'canceled' | 'completed' | 'failed'`\n  - `benchmark_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `score?: number`\n  - `secrets_provided?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const benchmarkRunView of client.benchmarkRuns.list()) {\n  console.log(benchmarkRunView);\n}\n```",
  },
  {
    name: 'cancel',
    endpoint: '/v1/benchmark_runs/{id}/cancel',
    httpMethod: 'post',
    summary: 'Cancel a currently running Benchmark run.',
    description:
      'Cancel a Benchmark run. This will do the following: 1. Cancel all running scenarios and shutdown the underlying Devbox resources 2. Update the benchmark state to CANCELED 3. Calculate final score from completed scenarios',
    stainlessPath: '(resource) benchmark_runs > (method) cancel',
    qualified: 'client.benchmarkRuns.cancel',
    params: ['id: string;'],
    response:
      "{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }",
    markdown:
      "## cancel\n\n`client.benchmarkRuns.cancel(id: string): { id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n\n**post** `/v1/benchmark_runs/{id}/cancel`\n\nCancel a Benchmark run. This will do the following: 1. Cancel all running scenarios and shutdown the underlying Devbox resources 2. Update the benchmark state to CANCELED 3. Calculate final score from completed scenarios\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n  A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark or created by a BenchmarkJob.\n\n  - `id: string`\n  - `metadata: object`\n  - `start_time_ms: number`\n  - `state: 'running' | 'canceled' | 'completed' | 'failed'`\n  - `benchmark_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `score?: number`\n  - `secrets_provided?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkRunView = await client.benchmarkRuns.cancel('id');\n\nconsole.log(benchmarkRunView);\n```",
  },
  {
    name: 'complete',
    endpoint: '/v1/benchmark_runs/{id}/complete',
    httpMethod: 'post',
    summary: 'Complete a BenchmarkRun.',
    description: 'Complete a currently running BenchmarkRun.',
    stainlessPath: '(resource) benchmark_runs > (method) complete',
    qualified: 'client.benchmarkRuns.complete',
    params: ['id: string;'],
    response:
      "{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }",
    markdown:
      "## complete\n\n`client.benchmarkRuns.complete(id: string): { id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n\n**post** `/v1/benchmark_runs/{id}/complete`\n\nComplete a currently running BenchmarkRun.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; metadata: object; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; benchmark_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; score?: number; secrets_provided?: object; }`\n  A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark or created by a BenchmarkJob.\n\n  - `id: string`\n  - `metadata: object`\n  - `start_time_ms: number`\n  - `state: 'running' | 'canceled' | 'completed' | 'failed'`\n  - `benchmark_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `score?: number`\n  - `secrets_provided?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkRunView = await client.benchmarkRuns.complete('id');\n\nconsole.log(benchmarkRunView);\n```",
  },
  {
    name: 'list_scenario_runs',
    endpoint: '/v1/benchmark_runs/{id}/scenario_runs',
    httpMethod: 'get',
    summary: 'List started scenario runs for a benchmark run.',
    description: 'List started scenario runs for a benchmark run.',
    stainlessPath: '(resource) benchmark_runs > (method) list_scenario_runs',
    qualified: 'client.benchmarkRuns.listScenarioRuns',
    params: [
      'id: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'search?: string;',
      'starting_after?: string;',
      "state?: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed';",
    ],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## list_scenario_runs\n\n`client.benchmarkRuns.listScenarioRuns(id: string, include_total_count?: boolean, limit?: number, search?: string, starting_after?: string, state?: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**get** `/v1/benchmark_runs/{id}/scenario_runs`\n\nList started scenario runs for a benchmark run.\n\n### Parameters\n\n- `id: string`\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `search?: string`\n  Search by scenario run ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `state?: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  Filter by Scenario Run state\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const scenarioRunView of client.benchmarkRuns.listScenarioRuns('id')) {\n  console.log(scenarioRunView);\n}\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/benchmark_jobs',
    httpMethod: 'post',
    summary: '[Beta] Create a BenchmarkJob.',
    description: '[Beta] Create a BenchmarkJob that runs a set of scenarios entirely on runloop.',
    stainlessPath: '(resource) benchmark_jobs > (method) create',
    qualified: 'client.benchmarkJobs.create',
    params: [
      'name?: string;',
      "spec?: { inline_yaml: string; type: 'harbor'; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; benchmark_id: string; type: 'benchmark'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; type: 'scenarios'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; };",
    ],
    response:
      "{ id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: object[]; average_score?: number; duration_ms?: number; model_name?: string; }[]; failure_reason?: string; in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: object | object; duration_ms?: number; }[]; job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }; job_spec?: { agent_configs: object[]; scenario_ids: string[]; orchestrator_config?: object; }; }",
    markdown:
      "## create\n\n`client.benchmarkJobs.create(name?: string, spec?: { inline_yaml: string; type: 'harbor'; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; benchmark_id: string; type: 'benchmark'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; type: 'scenarios'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }): { id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: object[]; failure_reason?: string; in_progress_runs?: object[]; job_source?: object | object | object; job_spec?: object; }`\n\n**post** `/v1/benchmark_jobs`\n\n[Beta] Create a BenchmarkJob that runs a set of scenarios entirely on runloop.\n\n### Parameters\n\n- `name?: string`\n  The name of the BenchmarkJob. If not provided, name will be generated based on target dataset.\n\n- `spec?: { inline_yaml: string; type: 'harbor'; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; benchmark_id: string; type: 'benchmark'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; } | { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; type: 'scenarios'; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }`\n  The job specification. Exactly one spec type must be set.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: { scenario_definition_id: string; scenario_name: string; state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED'; duration_ms?: number; failure_reason?: object; scenario_run_id?: string; score?: number; }[]; average_score?: number; duration_ms?: number; model_name?: string; }[]; failure_reason?: string; in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: { type: 'external_api'; info?: string; } | { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }; duration_ms?: number; }[]; job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }; job_spec?: { agent_configs: { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }; }`\n  A BenchmarkJobView represents a benchmark job that runs a set of scenarios entirely on runloop.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'`\n  - `benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: { scenario_definition_id: string; scenario_name: string; state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED'; duration_ms?: number; failure_reason?: { exception_message: string; exception_type: string; }; scenario_run_id?: string; score?: number; }[]; average_score?: number; duration_ms?: number; model_name?: string; }[]`\n  - `failure_reason?: string`\n  - `in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: { type: 'external_api'; info?: string; } | { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }; duration_ms?: number; }[]`\n  - `job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }`\n  - `job_spec?: { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkJobView = await client.benchmarkJobs.create();\n\nconsole.log(benchmarkJobView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/benchmark_jobs/{id}',
    httpMethod: 'get',
    summary: '[Beta] Get a previously created BenchmarkJob.',
    description: '[Beta] Get a BenchmarkJob given ID.',
    stainlessPath: '(resource) benchmark_jobs > (method) retrieve',
    qualified: 'client.benchmarkJobs.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: object[]; average_score?: number; duration_ms?: number; model_name?: string; }[]; failure_reason?: string; in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: object | object; duration_ms?: number; }[]; job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }; job_spec?: { agent_configs: object[]; scenario_ids: string[]; orchestrator_config?: object; }; }",
    markdown:
      "## retrieve\n\n`client.benchmarkJobs.retrieve(id: string): { id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: object[]; failure_reason?: string; in_progress_runs?: object[]; job_source?: object | object | object; job_spec?: object; }`\n\n**get** `/v1/benchmark_jobs/{id}`\n\n[Beta] Get a BenchmarkJob given ID.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: { scenario_definition_id: string; scenario_name: string; state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED'; duration_ms?: number; failure_reason?: object; scenario_run_id?: string; score?: number; }[]; average_score?: number; duration_ms?: number; model_name?: string; }[]; failure_reason?: string; in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: { type: 'external_api'; info?: string; } | { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }; duration_ms?: number; }[]; job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }; job_spec?: { agent_configs: { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }; }`\n  A BenchmarkJobView represents a benchmark job that runs a set of scenarios entirely on runloop.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'`\n  - `benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: { scenario_definition_id: string; scenario_name: string; state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED'; duration_ms?: number; failure_reason?: { exception_message: string; exception_type: string; }; scenario_run_id?: string; score?: number; }[]; average_score?: number; duration_ms?: number; model_name?: string; }[]`\n  - `failure_reason?: string`\n  - `in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: { type: 'external_api'; info?: string; } | { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }; duration_ms?: number; }[]`\n  - `job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }`\n  - `job_spec?: { agent_configs: { name: string; type: 'job_agent'; agent_environment?: { environment_variables?: object; secrets?: object; }; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkJobView = await client.benchmarkJobs.retrieve('id');\n\nconsole.log(benchmarkJobView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/benchmark_jobs',
    httpMethod: 'get',
    summary: '[Beta] List BenchmarkJobs.',
    description: '[Beta] List all BenchmarkJobs matching filter.',
    stainlessPath: '(resource) benchmark_jobs > (method) list',
    qualified: 'client.benchmarkJobs.list',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      "{ has_more: boolean; jobs: { id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: object[]; failure_reason?: string; in_progress_runs?: object[]; job_source?: object | object | object; job_spec?: object; }[]; total_count?: number; }",
    markdown:
      "## list\n\n`client.benchmarkJobs.list(include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { has_more: boolean; jobs: benchmark_job_view[]; total_count?: number; }`\n\n**get** `/v1/benchmark_jobs`\n\n[Beta] List all BenchmarkJobs matching filter.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `search?: string`\n  Search by benchmark job ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ has_more: boolean; jobs: { id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: object[]; failure_reason?: string; in_progress_runs?: object[]; job_source?: object | object | object; job_spec?: object; }[]; total_count?: number; }`\n\n  - `has_more: boolean`\n  - `jobs: { id: string; create_time_ms: number; name: string; state: 'initializing' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'; benchmark_outcomes?: { agent_name: string; benchmark_run_id: string; n_completed: number; n_failed: number; n_timeout: number; scenario_outcomes: { scenario_definition_id: string; scenario_name: string; state: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELED'; duration_ms?: number; failure_reason?: object; scenario_run_id?: string; score?: number; }[]; average_score?: number; duration_ms?: number; model_name?: string; }[]; failure_reason?: string; in_progress_runs?: { benchmark_run_id: string; start_time_ms: number; state: 'running' | 'canceled' | 'completed' | 'failed'; agent_config?: { type: 'external_api'; info?: string; } | { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }; duration_ms?: number; }[]; job_source?: { inline_yaml: string; type: 'harbor'; } | { benchmark_id: string; type: 'benchmark'; benchmark_name?: string; } | { scenario_ids: string[]; type: 'scenarios'; }; job_spec?: { agent_configs: { name: string; type: 'job_agent'; agent_environment?: object; agent_id?: string; kwargs?: object; model_name?: string; timeout_seconds?: number; }[]; scenario_ids: string[]; orchestrator_config?: { n_attempts?: number; n_concurrent_trials?: number; quiet?: boolean; timeout_multiplier?: number; }; }; }[]`\n  - `total_count?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst benchmarkJobListView = await client.benchmarkJobs.list();\n\nconsole.log(benchmarkJobListView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/agents',
    httpMethod: 'post',
    summary: 'Create an Agent.',
    description:
      'Create a new Agent with a name and optional public visibility. The Agent will be assigned a unique ID.',
    stainlessPath: '(resource) agents > (method) create',
    qualified: 'client.agents.create',
    params: [
      'name: string;',
      'source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; };',
      'version?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }',
    markdown:
      "## create\n\n`client.agents.create(name: string, source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }, version?: string): { id: string; create_time_ms: number; is_public: boolean; name: string; source?: agent_source; version?: string; }`\n\n**post** `/v1/agents`\n\nCreate a new Agent with a name and optional public visibility. The Agent will be assigned a unique ID.\n\n### Parameters\n\n- `name: string`\n  The name of the Agent.\n\n- `source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; }`\n  Agent source configuration.\n  - `type: string`\n    Source type: npm, pip, object, or git\n  - `git?: { repository: string; agent_setup?: string[]; ref?: string; }`\n    Git-based agent source configuration.\n  - `npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }`\n    NPM-based agent source configuration.\n  - `object?: { object_id: string; agent_setup?: string[]; }`\n    Object store agent source configuration.\n  - `pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }`\n    Pip-based agent source configuration.\n\n- `version?: string`\n  Optional version identifier for the Agent. For npm/pip sources this is typically a semver string (e.g. '2.0.65'). For git sources it can be a branch or tag. Semantics are user-defined for object sources.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }`\n  An Agent represents a registered AI agent entity.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `is_public: boolean`\n  - `name: string`\n  - `source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; }`\n  - `version?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst agentView = await client.agents.create({ name: 'name' });\n\nconsole.log(agentView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/agents/{id}',
    httpMethod: 'get',
    summary: 'Get an Agent.',
    description: 'Retrieve a specific Agent by its unique identifier.',
    stainlessPath: '(resource) agents > (method) retrieve',
    qualified: 'client.agents.retrieve',
    params: ['id: string;'],
    response:
      '{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }',
    markdown:
      "## retrieve\n\n`client.agents.retrieve(id: string): { id: string; create_time_ms: number; is_public: boolean; name: string; source?: agent_source; version?: string; }`\n\n**get** `/v1/agents/{id}`\n\nRetrieve a specific Agent by its unique identifier.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }`\n  An Agent represents a registered AI agent entity.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `is_public: boolean`\n  - `name: string`\n  - `source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; }`\n  - `version?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst agentView = await client.agents.retrieve('id');\n\nconsole.log(agentView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/agents',
    httpMethod: 'get',
    summary: 'List Agents.',
    description: 'List all Agents for the authenticated account with pagination support.',
    stainlessPath: '(resource) agents > (method) list',
    qualified: 'client.agents.list',
    params: [
      'include_total_count?: boolean;',
      'is_public?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      'version?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }',
    markdown:
      "## list\n\n`client.agents.list(include_total_count?: boolean, is_public?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, version?: string): { id: string; create_time_ms: number; is_public: boolean; name: string; source?: agent_source; version?: string; }`\n\n**get** `/v1/agents`\n\nList all Agents for the authenticated account with pagination support.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `is_public?: boolean`\n  Filter agents by public visibility.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter agents by name (partial match supported).\n\n- `search?: string`\n  Search by agent ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `version?: string`\n  Filter by version. Use 'latest' to get the most recently created agent.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }`\n  An Agent represents a registered AI agent entity.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `is_public: boolean`\n  - `name: string`\n  - `source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; }`\n  - `version?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const agentView of client.agents.list()) {\n  console.log(agentView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/agents/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete an Agent.',
    description: 'Delete an Agent by its unique identifier. The Agent will be permanently removed.',
    stainlessPath: '(resource) agents > (method) delete',
    qualified: 'client.agents.delete',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## delete\n\n`client.agents.delete(id: string): object`\n\n**post** `/v1/agents/{id}/delete`\n\nDelete an Agent by its unique identifier. The Agent will be permanently removed.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst agent = await client.agents.delete('id');\n\nconsole.log(agent);\n```",
  },
  {
    name: 'devbox_counts',
    endpoint: '/v1/agents/devbox_counts',
    httpMethod: 'get',
    summary: 'Get Devbox counts by Agent.',
    description:
      'Returns devbox counts grouped by agent name. This endpoint efficiently aggregates devbox counts for all agents in a single request, avoiding N+1 query patterns.',
    stainlessPath: '(resource) agents > (method) devbox_counts',
    qualified: 'client.agents.devboxCounts',
    response: '{ counts: object; total_count: number; }',
    markdown:
      "## devbox_counts\n\n`client.agents.devboxCounts(): { counts: object; total_count: number; }`\n\n**get** `/v1/agents/devbox_counts`\n\nReturns devbox counts grouped by agent name. This endpoint efficiently aggregates devbox counts for all agents in a single request, avoiding N+1 query patterns.\n\n### Returns\n\n- `{ counts: object; total_count: number; }`\n  Devbox counts grouped by agent name. Used to efficiently fetch devbox counts for multiple agents in a single request.\n\n  - `counts: object`\n  - `total_count: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst agentDevboxCountsView = await client.agents.devboxCounts();\n\nconsole.log(agentDevboxCountsView);\n```",
  },
  {
    name: 'list_public',
    endpoint: '/v1/agents/list_public',
    httpMethod: 'get',
    summary: 'List Public Agents.',
    description: 'List all public Agents with pagination support.',
    stainlessPath: '(resource) agents > (method) list_public',
    qualified: 'client.agents.listPublic',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      'version?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }',
    markdown:
      "## list_public\n\n`client.agents.listPublic(include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, version?: string): { id: string; create_time_ms: number; is_public: boolean; name: string; source?: agent_source; version?: string; }`\n\n**get** `/v1/agents/list_public`\n\nList all public Agents with pagination support.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter agents by name (partial match supported).\n\n- `search?: string`\n  Search by agent ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `version?: string`\n  Filter by version. Use 'latest' to get the most recently created agent.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; is_public: boolean; name: string; source?: { type: string; git?: object; npm?: object; object?: object; pip?: object; }; version?: string; }`\n  An Agent represents a registered AI agent entity.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `is_public: boolean`\n  - `name: string`\n  - `source?: { type: string; git?: { repository: string; agent_setup?: string[]; ref?: string; }; npm?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; object?: { object_id: string; agent_setup?: string[]; }; pip?: { package_name: string; agent_setup?: string[]; registry_url?: string; }; }`\n  - `version?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const agentView of client.agents.listPublic()) {\n  console.log(agentView);\n}\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/axons',
    httpMethod: 'post',
    summary: '[Beta] Create an axon.',
    description: '[Beta] Create a new axon.',
    stainlessPath: '(resource) axons > (method) create',
    qualified: 'client.axons.create',
    params: ['name?: string;'],
    response: '{ id: string; created_at_ms: number; name?: string; }',
    markdown:
      "## create\n\n`client.axons.create(name?: string): { id: string; created_at_ms: number; name?: string; }`\n\n**post** `/v1/axons`\n\n[Beta] Create a new axon.\n\n### Parameters\n\n- `name?: string`\n  (Optional) Name for the axon.\n\n### Returns\n\n- `{ id: string; created_at_ms: number; name?: string; }`\n\n  - `id: string`\n  - `created_at_ms: number`\n  - `name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst axonView = await client.axons.create();\n\nconsole.log(axonView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/axons/{id}',
    httpMethod: 'get',
    summary: '[Beta] Get an axon.',
    description: '[Beta] Get an axon given ID.',
    stainlessPath: '(resource) axons > (method) retrieve',
    qualified: 'client.axons.retrieve',
    params: ['id: string;'],
    response: '{ id: string; created_at_ms: number; name?: string; }',
    markdown:
      "## retrieve\n\n`client.axons.retrieve(id: string): { id: string; created_at_ms: number; name?: string; }`\n\n**get** `/v1/axons/{id}`\n\n[Beta] Get an axon given ID.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; created_at_ms: number; name?: string; }`\n\n  - `id: string`\n  - `created_at_ms: number`\n  - `name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst axonView = await client.axons.retrieve('id');\n\nconsole.log(axonView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/axons',
    httpMethod: 'get',
    summary: '[Beta] List active axons.',
    description: '[Beta] List all active axons.',
    stainlessPath: '(resource) axons > (method) list',
    qualified: 'client.axons.list',
    params: [
      'id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response: '{ id: string; created_at_ms: number; name?: string; }',
    markdown:
      "## list\n\n`client.axons.list(id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; created_at_ms: number; name?: string; }`\n\n**get** `/v1/axons`\n\n[Beta] List all active axons.\n\n### Parameters\n\n- `id?: string`\n  Filter by axon ID.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by axon name (prefix match supported).\n\n- `search?: string`\n  Search by axon ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; created_at_ms: number; name?: string; }`\n\n  - `id: string`\n  - `created_at_ms: number`\n  - `name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const axonView of client.axons.list()) {\n  console.log(axonView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/axons/{id}',
    httpMethod: 'delete',
    summary: '[Beta] Delete an axon.',
    description: '[Beta] Mark an axon deleted.',
    stainlessPath: '(resource) axons > (method) delete',
    qualified: 'client.axons.delete',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## delete\n\n`client.axons.delete(id: string): object`\n\n**delete** `/v1/axons/{id}`\n\n[Beta] Mark an axon deleted.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst axon = await client.axons.delete('id');\n\nconsole.log(axon);\n```",
  },
  {
    name: 'publish',
    endpoint: '/v1/axons/{id}/publish',
    httpMethod: 'post',
    summary: '[Beta] Publish an event to an axon.',
    description: '[Beta] Publish an event to a specified axon.',
    stainlessPath: '(resource) axons > (method) publish',
    qualified: 'client.axons.publish',
    params: [
      'id: string;',
      'event_type: string;',
      "origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT';",
      'payload: string;',
      'source: string;',
    ],
    response: '{ sequence: number; timestamp_ms: number; }',
    markdown:
      "## publish\n\n`client.axons.publish(id: string, event_type: string, origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT', payload: string, source: string): { sequence: number; timestamp_ms: number; }`\n\n**post** `/v1/axons/{id}/publish`\n\n[Beta] Publish an event to a specified axon.\n\n### Parameters\n\n- `id: string`\n\n- `event_type: string`\n  The event type (e.g. push, pull_request).\n\n- `origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT'`\n  Event origin.\n\n- `payload: string`\n  Event payload.\n\n- `source: string`\n  The source of the event (e.g. github, slack).\n\n### Returns\n\n- `{ sequence: number; timestamp_ms: number; }`\n\n  - `sequence: number`\n  - `timestamp_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst publishResultView = await client.axons.publish('id', {\n  event_type: 'event_type',\n  origin: 'EXTERNAL_EVENT',\n  payload: 'payload',\n  source: 'source',\n});\n\nconsole.log(publishResultView);\n```",
  },
  {
    name: 'subscribe_sse',
    endpoint: '/v1/axons/{id}/subscribe/sse',
    httpMethod: 'get',
    summary: '[Beta] Subscribe to an axon event stream via SSE.',
    description: '[Beta] Subscribe to an axon event stream via server-sent events.',
    stainlessPath: '(resource) axons > (method) subscribe_sse',
    qualified: 'client.axons.subscribeSse',
    params: ['id: string;', 'after_sequence?: number;'],
    response:
      "{ axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }",
    markdown:
      "## subscribe_sse\n\n`client.axons.subscribeSse(id: string, after_sequence?: number): { axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }`\n\n**get** `/v1/axons/{id}/subscribe/sse`\n\n[Beta] Subscribe to an axon event stream via server-sent events.\n\n### Parameters\n\n- `id: string`\n\n- `after_sequence?: number`\n  Sequence number after which to start streaming. Events with sequence > this value are returned. If unset, replay from the beginning.\n\n### Returns\n\n- `{ axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }`\n\n  - `axon_id: string`\n  - `event_type: string`\n  - `origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'`\n  - `payload: string`\n  - `sequence: number`\n  - `source: string`\n  - `timestamp_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst stream = await client.axons.subscribeSse('id');\nfor await (const axonEventView of stream) {\n  console.log(axonEventView);\n}\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/axons/{id}/events',
    httpMethod: 'get',
    summary: '[Beta] List events for an axon.',
    description: "[Beta] List events from an axon's event stream, ordered by sequence descending.",
    stainlessPath: '(resource) axons.events > (method) list',
    qualified: 'client.axons.events.list',
    params: ['id: string;', 'include_total_count?: boolean;', 'limit?: number;', 'starting_after?: string;'],
    response:
      "{ events: { axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }[]; has_more: boolean; total_count?: number; }",
    markdown:
      "## list\n\n`client.axons.events.list(id: string, include_total_count?: boolean, limit?: number, starting_after?: string): { events: axon_event_view[]; has_more: boolean; total_count?: number; }`\n\n**get** `/v1/axons/{id}/events`\n\n[Beta] List events from an axon's event stream, ordered by sequence descending.\n\n### Parameters\n\n- `id: string`\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ events: { axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }[]; has_more: boolean; total_count?: number; }`\n\n  - `events: { axon_id: string; event_type: string; origin: 'EXTERNAL_EVENT' | 'AGENT_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT'; payload: string; sequence: number; source: string; timestamp_ms: number; }[]`\n  - `has_more: boolean`\n  - `total_count?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst axonEventListView = await client.axons.events.list('id');\n\nconsole.log(axonEventListView);\n```",
  },
  {
    name: 'batch',
    endpoint: '/v1/axons/{id}/sql/batch',
    httpMethod: 'post',
    summary: "[Beta] Execute a batch of SQL statements against an axon's database.",
    description:
      "[Beta] Execute multiple SQL statements atomically within a single transaction against an axon's SQLite database.",
    stainlessPath: '(resource) axons.sql > (method) batch',
    qualified: 'client.axons.sql.batch',
    params: ['id: string;', 'statements: { sql: string; params?: object[]; }[];'],
    response: '{ results: { error?: sql_step_error_view; success?: sql_query_result_view; }[]; }',
    markdown:
      "## batch\n\n`client.axons.sql.batch(id: string, statements: { sql: string; params?: object[]; }[]): { results: sql_step_result_view[]; }`\n\n**post** `/v1/axons/{id}/sql/batch`\n\n[Beta] Execute multiple SQL statements atomically within a single transaction against an axon's SQLite database.\n\n### Parameters\n\n- `id: string`\n\n- `statements: { sql: string; params?: object[]; }[]`\n  The SQL statements to execute atomically within a transaction.\n\n### Returns\n\n- `{ results: { error?: sql_step_error_view; success?: sql_query_result_view; }[]; }`\n\n  - `results: { error?: { message: string; }; success?: { columns: sql_column_meta_view[]; meta: sql_result_meta_view; rows: object[]; }; }[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst sqlBatchResultView = await client.axons.sql.batch('id', { statements: [{ sql: 'sql' }] });\n\nconsole.log(sqlBatchResultView);\n```",
  },
  {
    name: 'query',
    endpoint: '/v1/axons/{id}/sql/query',
    httpMethod: 'post',
    summary: "[Beta] Execute a SQL query against an axon's database.",
    description: "[Beta] Execute a single parameterized SQL statement against an axon's SQLite database.",
    stainlessPath: '(resource) axons.sql > (method) query',
    qualified: 'client.axons.sql.query',
    params: ['id: string;', 'sql: string;', 'params?: object[];'],
    response:
      '{ columns: { name: string; type: string; }[]; meta: { changes: number; duration_ms: number; rows_read_limit_reached: boolean; }; rows: object[]; }',
    markdown:
      "## query\n\n`client.axons.sql.query(id: string, sql: string, params?: object[]): { columns: sql_column_meta_view[]; meta: sql_result_meta_view; rows: object[]; }`\n\n**post** `/v1/axons/{id}/sql/query`\n\n[Beta] Execute a single parameterized SQL statement against an axon's SQLite database.\n\n### Parameters\n\n- `id: string`\n\n- `sql: string`\n  SQL query with ?-style positional placeholders.\n\n- `params?: object[]`\n  Positional parameter bindings for ? placeholders.\n\n### Returns\n\n- `{ columns: { name: string; type: string; }[]; meta: { changes: number; duration_ms: number; rows_read_limit_reached: boolean; }; rows: object[]; }`\n\n  - `columns: { name: string; type: string; }[]`\n  - `meta: { changes: number; duration_ms: number; rows_read_limit_reached: boolean; }`\n  - `rows: object[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst sqlQueryResultView = await client.axons.sql.query('id', { sql: 'sql' });\n\nconsole.log(sqlQueryResultView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/blueprints',
    httpMethod: 'post',
    summary: 'Create and build a Blueprint.',
    description:
      "Starts build of custom defined container Blueprint. The Blueprint will begin in the 'provisioning' step and transition to the 'building' step once it is selected off the build queue., Upon build complete it will transition to 'building_complete' if the build is successful.",
    stainlessPath: '(resource) blueprints > (method) create',
    qualified: 'client.blueprints.create',
    params: [
      'name: string;',
      'base_blueprint_id?: string;',
      'base_blueprint_name?: string;',
      'build_args?: object;',
      "build_context?: { object_id: string; type: 'object'; };",
      'code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[];',
      'dockerfile?: string;',
      'file_mounts?: object;',
      "launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; };",
      'metadata?: object;',
      'network_policy_id?: string;',
      'secrets?: object;',
      'services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[];',
      'system_setup_commands?: string[];',
    ],
    response:
      "{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }",
    markdown:
      "## create\n\n`client.blueprints.create(name: string, base_blueprint_id?: string, base_blueprint_name?: string, build_args?: object, build_context?: { object_id: string; type: 'object'; }, code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[], dockerfile?: string, file_mounts?: object, launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }, metadata?: object, network_policy_id?: string, secrets?: object, services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[], system_setup_commands?: string[]): { id: string; create_time_ms: number; name: string; parameters: blueprint_build_parameters; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: object[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n\n**post** `/v1/blueprints`\n\nStarts build of custom defined container Blueprint. The Blueprint will begin in the 'provisioning' step and transition to the 'building' step once it is selected off the build queue., Upon build complete it will transition to 'building_complete' if the build is successful.\n\n### Parameters\n\n- `name: string`\n  Name of the Blueprint.\n\n- `base_blueprint_id?: string`\n  (Optional) ID of previously built blueprint to use as a base blueprint for this build.\n\n- `base_blueprint_name?: string`\n  (Optional) Name of previously built blueprint to use as a base blueprint for this build. When set, this will load the latest successfully built Blueprint with the given name. Only one of (base_blueprint_id, base_blueprint_name) should be specified.\n\n- `build_args?: object`\n  (Optional) Arbitrary Docker build args to pass during build.\n\n- `build_context?: { object_id: string; type: 'object'; }`\n  A build context backed by an Object.\n  - `object_id: string`\n    The ID of an object, whose contents are to be used as a build context.\n  - `type: 'object'`\n\n- `code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]`\n  A list of code mounts to be included in the Blueprint.\n\n- `dockerfile?: string`\n  Dockerfile contents to be used to build the Blueprint.\n\n- `file_mounts?: object`\n  (Optional) Map of paths and file contents to write before setup.\n\n- `launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }`\n    Configure Devbox lifecycle based on idle activity. If after_idle is set, Devbox will ignore keep_alive_time_seconds. If both after_idle and lifecycle.after_idle are set, they must have the same value. Use lifecycle.after_idle instead.\n  - `architecture?: 'x86_64' | 'arm64'`\n    The target architecture for the Devbox. If unset, defaults to x86_64.\n  - `available_ports?: number[]`\n    [Deprecated] A list of ports to make available on the Devbox. This field is ignored.\n  - `custom_cpu_cores?: number`\n    Custom CPU cores. Must be 0.5, 1, or a multiple of 2. Max is 16.\n  - `custom_disk_size?: number`\n    Custom disk size in GiB. Must be a multiple of 2. Min is 2GiB, max is 64GiB.\n  - `custom_gb_memory?: number`\n    Custom memory size in GiB. Must be 1 or a multiple of 2. Max is 64GiB.\n  - `keep_alive_time_seconds?: number`\n    Time in seconds after which Devbox will automatically shutdown. Default is 1 hour. Maximum is 48 hours (172800 seconds).\n  - `launch_commands?: string[]`\n    Set of commands to be run at launch time, before the entrypoint process is run.\n  - `lifecycle?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; lifecycle_hooks?: { suspend_commands?: string[]; suspend_deadline_ms?: number; }; resume_triggers?: { axon_event?: boolean; http?: boolean; }; }`\n    Lifecycle configuration for Devbox idle and resume behavior. Configure idle policy via after_idle, resume triggers via resume_triggers, and optional lifecycle hooks via lifecycle_hooks.\n  - `network_policy_id?: string`\n    (Optional) ID of the network policy to apply to Devboxes launched with these parameters. When set on a Blueprint launch parameters, Devboxes created from it will inherit this policy unless explicitly overridden.\n  - `provisioning_tier?: 'standard' | 'flex'`\n    (Optional, Alpha) standard is default and flex is lazily provisioned and may be pre-empted. This is an alpha feature and its behavior may change without notice.\n  - `required_services?: string[]`\n    A list of ContainerizedService names to be started when a Devbox is created. A valid ContainerizedService must be specified in Blueprint to be started.\n  - `resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'`\n    The size of the Devbox resources for Runloop to allocate.\n\nX_SMALL: 0.5 cpu x 1GiB memory x 4GiB disk\nSMALL: 1 cpu x 2GiB memory x 4GiB disk\nMEDIUM: 2 cpu x 4GiB memory x 8GiB disk\nLARGE: 2 cpu x 8GiB memory x 16GiB disk\nX_LARGE: 4 cpu x 16GiB memory x 16GiB disk\nXX_LARGE: 8 cpu x 32GiB memory x 16GiB disk\nCUSTOM_SIZE: To choose a custom size, set this enum and also the custom_cpu_cores, custom_gb_memory, and optionally custom_disk_size in launch parameters. CPU must be 0.5, 1, or a multiple of 2 (max 16). Memory must be 1 or a multiple of 2 (max 64GiB). Disk must be a multiple of 2 (min 2GiB, max 64GiB). The cpu:memory ratio must be between 1:2 and 1:8 inclusive.\n  - `user_parameters?: { uid: number; username: string; }`\n    Configuration for the Linux user in the Devbox environment.\n\n- `metadata?: object`\n  (Optional) User defined metadata for the Blueprint.\n\n- `network_policy_id?: string`\n  (Optional) ID of the network policy to apply during blueprint build. This restricts network access during the build process. This does not affect devboxes created from this blueprint; if you want devboxes created from this blueprint to inherit the network policy, set the network_policy_id on the blueprint launch parameters.\n\n- `secrets?: object`\n  (Optional) Map of mount IDs/environment variable names to secret names. Secrets will be available to commands during the build. Secrets are NOT stored in the blueprint image. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} makes the secret 'DATABASE_PASSWORD' available as environment variable 'DB_PASS'.\n\n- `services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  (Optional) List of containerized services to include in the Blueprint. These services will be pre-pulled during the build phase for optimized startup performance.\n\n- `system_setup_commands?: string[]`\n  A list of commands to run to set up your system.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n  Blueprints are ways to create customized starting points for Devboxes. They allow you to define custom starting points for Devboxes such that environment set up can be cached to improve Devbox boot times.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: { object_id: string; type: 'object'; }; code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]; dockerfile?: string; file_mounts?: object; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata?: object; network_policy_id?: string; secrets?: object; services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; system_setup_commands?: string[]; }`\n  - `state: 'created' | 'deleted'`\n  - `status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'`\n  - `base_blueprint_id?: string`\n  - `build_finish_time_ms?: number`\n  - `containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  - `devbox_capabilities?: 'unknown' | 'docker_in_docker'[]`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'`\n  - `is_public?: boolean`\n  - `metadata?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst blueprintView = await client.blueprints.create({ name: 'name' });\n\nconsole.log(blueprintView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/blueprints/{id}',
    httpMethod: 'get',
    summary: 'Get a Blueprint.',
    description: 'Get the details of a previously created Blueprint including the build status.',
    stainlessPath: '(resource) blueprints > (method) retrieve',
    qualified: 'client.blueprints.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }",
    markdown:
      "## retrieve\n\n`client.blueprints.retrieve(id: string): { id: string; create_time_ms: number; name: string; parameters: blueprint_build_parameters; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: object[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n\n**get** `/v1/blueprints/{id}`\n\nGet the details of a previously created Blueprint including the build status.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n  Blueprints are ways to create customized starting points for Devboxes. They allow you to define custom starting points for Devboxes such that environment set up can be cached to improve Devbox boot times.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: { object_id: string; type: 'object'; }; code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]; dockerfile?: string; file_mounts?: object; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata?: object; network_policy_id?: string; secrets?: object; services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; system_setup_commands?: string[]; }`\n  - `state: 'created' | 'deleted'`\n  - `status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'`\n  - `base_blueprint_id?: string`\n  - `build_finish_time_ms?: number`\n  - `containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  - `devbox_capabilities?: 'unknown' | 'docker_in_docker'[]`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'`\n  - `is_public?: boolean`\n  - `metadata?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst blueprintView = await client.blueprints.retrieve('id');\n\nconsole.log(blueprintView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/blueprints',
    httpMethod: 'get',
    summary: 'List Blueprints.',
    description: 'List all Blueprints or filter by name.',
    stainlessPath: '(resource) blueprints > (method) list',
    qualified: 'client.blueprints.list',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'starting_after?: string;',
      'status?: string;',
    ],
    response:
      "{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }",
    markdown:
      "## list\n\n`client.blueprints.list(include_total_count?: boolean, limit?: number, name?: string, starting_after?: string, status?: string): { id: string; create_time_ms: number; name: string; parameters: blueprint_build_parameters; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: object[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n\n**get** `/v1/blueprints`\n\nList all Blueprints or filter by name.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `status?: string`\n  Filter by build status (queued, provisioning, building, failed, build_complete)\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n  Blueprints are ways to create customized starting points for Devboxes. They allow you to define custom starting points for Devboxes such that environment set up can be cached to improve Devbox boot times.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: { object_id: string; type: 'object'; }; code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]; dockerfile?: string; file_mounts?: object; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata?: object; network_policy_id?: string; secrets?: object; services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; system_setup_commands?: string[]; }`\n  - `state: 'created' | 'deleted'`\n  - `status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'`\n  - `base_blueprint_id?: string`\n  - `build_finish_time_ms?: number`\n  - `containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  - `devbox_capabilities?: 'unknown' | 'docker_in_docker'[]`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'`\n  - `is_public?: boolean`\n  - `metadata?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const blueprintView of client.blueprints.list()) {\n  console.log(blueprintView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/blueprints/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete a Blueprint.',
    description:
      'Delete a previously created Blueprint. If a blueprint has dependent snapshots, it cannot be deleted. You can find them by querying: GET /v1/devboxes/disk_snapshots?source_blueprint_id={blueprint_id}.',
    stainlessPath: '(resource) blueprints > (method) delete',
    qualified: 'client.blueprints.delete',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## delete\n\n`client.blueprints.delete(id: string): object`\n\n**post** `/v1/blueprints/{id}/delete`\n\nDelete a previously created Blueprint. If a blueprint has dependent snapshots, it cannot be deleted. You can find them by querying: GET /v1/devboxes/disk_snapshots?source_blueprint_id={blueprint_id}.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst blueprint = await client.blueprints.delete('id');\n\nconsole.log(blueprint);\n```",
  },
  {
    name: 'list_public',
    endpoint: '/v1/blueprints/list_public',
    httpMethod: 'get',
    summary: 'List Public Blueprints.',
    description: 'List all public Blueprints that are available to all users.',
    stainlessPath: '(resource) blueprints > (method) list_public',
    qualified: 'client.blueprints.listPublic',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'starting_after?: string;',
      'status?: string;',
    ],
    response:
      "{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }",
    markdown:
      "## list_public\n\n`client.blueprints.listPublic(include_total_count?: boolean, limit?: number, name?: string, starting_after?: string, status?: string): { id: string; create_time_ms: number; name: string; parameters: blueprint_build_parameters; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: object[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n\n**get** `/v1/blueprints/list_public`\n\nList all public Blueprints that are available to all users.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `status?: string`\n  Filter by build status (queued, provisioning, building, failed, build_complete)\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: object; code_mounts?: code_mount_parameters[]; dockerfile?: string; file_mounts?: object; launch_parameters?: launch_parameters; metadata?: object; network_policy_id?: string; secrets?: object; services?: object[]; system_setup_commands?: string[]; }; state: 'created' | 'deleted'; status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'; base_blueprint_id?: string; build_finish_time_ms?: number; containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; devbox_capabilities?: 'unknown' | 'docker_in_docker'[]; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'; is_public?: boolean; metadata?: object; }`\n  Blueprints are ways to create customized starting points for Devboxes. They allow you to define custom starting points for Devboxes such that environment set up can be cached to improve Devbox boot times.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `parameters: { name: string; base_blueprint_id?: string; base_blueprint_name?: string; build_args?: object; build_context?: { object_id: string; type: 'object'; }; code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]; dockerfile?: string; file_mounts?: object; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata?: object; network_policy_id?: string; secrets?: object; services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]; system_setup_commands?: string[]; }`\n  - `state: 'created' | 'deleted'`\n  - `status: 'queued' | 'provisioning' | 'building' | 'awaiting_upload' | 'failed' | 'build_complete'`\n  - `base_blueprint_id?: string`\n  - `build_finish_time_ms?: number`\n  - `containerized_services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  - `devbox_capabilities?: 'unknown' | 'docker_in_docker'[]`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'build_failed'`\n  - `is_public?: boolean`\n  - `metadata?: object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const blueprintView of client.blueprints.listPublic()) {\n  console.log(blueprintView);\n}\n```",
  },
  {
    name: 'logs',
    endpoint: '/v1/blueprints/{id}/logs',
    httpMethod: 'get',
    summary: 'Get Blueprint build logs.',
    description: 'Get all logs from the building of a Blueprint.',
    stainlessPath: '(resource) blueprints > (method) logs',
    qualified: 'client.blueprints.logs',
    params: ['id: string;'],
    response: '{ blueprint_id: string; logs: { level: string; message: string; timestamp_ms: number; }[]; }',
    markdown:
      "## logs\n\n`client.blueprints.logs(id: string): { blueprint_id: string; logs: blueprint_build_log[]; }`\n\n**get** `/v1/blueprints/{id}/logs`\n\nGet all logs from the building of a Blueprint.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ blueprint_id: string; logs: { level: string; message: string; timestamp_ms: number; }[]; }`\n\n  - `blueprint_id: string`\n  - `logs: { level: string; message: string; timestamp_ms: number; }[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst blueprintBuildLogsListView = await client.blueprints.logs('id');\n\nconsole.log(blueprintBuildLogsListView);\n```",
  },
  {
    name: 'preview',
    endpoint: '/v1/blueprints/preview',
    httpMethod: 'post',
    summary: 'Preview Dockerfile definition for a Blueprint.',
    description:
      'Preview building a Blueprint with the specified configuration. You can take the resulting Dockerfile and test out your build using any local docker tooling.',
    stainlessPath: '(resource) blueprints > (method) preview',
    qualified: 'client.blueprints.preview',
    params: [
      'name: string;',
      'base_blueprint_id?: string;',
      'base_blueprint_name?: string;',
      'build_args?: object;',
      "build_context?: { object_id: string; type: 'object'; };",
      'code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[];',
      'dockerfile?: string;',
      'file_mounts?: object;',
      "launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; };",
      'metadata?: object;',
      'network_policy_id?: string;',
      'secrets?: object;',
      'services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[];',
      'system_setup_commands?: string[];',
    ],
    response: '{ dockerfile: string; }',
    markdown:
      "## preview\n\n`client.blueprints.preview(name: string, base_blueprint_id?: string, base_blueprint_name?: string, build_args?: object, build_context?: { object_id: string; type: 'object'; }, code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[], dockerfile?: string, file_mounts?: object, launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }, metadata?: object, network_policy_id?: string, secrets?: object, services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[], system_setup_commands?: string[]): { dockerfile: string; }`\n\n**post** `/v1/blueprints/preview`\n\nPreview building a Blueprint with the specified configuration. You can take the resulting Dockerfile and test out your build using any local docker tooling.\n\n### Parameters\n\n- `name: string`\n  Name of the Blueprint.\n\n- `base_blueprint_id?: string`\n  (Optional) ID of previously built blueprint to use as a base blueprint for this build.\n\n- `base_blueprint_name?: string`\n  (Optional) Name of previously built blueprint to use as a base blueprint for this build. When set, this will load the latest successfully built Blueprint with the given name. Only one of (base_blueprint_id, base_blueprint_name) should be specified.\n\n- `build_args?: object`\n  (Optional) Arbitrary Docker build args to pass during build.\n\n- `build_context?: { object_id: string; type: 'object'; }`\n  A build context backed by an Object.\n  - `object_id: string`\n    The ID of an object, whose contents are to be used as a build context.\n  - `type: 'object'`\n\n- `code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]`\n  A list of code mounts to be included in the Blueprint.\n\n- `dockerfile?: string`\n  Dockerfile contents to be used to build the Blueprint.\n\n- `file_mounts?: object`\n  (Optional) Map of paths and file contents to write before setup.\n\n- `launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }`\n    Configure Devbox lifecycle based on idle activity. If after_idle is set, Devbox will ignore keep_alive_time_seconds. If both after_idle and lifecycle.after_idle are set, they must have the same value. Use lifecycle.after_idle instead.\n  - `architecture?: 'x86_64' | 'arm64'`\n    The target architecture for the Devbox. If unset, defaults to x86_64.\n  - `available_ports?: number[]`\n    [Deprecated] A list of ports to make available on the Devbox. This field is ignored.\n  - `custom_cpu_cores?: number`\n    Custom CPU cores. Must be 0.5, 1, or a multiple of 2. Max is 16.\n  - `custom_disk_size?: number`\n    Custom disk size in GiB. Must be a multiple of 2. Min is 2GiB, max is 64GiB.\n  - `custom_gb_memory?: number`\n    Custom memory size in GiB. Must be 1 or a multiple of 2. Max is 64GiB.\n  - `keep_alive_time_seconds?: number`\n    Time in seconds after which Devbox will automatically shutdown. Default is 1 hour. Maximum is 48 hours (172800 seconds).\n  - `launch_commands?: string[]`\n    Set of commands to be run at launch time, before the entrypoint process is run.\n  - `lifecycle?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; lifecycle_hooks?: { suspend_commands?: string[]; suspend_deadline_ms?: number; }; resume_triggers?: { axon_event?: boolean; http?: boolean; }; }`\n    Lifecycle configuration for Devbox idle and resume behavior. Configure idle policy via after_idle, resume triggers via resume_triggers, and optional lifecycle hooks via lifecycle_hooks.\n  - `network_policy_id?: string`\n    (Optional) ID of the network policy to apply to Devboxes launched with these parameters. When set on a Blueprint launch parameters, Devboxes created from it will inherit this policy unless explicitly overridden.\n  - `provisioning_tier?: 'standard' | 'flex'`\n    (Optional, Alpha) standard is default and flex is lazily provisioned and may be pre-empted. This is an alpha feature and its behavior may change without notice.\n  - `required_services?: string[]`\n    A list of ContainerizedService names to be started when a Devbox is created. A valid ContainerizedService must be specified in Blueprint to be started.\n  - `resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'`\n    The size of the Devbox resources for Runloop to allocate.\n\nX_SMALL: 0.5 cpu x 1GiB memory x 4GiB disk\nSMALL: 1 cpu x 2GiB memory x 4GiB disk\nMEDIUM: 2 cpu x 4GiB memory x 8GiB disk\nLARGE: 2 cpu x 8GiB memory x 16GiB disk\nX_LARGE: 4 cpu x 16GiB memory x 16GiB disk\nXX_LARGE: 8 cpu x 32GiB memory x 16GiB disk\nCUSTOM_SIZE: To choose a custom size, set this enum and also the custom_cpu_cores, custom_gb_memory, and optionally custom_disk_size in launch parameters. CPU must be 0.5, 1, or a multiple of 2 (max 16). Memory must be 1 or a multiple of 2 (max 64GiB). Disk must be a multiple of 2 (min 2GiB, max 64GiB). The cpu:memory ratio must be between 1:2 and 1:8 inclusive.\n  - `user_parameters?: { uid: number; username: string; }`\n    Configuration for the Linux user in the Devbox environment.\n\n- `metadata?: object`\n  (Optional) User defined metadata for the Blueprint.\n\n- `network_policy_id?: string`\n  (Optional) ID of the network policy to apply during blueprint build. This restricts network access during the build process. This does not affect devboxes created from this blueprint; if you want devboxes created from this blueprint to inherit the network policy, set the network_policy_id on the blueprint launch parameters.\n\n- `secrets?: object`\n  (Optional) Map of mount IDs/environment variable names to secret names. Secrets will be available to commands during the build. Secrets are NOT stored in the blueprint image. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} makes the secret 'DATABASE_PASSWORD' available as environment variable 'DB_PASS'.\n\n- `services?: { image: string; name: string; credentials?: { password: string; username: string; }; env?: object; options?: string; port_mappings?: string[]; }[]`\n  (Optional) List of containerized services to include in the Blueprint. These services will be pre-pulled during the build phase for optimized startup performance.\n\n- `system_setup_commands?: string[]`\n  A list of commands to run to set up your system.\n\n### Returns\n\n- `{ dockerfile: string; }`\n\n  - `dockerfile: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst blueprintPreviewView = await client.blueprints.preview({ name: 'name' });\n\nconsole.log(blueprintPreviewView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/devboxes',
    httpMethod: 'post',
    summary: 'Create a Devbox.',
    description:
      "Create a Devbox and begin the boot process. Standard Devboxes initially report the 'provisioning' state. FLEX Devboxes initially report the 'queued' state while waiting for infrastructure allocation, then transition to 'provisioning' once assigned to a node. The Devbox transitions to 'initializing' while the booted Devbox runs Runloop or user-defined setup scripts, then to 'running' when it is ready for use.",
    stainlessPath: '(resource) devboxes > (method) create',
    qualified: 'client.devboxes.create',
    params: [
      'blueprint_id?: string;',
      'blueprint_name?: string;',
      'code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[];',
      'entrypoint?: string;',
      'environment_variables?: object;',
      'file_mounts?: object;',
      'gateways?: object;',
      "launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; };",
      'mcp?: object;',
      'metadata?: object;',
      "mounts?: { object_id: string; object_path: string; type: 'object_mount'; } | { agent_id: string; agent_name: string; type: 'agent_mount'; agent_path?: string; auth_token?: string; } | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | { axon_id: string; type: 'broker_mount'; agent_binary?: string; launch_args?: string[]; protocol?: 'acp' | 'claude_json' | 'codex_json' | 'pi_json'; working_directory?: string; }[];",
      'name?: string;',
      'secrets?: object;',
      'snapshot_id?: string;',
      "tunnel?: { auth_mode?: 'open' | 'authenticated'; http_keep_alive?: boolean; wake_on_http?: boolean; };",
    ],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## create\n\n`client.devboxes.create(blueprint_id?: string, blueprint_name?: string, code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[], entrypoint?: string, environment_variables?: object, file_mounts?: object, gateways?: object, launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }, mcp?: object, metadata?: object, mounts?: object | object | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | object[], name?: string, secrets?: object, snapshot_id?: string, tunnel?: { auth_mode?: 'open' | 'authenticated'; http_keep_alive?: boolean; wake_on_http?: boolean; }): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**post** `/v1/devboxes`\n\nCreate a Devbox and begin the boot process. Standard Devboxes initially report the 'provisioning' state. FLEX Devboxes initially report the 'queued' state while waiting for infrastructure allocation, then transition to 'provisioning' once assigned to a node. The Devbox transitions to 'initializing' while the booted Devbox runs Runloop or user-defined setup scripts, then to 'running' when it is ready for use.\n\n### Parameters\n\n- `blueprint_id?: string`\n  Blueprint ID to use for the Devbox. If none set, the Devbox will be created with the default Runloop Devbox image. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.\n\n- `blueprint_name?: string`\n  Name of Blueprint to use for the Devbox. When set, this will load the latest successfully built Blueprint with the given name. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.\n\n- `code_mounts?: { repo_name: string; repo_owner: string; token?: string; git_ref?: string; install_command?: string; }[]`\n  A list of code mounts to be included in the Devbox. Use mounts instead.\n\n- `entrypoint?: string`\n  (Optional) When specified, the Devbox will run this script as its main executable. The devbox lifecycle will be bound to entrypoint, shutting down when the process is complete.\n\n- `environment_variables?: object`\n  (Optional) Environment variables used to configure your Devbox.\n\n- `file_mounts?: object`\n  Map of paths and file contents to write before setup. Use mounts instead.\n\n- `gateways?: object`\n  (Optional) Agent gateway specifications for credential proxying. Map key is the environment variable prefix (e.g., 'GWS_ANTHROPIC'). The agent gateway will proxy requests to external APIs using the specified credential without exposing the real API key. Example: {'GWS_ANTHROPIC': {'gateway': 'anthropic', 'secret': 'my_claude_key'}}\n\n- `launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }`\n    Configure Devbox lifecycle based on idle activity. If after_idle is set, Devbox will ignore keep_alive_time_seconds. If both after_idle and lifecycle.after_idle are set, they must have the same value. Use lifecycle.after_idle instead.\n  - `architecture?: 'x86_64' | 'arm64'`\n    The target architecture for the Devbox. If unset, defaults to x86_64.\n  - `available_ports?: number[]`\n    [Deprecated] A list of ports to make available on the Devbox. This field is ignored.\n  - `custom_cpu_cores?: number`\n    Custom CPU cores. Must be 0.5, 1, or a multiple of 2. Max is 16.\n  - `custom_disk_size?: number`\n    Custom disk size in GiB. Must be a multiple of 2. Min is 2GiB, max is 64GiB.\n  - `custom_gb_memory?: number`\n    Custom memory size in GiB. Must be 1 or a multiple of 2. Max is 64GiB.\n  - `keep_alive_time_seconds?: number`\n    Time in seconds after which Devbox will automatically shutdown. Default is 1 hour. Maximum is 48 hours (172800 seconds).\n  - `launch_commands?: string[]`\n    Set of commands to be run at launch time, before the entrypoint process is run.\n  - `lifecycle?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; lifecycle_hooks?: { suspend_commands?: string[]; suspend_deadline_ms?: number; }; resume_triggers?: { axon_event?: boolean; http?: boolean; }; }`\n    Lifecycle configuration for Devbox idle and resume behavior. Configure idle policy via after_idle, resume triggers via resume_triggers, and optional lifecycle hooks via lifecycle_hooks.\n  - `network_policy_id?: string`\n    (Optional) ID of the network policy to apply to Devboxes launched with these parameters. When set on a Blueprint launch parameters, Devboxes created from it will inherit this policy unless explicitly overridden.\n  - `provisioning_tier?: 'standard' | 'flex'`\n    (Optional, Alpha) standard is default and flex is lazily provisioned and may be pre-empted. This is an alpha feature and its behavior may change without notice.\n  - `required_services?: string[]`\n    A list of ContainerizedService names to be started when a Devbox is created. A valid ContainerizedService must be specified in Blueprint to be started.\n  - `resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'`\n    The size of the Devbox resources for Runloop to allocate.\n\nX_SMALL: 0.5 cpu x 1GiB memory x 4GiB disk\nSMALL: 1 cpu x 2GiB memory x 4GiB disk\nMEDIUM: 2 cpu x 4GiB memory x 8GiB disk\nLARGE: 2 cpu x 8GiB memory x 16GiB disk\nX_LARGE: 4 cpu x 16GiB memory x 16GiB disk\nXX_LARGE: 8 cpu x 32GiB memory x 16GiB disk\nCUSTOM_SIZE: To choose a custom size, set this enum and also the custom_cpu_cores, custom_gb_memory, and optionally custom_disk_size in launch parameters. CPU must be 0.5, 1, or a multiple of 2 (max 16). Memory must be 1 or a multiple of 2 (max 64GiB). Disk must be a multiple of 2 (min 2GiB, max 64GiB). The cpu:memory ratio must be between 1:2 and 1:8 inclusive.\n  - `user_parameters?: { uid: number; username: string; }`\n    Configuration for the Linux user in the Devbox environment.\n\n- `mcp?: object`\n  [Beta] (Optional) MCP specifications for MCP server access. Map key is the environment variable name for the MCP token envelope. Each spec links an MCP config to a secret. The devbox will also receive RL_MCP_URL for the MCP hub endpoint. Example: {'MCP_SECRET': {'mcp_config': 'github-readonly', 'secret': 'MY_GITHUB_TOKEN'}}\n\n- `metadata?: object`\n  User defined metadata to attach to the devbox for organization.\n\n- `mounts?: { object_id: string; object_path: string; type: 'object_mount'; } | { agent_id: string; agent_name: string; type: 'agent_mount'; agent_path?: string; auth_token?: string; } | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | { axon_id: string; type: 'broker_mount'; agent_binary?: string; launch_args?: string[]; protocol?: 'acp' | 'claude_json' | 'codex_json' | 'pi_json'; working_directory?: string; }[]`\n  A list of mounts to be included in the Devbox.\n\n- `name?: string`\n  (Optional) A user specified name to give the Devbox.\n\n- `secrets?: object`\n  (Optional) Map of environment variable names to secret names. The secret values will be securely injected as environment variables in the Devbox. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} sets environment variable 'DB_PASS' to the value of secret 'DATABASE_PASSWORD'.\n\n- `snapshot_id?: string`\n  Snapshot ID to use for the Devbox. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.\n\n- `tunnel?: { auth_mode?: 'open' | 'authenticated'; http_keep_alive?: boolean; wake_on_http?: boolean; }`\n  Configuration for creating a V2 tunnel. When specified at Devbox creation, a tunnel will be automatically provisioned.\n  - `auth_mode?: 'open' | 'authenticated'`\n    Authentication mode for the tunnel. Defaults to 'public' if not specified.\n  - `http_keep_alive?: boolean`\n    When true, HTTP traffic through the tunnel counts as activity for idle lifecycle policies, resetting the idle timer. Defaults to true if not specified.\n  - `wake_on_http?: boolean`\n    When true, HTTP traffic to a suspended devbox will automatically trigger a resume. Defaults to false if not specified. Prefer lifecycle.resume_triggers.http on launch_parameters for new integrations. If both are set, lifecycle.resume_triggers.http takes precedence.\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.create();\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/devboxes/{id}',
    httpMethod: 'get',
    summary: 'Get Devbox details.',
    description: 'Get the latest details and status of a Devbox.',
    stainlessPath: '(resource) devboxes > (method) retrieve',
    qualified: 'client.devboxes.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## retrieve\n\n`client.devboxes.retrieve(id: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**get** `/v1/devboxes/{id}`\n\nGet the latest details and status of a Devbox.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.retrieve('id');\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/devboxes/{id}',
    httpMethod: 'post',
    summary: 'Update a Devbox.',
    description:
      'Updates the specified Devbox fields. Omitted fields are left unchanged. An empty name clears the name, and an empty metadata map clears the metadata.',
    stainlessPath: '(resource) devboxes > (method) update',
    qualified: 'client.devboxes.update',
    params: ['id: string;', 'metadata?: object;', 'name?: string;'],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## update\n\n`client.devboxes.update(id: string, metadata?: object, name?: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**post** `/v1/devboxes/{id}`\n\nUpdates the specified Devbox fields. Omitted fields are left unchanged. An empty name clears the name, and an empty metadata map clears the metadata.\n\n### Parameters\n\n- `id: string`\n\n- `metadata?: object`\n  User defined metadata to replace the Devbox metadata. Omit to leave unchanged or set to an empty map to clear it.\n\n- `name?: string`\n  A user specified name to give the Devbox. Omit to leave unchanged or set to an empty string to clear it.\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.update('id');\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/devboxes',
    httpMethod: 'get',
    summary: 'List Devboxes.',
    description: 'List all Devboxes while optionally filtering by status.',
    stainlessPath: '(resource) devboxes > (method) list',
    qualified: 'client.devboxes.list',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'starting_after?: string;',
      'status?: string;',
    ],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## list\n\n`client.devboxes.list(include_total_count?: boolean, limit?: number, starting_after?: string, status?: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**get** `/v1/devboxes`\n\nList all Devboxes while optionally filtering by status.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `status?: string`\n  Filter by status\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const devboxView of client.devboxes.list()) {\n  console.log(devboxView);\n}\n```",
  },
  {
    name: 'create_gateway_token',
    endpoint: '/v1/devboxes/{id}/create_gateway_token',
    httpMethod: 'post',
    summary: 'Mint an agent gateway token for a Devbox.',
    description:
      'Mint a token that lets a running Devbox call an external API through the Runloop agent gateway, using the credential in the supplied secret. The gateway applies the credential to proxied requests, so the real API key is never exposed to the Devbox.\n\nThe token is bound to this Devbox and is only accepted for requests that originate from it. Nothing is stored on the Devbox: the token is returned to the caller and is not re-issued when the Devbox is resumed.',
    stainlessPath: '(resource) devboxes > (method) create_gateway_token',
    qualified: 'client.devboxes.createGatewayToken',
    params: ['id: string;', 'gateway: string;', 'secret: string;'],
    response:
      '{ token: string; auth_mechanism: { type: string; key?: string; }; devbox_id: string; endpoint: string; gateway_config_id: string; url: string; }',
    markdown:
      "## create_gateway_token\n\n`client.devboxes.createGatewayToken(id: string, gateway: string, secret: string): { token: string; auth_mechanism: auth_mechanism; devbox_id: string; endpoint: string; gateway_config_id: string; url: string; }`\n\n**post** `/v1/devboxes/{id}/create_gateway_token`\n\nMint a token that lets a running Devbox call an external API through the Runloop agent gateway, using the credential in the supplied secret. The gateway applies the credential to proxied requests, so the real API key is never exposed to the Devbox.\n\nThe token is bound to this Devbox and is only accepted for requests that originate from it. Nothing is stored on the Devbox: the token is returned to the caller and is not re-issued when the Devbox is resumed.\n\n### Parameters\n\n- `id: string`\n\n- `gateway: string`\n  The gateway config to use. Can be a gateway config ID (gwc_xxx) or name.\n\n- `secret: string`\n  The secret containing the credential. Can be a secret ID or name.\n\n### Returns\n\n- `{ token: string; auth_mechanism: { type: string; key?: string; }; devbox_id: string; endpoint: string; gateway_config_id: string; url: string; }`\n\n  - `token: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `devbox_id: string`\n  - `endpoint: string`\n  - `gateway_config_id: string`\n  - `url: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst gatewayTokenView = await client.devboxes.createGatewayToken('id', { gateway: 'gateway', secret: 'secret' });\n\nconsole.log(gatewayTokenView);\n```",
  },
  {
    name: 'create_mcp_token',
    endpoint: '/v1/devboxes/{id}/create_mcp_token',
    httpMethod: 'post',
    summary: '[Beta] Mint an MCP token for a Devbox.',
    description:
      "[Beta] Mint a token that lets a running Devbox reach an upstream MCP (Model Context Protocol) server through the Runloop MCP hub, using the credential in the supplied secret. Tool access is limited to the MCP config's allowed_tools, and the credential itself is never exposed to the Devbox.\n\nThe token is bound to this Devbox and is only accepted for requests that originate from it. Nothing is stored on the Devbox: the token is returned to the caller and is not re-issued when the Devbox is resumed.",
    stainlessPath: '(resource) devboxes > (method) create_mcp_token',
    qualified: 'client.devboxes.createMcpToken',
    params: ['id: string;', 'mcp_config: string;', 'secret: string;'],
    response:
      '{ token: string; allowed_tools: string[]; devbox_id: string; endpoint: string; mcp_config_id: string; url: string; }',
    markdown:
      "## create_mcp_token\n\n`client.devboxes.createMcpToken(id: string, mcp_config: string, secret: string): { token: string; allowed_tools: string[]; devbox_id: string; endpoint: string; mcp_config_id: string; url: string; }`\n\n**post** `/v1/devboxes/{id}/create_mcp_token`\n\n[Beta] Mint a token that lets a running Devbox reach an upstream MCP (Model Context Protocol) server through the Runloop MCP hub, using the credential in the supplied secret. Tool access is limited to the MCP config's allowed_tools, and the credential itself is never exposed to the Devbox.\n\nThe token is bound to this Devbox and is only accepted for requests that originate from it. Nothing is stored on the Devbox: the token is returned to the caller and is not re-issued when the Devbox is resumed.\n\n### Parameters\n\n- `id: string`\n\n- `mcp_config: string`\n  The MCP config to use. Can be an MCP config ID (mcp_xxx) or name.\n\n- `secret: string`\n  The secret containing the MCP server credential. Can be a secret ID or name.\n\n### Returns\n\n- `{ token: string; allowed_tools: string[]; devbox_id: string; endpoint: string; mcp_config_id: string; url: string; }`\n\n  - `token: string`\n  - `allowed_tools: string[]`\n  - `devbox_id: string`\n  - `endpoint: string`\n  - `mcp_config_id: string`\n  - `url: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst mcpTokenView = await client.devboxes.createMcpToken('id', { mcp_config: 'mcp_config', secret: 'secret' });\n\nconsole.log(mcpTokenView);\n```",
  },
  {
    name: 'create_pty_tunnel',
    endpoint: '/v1/devboxes/{id}/create_pty_tunnel',
    httpMethod: 'post',
    summary: 'Create an ephemeral PTY tunnel for a running Devbox.',
    description:
      'Create an ephemeral authenticated tunnel for terminal access to a running Devbox. This tunnel is not persisted on the Devbox and is generated fresh on each request. The returned auth_token should be passed as a Bearer token in the X-Runloop-Tunnel-Authorization header.',
    stainlessPath: '(resource) devboxes > (method) create_pty_tunnel',
    qualified: 'client.devboxes.createPtyTunnel',
    params: ['id: string;'],
    response: '{ auth_token: string; tunnel_key: string; }',
    markdown:
      "## create_pty_tunnel\n\n`client.devboxes.createPtyTunnel(id: string): { auth_token: string; tunnel_key: string; }`\n\n**post** `/v1/devboxes/{id}/create_pty_tunnel`\n\nCreate an ephemeral authenticated tunnel for terminal access to a running Devbox. This tunnel is not persisted on the Devbox and is generated fresh on each request. The returned auth_token should be passed as a Bearer token in the X-Runloop-Tunnel-Authorization header.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ auth_token: string; tunnel_key: string; }`\n  An ephemeral PTY tunnel providing authenticated terminal access to a Devbox. These tunnels are not stored on the Devbox and are generated fresh on each request. Usage: https://{port}-{tunnel_key}.tunnel.runloop.ai with X-Runloop-Tunnel-Authorization: Bearer {auth_token}.\n\n  - `auth_token: string`\n  - `tunnel_key: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst ptyTunnelView = await client.devboxes.createPtyTunnel('id');\n\nconsole.log(ptyTunnelView);\n```",
  },
  {
    name: 'create_ssh_key',
    endpoint: '/v1/devboxes/{id}/create_ssh_key',
    httpMethod: 'post',
    summary: 'Create an SSH key for a Devbox',
    description: 'Create an SSH key for a Devbox to enable remote access.',
    stainlessPath: '(resource) devboxes > (method) create_ssh_key',
    qualified: 'client.devboxes.createSSHKey',
    params: ['id: string;'],
    response: '{ id: string; ssh_private_key: string; ssh_user: string; url: string; }',
    markdown:
      "## create_ssh_key\n\n`client.devboxes.createSSHKey(id: string): { id: string; ssh_private_key: string; ssh_user: string; url: string; }`\n\n**post** `/v1/devboxes/{id}/create_ssh_key`\n\nCreate an SSH key for a Devbox to enable remote access.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; ssh_private_key: string; ssh_user: string; url: string; }`\n\n  - `id: string`\n  - `ssh_private_key: string`\n  - `ssh_user: string`\n  - `url: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.createSSHKey('id');\n\nconsole.log(response);\n```",
  },
  {
    name: 'delete_disk_snapshot',
    endpoint: '/v1/devboxes/disk_snapshots/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete a disk snapshot of a Devbox.',
    description: 'Delete a previously taken disk snapshot of a Devbox.',
    stainlessPath: '(resource) devboxes > (method) delete_disk_snapshot',
    qualified: 'client.devboxes.deleteDiskSnapshot',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## delete_disk_snapshot\n\n`client.devboxes.deleteDiskSnapshot(id: string): object`\n\n**post** `/v1/devboxes/disk_snapshots/{id}/delete`\n\nDelete a previously taken disk snapshot of a Devbox.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.deleteDiskSnapshot('id');\n\nconsole.log(response);\n```",
  },
  {
    name: 'download_file',
    endpoint: '/v1/devboxes/{id}/download_file',
    httpMethod: 'post',
    summary: 'Download binary file contents from Devbox filesystem.',
    description:
      'Download file contents of any type (binary, text, etc) from a specified path on the Devbox.',
    stainlessPath: '(resource) devboxes > (method) download_file',
    qualified: 'client.devboxes.downloadFile',
    params: ['id: string;', 'path: string;'],
    response: 'string',
    markdown:
      "## download_file\n\n`client.devboxes.downloadFile(id: string, path: string): string`\n\n**post** `/v1/devboxes/{id}/download_file`\n\nDownload file contents of any type (binary, text, etc) from a specified path on the Devbox.\n\n### Parameters\n\n- `id: string`\n\n- `path: string`\n  The path on the Devbox filesystem to read the file from. Path is relative to user home directory.\n\n### Returns\n\n- `string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.downloadFile('id', { path: 'path' });\n\nconsole.log(response);\n\nconst content = await response.blob()\nconsole.log(content)\n```",
  },
  {
    name: 'enable_tunnel',
    endpoint: '/v1/devboxes/{id}/enable_tunnel',
    httpMethod: 'post',
    summary: 'Enable a tunnel for a running Devbox.',
    description:
      'Enable a V2 tunnel for an existing running Devbox. Tunnels provide encrypted URL-based access to the Devbox without exposing internal IDs. The tunnel URL format is: https://&#123;port&#125;-&#123;tunnel_key&#125;.tunnel.runloop.ai\n\nEach Devbox can have one tunnel.',
    stainlessPath: '(resource) devboxes > (method) enable_tunnel',
    qualified: 'client.devboxes.enableTunnel',
    params: [
      'id: string;',
      "auth_mode?: 'open' | 'authenticated';",
      'http_keep_alive?: boolean;',
      'wake_on_http?: boolean;',
    ],
    response:
      "{ auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }",
    markdown:
      "## enable_tunnel\n\n`client.devboxes.enableTunnel(id: string, auth_mode?: 'open' | 'authenticated', http_keep_alive?: boolean, wake_on_http?: boolean): { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n**post** `/v1/devboxes/{id}/enable_tunnel`\n\nEnable a V2 tunnel for an existing running Devbox. Tunnels provide encrypted URL-based access to the Devbox without exposing internal IDs. The tunnel URL format is: https://&#123;port&#125;-&#123;tunnel_key&#125;.tunnel.runloop.ai\n\nEach Devbox can have one tunnel.\n\n### Parameters\n\n- `id: string`\n\n- `auth_mode?: 'open' | 'authenticated'`\n  Authentication mode for the tunnel. Defaults to 'public' if not specified.\n\n- `http_keep_alive?: boolean`\n  When true, HTTP traffic through the tunnel counts as activity for idle lifecycle policies, resetting the idle timer. Defaults to true if not specified.\n\n- `wake_on_http?: boolean`\n  When true, HTTP traffic to a suspended devbox will automatically trigger a resume. Defaults to false if not specified. Prefer lifecycle.resume_triggers.http on launch_parameters for new integrations. If both are set, lifecycle.resume_triggers.http takes precedence.\n\n### Returns\n\n- `{ auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n  A V2 tunnel provides secure HTTP access to services running on a Devbox. Tunnels allow external clients to reach web servers, APIs, or other HTTP services running inside a Devbox without requiring direct network access. Each tunnel is uniquely identified by an encrypted tunnel_key and can be configured for either open (public) or authenticated access.\nUsage: https://{port}-{tunnel_key}.tunnel.runloop.ai. Authenticated tunnels should pass auth_token as X-Runloop-Tunnel-Authorization: Bearer {auth_token}.\n\n  - `auth_mode: 'open' | 'authenticated'`\n  - `create_time_ms: number`\n  - `http_keep_alive: boolean`\n  - `tunnel_key: string`\n  - `wake_on_http: boolean`\n  - `auth_token?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst tunnelView = await client.devboxes.enableTunnel('id');\n\nconsole.log(tunnelView);\n```",
  },
  {
    name: 'execute',
    endpoint: '/v1/devboxes/{id}/execute',
    httpMethod: 'post',
    summary: 'Execute a command with a known ID, optimistically waiting for completion',
    description:
      'Execute a command with a known command ID on a devbox, optimistically waiting for it to complete within the specified timeout. If it completes in time, return the result. If not, return a status indicating the command is still running. Note: attach_stdin parameter is not supported; use execute_async for stdin support.',
    stainlessPath: '(resource) devboxes > (method) execute',
    qualified: 'client.devboxes.execute',
    params: [
      'id: string;',
      'command: string;',
      'command_id: string;',
      'last_n?: string;',
      'optimistic_timeout?: number;',
      'shell_name?: string;',
    ],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## execute\n\n`client.devboxes.execute(id: string, command: string, command_id: string, last_n?: string, optimistic_timeout?: number, shell_name?: string): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**post** `/v1/devboxes/{id}/execute`\n\nExecute a command with a known command ID on a devbox, optimistically waiting for it to complete within the specified timeout. If it completes in time, return the result. If not, return a status indicating the command is still running. Note: attach_stdin parameter is not supported; use execute_async for stdin support.\n\n### Parameters\n\n- `id: string`\n\n- `command: string`\n  The command to execute via the Devbox shell. By default, commands are run from the user home directory unless shell_name is specified. If shell_name is specified the command is run from the directory based on the recent state of the persistent shell.\n\n- `command_id: string`\n  The command ID in UUIDv7 string format for idempotency and tracking\n\n- `last_n?: string`\n  Last n lines of standard error / standard out to return (default: 100)\n\n- `optimistic_timeout?: number`\n  Timeout in seconds to wait for command completion, up to 25 seconds. Defaults to 25 seconds. Operation is not killed.\n\n- `shell_name?: string`\n  The name of the persistent shell to create or use if already created. When using a persistent shell, the command will run from the directory at the end of the previous command and environment variables will be preserved.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.execute('id', { command: 'command', command_id: 'command_id' });\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'execute_async',
    endpoint: '/v1/devboxes/{id}/execute_async',
    httpMethod: 'post',
    summary: 'Asynchronously execute a command via the Devbox shell',
    description:
      "Execute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.",
    stainlessPath: '(resource) devboxes > (method) execute_async',
    qualified: 'client.devboxes.executeAsync',
    params: ['id: string;', 'command: string;', 'attach_stdin?: boolean;', 'shell_name?: string;'],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## execute_async\n\n`client.devboxes.executeAsync(id: string, command: string, attach_stdin?: boolean, shell_name?: string): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**post** `/v1/devboxes/{id}/execute_async`\n\nExecute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.\n\n### Parameters\n\n- `id: string`\n\n- `command: string`\n  The command to execute via the Devbox shell. By default, commands are run from the user home directory unless shell_name is specified. If shell_name is specified the command is run from the directory based on the recent state of the persistent shell.\n\n- `attach_stdin?: boolean`\n  Whether to attach stdin streaming for async commands. Not valid for execute_sync endpoint. Defaults to false if not specified.\n\n- `shell_name?: string`\n  The name of the persistent shell to create or use if already created. When using a persistent shell, the command will run from the directory at the end of the previous command and environment variables will be preserved.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.executeAsync('id', { command: 'command' });\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'execute_sync',
    endpoint: '/v1/devboxes/{id}/execute_sync',
    httpMethod: 'post',
    summary: '(Deprecated, please use /execute_async) Synchronously execute a shell command on a Devbox',
    description:
      'Execute a bash command in the Devbox shell, await the command completion and return the output. Note: attach_stdin parameter is not supported for synchronous execution.',
    stainlessPath: '(resource) devboxes > (method) execute_sync',
    qualified: 'client.devboxes.executeSync',
    params: ['id: string;', 'command: string;', 'attach_stdin?: boolean;', 'shell_name?: string;'],
    response:
      '{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }',
    markdown:
      "## execute_sync\n\n`client.devboxes.executeSync(id: string, command: string, attach_stdin?: boolean, shell_name?: string): { devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n**post** `/v1/devboxes/{id}/execute_sync`\n\nExecute a bash command in the Devbox shell, await the command completion and return the output. Note: attach_stdin parameter is not supported for synchronous execution.\n\n### Parameters\n\n- `id: string`\n\n- `command: string`\n  The command to execute via the Devbox shell. By default, commands are run from the user home directory unless shell_name is specified. If shell_name is specified the command is run from the directory based on the recent state of the persistent shell.\n\n- `attach_stdin?: boolean`\n  Whether to attach stdin streaming for async commands. Not valid for execute_sync endpoint. Defaults to false if not specified.\n\n- `shell_name?: string`\n  The name of the persistent shell to create or use if already created. When using a persistent shell, the command will run from the directory at the end of the previous command and environment variables will be preserved.\n\n### Returns\n\n- `{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n  - `devbox_id: string`\n  - `exit_status: number`\n  - `stderr: string`\n  - `stdout: string`\n  - `shell_name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxExecutionDetailView = await client.devboxes.executeSync('id', { command: 'command' });\n\nconsole.log(devboxExecutionDetailView);\n```",
  },
  {
    name: 'keep_alive',
    endpoint: '/v1/devboxes/{id}/keep_alive',
    httpMethod: 'post',
    summary: 'Reset the idle timer of a running Devbox.',
    description:
      "Send a 'Keep Alive' signal to a running Devbox that is configured to shutdown on idle so the idle time resets.",
    stainlessPath: '(resource) devboxes > (method) keep_alive',
    qualified: 'client.devboxes.keepAlive',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## keep_alive\n\n`client.devboxes.keepAlive(id: string): object`\n\n**post** `/v1/devboxes/{id}/keep_alive`\n\nSend a 'Keep Alive' signal to a running Devbox that is configured to shutdown on idle so the idle time resets.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.keepAlive('id');\n\nconsole.log(response);\n```",
  },
  {
    name: 'list_disk_snapshots',
    endpoint: '/v1/devboxes/disk_snapshots',
    httpMethod: 'get',
    summary: 'List disk snapshots of a Devbox.',
    description:
      'List all snapshots of a Devbox while optionally filtering by Devbox ID, source Blueprint ID, and metadata.',
    stainlessPath: '(resource) devboxes > (method) list_disk_snapshots',
    qualified: 'client.devboxes.listDiskSnapshots',
    params: [
      'devbox_id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'metadata[key]?: string;',
      'metadata[key][in]?: string;',
      'source_blueprint_id?: string;',
      'starting_after?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }',
    markdown:
      "## list_disk_snapshots\n\n`client.devboxes.listDiskSnapshots(devbox_id?: string, include_total_count?: boolean, limit?: number, metadata[key]?: string, metadata[key][in]?: string, source_blueprint_id?: string, starting_after?: string): { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n**get** `/v1/devboxes/disk_snapshots`\n\nList all snapshots of a Devbox while optionally filtering by Devbox ID, source Blueprint ID, and metadata.\n\n### Parameters\n\n- `devbox_id?: string`\n  Devbox ID to filter by.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `metadata[key]?: string`\n  Filter snapshots by metadata key-value pair. Can be used multiple times for different keys.\n\n- `metadata[key][in]?: string`\n  Filter snapshots by metadata key with multiple possible values (OR condition).\n\n- `source_blueprint_id?: string`\n  Source Blueprint ID to filter snapshots by.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `metadata: object`\n  - `source_devbox_id: string`\n  - `commit_message?: string`\n  - `name?: string`\n  - `size_bytes?: number`\n  - `source_blueprint_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const devboxSnapshotView of client.devboxes.listDiskSnapshots()) {\n  console.log(devboxSnapshotView);\n}\n```",
  },
  {
    name: 'read_file_contents',
    endpoint: '/v1/devboxes/{id}/read_file_contents',
    httpMethod: 'post',
    summary: 'Read text file contents from Devbox filesystem.',
    description:
      "Read file contents from a file on a Devbox as a UTF-8. Note 'downloadFile' should be used for large files (greater than 100MB). Returns the file contents as a UTF-8 string.",
    stainlessPath: '(resource) devboxes > (method) read_file_contents',
    qualified: 'client.devboxes.readFileContents',
    params: ['id: string;', 'file_path: string;'],
    response: 'string',
    markdown:
      "## read_file_contents\n\n`client.devboxes.readFileContents(id: string, file_path: string): string`\n\n**post** `/v1/devboxes/{id}/read_file_contents`\n\nRead file contents from a file on a Devbox as a UTF-8. Note 'downloadFile' should be used for large files (greater than 100MB). Returns the file contents as a UTF-8 string.\n\n### Parameters\n\n- `id: string`\n\n- `file_path: string`\n  The path on the Devbox filesystem to read the file from. Path is relative to user home directory.\n\n### Returns\n\n- `string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.readFileContents('id', { file_path: 'file_path' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'remove_tunnel',
    endpoint: '/v1/devboxes/{id}/remove_tunnel',
    httpMethod: 'post',
    summary: 'Remove a tunnel from the Devbox.',
    description: 'Remove an existing V2 tunnel from the Devbox.',
    stainlessPath: '(resource) devboxes > (method) remove_tunnel',
    qualified: 'client.devboxes.removeTunnel',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## remove_tunnel\n\n`client.devboxes.removeTunnel(id: string): object`\n\n**post** `/v1/devboxes/{id}/remove_tunnel`\n\nRemove an existing V2 tunnel from the Devbox.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.removeTunnel('id');\n\nconsole.log(response);\n```",
  },
  {
    name: 'resume',
    endpoint: '/v1/devboxes/{id}/resume',
    httpMethod: 'post',
    summary: 'Resume a suspended Devbox',
    description:
      'Resume a suspended Devbox with the disk state captured as suspend time. Note that any previously running processes or daemons will need to be restarted using the Devbox shell tools.',
    stainlessPath: '(resource) devboxes > (method) resume',
    qualified: 'client.devboxes.resume',
    params: ['id: string;'],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## resume\n\n`client.devboxes.resume(id: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**post** `/v1/devboxes/{id}/resume`\n\nResume a suspended Devbox with the disk state captured as suspend time. Note that any previously running processes or daemons will need to be restarted using the Devbox shell tools.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.resume('id');\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'retrieve_resource_usage',
    endpoint: '/v1/devboxes/{id}/usage',
    httpMethod: 'get',
    summary: 'Get resource usage for a Devbox.',
    description:
      "Get resource usage metrics for a specific Devbox. Returns CPU, memory, and disk consumption calculated from the Devbox's lifecycle, excluding any suspended periods for CPU and memory. Disk usage includes the full elapsed time since storage is consumed even when suspended.",
    stainlessPath: '(resource) devboxes > (method) retrieve_resource_usage',
    qualified: 'client.devboxes.retrieveResourceUsage',
    params: ['id: string;'],
    response:
      '{ id: string; disk_gb_seconds: number; memory_gb_seconds: number; start_time_ms: number; status: string; total_active_seconds: number; total_elapsed_seconds: number; vcpu_seconds: number; end_time_ms?: number; }',
    markdown:
      "## retrieve_resource_usage\n\n`client.devboxes.retrieveResourceUsage(id: string): { id: string; disk_gb_seconds: number; memory_gb_seconds: number; start_time_ms: number; status: string; total_active_seconds: number; total_elapsed_seconds: number; vcpu_seconds: number; end_time_ms?: number; }`\n\n**get** `/v1/devboxes/{id}/usage`\n\nGet resource usage metrics for a specific Devbox. Returns CPU, memory, and disk consumption calculated from the Devbox's lifecycle, excluding any suspended periods for CPU and memory. Disk usage includes the full elapsed time since storage is consumed even when suspended.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; disk_gb_seconds: number; memory_gb_seconds: number; start_time_ms: number; status: string; total_active_seconds: number; total_elapsed_seconds: number; vcpu_seconds: number; end_time_ms?: number; }`\n\n  - `id: string`\n  - `disk_gb_seconds: number`\n  - `memory_gb_seconds: number`\n  - `start_time_ms: number`\n  - `status: string`\n  - `total_active_seconds: number`\n  - `total_elapsed_seconds: number`\n  - `vcpu_seconds: number`\n  - `end_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxResourceUsageView = await client.devboxes.retrieveResourceUsage('id');\n\nconsole.log(devboxResourceUsageView);\n```",
  },
  {
    name: 'shutdown',
    endpoint: '/v1/devboxes/{id}/shutdown',
    httpMethod: 'post',
    summary: 'Shutdown a running Devbox.',
    description:
      'Shutdown a running Devbox. This will permanently stop the Devbox. If you want to save the state of the Devbox, you should take a snapshot before shutting down or should suspend the Devbox instead of shutting down. If the Devbox has any in-progress snapshots, the shutdown will be rejected with a 409 Conflict unless force=true is specified.',
    stainlessPath: '(resource) devboxes > (method) shutdown',
    qualified: 'client.devboxes.shutdown',
    params: ['id: string;', 'force?: string;'],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## shutdown\n\n`client.devboxes.shutdown(id: string, force?: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**post** `/v1/devboxes/{id}/shutdown`\n\nShutdown a running Devbox. This will permanently stop the Devbox. If you want to save the state of the Devbox, you should take a snapshot before shutting down or should suspend the Devbox instead of shutting down. If the Devbox has any in-progress snapshots, the shutdown will be rejected with a 409 Conflict unless force=true is specified.\n\n### Parameters\n\n- `id: string`\n\n- `force?: string`\n  If true, force shutdown even if snapshots are in progress. Defaults to false.\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.shutdown('id');\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'snapshot_disk',
    endpoint: '/v1/devboxes/{id}/snapshot_disk',
    httpMethod: 'post',
    summary: 'Synchronously create a disk snapshot of a running Devbox.',
    description:
      'Create a disk snapshot of a devbox with the specified name and metadata to enable launching future Devboxes with the same disk state.',
    stainlessPath: '(resource) devboxes > (method) snapshot_disk',
    qualified: 'client.devboxes.snapshotDisk',
    params: ['id: string;', 'commit_message?: string;', 'metadata?: object;', 'name?: string;'],
    response:
      '{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }',
    markdown:
      "## snapshot_disk\n\n`client.devboxes.snapshotDisk(id: string, commit_message?: string, metadata?: object, name?: string): { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n**post** `/v1/devboxes/{id}/snapshot_disk`\n\nCreate a disk snapshot of a devbox with the specified name and metadata to enable launching future Devboxes with the same disk state.\n\n### Parameters\n\n- `id: string`\n\n- `commit_message?: string`\n  (Optional) Commit message associated with the snapshot (max 1000 characters)\n\n- `metadata?: object`\n  (Optional) Metadata used to describe the snapshot\n\n- `name?: string`\n  (Optional) A user specified name to give the snapshot\n\n### Returns\n\n- `{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `metadata: object`\n  - `source_devbox_id: string`\n  - `commit_message?: string`\n  - `name?: string`\n  - `size_bytes?: number`\n  - `source_blueprint_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxSnapshotView = await client.devboxes.snapshotDisk('id');\n\nconsole.log(devboxSnapshotView);\n```",
  },
  {
    name: 'snapshot_disk_async',
    endpoint: '/v1/devboxes/{id}/snapshot_disk_async',
    httpMethod: 'post',
    summary: 'Start an asynchronous disk snapshot of a running Devbox.',
    description:
      'Start an asynchronous disk snapshot of a devbox with the specified name and metadata. The snapshot operation will continue in the background and can be monitored using the query endpoint.',
    stainlessPath: '(resource) devboxes > (method) snapshot_disk_async',
    qualified: 'client.devboxes.snapshotDiskAsync',
    params: ['id: string;', 'commit_message?: string;', 'metadata?: object;', 'name?: string;'],
    response:
      '{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }',
    markdown:
      "## snapshot_disk_async\n\n`client.devboxes.snapshotDiskAsync(id: string, commit_message?: string, metadata?: object, name?: string): { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n**post** `/v1/devboxes/{id}/snapshot_disk_async`\n\nStart an asynchronous disk snapshot of a devbox with the specified name and metadata. The snapshot operation will continue in the background and can be monitored using the query endpoint.\n\n### Parameters\n\n- `id: string`\n\n- `commit_message?: string`\n  (Optional) Commit message associated with the snapshot (max 1000 characters)\n\n- `metadata?: object`\n  (Optional) Metadata used to describe the snapshot\n\n- `name?: string`\n  (Optional) A user specified name to give the snapshot\n\n### Returns\n\n- `{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `metadata: object`\n  - `source_devbox_id: string`\n  - `commit_message?: string`\n  - `name?: string`\n  - `size_bytes?: number`\n  - `source_blueprint_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxSnapshotView = await client.devboxes.snapshotDiskAsync('id');\n\nconsole.log(devboxSnapshotView);\n```",
  },
  {
    name: 'suspend',
    endpoint: '/v1/devboxes/{id}/suspend',
    httpMethod: 'post',
    summary: 'Suspend a running Devbox',
    description:
      'Suspend a running Devbox and create a disk snapshot to enable resuming the Devbox later with the same disk. Note this will not snapshot memory state such as running processes.',
    stainlessPath: '(resource) devboxes > (method) suspend',
    qualified: 'client.devboxes.suspend',
    params: ['id: string;'],
    response:
      "{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: object; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: object; }",
    markdown:
      "## suspend\n\n`client.devboxes.suspend(id: string): { id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: launch_parameters; metadata: object; state_transitions: object[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: tunnel_view; }`\n\n**post** `/v1/devboxes/{id}/suspend`\n\nSuspend a running Devbox and create a disk snapshot to enable resuming the Devbox later with the same disk. Note this will not snapshot memory state such as running processes.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; capabilities: 'unknown' | 'docker_in_docker'[]; create_time_ms: number; end_time_ms: number; launch_parameters: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; metadata: object; state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]; status: string; blueprint_id?: string; failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'; gateway_specs?: object; initiator_id?: string; initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'; mcp_specs?: object; name?: string; shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'; snapshot_id?: string; tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }; }`\n  A Devbox represents a virtual development environment. It is an isolated sandbox that can be given to agents and used to run arbitrary code such as AI generated code.\n\n  - `id: string`\n  - `capabilities: 'unknown' | 'docker_in_docker'[]`\n  - `create_time_ms: number`\n  - `end_time_ms: number`\n  - `launch_parameters: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n  - `metadata: object`\n  - `state_transitions: { failure_reason?: string; status?: string; transition_time_ms?: object; }[]`\n  - `status: string`\n  - `blueprint_id?: string`\n  - `failure_reason?: 'out_of_memory' | 'out_of_disk' | 'execution_failed' | 'health_check_failed'`\n  - `gateway_specs?: object`\n  - `initiator_id?: string`\n  - `initiator_type?: 'unknown' | 'api' | 'scenario' | 'scoring_validation' | 'reflex'`\n  - `mcp_specs?: object`\n  - `name?: string`\n  - `shutdown_reason?: 'api_shutdown' | 'keep_alive_timeout' | 'entrypoint_exit' | 'idle' | 'ttl_expired'`\n  - `snapshot_id?: string`\n  - `tunnel?: { auth_mode: 'open' | 'authenticated'; create_time_ms: number; http_keep_alive: boolean; tunnel_key: string; wake_on_http: boolean; auth_token?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxView = await client.devboxes.suspend('id');\n\nconsole.log(devboxView);\n```",
  },
  {
    name: 'upload_file',
    endpoint: '/v1/devboxes/{id}/upload_file',
    httpMethod: 'post',
    summary: 'Upload binary file contents to Devbox filesystem.',
    description:
      'Upload file contents of any type (binary, text, etc) to a Devbox. Note this API is suitable for large files (larger than 100MB) and efficiently uploads files via multipart form data.',
    stainlessPath: '(resource) devboxes > (method) upload_file',
    qualified: 'client.devboxes.uploadFile',
    params: ['id: string;', 'path: string;', 'file?: string;'],
    response: 'object',
    markdown:
      "## upload_file\n\n`client.devboxes.uploadFile(id: string, path: string, file?: string): object`\n\n**post** `/v1/devboxes/{id}/upload_file`\n\nUpload file contents of any type (binary, text, etc) to a Devbox. Note this API is suitable for large files (larger than 100MB) and efficiently uploads files via multipart form data.\n\n### Parameters\n\n- `id: string`\n\n- `path: string`\n  The path to write the file to on the Devbox. Path is relative to user home directory.\n\n- `file?: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.devboxes.uploadFile('id', { path: 'path' });\n\nconsole.log(response);\n```",
  },
  {
    name: 'wait_for_command',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}/wait_for_status',
    httpMethod: 'post',
    summary: 'Wait for an asynchronous execution to reach a specific status.',
    description:
      "Polls the asynchronous execution's status until it reaches one of the desired statuses or times out. Max is 25 seconds.",
    stainlessPath: '(resource) devboxes > (method) wait_for_command',
    qualified: 'client.devboxes.waitForCommand',
    params: [
      'devbox_id: string;',
      'execution_id: string;',
      "statuses: 'queued' | 'running' | 'completed'[];",
      'last_n?: string;',
      'timeout_seconds?: number;',
    ],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## wait_for_command\n\n`client.devboxes.waitForCommand(devbox_id: string, execution_id: string, statuses: 'queued' | 'running' | 'completed'[], last_n?: string, timeout_seconds?: number): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**post** `/v1/devboxes/{devbox_id}/executions/{execution_id}/wait_for_status`\n\nPolls the asynchronous execution's status until it reaches one of the desired statuses or times out. Max is 25 seconds.\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `statuses: 'queued' | 'running' | 'completed'[]`\n  The command execution statuses to wait for. At least one status must be provided. The command will be returned as soon as it reaches any of the provided statuses.\n\n- `last_n?: string`\n  Last n lines of standard error / standard out to return (default: 100)\n\n- `timeout_seconds?: number`\n  (Optional) Timeout in seconds to wait for the status, up to 25 seconds. Defaults to 25 seconds.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.waitForCommand('devbox_id', 'execution_id', { statuses: ['queued'] });\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'watch_evictions',
    endpoint: '/v1/devboxes/evictions/watch',
    httpMethod: 'get',
    summary: 'Stream infrastructure eviction warnings for the account via SSE.',
    description:
      'Subscribe, via server-sent events, to pending infrastructure evictions for every Devbox in the account. On connect the stream emits one event per Devbox that currently has a pending eviction, then one event as each further eviction is scheduled. Best-effort and advisory: a Devbox stays running until its deadline, and delivery is not guaranteed.',
    stainlessPath: '(resource) devboxes > (method) watch_evictions',
    qualified: 'client.devboxes.watchEvictions',
    response: '{ devbox_id: string; eviction_deadline_ms: number; }',
    markdown:
      "## watch_evictions\n\n`client.devboxes.watchEvictions(): { devbox_id: string; eviction_deadline_ms: number; }`\n\n**get** `/v1/devboxes/evictions/watch`\n\nSubscribe, via server-sent events, to pending infrastructure evictions for every Devbox in the account. On connect the stream emits one event per Devbox that currently has a pending eviction, then one event as each further eviction is scheduled. Best-effort and advisory: a Devbox stays running until its deadline, and delivery is not guaranteed.\n\n### Returns\n\n- `{ devbox_id: string; eviction_deadline_ms: number; }`\n\n  - `devbox_id: string`\n  - `eviction_deadline_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst stream = await client.devboxes.watchEvictions();\nfor await (const devboxEvictionEventView of stream) {\n  console.log(devboxEvictionEventView);\n}\n```",
  },
  {
    name: 'write_file_contents',
    endpoint: '/v1/devboxes/{id}/write_file_contents',
    httpMethod: 'post',
    summary: 'Write text file contents to Devbox filesystem.',
    description:
      'Write UTF-8 string contents to a file at path on the Devbox. Note for large files (larger than 100MB), the upload_file endpoint must be used.',
    stainlessPath: '(resource) devboxes > (method) write_file_contents',
    qualified: 'client.devboxes.writeFileContents',
    params: ['id: string;', 'contents: string;', 'file_path: string;'],
    response:
      '{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }',
    markdown:
      "## write_file_contents\n\n`client.devboxes.writeFileContents(id: string, contents: string, file_path: string): { devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n**post** `/v1/devboxes/{id}/write_file_contents`\n\nWrite UTF-8 string contents to a file at path on the Devbox. Note for large files (larger than 100MB), the upload_file endpoint must be used.\n\n### Parameters\n\n- `id: string`\n\n- `contents: string`\n  The UTF-8 string contents to write to the file.\n\n- `file_path: string`\n  The path to write the file to on the Devbox. Path is relative to user home directory.\n\n### Returns\n\n- `{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n  - `devbox_id: string`\n  - `exit_status: number`\n  - `stderr: string`\n  - `stdout: string`\n  - `shell_name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxExecutionDetailView = await client.devboxes.writeFileContents('id', { contents: 'contents', file_path: 'file_path' });\n\nconsole.log(devboxExecutionDetailView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/devboxes/disk_snapshots/{id}',
    httpMethod: 'post',
    summary: 'Update metadata of Disk Snapshot.',
    description: 'Updates disk snapshot metadata via update vs patch. The entire metadata will be replaced.',
    stainlessPath: '(resource) devboxes.disk_snapshots > (method) update',
    qualified: 'client.devboxes.diskSnapshots.update',
    params: ['id: string;', 'commit_message?: string;', 'metadata?: object;', 'name?: string;'],
    response:
      '{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }',
    markdown:
      "## update\n\n`client.devboxes.diskSnapshots.update(id: string, commit_message?: string, metadata?: object, name?: string): { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n**post** `/v1/devboxes/disk_snapshots/{id}`\n\nUpdates disk snapshot metadata via update vs patch. The entire metadata will be replaced.\n\n### Parameters\n\n- `id: string`\n\n- `commit_message?: string`\n  (Optional) Commit message associated with the snapshot (max 1000 characters)\n\n- `metadata?: object`\n  (Optional) Metadata used to describe the snapshot\n\n- `name?: string`\n  (Optional) A user specified name to give the snapshot\n\n### Returns\n\n- `{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `metadata: object`\n  - `source_devbox_id: string`\n  - `commit_message?: string`\n  - `name?: string`\n  - `size_bytes?: number`\n  - `source_blueprint_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxSnapshotView = await client.devboxes.diskSnapshots.update('id');\n\nconsole.log(devboxSnapshotView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/devboxes/disk_snapshots',
    httpMethod: 'get',
    summary: 'List disk snapshots of a Devbox.',
    description:
      'List all snapshots of a Devbox while optionally filtering by Devbox ID, source Blueprint ID, and metadata.',
    stainlessPath: '(resource) devboxes.disk_snapshots > (method) list',
    qualified: 'client.devboxes.diskSnapshots.list',
    params: [
      'devbox_id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'metadata[key]?: string;',
      'metadata[key][in]?: string;',
      'source_blueprint_id?: string;',
      'starting_after?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }',
    markdown:
      "## list\n\n`client.devboxes.diskSnapshots.list(devbox_id?: string, include_total_count?: boolean, limit?: number, metadata[key]?: string, metadata[key][in]?: string, source_blueprint_id?: string, starting_after?: string): { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n**get** `/v1/devboxes/disk_snapshots`\n\nList all snapshots of a Devbox while optionally filtering by Devbox ID, source Blueprint ID, and metadata.\n\n### Parameters\n\n- `devbox_id?: string`\n  Devbox ID to filter by.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `metadata[key]?: string`\n  Filter snapshots by metadata key-value pair. Can be used multiple times for different keys.\n\n- `metadata[key][in]?: string`\n  Filter snapshots by metadata key with multiple possible values (OR condition).\n\n- `source_blueprint_id?: string`\n  Source Blueprint ID to filter snapshots by.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `metadata: object`\n  - `source_devbox_id: string`\n  - `commit_message?: string`\n  - `name?: string`\n  - `size_bytes?: number`\n  - `source_blueprint_id?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const devboxSnapshotView of client.devboxes.diskSnapshots.list()) {\n  console.log(devboxSnapshotView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/devboxes/disk_snapshots/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete a disk snapshot of a Devbox.',
    description: 'Delete a previously taken disk snapshot of a Devbox.',
    stainlessPath: '(resource) devboxes.disk_snapshots > (method) delete',
    qualified: 'client.devboxes.diskSnapshots.delete',
    params: ['id: string;'],
    response: 'object',
    markdown:
      "## delete\n\n`client.devboxes.diskSnapshots.delete(id: string): object`\n\n**post** `/v1/devboxes/disk_snapshots/{id}/delete`\n\nDelete a previously taken disk snapshot of a Devbox.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `object`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst diskSnapshot = await client.devboxes.diskSnapshots.delete('id');\n\nconsole.log(diskSnapshot);\n```",
  },
  {
    name: 'query_status',
    endpoint: '/v1/devboxes/disk_snapshots/{id}/status',
    httpMethod: 'get',
    summary: 'Query the status of an asynchronous disk snapshot.',
    description:
      'Get the current status of an asynchronous disk snapshot operation, including whether it is still in progress and any error messages if it failed.',
    stainlessPath: '(resource) devboxes.disk_snapshots > (method) query_status',
    qualified: 'client.devboxes.diskSnapshots.queryStatus',
    params: ['id: string;'],
    response:
      "{ status: 'in_progress' | 'error' | 'complete' | 'deleted'; error_message?: string; snapshot?: { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }; }",
    markdown:
      "## query_status\n\n`client.devboxes.diskSnapshots.queryStatus(id: string): { status: 'in_progress' | 'error' | 'complete' | 'deleted'; error_message?: string; snapshot?: devbox_snapshot_view; }`\n\n**get** `/v1/devboxes/disk_snapshots/{id}/status`\n\nGet the current status of an asynchronous disk snapshot operation, including whether it is still in progress and any error messages if it failed.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ status: 'in_progress' | 'error' | 'complete' | 'deleted'; error_message?: string; snapshot?: { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }; }`\n\n  - `status: 'in_progress' | 'error' | 'complete' | 'deleted'`\n  - `error_message?: string`\n  - `snapshot?: { id: string; create_time_ms: number; metadata: object; source_devbox_id: string; commit_message?: string; name?: string; size_bytes?: number; source_blueprint_id?: string; }`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxSnapshotAsyncStatusView = await client.devboxes.diskSnapshots.queryStatus('id');\n\nconsole.log(devboxSnapshotAsyncStatusView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/devboxes/{id}/logs',
    httpMethod: 'get',
    summary: 'Get Devbox logs.',
    description: 'Get all logs from a running or completed Devbox.',
    stainlessPath: '(resource) devboxes.logs > (method) list',
    qualified: 'client.devboxes.logs.list',
    params: ['id: string;', 'execution_id?: string;', 'shell_name?: string;'],
    response:
      "{ logs: { level: string; source: 'setup_commands' | 'entrypoint' | 'exec' | 'files' | 'stats' | 'kmsg'; timestamp_ms: number; cmd?: string; cmd_id?: string; exit_code?: number; message?: string; shell_name?: string; }[]; }",
    markdown:
      "## list\n\n`client.devboxes.logs.list(id: string, execution_id?: string, shell_name?: string): { logs: object[]; }`\n\n**get** `/v1/devboxes/{id}/logs`\n\nGet all logs from a running or completed Devbox.\n\n### Parameters\n\n- `id: string`\n\n- `execution_id?: string`\n  ID of execution to filter logs by.\n\n- `shell_name?: string`\n  Shell Name to filter logs by.\n\n### Returns\n\n- `{ logs: { level: string; source: 'setup_commands' | 'entrypoint' | 'exec' | 'files' | 'stats' | 'kmsg'; timestamp_ms: number; cmd?: string; cmd_id?: string; exit_code?: number; message?: string; shell_name?: string; }[]; }`\n\n  - `logs: { level: string; source: 'setup_commands' | 'entrypoint' | 'exec' | 'files' | 'stats' | 'kmsg'; timestamp_ms: number; cmd?: string; cmd_id?: string; exit_code?: number; message?: string; shell_name?: string; }[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxLogsListView = await client.devboxes.logs.list('id');\n\nconsole.log(devboxLogsListView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}',
    httpMethod: 'get',
    summary: 'Get status of an asynchronous execution on a Devbox.',
    description:
      'Get the latest status of a previously launched asynchronous execuction including stdout/error and the exit code if complete.',
    stainlessPath: '(resource) devboxes.executions > (method) retrieve',
    qualified: 'client.devboxes.executions.retrieve',
    params: ['devbox_id: string;', 'execution_id: string;', 'last_n?: string;'],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## retrieve\n\n`client.devboxes.executions.retrieve(devbox_id: string, execution_id: string, last_n?: string): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**get** `/v1/devboxes/{devbox_id}/executions/{execution_id}`\n\nGet the latest status of a previously launched asynchronous execuction including stdout/error and the exit code if complete.\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `last_n?: string`\n  Last n lines of standard error / standard out to return (default: 100)\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.executions.retrieve('devbox_id', 'execution_id');\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'execute_async',
    endpoint: '/v1/devboxes/{id}/execute_async',
    httpMethod: 'post',
    summary: 'Asynchronously execute a command via the Devbox shell',
    description:
      "Execute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.",
    stainlessPath: '(resource) devboxes.executions > (method) execute_async',
    qualified: 'client.devboxes.executions.executeAsync',
    params: ['id: string;', 'command: string;', 'attach_stdin?: boolean;', 'shell_name?: string;'],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## execute_async\n\n`client.devboxes.executions.executeAsync(id: string, command: string, attach_stdin?: boolean, shell_name?: string): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**post** `/v1/devboxes/{id}/execute_async`\n\nExecute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.\n\n### Parameters\n\n- `id: string`\n\n- `command: string`\n  The command to execute via the Devbox shell. By default, commands are run from the user home directory unless shell_name is specified. If shell_name is specified the command is run from the directory based on the recent state of the persistent shell.\n\n- `attach_stdin?: boolean`\n  Whether to attach stdin streaming for async commands. Not valid for execute_sync endpoint. Defaults to false if not specified.\n\n- `shell_name?: string`\n  The name of the persistent shell to create or use if already created. When using a persistent shell, the command will run from the directory at the end of the previous command and environment variables will be preserved.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.executions.executeAsync('id', { command: 'command' });\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'execute_sync',
    endpoint: '/v1/devboxes/{id}/execute_sync',
    httpMethod: 'post',
    summary: '(Deprecated, please use /execute_async) Synchronously execute a shell command on a Devbox',
    description:
      'Execute a bash command in the Devbox shell, await the command completion and return the output. Note: attach_stdin parameter is not supported for synchronous execution.',
    stainlessPath: '(resource) devboxes.executions > (method) execute_sync',
    qualified: 'client.devboxes.executions.executeSync',
    params: ['id: string;', 'command: string;', 'attach_stdin?: boolean;', 'shell_name?: string;'],
    response:
      '{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }',
    markdown:
      "## execute_sync\n\n`client.devboxes.executions.executeSync(id: string, command: string, attach_stdin?: boolean, shell_name?: string): { devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n**post** `/v1/devboxes/{id}/execute_sync`\n\nExecute a bash command in the Devbox shell, await the command completion and return the output. Note: attach_stdin parameter is not supported for synchronous execution.\n\n### Parameters\n\n- `id: string`\n\n- `command: string`\n  The command to execute via the Devbox shell. By default, commands are run from the user home directory unless shell_name is specified. If shell_name is specified the command is run from the directory based on the recent state of the persistent shell.\n\n- `attach_stdin?: boolean`\n  Whether to attach stdin streaming for async commands. Not valid for execute_sync endpoint. Defaults to false if not specified.\n\n- `shell_name?: string`\n  The name of the persistent shell to create or use if already created. When using a persistent shell, the command will run from the directory at the end of the previous command and environment variables will be preserved.\n\n### Returns\n\n- `{ devbox_id: string; exit_status: number; stderr: string; stdout: string; shell_name?: string; }`\n\n  - `devbox_id: string`\n  - `exit_status: number`\n  - `stderr: string`\n  - `stdout: string`\n  - `shell_name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxExecutionDetailView = await client.devboxes.executions.executeSync('id', { command: 'command' });\n\nconsole.log(devboxExecutionDetailView);\n```",
  },
  {
    name: 'kill',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}/kill',
    httpMethod: 'post',
    summary: 'Kill an asynchronous execution currently running on a devbox',
    description:
      'Kill a previously launched asynchronous execution if it is still running by killing the launched process. Optionally kill the entire process group.',
    stainlessPath: '(resource) devboxes.executions > (method) kill',
    qualified: 'client.devboxes.executions.kill',
    params: ['devbox_id: string;', 'execution_id: string;', 'kill_process_group?: boolean;'],
    response:
      "{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }",
    markdown:
      "## kill\n\n`client.devboxes.executions.kill(devbox_id: string, execution_id: string, kill_process_group?: boolean): { devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n**post** `/v1/devboxes/{devbox_id}/executions/{execution_id}/kill`\n\nKill a previously launched asynchronous execution if it is still running by killing the launched process. Optionally kill the entire process group.\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `kill_process_group?: boolean`\n  Whether to kill the entire process group (default: false). If true, kills all processes in the same process group as the target process.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; status: 'queued' | 'running' | 'completed'; exit_status?: number; shell_name?: string; stderr?: string; stderr_truncated?: boolean; stdout?: string; stdout_truncated?: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `status: 'queued' | 'running' | 'completed'`\n  - `exit_status?: number`\n  - `shell_name?: string`\n  - `stderr?: string`\n  - `stderr_truncated?: boolean`\n  - `stdout?: string`\n  - `stdout_truncated?: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxAsyncExecutionDetailView = await client.devboxes.executions.kill('devbox_id', 'execution_id');\n\nconsole.log(devboxAsyncExecutionDetailView);\n```",
  },
  {
    name: 'send_std_in',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}/send_std_in',
    httpMethod: 'post',
    summary: 'Send Content to Std In for a running execution.',
    description: 'Send content to the Std In of a running execution.',
    stainlessPath: '(resource) devboxes.executions > (method) send_std_in',
    qualified: 'client.devboxes.executions.sendStdIn',
    params: [
      'devbox_id: string;',
      'execution_id: string;',
      "signal?: 'EOF' | 'INTERRUPT';",
      'text?: string;',
    ],
    response: '{ devbox_id: string; execution_id: string; success: boolean; }',
    markdown:
      "## send_std_in\n\n`client.devboxes.executions.sendStdIn(devbox_id: string, execution_id: string, signal?: 'EOF' | 'INTERRUPT', text?: string): { devbox_id: string; execution_id: string; success: boolean; }`\n\n**post** `/v1/devboxes/{devbox_id}/executions/{execution_id}/send_std_in`\n\nSend content to the Std In of a running execution.\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `signal?: 'EOF' | 'INTERRUPT'`\n  Signal to send to std in of the running execution.\n\n- `text?: string`\n  Text to send to std in of the running execution.\n\n### Returns\n\n- `{ devbox_id: string; execution_id: string; success: boolean; }`\n\n  - `devbox_id: string`\n  - `execution_id: string`\n  - `success: boolean`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst devboxSendStdInResult = await client.devboxes.executions.sendStdIn('devbox_id', 'execution_id');\n\nconsole.log(devboxSendStdInResult);\n```",
  },
  {
    name: 'stream_stderr_updates',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stderr_updates',
    httpMethod: 'get',
    summary: 'Tails the stderr logs for the given execution with SSE streaming',
    description: 'Tails the stderr logs for the given execution with SSE streaming',
    stainlessPath: '(resource) devboxes.executions > (method) stream_stderr_updates',
    qualified: 'client.devboxes.executions.streamStderrUpdates',
    params: ['devbox_id: string;', 'execution_id: string;', 'offset?: string;'],
    response: '{ output: string; offset?: number; }',
    markdown:
      "## stream_stderr_updates\n\n`client.devboxes.executions.streamStderrUpdates(devbox_id: string, execution_id: string, offset?: string): { output: string; offset?: number; }`\n\n**get** `/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stderr_updates`\n\nTails the stderr logs for the given execution with SSE streaming\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `offset?: string`\n  The byte offset to start the stream from (if unspecified, starts from the beginning of the stream)\n\n### Returns\n\n- `{ output: string; offset?: number; }`\n\n  - `output: string`\n  - `offset?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst stream = await client.devboxes.executions.streamStderrUpdates('devbox_id', 'execution_id');\nfor await (const executionUpdateChunk of stream) {\n  console.log(executionUpdateChunk);\n}\n```",
  },
  {
    name: 'stream_stdout_updates',
    endpoint: '/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stdout_updates',
    httpMethod: 'get',
    summary: 'Tails the stdout logs for the given execution with SSE streaming',
    description: 'Tails the stdout logs for the given execution with SSE streaming',
    stainlessPath: '(resource) devboxes.executions > (method) stream_stdout_updates',
    qualified: 'client.devboxes.executions.streamStdoutUpdates',
    params: ['devbox_id: string;', 'execution_id: string;', 'offset?: string;'],
    response: '{ output: string; offset?: number; }',
    markdown:
      "## stream_stdout_updates\n\n`client.devboxes.executions.streamStdoutUpdates(devbox_id: string, execution_id: string, offset?: string): { output: string; offset?: number; }`\n\n**get** `/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stdout_updates`\n\nTails the stdout logs for the given execution with SSE streaming\n\n### Parameters\n\n- `devbox_id: string`\n\n- `execution_id: string`\n\n- `offset?: string`\n  The byte offset to start the stream from (if unspecified, starts from the beginning of the stream)\n\n### Returns\n\n- `{ output: string; offset?: number; }`\n\n  - `output: string`\n  - `offset?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst stream = await client.devboxes.executions.streamStdoutUpdates('devbox_id', 'execution_id');\nfor await (const executionUpdateChunk of stream) {\n  console.log(executionUpdateChunk);\n}\n```",
  },
  {
    name: 'connect',
    endpoint: '/pty/{session_name}',
    httpMethod: 'get',
    summary: 'Create or reconnect to a PTY session.',
    description:
      "Looks up the PTY session identified by the path session_name and either reconnects to the existing session or creates it if it does not yet exist. The session_name is a client-chosen session identifier, not an opaque server-issued ID. It must be non-empty (1..=256 chars) and use only ASCII letters, digits, '-' and '_'. A newly created PTY session starts an interactive bash shell on the Devbox. Optional cols and rows query parameters apply an initial terminal size before any I/O; they must both be present and in the range 1..=1000 to take effect. The response returns a PtyConnectView containing connect_url (a server-relative path to the WebSocket data plane), idle_ttl_seconds (how long this session is retained after the last client disconnects), and the resulting cols/rows. The interactive terminal byte stream is exchanged over the WebSocket data plane and is not modeled in this OpenAPI contract; clients should connect to connect_url and exchange raw binary frames for terminal I/O. The single-attach contract is enforced when a client opens the WebSocket data plane, not on this bootstrap call: bootstrap always succeeds for a valid session_name, even if another client is currently attached. Rejection of a second concurrent attach happens at WebSocket upgrade time. If the active client disconnects, the session is preserved for the idle TTL so a later connect using the same session_name resumes the same shell. After the TTL expires, after an explicit close control action, or after the underlying Devbox lifecycle replaces the PTY process (such as through suspend/resume), a later request with the same session_name creates a fresh PTY session without the previous shell state.",
    stainlessPath: '(resource) pty > (method) connect',
    qualified: 'client.pty.connect',
    params: ['session_name: string;', 'cols?: number;', 'rows?: number;'],
    response:
      '{ attached: boolean; created: boolean; cols?: number; connect_url?: string; idle_ttl_seconds?: number; protocol_version?: string; rows?: number; session_name?: string; status?: string; }',
    markdown:
      "## connect\n\n`client.pty.connect(session_name: string, cols?: number, rows?: number): { attached: boolean; created: boolean; cols?: number; connect_url?: string; idle_ttl_seconds?: number; protocol_version?: string; rows?: number; session_name?: string; status?: string; }`\n\n**get** `/pty/{session_name}`\n\nLooks up the PTY session identified by the path session_name and either reconnects to the existing session or creates it if it does not yet exist. The session_name is a client-chosen session identifier, not an opaque server-issued ID. It must be non-empty (1..=256 chars) and use only ASCII letters, digits, '-' and '_'. A newly created PTY session starts an interactive bash shell on the Devbox. Optional cols and rows query parameters apply an initial terminal size before any I/O; they must both be present and in the range 1..=1000 to take effect. The response returns a PtyConnectView containing connect_url (a server-relative path to the WebSocket data plane), idle_ttl_seconds (how long this session is retained after the last client disconnects), and the resulting cols/rows. The interactive terminal byte stream is exchanged over the WebSocket data plane and is not modeled in this OpenAPI contract; clients should connect to connect_url and exchange raw binary frames for terminal I/O. The single-attach contract is enforced when a client opens the WebSocket data plane, not on this bootstrap call: bootstrap always succeeds for a valid session_name, even if another client is currently attached. Rejection of a second concurrent attach happens at WebSocket upgrade time. If the active client disconnects, the session is preserved for the idle TTL so a later connect using the same session_name resumes the same shell. After the TTL expires, after an explicit close control action, or after the underlying Devbox lifecycle replaces the PTY process (such as through suspend/resume), a later request with the same session_name creates a fresh PTY session without the previous shell state.\n\n### Parameters\n\n- `session_name: string`\n\n- `cols?: number`\n  Optional initial terminal width in character cells (1..=1000). Defaults to 80 when omitted. Applied only if both cols and rows are provided; otherwise ignored.\n\n- `rows?: number`\n  Optional initial terminal height in character cells (1..=1000). Defaults to 24 when omitted. Applied only if both cols and rows are provided; otherwise ignored.\n\n### Returns\n\n- `{ attached: boolean; created: boolean; cols?: number; connect_url?: string; idle_ttl_seconds?: number; protocol_version?: string; rows?: number; session_name?: string; status?: string; }`\n\n  - `attached: boolean`\n  - `created: boolean`\n  - `cols?: number`\n  - `connect_url?: string`\n  - `idle_ttl_seconds?: number`\n  - `protocol_version?: string`\n  - `rows?: number`\n  - `session_name?: string`\n  - `status?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst ptyConnectView = await client.pty.connect('session_name');\n\nconsole.log(ptyConnectView);\n```",
  },
  {
    name: 'control',
    endpoint: '/pty/{session_name}/control',
    httpMethod: 'post',
    summary: 'Send a control command to a PTY session.',
    description:
      "Applies a PTY control operation to an existing session. The action field selects the operation; the other fields in PtyControlParams are interpreted only when they are relevant to the chosen action.\n\nresize: cols and rows are required and must each be in 1..=1000. A 0 or out-of-range value returns 400. The new winsize is applied to the PTY master and the kernel delivers SIGWINCH to the foreground process group.\n\nsignal: signal is the POSIX signal name (for example 'SIGTERM', 'SIGHUP', 'SIGINT', 'SIGUSR1'). Unknown signal names return 400. The signal is delivered to the slave's foreground process group via killpg(2). If the shell has already exited and there is no foreground process group, returns 400.\n\nclose: terminates the session. Sends SIGHUP to the foreground process group (best-effort; ignored if the shell has already exited) and drops the session from the server's session cache. A subsequent connect with the same session_name will create a fresh PTY session.",
    stainlessPath: '(resource) pty > (method) control',
    qualified: 'client.pty.control',
    params: [
      'session_name: string;',
      "action?: 'resize' | 'signal' | 'close';",
      'cols?: number;',
      'rows?: number;',
      'signal?: string;',
    ],
    response: '{ session_name?: string; status?: string; }',
    markdown:
      "## control\n\n`client.pty.control(session_name: string, action?: 'resize' | 'signal' | 'close', cols?: number, rows?: number, signal?: string): { session_name?: string; status?: string; }`\n\n**post** `/pty/{session_name}/control`\n\nApplies a PTY control operation to an existing session. The action field selects the operation; the other fields in PtyControlParams are interpreted only when they are relevant to the chosen action.\n\nresize: cols and rows are required and must each be in 1..=1000. A 0 or out-of-range value returns 400. The new winsize is applied to the PTY master and the kernel delivers SIGWINCH to the foreground process group.\n\nsignal: signal is the POSIX signal name (for example 'SIGTERM', 'SIGHUP', 'SIGINT', 'SIGUSR1'). Unknown signal names return 400. The signal is delivered to the slave's foreground process group via killpg(2). If the shell has already exited and there is no foreground process group, returns 400.\n\nclose: terminates the session. Sends SIGHUP to the foreground process group (best-effort; ignored if the shell has already exited) and drops the session from the server's session cache. A subsequent connect with the same session_name will create a fresh PTY session.\n\n### Parameters\n\n- `session_name: string`\n\n- `action?: 'resize' | 'signal' | 'close'`\n\n- `cols?: number`\n\n- `rows?: number`\n\n- `signal?: string`\n\n### Returns\n\n- `{ session_name?: string; status?: string; }`\n\n  - `session_name?: string`\n  - `status?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst ptyControlResultView = await client.pty.control('session_name');\n\nconsole.log(ptyControlResultView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/scenarios',
    httpMethod: 'post',
    summary: 'Create a Scenario.',
    description:
      'Create a Scenario, a repeatable AI coding evaluation test that defines the starting environment as well as evaluation success criteria.',
    stainlessPath: '(resource) scenarios > (method) create',
    qualified: 'client.scenarios.create',
    params: [
      'input_context: { problem_statement: string; additional_context?: object; };',
      'name: string;',
      'scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; };',
      "environment_parameters?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; };",
      'metadata?: object;',
      'reference_output?: string;',
      'required_environment_variables?: string[];',
      'required_secret_names?: string[];',
      'scorer_timeout_sec?: number;',
      "validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION';",
    ],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## create\n\n`client.scenarios.create(input_context: { problem_statement: string; additional_context?: object; }, name: string, scoring_contract: { scoring_function_parameters: scoring_function[]; }, environment_parameters?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }, metadata?: object, reference_output?: string, required_environment_variables?: string[], required_secret_names?: string[], scorer_timeout_sec?: number, validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**post** `/v1/scenarios`\n\nCreate a Scenario, a repeatable AI coding evaluation test that defines the starting environment as well as evaluation success criteria.\n\n### Parameters\n\n- `input_context: { problem_statement: string; additional_context?: object; }`\n  The input context for the Scenario.\n  - `problem_statement: string`\n    The problem statement for the Scenario.\n  - `additional_context?: object`\n    Additional JSON structured input context.\n\n- `name: string`\n  Name of the scenario.\n\n- `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  The scoring contract for the Scenario.\n  - `scoring_function_parameters: { name: string; scorer: { pattern: string; search_directory: string; type: 'ast_grep_scorer'; lang?: string; } | { type: 'bash_script_scorer'; bash_script?: string; } | { type: 'command_scorer'; command?: string; } | { custom_scorer_type: string; type: 'custom_scorer'; scorer_params?: object; } | { python_script: string; type: 'python_script_scorer'; python_version_constraint?: string; requirements_contents?: string; } | { type: 'test_based_scorer'; test_command?: string; test_files?: { file_contents?: string; file_path?: string; }[]; }; weight: number; }[]`\n    A list of scoring functions used to evaluate the Scenario.\n\n- `environment_parameters?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  ScenarioEnvironmentParameters specify the environment in which a Scenario will be run.\n  - `blueprint_id?: string`\n    Use the blueprint with matching ID.\n  - `launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n    LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `snapshot_id?: string`\n    Use the snapshot with matching ID.\n  - `working_directory?: string`\n    The working directory where the agent is expected to fulfill the scenario. Scoring functions also run from the working directory.\n\n- `metadata?: object`\n  User defined metadata to attach to the scenario for organization.\n\n- `reference_output?: string`\n  A string representation of the reference output to solve the scenario. Commonly can be the result of a git diff or a sequence of command actions to apply to the environment.\n\n- `required_environment_variables?: string[]`\n  Environment variables required to run the scenario. If these variables are not provided, the scenario will fail to start.\n\n- `required_secret_names?: string[]`\n  Secrets required to run the scenario (user secret name to scenario required secret name). If these secrets are not provided or the mapping is incorrect, the scenario will fail to start.\n\n- `scorer_timeout_sec?: number`\n  Timeout for scoring in seconds. Default 30 minutes (1800s).\n\n- `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n  Validation strategy.\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioView = await client.scenarios.create({\n  input_context: { problem_statement: 'problem_statement' },\n  name: 'name',\n  scoring_contract: { scoring_function_parameters: [{\n  name: 'name',\n  scorer: {\n  pattern: 'pattern',\n  search_directory: 'search_directory',\n  type: 'ast_grep_scorer',\n},\n  weight: 0,\n}] },\n});\n\nconsole.log(scenarioView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/scenarios/{id}',
    httpMethod: 'get',
    summary: 'Get a Scenario.',
    description: 'Get a previously created scenario.',
    stainlessPath: '(resource) scenarios > (method) retrieve',
    qualified: 'client.scenarios.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## retrieve\n\n`client.scenarios.retrieve(id: string): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**get** `/v1/scenarios/{id}`\n\nGet a previously created scenario.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioView = await client.scenarios.retrieve('id');\n\nconsole.log(scenarioView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/scenarios/{id}',
    httpMethod: 'post',
    summary: 'Update a Scenario.',
    description:
      'Update a Scenario. Fields that are null will preserve the existing value. Fields that are provided (including empty values) will replace the existing value entirely.',
    stainlessPath: '(resource) scenarios > (method) update',
    qualified: 'client.scenarios.update',
    params: [
      'id: string;',
      "environment_parameters?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; };",
      'input_context?: { additional_context?: object; problem_statement?: string; };',
      'metadata?: object;',
      'name?: string;',
      'reference_output?: string;',
      'required_environment_variables?: string[];',
      'required_secret_names?: string[];',
      'scorer_timeout_sec?: number;',
      'scoring_contract?: { scoring_function_parameters?: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; };',
      "validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION';",
    ],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## update\n\n`client.scenarios.update(id: string, environment_parameters?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }, input_context?: { additional_context?: object; problem_statement?: string; }, metadata?: object, name?: string, reference_output?: string, required_environment_variables?: string[], required_secret_names?: string[], scorer_timeout_sec?: number, scoring_contract?: { scoring_function_parameters?: scoring_function[]; }, validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**post** `/v1/scenarios/{id}`\n\nUpdate a Scenario. Fields that are null will preserve the existing value. Fields that are provided (including empty values) will replace the existing value entirely.\n\n### Parameters\n\n- `id: string`\n\n- `environment_parameters?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  ScenarioEnvironmentParameters specify the environment in which a Scenario will be run.\n  - `blueprint_id?: string`\n    Use the blueprint with matching ID.\n  - `launch_parameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n    LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `snapshot_id?: string`\n    Use the snapshot with matching ID.\n  - `working_directory?: string`\n    The working directory where the agent is expected to fulfill the scenario. Scoring functions also run from the working directory.\n\n- `input_context?: { additional_context?: object; problem_statement?: string; }`\n  The input context for the Scenario.\n  - `additional_context?: object`\n    Additional JSON structured input context.\n  - `problem_statement?: string`\n    The problem statement for the Scenario.\n\n- `metadata?: object`\n  User defined metadata to attach to the scenario. Pass in empty map to clear.\n\n- `name?: string`\n  Name of the scenario. Cannot be blank.\n\n- `reference_output?: string`\n  A string representation of the reference output to solve the scenario. Commonly can be the result of a git diff or a sequence of command actions to apply to the environment. Pass in empty string to clear.\n\n- `required_environment_variables?: string[]`\n  Environment variables required to run the scenario. Pass in empty list to clear.\n\n- `required_secret_names?: string[]`\n  Secrets required to run the scenario. Pass in empty list to clear.\n\n- `scorer_timeout_sec?: number`\n  Timeout for scoring in seconds. Default 30 minutes (1800s).\n\n- `scoring_contract?: { scoring_function_parameters?: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  The scoring contract for the Scenario.\n  - `scoring_function_parameters?: { name: string; scorer: { pattern: string; search_directory: string; type: 'ast_grep_scorer'; lang?: string; } | { type: 'bash_script_scorer'; bash_script?: string; } | { type: 'command_scorer'; command?: string; } | { custom_scorer_type: string; type: 'custom_scorer'; scorer_params?: object; } | { python_script: string; type: 'python_script_scorer'; python_version_constraint?: string; requirements_contents?: string; } | { type: 'test_based_scorer'; test_command?: string; test_files?: { file_contents?: string; file_path?: string; }[]; }; weight: number; }[]`\n    A list of scoring functions used to evaluate the Scenario.\n\n- `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n  Validation strategy. Pass in empty string to clear.\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioView = await client.scenarios.update('id');\n\nconsole.log(scenarioView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/scenarios',
    httpMethod: 'get',
    summary: 'List Scenarios.',
    description: 'List all Scenarios matching filter.',
    stainlessPath: '(resource) scenarios > (method) list',
    qualified: 'client.scenarios.list',
    params: [
      'benchmark_id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      'validation_type?: string;',
    ],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## list\n\n`client.scenarios.list(benchmark_id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, validation_type?: string): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**get** `/v1/scenarios`\n\nList all Scenarios matching filter.\n\n### Parameters\n\n- `benchmark_id?: string`\n  Filter scenarios by benchmark ID.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Query for Scenarios with a given name.\n\n- `search?: string`\n  Search by scenario ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `validation_type?: string`\n  Filter by validation type\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const scenarioView of client.scenarios.list()) {\n  console.log(scenarioView);\n}\n```",
  },
  {
    name: 'archive',
    endpoint: '/v1/scenarios/{id}/archive',
    httpMethod: 'post',
    summary: 'Archive a Scenario.',
    description:
      'Archive a previously created Scenario. The scenario will no longer appear in list endpoints but can still be retrieved by ID.',
    stainlessPath: '(resource) scenarios > (method) archive',
    qualified: 'client.scenarios.archive',
    params: ['id: string;'],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## archive\n\n`client.scenarios.archive(id: string): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**post** `/v1/scenarios/{id}/archive`\n\nArchive a previously created Scenario. The scenario will no longer appear in list endpoints but can still be retrieved by ID.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioView = await client.scenarios.archive('id');\n\nconsole.log(scenarioView);\n```",
  },
  {
    name: 'list_public',
    endpoint: '/v1/scenarios/list_public',
    httpMethod: 'get',
    summary: 'List Public Scenarios.',
    description: 'List all public scenarios matching filter.',
    stainlessPath: '(resource) scenarios > (method) list_public',
    qualified: 'client.scenarios.listPublic',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      "{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }",
    markdown:
      "## list_public\n\n`client.scenarios.listPublic(include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; input_context: input_context; metadata: object; name: string; scoring_contract: scoring_contract; status: 'active' | 'archived'; environment?: scenario_environment; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n\n**get** `/v1/scenarios/list_public`\n\nList all public scenarios matching filter.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Query for Scenarios with a given name.\n\n- `search?: string`\n  Search by scenario ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; input_context: { problem_statement: string; additional_context?: object; }; metadata: object; name: string; scoring_contract: { scoring_function_parameters: scoring_function[]; }; status: 'active' | 'archived'; environment?: { blueprint_id?: string; launch_parameters?: launch_parameters; snapshot_id?: string; working_directory?: string; }; is_public?: boolean; reference_output?: string; required_environment_variables?: string[]; required_secret_names?: string[]; scorer_timeout_sec?: number; validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'; }`\n  A ScenarioDefinitionView represents a repeatable AI coding evaluation test, complete with initial environment and scoring contract.\n\n  - `id: string`\n  - `input_context: { problem_statement: string; additional_context?: object; }`\n  - `metadata: object`\n  - `name: string`\n  - `scoring_contract: { scoring_function_parameters: { name: string; scorer: object | object | object | object | object | object; weight: number; }[]; }`\n  - `status: 'active' | 'archived'`\n  - `environment?: { blueprint_id?: string; launch_parameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; snapshot_id?: string; working_directory?: string; }`\n  - `is_public?: boolean`\n  - `reference_output?: string`\n  - `required_environment_variables?: string[]`\n  - `required_secret_names?: string[]`\n  - `scorer_timeout_sec?: number`\n  - `validation_type?: 'UNSPECIFIED' | 'FORWARD' | 'REVERSE' | 'EVALUATION'`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const scenarioView of client.scenarios.listPublic()) {\n  console.log(scenarioView);\n}\n```",
  },
  {
    name: 'start_run',
    endpoint: '/v1/scenarios/start_run',
    httpMethod: 'post',
    summary: 'Start a new ScenarioRun.',
    description: 'Start a new ScenarioRun based on the provided Scenario.',
    stainlessPath: '(resource) scenarios > (method) start_run',
    qualified: 'client.scenarios.startRun',
    params: [
      'scenario_id: string;',
      'benchmark_run_id?: string;',
      'metadata?: object;',
      'run_name?: string;',
      "runProfile?: { envVars?: object; launchParameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; mounts?: object | object | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | object[]; purpose?: string; secrets?: object; };",
    ],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## start_run\n\n`client.scenarios.startRun(scenario_id: string, benchmark_run_id?: string, metadata?: object, run_name?: string, runProfile?: { envVars?: object; launchParameters?: launch_parameters; mounts?: mount[]; purpose?: string; secrets?: object; }): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**post** `/v1/scenarios/start_run`\n\nStart a new ScenarioRun based on the provided Scenario.\n\n### Parameters\n\n- `scenario_id: string`\n  ID of the Scenario to run.\n\n- `benchmark_run_id?: string`\n  Benchmark to associate the run.\n\n- `metadata?: object`\n  User defined metadata to attach to the run for organization.\n\n- `run_name?: string`\n  Display name of the run.\n\n- `runProfile?: { envVars?: object; launchParameters?: { after_idle?: after_idle; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: lifecycle_configuration; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: object; }; mounts?: object | object | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | object[]; purpose?: string; secrets?: object; }`\n  Runtime configuration to use for this benchmark run\n  - `envVars?: object`\n    Mapping of Environment Variable to Value. May be shown in devbox logging. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable 'DB_PASS' to the value 'DATABASE_PASSWORD_VALUE'.\n  - `launchParameters?: { after_idle?: { idle_time_seconds: number; on_idle: 'shutdown' | 'suspend'; }; architecture?: 'x86_64' | 'arm64'; available_ports?: number[]; custom_cpu_cores?: number; custom_disk_size?: number; custom_gb_memory?: number; keep_alive_time_seconds?: number; launch_commands?: string[]; lifecycle?: { after_idle?: after_idle; lifecycle_hooks?: lifecycle_hooks; resume_triggers?: resume_triggers; }; network_policy_id?: string; provisioning_tier?: 'standard' | 'flex'; required_services?: string[]; resource_size_request?: 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE' | 'XX_LARGE' | 'CUSTOM_SIZE'; user_parameters?: { uid: number; username: string; }; }`\n    LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.\n  - `mounts?: { object_id: string; object_path: string; type: 'object_mount'; } | { agent_id: string; agent_name: string; type: 'agent_mount'; agent_path?: string; auth_token?: string; } | { repo_name: string; repo_owner: string; type: 'code_mount'; token?: string; git_ref?: string; install_command?: string; } | { content: string; target: string; type: 'file_mount'; } | { axon_id: string; type: 'broker_mount'; agent_binary?: string; launch_args?: string[]; protocol?: 'acp' | 'claude_json' | 'codex_json' | 'pi_json'; working_directory?: string; }[]`\n    A list of mounts to be included in the scenario run.\n  - `purpose?: string`\n    Purpose of the run.\n  - `secrets?: object`\n    Mapping of Environment Variable to User Secret Name. Never shown in devbox logging. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable 'DB_PASS' to the value of the secret 'DATABASE_PASSWORD'.\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioRunView = await client.scenarios.startRun({ scenario_id: 'scenario_id' });\n\nconsole.log(scenarioRunView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/scenarios/runs/{id}',
    httpMethod: 'get',
    summary: 'Get a previously created ScenarioRun.',
    description: 'Get a ScenarioRun given ID.',
    stainlessPath: '(resource) scenarios.runs > (method) retrieve',
    qualified: 'client.scenarios.runs.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## retrieve\n\n`client.scenarios.runs.retrieve(id: string): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**get** `/v1/scenarios/runs/{id}`\n\nGet a ScenarioRun given ID.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioRunView = await client.scenarios.runs.retrieve('id');\n\nconsole.log(scenarioRunView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/scenarios/runs',
    httpMethod: 'get',
    summary: 'List ScenarioRuns.',
    description: 'List all ScenarioRuns matching filter.',
    stainlessPath: '(resource) scenarios.runs > (method) list',
    qualified: 'client.scenarios.runs.list',
    params: [
      'benchmark_run_id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'scenario_id?: string;',
      'search?: string;',
      'starting_after?: string;',
      'state?: string;',
    ],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## list\n\n`client.scenarios.runs.list(benchmark_run_id?: string, include_total_count?: boolean, limit?: number, name?: string, scenario_id?: string, search?: string, starting_after?: string, state?: string): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**get** `/v1/scenarios/runs`\n\nList all ScenarioRuns matching filter.\n\n### Parameters\n\n- `benchmark_run_id?: string`\n  Filter by benchmark run ID\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name\n\n- `scenario_id?: string`\n  Filter runs associated to Scenario given ID\n\n- `search?: string`\n  Search by scenario run ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `state?: string`\n  Filter by state\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const scenarioRunView of client.scenarios.runs.list()) {\n  console.log(scenarioRunView);\n}\n```",
  },
  {
    name: 'cancel',
    endpoint: '/v1/scenarios/runs/{id}/cancel',
    httpMethod: 'post',
    summary: 'Cancel a Scenario run.',
    description:
      'Cancel a currently running Scenario run. This will shutdown the underlying Devbox resource.',
    stainlessPath: '(resource) scenarios.runs > (method) cancel',
    qualified: 'client.scenarios.runs.cancel',
    params: ['id: string;'],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## cancel\n\n`client.scenarios.runs.cancel(id: string): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**post** `/v1/scenarios/runs/{id}/cancel`\n\nCancel a currently running Scenario run. This will shutdown the underlying Devbox resource.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioRunView = await client.scenarios.runs.cancel('id');\n\nconsole.log(scenarioRunView);\n```",
  },
  {
    name: 'complete',
    endpoint: '/v1/scenarios/runs/{id}/complete',
    httpMethod: 'post',
    summary: 'Complete a ScenarioRun.',
    description:
      'Complete a currently running ScenarioRun. Calling complete will shutdown underlying Devbox resource.',
    stainlessPath: '(resource) scenarios.runs > (method) complete',
    qualified: 'client.scenarios.runs.complete',
    params: ['id: string;'],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## complete\n\n`client.scenarios.runs.complete(id: string): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**post** `/v1/scenarios/runs/{id}/complete`\n\nComplete a currently running ScenarioRun. Calling complete will shutdown underlying Devbox resource.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioRunView = await client.scenarios.runs.complete('id');\n\nconsole.log(scenarioRunView);\n```",
  },
  {
    name: 'download_logs',
    endpoint: '/v1/scenarios/runs/{id}/download_logs',
    httpMethod: 'post',
    summary: 'Download logs for a Scenario run.',
    description: 'Download a zip file containing all logs for a Scenario run from the associated devbox.',
    stainlessPath: '(resource) scenarios.runs > (method) download_logs',
    qualified: 'client.scenarios.runs.downloadLogs',
    params: ['id: string;'],
    response: 'string',
    markdown:
      "## download_logs\n\n`client.scenarios.runs.downloadLogs(id: string): string`\n\n**post** `/v1/scenarios/runs/{id}/download_logs`\n\nDownload a zip file containing all logs for a Scenario run from the associated devbox.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst response = await client.scenarios.runs.downloadLogs('id');\n\nconsole.log(response);\n\nconst content = await response.blob()\nconsole.log(content)\n```",
  },
  {
    name: 'score',
    endpoint: '/v1/scenarios/runs/{id}/score',
    httpMethod: 'post',
    summary: 'Score a ScenarioRun.',
    description: 'Score a currently running ScenarioRun.',
    stainlessPath: '(resource) scenarios.runs > (method) score',
    qualified: 'client.scenarios.runs.score',
    params: ['id: string;'],
    response:
      "{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }",
    markdown:
      "## score\n\n`client.scenarios.runs.score(id: string): { id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: scoring_contract_result_view; secrets_provided?: object; start_time_ms?: number; }`\n\n**post** `/v1/scenarios/runs/{id}/score`\n\nScore a currently running ScenarioRun.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; devbox_id: string; metadata: object; scenario_id: string; state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'; benchmark_run_id?: string; duration_ms?: number; environment_variables?: object; name?: string; purpose?: string; scoring_contract_result?: { score: number; scoring_function_results: scoring_function_result_view[]; }; secrets_provided?: object; start_time_ms?: number; }`\n  A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.\n\n  - `id: string`\n  - `devbox_id: string`\n  - `metadata: object`\n  - `scenario_id: string`\n  - `state: 'running' | 'scoring' | 'scored' | 'completed' | 'canceled' | 'timeout' | 'failed'`\n  - `benchmark_run_id?: string`\n  - `duration_ms?: number`\n  - `environment_variables?: object`\n  - `name?: string`\n  - `purpose?: string`\n  - `scoring_contract_result?: { score: number; scoring_function_results: { output: string; score: number; scoring_function_name: string; state: 'unknown' | 'complete' | 'error'; }[]; }`\n  - `secrets_provided?: object`\n  - `start_time_ms?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scenarioRunView = await client.scenarios.runs.score('id');\n\nconsole.log(scenarioRunView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/scenarios/scorers',
    httpMethod: 'post',
    summary: 'Create a custom scenario scorer.',
    description: 'Create a custom scenario scorer.',
    stainlessPath: '(resource) scenarios.scorers > (method) create',
    qualified: 'client.scenarios.scorers.create',
    params: ['bash_script: string;', 'type: string;'],
    response: '{ id: string; bash_script: string; type: string; }',
    markdown:
      "## create\n\n`client.scenarios.scorers.create(bash_script: string, type: string): { id: string; bash_script: string; type: string; }`\n\n**post** `/v1/scenarios/scorers`\n\nCreate a custom scenario scorer.\n\n### Parameters\n\n- `bash_script: string`\n  Bash script for the custom scorer taking context as a json object $RL_SCORER_CONTEXT.\n\n- `type: string`\n  Name of the type of custom scorer.\n\n### Returns\n\n- `{ id: string; bash_script: string; type: string; }`\n  A ScenarioScorerView represents a custom scoring function for a Scenario.\n\n  - `id: string`\n  - `bash_script: string`\n  - `type: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scorer = await client.scenarios.scorers.create({ bash_script: 'bash_script', type: 'type' });\n\nconsole.log(scorer);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/scenarios/scorers/{id}',
    httpMethod: 'get',
    summary: 'Retrieve Scenario Scorer.',
    description: 'Retrieve Scenario Scorer.',
    stainlessPath: '(resource) scenarios.scorers > (method) retrieve',
    qualified: 'client.scenarios.scorers.retrieve',
    params: ['id: string;'],
    response: '{ id: string; bash_script: string; type: string; }',
    markdown:
      "## retrieve\n\n`client.scenarios.scorers.retrieve(id: string): { id: string; bash_script: string; type: string; }`\n\n**get** `/v1/scenarios/scorers/{id}`\n\nRetrieve Scenario Scorer.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; bash_script: string; type: string; }`\n  A ScenarioScorerView represents a custom scoring function for a Scenario.\n\n  - `id: string`\n  - `bash_script: string`\n  - `type: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scorer = await client.scenarios.scorers.retrieve('id');\n\nconsole.log(scorer);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/scenarios/scorers/{id}',
    httpMethod: 'post',
    summary: 'Update a custom scenario scorer.',
    description: 'Update a scenario scorer.',
    stainlessPath: '(resource) scenarios.scorers > (method) update',
    qualified: 'client.scenarios.scorers.update',
    params: ['id: string;', 'bash_script: string;', 'type: string;'],
    response: '{ id: string; bash_script: string; type: string; }',
    markdown:
      "## update\n\n`client.scenarios.scorers.update(id: string, bash_script: string, type: string): { id: string; bash_script: string; type: string; }`\n\n**post** `/v1/scenarios/scorers/{id}`\n\nUpdate a scenario scorer.\n\n### Parameters\n\n- `id: string`\n\n- `bash_script: string`\n  Bash script for the custom scorer taking context as a json object $RL_SCORER_CONTEXT.\n\n- `type: string`\n  Name of the type of custom scorer.\n\n### Returns\n\n- `{ id: string; bash_script: string; type: string; }`\n  A ScenarioScorerView represents a custom scoring function for a Scenario.\n\n  - `id: string`\n  - `bash_script: string`\n  - `type: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst scorer = await client.scenarios.scorers.update('id', { bash_script: 'bash_script', type: 'type' });\n\nconsole.log(scorer);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/scenarios/scorers',
    httpMethod: 'get',
    summary: 'List Scenario Scorers.',
    description: 'List all Scenario Scorers matching filter.',
    stainlessPath: '(resource) scenarios.scorers > (method) list',
    qualified: 'client.scenarios.scorers.list',
    params: [
      'include_total_count?: boolean;',
      'limit?: number;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response: '{ id: string; bash_script: string; type: string; }',
    markdown:
      "## list\n\n`client.scenarios.scorers.list(include_total_count?: boolean, limit?: number, search?: string, starting_after?: string): { id: string; bash_script: string; type: string; }`\n\n**get** `/v1/scenarios/scorers`\n\nList all Scenario Scorers matching filter.\n\n### Parameters\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `search?: string`\n  Search by scenario scorer ID or type.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; bash_script: string; type: string; }`\n  A ScenarioScorerView represents a custom scoring function for a Scenario.\n\n  - `id: string`\n  - `bash_script: string`\n  - `type: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const scorerListResponse of client.scenarios.scorers.list()) {\n  console.log(scorerListResponse);\n}\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/objects',
    httpMethod: 'post',
    summary: 'Create an Object.',
    description: 'Create a new Object with content and metadata. The Object will be assigned a unique ID.',
    stainlessPath: '(resource) objects > (method) create',
    qualified: 'client.objects.create',
    params: [
      "content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';",
      'name: string;',
      'metadata?: object;',
      'ttl_ms?: number;',
    ],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## create\n\n`client.objects.create(content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz', name: string, metadata?: object, ttl_ms?: number): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**post** `/v1/objects`\n\nCreate a new Object with content and metadata. The Object will be assigned a unique ID.\n\n### Parameters\n\n- `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  The content type of the Object.\n\n- `name: string`\n  The name of the Object.\n\n- `metadata?: object`\n  User defined metadata to attach to the object for organization.\n\n- `ttl_ms?: number`\n  Optional lifetime of the object in milliseconds, after which the object is automatically deleted. Time starts ticking after the object is created.\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst objectView = await client.objects.create({ content_type: 'unspecified', name: 'name' });\n\nconsole.log(objectView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/objects/{id}',
    httpMethod: 'get',
    summary: 'Get an Object.',
    description: 'Retrieve a specific Object by its unique identifier.',
    stainlessPath: '(resource) objects > (method) retrieve',
    qualified: 'client.objects.retrieve',
    params: ['id: string;'],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## retrieve\n\n`client.objects.retrieve(id: string): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**get** `/v1/objects/{id}`\n\nRetrieve a specific Object by its unique identifier.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst objectView = await client.objects.retrieve('id');\n\nconsole.log(objectView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/objects',
    httpMethod: 'get',
    summary: 'List Objects.',
    description: 'List all Objects for the authenticated account with pagination support.',
    stainlessPath: '(resource) objects > (method) list',
    qualified: 'client.objects.list',
    params: [
      "content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';",
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      "state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR';",
    ],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## list\n\n`client.objects.list(content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz', include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**get** `/v1/objects`\n\nList all Objects for the authenticated account with pagination support.\n\n### Parameters\n\n- `content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  Filter storage objects by content type.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter storage objects by name (partial match supported).\n\n- `search?: string`\n  Search by object ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  Filter storage objects by state.\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const objectView of client.objects.list()) {\n  console.log(objectView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/objects/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete an Object.',
    description:
      'Delete an existing Object by ID. This action is irreversible and will remove the Object and all its metadata.',
    stainlessPath: '(resource) objects > (method) delete',
    qualified: 'client.objects.delete',
    params: ['id: string;'],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## delete\n\n`client.objects.delete(id: string): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**post** `/v1/objects/{id}/delete`\n\nDelete an existing Object by ID. This action is irreversible and will remove the Object and all its metadata.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst objectView = await client.objects.delete('id');\n\nconsole.log(objectView);\n```",
  },
  {
    name: 'complete',
    endpoint: '/v1/objects/{id}/complete',
    httpMethod: 'post',
    summary: 'Complete Object Upload.',
    description: "Mark an Object's upload as complete, transitioning it from UPLOADING to READ-only state.",
    stainlessPath: '(resource) objects > (method) complete',
    qualified: 'client.objects.complete',
    params: ['id: string;'],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## complete\n\n`client.objects.complete(id: string): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**post** `/v1/objects/{id}/complete`\n\nMark an Object's upload as complete, transitioning it from UPLOADING to READ-only state.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst objectView = await client.objects.complete('id');\n\nconsole.log(objectView);\n```",
  },
  {
    name: 'download',
    endpoint: '/v1/objects/{id}/download',
    httpMethod: 'get',
    summary: 'Generate Download URL for Object.',
    description:
      'Generate a presigned download URL for an Object. The URL will be valid for the specified duration.',
    stainlessPath: '(resource) objects > (method) download',
    qualified: 'client.objects.download',
    params: ['id: string;', 'duration_seconds?: number;'],
    response: '{ download_url: string; }',
    markdown:
      "## download\n\n`client.objects.download(id: string, duration_seconds?: number): { download_url: string; }`\n\n**get** `/v1/objects/{id}/download`\n\nGenerate a presigned download URL for an Object. The URL will be valid for the specified duration.\n\n### Parameters\n\n- `id: string`\n\n- `duration_seconds?: number`\n  Duration in seconds for the presigned URL validity (default: 3600).\n\n### Returns\n\n- `{ download_url: string; }`\n  A response containing a presigned download URL for an Object.\n\n  - `download_url: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst objectDownloadURLView = await client.objects.download('id');\n\nconsole.log(objectDownloadURLView);\n```",
  },
  {
    name: 'list_public',
    endpoint: '/v1/objects/list_public',
    httpMethod: 'get',
    summary: 'List Public Objects.',
    description: 'List all public Objects with pagination support.',
    stainlessPath: '(resource) objects > (method) list_public',
    qualified: 'client.objects.listPublic',
    params: [
      "content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz';",
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
      "state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR';",
    ],
    response:
      "{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }",
    markdown:
      "## list_public\n\n`client.objects.listPublic(content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz', include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string, state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'): { id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n\n**get** `/v1/objects/list_public`\n\nList all public Objects with pagination support.\n\n### Parameters\n\n- `content_type?: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  Filter storage objects by content type.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter storage objects by name (partial match supported).\n\n- `search?: string`\n  Search by object ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n- `state?: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  Filter storage objects by state.\n\n### Returns\n\n- `{ id: string; content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'; create_time_ms: number; name: string; state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'; delete_after_time_ms?: number; metadata?: object; size_bytes?: number; upload_url?: string; }`\n  An Object represents a stored data entity with metadata.\n\n  - `id: string`\n  - `content_type: 'unspecified' | 'text' | 'binary' | 'gzip' | 'tar' | 'tgz'`\n  - `create_time_ms: number`\n  - `name: string`\n  - `state: 'UPLOADING' | 'READ_ONLY' | 'DELETED' | 'ERROR'`\n  - `delete_after_time_ms?: number`\n  - `metadata?: object`\n  - `size_bytes?: number`\n  - `upload_url?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const objectView of client.objects.listPublic()) {\n  console.log(objectView);\n}\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/secrets',
    httpMethod: 'post',
    summary: 'Create a Secret.',
    description:
      'Create a new Secret with a globally unique name and value. The Secret will be encrypted at rest and made available as an environment variable in Devboxes.',
    stainlessPath: '(resource) secrets > (method) create',
    qualified: 'client.secrets.create',
    params: ['name: string;', 'value: string;'],
    response: '{ id: string; create_time_ms: number; name: string; update_time_ms: number; }',
    markdown:
      "## create\n\n`client.secrets.create(name: string, value: string): { id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n\n**post** `/v1/secrets`\n\nCreate a new Secret with a globally unique name and value. The Secret will be encrypted at rest and made available as an environment variable in Devboxes.\n\n### Parameters\n\n- `name: string`\n  The globally unique name for the Secret. Must be a valid environment variable name (alphanumeric and underscores only). Example: 'DATABASE_PASSWORD'\n\n- `value: string`\n  The value to store for this Secret. This will be encrypted at rest and made available as an environment variable in Devboxes. Example: 'my-secure-password'\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n  A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `update_time_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst secretView = await client.secrets.create({ name: 'name', value: 'value' });\n\nconsole.log(secretView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/secrets/{name}',
    httpMethod: 'get',
    summary: 'Get a Secret.',
    description: 'Retrieve a Secret by name. The secret value is not included for security.',
    stainlessPath: '(resource) secrets > (method) retrieve',
    qualified: 'client.secrets.retrieve',
    params: ['name: string;'],
    response: '{ id: string; create_time_ms: number; name: string; update_time_ms: number; }',
    markdown:
      "## retrieve\n\n`client.secrets.retrieve(name: string): { id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n\n**get** `/v1/secrets/{name}`\n\nRetrieve a Secret by name. The secret value is not included for security.\n\n### Parameters\n\n- `name: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n  A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `update_time_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst secretView = await client.secrets.retrieve('name');\n\nconsole.log(secretView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/secrets/{name}',
    httpMethod: 'post',
    summary: 'Update a Secret.',
    description: 'Update the value of an existing Secret by name. The new value will be encrypted at rest.',
    stainlessPath: '(resource) secrets > (method) update',
    qualified: 'client.secrets.update',
    params: ['name: string;', 'value: string;'],
    response: '{ id: string; create_time_ms: number; name: string; update_time_ms: number; }',
    markdown:
      "## update\n\n`client.secrets.update(name: string, value: string): { id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n\n**post** `/v1/secrets/{name}`\n\nUpdate the value of an existing Secret by name. The new value will be encrypted at rest.\n\n### Parameters\n\n- `name: string`\n\n- `value: string`\n  The new value for the Secret. This will replace the existing value and be encrypted at rest. Example: 'my-updated-secure-password'\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n  A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `update_time_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst secretView = await client.secrets.update('name', { value: 'value' });\n\nconsole.log(secretView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/secrets',
    httpMethod: 'get',
    summary: 'List Secrets.',
    description:
      'List all Secrets for the authenticated account. Secret values are not included for security reasons.',
    stainlessPath: '(resource) secrets > (method) list',
    qualified: 'client.secrets.list',
    params: ['limit?: number;'],
    response:
      '{ has_more: boolean; secrets: { id: string; create_time_ms: number; name: string; update_time_ms: number; }[]; total_count?: number; }',
    markdown:
      "## list\n\n`client.secrets.list(limit?: number): { has_more: boolean; secrets: secret_view[]; total_count?: number; }`\n\n**get** `/v1/secrets`\n\nList all Secrets for the authenticated account. Secret values are not included for security reasons.\n\n### Parameters\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n### Returns\n\n- `{ has_more: boolean; secrets: { id: string; create_time_ms: number; name: string; update_time_ms: number; }[]; total_count?: number; }`\n  A paginated list of Secrets.\n\n  - `has_more: boolean`\n  - `secrets: { id: string; create_time_ms: number; name: string; update_time_ms: number; }[]`\n  - `total_count?: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst secretListView = await client.secrets.list();\n\nconsole.log(secretListView);\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/secrets/{name}/delete',
    httpMethod: 'post',
    summary: 'Delete a Secret.',
    description:
      'Delete an existing Secret by name. This action is irreversible and will remove the Secret from all Devboxes.',
    stainlessPath: '(resource) secrets > (method) delete',
    qualified: 'client.secrets.delete',
    params: ['name: string;'],
    response: '{ id: string; create_time_ms: number; name: string; update_time_ms: number; }',
    markdown:
      "## delete\n\n`client.secrets.delete(name: string): { id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n\n**post** `/v1/secrets/{name}/delete`\n\nDelete an existing Secret by name. This action is irreversible and will remove the Secret from all Devboxes.\n\n### Parameters\n\n- `name: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; name: string; update_time_ms: number; }`\n  A Secret represents a key-value pair that can be securely stored and used in Devboxes as environment variables.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `name: string`\n  - `update_time_ms: number`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst secretView = await client.secrets.delete('name');\n\nconsole.log(secretView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/network-policies',
    httpMethod: 'post',
    summary: 'Create a NetworkPolicy.',
    description:
      'Create a new NetworkPolicy with the specified egress rules. The policy can then be applied to blueprints, devboxes, or snapshot resumes.',
    stainlessPath: '(resource) network_policies > (method) create',
    qualified: 'client.networkPolicies.create',
    params: [
      'name: string;',
      'allow_agent_gateway?: boolean;',
      'allow_all?: boolean;',
      'allow_devbox_to_devbox?: boolean;',
      'allow_mcp_gateway?: boolean;',
      'allow_runloop_mirrors?: boolean;',
      "allowed_cidrs?: { cidr: string; ports?: { port: number; end_port?: number; protocol?: 'TCP' | 'UDP'; }[]; }[];",
      'allowed_hostnames?: string[];',
      'description?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }',
    markdown:
      "## create\n\n`client.networkPolicies.create(name: string, allow_agent_gateway?: boolean, allow_all?: boolean, allow_devbox_to_devbox?: boolean, allow_mcp_gateway?: boolean, allow_runloop_mirrors?: boolean, allowed_cidrs?: { cidr: string; ports?: port_rule[]; }[], allowed_hostnames?: string[], description?: string): { id: string; create_time_ms: number; egress: object; name: string; update_time_ms: number; description?: string; }`\n\n**post** `/v1/network-policies`\n\nCreate a new NetworkPolicy with the specified egress rules. The policy can then be applied to blueprints, devboxes, or snapshot resumes.\n\n### Parameters\n\n- `name: string`\n  The human-readable name for the NetworkPolicy. Must be unique within the account.\n\n- `allow_agent_gateway?: boolean`\n  (Optional) If true, allows devbox egress to the agent gateway for credential proxying. Defaults to false.\n\n- `allow_all?: boolean`\n  (Optional) If true, all egress traffic is allowed (ALLOW_ALL policy). Defaults to false.\n\n- `allow_devbox_to_devbox?: boolean`\n  (Optional) If true, allows traffic between the account's own devboxes via tunnels. Defaults to false. If allow_all is true, this is automatically set to true.\n\n- `allow_mcp_gateway?: boolean`\n  (Optional) If true, allows devbox egress to the MCP hub for MCP server access. Defaults to false.\n\n- `allow_runloop_mirrors?: boolean`\n  (Optional) If true, allows devbox egress to Runloop's package/image registry mirrors. Defaults to false. Implicitly allowed when allow_all is true.\n\n- `allowed_cidrs?: { cidr: string; ports?: { port: number; end_port?: number; protocol?: 'TCP' | 'UDP'; }[]; }[]`\n  (Optional) IPv4 CIDR-based allow list with optional port restrictions, additive with allowed_hostnames. Example: [{'cidr': '10.12.0.0/16', 'ports': [{'port': 443}]}].\n\n- `allowed_hostnames?: string[]`\n  (Optional) DNS-based allow list with wildcard support. Examples: ['github.com', '*.npmjs.org'].\n\n- `description?: string`\n  Optional description for the NetworkPolicy.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }`\n  A NetworkPolicy defines egress network access rules for devboxes. Policies can be applied to blueprints, devboxes, and snapshot resumes.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: { cidr: string; ports?: object[]; }[]; allowed_hostnames: string[]; }`\n  - `name: string`\n  - `update_time_ms: number`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst networkPolicyView = await client.networkPolicies.create({ name: 'name' });\n\nconsole.log(networkPolicyView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/network-policies/{id}',
    httpMethod: 'get',
    summary: 'Get a NetworkPolicy.',
    description: 'Get a specific NetworkPolicy by its unique identifier.',
    stainlessPath: '(resource) network_policies > (method) retrieve',
    qualified: 'client.networkPolicies.retrieve',
    params: ['id: string;'],
    response:
      '{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }',
    markdown:
      "## retrieve\n\n`client.networkPolicies.retrieve(id: string): { id: string; create_time_ms: number; egress: object; name: string; update_time_ms: number; description?: string; }`\n\n**get** `/v1/network-policies/{id}`\n\nGet a specific NetworkPolicy by its unique identifier.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }`\n  A NetworkPolicy defines egress network access rules for devboxes. Policies can be applied to blueprints, devboxes, and snapshot resumes.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: { cidr: string; ports?: object[]; }[]; allowed_hostnames: string[]; }`\n  - `name: string`\n  - `update_time_ms: number`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst networkPolicyView = await client.networkPolicies.retrieve('id');\n\nconsole.log(networkPolicyView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/network-policies/{id}',
    httpMethod: 'post',
    summary: 'Update a NetworkPolicy.',
    description:
      'Update an existing NetworkPolicy. All fields are optional - null fields preserve existing values, provided fields replace entirely.',
    stainlessPath: '(resource) network_policies > (method) update',
    qualified: 'client.networkPolicies.update',
    params: [
      'id: string;',
      'allow_agent_gateway?: boolean;',
      'allow_all?: boolean;',
      'allow_devbox_to_devbox?: boolean;',
      'allow_mcp_gateway?: boolean;',
      'allow_runloop_mirrors?: boolean;',
      "allowed_cidrs?: { cidr: string; ports?: { port: number; end_port?: number; protocol?: 'TCP' | 'UDP'; }[]; }[];",
      'allowed_hostnames?: string[];',
      'description?: string;',
      'name?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }',
    markdown:
      "## update\n\n`client.networkPolicies.update(id: string, allow_agent_gateway?: boolean, allow_all?: boolean, allow_devbox_to_devbox?: boolean, allow_mcp_gateway?: boolean, allow_runloop_mirrors?: boolean, allowed_cidrs?: { cidr: string; ports?: port_rule[]; }[], allowed_hostnames?: string[], description?: string, name?: string): { id: string; create_time_ms: number; egress: object; name: string; update_time_ms: number; description?: string; }`\n\n**post** `/v1/network-policies/{id}`\n\nUpdate an existing NetworkPolicy. All fields are optional - null fields preserve existing values, provided fields replace entirely.\n\n### Parameters\n\n- `id: string`\n\n- `allow_agent_gateway?: boolean`\n  If true, allows devbox egress to the agent gateway.\n\n- `allow_all?: boolean`\n  If true, all egress traffic is allowed (ALLOW_ALL policy).\n\n- `allow_devbox_to_devbox?: boolean`\n  If true, allows traffic between the account's own devboxes via tunnels.\n\n- `allow_mcp_gateway?: boolean`\n  If true, allows devbox egress to the MCP hub.\n\n- `allow_runloop_mirrors?: boolean`\n  If true, allows devbox egress to Runloop's package/image registry mirrors. Implicitly allowed when allow_all is true.\n\n- `allowed_cidrs?: { cidr: string; ports?: { port: number; end_port?: number; protocol?: 'TCP' | 'UDP'; }[]; }[]`\n  Updated IPv4 CIDR-based allow list with optional port restrictions, additive with allowed_hostnames.\n\n- `allowed_hostnames?: string[]`\n  Updated DNS-based allow list with wildcard support. Examples: ['github.com', '*.npmjs.org'].\n\n- `description?: string`\n  Updated description for the NetworkPolicy.\n\n- `name?: string`\n  Updated human-readable name for the NetworkPolicy.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }`\n  A NetworkPolicy defines egress network access rules for devboxes. Policies can be applied to blueprints, devboxes, and snapshot resumes.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: { cidr: string; ports?: object[]; }[]; allowed_hostnames: string[]; }`\n  - `name: string`\n  - `update_time_ms: number`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst networkPolicyView = await client.networkPolicies.update('id');\n\nconsole.log(networkPolicyView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/network-policies',
    httpMethod: 'get',
    summary: 'List NetworkPolicies.',
    description: 'List all NetworkPolicies for the authenticated account.',
    stainlessPath: '(resource) network_policies > (method) list',
    qualified: 'client.networkPolicies.list',
    params: [
      'id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      '{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }',
    markdown:
      "## list\n\n`client.networkPolicies.list(id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; create_time_ms: number; egress: object; name: string; update_time_ms: number; description?: string; }`\n\n**get** `/v1/network-policies`\n\nList all NetworkPolicies for the authenticated account.\n\n### Parameters\n\n- `id?: string`\n  Filter by ID.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name (partial match supported).\n\n- `search?: string`\n  Search by network policy ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }`\n  A NetworkPolicy defines egress network access rules for devboxes. Policies can be applied to blueprints, devboxes, and snapshot resumes.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: { cidr: string; ports?: object[]; }[]; allowed_hostnames: string[]; }`\n  - `name: string`\n  - `update_time_ms: number`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const networkPolicyView of client.networkPolicies.list()) {\n  console.log(networkPolicyView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/network-policies/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete a NetworkPolicy.',
    description: 'Delete an existing NetworkPolicy. This action is irreversible.',
    stainlessPath: '(resource) network_policies > (method) delete',
    qualified: 'client.networkPolicies.delete',
    params: ['id: string;'],
    response:
      '{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }',
    markdown:
      "## delete\n\n`client.networkPolicies.delete(id: string): { id: string; create_time_ms: number; egress: object; name: string; update_time_ms: number; description?: string; }`\n\n**post** `/v1/network-policies/{id}/delete`\n\nDelete an existing NetworkPolicy. This action is irreversible.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; create_time_ms: number; egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: object[]; allowed_hostnames: string[]; }; name: string; update_time_ms: number; description?: string; }`\n  A NetworkPolicy defines egress network access rules for devboxes. Policies can be applied to blueprints, devboxes, and snapshot resumes.\n\n  - `id: string`\n  - `create_time_ms: number`\n  - `egress: { allow_agent_gateway: boolean; allow_all: boolean; allow_devbox_to_devbox: boolean; allow_mcp_gateway: boolean; allow_runloop_mirrors: boolean; allowed_cidrs: { cidr: string; ports?: object[]; }[]; allowed_hostnames: string[]; }`\n  - `name: string`\n  - `update_time_ms: number`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst networkPolicyView = await client.networkPolicies.delete('id');\n\nconsole.log(networkPolicyView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/gateway-configs',
    httpMethod: 'post',
    summary: 'Create a GatewayConfig.',
    description:
      'Create a new GatewayConfig to proxy API requests through the agent gateway. The config specifies the target endpoint and how credentials should be applied.',
    stainlessPath: '(resource) gateway_configs > (method) create',
    qualified: 'client.gatewayConfigs.create',
    params: [
      'auth_mechanism: { type: string; key?: string; };',
      'endpoint: string;',
      'name: string;',
      'custom_headers?: { name: string; secret?: string; value?: string; }[];',
      'description?: string;',
    ],
    response:
      '{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## create\n\n`client.gatewayConfigs.create(auth_mechanism: { type: string; key?: string; }, endpoint: string, name: string, custom_headers?: { name: string; secret?: string; value?: string; }[], description?: string): { id: string; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/gateway-configs`\n\nCreate a new GatewayConfig to proxy API requests through the agent gateway. The config specifies the target endpoint and how credentials should be applied.\n\n### Parameters\n\n- `auth_mechanism: { type: string; key?: string; }`\n  How credentials should be applied to proxied requests. Specify the type ('header', 'bearer') and optional key field.\n  - `type: string`\n    The type of authentication mechanism: 'header', 'bearer', or 'basic'. For 'basic', store the secret as plain 'user:pass'; the proxy base64-encodes it.\n  - `key?: string`\n    The header name (e.g., 'x-api-key'). Required for 'header' type; invalid for other types.\n\n- `endpoint: string`\n  The target endpoint URL (e.g., 'https://api.anthropic.com').\n\n- `name: string`\n  The human-readable name for the GatewayConfig. Must be unique within your account.\n\n- `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  Additional headers applied to proxied requests after the auth mechanism. At most 8 entries.\n\n- `description?: string`\n  Optional description for this gateway configuration.\n\n### Returns\n\n- `{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  A GatewayConfig defines a configuration for proxying API requests through the agent gateway. It specifies the target endpoint and how credentials should be applied.\n\n  - `id: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `account_id?: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst gatewayConfigView = await client.gatewayConfigs.create({\n  auth_mechanism: { type: 'type' },\n  endpoint: 'endpoint',\n  name: 'name',\n});\n\nconsole.log(gatewayConfigView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/gateway-configs/{id}',
    httpMethod: 'get',
    summary: 'Get a GatewayConfig.',
    description: 'Get a specific GatewayConfig by its unique identifier.',
    stainlessPath: '(resource) gateway_configs > (method) retrieve',
    qualified: 'client.gatewayConfigs.retrieve',
    params: ['id: string;'],
    response:
      '{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## retrieve\n\n`client.gatewayConfigs.retrieve(id: string): { id: string; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: custom_header[]; description?: string; }`\n\n**get** `/v1/gateway-configs/{id}`\n\nGet a specific GatewayConfig by its unique identifier.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  A GatewayConfig defines a configuration for proxying API requests through the agent gateway. It specifies the target endpoint and how credentials should be applied.\n\n  - `id: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `account_id?: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst gatewayConfigView = await client.gatewayConfigs.retrieve('id');\n\nconsole.log(gatewayConfigView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/gateway-configs/{id}',
    httpMethod: 'post',
    summary: 'Update a GatewayConfig.',
    description: 'Update an existing GatewayConfig. All fields are optional.',
    stainlessPath: '(resource) gateway_configs > (method) update',
    qualified: 'client.gatewayConfigs.update',
    params: [
      'id: string;',
      'auth_mechanism?: { type: string; key?: string; };',
      'custom_headers?: { name: string; secret?: string; value?: string; }[];',
      'description?: string;',
      'endpoint?: string;',
      'name?: string;',
    ],
    response:
      '{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## update\n\n`client.gatewayConfigs.update(id: string, auth_mechanism?: { type: string; key?: string; }, custom_headers?: { name: string; secret?: string; value?: string; }[], description?: string, endpoint?: string, name?: string): { id: string; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/gateway-configs/{id}`\n\nUpdate an existing GatewayConfig. All fields are optional.\n\n### Parameters\n\n- `id: string`\n\n- `auth_mechanism?: { type: string; key?: string; }`\n  Defines how the primary credential is applied to requests proxied to the upstream.\n  - `type: string`\n    The type of authentication mechanism: 'header', 'bearer', or 'basic'. For 'basic', store the secret as plain 'user:pass'; the proxy base64-encodes it.\n  - `key?: string`\n    The header name (e.g., 'x-api-key'). Required for 'header' type; invalid for other types.\n\n- `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  New list of additional headers. Replaces the existing list entirely; use an empty list to clear all custom headers. At most 8 entries.\n\n- `description?: string`\n  New description for this gateway configuration.\n\n- `endpoint?: string`\n  New target endpoint URL (e.g., 'https://api.anthropic.com').\n\n- `name?: string`\n  New name for the GatewayConfig. Must be unique within your account.\n\n### Returns\n\n- `{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  A GatewayConfig defines a configuration for proxying API requests through the agent gateway. It specifies the target endpoint and how credentials should be applied.\n\n  - `id: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `account_id?: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst gatewayConfigView = await client.gatewayConfigs.update('id');\n\nconsole.log(gatewayConfigView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/gateway-configs',
    httpMethod: 'get',
    summary: 'List GatewayConfigs.',
    description:
      "List all GatewayConfigs for the authenticated account, including system-provided configs like 'anthropic' and 'openai'.",
    stainlessPath: '(resource) gateway_configs > (method) list',
    qualified: 'client.gatewayConfigs.list',
    params: [
      'id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      '{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## list\n\n`client.gatewayConfigs.list(id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: custom_header[]; description?: string; }`\n\n**get** `/v1/gateway-configs`\n\nList all GatewayConfigs for the authenticated account, including system-provided configs like 'anthropic' and 'openai'.\n\n### Parameters\n\n- `id?: string`\n  Filter by ID.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name (partial match supported).\n\n- `search?: string`\n  Search by gateway config ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  A GatewayConfig defines a configuration for proxying API requests through the agent gateway. It specifies the target endpoint and how credentials should be applied.\n\n  - `id: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `account_id?: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const gatewayConfigView of client.gatewayConfigs.list()) {\n  console.log(gatewayConfigView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/gateway-configs/{id}/delete',
    httpMethod: 'post',
    summary: 'Delete a GatewayConfig.',
    description: 'Delete an existing GatewayConfig. This action is irreversible.',
    stainlessPath: '(resource) gateway_configs > (method) delete',
    qualified: 'client.gatewayConfigs.delete',
    params: ['id: string;'],
    response:
      '{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## delete\n\n`client.gatewayConfigs.delete(id: string): { id: string; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/gateway-configs/{id}/delete`\n\nDelete an existing GatewayConfig. This action is irreversible.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; account_id?: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  A GatewayConfig defines a configuration for proxying API requests through the agent gateway. It specifies the target endpoint and how credentials should be applied.\n\n  - `id: string`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `account_id?: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst gatewayConfigView = await client.gatewayConfigs.delete('id');\n\nconsole.log(gatewayConfigView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/mcp-configs',
    httpMethod: 'post',
    summary: '[Beta] Create an McpConfig.',
    description:
      '[Beta] Create a new McpConfig to connect to an upstream MCP (Model Context Protocol) server. The config specifies the target endpoint and which tools are allowed.',
    stainlessPath: '(resource) mcp_configs > (method) create',
    qualified: 'client.mcpConfigs.create',
    params: [
      'allowed_tools: string[];',
      'endpoint: string;',
      'name: string;',
      'auth_mechanism?: { type: string; key?: string; };',
      'custom_headers?: { name: string; secret?: string; value?: string; }[];',
      'description?: string;',
    ],
    response:
      '{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## create\n\n`client.mcpConfigs.create(allowed_tools: string[], endpoint: string, name: string, auth_mechanism?: { type: string; key?: string; }, custom_headers?: { name: string; secret?: string; value?: string; }[], description?: string): { id: string; allowed_tools: string[]; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/mcp-configs`\n\n[Beta] Create a new McpConfig to connect to an upstream MCP (Model Context Protocol) server. The config specifies the target endpoint and which tools are allowed.\n\n### Parameters\n\n- `allowed_tools: string[]`\n  Glob patterns specifying which tools are allowed from this MCP server. Examples: ['*'] for all tools, ['github.search_*', 'github.get_*'] for specific patterns.\n\n- `endpoint: string`\n  The target MCP server endpoint URL (e.g., 'https://mcp.example.com').\n\n- `name: string`\n  The human-readable name for the McpConfig. Must be unique within your account. The first segment before '-' is used as the service name for tool routing (e.g., 'github-readonly' uses 'github' as the service name).\n\n- `auth_mechanism?: { type: string; key?: string; }`\n  Defines how the primary credential is applied to requests proxied to the upstream.\n  - `type: string`\n    The type of authentication mechanism: 'header', 'bearer', or 'basic'. For 'basic', store the secret as plain 'user:pass'; the proxy base64-encodes it.\n  - `key?: string`\n    The header name (e.g., 'x-api-key'). Required for 'header' type; invalid for other types.\n\n- `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  Additional headers applied to upstream requests after the credential. At most 8 entries.\n\n- `description?: string`\n  Optional description for this MCP configuration.\n\n### Returns\n\n- `{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  An McpConfig defines a configuration for connecting to an upstream MCP (Model Context Protocol) server. It specifies the target endpoint and which tools are allowed.\n\n  - `id: string`\n  - `allowed_tools: string[]`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst mcpConfigView = await client.mcpConfigs.create({\n  allowed_tools: ['string'],\n  endpoint: 'endpoint',\n  name: 'name',\n});\n\nconsole.log(mcpConfigView);\n```",
  },
  {
    name: 'retrieve',
    endpoint: '/v1/mcp-configs/{id}',
    httpMethod: 'get',
    summary: '[Beta] Get an McpConfig.',
    description: '[Beta] Get a specific McpConfig by its unique identifier.',
    stainlessPath: '(resource) mcp_configs > (method) retrieve',
    qualified: 'client.mcpConfigs.retrieve',
    params: ['id: string;'],
    response:
      '{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## retrieve\n\n`client.mcpConfigs.retrieve(id: string): { id: string; allowed_tools: string[]; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; custom_headers?: custom_header[]; description?: string; }`\n\n**get** `/v1/mcp-configs/{id}`\n\n[Beta] Get a specific McpConfig by its unique identifier.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  An McpConfig defines a configuration for connecting to an upstream MCP (Model Context Protocol) server. It specifies the target endpoint and which tools are allowed.\n\n  - `id: string`\n  - `allowed_tools: string[]`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst mcpConfigView = await client.mcpConfigs.retrieve('id');\n\nconsole.log(mcpConfigView);\n```",
  },
  {
    name: 'update',
    endpoint: '/v1/mcp-configs/{id}',
    httpMethod: 'post',
    summary: '[Beta] Update an McpConfig.',
    description: '[Beta] Update an existing McpConfig. All fields are optional.',
    stainlessPath: '(resource) mcp_configs > (method) update',
    qualified: 'client.mcpConfigs.update',
    params: [
      'id: string;',
      'allowed_tools?: string[];',
      'auth_mechanism?: { type: string; key?: string; };',
      'custom_headers?: { name: string; secret?: string; value?: string; }[];',
      'description?: string;',
      'endpoint?: string;',
      'name?: string;',
    ],
    response:
      '{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## update\n\n`client.mcpConfigs.update(id: string, allowed_tools?: string[], auth_mechanism?: { type: string; key?: string; }, custom_headers?: { name: string; secret?: string; value?: string; }[], description?: string, endpoint?: string, name?: string): { id: string; allowed_tools: string[]; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/mcp-configs/{id}`\n\n[Beta] Update an existing McpConfig. All fields are optional.\n\n### Parameters\n\n- `id: string`\n\n- `allowed_tools?: string[]`\n  New glob patterns specifying which tools are allowed. Examples: ['*'] for all tools, ['github.search_*'] for specific patterns.\n\n- `auth_mechanism?: { type: string; key?: string; }`\n  Defines how the primary credential is applied to requests proxied to the upstream.\n  - `type: string`\n    The type of authentication mechanism: 'header', 'bearer', or 'basic'. For 'basic', store the secret as plain 'user:pass'; the proxy base64-encodes it.\n  - `key?: string`\n    The header name (e.g., 'x-api-key'). Required for 'header' type; invalid for other types.\n\n- `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  New list of additional headers. Replaces the existing list entirely; use an empty list to clear all custom headers. At most 8 entries.\n\n- `description?: string`\n  New description for this MCP configuration.\n\n- `endpoint?: string`\n  New target MCP server endpoint URL.\n\n- `name?: string`\n  New name for the McpConfig. Must be unique within your account.\n\n### Returns\n\n- `{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  An McpConfig defines a configuration for connecting to an upstream MCP (Model Context Protocol) server. It specifies the target endpoint and which tools are allowed.\n\n  - `id: string`\n  - `allowed_tools: string[]`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst mcpConfigView = await client.mcpConfigs.update('id');\n\nconsole.log(mcpConfigView);\n```",
  },
  {
    name: 'list',
    endpoint: '/v1/mcp-configs',
    httpMethod: 'get',
    summary: '[Beta] List McpConfigs.',
    description: '[Beta] List all McpConfigs for the authenticated account.',
    stainlessPath: '(resource) mcp_configs > (method) list',
    qualified: 'client.mcpConfigs.list',
    params: [
      'id?: string;',
      'include_total_count?: boolean;',
      'limit?: number;',
      'name?: string;',
      'search?: string;',
      'starting_after?: string;',
    ],
    response:
      '{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## list\n\n`client.mcpConfigs.list(id?: string, include_total_count?: boolean, limit?: number, name?: string, search?: string, starting_after?: string): { id: string; allowed_tools: string[]; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; custom_headers?: custom_header[]; description?: string; }`\n\n**get** `/v1/mcp-configs`\n\n[Beta] List all McpConfigs for the authenticated account.\n\n### Parameters\n\n- `id?: string`\n  Filter by ID.\n\n- `include_total_count?: boolean`\n  If true (default), includes total_count in the response. Set to false to skip the count query for better performance on large datasets.\n\n- `limit?: number`\n  The limit of items to return. Default is 20. Max is 5000.\n\n- `name?: string`\n  Filter by name (prefix match supported).\n\n- `search?: string`\n  Search by MCP config ID or name.\n\n- `starting_after?: string`\n  Load the next page of data starting after the item with the given ID.\n\n### Returns\n\n- `{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  An McpConfig defines a configuration for connecting to an upstream MCP (Model Context Protocol) server. It specifies the target endpoint and which tools are allowed.\n\n  - `id: string`\n  - `allowed_tools: string[]`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\n// Automatically fetches more pages as needed.\nfor await (const mcpConfigView of client.mcpConfigs.list()) {\n  console.log(mcpConfigView);\n}\n```",
  },
  {
    name: 'delete',
    endpoint: '/v1/mcp-configs/{id}/delete',
    httpMethod: 'post',
    summary: '[Beta] Delete an McpConfig.',
    description: '[Beta] Delete an existing McpConfig. This action is irreversible.',
    stainlessPath: '(resource) mcp_configs > (method) delete',
    qualified: 'client.mcpConfigs.delete',
    params: ['id: string;'],
    response:
      '{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }',
    markdown:
      "## delete\n\n`client.mcpConfigs.delete(id: string): { id: string; allowed_tools: string[]; auth_mechanism: auth_mechanism; create_time_ms: number; endpoint: string; name: string; custom_headers?: custom_header[]; description?: string; }`\n\n**post** `/v1/mcp-configs/{id}/delete`\n\n[Beta] Delete an existing McpConfig. This action is irreversible.\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; allowed_tools: string[]; auth_mechanism: { type: string; key?: string; }; create_time_ms: number; endpoint: string; name: string; custom_headers?: { name: string; secret?: string; value?: string; }[]; description?: string; }`\n  An McpConfig defines a configuration for connecting to an upstream MCP (Model Context Protocol) server. It specifies the target endpoint and which tools are allowed.\n\n  - `id: string`\n  - `allowed_tools: string[]`\n  - `auth_mechanism: { type: string; key?: string; }`\n  - `create_time_ms: number`\n  - `endpoint: string`\n  - `name: string`\n  - `custom_headers?: { name: string; secret?: string; value?: string; }[]`\n  - `description?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst mcpConfigView = await client.mcpConfigs.delete('id');\n\nconsole.log(mcpConfigView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/apikeys',
    httpMethod: 'post',
    summary: 'Create API Key.',
    description:
      'Create a new API key for the authenticated account. Use a standard API key (ak_) or a restricted key (rk_) with RESOURCE_TYPE_ACCOUNT write scope.',
    stainlessPath: '(resource) apikeys > (method) create',
    qualified: 'client.apikeys.create',
    params: ['expires_at_ms?: number;', 'name?: string;'],
    response: '{ id?: string; expires_at_ms?: number; key_secret?: string; name?: string; }',
    markdown:
      "## create\n\n`client.apikeys.create(expires_at_ms?: number, name?: string): { id?: string; expires_at_ms?: number; key_secret?: string; name?: string; }`\n\n**post** `/v1/apikeys`\n\nCreate a new API key for the authenticated account. Use a standard API key (ak_) or a restricted key (rk_) with RESOURCE_TYPE_ACCOUNT write scope.\n\n### Parameters\n\n- `expires_at_ms?: number`\n\n- `name?: string`\n\n### Returns\n\n- `{ id?: string; expires_at_ms?: number; key_secret?: string; name?: string; }`\n\n  - `id?: string`\n  - `expires_at_ms?: number`\n  - `key_secret?: string`\n  - `name?: string`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst apiKeyCreatedView = await client.apikeys.create();\n\nconsole.log(apiKeyCreatedView);\n```",
  },
  {
    name: 'create',
    endpoint: '/v1/restricted_keys',
    httpMethod: 'post',
    summary: 'Create a restricted API key.',
    description:
      'Create a restricted API key with specific resource scopes. Use a standard API key (ak_) or a restricted key (rk_) with RESOURCE_TYPE_ACCOUNT write scope.',
    stainlessPath: '(resource) restricted_keys > (method) create',
    qualified: 'client.restrictedKeys.create',
    params: [
      'expires_at_ms?: number;',
      'name?: string;',
      "scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[];",
    ],
    response:
      "{ id?: string; expires_at_ms?: number; key_secret?: string; name?: string; scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[]; }",
    markdown:
      "## create\n\n`client.restrictedKeys.create(expires_at_ms?: number, name?: string, scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[]): { id?: string; expires_at_ms?: number; key_secret?: string; name?: string; scopes?: scope_entry_view[]; }`\n\n**post** `/v1/restricted_keys`\n\nCreate a restricted API key with specific resource scopes. Use a standard API key (ak_) or a restricted key (rk_) with RESOURCE_TYPE_ACCOUNT write scope.\n\n### Parameters\n\n- `expires_at_ms?: number`\n\n- `name?: string`\n\n- `scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[]`\n\n### Returns\n\n- `{ id?: string; expires_at_ms?: number; key_secret?: string; name?: string; scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[]; }`\n\n  - `id?: string`\n  - `expires_at_ms?: number`\n  - `key_secret?: string`\n  - `name?: string`\n  - `scopes?: { access_level?: 'ACCESS_LEVEL_NONE' | 'ACCESS_LEVEL_READ' | 'ACCESS_LEVEL_WRITE'; resource_type?: string; }[]`\n\n### Example\n\n```typescript\nimport Runloop from '@runloop/api-client';\n\nconst client = new Runloop();\n\nconst restrictedKeyCreatedView = await client.restrictedKeys.create();\n\nconsole.log(restrictedKeyCreatedView);\n```",
  },
];

const EMBEDDED_READMES: { language: string; content: string }[] = [];

const INDEX_OPTIONS = {
  fields: [
    'name',
    'endpoint',
    'summary',
    'description',
    'qualified',
    'stainlessPath',
    'content',
    'sectionContext',
  ],
  storeFields: ['kind', '_original'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.1,
    boost: {
      name: 5,
      stainlessPath: 3,
      endpoint: 3,
      qualified: 3,
      summary: 2,
      content: 1,
      description: 1,
    } as Record<string, number>,
  },
};

/**
 * Self-contained local search engine backed by MiniSearch.
 * Method data is embedded at SDK build time; prose documents
 * can be loaded from an optional docs directory at runtime.
 */
export class LocalDocsSearch {
  private methodIndex: MiniSearch<MiniSearchDocument>;
  private proseIndex: MiniSearch<MiniSearchDocument>;

  private constructor() {
    this.methodIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
    this.proseIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
  }

  static async create(opts?: { docsDir?: string }): Promise<LocalDocsSearch> {
    const instance = new LocalDocsSearch();
    instance.indexMethods(EMBEDDED_METHODS);
    for (const readme of EMBEDDED_READMES) {
      instance.indexProse(readme.content, `readme:${readme.language}`);
    }
    if (opts?.docsDir) {
      await instance.loadDocsDirectory(opts.docsDir);
    }
    return instance;
  }

  search(props: {
    query: string;
    language?: string;
    detail?: string;
    maxResults?: number;
    maxLength?: number;
  }): SearchResult {
    const { query, language = 'typescript', detail = 'default', maxResults = 5, maxLength = 100_000 } = props;

    const useMarkdown = detail === 'verbose' || detail === 'high';

    // Search both indices and merge results by score.
    // Filter prose hits so language-tagged content (READMEs and docs with
    // frontmatter) only matches the requested language.
    const methodHits = this.methodIndex
      .search(query)
      .map((hit) => ({ ...hit, _kind: 'http_method' as const }));
    const proseHits = this.proseIndex
      .search(query)
      .filter((hit) => {
        const source = ((hit as Record<string, unknown>)['_original'] as ProseChunk | undefined)?.source;
        if (!source) return true;
        // Check for language-tagged sources: "readme:<lang>" or "lang:<lang>:<filename>"
        let taggedLang: string | undefined;
        if (source.startsWith('readme:')) taggedLang = source.slice('readme:'.length);
        else if (source.startsWith('lang:')) taggedLang = source.split(':')[1];
        if (!taggedLang) return true;
        return taggedLang === language || (language === 'javascript' && taggedLang === 'typescript');
      })
      .map((hit) => ({ ...hit, _kind: 'prose' as const }));
    const merged = [...methodHits, ...proseHits].sort((a, b) => b.score - a.score);
    const top = merged.slice(0, maxResults);

    const fullResults: (string | Record<string, unknown>)[] = [];

    for (const hit of top) {
      const original = (hit as Record<string, unknown>)['_original'];
      if (hit._kind === 'http_method') {
        const m = original as MethodEntry;
        if (useMarkdown && m.markdown) {
          fullResults.push(m.markdown);
        } else {
          // Use per-language data when available, falling back to the
          // top-level fields (which are TypeScript-specific in the
          // legacy codepath).
          const langData = m.perLanguage?.[language];
          fullResults.push({
            method: langData?.method ?? m.qualified,
            summary: m.summary,
            description: m.description,
            endpoint: `${m.httpMethod.toUpperCase()} ${m.endpoint}`,
            ...(langData?.example ? { example: langData.example } : {}),
            ...(m.params ? { params: m.params } : {}),
            ...(m.response ? { response: m.response } : {}),
          });
        }
      } else {
        const c = original as ProseChunk;
        fullResults.push({
          content: c.content,
          ...(c.source ? { source: c.source } : {}),
        });
      }
    }

    let totalLength = 0;
    const results: (string | Record<string, unknown>)[] = [];
    for (const result of fullResults) {
      const len = typeof result === 'string' ? result.length : JSON.stringify(result).length;
      totalLength += len;
      if (totalLength > maxLength) break;
      results.push(result);
    }

    if (results.length < fullResults.length) {
      results.unshift(`Truncated; showing ${results.length} of ${fullResults.length} results.`);
    }

    return { results };
  }

  private indexMethods(methods: MethodEntry[]): void {
    const docs: MiniSearchDocument[] = methods.map((m, i) => ({
      id: `method-${i}`,
      kind: 'http_method' as const,
      name: m.name,
      endpoint: m.endpoint,
      summary: m.summary,
      description: m.description,
      qualified: m.qualified,
      stainlessPath: m.stainlessPath,
      _original: m as unknown as Record<string, unknown>,
    }));
    if (docs.length > 0) {
      this.methodIndex.addAll(docs);
    }
  }

  private async loadDocsDirectory(docsDir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(docsDir, { withFileTypes: true });
    } catch (err) {
      getLogger().warn({ err, docsDir }, 'Could not read docs directory');
      return;
    }

    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => e.name.endsWith('.md') || e.name.endsWith('.markdown') || e.name.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(docsDir, file.name);
        const content = await fs.readFile(filePath, 'utf-8');

        if (file.name.endsWith('.json')) {
          const texts = extractTexts(JSON.parse(content));
          if (texts.length > 0) {
            this.indexProse(texts.join('\n\n'), file.name);
          }
        } else {
          // Parse optional YAML frontmatter for language tagging.
          // Files with a "language" field in frontmatter will only
          // surface in searches for that language.
          //
          // Example:
          //   ---
          //   language: python
          //   ---
          //   # Error handling in Python
          //   ...
          const frontmatter = parseFrontmatter(content);
          const source = frontmatter.language ? `lang:${frontmatter.language}:${file.name}` : file.name;
          this.indexProse(content, source);
        }
      } catch (err) {
        getLogger().warn({ err, file: file.name }, 'Failed to index docs file');
      }
    }
  }

  private indexProse(markdown: string, source: string): void {
    const chunks = chunkMarkdown(markdown);
    const baseId = this.proseIndex.documentCount;

    const docs: MiniSearchDocument[] = chunks.map((chunk, i) => ({
      id: `prose-${baseId + i}`,
      kind: 'prose' as const,
      content: chunk.content,
      ...(chunk.sectionContext != null ? { sectionContext: chunk.sectionContext } : {}),
      _original: { ...chunk, source } as unknown as Record<string, unknown>,
    }));

    if (docs.length > 0) {
      this.proseIndex.addAll(docs);
    }
  }
}

/** Lightweight markdown chunker — splits on headers, chunks by word count. */
function chunkMarkdown(markdown: string): { content: string; tag: string; sectionContext?: string }[] {
  // Strip YAML frontmatter
  const stripped = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const lines = stripped.split('\n');

  const chunks: { content: string; tag: string; sectionContext?: string }[] = [];
  const headers: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (!text) return;
    const sectionContext = headers.length > 0 ? headers.join(' > ') : undefined;
    // Split into ~200-word chunks
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += 200) {
      const slice = words.slice(i, i + 200).join(' ');
      if (slice) {
        chunks.push({ content: slice, tag: 'p', ...(sectionContext != null ? { sectionContext } : {}) });
      }
    }
    current = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      flush();
      const level = headerMatch[1]!.length;
      const text = headerMatch[2]!.trim();
      while (headers.length >= level) headers.pop();
      headers.push(text);
    } else {
      current.push(line);
    }
  }
  flush();

  return chunks;
}

/** Recursively extracts string values from a JSON structure. */
function extractTexts(data: unknown, depth = 0): string[] {
  if (depth > 10) return [];
  if (typeof data === 'string') return data.trim() ? [data] : [];
  if (Array.isArray(data)) return data.flatMap((item) => extractTexts(item, depth + 1));
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).flatMap((v) => extractTexts(v, depth + 1));
  }
  return [];
}

/** Parses YAML frontmatter from a markdown string, extracting the language field if present. */
function parseFrontmatter(markdown: string): { language?: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const body = match[1] ?? '';
  const langMatch = body.match(/^language:\s*(.+)$/m);
  return langMatch ? { language: langMatch[1]!.trim() } : {};
}
