import { Agent, Devbox, StorageObject } from '@runloop/api-client/sdk';
import { makeClientSDK, TWO_MINUTE_TIMEOUT, uniqueName } from '../utils';

const runloop = makeClientSDK();

describe('smoketest: object-oriented agent', () => {
  describe('agent lifecycle', () => {
    test(
      'create agent basic',
      async () => {
        const name = uniqueName('sdk-agent-test-basic');
        const agent = await runloop.agent.create({
          name: name,
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/hello-world-agent',
            },
          },
        });

        try {
          expect(agent).toBeDefined();
          expect(agent.id).toBeTruthy();

          // Verify agent information
          const info = await agent.getInfo();
          expect(info.id).toBe(agent.id);
          expect(info.name).toBe(name);
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
          // Currently agents don't have a delete method - they persist after tests
          // Once implemented, add: await agent.delete();
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'get agent info',
      async () => {
        const name = uniqueName('sdk-agent-test-info');
        const agent = await runloop.agent.create({
          name: name,
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/hello-world-agent',
            },
          },
        });

        try {
          const info = await agent.getInfo();

          expect(info.id).toBe(agent.id);
          expect(info.name).toBe(name);
          expect(info.create_time_ms).toBeGreaterThan(0);
          expect(typeof info.is_public).toBe('boolean');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );
  });

  describe('agent listing', () => {
    test(
      'list agents',
      async () => {
        const agents = await runloop.agent.list({ limit: 10 });

        expect(Array.isArray(agents)).toBe(true);
        // List might be empty, that's okay
        expect(agents.length).toBeGreaterThanOrEqual(0);
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'get agent by ID',
      async () => {
        // Create an agent
        const created = await runloop.agent.create({
          name: uniqueName('sdk-agent-test-retrieve'),
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/hello-world-agent',
            },
          },
        });

        try {
          // Retrieve it by ID
          const retrieved = runloop.agent.fromId(created.id);
          expect(retrieved.id).toBe(created.id);

          // Verify it's the same agent
          const info = await retrieved.getInfo();
          expect(info.id).toBe(created.id);
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'list multiple agents',
      async () => {
        const sourceConfig = {
          type: 'npm' as const,
          npm: {
            package_name: '@runloop/hello-world-agent',
          },
        };

        // Create multiple agents
        const agent1 = await runloop.agent.create({
          name: uniqueName('sdk-agent-test-list-1'),
          version: '1.0.0',
          source: sourceConfig,
        });
        const agent2 = await runloop.agent.create({
          name: uniqueName('sdk-agent-test-list-2'),
          version: '1.0.0',
          source: sourceConfig,
        });
        const agent3 = await runloop.agent.create({
          name: uniqueName('sdk-agent-test-list-3'),
          version: '1.0.0',
          source: sourceConfig,
        });

        try {
          // List agents
          const agents = await runloop.agent.list({ limit: 100 });

          expect(Array.isArray(agents)).toBe(true);
          expect(agents.length).toBeGreaterThanOrEqual(3);

          // Verify our agents are in the list
          const agentIds = agents.map((a) => a.id);
          expect(agentIds).toContain(agent1.id);
          expect(agentIds).toContain(agent2.id);
          expect(agentIds).toContain(agent3.id);
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
          // Should delete: agent1, agent2, agent3
        }
      },
      TWO_MINUTE_TIMEOUT,
    );
  });

  describe('agent creation variations', () => {
    test(
      'agent with source npm',
      async () => {
        const name = uniqueName('sdk-agent-test-npm');

        const agent = await runloop.agent.create({
          name: name,
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/example-agent',
            },
          },
        });

        try {
          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(name);
          expect(info.source).toBeDefined();
          expect(info.source!.type).toBe('npm');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'agent with source git',
      async () => {
        const name = uniqueName('sdk-agent-test-git');

        const agent = await runloop.agent.create({
          name: name,
          version: '1.0.0',
          source: {
            type: 'git',
            git: {
              repository: 'https://github.com/runloop/example-agent',
              ref: 'main',
            },
          },
        });

        try {
          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(name);
          expect(info.source).toBeDefined();
          expect(info.source!.type).toBe('git');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );
  });

  describe('agent convenience methods', () => {
    test(
      'createFromNpm',
      async () => {
        const name = uniqueName('sdk-agent-from-npm');
        const agent = await runloop.agent.createFromNpm({
          name: name,
          version: '1.0.0',
          package_name: '@runloop/hello-world-agent',
        });

        try {
          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(name);
          expect(info.source?.type).toBe('npm');
          expect(info.source?.npm?.package_name).toBe('@runloop/hello-world-agent');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'createFromPip',
      async () => {
        const name = uniqueName('sdk-agent-from-pip');
        const agent = await runloop.agent.createFromPip({
          name: name,
          version: '1.0.0',
          package_name: 'runloop-example-agent',
        });

        try {
          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(name);
          expect(info.source?.type).toBe('pip');
          expect(info.source?.pip?.package_name).toBe('runloop-example-agent');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'createFromGit',
      async () => {
        const name = uniqueName('sdk-agent-from-git');
        const agent = await runloop.agent.createFromGit({
          name: name,
          version: '1.0.0',
          repository: 'https://github.com/runloop/example-agent',
          ref: 'main',
        });

        try {
          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(name);
          expect(info.source?.type).toBe('git');
          expect(info.source?.git?.repository).toBe('https://github.com/runloop/example-agent');
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );

    test(
      'createFromObject with storage object',
      async () => {
        let storageObject: StorageObject | undefined;
        let agent: Agent | undefined;

        try {
          // Create storage object with agent content
          storageObject = await runloop.storageObject.create({
            name: uniqueName('sdk-agent-storage-object'),
            content_type: 'text',
            metadata: { test: 'agent-smoketest' },
          });

          await storageObject.uploadContent('Agent content for testing');
          await storageObject.complete();

          // Create agent from storage object
          const agentName = uniqueName('sdk-agent-from-object');
          agent = await runloop.agent.createFromObject({
            name: agentName,
            version: '1.0.0',
            object_id: storageObject.id,
          });

          expect(agent.id).toBeTruthy();
          const info = await agent.getInfo();
          expect(info.name).toBe(agentName);
          expect(info.source?.type).toBe('object');
          expect(info.source?.object?.object_id).toBe(storageObject.id);
        } finally {
          if (storageObject) {
            await storageObject.delete();
          }
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT,
    );
  });

  describe('agent with devbox mounting', () => {
    test(
      'mount agent from storage object into devbox',
      async () => {
        let storageObject: StorageObject | undefined;
        let agent: Agent | undefined;
        let devbox: Devbox | undefined;

        try {
          // Create storage object with agent content
          storageObject = await runloop.storageObject.create({
            name: uniqueName('sdk-agent-mount-storage'),
            content_type: 'text',
            metadata: { test: 'agent-mount-smoketest' },
          });

          await storageObject.uploadContent('Agent content for devbox mounting');
          await storageObject.complete();

          // Create agent from storage object
          agent = await runloop.agent.createFromObject({
            name: uniqueName('sdk-agent-for-mount'),
            version: '1.0.0',
            object_id: storageObject.id,
          });

          // Create devbox with agent mount
          devbox = await runloop.devbox.create({
            name: uniqueName('sdk-devbox-with-agent'),
            launch_parameters: {
              resource_size_request: 'X_SMALL',
              keep_alive_time_seconds: 60 * 5, // 5 minutes
            },
            mounts: [
              {
                type: 'agent_mount',
                agent_id: agent.id,
                agent_name: null,
                agent_path: '/home/user/test-agent',
              },
            ],
          });

          expect(devbox.id).toBeTruthy();

          // Wait for devbox to be running
          const info = await devbox.getInfo();
          if (info.status !== 'running') {
            // Poll until running (simplified approach)
            let attempts = 0;
            while (attempts < 60) {
              const currentInfo = await devbox.getInfo();
              if (currentInfo.status === 'running') {
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 5000));
              attempts++;
            }
          }

          // Verify the agent was mounted
          const result = await devbox.cmd.exec('ls -la /home/user/test-agent');
          expect(result.exitCode).toBe(0);
        } finally {
          if (devbox) {
            await devbox.shutdown();
          }
          if (storageObject) {
            await storageObject.delete();
          }
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      TWO_MINUTE_TIMEOUT * 8,
    );
  });
});
