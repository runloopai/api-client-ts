// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios.scorers',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/scenarios/scorers/{id}',
  operationId: 'retrieveScenarioScorers',
};

export const tool: Tool = {
  name: 'retrieve_scenarios_scorers',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve Scenario Scorer.\n\n# Response Schema\n```json\n{\n  type: 'object',\n  description: 'A ScenarioScorerView represents a custom scoring function for a Scenario.',\n  properties: {\n    id: {\n      type: 'string',\n      description: 'ID for the scenario scorer.'\n    },\n    bash_script: {\n      type: 'string',\n      description: 'Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.'\n    },\n    type: {\n      type: 'string',\n      description: 'Name of the type of scenario scorer.'\n    }\n  },\n  required: [    'id',\n    'bash_script',\n    'type'\n  ]\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.scenarios.scorers.retrieve(id)));
};

export default { metadata, tool, handler };
