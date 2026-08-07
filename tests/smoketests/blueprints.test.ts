import { cleanUpBlueprintsByName, LONG_TIMEOUT, makeClient, MEDIUM_TIMEOUT, uniqueName } from './utils';
import { DevboxView } from '@runloop/api-client/resources/devboxes';

const client = makeClient();

describe('smoketest: blueprints', () => {
  /**
   * Test the lifecycle of a blueprint. These tests are dependent on each other to save time.
   */
  describe('blueprint lifecycle', () => {
    let blueprintId: string | undefined;
    let blueprintName = uniqueName('bp');

    afterAll(async () => {
      await cleanUpBlueprintsByName(client, blueprintName);
    });

    test(
      'create blueprint and await build',
      async () => {
        const created = await client.blueprints.createAndAwaitBuildCompleted(
          {
            name: blueprintName,
          },
          {
            longPoll: { timeoutMs: MEDIUM_TIMEOUT },
          },
        );
        expect(created.status).toBe('build_complete');
        blueprintId = created.id;
      },
      LONG_TIMEOUT,
    );

    test(
      'start devbox from base blueprint by ID',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              blueprint_id: blueprintId!,
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
            },
            {
              longPoll: { timeoutMs: MEDIUM_TIMEOUT },
            },
          );
          expect(devbox.blueprint_id).toBe(blueprintId);
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      LONG_TIMEOUT,
    );

    test(
      'start devbox from base blueprint by Name',
      async () => {
        let devbox: DevboxView | undefined;
        try {
          devbox = await client.devboxes.createAndAwaitRunning(
            {
              blueprint_name: blueprintName,
              launch_parameters: { resource_size_request: 'X_SMALL', keep_alive_time_seconds: 60 * 5 }, // 5 minutes
            },
            {
              longPoll: { timeoutMs: MEDIUM_TIMEOUT },
            },
          );
          expect(devbox.blueprint_id).toBeTruthy();
        } finally {
          if (devbox) {
            await client.devboxes.shutdown(devbox.id);
          }
        }
      },
      LONG_TIMEOUT,
    );
  });

  // Only run secrets test in CI where the secret is available
  (process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('blueprint secrets', () => {
    const secretsBlueprintName = uniqueName('bp-secrets');

    test.concurrent(
      'create blueprint with secret in Dockerfile and await build',
      async () => {
        try {
          const bpt = await client.blueprints.createAndAwaitBuildCompleted(
            {
              name: secretsBlueprintName,
              dockerfile:
                'FROM runloop:runloop/starter-arm64\nARG GITHUB_TOKEN\nRUN git config --global credential.helper \'!f() { echo "username=x-access-token"; echo "password=$GITHUB_TOKEN"; }; f\' && git clone https://github.com/runloopai/runloop-fe.git /workspace/runloop-fe && git config --global --unset credential.helper\nWORKDIR /workspace/runloop-fe',
              secrets: {
                GITHUB_TOKEN: 'GITHUB_TOKEN_FOR_SMOKETESTS',
              },
            },
            {
              longPoll: { timeoutMs: MEDIUM_TIMEOUT },
            },
          );

          expect(bpt.status).toBe('build_complete');
          expect(bpt.parameters.secrets?.['GITHUB_TOKEN']).toBe('GITHUB_TOKEN_FOR_SMOKETESTS');
        } finally {
          await cleanUpBlueprintsByName(client, secretsBlueprintName);
        }
      },
      LONG_TIMEOUT,
    );
  });
});
