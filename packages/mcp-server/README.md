# Runloop Node MCP Server

It is generated with [Stainless](https://www.stainless.com/).

## Installation

### Direct invocation

You can run the MCP Server directly via `npx`:

```sh
export RUNLOOP_API_KEY="My Bearer Token"
npx -y @runloop/api-client-mcp@latest
```

### Via MCP Client

There is a partial list of existing clients at [modelcontextprotocol.io](https://modelcontextprotocol.io/clients). If you already
have a client, consult their documentation to install the MCP server.

For clients with a configuration JSON, it might look something like this:

```json
{
  "mcpServers": {
    "runloop_api_client_api": {
      "command": "npx",
      "args": ["-y", "@runloop/api-client-mcp", "--client=claude", "--tools=dynamic"],
      "env": {
        "RUNLOOP_API_KEY": "My Bearer Token"
      }
    }
  }
}
```

## Exposing endpoints to your MCP Client

There are two ways to expose endpoints as tools in the MCP server:

1. Exposing one tool per endpoint, and filtering as necessary
2. Exposing a set of tools to dynamically discover and invoke endpoints from the API

### Filtering endpoints and tools

You can run the package on the command line to discover and filter the set of tools that are exposed by the
MCP Server. This can be helpful for large APIs where including all endpoints at once is too much for your AI's
context window.

You can filter by multiple aspects:

- `--tool` includes a specific tool by name
- `--resource` includes all tools under a specific resource, and can have wildcards, e.g. `my.resource*`
- `--operation` includes just read (get/list) or just write operations

### Dynamic tools

If you specify `--tools=dynamic` to the MCP server, instead of exposing one tool per endpoint in the API, it will
expose the following tools:

1. `list_api_endpoints` - Discovers available endpoints, with optional filtering by search query
2. `get_api_endpoint_schema` - Gets detailed schema information for a specific endpoint
3. `invoke_api_endpoint` - Executes any endpoint with the appropriate parameters

This allows you to have the full set of API endpoints available to your MCP Client, while not requiring that all
of their schemas be loaded into context at once. Instead, the LLM will automatically use these tools together to
search for, look up, and invoke endpoints dynamically. However, due to the indirect nature of the schemas, it
can struggle to provide the correct properties a bit more than when tools are imported explicitly. Therefore,
you can opt-in to explicit tools, the dynamic tools, or both.

See more information with `--help`.

All of these command-line options can be repeated, combined together, and have corresponding exclusion versions (e.g. `--no-tool`).

Use `--list` to see the list of available tools, or see below.

### Specifying the MCP Client

Different clients have varying abilities to handle arbitrary tools and schemas.

You can specify the client you are using with the `--client` argument, and the MCP server will automatically
serve tools and schemas that are more compatible with that client.

- `--client=<type>`: Set all capabilities based on a known MCP client

  - Valid values: `openai-agents`, `claude`, `claude-code`, `cursor`
  - Example: `--client=cursor`

Additionally, if you have a client not on the above list, or the client has gotten better
over time, you can manually enable or disable certain capabilities:

- `--capability=<name>`: Specify individual client capabilities
  - Available capabilities:
    - `top-level-unions`: Enable support for top-level unions in tool schemas
    - `valid-json`: Enable JSON string parsing for arguments
    - `refs`: Enable support for $ref pointers in schemas
    - `unions`: Enable support for union types (anyOf) in schemas
    - `formats`: Enable support for format validations in schemas (e.g. date-time, email)
    - `tool-name-length=N`: Set maximum tool name length to N characters
  - Example: `--capability=top-level-unions --capability=tool-name-length=40`
  - Example: `--capability=top-level-unions,tool-name-length=40`

### Examples

1. Filter for read operations on cards:

```bash
--resource=cards --operation=read
```

2. Exclude specific tools while including others:

```bash
--resource=cards --no-tool=create_cards
```

3. Configure for Cursor client with custom max tool name length:

```bash
--client=cursor --capability=tool-name-length=40
```

4. Complex filtering with multiple criteria:

```bash
--resource=cards,accounts --operation=read --tag=kyc --no-tool=create_cards
```

## Running remotely

Launching the client with `--transport=http` launches the server as a remote server using Streamable HTTP transport. The `--port` setting can choose the port it will run on, and the `--socket` setting allows it to run on a Unix socket.

Authorization can be provided via the `Authorization` header using the Bearer scheme.

Additionally, authorization can be provided via the following headers:
| Header | Equivalent client option | Security scheme |
| ------------------- | ------------------------ | --------------- |
| `x-runloop-api-key` | `bearerToken` | bearerAuth |

A configuration JSON for this server might look like this, assuming the server is hosted at `http://localhost:3000`:

```json
{
  "mcpServers": {
    "runloop_api_client_api": {
      "url": "http://localhost:3000",
      "headers": {
        "Authorization": "Bearer <auth value>"
      }
    }
  }
}
```

The command-line arguments for filtering tools and specifying clients can also be used as query parameters in the URL.
For example, to exclude specific tools while including others, use the URL:

```
http://localhost:3000?resource=cards&resource=accounts&no_tool=create_cards
```

Or, to configure for the Cursor client, with a custom max tool name length, use the URL:

```
http://localhost:3000?client=cursor&capability=tool-name-length%3D40
```

## Importing the tools and server individually

```js
// Import the server, generated endpoints, or the init function
import { server, endpoints, init } from "@runloop/api-client-mcp/server";

// import a specific tool
import createBenchmarks from "@runloop/api-client-mcp/tools/benchmarks/create-benchmarks";

// initialize the server and all endpoints
init({ server, endpoints });

// manually start server
const transport = new StdioServerTransport();
await server.connect(transport);

// or initialize your own server with specific tools
const myServer = new McpServer(...);

// define your own endpoint
const myCustomEndpoint = {
  tool: {
    name: 'my_custom_tool',
    description: 'My custom tool',
    inputSchema: zodToJsonSchema(z.object({ a_property: z.string() })),
  },
  handler: async (client: client, args: any) => {
    return { myResponse: 'Hello world!' };
  })
};

// initialize the server with your custom endpoints
init({ server: myServer, endpoints: [createBenchmarks, myCustomEndpoint] });
```

## Available Tools

The following tools are available in this MCP server.

### Resource `benchmarks`:

- `create_benchmarks` (`write`): Create a Benchmark with a set of Scenarios.
- `retrieve_benchmarks` (`read`): Get a previously created Benchmark.
- `update_benchmarks` (`write`): Update a Benchmark with a set of Scenarios.
- `list_benchmarks` (`read`): List all Benchmarks matching filter.
- `definitions_benchmarks` (`read`): Get scenario definitions for a previously created Benchmark.
- `list_public_benchmarks` (`read`): List all public benchmarks matching filter.
- `start_run_benchmarks` (`write`): Start a new BenchmarkRun based on the provided Benchmark.

### Resource `benchmarks.runs`:

- `retrieve_benchmarks_runs` (`read`): Get a BenchmarkRun given ID.
- `list_benchmarks_runs` (`read`): List all BenchmarkRuns matching filter.
- `cancel_benchmarks_runs` (`write`): Cancel a currently running Benchmark run.
- `complete_benchmarks_runs` (`write`): Complete a currently running BenchmarkRun.
- `list_scenario_runs_benchmarks_runs` (`read`): List started scenario runs for a benchmark run.

### Resource `blueprints`:

- `create_blueprints` (`write`): Starts build of custom defined container Blueprint. The Blueprint will begin in the 'provisioning' step and transition to the 'building' step once it is selected off the build queue., Upon build complete it will transition to 'building_complete' if the build is successful.
- `retrieve_blueprints` (`read`): Get the details of a previously created Blueprint including the build status.
- `list_blueprints` (`read`): List all Blueprints or filter by name.
- `delete_blueprints` (`write`): Delete a previously created Blueprint.
- `list_public_blueprints` (`read`): List all public Blueprints that are available to all users.
- `logs_blueprints` (`read`): Get all logs from the building of a Blueprint.
- `preview_blueprints` (`write`): Preview building a Blueprint with the specified configuration. You can take the resulting Dockerfile and test out your build using any local docker tooling.

### Resource `devboxes`:

- `create_devboxes` (`write`): Create a Devbox and begin the boot process. The Devbox will initially launch in the 'provisioning' state while Runloop allocates the necessary infrastructure. It will transition to the 'initializing' state while the booted Devbox runs any Runloop or user defined set up scripts. Finally, the Devbox will transition to the 'running' state when it is ready for use.
- `retrieve_devboxes` (`read`): Get the latest details and status of a Devbox.
- `update_devboxes` (`write`): Updates a devbox by doing a complete update the existing name,metadata fields. It does not patch partial values.
- `list_devboxes` (`read`): List all Devboxes while optionally filtering by status.
- `create_ssh_key_devboxes` (`write`): Create an SSH key for a Devbox to enable remote access.
- `create_tunnel_devboxes` (`write`): Create a live tunnel to an available port on the Devbox.
- `delete_disk_snapshot_devboxes` (`write`): Delete a previously taken disk snapshot of a Devbox.
- `download_file_devboxes` (`write`): Download file contents of any type (binary, text, etc) from a specified path on the Devbox.
- `execute_devboxes` (`write`): Execute a command with a known command ID on a devbox, optimistically waiting for it to complete within the specified timeout. If it completes in time, return the result. If not, return a status indicating the command is still running.
- `execute_async_devboxes` (`write`): Execute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.
- `execute_sync_devboxes` (`write`): Execute a bash command in the Devbox shell, await the command completion and return the output.
- `keep_alive_devboxes` (`write`): Send a 'Keep Alive' signal to a running Devbox that is configured to shutdown on idle so the idle time resets.
- `list_disk_snapshots_devboxes` (`read`): List all snapshots of a Devbox while optionally filtering by Devbox ID and metadata.
- `read_file_contents_devboxes` (`write`): Read file contents from a file on a Devbox as a UTF-8. Note 'downloadFile' should be used for large files (greater than 100MB). Returns the file contents as a UTF-8 string.
- `remove_tunnel_devboxes` (`write`): Remove a previously opened tunnel on the Devbox.
- `resume_devboxes` (`write`): Resume a suspended Devbox with the disk state captured as suspend time. Note that any previously running processes or daemons will need to be restarted using the Devbox shell tools.
- `shutdown_devboxes` (`write`): Shutdown a running Devbox. This will permanently stop the Devbox. If you want to save the state of the Devbox, you should take a snapshot before shutting down or should suspend the Devbox instead of shutting down.
- `snapshot_disk_devboxes` (`write`): Create a disk snapshot of a devbox with the specified name and metadata to enable launching future Devboxes with the same disk state.
- `snapshot_disk_async_devboxes` (`write`): Start an asynchronous disk snapshot of a devbox with the specified name and metadata. The snapshot operation will continue in the background and can be monitored using the query endpoint.
- `suspend_devboxes` (`write`): Suspend a running Devbox and create a disk snapshot to enable resuming the Devbox later with the same disk. Note this will not snapshot memory state such as running processes.
- `upload_file_devboxes` (`write`): Upload file contents of any type (binary, text, etc) to a Devbox. Note this API is suitable for large files (larger than 100MB) and efficiently uploads files via multipart form data.
- `wait_for_command_devboxes` (`write`): Polls the asynchronous execution's status until it reaches one of the desired statuses or times out. Defaults to 60 seconds.
- `write_file_contents_devboxes` (`write`): Write UTF-8 string contents to a file at path on the Devbox. Note for large files (larger than 100MB), the upload_file endpoint must be used.

### Resource `devboxes.disk_snapshots`:

- `update_devboxes_disk_snapshots` (`write`): Updates disk snapshot metadata via update vs patch. The entire metadata will be replaced.
- `list_devboxes_disk_snapshots` (`read`): List all snapshots of a Devbox while optionally filtering by Devbox ID and metadata.
- `delete_devboxes_disk_snapshots` (`write`): Delete a previously taken disk snapshot of a Devbox.
- `query_status_devboxes_disk_snapshots` (`read`): Get the current status of an asynchronous disk snapshot operation, including whether it is still in progress and any error messages if it failed.

### Resource `devboxes.browsers`:

- `create_devboxes_browsers` (`write`): Create a Devbox that has a managed Browser and begin the boot process. As part of booting the Devbox, the browser will automatically be started with connection utilities activated.
- `retrieve_devboxes_browsers` (`read`): Get Browser Details.

### Resource `devboxes.computers`:

- `create_devboxes_computers` (`write`): Create a Computer and begin the boot process. The Computer will initially launch in the 'provisioning' state while Runloop allocates the necessary infrastructure. It will transition to the 'initializing' state while the booted Computer runs any Runloop or user defined set up scripts. Finally, the Computer will transition to the 'running' state when it is ready for use.
- `retrieve_devboxes_computers` (`read`): Get Computer Details.
- `keyboard_interaction_devboxes_computers` (`write`): Perform the specified keyboard interaction on the Computer identified by the given ID.
- `mouse_interaction_devboxes_computers` (`write`): Perform the specified mouse interaction on the Computer identified by the given ID.
- `screen_interaction_devboxes_computers` (`write`): Perform the specified screen interaction on the Computer identified by the given ID.

### Resource `devboxes.lsp`:

- `apply_code_action_devboxes_lsp` (`write`): Apply a code action to a given code segment not all code actions are supported yet
- `code_actions_devboxes_lsp` (`write`): Get code actions for a part of a document.
  This method calls the `getCodeActions` method of the `LanguageService` class, which in turn
  communicates with the TypeScript language server to retrieve code actions for a given document.
  https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_codeAction
- `diagnostics_devboxes_lsp` (`write`): Get diagnostics for a given file URI from the language server
- `document_symbols_devboxes_lsp` (`write`): Get document symbols for a given document.
- `file_devboxes_lsp` (`write`): Get the contents of a file at a given path relative to the root directory
- `file_definition_devboxes_lsp` (`write`): Get the definition of a symbol at a given position in a file
  https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_definition
- `files_devboxes_lsp` (`read`): Get a list of all files being watched by the language server
- `formatting_devboxes_lsp` (`write`): Get formatting changes for a given document.
  https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_formatting
- `get_code_actions_for_diagnostic_devboxes_lsp` (`write`): Get a list of code actions for a given diagnostic
- `get_code_segment_info_devboxes_lsp` (`write`): Get the symbol, reference, and diagnostic information for a given code segment in a file at a given depth
- `get_signature_help_devboxes_lsp` (`write`): Get the symbol, reference, and diagnostic information for a given code segment in a file at a given depth
- `health_devboxes_lsp` (`read`): This method provides a health check for the language server, including its status, uptime,
  the directory being watched, and the name of the module.
- `references_devboxes_lsp` (`write`): Get references for a given symbol. This method calls the `getReferences` method of the `LanguageService` class, which in turn
  communicates with the TypeScript language server to retrieve references for a given symbol
  in the document. https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_references
- `set_watch_directory_devboxes_lsp` (`write`): Set the watch directory for the language server to a new path and restart the server

### Resource `devboxes.logs`:

- `list_devboxes_logs` (`read`): Get all logs from a running or completed Devbox.

### Resource `devboxes.executions`:

- `retrieve_devboxes_executions` (`read`): Get the latest status of a previously launched asynchronous execuction including stdout/error and the exit code if complete.
- `execute_async_devboxes_executions` (`write`): Execute the given command in the Devbox shell asynchronously and returns the execution that can be used to track the command's progress.
- `execute_sync_devboxes_executions` (`write`): Execute a bash command in the Devbox shell, await the command completion and return the output.
- `kill_devboxes_executions` (`write`): Kill a previously launched asynchronous execution if it is still running by killing the launched process. Optionally kill the entire process group.
- `stream_stderr_updates_devboxes_executions` (`read`): Tails the stderr logs for the given execution with SSE streaming
- `stream_stdout_updates_devboxes_executions` (`read`): Tails the stdout logs for the given execution with SSE streaming

### Resource `scenarios`:

- `create_scenarios` (`write`): Create a Scenario, a repeatable AI coding evaluation test that defines the starting environment as well as evaluation success criteria.
- `retrieve_scenarios` (`read`): Get a previously created scenario.
- `update_scenarios` (`write`): Update a Scenario, a repeatable AI coding evaluation test that defines the starting environment as well as evaluation success criteria. Only provided fields will be updated.
- `list_scenarios` (`read`): List all Scenarios matching filter.
- `list_public_scenarios` (`read`): List all public scenarios matching filter.
- `start_run_scenarios` (`write`): Start a new ScenarioRun based on the provided Scenario.

### Resource `scenarios.runs`:

- `retrieve_scenarios_runs` (`read`): Get a ScenarioRun given ID.
- `list_scenarios_runs` (`read`): List all ScenarioRuns matching filter.
- `cancel_scenarios_runs` (`write`): Cancel a currently running Scenario run. This will shutdown the underlying Devbox resource.
- `complete_scenarios_runs` (`write`): Complete a currently running ScenarioRun. Calling complete will shutdown underlying Devbox resource.
- `download_logs_scenarios_runs` (`write`): Download a zip file containing all logs for a Scenario run from the associated devbox.
- `score_scenarios_runs` (`write`): Score a currently running ScenarioRun.

### Resource `scenarios.scorers`:

- `create_scenarios_scorers` (`write`): Create a custom scenario scorer.
- `retrieve_scenarios_scorers` (`read`): Retrieve Scenario Scorer.
- `update_scenarios_scorers` (`write`): Update a scenario scorer.
- `list_scenarios_scorers` (`read`): List all Scenario Scorers matching filter.
- `validate_scenarios_scorers` (`write`): Validate a scenario scorer.

### Resource `objects`:

- `create_objects` (`write`): Create a new Object with content and metadata. The Object will be assigned a unique ID.
- `retrieve_objects` (`read`): Retrieve a specific Object by its unique identifier.
- `list_objects` (`read`): List all Objects for the authenticated account with pagination support.
- `delete_objects` (`write`): Delete an existing Object by ID. This action is irreversible and will remove the Object and all its metadata.
- `complete_objects` (`write`): Mark an Object's upload as complete, transitioning it from UPLOADING to READ-only state.
- `download_objects` (`read`): Generate a presigned download URL for an Object. The URL will be valid for the specified duration.
- `list_public_objects` (`read`): List all public Objects with pagination support.

### Resource `repositories`:

- `create_repositories` (`write`): Create a connection to a Github Repository and trigger an initial inspection of the repo's technical stack and developer environment requirements.
- `retrieve_repositories` (`read`): Get Repository Connection details including latest inspection status and generated repository insights.
- `list_repositories` (`read`): List all available repository connections.
- `delete_repositories` (`write`): Permanently Delete a Repository Connection including any automatically generated inspection insights.
- `list_inspections_repositories` (`read`): List all inspections of a repository connection including automatically generated insights for each inspection.
- `refresh_repositories` (`write`): Refresh a repository connection by inspecting the latest version including repo's technical stack and developer environment requirements.

### Resource `secrets`:

- `create_secrets` (`write`): Create a new Secret with a globally unique name and value. The Secret will be encrypted at rest and made available as an environment variable in Devboxes.
- `update_secrets` (`write`): Update the value of an existing Secret by name. The new value will be encrypted at rest.
- `list_secrets` (`read`): List all Secrets for the authenticated account. Secret values are not included for security reasons.
- `delete_secrets` (`write`): Delete an existing Secret by name. This action is irreversible and will remove the Secret from all Devboxes.
