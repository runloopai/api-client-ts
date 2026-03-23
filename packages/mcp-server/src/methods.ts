// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { McpOptions } from './options';

export type SdkMethod = {
  clientCallName: string;
  fullyQualifiedName: string;
  httpMethod?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'query';
  httpPath?: string;
};

export const sdkMethods: SdkMethod[] = [
  {
    clientCallName: 'client.benchmarks.create',
    fullyQualifiedName: 'benchmarks.create',
    httpMethod: 'post',
    httpPath: '/v1/benchmarks',
  },
  {
    clientCallName: 'client.benchmarks.retrieve',
    fullyQualifiedName: 'benchmarks.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/benchmarks/{id}',
  },
  {
    clientCallName: 'client.benchmarks.update',
    fullyQualifiedName: 'benchmarks.update',
    httpMethod: 'post',
    httpPath: '/v1/benchmarks/{id}',
  },
  {
    clientCallName: 'client.benchmarks.list',
    fullyQualifiedName: 'benchmarks.list',
    httpMethod: 'get',
    httpPath: '/v1/benchmarks',
  },
  {
    clientCallName: 'client.benchmarks.definitions',
    fullyQualifiedName: 'benchmarks.definitions',
    httpMethod: 'get',
    httpPath: '/v1/benchmarks/{id}/definitions',
  },
  {
    clientCallName: 'client.benchmarks.listPublic',
    fullyQualifiedName: 'benchmarks.listPublic',
    httpMethod: 'get',
    httpPath: '/v1/benchmarks/list_public',
  },
  {
    clientCallName: 'client.benchmarks.startRun',
    fullyQualifiedName: 'benchmarks.startRun',
    httpMethod: 'post',
    httpPath: '/v1/benchmarks/start_run',
  },
  {
    clientCallName: 'client.benchmarks.updateScenarios',
    fullyQualifiedName: 'benchmarks.updateScenarios',
    httpMethod: 'post',
    httpPath: '/v1/benchmarks/{id}/scenarios',
  },
  {
    clientCallName: 'client.benchmarkRuns.retrieve',
    fullyQualifiedName: 'benchmarkRuns.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/benchmark_runs/{id}',
  },
  {
    clientCallName: 'client.benchmarkRuns.list',
    fullyQualifiedName: 'benchmarkRuns.list',
    httpMethod: 'get',
    httpPath: '/v1/benchmark_runs',
  },
  {
    clientCallName: 'client.benchmarkRuns.cancel',
    fullyQualifiedName: 'benchmarkRuns.cancel',
    httpMethod: 'post',
    httpPath: '/v1/benchmark_runs/{id}/cancel',
  },
  {
    clientCallName: 'client.benchmarkRuns.complete',
    fullyQualifiedName: 'benchmarkRuns.complete',
    httpMethod: 'post',
    httpPath: '/v1/benchmark_runs/{id}/complete',
  },
  {
    clientCallName: 'client.benchmarkRuns.listScenarioRuns',
    fullyQualifiedName: 'benchmarkRuns.listScenarioRuns',
    httpMethod: 'get',
    httpPath: '/v1/benchmark_runs/{id}/scenario_runs',
  },
  {
    clientCallName: 'client.benchmarkJobs.create',
    fullyQualifiedName: 'benchmarkJobs.create',
    httpMethod: 'post',
    httpPath: '/v1/benchmark_jobs',
  },
  {
    clientCallName: 'client.benchmarkJobs.retrieve',
    fullyQualifiedName: 'benchmarkJobs.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/benchmark_jobs/{id}',
  },
  {
    clientCallName: 'client.benchmarkJobs.list',
    fullyQualifiedName: 'benchmarkJobs.list',
    httpMethod: 'get',
    httpPath: '/v1/benchmark_jobs',
  },
  {
    clientCallName: 'client.agents.create',
    fullyQualifiedName: 'agents.create',
    httpMethod: 'post',
    httpPath: '/v1/agents',
  },
  {
    clientCallName: 'client.agents.retrieve',
    fullyQualifiedName: 'agents.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/agents/{id}',
  },
  {
    clientCallName: 'client.agents.list',
    fullyQualifiedName: 'agents.list',
    httpMethod: 'get',
    httpPath: '/v1/agents',
  },
  {
    clientCallName: 'client.blueprints.create',
    fullyQualifiedName: 'blueprints.create',
    httpMethod: 'post',
    httpPath: '/v1/blueprints',
  },
  {
    clientCallName: 'client.blueprints.retrieve',
    fullyQualifiedName: 'blueprints.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/blueprints/{id}',
  },
  {
    clientCallName: 'client.blueprints.list',
    fullyQualifiedName: 'blueprints.list',
    httpMethod: 'get',
    httpPath: '/v1/blueprints',
  },
  {
    clientCallName: 'client.blueprints.delete',
    fullyQualifiedName: 'blueprints.delete',
    httpMethod: 'post',
    httpPath: '/v1/blueprints/{id}/delete',
  },
  {
    clientCallName: 'client.blueprints.createFromInspection',
    fullyQualifiedName: 'blueprints.createFromInspection',
    httpMethod: 'post',
    httpPath: '/v1/blueprints/create_from_inspection',
  },
  {
    clientCallName: 'client.blueprints.listPublic',
    fullyQualifiedName: 'blueprints.listPublic',
    httpMethod: 'get',
    httpPath: '/v1/blueprints/list_public',
  },
  {
    clientCallName: 'client.blueprints.logs',
    fullyQualifiedName: 'blueprints.logs',
    httpMethod: 'get',
    httpPath: '/v1/blueprints/{id}/logs',
  },
  {
    clientCallName: 'client.blueprints.preview',
    fullyQualifiedName: 'blueprints.preview',
    httpMethod: 'post',
    httpPath: '/v1/blueprints/preview',
  },
  {
    clientCallName: 'client.devboxes.create',
    fullyQualifiedName: 'devboxes.create',
    httpMethod: 'post',
    httpPath: '/v1/devboxes',
  },
  {
    clientCallName: 'client.devboxes.retrieve',
    fullyQualifiedName: 'devboxes.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{id}',
  },
  {
    clientCallName: 'client.devboxes.update',
    fullyQualifiedName: 'devboxes.update',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}',
  },
  {
    clientCallName: 'client.devboxes.list',
    fullyQualifiedName: 'devboxes.list',
    httpMethod: 'get',
    httpPath: '/v1/devboxes',
  },
  {
    clientCallName: 'client.devboxes.createSSHKey',
    fullyQualifiedName: 'devboxes.createSSHKey',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/create_ssh_key',
  },
  {
    clientCallName: 'client.devboxes.createTunnel',
    fullyQualifiedName: 'devboxes.createTunnel',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/create_tunnel',
  },
  {
    clientCallName: 'client.devboxes.deleteDiskSnapshot',
    fullyQualifiedName: 'devboxes.deleteDiskSnapshot',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/disk_snapshots/{id}/delete',
  },
  {
    clientCallName: 'client.devboxes.downloadFile',
    fullyQualifiedName: 'devboxes.downloadFile',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/download_file',
  },
  {
    clientCallName: 'client.devboxes.enableTunnel',
    fullyQualifiedName: 'devboxes.enableTunnel',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/enable_tunnel',
  },
  {
    clientCallName: 'client.devboxes.execute',
    fullyQualifiedName: 'devboxes.execute',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/execute',
  },
  {
    clientCallName: 'client.devboxes.executeAsync',
    fullyQualifiedName: 'devboxes.executeAsync',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/execute_async',
  },
  {
    clientCallName: 'client.devboxes.executeSync',
    fullyQualifiedName: 'devboxes.executeSync',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/execute_sync',
  },
  {
    clientCallName: 'client.devboxes.keepAlive',
    fullyQualifiedName: 'devboxes.keepAlive',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/keep_alive',
  },
  {
    clientCallName: 'client.devboxes.listDiskSnapshots',
    fullyQualifiedName: 'devboxes.listDiskSnapshots',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/disk_snapshots',
  },
  {
    clientCallName: 'client.devboxes.readFileContents',
    fullyQualifiedName: 'devboxes.readFileContents',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/read_file_contents',
  },
  {
    clientCallName: 'client.devboxes.removeTunnel',
    fullyQualifiedName: 'devboxes.removeTunnel',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/remove_tunnel',
  },
  {
    clientCallName: 'client.devboxes.resume',
    fullyQualifiedName: 'devboxes.resume',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/resume',
  },
  {
    clientCallName: 'client.devboxes.retrieveResourceUsage',
    fullyQualifiedName: 'devboxes.retrieveResourceUsage',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{id}/usage',
  },
  {
    clientCallName: 'client.devboxes.shutdown',
    fullyQualifiedName: 'devboxes.shutdown',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/shutdown',
  },
  {
    clientCallName: 'client.devboxes.snapshotDisk',
    fullyQualifiedName: 'devboxes.snapshotDisk',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/snapshot_disk',
  },
  {
    clientCallName: 'client.devboxes.snapshotDiskAsync',
    fullyQualifiedName: 'devboxes.snapshotDiskAsync',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/snapshot_disk_async',
  },
  {
    clientCallName: 'client.devboxes.suspend',
    fullyQualifiedName: 'devboxes.suspend',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/suspend',
  },
  {
    clientCallName: 'client.devboxes.uploadFile',
    fullyQualifiedName: 'devboxes.uploadFile',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/upload_file',
  },
  {
    clientCallName: 'client.devboxes.waitForCommand',
    fullyQualifiedName: 'devboxes.waitForCommand',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/wait_for_status',
  },
  {
    clientCallName: 'client.devboxes.writeFileContents',
    fullyQualifiedName: 'devboxes.writeFileContents',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/write_file_contents',
  },
  {
    clientCallName: 'client.devboxes.diskSnapshots.update',
    fullyQualifiedName: 'devboxes.diskSnapshots.update',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/disk_snapshots/{id}',
  },
  {
    clientCallName: 'client.devboxes.diskSnapshots.list',
    fullyQualifiedName: 'devboxes.diskSnapshots.list',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/disk_snapshots',
  },
  {
    clientCallName: 'client.devboxes.diskSnapshots.delete',
    fullyQualifiedName: 'devboxes.diskSnapshots.delete',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/disk_snapshots/{id}/delete',
  },
  {
    clientCallName: 'client.devboxes.diskSnapshots.queryStatus',
    fullyQualifiedName: 'devboxes.diskSnapshots.queryStatus',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/disk_snapshots/{id}/status',
  },
  {
    clientCallName: 'client.devboxes.browsers.create',
    fullyQualifiedName: 'devboxes.browsers.create',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/browsers',
  },
  {
    clientCallName: 'client.devboxes.browsers.retrieve',
    fullyQualifiedName: 'devboxes.browsers.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/browsers/{id}',
  },
  {
    clientCallName: 'client.devboxes.computers.create',
    fullyQualifiedName: 'devboxes.computers.create',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/computers',
  },
  {
    clientCallName: 'client.devboxes.computers.retrieve',
    fullyQualifiedName: 'devboxes.computers.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/computers/{id}',
  },
  {
    clientCallName: 'client.devboxes.computers.keyboardInteraction',
    fullyQualifiedName: 'devboxes.computers.keyboardInteraction',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/computers/{id}/keyboard_interaction',
  },
  {
    clientCallName: 'client.devboxes.computers.mouseInteraction',
    fullyQualifiedName: 'devboxes.computers.mouseInteraction',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/computers/{id}/mouse_interaction',
  },
  {
    clientCallName: 'client.devboxes.computers.screenInteraction',
    fullyQualifiedName: 'devboxes.computers.screenInteraction',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/computers/{id}/screen_interaction',
  },
  {
    clientCallName: 'client.devboxes.logs.list',
    fullyQualifiedName: 'devboxes.logs.list',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{id}/logs',
  },
  {
    clientCallName: 'client.devboxes.executions.retrieve',
    fullyQualifiedName: 'devboxes.executions.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}',
  },
  {
    clientCallName: 'client.devboxes.executions.executeAsync',
    fullyQualifiedName: 'devboxes.executions.executeAsync',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/execute_async',
  },
  {
    clientCallName: 'client.devboxes.executions.executeSync',
    fullyQualifiedName: 'devboxes.executions.executeSync',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{id}/execute_sync',
  },
  {
    clientCallName: 'client.devboxes.executions.kill',
    fullyQualifiedName: 'devboxes.executions.kill',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/kill',
  },
  {
    clientCallName: 'client.devboxes.executions.sendStdIn',
    fullyQualifiedName: 'devboxes.executions.sendStdIn',
    httpMethod: 'post',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/send_std_in',
  },
  {
    clientCallName: 'client.devboxes.executions.streamStderrUpdates',
    fullyQualifiedName: 'devboxes.executions.streamStderrUpdates',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stderr_updates',
  },
  {
    clientCallName: 'client.devboxes.executions.streamStdoutUpdates',
    fullyQualifiedName: 'devboxes.executions.streamStdoutUpdates',
    httpMethod: 'get',
    httpPath: '/v1/devboxes/{devbox_id}/executions/{execution_id}/stream_stdout_updates',
  },
  {
    clientCallName: 'client.scenarios.create',
    fullyQualifiedName: 'scenarios.create',
    httpMethod: 'post',
    httpPath: '/v1/scenarios',
  },
  {
    clientCallName: 'client.scenarios.retrieve',
    fullyQualifiedName: 'scenarios.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/{id}',
  },
  {
    clientCallName: 'client.scenarios.update',
    fullyQualifiedName: 'scenarios.update',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/{id}',
  },
  {
    clientCallName: 'client.scenarios.list',
    fullyQualifiedName: 'scenarios.list',
    httpMethod: 'get',
    httpPath: '/v1/scenarios',
  },
  {
    clientCallName: 'client.scenarios.archive',
    fullyQualifiedName: 'scenarios.archive',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/{id}/archive',
  },
  {
    clientCallName: 'client.scenarios.listPublic',
    fullyQualifiedName: 'scenarios.listPublic',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/list_public',
  },
  {
    clientCallName: 'client.scenarios.startRun',
    fullyQualifiedName: 'scenarios.startRun',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/start_run',
  },
  {
    clientCallName: 'client.scenarios.runs.retrieve',
    fullyQualifiedName: 'scenarios.runs.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/runs/{id}',
  },
  {
    clientCallName: 'client.scenarios.runs.list',
    fullyQualifiedName: 'scenarios.runs.list',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/runs',
  },
  {
    clientCallName: 'client.scenarios.runs.cancel',
    fullyQualifiedName: 'scenarios.runs.cancel',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/runs/{id}/cancel',
  },
  {
    clientCallName: 'client.scenarios.runs.complete',
    fullyQualifiedName: 'scenarios.runs.complete',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/runs/{id}/complete',
  },
  {
    clientCallName: 'client.scenarios.runs.downloadLogs',
    fullyQualifiedName: 'scenarios.runs.downloadLogs',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/runs/{id}/download_logs',
  },
  {
    clientCallName: 'client.scenarios.runs.score',
    fullyQualifiedName: 'scenarios.runs.score',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/runs/{id}/score',
  },
  {
    clientCallName: 'client.scenarios.scorers.create',
    fullyQualifiedName: 'scenarios.scorers.create',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/scorers',
  },
  {
    clientCallName: 'client.scenarios.scorers.retrieve',
    fullyQualifiedName: 'scenarios.scorers.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/scorers/{id}',
  },
  {
    clientCallName: 'client.scenarios.scorers.update',
    fullyQualifiedName: 'scenarios.scorers.update',
    httpMethod: 'post',
    httpPath: '/v1/scenarios/scorers/{id}',
  },
  {
    clientCallName: 'client.scenarios.scorers.list',
    fullyQualifiedName: 'scenarios.scorers.list',
    httpMethod: 'get',
    httpPath: '/v1/scenarios/scorers',
  },
  {
    clientCallName: 'client.objects.create',
    fullyQualifiedName: 'objects.create',
    httpMethod: 'post',
    httpPath: '/v1/objects',
  },
  {
    clientCallName: 'client.objects.retrieve',
    fullyQualifiedName: 'objects.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/objects/{id}',
  },
  {
    clientCallName: 'client.objects.list',
    fullyQualifiedName: 'objects.list',
    httpMethod: 'get',
    httpPath: '/v1/objects',
  },
  {
    clientCallName: 'client.objects.delete',
    fullyQualifiedName: 'objects.delete',
    httpMethod: 'post',
    httpPath: '/v1/objects/{id}/delete',
  },
  {
    clientCallName: 'client.objects.complete',
    fullyQualifiedName: 'objects.complete',
    httpMethod: 'post',
    httpPath: '/v1/objects/{id}/complete',
  },
  {
    clientCallName: 'client.objects.download',
    fullyQualifiedName: 'objects.download',
    httpMethod: 'get',
    httpPath: '/v1/objects/{id}/download',
  },
  {
    clientCallName: 'client.objects.listPublic',
    fullyQualifiedName: 'objects.listPublic',
    httpMethod: 'get',
    httpPath: '/v1/objects/list_public',
  },
  {
    clientCallName: 'client.repositories.create',
    fullyQualifiedName: 'repositories.create',
    httpMethod: 'post',
    httpPath: '/v1/repositories',
  },
  {
    clientCallName: 'client.repositories.retrieve',
    fullyQualifiedName: 'repositories.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/repositories/{id}',
  },
  {
    clientCallName: 'client.repositories.list',
    fullyQualifiedName: 'repositories.list',
    httpMethod: 'get',
    httpPath: '/v1/repositories',
  },
  {
    clientCallName: 'client.repositories.delete',
    fullyQualifiedName: 'repositories.delete',
    httpMethod: 'post',
    httpPath: '/v1/repositories/{id}/delete',
  },
  {
    clientCallName: 'client.repositories.inspect',
    fullyQualifiedName: 'repositories.inspect',
    httpMethod: 'post',
    httpPath: '/v1/repositories/{id}/inspect',
  },
  {
    clientCallName: 'client.repositories.listInspections',
    fullyQualifiedName: 'repositories.listInspections',
    httpMethod: 'get',
    httpPath: '/v1/repositories/{id}/inspections',
  },
  {
    clientCallName: 'client.repositories.refresh',
    fullyQualifiedName: 'repositories.refresh',
    httpMethod: 'post',
    httpPath: '/v1/repositories/{id}/refresh',
  },
  {
    clientCallName: 'client.repositories.retrieveInspection',
    fullyQualifiedName: 'repositories.retrieveInspection',
    httpMethod: 'get',
    httpPath: '/v1/repositories/inspections/{id}',
  },
  {
    clientCallName: 'client.secrets.create',
    fullyQualifiedName: 'secrets.create',
    httpMethod: 'post',
    httpPath: '/v1/secrets',
  },
  {
    clientCallName: 'client.secrets.update',
    fullyQualifiedName: 'secrets.update',
    httpMethod: 'post',
    httpPath: '/v1/secrets/{name}',
  },
  {
    clientCallName: 'client.secrets.list',
    fullyQualifiedName: 'secrets.list',
    httpMethod: 'get',
    httpPath: '/v1/secrets',
  },
  {
    clientCallName: 'client.secrets.delete',
    fullyQualifiedName: 'secrets.delete',
    httpMethod: 'post',
    httpPath: '/v1/secrets/{name}/delete',
  },
  {
    clientCallName: 'client.networkPolicies.create',
    fullyQualifiedName: 'networkPolicies.create',
    httpMethod: 'post',
    httpPath: '/v1/network-policies',
  },
  {
    clientCallName: 'client.networkPolicies.retrieve',
    fullyQualifiedName: 'networkPolicies.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/network-policies/{id}',
  },
  {
    clientCallName: 'client.networkPolicies.update',
    fullyQualifiedName: 'networkPolicies.update',
    httpMethod: 'post',
    httpPath: '/v1/network-policies/{id}',
  },
  {
    clientCallName: 'client.networkPolicies.list',
    fullyQualifiedName: 'networkPolicies.list',
    httpMethod: 'get',
    httpPath: '/v1/network-policies',
  },
  {
    clientCallName: 'client.networkPolicies.delete',
    fullyQualifiedName: 'networkPolicies.delete',
    httpMethod: 'post',
    httpPath: '/v1/network-policies/{id}/delete',
  },
  {
    clientCallName: 'client.gatewayConfigs.create',
    fullyQualifiedName: 'gatewayConfigs.create',
    httpMethod: 'post',
    httpPath: '/v1/gateway-configs',
  },
  {
    clientCallName: 'client.gatewayConfigs.retrieve',
    fullyQualifiedName: 'gatewayConfigs.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/gateway-configs/{id}',
  },
  {
    clientCallName: 'client.gatewayConfigs.update',
    fullyQualifiedName: 'gatewayConfigs.update',
    httpMethod: 'post',
    httpPath: '/v1/gateway-configs/{id}',
  },
  {
    clientCallName: 'client.gatewayConfigs.list',
    fullyQualifiedName: 'gatewayConfigs.list',
    httpMethod: 'get',
    httpPath: '/v1/gateway-configs',
  },
  {
    clientCallName: 'client.gatewayConfigs.delete',
    fullyQualifiedName: 'gatewayConfigs.delete',
    httpMethod: 'post',
    httpPath: '/v1/gateway-configs/{id}/delete',
  },
  {
    clientCallName: 'client.mcpConfigs.create',
    fullyQualifiedName: 'mcpConfigs.create',
    httpMethod: 'post',
    httpPath: '/v1/mcp-configs',
  },
  {
    clientCallName: 'client.mcpConfigs.retrieve',
    fullyQualifiedName: 'mcpConfigs.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/mcp-configs/{id}',
  },
  {
    clientCallName: 'client.mcpConfigs.update',
    fullyQualifiedName: 'mcpConfigs.update',
    httpMethod: 'post',
    httpPath: '/v1/mcp-configs/{id}',
  },
  {
    clientCallName: 'client.mcpConfigs.list',
    fullyQualifiedName: 'mcpConfigs.list',
    httpMethod: 'get',
    httpPath: '/v1/mcp-configs',
  },
  {
    clientCallName: 'client.mcpConfigs.delete',
    fullyQualifiedName: 'mcpConfigs.delete',
    httpMethod: 'post',
    httpPath: '/v1/mcp-configs/{id}/delete',
  },
];

function allowedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  if (!options) {
    return undefined;
  }

  let allowedMethods: SdkMethod[];

  if (options.codeAllowHttpGets || options.codeAllowedMethods) {
    // Start with nothing allowed and then add into it from options
    let allowedMethodsSet = new Set<SdkMethod>();

    if (options.codeAllowHttpGets) {
      // Add all methods that map to an HTTP GET
      sdkMethods
        .filter((method) => method.httpMethod === 'get')
        .forEach((method) => allowedMethodsSet.add(method));
    }

    if (options.codeAllowedMethods) {
      // Add all methods that match any of the allowed regexps
      const allowedRegexps = options.codeAllowedMethods.map((pattern) => {
        try {
          return new RegExp(pattern);
        } catch (e) {
          throw new Error(
            `Invalid regex pattern for allowed method: "${pattern}": ${e instanceof Error ? e.message : e}`,
          );
        }
      });

      sdkMethods
        .filter((method) => allowedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)))
        .forEach((method) => allowedMethodsSet.add(method));
    }

    allowedMethods = Array.from(allowedMethodsSet);
  } else {
    // Start with everything allowed
    allowedMethods = [...sdkMethods];
  }

  if (options.codeBlockedMethods) {
    // Filter down based on blocked regexps
    const blockedRegexps = options.codeBlockedMethods.map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch (e) {
        throw new Error(
          `Invalid regex pattern for blocked method: "${pattern}": ${e instanceof Error ? e.message : e}`,
        );
      }
    });

    allowedMethods = allowedMethods.filter(
      (method) => !blockedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)),
    );
  }

  return allowedMethods;
}

export function blockedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  const allowedMethods = allowedMethodsForCodeTool(options);
  if (!allowedMethods) {
    return undefined;
  }

  const allowedSet = new Set(allowedMethods.map((method) => method.fullyQualifiedName));

  // Return any methods that are not explicitly allowed
  return sdkMethods.filter((method) => !allowedSet.has(method.fullyQualifiedName));
}
