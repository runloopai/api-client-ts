# Shared

Types:

- <code><a href="./src/resources/shared.ts">AfterIdle</a></code>
- <code><a href="./src/resources/shared.ts">AgentMount</a></code>
- <code><a href="./src/resources/shared.ts">AgentSource</a></code>
- <code><a href="./src/resources/shared.ts">AuthMechanism</a></code>
- <code><a href="./src/resources/shared.ts">BrokerMount</a></code>
- <code><a href="./src/resources/shared.ts">CodeMountParameters</a></code>
- <code><a href="./src/resources/shared.ts">CustomHeader</a></code>
- <code><a href="./src/resources/shared.ts">LaunchParameters</a></code>
- <code><a href="./src/resources/shared.ts">LifecycleConfiguration</a></code>
- <code><a href="./src/resources/shared.ts">LifecycleHooks</a></code>
- <code><a href="./src/resources/shared.ts">Mount</a></code>
- <code><a href="./src/resources/shared.ts">ObjectMount</a></code>
- <code><a href="./src/resources/shared.ts">ResumeTriggers</a></code>

# Accounts

Types:

- <code><a href="./src/resources/accounts.ts">AccountView</a></code>

Methods:

- <code title="get /v1/accounts/me">client.accounts.<a href="./src/resources/accounts.ts">me</a>() -> AccountView</code>

# Agents

Types:

- <code><a href="./src/resources/agents.ts">AgentCreateParameters</a></code>
- <code><a href="./src/resources/agents.ts">AgentDevboxCountsView</a></code>
- <code><a href="./src/resources/agents.ts">AgentListView</a></code>
- <code><a href="./src/resources/agents.ts">AgentView</a></code>
- <code><a href="./src/resources/agents.ts">AgentDeleteResponse</a></code>

Methods:

- <code title="post /v1/agents">client.agents.<a href="./src/resources/agents.ts">create</a>({ ...params }) -> AgentView</code>
- <code title="get /v1/agents/{id}">client.agents.<a href="./src/resources/agents.ts">retrieve</a>(id) -> AgentView</code>
- <code title="get /v1/agents">client.agents.<a href="./src/resources/agents.ts">list</a>({ ...params }) -> AgentViewsAgentsCursorIDPage</code>
- <code title="post /v1/agents/{id}/delete">client.agents.<a href="./src/resources/agents.ts">delete</a>(id) -> unknown</code>
- <code title="get /v1/agents/devbox_counts">client.agents.<a href="./src/resources/agents.ts">devboxCounts</a>() -> AgentDevboxCountsView</code>
- <code title="get /v1/agents/list_public">client.agents.<a href="./src/resources/agents.ts">listPublic</a>({ ...params }) -> AgentViewsAgentsCursorIDPage</code>

# Axons

Types:

- <code><a href="./src/resources/axons/axons.ts">AxonCreateParams</a></code>
- <code><a href="./src/resources/axons/axons.ts">AxonEventView</a></code>
- <code><a href="./src/resources/axons/axons.ts">AxonListView</a></code>
- <code><a href="./src/resources/axons/axons.ts">AxonUpdateParams</a></code>
- <code><a href="./src/resources/axons/axons.ts">AxonView</a></code>
- <code><a href="./src/resources/axons/axons.ts">PublishParams</a></code>
- <code><a href="./src/resources/axons/axons.ts">PublishResultView</a></code>
- <code><a href="./src/resources/axons/axons.ts">AxonDeleteResponse</a></code>

Methods:

- <code title="post /v1/axons">client.axons.<a href="./src/resources/axons/axons.ts">create</a>({ ...params }) -> AxonView</code>
- <code title="get /v1/axons/{id}">client.axons.<a href="./src/resources/axons/axons.ts">retrieve</a>(id) -> AxonView</code>
- <code title="post /v1/axons/{id}">client.axons.<a href="./src/resources/axons/axons.ts">update</a>(id, { ...params }) -> AxonView</code>
- <code title="get /v1/axons">client.axons.<a href="./src/resources/axons/axons.ts">list</a>({ ...params }) -> AxonViewsAxonsCursorIDPage</code>
- <code title="delete /v1/axons/{id}">client.axons.<a href="./src/resources/axons/axons.ts">delete</a>(id) -> unknown</code>
- <code title="post /v1/axons/{id}/publish">client.axons.<a href="./src/resources/axons/axons.ts">publish</a>(id, { ...params }) -> PublishResultView</code>
- <code title="get /v1/axons/{id}/subscribe/sse">client.axons.<a href="./src/resources/axons/axons.ts">subscribeSse</a>(id, { ...params }) -> AxonEventView</code>

