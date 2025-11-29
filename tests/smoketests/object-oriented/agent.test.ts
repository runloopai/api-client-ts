import { Agent } from '@runloop/api-client/sdk';
import { makeClientSDK, THIRTY_SECOND_TIMEOUT, uniqueName } from '../utils';

const sdk = makeClientSDK();

describe('smoketest: object-oriented agent', () => {
  describe('agent lifecycle', () => {
    test(
      'create agent basic',
      async () => {
        const name = uniqueName('sdk-agent-test-basic');
        const agent = await sdk.agent.create({
          name: name,
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
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'get agent info',
      async () => {
        const name = uniqueName('sdk-agent-test-info');
        const agent = await sdk.agent.create({
          name: name,
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
      THIRTY_SECOND_TIMEOUT,
    );
  });

  describe('agent listing', () => {
    test(
      'list agents',
      async () => {
        const agents = await sdk.agent.list({ limit: 10 });

        expect(Array.isArray(agents)).toBe(true);
        // List might be empty, that's okay
        expect(agents.length).toBeGreaterThanOrEqual(0);
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'get agent by ID',
      async () => {
        // Create an agent
        const created = await sdk.agent.create({
          name: uniqueName('sdk-agent-test-retrieve'),
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/hello-world-agent',
            },
          },
        });

        try {
          // Retrieve it by ID
          const retrieved = sdk.agent.fromId(created.id);
          expect(retrieved.id).toBe(created.id);

          // Verify it's the same agent
          const info = await retrieved.getInfo();
          expect(info.id).toBe(created.id);
        } finally {
          // TODO: Add agent cleanup once delete endpoint is implemented
        }
      },
      THIRTY_SECOND_TIMEOUT,
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
        const agent1 = await sdk.agent.create({ name: uniqueName('sdk-agent-test-list-1'), source: sourceConfig });
        const agent2 = await sdk.agent.create({ name: uniqueName('sdk-agent-test-list-2'), source: sourceConfig });
        const agent3 = await sdk.agent.create({ name: uniqueName('sdk-agent-test-list-3'), source: sourceConfig });

        try {
          // List agents
          const agents = await sdk.agent.list({ limit: 100 });

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
      THIRTY_SECOND_TIMEOUT,
    );
  });

  describe('agent creation variations', () => {
    test(
      'agent with source npm',
      async () => {
        const name = uniqueName('sdk-agent-test-npm');

        const agent = await sdk.agent.create({
          name: name,
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
      THIRTY_SECOND_TIMEOUT,
    );

    test(
      'agent with source git',
      async () => {
        const name = uniqueName('sdk-agent-test-git');

        const agent = await sdk.agent.create({
          name: name,
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
      THIRTY_SECOND_TIMEOUT,
    );
  });
});
