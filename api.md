# Shared

Types:

- <code><a href="./src/resources/shared.ts">AfterIdle</a></code>
- <code><a href="./src/resources/shared.ts">CodeMountParameters</a></code>
- <code><a href="./src/resources/shared.ts">LaunchParameters</a></code>
- <code><a href="./src/resources/shared.ts">RunProfile</a></code>

# Benchmarks

Types:

- <code><a href="./src/resources/benchmarks/benchmarks.ts">BenchmarkCreateParameters</a></code>
- <code><a href="./src/resources/benchmarks/benchmarks.ts">BenchmarkRunListView</a></code>
- <code><a href="./src/resources/benchmarks/benchmarks.ts">BenchmarkRunView</a></code>
- <code><a href="./src/resources/benchmarks/benchmarks.ts">BenchmarkView</a></code>
- <code><a href="./src/resources/benchmarks/benchmarks.ts">ScenarioDefinitionListView</a></code>
- <code><a href="./src/resources/benchmarks/benchmarks.ts">StartBenchmarkRunParameters</a></code>

Methods:

- <code title="post /v1/benchmarks">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">create</a>({ ...params }) -> BenchmarkView</code>
- <code title="get /v1/benchmarks/{id}">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">retrieve</a>(id) -> BenchmarkView</code>
- <code title="post /v1/benchmarks/{id}">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">update</a>(id, { ...params }) -> BenchmarkView</code>
- <code title="get /v1/benchmarks">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">list</a>({ ...params }) -> BenchmarkViewsBenchmarksCursorIDPage</code>
- <code title="get /v1/benchmarks/{id}/definitions">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">definitions</a>(id, { ...params }) -> ScenarioDefinitionListView</code>
- <code title="get /v1/benchmarks/list_public">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">listPublic</a>({ ...params }) -> BenchmarkViewsBenchmarksCursorIDPage</code>
- <code title="post /v1/benchmarks/start_run">client.benchmarks.<a href="./src/resources/benchmarks/benchmarks.ts">startRun</a>({ ...params }) -> BenchmarkRunView</code>

## Runs

Methods:

- <code title="get /v1/benchmarks/runs/{id}">client.benchmarks.runs.<a href="./src/resources/benchmarks/runs.ts">retrieve</a>(id) -> BenchmarkRunView</code>
- <code title="get /v1/benchmarks/runs">client.benchmarks.runs.<a href="./src/resources/benchmarks/runs.ts">list</a>({ ...params }) -> BenchmarkRunViewsBenchmarkRunsCursorIDPage</code>
- <code title="post /v1/benchmarks/runs/{id}/cancel">client.benchmarks.runs.<a href="./src/resources/benchmarks/runs.ts">cancel</a>(id) -> BenchmarkRunView</code>
- <code title="post /v1/benchmarks/runs/{id}/complete">client.benchmarks.runs.<a href="./src/resources/benchmarks/runs.ts">complete</a>(id) -> BenchmarkRunView</code>
- <code title="get /v1/benchmarks/runs/{id}/scenario_runs">client.benchmarks.runs.<a href="./src/resources/benchmarks/runs.ts">listScenarioRuns</a>(id, { ...params }) -> ScenarioRunViewsBenchmarkRunsCursorIDPage</code>

# Blueprints

Types:

- <code><a href="./src/resources/blueprints.ts">BlueprintBuildLog</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintBuildLogsListView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintBuildParameters</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintListView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintPreviewView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintView</a></code>
- <code><a href="./src/resources/blueprints.ts">BlueprintDeleteResponse</a></code>

Methods:

