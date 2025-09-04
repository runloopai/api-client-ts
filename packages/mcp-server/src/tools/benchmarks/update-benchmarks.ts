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
  httpPath: '/v1/benchmarks/{id}',
  operationId: 'updateBenchmark',
};

export const tool: Tool = {
  name: 'update_benchmarks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nUpdate a Benchmark with a set of Scenarios.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/benchmark_view',\n  $defs: {\n    benchmark_view: {\n      type: 'object',\n      description: 'A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the Benchmark.'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata to attach to the benchmark for organization.',\n          additionalProperties: true\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the Benchmark.'\n        },\n        scenarioIds: {\n          type: 'array',\n          description: 'List of Scenario IDs that make up the benchmark.',\n          items: {\n            type: 'string'\n          }\n        },\n        attribution: {\n          type: 'string',\n          description: 'Attribution information for the benchmark.'\n        },\n        description: {\n          type: 'string',\n          description: 'Detailed description of the benchmark.'\n        },\n        is_public: {\n          type: 'boolean',\n          description: 'Whether this benchmark is public.'\n        },\n        required_environment_variables: {\n          type: 'array',\n          description: 'Required environment variables used to run the benchmark. If any required environment variables are missing, the benchmark will fail to start.',\n          items: {\n            type: 'string'\n          }\n        },\n        required_secret_names: {\n          type: 'array',\n          description: 'Required secrets used to run the benchmark. If any required secrets are missing, the benchmark will fail to start.',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'id',\n        'metadata',\n        'name',\n        'scenarioIds'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
        description: 'The name of the Benchmark. This must be unique.',
      },
      attribution: {
        type: 'string',
        description: 'Attribution information for the benchmark.',
      },
      description: {
        type: 'string',
        description: 'Detailed description of the benchmark.',
      },
      metadata: {
        type: 'object',
        description: 'User defined metadata to attach to the benchmark for organization.',
        additionalProperties: true,
      },
      required_environment_variables: {
        type: 'array',
        description:
          'Environment variables required to run the benchmark. If any required variables are not supplied, the benchmark will fail to start',
        items: {
          type: 'string',
        },
      },
      required_secret_names: {
        type: 'array',
        description:
          'Secrets required to run the benchmark with (environment variable name will be mapped to the your user secret by name). If any of these secrets are not provided or the mapping is incorrect, the benchmark will fail to start.',
        items: {
          type: 'string',
        },
      },
      scenario_ids: {
        type: 'array',
        description: 'The Scenario IDs that make up the Benchmark.',
        items: {
          type: 'string',
        },
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'name'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.benchmarks.update(id, body)));
};

export default { metadata, tool, handler };
