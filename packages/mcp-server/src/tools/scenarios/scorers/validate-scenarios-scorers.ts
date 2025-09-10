// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios.scorers',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/scenarios/scorers/{id}/validate',
  operationId: 'validateCustomScorer',
};

export const tool: Tool = {
  name: 'validate_scenarios_scorers',
  description: 'Validate a scenario scorer.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      scoring_context: {
        type: 'object',
        description: 'Json context that gets passed to the custom scorer',
        additionalProperties: true,
      },
      environment_parameters: {
        $ref: '#/$defs/scenario_environment',
      },
    },
    required: ['id', 'scoring_context'],
    $defs: {
      scenario_environment: {
        type: 'object',
        description: 'ScenarioEnvironmentParameters specify the environment in which a Scenario will be run.',
        properties: {
          blueprint_id: {
            type: 'string',
            description: 'Use the blueprint with matching ID.',
          },
          launch_parameters: {
            $ref: '#/$defs/launch_parameters',
          },
          snapshot_id: {
            type: 'string',
            description: 'Use the snapshot with matching ID.',
          },
          working_directory: {
            type: 'string',
            description:
              'The working directory where the agent is expected to fulfill the scenario. Scoring functions also run from the working directory.',
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
  const { id, ...body } = args as any;
  return asTextContentResult(await client.scenarios.scorers.validate(id, body));
};

export default { metadata, tool, handler };
