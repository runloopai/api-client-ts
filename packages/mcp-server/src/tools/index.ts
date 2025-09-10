// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, Endpoint, HandlerFunction } from './types';

export { Metadata, Endpoint, HandlerFunction };

import create_benchmarks from './benchmarks/create-benchmarks';
import retrieve_benchmarks from './benchmarks/retrieve-benchmarks';
import update_benchmarks from './benchmarks/update-benchmarks';
import list_benchmarks from './benchmarks/list-benchmarks';
import definitions_benchmarks from './benchmarks/definitions-benchmarks';
import list_public_benchmarks from './benchmarks/list-public-benchmarks';
import start_run_benchmarks from './benchmarks/start-run-benchmarks';
import retrieve_benchmarks_runs from './benchmarks/runs/retrieve-benchmarks-runs';
import list_benchmarks_runs from './benchmarks/runs/list-benchmarks-runs';
import cancel_benchmarks_runs from './benchmarks/runs/cancel-benchmarks-runs';
import complete_benchmarks_runs from './benchmarks/runs/complete-benchmarks-runs';
import list_scenario_runs_benchmarks_runs from './benchmarks/runs/list-scenario-runs-benchmarks-runs';
import create_blueprints from './blueprints/create-blueprints';
import retrieve_blueprints from './blueprints/retrieve-blueprints';
import list_blueprints from './blueprints/list-blueprints';
import delete_blueprints from './blueprints/delete-blueprints';
import list_public_blueprints from './blueprints/list-public-blueprints';
import logs_blueprints from './blueprints/logs-blueprints';
import preview_blueprints from './blueprints/preview-blueprints';
import create_devboxes from './devboxes/create-devboxes';
import retrieve_devboxes from './devboxes/retrieve-devboxes';
import update_devboxes from './devboxes/update-devboxes';
import list_devboxes from './devboxes/list-devboxes';
import create_ssh_key_devboxes from './devboxes/create-ssh-key-devboxes';
import create_tunnel_devboxes from './devboxes/create-tunnel-devboxes';
import delete_disk_snapshot_devboxes from './devboxes/delete-disk-snapshot-devboxes';
import download_file_devboxes from './devboxes/download-file-devboxes';
import execute_devboxes from './devboxes/execute-devboxes';
import execute_async_devboxes from './devboxes/execute-async-devboxes';
import execute_sync_devboxes from './devboxes/execute-sync-devboxes';
import keep_alive_devboxes from './devboxes/keep-alive-devboxes';
import list_disk_snapshots_devboxes from './devboxes/list-disk-snapshots-devboxes';
import read_file_contents_devboxes from './devboxes/read-file-contents-devboxes';
import remove_tunnel_devboxes from './devboxes/remove-tunnel-devboxes';
import resume_devboxes from './devboxes/resume-devboxes';
import shutdown_devboxes from './devboxes/shutdown-devboxes';
import snapshot_disk_devboxes from './devboxes/snapshot-disk-devboxes';
import snapshot_disk_async_devboxes from './devboxes/snapshot-disk-async-devboxes';
import suspend_devboxes from './devboxes/suspend-devboxes';
import upload_file_devboxes from './devboxes/upload-file-devboxes';
import wait_for_command_devboxes from './devboxes/wait-for-command-devboxes';
import write_file_contents_devboxes from './devboxes/write-file-contents-devboxes';
import update_devboxes_disk_snapshots from './devboxes/disk-snapshots/update-devboxes-disk-snapshots';
import list_devboxes_disk_snapshots from './devboxes/disk-snapshots/list-devboxes-disk-snapshots';
import delete_devboxes_disk_snapshots from './devboxes/disk-snapshots/delete-devboxes-disk-snapshots';
import query_status_devboxes_disk_snapshots from './devboxes/disk-snapshots/query-status-devboxes-disk-snapshots';
import create_devboxes_browsers from './devboxes/browsers/create-devboxes-browsers';
import retrieve_devboxes_browsers from './devboxes/browsers/retrieve-devboxes-browsers';
import create_devboxes_computers from './devboxes/computers/create-devboxes-computers';
import retrieve_devboxes_computers from './devboxes/computers/retrieve-devboxes-computers';
import keyboard_interaction_devboxes_computers from './devboxes/computers/keyboard-interaction-devboxes-computers';
import mouse_interaction_devboxes_computers from './devboxes/computers/mouse-interaction-devboxes-computers';
import screen_interaction_devboxes_computers from './devboxes/computers/screen-interaction-devboxes-computers';
import apply_code_action_devboxes_lsp from './devboxes/lsp/apply-code-action-devboxes-lsp';
import code_actions_devboxes_lsp from './devboxes/lsp/code-actions-devboxes-lsp';
import diagnostics_devboxes_lsp from './devboxes/lsp/diagnostics-devboxes-lsp';
import document_symbols_devboxes_lsp from './devboxes/lsp/document-symbols-devboxes-lsp';
import file_devboxes_lsp from './devboxes/lsp/file-devboxes-lsp';
import file_definition_devboxes_lsp from './devboxes/lsp/file-definition-devboxes-lsp';
import files_devboxes_lsp from './devboxes/lsp/files-devboxes-lsp';
import formatting_devboxes_lsp from './devboxes/lsp/formatting-devboxes-lsp';
import get_code_actions_for_diagnostic_devboxes_lsp from './devboxes/lsp/get-code-actions-for-diagnostic-devboxes-lsp';
import get_code_segment_info_devboxes_lsp from './devboxes/lsp/get-code-segment-info-devboxes-lsp';
import get_signature_help_devboxes_lsp from './devboxes/lsp/get-signature-help-devboxes-lsp';
import health_devboxes_lsp from './devboxes/lsp/health-devboxes-lsp';
import references_devboxes_lsp from './devboxes/lsp/references-devboxes-lsp';
import set_watch_directory_devboxes_lsp from './devboxes/lsp/set-watch-directory-devboxes-lsp';
import list_devboxes_logs from './devboxes/logs/list-devboxes-logs';
import retrieve_devboxes_executions from './devboxes/executions/retrieve-devboxes-executions';
import execute_async_devboxes_executions from './devboxes/executions/execute-async-devboxes-executions';
import execute_sync_devboxes_executions from './devboxes/executions/execute-sync-devboxes-executions';
import kill_devboxes_executions from './devboxes/executions/kill-devboxes-executions';
import stream_stderr_updates_devboxes_executions from './devboxes/executions/stream-stderr-updates-devboxes-executions';
import stream_stdout_updates_devboxes_executions from './devboxes/executions/stream-stdout-updates-devboxes-executions';
import create_scenarios from './scenarios/create-scenarios';
import retrieve_scenarios from './scenarios/retrieve-scenarios';
import update_scenarios from './scenarios/update-scenarios';
import list_scenarios from './scenarios/list-scenarios';
import list_public_scenarios from './scenarios/list-public-scenarios';
import start_run_scenarios from './scenarios/start-run-scenarios';
import retrieve_scenarios_runs from './scenarios/runs/retrieve-scenarios-runs';
import list_scenarios_runs from './scenarios/runs/list-scenarios-runs';
import cancel_scenarios_runs from './scenarios/runs/cancel-scenarios-runs';
import complete_scenarios_runs from './scenarios/runs/complete-scenarios-runs';
import download_logs_scenarios_runs from './scenarios/runs/download-logs-scenarios-runs';
import score_scenarios_runs from './scenarios/runs/score-scenarios-runs';
import create_scenarios_scorers from './scenarios/scorers/create-scenarios-scorers';
import retrieve_scenarios_scorers from './scenarios/scorers/retrieve-scenarios-scorers';
import update_scenarios_scorers from './scenarios/scorers/update-scenarios-scorers';
import list_scenarios_scorers from './scenarios/scorers/list-scenarios-scorers';
import validate_scenarios_scorers from './scenarios/scorers/validate-scenarios-scorers';
import create_objects from './objects/create-objects';
import retrieve_objects from './objects/retrieve-objects';
import list_objects from './objects/list-objects';
import delete_objects from './objects/delete-objects';
import complete_objects from './objects/complete-objects';
import download_objects from './objects/download-objects';
import list_public_objects from './objects/list-public-objects';
import create_repositories from './repositories/create-repositories';
import retrieve_repositories from './repositories/retrieve-repositories';
import list_repositories from './repositories/list-repositories';
import delete_repositories from './repositories/delete-repositories';
import list_inspections_repositories from './repositories/list-inspections-repositories';
import refresh_repositories from './repositories/refresh-repositories';
import create_secrets from './secrets/create-secrets';
import update_secrets from './secrets/update-secrets';
import list_secrets from './secrets/list-secrets';
import delete_secrets from './secrets/delete-secrets';

