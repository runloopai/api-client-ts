// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'benchmarks',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/benchmarks/{id}',
  operationId: 'getBenchmark',
};

export const tool: Tool = {
  name: 'retrieve_benchmarks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet a previously created Benchmark.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/benchmark_view',\n  $defs: {\n    benchmark_view: {\n      type: 'object',\n      description: 'A BenchmarkDefinitionView represents a grouped set of Scenarios that together form a Benchmark.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the Benchmark.'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata to attach to the benchmark for organization.',\n          additionalProperties: true\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the Benchmark.'\n        },\n        scenarioIds: {\n          type: 'array',\n          description: 'List of Scenario IDs that make up the benchmark.',\n          items: {\n            type: 'string'\n          }\n        },\n        attribution: {\n          type: 'string',\n          description: 'Attribution information for the benchmark.'\n        },\n        description: {\n          type: 'string',\n          description: 'Detailed description of the benchmark.'\n        },\n        is_public: {\n          type: 'boolean',\n          description: 'Whether this benchmark is public.'\n        },\n        required_environment_variables: {\n          type: 'array',\n          description: 'Required environment variables used to run the benchmark. If any required environment variables are missing, the benchmark will fail to start.',\n          items: {\n            type: 'string'\n          }\n        },\n        required_secret_names: {\n          type: 'array',\n          description: 'Required secrets used to run the benchmark. If any required secrets are missing, the benchmark will fail to start.',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'id',\n        'metadata',\n        'name',\n        'scenarioIds'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.benchmarks.retrieve(id)));
};

export default { metadata, tool, handler };
