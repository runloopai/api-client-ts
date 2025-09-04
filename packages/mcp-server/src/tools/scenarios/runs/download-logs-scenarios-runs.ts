// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asBinaryContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios.runs',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/scenarios/runs/{id}/download_logs',
  operationId: 'downloadScenarioRunLogs',
};

export const tool: Tool = {
  name: 'download_logs_scenarios_runs',
  description: 'Download a zip file containing all logs for a Scenario run from the associated devbox.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asBinaryContentResult(await client.scenarios.runs.downloadLogs(id));
};

export default { metadata, tool, handler };
