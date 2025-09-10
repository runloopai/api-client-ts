// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'benchmarks',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/benchmarks/start_run',
  operationId: 'startBenchmarkRun',
};

export const tool: Tool = {
  name: 'start_run_benchmarks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nStart a new BenchmarkRun based on the provided Benchmark.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/benchmark_run_view',\n  $defs: {\n    benchmark_run_view: {\n      type: 'object',\n      description: 'A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the BenchmarkRun.'\n        },\n        benchmark_id: {\n          type: 'string',\n          description: 'The ID of the Benchmark.'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata to attach to the benchmark run for organization.',\n          additionalProperties: true\n        },\n        start_time_ms: {\n          type: 'integer',\n          description: 'The time the benchmark run execution started (Unix timestamp milliseconds).'\n        },\n        state: {\n          type: 'string',\n          description: 'The state of the BenchmarkRun.',\n          enum: [            'running',\n            'canceled',\n            'completed'\n          ]\n        },\n        duration_ms: {\n          type: 'integer',\n          description: 'The duration for the BenchmarkRun to complete.'\n        },\n        environment_variables: {\n          type: 'object',\n          description: 'Environment variables used to run the benchmark.',\n          additionalProperties: true\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the BenchmarkRun.'\n        },\n        purpose: {\n          type: 'string',\n          description: 'Purpose of the run.'\n        },\n        score: {\n          type: 'number',\n          description: 'The final score across the BenchmarkRun, present once completed. Calculated as sum of scenario scores / number of scenario runs.'\n        },\n        secrets_provided: {\n          type: 'object',\n          description: 'User secrets used to run the benchmark. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable \\'DB_PASS\\' on all scenario devboxes to the value of the secret \\'DATABASE_PASSWORD\\'.',\n          additionalProperties: true\n        }\n      },\n      required: [        'id',\n        'benchmark_id',\n        'metadata',\n        'start_time_ms',\n        'state'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      benchmark_id: {
        type: 'string',
        description: 'ID of the Benchmark to run.',
      },
      metadata: {
        type: 'object',
        description: 'User defined metadata to attach to the benchmark run for organization.',
        additionalProperties: true,
      },
      run_name: {
        type: 'string',
        description: 'Display name of the run.',
      },
      runProfile: {
        $ref: '#/$defs/run_profile',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['benchmark_id'],
    $defs: {
      run_profile: {
        type: 'object',
        properties: {
          envVars: {
            type: 'object',
            description:
              'Mapping of Environment Variable to Value. May be shown in devbox logging. Example: {"DB_PASS": "DATABASE_PASSWORD"} would set the environment variable \'DB_PASS\' to the value \'DATABASE_PASSWORD_VALUE\'.',
            additionalProperties: true,
          },
          launchParameters: {
            $ref: '#/$defs/launch_parameters',
          },
          purpose: {
            type: 'string',
            description: 'Purpose of the run.',
          },
          secrets: {
            type: 'object',
            description:
              'Mapping of Environment Variable to User Secret Name. Never shown in devbox logging. Example: {"DB_PASS": "DATABASE_PASSWORD"} would set the environment variable \'DB_PASS\' to the value of the secret \'DATABASE_PASSWORD\'.',
            additionalProperties: true,
          },
        },
      },
      launch_parameters: {
        type: 'object',
        description:
          "LaunchParameters enable you to customize the resources available to your Devbox as well as the environment set up that should be completed before the Devbox is marked as 'running'.",
        properties: {
          after_idle: {
            $ref: '#/$defs/after_idle',
          },
          architecture: {
            type: 'string',
            description: 'The target architecture for the Devbox. If unset, defaults to arm64.',
            enum: ['x86_64', 'arm64'],
          },
          available_ports: {
            type: 'array',
            description:
              "A list of ports to make available on the Devbox. Only ports made available will be surfaced to create tunnels via the 'createTunnel' API.",
            items: {
              type: 'integer',
            },
          },
          custom_cpu_cores: {
            type: 'integer',
            description:
              'custom resource size, number of cpu cores, must be multiple of 2. Min is 1, max is 16.',
          },
          custom_disk_size: {
            type: 'integer',
            description:
              'custom disk size, number in GiB, must be a multiple of 2. Min is 2GiB, max is 64GiB.',
          },
          custom_gb_memory: {
            type: 'integer',
            description:
              'custom memory size, number in GiB, must be a multiple of 2. Min is 2GiB, max is 64GiB.',
          },
          keep_alive_time_seconds: {
            type: 'integer',
            description: 'Time in seconds after which Devbox will automatically shutdown. Default is 1 hour.',
          },
          launch_commands: {
            type: 'array',
            description: 'Set of commands to be run at launch time, before the entrypoint process is run.',
            items: {
              type: 'string',
            },
          },
          required_services: {
            type: 'array',
            description:
              'A list of ContainerizedService names to be started when a Devbox is created. A valid ContainerizedService must be specified in Blueprint to be started.',
            items: {
              type: 'string',
            },
          },
          resource_size_request: {
            type: 'string',
            description: 'Manual resource configuration for Devbox. If not set, defaults will be used.',
            enum: ['X_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'X_LARGE', 'XX_LARGE', 'CUSTOM_SIZE'],
          },
          user_parameters: {
            type: 'object',
            description: 'Specify the user for execution on Devbox. If not set, default `user` will be used.',
            properties: {
              uid: {
                type: 'integer',
                description: 'User ID (UID) for the Linux user. Must be a positive integer.',
              },
              username: {
                type: 'string',
                description: 'Username for the Linux user.',
              },
            },
            required: ['uid', 'username'],
          },
        },
      },
      after_idle: {
        type: 'object',
        properties: {
          idle_time_seconds: {
            type: 'integer',
            description: 'After idle_time_seconds, on_idle action will be taken.',
          },
          on_idle: {
            type: 'string',
            description: 'Action to take after Devbox becomes idle.',
            enum: ['shutdown', 'suspend'],
          },
        },
        required: ['idle_time_seconds', 'on_idle'],
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.benchmarks.startRun(body)));
};

export default { metadata, tool, handler };