## Events

Types:

- <code><a href="./src/resources/axons/events.ts">AxonEventListView</a></code>

Methods:

- <code title="get /v1/axons/{id}/events">client.axons.events.<a href="./src/resources/axons/events.ts">list</a>(id, { ...params }) -> AxonEventListView</code>

## Sql

Types:

- <code><a href="./src/resources/axons/sql.ts">SqlBatchParams</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlBatchResultView</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlColumnMetaView</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlQueryResultView</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlResultMetaView</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlStatementParams</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlStepErrorView</a></code>
- <code><a href="./src/resources/axons/sql.ts">SqlStepResultView</a></code>

Methods:

- <code title="post /v1/axons/{id}/sql/batch">client.axons.sql.<a href="./src/resources/axons/sql.ts">batch</a>(id, { ...params }) -> SqlBatchResultView</code>
- <code title="post /v1/axons/{id}/sql/query">client.axons.sql.<a href="./src/resources/axons/sql.ts">query</a>(id, { ...params }) -> SqlQueryResultView</code>

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
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxEvictionEventView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxExecutionDetailView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxKillExecutionRequest</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxListView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxResourceUsageView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSendStdInRequest</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSendStdInResult</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSnapshotListView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxSnapshotView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">DevboxView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">GatewayTokenView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">McpTokenView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">PtyTunnelView</a></code>
- <code><a href="./src/resources/devboxes/devboxes.ts">TunnelView</a></code>
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
- <code title="post /v1/devboxes/{id}/create_gateway_token">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createGatewayToken</a>(id, { ...params }) -> GatewayTokenView</code>
- <code title="post /v1/devboxes/{id}/create_mcp_token">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createMcpToken</a>(id, { ...params }) -> McpTokenView</code>
- <code title="post /v1/devboxes/{id}/create_pty_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createPtyTunnel</a>(id) -> PtyTunnelView</code>
- <code title="post /v1/devboxes/{id}/create_ssh_key">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">createSSHKey</a>(id) -> DevboxCreateSSHKeyResponse</code>
- <code title="post /v1/devboxes/disk_snapshots/{id}/delete">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">deleteDiskSnapshot</a>(id) -> unknown</code>
- <code title="post /v1/devboxes/{id}/download_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">downloadFile</a>(id, { ...params }) -> Response</code>
- <code title="post /v1/devboxes/{id}/enable_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">enableTunnel</a>(id, { ...params }) -> TunnelView</code>
- <code title="post /v1/devboxes/{id}/execute">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">execute</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeAsync</a>(id, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/execute_sync">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">executeSync</a>(id, { ...params }) -> DevboxExecutionDetailView</code>
- <code title="post /v1/devboxes/{id}/keep_alive">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">keepAlive</a>(id) -> unknown</code>
- <code title="get /v1/devboxes/disk_snapshots">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">listDiskSnapshots</a>({ ...params }) -> DevboxSnapshotViewsDiskSnapshotsCursorIDPage</code>
- <code title="post /v1/devboxes/{id}/read_file_contents">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">readFileContents</a>(id, { ...params }) -> string</code>
- <code title="post /v1/devboxes/{id}/remove_tunnel">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">removeTunnel</a>(id) -> unknown</code>
- <code title="post /v1/devboxes/{id}/resume">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">resume</a>(id) -> DevboxView</code>
- <code title="get /v1/devboxes/{id}/usage">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">retrieveResourceUsage</a>(id) -> DevboxResourceUsageView</code>
- <code title="post /v1/devboxes/{id}/shutdown">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">shutdown</a>(id, { ...params }) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/snapshot_disk">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">snapshotDisk</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="post /v1/devboxes/{id}/snapshot_disk_async">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">snapshotDiskAsync</a>(id, { ...params }) -> DevboxSnapshotView</code>
- <code title="post /v1/devboxes/{id}/suspend">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">suspend</a>(id) -> DevboxView</code>
- <code title="post /v1/devboxes/{id}/upload_file">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">uploadFile</a>(id, { ...params }) -> unknown</code>
- <code title="post /v1/devboxes/{devbox_id}/executions/{execution_id}/wait_for_status">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">waitForCommand</a>(devboxId, executionId, { ...params }) -> DevboxAsyncExecutionDetailView</code>
- <code title="get /v1/devboxes/evictions/watch">client.devboxes.<a href="./src/resources/devboxes/devboxes.ts">watchEvictions</a>() -> DevboxEvictionEventView</code>
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
- <code title="post /v1/devboxes/{devbox_id}/executions/{execution_id}/send_std_in">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">sendStdIn</a>(devboxId, executionId, { ...params }) -> DevboxSendStdInResult</code>
- <code title="get /v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stderr_updates">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">streamStderrUpdates</a>(devboxId, executionId, { ...params }) -> ExecutionUpdateChunk</code>
- <code title="get /v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stdout_updates">client.devboxes.executions.<a href="./src/resources/devboxes/executions.ts">streamStdoutUpdates</a>(devboxId, executionId, { ...params }) -> ExecutionUpdateChunk</code>