export const endpoints: Endpoint[] = [];

function addEndpoint(endpoint: Endpoint) {
  endpoints.push(endpoint);
}

addEndpoint(create_benchmarks);
addEndpoint(retrieve_benchmarks);
addEndpoint(update_benchmarks);
addEndpoint(list_benchmarks);
addEndpoint(definitions_benchmarks);
addEndpoint(list_public_benchmarks);
addEndpoint(start_run_benchmarks);
addEndpoint(retrieve_benchmarks_runs);
addEndpoint(list_benchmarks_runs);
addEndpoint(cancel_benchmarks_runs);
addEndpoint(complete_benchmarks_runs);
addEndpoint(list_scenario_runs_benchmarks_runs);
addEndpoint(create_blueprints);
addEndpoint(retrieve_blueprints);
addEndpoint(list_blueprints);
addEndpoint(delete_blueprints);
addEndpoint(list_public_blueprints);
addEndpoint(logs_blueprints);
addEndpoint(preview_blueprints);
addEndpoint(create_devboxes);
addEndpoint(retrieve_devboxes);
addEndpoint(update_devboxes);
addEndpoint(list_devboxes);
addEndpoint(create_ssh_key_devboxes);
addEndpoint(create_tunnel_devboxes);
addEndpoint(delete_disk_snapshot_devboxes);
addEndpoint(download_file_devboxes);
addEndpoint(execute_devboxes);
addEndpoint(execute_async_devboxes);
addEndpoint(execute_sync_devboxes);
addEndpoint(keep_alive_devboxes);
addEndpoint(list_disk_snapshots_devboxes);
addEndpoint(read_file_contents_devboxes);
addEndpoint(remove_tunnel_devboxes);
addEndpoint(resume_devboxes);
addEndpoint(shutdown_devboxes);
addEndpoint(snapshot_disk_devboxes);
addEndpoint(snapshot_disk_async_devboxes);
addEndpoint(suspend_devboxes);
addEndpoint(upload_file_devboxes);
addEndpoint(wait_for_command_devboxes);
addEndpoint(write_file_contents_devboxes);
addEndpoint(update_devboxes_disk_snapshots);
addEndpoint(list_devboxes_disk_snapshots);
addEndpoint(delete_devboxes_disk_snapshots);
addEndpoint(query_status_devboxes_disk_snapshots);
addEndpoint(create_devboxes_browsers);
addEndpoint(retrieve_devboxes_browsers);
addEndpoint(create_devboxes_computers);
addEndpoint(retrieve_devboxes_computers);
addEndpoint(keyboard_interaction_devboxes_computers);
addEndpoint(mouse_interaction_devboxes_computers);
addEndpoint(screen_interaction_devboxes_computers);
addEndpoint(apply_code_action_devboxes_lsp);
addEndpoint(code_actions_devboxes_lsp);
addEndpoint(diagnostics_devboxes_lsp);
addEndpoint(document_symbols_devboxes_lsp);
addEndpoint(file_devboxes_lsp);
addEndpoint(file_definition_devboxes_lsp);
addEndpoint(files_devboxes_lsp);
addEndpoint(formatting_devboxes_lsp);
addEndpoint(get_code_actions_for_diagnostic_devboxes_lsp);
addEndpoint(get_code_segment_info_devboxes_lsp);
addEndpoint(get_signature_help_devboxes_lsp);
addEndpoint(health_devboxes_lsp);
addEndpoint(references_devboxes_lsp);
addEndpoint(set_watch_directory_devboxes_lsp);
addEndpoint(list_devboxes_logs);
addEndpoint(retrieve_devboxes_executions);
addEndpoint(execute_async_devboxes_executions);
addEndpoint(execute_sync_devboxes_executions);
addEndpoint(kill_devboxes_executions);
addEndpoint(stream_stderr_updates_devboxes_executions);
addEndpoint(stream_stdout_updates_devboxes_executions);
addEndpoint(create_scenarios);
addEndpoint(retrieve_scenarios);
addEndpoint(update_scenarios);
addEndpoint(list_scenarios);
addEndpoint(list_public_scenarios);
addEndpoint(start_run_scenarios);
addEndpoint(retrieve_scenarios_runs);
addEndpoint(list_scenarios_runs);
addEndpoint(cancel_scenarios_runs);
addEndpoint(complete_scenarios_runs);
addEndpoint(download_logs_scenarios_runs);
addEndpoint(score_scenarios_runs);
addEndpoint(create_scenarios_scorers);
addEndpoint(retrieve_scenarios_scorers);
addEndpoint(update_scenarios_scorers);
addEndpoint(list_scenarios_scorers);
addEndpoint(validate_scenarios_scorers);
addEndpoint(create_objects);
addEndpoint(retrieve_objects);
addEndpoint(list_objects);
addEndpoint(delete_objects);
addEndpoint(complete_objects);
addEndpoint(download_objects);
addEndpoint(list_public_objects);
addEndpoint(create_repositories);
addEndpoint(retrieve_repositories);
addEndpoint(list_repositories);
addEndpoint(delete_repositories);
addEndpoint(list_inspections_repositories);
addEndpoint(refresh_repositories);
addEndpoint(create_secrets);
addEndpoint(update_secrets);
addEndpoint(list_secrets);
addEndpoint(delete_secrets);

