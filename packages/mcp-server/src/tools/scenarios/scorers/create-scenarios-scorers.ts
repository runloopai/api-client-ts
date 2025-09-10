// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios.scorers',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/scenarios/scorers',
  operationId: 'createCustomScorer',
};

export const tool: Tool = {
  name: 'create_scenarios_scorers',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a custom scenario scorer.\n\n# Response Schema\n```json\n{\n  type: 'object',\n  description: 'A ScenarioScorerView represents a custom scoring function for a Scenario.',\n  properties: {\n    id: {\n      type: 'string',\n      description: 'ID for the scenario scorer.'\n    },\n    bash_script: {\n      type: 'string',\n      description: 'Bash script that takes in $RL_TEST_CONTEXT as env variable and runs scoring.'\n    },\n    type: {\n      type: 'string',\n      description: 'Name of the type of scenario scorer.'\n    }\n  },\n  required: [    'id',\n    'bash_script',\n    'type'\n  ]\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      bash_script: {
        type: 'string',
        description: 'Bash script for the custom scorer taking context as a json object $RL_SCORER_CONTEXT.',
      },
      type: {
        type: 'string',
        description: 'Name of the type of custom scorer.',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['bash_script', 'type'],
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.scenarios.scorers.create(body)));
};

export default { metadata, tool, handler };