- <code title="post /v1/blueprints">client.blueprints.<a href="./src/resources/blueprints.ts">create</a>({ ...params }) -> BlueprintView</code>
- <code title="get /v1/blueprints/{id}">client.blueprints.<a href="./src/resources/blueprints.ts">retrieve</a>(id) -> BlueprintView</code>
- <code title="get /v1/blueprints">client.blueprints.<a href="./src/resources/blueprints.ts">list</a>({ ...params }) -> BlueprintViewsBlueprintsCursorIDPage</code>
- <code title="post /v1/blueprints/{id}/delete">client.blueprints.<a href="./src/resources/blueprints.ts">delete</a>(id) -> unknown</code>
- <code title="get /v1/blueprints/list_public">client.blueprints.<a href="./src/resources/blueprints.ts">listPublic</a>({ ...params }) -> BlueprintViewsBlueprintsCursorIDPage</code>
- <code title="get /v1/blueprints/{id}/logs">client.blueprints.<a href="./src/resources/blueprints.ts">logs</a>(id) -> BlueprintBuildLogsListView</code>
- <code title="post /v1/blueprints/preview">client.blueprints.<a href="./src/resources/blueprints.ts">preview</a>({ ...params }) -> BlueprintPreviewView</code>

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
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxDeleteDiskSnapshotResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxKeepAliveResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxReadFileContentsResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxRemoveTunnelResponse</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxUploadFileResponse</a></code>

Methods:

- <code title="post /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">create</a>({ ...params }) -> DevboxView</code>
- <code title="get /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieve</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">update</a>(id, { ...params }) -> DevboxView</code>
- <code title="get /v1/devboxes">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">list</a>({ ...params }) -> DevboxViewsDevboxesCursorIDPage</code>
- <code title="post /v1/devboxes/{id}/create_ssh_key">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createSSHKey</a>(id) -> DevboxCreateSSHKeyResponse</code>
- <code title="post /v1/devboxes/{id}/create_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createTunnel</a>(id, { ...params }) -> DevboxTunnelView</code>
- <code title="post /v1/devboxes/disk_snapshots/{id}/delete">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">deleteDiskSnapshot</a>(id) -> unknown</code>
- <code title="post /v1/devboxes/{id}/download_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">downloadFile</a>(id, { ...params }) -> Response</code>
- <code title="post /v1/devboxes/{id}/execute_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/keep_alive">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">keepAlive</a>(id) -> unknown</code>
- <code title="get /v1/devboxes/disk_snapshots">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">listDiskSnapshots</a>({ ...params }) -> DevboxSnapshotViewsDiskSnapshotsCursorIDPage</code>
- <code title="post /v1/devboxes/{id}/read_file_contents">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">readFileContents</a>(id, { ...params }) -> string</code>
- <code title="post /v1/devboxes/{id}/remove_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">removeTunnel</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/resume">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">resume</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/snapshot_disk">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">snapshotDisk</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="post /v1/devboxes/{id}/snapshot_disk_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">snapshotDiskAsync</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="post /v1/devboxes/{id}/suspend">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">suspend</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/upload_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">uploadFile</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{id}/write_file_contents">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">writeFileContents</a>(id, { ...params }) -> DevboxExecutionDetailView</code>

## DiskSnapshots

Types:

- <code><a href="./src/resources/devboxes/disk-snapshots.ts">DevboxSnapshotAsyncStatusView</a></code>
- <code><a href="./src/resources/devboxes/disk-snapshots.ts">DiskSnapshotDeleteResponse</a></code>

Methods:

- <code title="post /v1/devboxes/disk_snapshots/{id}">client.devboxes.diskSnapshots.<a href="./src/resources/devboxes/disk-snapshots.ts">update</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="get /v1/devboxes/disk_snapshots">client.devboxes.diskSnapshots.<a href="./src/resources/devboxes/disk-snapshots.ts">list</a>({ ...params }) -> DevboxSnapshotViewsDiskSnapshotsCursorIDPage</code>
- <code title="post /v1/devboxes/disk_snapshots/{id}/delete">client.devboxes.diskSnapshots.<a href="./src/resources/devboxes/disk-snapshots.ts">delete</a>(id) -> unknown</code>
- <code title="get /v1/devboxes/disk_snapshots/{id}/status">client.devboxes.diskSnapshots.<a href="./src/resources/devboxes/disk-snapshots.ts">queryStatus</a>(id) -> DevboxSnapshotAsyncStatusView</code>

## Browsers

Types:

