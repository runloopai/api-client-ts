import * as Core from '../../core';
import { Devboxes } from './devboxes';
import { createTool } from '../../lib/tools';
import { z } from 'zod';

/**
 * Tools for interacting with a a single devbox via an agent.
 */
export class DevboxTools {
  constructor(private devboxes: Devboxes) {}

  /**
   * Get all file-related tools
   */
  fileTools(devboxId: string, options?: Core.RequestOptions) {
    const tools = [
      createTool({
        name: 'read_file',
        description: 'Read contents of a file on the devbox',
        parameters: z.object({
          file_path: z.string().describe('The path of the file to read relative to the user home directory'),
        }),
        execute: async (params) => {
          return this.devboxes.readFileContents(
            devboxId,
            {
              file_path: params.file_path,
            },
            options,
          );
        },
      }),
      createTool({
        name: 'write_file',
        description: 'Write contents to a file on the devbox',
        parameters: z.object({
          file_path: z.string().describe('The path of the file to write relative to the user home directory'),
          contents: z.string().describe('The contents to write to the file'),
        }),
        execute: async (params) => {
          try {
            await this.devboxes.writeFile(
              devboxId,
              {
                file_path: params.file_path,
                contents: params.contents,
              },
              options,
            );
            return 'File written successfully';
          } catch (error) {
            return `Failed to write file: ${error}`;
          }
        },
      }),
    ];

    return tools;
  }

  /**
   * Get all shell-related tools
   */
  shellTools(devboxId: string, options?: Core.RequestOptions) {
    const tools = [
      createTool({
        name: 'execute_command',
        description: 'Execute a shell command on the devbox',
        parameters: z.object({
          command: z.string().describe('The shell command to execute'),
        }),
        execute: async (params) => {
          try {
            const result = await this.devboxes.executeSync(
              devboxId,
              {
                command: params.command,
              },
              options,
            );
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Failed to execute command: ${error}`;
          }
        },
      }),
      createTool({
        name: 'execute_command_async',
        description: 'Execute a shell command asynchronously on the devbox',
        parameters: z.object({
          command: z.string().describe('The shell command to execute asynchronously'),
        }),
        execute: async (params) => {
          try {
            const result = await this.devboxes.executeAsync(
              devboxId,
              {
                command: params.command,
              },
              options,
            );
            return `Async command execution started with ID: ${result.execution_id}`;
          } catch (error) {
            return `Failed to execute async command: ${error}`;
          }
        },
      }),
      createTool({
        name: 'retrieve_async_command_status',
        description: 'Retrieve the status and output of an asynchronous command execution',
        parameters: z.object({
          execution_id: z.string().describe('The ID of the async execution to retrieve'),
        }),
        execute: async (params) => {
          try {
            const result = await this.devboxes.executions.retrieve(devboxId, params.execution_id, options);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Failed to retrieve async command execution: ${error}`;
          }
        },
      }),
    ];

    return tools;
  }

  /**
   * Get tools for managing tunnels on the devbox
   */
  tunnelTools(devboxId: string, options?: Core.RequestOptions) {
    const tools = [
      createTool({
        name: 'create_tunnel',
        description: 'Create a new tunnel to expose a port on the devbox',
        parameters: z.object({
          port: z.number().describe('The port number to tunnel'),
          protocol: z.enum(['http', 'https', 'tcp']).describe('The protocol to use for the tunnel'),
        }),
        execute: async (params) => {
          try {
            const result = await this.devboxes.createTunnel(
              devboxId,
              {
                port: params.port,
              },
              options,
            );
            return `Created tunnel: ${JSON.stringify(result, null, 2)}`;
          } catch (error) {
            return `Failed to create tunnel: ${error}`;
          }
        },
      }),
    ];

    return tools;
  }
}
