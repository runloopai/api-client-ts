# Shared

Types:

- <code><a href="./src/resources/shared.ts">AfterIdle</a></code>
- <code><a href="./src/resources/shared.ts">FunctionInvocationExecutionDetailView</a></code>
- <code><a href="./src/resources/shared.ts">LaunchParameters</a></code>
- <code><a href="./src/resources/shared.ts">ProjectLogsView</a></code>

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
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSnapshotListView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSnapshotView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxTunnelView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxCreateSSHKeyResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxKeepAliveResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxReadFileContentsResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxUploadFileResponse</a></code>

Methods:

- <code title="post /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">create</a>({ ...params }) -> DevboxView</code>
- <code title="get /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieve</a>(id) -> DevboxView</code>
- <code title="get /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">list</a>({ ...params }) -> DevboxListView</code>
- <code title="post /v1/devboxes/{id}/create_ssh_key">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createSSHKey</a>(id) -> DevboxCreateSSHKeyResponse</code>
- <code title="post /v1/devboxes/{id}/create_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createTunnel</a>(id, { ...params }) -> DevboxTunnelView</code>
- <code title="get /v1/devboxes/disk_snapshots">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">diskSnapshots</a>({ ...params }) -> DevboxSnapshotListView</code>
- <code title="post /v1/devboxes/{id}/download_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">downloadFile</a>(id, { ...params }) -> Response</code>
- <code title="post /v1/devboxes/{id}/execute_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/keep_alive">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">keepAlive</a>(id) -> unknown</code>
- <code title="post /v1/devboxes/{id}/read_file_contents">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">readFileContents</a>(id, { ...params }) -> string</code>
- <code title="post /v1/devboxes/{id}/resume">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">resume</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/snapshot_disk">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">snapshotDisk</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="post /v1/devboxes/{id}/suspend">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">suspend</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/upload_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">uploadFile</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/write_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">writeFile</a>(id, { ...params }) -> DevboxExecutionDetailView</code>

## Lsp

Types:

- <code><a href="./src/resources/devboxes/lsp.ts">BaseCodeAction</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseCommand</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseDiagnostic</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseLocation</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseMarkupContent</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseParameterInformation</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseRange</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseSignature</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">BaseWorkspaceEdit</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionApplicationResult</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionContext</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionKind</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionsForDiagnosticRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionsRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionsResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeActionTriggerKind</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeDescription</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeSegmentInfoRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">CodeSegmentInfoResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Diagnostic</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DiagnosticRelatedInformation</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DiagnosticSeverity</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DiagnosticsResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DiagnosticTag</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DocumentSymbol</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DocumentSymbolResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">DocumentUri</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FileContentsResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FileDefinitionRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FileDefinitionResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FilePath</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FileRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FileUri</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">FormattingResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">HealthStatusResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Integer</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Location</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">LSpAny</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Position</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Range</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">RecordStringTextEditArray</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">ReferencesRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">ReferencesResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SetWatchDirectoryRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SignatureHelpRequestBody</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SignatureHelpResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SymbolKind</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SymbolTag</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">SymbolType</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">TextEdit</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">Uinteger</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">URi</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">WatchedFileResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">LspFilesResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">LspGetCodeActionsForDiagnosticResponse</a></code>
- <code><a href="./src/resources/devboxes/lsp.ts">LspSetWatchDirectoryResponse</a></code>

Methods:

- <code title="post /v1/devboxes/{id}/lsp/apply-code-action">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">applyCodeAction</a>(id, { ...params }) -> CodeActionApplicationResult</code>
- <code title="post /v1/devboxes/{id}/lsp/code-actions">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">codeActions</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/lsp/diagnostics">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">diagnostics</a>(id, { ...params }) -> DiagnosticsResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/document-symbols">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">documentSymbols</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/lsp/file">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">file</a>(id, { ...params }) -> FileContentsResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/file-definition">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">fileDefinition</a>(id, { ...params }) -> unknown</code>
- <code title="get /v1/devboxes/{id}/lsp/files">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">files</a>(id) -> LspFilesResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/formatting">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">formatting</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/lsp/get-code-actions-for-diagnostic">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getCodeActionsForDiagnostic</a>(id, { ...params }) -> LspGetCodeActionsForDiagnosticResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/get-code-segment-info">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getCodeSegmentInfo</a>(id, { ...params }) -> CodeSegmentInfoResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/get-signature-help">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getSignatureHelp</a>(id, { ...params }) -> SignatureHelpResponse</code>
- <code title="get /v1/devboxes/{id}/lsp/health">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">health</a>(id) -> HealthStatusResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/references">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">references</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/lsp/set-watch-directory">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">setWatchDirectory</a>(id, { ...params }) -> string</code>

## Logs

Types:

- <code><a href="./src/resources/devboxes/logs.ts">DevboxLogsListView</a></code>

Methods:

- <code title="get /v1/devboxes/{id}/logs">client.devboxes.logs.<a href="./src/resources/devboxes/logs.ts">list</a>(id, { ...params }) -> DevboxLogsListView</code>

## Executions

Methods:

- <code title="get /v1/devboxes/{id}/executions/{execution_id}">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">retrieve</a>(id, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_async">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
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
