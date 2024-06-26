# Shared

Types:

- <code><a href="./src/resources/shared.ts">FunctionInvocationDetailView</a></code>
- <code><a href="./src/resources/shared.ts">ProjectLogsView</a></code>

# Devboxes

Types:

- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxExecutionDetailView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxListView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxView</a></code>

Methods:

- <code title="post /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">create</a>({ ...params }) -> DevboxView</code>
- <code title="get /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieve</a>(id) -> DevboxView</code>
- <code title="get /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">list</a>({ ...params }) -> DevboxListView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeSync</a>(id) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id) -> DevboxView</code>

## Logs

Types:

- <code><a href="./src/resources/devboxes/logs.ts">DevboxLogsListView</a></code>

Methods:

- <code title="get /v1/devboxes/{id}/logs">client.devboxes.logs.<a href="./src/resources/devboxes/logs.ts">list</a>(id) -> DevboxLogsListView</code>

# Functions

Types:

- <code><a href="./src/resources/functions/functions.ts">FunctionListView</a></code>

Methods:

- <code title="get /v1/functions">client.functions.<a href="./src/resources/functions/functions.ts">list</a>() -> FunctionListView</code>
- <code title="post /v1/functions/{project_name}/{function_name}/invoke_async">client.functions.<a href="./src/resources/functions/functions.ts">invokeAsync</a>(projectName, functionName, { ...params }) -> FunctionInvocationDetailView</code>
- <code title="post /v1/functions/{project_name}/{function_name}/invoke_sync">client.functions.<a href="./src/resources/functions/functions.ts">invokeSync</a>(projectName, functionName, { ...params }) -> FunctionInvocationDetailView</code>

## Invocations

Types:

- <code><a href="./src/resources/functions/invocations/invocations.ts">FunctionInvocationListView</a></code>
- <code><a href="./src/resources/functions/invocations/invocations.ts">KillOperationResponse</a></code>

Methods:

- <code title="get /v1/functions/invocations/{invocationId}">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">retrieve</a>(invocationId) -> FunctionInvocationDetailView</code>
- <code title="get /v1/functions/invocations">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">list</a>() -> FunctionInvocationListView</code>
- <code title="post /v1/functions/invocations/{invocationId}/kill">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">kill</a>(invocationId) -> unknown</code>

### Spans

Types:

- <code><a href="./src/resources/functions/invocations/spans.ts">InvocationSpanListView</a></code>

# Projects

Types:

- <code><a href="./src/resources/projects/projects.ts">ProjectListView</a></code>

Methods:

- <code title="get /v1/projects">client.projects.<a href="./src/resources/projects/projects.ts">list</a>() -> ProjectListView</code>

## Logs

Methods:

- <code title="get /v1/projects/{id}/logs">client.projects.logs.<a href="./src/resources/projects/logs.ts">list</a>(id) -> ProjectLogsView</code>