- <code><a href="./src/resources/devboxes/browsers.ts">BrowserView</a></code>

Methods:

- <code title="post /v1/devboxes/browsers">client.devboxes.browsers.<a href="./src/resources/devboxes/browsers.ts">create</a>({ ...params }) -> BrowserView</code>
- <code title="get /v1/devboxes/browsers/{id}">client.devboxes.browsers.<a href="./src/resources/devboxes/browsers.ts">retrieve</a>(id) -> BrowserView</code>

## Computers

Types:

- <code><a href="./src/resources/devboxes/computers.ts">ComputerView</a></code>
- <code><a href="./src/resources/devboxes/computers.ts">ComputerKeyboardInteractionResponse</a></code>
- <code><a href="./src/resources/devboxes/computers.ts">ComputerMouseInteractionResponse</a></code>
- <code><a href="./src/resources/devboxes/computers.ts">ComputerScreenInteractionResponse</a></code>

Methods:

- <code title="post /v1/devboxes/computers">client.devboxes.computers.<a href="./src/resources/devboxes/computers.ts">create</a>({ ...params }) -> ComputerView</code>
- <code title="get /v1/devboxes/computers/{id}">client.devboxes.computers.<a href="./src/resources/devboxes/computers.ts">retrieve</a>(id) -> ComputerView</code>
- <code title="post /v1/devboxes/computers/{id}/keyboard_interaction">client.devboxes.computers.<a href="./src/resources/devboxes/computers.ts">keyboardInteraction</a>(id, { ...params }) -> ComputerKeyboardInteractionResponse</code>
- <code title="post /v1/devboxes/computers/{id}/mouse_interaction">client.devboxes.computers.<a href="./src/resources/devboxes/computers.ts">mouseInteraction</a>(id, { ...params }) -> ComputerMouseInteractionResponse</code>
- <code title="post /v1/devboxes/computers/{id}/screen_interaction">client.devboxes.computers.<a href="./src/resources/devboxes/computers.ts">screenInteraction</a>(id, { ...params }) -> ComputerScreenInteractionResponse</code>

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
- <code title="post /v1/devboxes/{id}/lsp/code-actions">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">codeActions</a>(id, { ...params }) -> CodeActionsResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/diagnostics">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">diagnostics</a>(id, { ...params }) -> DiagnosticsResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/document-symbols">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">documentSymbols</a>(id, { ...params }) -> DocumentSymbolResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/file">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">file</a>(id, { ...params }) -> FileContentsResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/file-definition">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">fileDefinition</a>(id, { ...params }) -> FileDefinitionResponse</code>
- <code title="get /v1/devboxes/{id}/lsp/files">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">files</a>(id) -> LspFilesResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/formatting">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">formatting</a>(id, { ...params }) -> FormattingResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/get-code-actions-for-diagnostic">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getCodeActionsForDiagnostic</a>(id, { ...params }) -> LspGetCodeActionsForDiagnosticResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/get-code-segment-info">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getCodeSegmentInfo</a>(id, { ...params }) -> CodeSegmentInfoResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/get-signature-help">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">getSignatureHelp</a>(id, { ...params }) -> SignatureHelpResponse</code>
- <code title="get /v1/devboxes/{id}/lsp/health">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">health</a>(id) -> HealthStatusResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/references">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">references</a>(id, { ...params }) -> ReferencesResponse</code>
- <code title="post /v1/devboxes/{id}/lsp/set-watch-directory">client.devboxes.lsp.<a href="./src/resources/devboxes/lsp.ts">setWatchDirectory</a>(id, { ...params }) -> string</code>

## Logs

Types:

- <code><a href="./src/resources/devboxes/logs.ts">DevboxLogsListView</a></code>

Methods:

- <code title="get /v1/devboxes/{id}/logs">client.devboxes.logs.<a href="./src/resources/devboxes/logs.ts">list</a>(id, { ...params }) -> DevboxLogsListView</code>

## Executions

Types:

- <code><a href="./src/resources/devboxes/executions.ts">ExecutionUpdateChunk</a></code>