# Pty

Types:

- <code><a href="./src/resources/pty.ts">PtyConnectView</a></code>
- <code><a href="./src/resources/pty.ts">PtyControlParams</a></code>
- <code><a href="./src/resources/pty.ts">PtyControlResultView</a></code>

Methods:

- <code title="get /pty/{session_name}">client.pty.<a href="./src/resources/pty.ts">connect</a>(sessionName, { ...params }) -> PtyConnectView</code>
- <code title="post /pty/{session_name}/control">client.pty.<a href="./src/resources/pty.ts">control</a>(sessionName, { ...params }) -> PtyControlResultView</code>

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

# Secrets

Types:

- <code><a href="./src/resources/secrets.ts">SecretCreateParameters</a></code>
- <code><a href="./src/resources/secrets.ts">SecretListView</a></code>
- <code><a href="./src/resources/secrets.ts">SecretUpdateParameters</a></code>
- <code><a href="./src/resources/secrets.ts">SecretView</a></code>

Methods:

- <code title="post /v1/secrets">client.secrets.<a href="./src/resources/secrets.ts">create</a>({ ...params }) -> SecretView</code>
- <code title="get /v1/secrets/{name}">client.secrets.<a href="./src/resources/secrets.ts">retrieve</a>(name) -> SecretView</code>
- <code title="post /v1/secrets/{name}">client.secrets.<a href="./src/resources/secrets.ts">update</a>(name, { ...params }) -> SecretView</code>
- <code title="get /v1/secrets">client.secrets.<a href="./src/resources/secrets.ts">list</a>({ ...params }) -> SecretListView</code>
- <code title="post /v1/secrets/{name}/delete">client.secrets.<a href="./src/resources/secrets.ts">delete</a>(name) -> SecretView</code>

# NetworkPolicies

Types:

- <code><a href="./src/resources/network-policies.ts">AllowedCidr</a></code>
- <code><a href="./src/resources/network-policies.ts">NetworkPolicyCreateParameters</a></code>
- <code><a href="./src/resources/network-policies.ts">NetworkPolicyListView</a></code>
- <code><a href="./src/resources/network-policies.ts">NetworkPolicyUpdateParameters</a></code>
- <code><a href="./src/resources/network-policies.ts">NetworkPolicyView</a></code>
- <code><a href="./src/resources/network-policies.ts">PortRule</a></code>

Methods:

- <code title="post /v1/network-policies">client.networkPolicies.<a href="./src/resources/network-policies.ts">create</a>({ ...params }) -> NetworkPolicyView</code>
- <code title="get /v1/network-policies/{id}">client.networkPolicies.<a href="./src/resources/network-policies.ts">retrieve</a>(id) -> NetworkPolicyView</code>
- <code title="post /v1/network-policies/{id}">client.networkPolicies.<a href="./src/resources/network-policies.ts">update</a>(id, { ...params }) -> NetworkPolicyView</code>
- <code title="get /v1/network-policies">client.networkPolicies.<a href="./src/resources/network-policies.ts">list</a>({ ...params }) -> NetworkPolicyViewsNetworkPoliciesCursorIDPage</code>
- <code title="post /v1/network-policies/{id}/delete">client.networkPolicies.<a href="./src/resources/network-policies.ts">delete</a>(id) -> NetworkPolicyView</code>

