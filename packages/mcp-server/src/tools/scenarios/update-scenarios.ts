// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'scenarios',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/scenarios/{id}',
  operationId: 'updateScenario',
};

export const tool: Tool = {
  name: 'update_scenarios',
  description:
    'Update a Scenario, a repeatable AI coding evaluation test that defines the starting environment as well as evaluation success criteria. Only provided fields will be updated.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      environment_parameters: {
        $ref: '#/$defs/scenario_environment',
      },
      input_context: {
        $ref: '#/$defs/input_context_update',
      },
      metadata: {
        type: 'object',
        description: 'User defined metadata to attach to the scenario for organization.',
        additionalProperties: true,
      },
      name: {
        type: 'string',
        description: 'Name of the scenario.',
      },
      reference_output: {
        type: 'string',
        description:
          'A string representation of the reference output to solve the scenario. Commonly can be the result of a git diff or a sequence of command actions to apply to the environment.',
      },
      required_environment_variables: {
        type: 'array',
        description: 'Environment variables required to run the scenario.',
        items: {
          type: 'string',
        },
      },
      required_secret_names: {
        type: 'array',
        description: 'Secrets required to run the scenario.',
        items: {
          type: 'string',
        },
      },
      scoring_contract: {
        $ref: '#/$defs/scoring_contract_update',
      },
      validation_type: {
        type: 'string',
        description: 'Validation strategy.',
        enum: ['FORWARD', 'REVERSE', 'EVALUATION'],
      },
    },
    required: ['id'],
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
      input_context_update: {
        type: 'object',
        properties: {
          additional_context: {
            type: 'object',
            description: 'Additional JSON structured input context.',
            additionalProperties: true,
          },
          problem_statement: {
            type: 'string',
            description: 'The problem statement for the Scenario.',
          },
        },
      },
      scoring_contract_update: {
        type: 'object',
        properties: {
          scoring_function_parameters: {
            type: 'array',
            description: 'A list of scoring functions used to evaluate the Scenario.',
            items: {
              $ref: '#/$defs/scoring_function',
            },
          },
        },
      },
      scoring_function: {
        type: 'object',
        description: 'ScoringFunction specifies a method of scoring a Scenario.',
        properties: {
          name: {
            type: 'string',
            description: 'Name of scoring function. Names must only contain [a-zA-Z0-9_-].',
          },
          scorer: {
            anyOf: [
              {
                type: 'object',
                description: 'AstGrepScoringFunction utilizes structured coach search for scoring.',
                properties: {
                  pattern: {
                    type: 'string',
                    description:
                      'AST pattern to match. Pattern will be passed to ast-grep using the commandline surround by double quotes ("), so make sure to use proper escaping (for example, \\$\\$\\$).',
                  },
                  search_directory: {
                    type: 'string',
                    description: 'The path to search.',
                  },
                  type: {
                    type: 'string',
                    enum: ['ast_grep_scorer'],
                  },
                  lang: {
                    type: 'string',
                    description: 'The language of the pattern.',
                  },
                },
                required: ['pattern', 'search_directory', 'type'],
              },
              {
                type: 'object',
                description:
                  'BashScriptScoringFunction is a scoring function specified by a bash script that will be run in the context of your environment.',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['bash_script_scorer'],
                  },
                  bash_script: {
                    type: 'string',
                    description:
                      'A single bash script that sets up the environment, scores, and prints the final score to standard out. Score should be a float between 0.0 and 1.0, and look like "score=[0.0..1.0].',
                  },
                },
                required: ['type'],
              },
              {
                type: 'object',
                description:
                  'CommandScoringFunction executes a single command and checks the result.The output of the command will be printed. Scoring will passed if the command returns status code 0, otherwise it will be failed.',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['command_scorer'],
                  },
                  command: {
                    type: 'string',
                    description: 'The command to execute.',
                  },
                },
                required: ['type'],
              },
              {
                type: 'object',
                description: 'CustomScoringFunction is a custom, user defined scoring function.',
                properties: {
                  custom_scorer_type: {
                    type: 'string',
                    description: 'Type of the scoring function, previously registered with Runloop.',
                  },
                  type: {
                    type: 'string',
                    enum: ['custom_scorer'],
                  },
                  scorer_params: {
                    type: 'object',
                    description: 'Additional JSON structured context to pass to the scoring function.',
                    additionalProperties: true,
                  },
                },
                required: ['custom_scorer_type', 'type'],
              },
              {
                type: 'object',
                description:
                  'PythonScriptScoringFunction will run a python script in the context of your environment as a ScoringFunction.',
                properties: {
                  python_script: {
                    type: 'string',
                    description:
                      'Python script to be run. The script should output the score to standard out as a float between 0.0 and 1.0.',
                  },
                  type: {
                    type: 'string',
                    enum: ['python_script_scorer'],
                  },
                  python_version_constraint: {
                    type: 'string',
                    description: 'Python version  to run scoring. Default is "==3.12.10"',
                  },
                  requirements_contents: {
                    type: 'string',
                    description:
                      'Package dependencies to be installed. The requirements should be a valid requirements.txt file.',
                  },
                },
                required: ['python_script', 'type'],
              },
              {
                type: 'object',
                description:
                  'TestBasedScoringFunction writes test files to disk and executes a test command to verify the solution.',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['test_based_scorer'],
                  },
                  test_command: {
                    type: 'string',
                    description: 'The command to execute for running the tests',
                  },
                  test_files: {
                    type: 'array',
                    description: 'List of test files to create',
                    items: {
                      type: 'object',
                      properties: {
                        file_contents: {
                          type: 'string',
                          description: 'Content of the test file',
                        },
                        file_path: {
                          type: 'string',
                          description:
                            "Path to write content of the test file, relative to your environment's working directory",
                        },
                      },
                    },
                  },
                },
                required: ['type'],
              },
            ],
            description:
              'The scoring function to use for evaluating this scenario. The type field determines which built-in function to use.',
          },
          weight: {
            type: 'number',
            description:
              'Weight to apply to scoring function score. Weights of all scoring functions should sum to 1.0.',
          },
        },
        required: ['name', 'scorer', 'weight'],
      },
    },
  },
  annotations: {},
};

export const handler = async (client: Runloop, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.scenarios.update(id, body));
};

export default { metadata, tool, handler };