Methods:

- <code title="get /v1/devboxes/{devbox_id}/executions/{execution_id}">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">retrieve</a>(devboxId, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_async">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{devbox_id}/executions/{execution_id}/kill">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">kill</a>(devboxId, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="get /v1/devboxes/{devbox_id}/executions/{execution_id}/stream_updates">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">streamUpdates</a>(devboxId, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>

# Scenarios

Types:

- <code><a href="./src/resources/scenarios/scenarios.ts">InputContext</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">InputContextUpdate</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioCreateParameters</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioEnvironment</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioRunListView</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioRunView</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioUpdateParameters</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScenarioView</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScoringContract</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScoringContractResultView</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScoringContractUpdate</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScoringFunction</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">ScoringFunctionResultView</a></code>
- <code><a href="./src/resources/scenarios/scenarios.ts">StartScenarioRunParameters</a></code>

Methods:

- <code title="post /v1/scenarios">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">create</a>({ ...params }) -> ScenarioView</code>
- <code title="get /v1/scenarios/{id}">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">retrieve</a>(id) -> ScenarioView</code>
- <code title="post /v1/scenarios/{id}">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">update</a>(id, { ...params }) -> ScenarioView</code>
- <code title="get /v1/scenarios">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">list</a>({ ...params }) -> ScenarioViewsScenariosCursorIDPage</code>
- <code title="get /v1/scenarios/list_public">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">listPublic</a>({ ...params }) -> ScenarioViewsScenariosCursorIDPage</code>
- <code title="post /v1/scenarios/start_run">client.scenarios.<a href="./src/resources/scenarios/scenarios.ts">startRun</a>({ ...params }) -> ScenarioRunView</code>

## Runs

Methods:

- <code title="get /v1/scenarios/runs/{id}">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">retrieve</a>(id) -> ScenarioRunView</code>
- <code title="get /v1/scenarios/runs">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">list</a>({ ...params }) -> ScenarioRunViewsBenchmarkRunsCursorIDPage</code>
- <code title="post /v1/scenarios/runs/{id}/cancel">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">cancel</a>(id) -> ScenarioRunView</code>
- <code title="post /v1/scenarios/runs/{id}/complete">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">complete</a>(id) -> ScenarioRunView</code>
- <code title="post /v1/scenarios/runs/{id}/download_logs">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">downloadLogs</a>(id) -> Response</code>
- <code title="post /v1/scenarios/runs/{id}/score">client.scenarios.runs.<a href="./src/resources/scenarios/runs.ts">score</a>(id) -> ScenarioRunView</code>

## Scorers

Types:

- <code><a href="./src/resources/scenarios/scorers.ts">ScorerCreateResponse</a></code>
- <code><a href="./src/resources/scenarios/scorers.ts">ScorerRetrieveResponse</a></code>
- <code><a href="./src/resources/scenarios/scorers.ts">ScorerUpdateResponse</a></code>
- <code><a href="./src/resources/scenarios/scorers.ts">ScorerListResponse</a></code>
- <code><a href="./src/resources/scenarios/scorers.ts">ScorerValidateResponse</a></code>

Methods:

- <code title="post /v1/scenarios/scorers">client.scenarios.scorers.<a href="./src/resources/scenarios/scorers.ts">create</a>({ ...params }) -> ScorerCreateResponse</code>
- <code title="get /v1/scenarios/scorers/{id}">client.scenarios.scorers.<a href="./src/resources/scenarios/scorers.ts">retrieve</a>(id) -> ScorerRetrieveResponse</code>
- <code title="post /v1/scenarios/scorers/{id}">client.scenarios.scorers.<a href="./src/resources/scenarios/scorers.ts">update</a>(id, { ...params }) -> ScorerUpdateResponse</code>
- <code title="get /v1/scenarios/scorers">client.scenarios.scorers.<a href="./src/resources/scenarios/scorers.ts">list</a>({ ...params }) -> ScorerListResponsesScenarioScorersCursorIDPage</code>
- <code title="post /v1/scenarios/scorers/{id}/validate">client.scenarios.scorers.<a href="./src/resources/scenarios/scorers.ts">validate</a>(id, { ...params }) -> ScorerValidateResponse</code>

# Objects

Types:

- <code><a href="./src/resources/objects.ts">ObjectCreateParameters</a></code>
- <code><a href="./src/resources/objects.ts">ObjectDownloadURLView</a></code>
- <code><a href="./src/resources/objects.ts">ObjectListView</a></code>
- <code><a href="./src/resources/objects.ts">ObjectView</a></code>

Methods:

- <code title="post /v1/objects">client.objects.<a href="./src/resources/objects.ts">create</a>({ ...params }) -> ObjectView</code>
- <code title="get /v1/objects/{id}">client.objects.<a href="./src/resources/objects.ts">retrieve</a>(id) -> ObjectView</code>
- <code title="get /v1/objects">client.objects.<a href="./src/resources/objects.ts">list</a>({ ...params }) -> ObjectViewsObjectsCursorIDPage</code>
- <code title="post /v1/objects/{id}/delete">client.objects.<a href="./src/resources/objects.ts">delete</a>(id) -> ObjectView</code>
- <code title="post /v1/objects/{id}/complete">client.objects.<a href="./src/resources/objects.ts">complete</a>(id) -> ObjectView</code>
- <code title="get /v1/objects/{id}/download">client.objects.<a href="./src/resources/objects.ts">download</a>(id, { ...params }) -> ObjectDownloadURLView</code>
- <code title="get /v1/objects/list_public">client.objects.<a href="./src/resources/objects.ts">listPublic</a>({ ...params }) -> ObjectViewsObjectsCursorIDPage</code>

# Repositories

Types:

- <code><a href="./src/resources/repositories.ts">RepositoryConnectionListView</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryConnectionView</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryInspectionDetails</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryInspectionListView</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryManifestView</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryDeleteResponse</a></code>
- <code><a href="./src/resources/repositories.ts">RepositoryRefreshResponse</a></code>

Methods:

- <code title="post /v1/repositories">client.repositories.<a href="./src/resources/repositories.ts">create</a>({ ...params }) -> RepositoryConnectionView</code>
- <code title="get /v1/repositories/{id}">client.repositories.<a href="./src/resources/repositories.ts">retrieve</a>(id) -> RepositoryConnectionView</code>
- <code title="get /v1/repositories">client.repositories.<a href="./src/resources/repositories.ts">list</a>({ ...params }) -> RepositoryConnectionViewsRepositoriesCursorIDPage</code>
- <code title="post /v1/repositories/{id}/delete">client.repositories.<a href="./src/resources/repositories.ts">delete</a>(id) -> unknown</code>
- <code title="get /v1/repositories/{id}/inspections">client.repositories.<a href="./src/resources/repositories.ts">listInspections</a>(id) -> RepositoryInspectionListView</code>
- <code title="post /v1/repositories/{id}/refresh">client.repositories.<a href="./src/resources/repositories.ts">refresh</a>(id, { ...params }) -> unknown</code>

# Secrets

Types:

- <code><a href="./src/resources/secrets.ts">SecretCreateParameters</a></code>
- <code><a href="./src/resources/secrets.ts">SecretListView</a></code>
- <code><a href="./src/resources/secrets.ts">SecretUpdateParameters</a></code>
- <code><a href="./src/resources/secrets.ts">SecretView</a></code>

Methods:

- <code title="post /v1/secrets">client.secrets.<a href="./src/resources/secrets.ts">create</a>({ ...params }) -> SecretView</code>
- <code title="post /v1/secrets/{name}">client.secrets.<a href="./src/resources/secrets.ts">update</a>(name, { ...params }) -> SecretView</code>
- <code title="get /v1/secrets">client.secrets.<a href="./src/resources/secrets.ts">list</a>({ ...params }) -> SecretListView</code>
- <code title="post /v1/secrets/{name}/delete">client.secrets.<a href="./src/resources/secrets.ts">delete</a>(name) -> SecretView</code>