export type Filter = {
  type: 'resource' | 'operation' | 'tag' | 'tool';
  op: 'include' | 'exclude';
  value: string;
};

export function query(filters: Filter[], endpoints: Endpoint[]): Endpoint[] {
  const allExcludes = filters.length > 0 && filters.every((filter) => filter.op === 'exclude');
  const unmatchedFilters = new Set(filters);

  const filtered = endpoints.filter((endpoint: Endpoint) => {
    let included = false || allExcludes;

    for (const filter of filters) {
      if (match(filter, endpoint)) {
        unmatchedFilters.delete(filter);
        included = filter.op === 'include';
      }
    }

    return included;
  });

  // Check if any filters didn't match
  const unmatched = Array.from(unmatchedFilters).filter((f) => f.type === 'tool' || f.type === 'resource');
  if (unmatched.length > 0) {
    throw new Error(
      `The following filters did not match any endpoints: ${unmatched
        .map((f) => `${f.type}=${f.value}`)
        .join(', ')}`,
    );
  }

  return filtered;
}

function match({ type, value }: Filter, endpoint: Endpoint): boolean {
  switch (type) {
    case 'resource': {
      const regexStr = '^' + normalizeResource(value).replace(/\*/g, '.*') + '$';
      const regex = new RegExp(regexStr);
      return regex.test(normalizeResource(endpoint.metadata.resource));
    }
    case 'operation':
      return endpoint.metadata.operation === value;
    case 'tag':
      return endpoint.metadata.tags.includes(value);
    case 'tool':
      return endpoint.tool.name === value;
  }
}

function normalizeResource(resource: string): string {
  return resource.toLowerCase().replace(/[^a-z.*\-_]*/g, '');
}
