# Shared

Types:

- <code><a href="./src/resources/shared.ts">FunctionInvocationDetail</a></code>

# CodeHandles

Types:

- <code><a href="./src/resources/code-handles.ts">CodeHandle</a></code>
- <code><a href="./src/resources/code-handles.ts">CodeHandleList</a></code>

Methods:

- <code title="post /v1/code_handles">client.codeHandles.<a href="./src/resources/code-handles.ts">create</a>({ ...params }) -> CodeHandle</code>
- <code title="get /v1/code_handles">client.codeHandles.<a href="./src/resources/code-handles.ts">list</a>({ ...params }) -> CodeHandleList</code>

# Devboxes

Types:

- <code><a href="./src/resources/devboxes/devboxes.ts">Devbox</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxList</a></code>

Methods:

- <code title="post /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">create</a>({ ...params }) -> Devbox</code>
- <code title="get /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieve</a>(id) -> Devbox</code>
- <code title="get /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">list</a>({ ...params }) -> DevboxList</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id) -> Devbox</code>

## Logs

Types:

- <code><a href="./src/resources/devboxes/logs.ts">DevboxLogsList</a></code>

Methods:

- <code title="get /v1/devboxes/{id}/logs">client.devboxes.logs.<a href="./src/resources/devboxes/logs.ts">list</a>(id) -> DevboxLogsList</code>

# Functions

Types:

- <code><a href="./src/resources/functions/functions.ts">FunctionList</a></code>

Methods:

- <code title="get /v1/functions">client.functions.<a href="./src/resources/functions/functions.ts">list</a>() -> FunctionList</code>

## Invocations

Types:

- <code><a href="./src/resources/functions/invocations/invocations.ts">FunctionInvocationList</a></code>
- <code><a href="./src/resources/functions/invocations/invocations.ts">KillOperationResponse</a></code>

Methods:

- <code title="get /v1/functions/invocations/{invocationId}">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">retrieve</a>(invocationId) -> FunctionInvocationDetail</code>
- <code title="get /v1/functions/invocations">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">list</a>() -> FunctionInvocationList</code>
- <code title="post /v1/functions/invocations/{invocationId}/kill">client.functions.invocations.<a href="./src/resources/functions/invocations/invocations.ts">kill</a>(invocationId) -> unknown</code>

### Spans

Types:

- <code><a href="./src/resources/functions/invocations/spans.ts">InvocationSpanList</a></code>

Methods:

- <code title="get /v1/functions/invocations/{invocationId}/spans">client.functions.invocations.spans.<a href="./src/resources/functions/invocations/spans.ts">list</a>(invocationId) -> InvocationSpanList</code>

## OpenAPI

Types:

- <code><a href="./src/resources/functions/openapi.ts">OpenAPIRetrieveResponse</a></code>

Methods:

- <code title="get /v1/functions/openapi">client.functions.openAPI.<a href="./src/resources/functions/openapi.ts">retrieve</a>() -> unknown</code>

# Latches

Types:

- <code><a href="./src/resources/latches.ts">EmptyRecord</a></code>

Methods:

- <code title="post /v1/latches/{latchId}">client.latches.<a href="./src/resources/latches.ts">fulfill</a>(latchId, { ...params }) -> unknown</code>

# Projects

Types:

- <code><a href="./src/resources/projects/projects.ts">ProjectList</a></code>

Methods:

- <code title="get /v1/projects">client.projects.<a href="./src/resources/projects/projects.ts">list</a>() -> ProjectList</code>

## Logs

Types:

- <code><a href="./src/resources/projects/logs.ts">ProjectLogs</a></code>

Methods:

- <code title="get /v1/projects/{id}/logs">client.projects.logs.<a href="./src/resources/projects/logs.ts">list</a>(id) -> ProjectLogs</code>

# Sessions

## Sessions

Types:

- <code><a href="./src/resources/sessions/sessions/sessions.ts">Session</a></code>
- <code><a href="./src/resources/sessions/sessions/sessions.ts">SessionList</a></code>

Methods:

- <code title="post /v1/sessions/sessions">client.sessions.sessions.<a href="./src/resources/sessions/sessions/sessions.ts">create</a>() -> Session</code>
- <code title="get /v1/sessions/sessions">client.sessions.sessions.<a href="./src/resources/sessions/sessions/sessions.ts">list</a>() -> SessionList</code>

### Kv

Types:

- <code><a href="./src/resources/sessions/sessions/kv.ts">SessionKv</a></code>
