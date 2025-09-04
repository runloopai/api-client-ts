// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from '@runloop/api-client-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Runloop from '@runloop/api-client';

export const metadata: Metadata = {
  resource: 'devboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/devboxes',
  operationId: 'createDevbox',
};

export const tool: Tool = {
  name: 'create_devboxes',
  description:
    "Create a Devbox and begin the boot process. The Devbox will initially launch in the 'provisioning' state while Runloop allocates the necessary infrastructure. It will transition to the 'initializing' state while the booted Devbox runs any Runloop or user defined set up scripts. Finally, the Devbox will transition to the 'running' state when it is ready for use.",
  inputSchema: {
    type: 'object',
    properties: {
      blueprint_id: {
        type: 'string',
        description:
          'Blueprint ID to use for the Devbox. If none set, the Devbox will be created with the default Runloop Devbox image. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.',
      },
      blueprint_name: {
        type: 'string',
        description:
          'Name of Blueprint to use for the Devbox. When set, this will load the latest successfully built Blueprint with the given name. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.',
      },
      code_mounts: {
        type: 'array',
        description: 'A list of code mounts to be included in the Devbox.',
        items: {
          $ref: '#/$defs/code_mount_parameters',
        },
      },
      entrypoint: {
        type: 'string',
        description:
          '(Optional) When specified, the Devbox will run this script as its main executable. The devbox lifecycle will be bound to entrypoint, shutting down when the process is complete.',
      },
      environment_variables: {
        type: 'object',
        description: '(Optional) Environment variables used to configure your Devbox.',
        additionalProperties: true,
      },
      file_mounts: {
        type: 'object',
        description: '(Optional) Map of paths and file contents to write before setup..',
        additionalProperties: true,
      },
      launch_parameters: {
        $ref: '#/$defs/launch_parameters',
      },
      metadata: {
        type: 'object',
        description: 'User defined metadata to attach to the devbox for organization.',
        additionalProperties: true,
      },
      name: {
        type: 'string',
        description: '(Optional) A user specified name to give the Devbox.',
      },
      repo_connection_id: {
        type: 'string',
        description: 'Repository connection id the devbox should source its base image from.',
      },
      secrets: {
        type: 'object',
        description:
          '(Optional) Map of environment variable names to secret names. The secret values will be securely injected as environment variables in the Devbox. Example: {"DB_PASS": "DATABASE_PASSWORD"} sets environment variable \'DB_PASS\' to the value of secret \'DATABASE_PASSWORD\'.',
        additionalProperties: true,
      },
      snapshot_id: {
        type: 'string',
        description:
          'Snapshot ID to use for the Devbox. Only one of (Snapshot ID, Blueprint ID, Blueprint name) should be specified.',
      },
    },
    required: [],
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
  const body = args as any;
  return asTextContentResult(await client.devboxes.create(body));
};

export default { metadata, tool, handler };
