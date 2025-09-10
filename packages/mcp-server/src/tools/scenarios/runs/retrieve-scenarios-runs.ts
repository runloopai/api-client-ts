// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios.runs',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/scenarios/runs/{id}',
  operationId: 'getScenarioRun',
};

export const tool: Tool = {
  name: 'retrieve_scenarios_runs',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nGet a ScenarioRun given ID.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/scenario_run_view',\n  $defs: {\n    scenario_run_view: {\n      type: 'object',\n      description: 'A ScenarioRunView represents a single run of a Scenario on a Devbox. When completed, the ScenarioRun will contain the final score and output of the run.',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'ID of the ScenarioRun.'\n        },\n        devbox_id: {\n          type: 'string',\n          description: 'ID of the Devbox on which the Scenario is running.'\n        },\n        metadata: {\n          type: 'object',\n          description: 'User defined metadata to attach to the scenario run for organization.',\n          additionalProperties: true\n        },\n        scenario_id: {\n          type: 'string',\n          description: 'ID of the Scenario that has been run.'\n        },\n        state: {\n          type: 'string',\n          description: 'The state of the ScenarioRun.',\n          enum: [            'running',\n            'scoring',\n            'scored',\n            'completed',\n            'canceled',\n            'timeout',\n            'failed'\n          ]\n        },\n        benchmark_run_id: {\n          type: 'string',\n          description: 'ID of the BenchmarkRun that this Scenario is associated with, if any.'\n        },\n        duration_ms: {\n          type: 'integer',\n          description: 'Duration scenario took to run.'\n        },\n        environment_variables: {\n          type: 'object',\n          description: 'Environment variables used to run the scenario.',\n          additionalProperties: true\n        },\n        name: {\n          type: 'string',\n          description: 'Optional name of ScenarioRun.'\n        },\n        purpose: {\n          type: 'string',\n          description: 'Purpose of the ScenarioRun.'\n        },\n        scoring_contract_result: {\n          $ref: '#/$defs/scoring_contract_result_view'\n        },\n        secrets_provided: {\n          type: 'object',\n          description: 'User secrets used to run the scenario.',\n          additionalProperties: true\n        },\n        start_time_ms: {\n          type: 'integer',\n          description: 'The time that the scenario started'\n        }\n      },\n      required: [        'id',\n        'devbox_id',\n        'metadata',\n        'scenario_id',\n        'state'\n      ]\n    },\n    scoring_contract_result_view: {\n      type: 'object',\n      description: 'A ScoringContractResultView represents the result of running all scoring functions on a given input context.',\n      properties: {\n        score: {\n          type: 'number',\n          description: 'Total score for all scoring contracts. This will be a value between 0 and 1.'\n        },\n        scoring_function_results: {\n          type: 'array',\n          description: 'List of all individual scoring function results.',\n          items: {\n            $ref: '#/$defs/scoring_function_result_view'\n          }\n        }\n      },\n      required: [        'score',\n        'scoring_function_results'\n      ]\n    },\n    scoring_function_result_view: {\n      type: 'object',\n      description: 'A ScoringFunctionResultView represents the result of running a single scoring function on a given input context.',\n      properties: {\n        output: {\n          type: 'string',\n          description: 'Log output of the scoring function.'\n        },\n        score: {\n          type: 'number',\n          description: 'Final score for the given scoring function.'\n        },\n        scoring_function_name: {\n          type: 'string',\n          description: 'Scoring function name that ran.'\n        },\n        state: {\n          type: 'string',\n          description: 'The state of the scoring function application.',\n          enum: [            'unknown',\n            'complete',\n            'error'\n          ]\n        }\n      },\n      required: [        'output',\n        'score',\n        'scoring_function_name',\n        'state'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.scenarios.runs.retrieve(id)));
};

export default { metadata, tool, handler };
