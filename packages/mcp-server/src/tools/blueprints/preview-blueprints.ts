// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from '@runloop/api-client-mcp/filtering';
import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'blueprints',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/blueprints/preview',
  operationId: 'previewImage',
};

export const tool: Tool = {
  name: 'preview_blueprints',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nPreview building a Blueprint with the specified configuration. You can take the resulting Dockerfile and test out your build using any local docker tooling.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/blueprint_preview_view',\n  $defs: {\n    blueprint_preview_view: {\n      type: 'object',\n      properties: {\n        dockerfile: {\n          type: 'string',\n          description: 'The Dockerfile contents that will built.'\n        }\n      },\n      required: [        'dockerfile'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the Blueprint.',
      },
      base_blueprint_id: {
        type: 'string',
        description: '(Optional) ID of previously built blueprint to use as a base blueprint for this build.',
      },
      base_blueprint_name: {
        type: 'string',
        description:
          '(Optional) Name of previously built blueprint to use as a base blueprint for this build. When set, this will load the latest successfully built Blueprint with the given name. Only one of (base_blueprint_id, base_blueprint_name) should be specified.',
      },
      code_mounts: {
        type: 'array',
        description: 'A list of code mounts to be included in the Blueprint.',
        items: {
          $ref: '#/$defs/code_mount_parameters',
        },
      },
      dockerfile: {
        type: 'string',
        description: 'Dockerfile contents to be used to build the Blueprint.',
      },
      file_mounts: {
        type: 'object',
        description: '(Optional) Map of paths and file contents to write before setup.',
        additionalProperties: true,
      },
      launch_parameters: {
        $ref: '#/$defs/launch_parameters',
      },
      metadata: {
        type: 'object',
        description: '(Optional) User defined metadata for the Blueprint.',
        additionalProperties: true,
      },
      services: {
        type: 'array',
        description:
          '(Optional) List of containerized services to include in the Blueprint. These services will be pre-pulled during the build phase for optimized startup performance.',
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'The image of the container service.',
            },
            name: {
              type: 'string',
              description: 'The name of the container service.',
            },
            credentials: {
              type: 'object',
              description: 'The credentials of the container service.',
              properties: {
                password: {
                  type: 'string',
                  description: 'The password of the container service.',
                },
                username: {
                  type: 'string',
                  description: 'The username of the container service.',
                },
              },
              required: ['password', 'username'],
            },
            env: {
              type: 'object',
              description: 'The environment variables of the container service.',
              additionalProperties: true,
            },
            options: {
              type: 'string',
              description: 'Additional Docker container create options.',
            },
            port_mappings: {
              type: 'array',
              description:
                'The port mappings of the container service. Port mappings are in the format of <host_port>:<container_port>.',
              items: {
                type: 'string',
              },
            },
          },
          required: ['image', 'name'],
        },
      },
      system_setup_commands: {
        type: 'array',
        description: 'A list of commands to run to set up your system.',
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
    required: ['name'],
    $defs: {
      code_mount_parameters: {
        type: 'object',
        properties: {
          repo_name: {
            type: 'string',
            description:
              'The name of the repo to mount. By default, code will be mounted at /home/user/{repo_name}s.',
          },
          repo_owner: {
            type: 'string',
            description: 'The owner of the repo.',
          },
          token: {
            type: 'string',
            description: 'The authentication token necessary to pull repo.',
          },
          install_command: {
            type: 'string',
            description: 'Installation command to install and setup repository.',
          },
        },
        required: ['repo_name', 'repo_owner'],
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
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.blueprints.preview(body)));
};

export default { metadata, tool, handler };
