# Shared

Types:

- <code><a href="./src/resources/shared.ts">FunctionInvocationExecutionDetailView</a></code>
- <code><a href="./src/resources/shared.ts">ProjectLogsView</a></code>

# Account

Types:

- <code><a href="./src/resources/account.ts">ResourceSize</a></code>

# Blueprints

Types:

- <code><a href="./src/resources/blueprints.ts">BlueprintBuildLog</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintBuildLogsListView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintBuildParameters</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintListView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintPreviewView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintView</a></code>

Methods:

- <code title="post /v1/blueprints">client.blueprints.<a href="./src/resources/blueprints.ts">create</a>({ ...params }) -> BlueprintView</code>
- <code title="get /v1/blueprints/{id}">client.blueprints.<a href="./src/resources/blueprints.ts">retrieve</a>(id) -> BlueprintView</code>
- <code title="get /v1/blueprints">client.blueprints.<a href="./src/resources/blueprints.ts">list</a>({ ...params }) -> BlueprintListView</code>
- <code title="get /v1/blueprints/{id}/logs">client.blueprints.<a href="./src/resources/blueprints.ts">logs</a>(id) -> BlueprintBuildLogsListView</code>
- <code title="post /v1/blueprints/preview">client.blueprints.<a href="./src/resources/blueprints.ts">preview</a>({ ...params }) -> BlueprintPreviewView</code>

# Code

Types:

- <code><a href="./src/resources/code.ts">CodeMountParameters</a></code>

# Devboxes

Types:

- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxAsyncExecutionDetailView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxExecutionDetailView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxListView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxCreateSSHKeyResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxReadFileContentsResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxUploadFileResponse</a></code>

Methods:

- <code title="post /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">create</a>({ ...params }) -> DevboxView</code>
- <code title="get /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieve</a>(id) -> DevboxView</code>
- <code title="get /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">list</a>({ ...params }) -> DevboxListView</code>
- <code title="post /v1/devboxes/{id}/create_ssh_key">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createSSHKey</a>(id) -> DevboxCreateSSHKeyResponse</code>
- <code title="post /v1/devboxes/{id}/executions/execute_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/read_file_contents">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">readFileContents</a>(id, { ...params }) -> string</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/upload_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">uploadFile</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/write_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">writeFile</a>(id, { ...params }) -> DevboxExecutionDetailView</code>

## Logs

Types:

- <code><a href="./src/resources/devboxes/logs.ts">DevboxLogsListView</a></code>

Methods:

- <code title="get /v1/devboxes/{id}/logs">client.devboxes.logs.<a href="./src/resources/devboxes/logs.ts">list</a>(id) -> DevboxLogsListView</code>

## Executions

Methods:

- <code title="get /v1/devboxes/{id}/executions/{execution_id}">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">retrieve</a>(id, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/executions/{execution_id}/kill">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">kill</a>(id, executionId) -> DevboxAsyncExecutionDetailView</code>

# Functions

Types:

- <code><a href="./src/resources/functions/functions.ts">FunctionListView</a></code>

Methods:

- <code title="get /v1/functions">client.functions.<a href="./src/resources/functions/functions.ts">list</a>() -> FunctionListView</code>
- <code title="post /v1/functions/{project_name}/{function_name}/invoke_async">client.functions.<a href="./src/resources/functions/functions.ts">invokeAsync</a>(projectName, functionName, { ...params }) -> FunctionInvocationExecutionDetailView</code>
- <code title="post /v1/functions/{project_name}/{function_name}/invoke_sync">client.functions.<a href="./src/resources/functions/functions.ts">invokeSync</a>(projectName, functionName, { ...params }) -> FunctionInvocationExecutionDetailView</code>

## Invocations

Types:

- <code><a href="./src/resources/functions/invocations.ts">FunctionInvocationListView</a></code>
- <code><a href="./src/resources/functions/invocations.ts">KillOperationResponse</a></code>

Methods:

- <code title="get /v1/functions/invocations/{invocationId}">client.functions.invocations.<a href="./src/resources/functions/invocations.ts">retrieve</a>(invocationId) -> FunctionInvocationExecutionDetailView</code>
- <code title="get /v1/functions/invocations">client.functions.invocations.<a href="./src/resources/functions/invocations.ts">list</a>({ ...params }) -> FunctionInvocationListView</code>
- <code title="post /v1/functions/invocations/{invocationId}/kill">client.functions.invocations.<a href="./src/resources/functions/invocations.ts">kill</a>(invocationId) -> unknown</code>

# Projects

Types:

- <code><a href="./src/resources/projects/projects.ts">ProjectListView</a></code>

Methods:

- <code title="get /v1/projects">client.projects.<a href="./src/resources/projects/projects.ts">list</a>() -> ProjectListView</code>

## Logs

Methods:

- <code title="get /v1/projects/{id}/logs">client.projects.logs.<a href="./src/resources/projects/logs.ts">list</a>(id) -> ProjectLogsView</code>
