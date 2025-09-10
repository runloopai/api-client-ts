// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'benchmarks',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/benchmarks/{id}/definitions',
  operationId: 'getBenchmarkScenarioDefinitions',
};

export const tool: Tool = {
  name: 'definitions_benchmarks',
  description: 'Get scenario definitions for a previously created Benchmark.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      limit: {
        type: 'integer',
        description: 'The limit of items to return. Default is 20.',
      },
      starting_after: {
        type: 'string',
        description: 'Load the next page of data starting after the item with the given ID.',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.benchmarks.definitions(id, body));
};

export default { metadata, tool, handler };