# GatewayConfigs

Types:

- <code><a href="./src/resources/gateway-configs.ts">GatewayConfigCreateParameters</a></code>
- <code><a href="./src/resources/gateway-configs.ts">GatewayConfigListView</a></code>
- <code><a href="./src/resources/gateway-configs.ts">GatewayConfigUpdateParameters</a></code>
- <code><a href="./src/resources/gateway-configs.ts">GatewayConfigView</a></code>

Methods:

- <code title="post /v1/gateway-configs">client.gatewayConfigs.<a href="./src/resources/gateway-configs.ts">create</a>({ ...params }) -> GatewayConfigView</code>
- <code title="get /v1/gateway-configs/{id}">client.gatewayConfigs.<a href="./src/resources/gateway-configs.ts">retrieve</a>(id) -> GatewayConfigView</code>
- <code title="post /v1/gateway-configs/{id}">client.gatewayConfigs.<a href="./src/resources/gateway-configs.ts">update</a>(id, { ...params }) -> GatewayConfigView</code>
- <code title="get /v1/gateway-configs">client.gatewayConfigs.<a href="./src/resources/gateway-configs.ts">list</a>({ ...params }) -> GatewayConfigViewsGatewayConfigsCursorIDPage</code>
- <code title="post /v1/gateway-configs/{id}/delete">client.gatewayConfigs.<a href="./src/resources/gateway-configs.ts">delete</a>(id) -> GatewayConfigView</code>

# McpConfigs

Types:

- <code><a href="./src/resources/mcp-configs.ts">McpConfigCreateParameters</a></code>
- <code><a href="./src/resources/mcp-configs.ts">McpConfigListView</a></code>
- <code><a href="./src/resources/mcp-configs.ts">McpConfigUpdateParameters</a></code>
- <code><a href="./src/resources/mcp-configs.ts">McpConfigView</a></code>

Methods:

- <code title="post /v1/mcp-configs">client.mcpConfigs.<a href="./src/resources/mcp-configs.ts">create</a>({ ...params }) -> McpConfigView</code>
- <code title="get /v1/mcp-configs/{id}">client.mcpConfigs.<a href="./src/resources/mcp-configs.ts">retrieve</a>(id) -> McpConfigView</code>
- <code title="post /v1/mcp-configs/{id}">client.mcpConfigs.<a href="./src/resources/mcp-configs.ts">update</a>(id, { ...params }) -> McpConfigView</code>
- <code title="get /v1/mcp-configs">client.mcpConfigs.<a href="./src/resources/mcp-configs.ts">list</a>({ ...params }) -> McpConfigViewsMcpConfigsCursorIDPage</code>
- <code title="post /v1/mcp-configs/{id}/delete">client.mcpConfigs.<a href="./src/resources/mcp-configs.ts">delete</a>(id) -> McpConfigView</code>

# Apikeys

Types:

- <code><a href="./src/resources/apikeys.ts">APIKeyCreatedView</a></code>
- <code><a href="./src/resources/apikeys.ts">APIKeyCreateParameters</a></code>

Methods:

- <code title="post /v1/apikeys">client.apikeys.<a href="./src/resources/apikeys.ts">create</a>({ ...params }) -> APIKeyCreatedView</code>

# RestrictedKeys

Types:

- <code><a href="./src/resources/restricted-keys.ts">RestrictedKeyCreatedView</a></code>
- <code><a href="./src/resources/restricted-keys.ts">RestrictedKeyCreateParameters</a></code>
- <code><a href="./src/resources/restricted-keys.ts">ScopeEntryView</a></code>

Methods:

- <code title="post /v1/restricted_keys">client.restrictedKeys.<a href="./src/resources/restricted-keys.ts">create</a>({ ...params }) -> RestrictedKeyCreatedView</code>
