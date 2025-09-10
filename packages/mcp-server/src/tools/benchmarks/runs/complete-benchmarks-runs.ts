// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'benchmarks.runs',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/benchmarks/runs/{id}/complete',
  operationId: 'completeBenchmarkRun',
};

export const tool: Tool = {
  name: 'complete_benchmarks_runs',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nComplete a currently running BenchmarkRun.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/benchmark_run_view',\n  $defs: {\n    benchmark_run_view: {\n      type: 'object',\n      description: 'A BenchmarkRunView represents a run of a complete set of Scenarios, organized under a Benchmark.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'The ID of the BenchmarkRun.'\n        },\n        benchmark_id: {\n          type: 'string',\n          description: 'The ID of the Benchmark.'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata to attach to the benchmark run for organization.',\n          additionalProperties: true\n        },\n        start_time_ms: {\n          type: 'integer',\n          description: 'The time the benchmark run execution started (Unix timestamp milliseconds).'\n        },\n        state: {\n          type: 'string',\n          description: 'The state of the BenchmarkRun.',\n          enum: [            'running',\n            'canceled',\n            'completed'\n          ]\n        },\n        duration_ms: {\n          type: 'integer',\n          description: 'The duration for the BenchmarkRun to complete.'\n        },\n        environment_variables: {\n          type: 'object',\n          description: 'Environment variables used to run the benchmark.',\n          additionalProperties: true\n        },\n        name: {\n          type: 'string',\n          description: 'The name of the BenchmarkRun.'\n        },\n        purpose: {\n          type: 'string',\n          description: 'Purpose of the run.'\n        },\n        score: {\n          type: 'number',\n          description: 'The final score across the BenchmarkRun, present once completed. Calculated as sum of scenario scores / number of scenario runs.'\n        },\n        secrets_provided: {\n          type: 'object',\n          description: 'User secrets used to run the benchmark. Example: {\"DB_PASS\": \"DATABASE_PASSWORD\"} would set the environment variable \\'DB_PASS\\' on all scenario devboxes to the value of the secret \\'DATABASE_PASSWORD\\'.',\n          additionalProperties: true\n        }\n      },\n      required: [        'id',\n        'benchmark_id',\n        'metadata',\n        'start_time_ms',\n        'state'\n      ]\n    }\n  }\n}\n```",
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
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.benchmarks.runs.complete(id)));
};

export default { metadata, tool, handler };
