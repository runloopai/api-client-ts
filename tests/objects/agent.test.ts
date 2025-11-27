import { Agent } from '../../src/sdk/agent';
import type { AgentView } from '../../src/resources/agents';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Agent (SDK)', () => {
  let mockClient: any;
  let mockAgentData: AgentView;

  beforeEach(() => {
    // Create mock client instance with proper structure
    mockClient = {
      agents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
    } as any;

    // Mock agent data
    mockAgentData = {
      id: 'agent-123',
      create_time_ms: Date.now(),
      name: 'test-agent',
      is_public: false,
      source: {
        type: 'npm',
        npm: {
          package_name: '@runloop/example-agent',
        },
      },
    };
  });

  describe('create', () => {
    it('should create an agent and return an Agent instance', async () => {
      mockClient.agents.create.mockResolvedValue(mockAgentData);

      const agent = await Agent.create(mockClient, {
        name: 'test-agent',
        source: {
          type: 'npm',
          npm: {
            package_name: '@runloop/example-agent',
          },
        },
      });

      expect(mockClient.agents.create).toHaveBeenCalledWith(
        {
          name: 'test-agent',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/example-agent',
            },
          },
        },
        undefined,
      );
      expect(agent).toBeInstanceOf(Agent);
      expect(agent.id).toBe('agent-123');
    });

    it('should support agent with git source', async () => {
      const gitAgentData = {
        ...mockAgentData,
        source: {
          type: 'git' as const,
          git: {
            repository: 'https://github.com/runloop/example-agent',
            ref: 'main',
          },
        },
      };
      mockClient.agents.create.mockResolvedValue(gitAgentData);

      const agent = await Agent.create(mockClient, {
        name: 'git-agent',
        source: {
          type: 'git',
          git: {
            repository: 'https://github.com/runloop/example-agent',
            ref: 'main',
          },
        },
      });

      expect(mockClient.agents.create).toHaveBeenCalledWith(
        {
          name: 'git-agent',
          source: {
            type: 'git',
            git: {
              repository: 'https://github.com/runloop/example-agent',
              ref: 'main',
            },
          },
        },
        undefined,
      );
      expect(agent).toBeInstanceOf(Agent);
    });

    it('should support agent with pip source', async () => {
      const pipAgentData = {
        ...mockAgentData,
        source: {
          type: 'pip' as const,
          pip: {
            package_name: 'runloop-example-agent',
          },
        },
      };
      mockClient.agents.create.mockResolvedValue(pipAgentData);

      await Agent.create(mockClient, {
        name: 'pip-agent',
        source: {
          type: 'pip',
          pip: {
            package_name: 'runloop-example-agent',
          },
        },
      });

      expect(mockClient.agents.create).toHaveBeenCalledWith(
        {
          name: 'pip-agent',
          source: {
            type: 'pip',
            pip: {
              package_name: 'runloop-example-agent',
            },
          },
        },
        undefined,
      );
    });
  });

  describe('fromId', () => {
    it('should create an Agent instance by ID without API call', () => {
      const agent = Agent.fromId(mockClient, 'agent-123');

      expect(agent).toBeInstanceOf(Agent);
      expect(agent.id).toBe('agent-123');
    });
  });

  describe('list', () => {
    it('should list agents and return Agent instances', async () => {
      const mockAgents = [
        { id: 'agent-001', name: 'first-agent', create_time_ms: Date.now(), is_public: false },
        { id: 'agent-002', name: 'second-agent', create_time_ms: Date.now(), is_public: true },
        { id: 'agent-003', name: 'third-agent', create_time_ms: Date.now(), is_public: false },
      ];

      // Mock async iterator
      const asyncIterator = {
        async *[Symbol.asyncIterator]() {
          for (const agent of mockAgents) {
            yield agent;
          }
        },
      };

      mockClient.agents.list.mockReturnValue(asyncIterator);

      const agents = await Agent.list(mockClient);

      expect(mockClient.agents.list).toHaveBeenCalledWith(undefined, undefined);
      expect(agents).toHaveLength(3);
      expect(agents[0]).toBeInstanceOf(Agent);
      expect(agents[0]!.id).toBe('agent-001');
      expect(agents[1]!.id).toBe('agent-002');
      expect(agents[2]!.id).toBe('agent-003');
    });

    it('should pass filter parameters to list', async () => {
      const asyncIterator = {
        async *[Symbol.asyncIterator]() {
          yield { id: 'agent-001', name: 'filtered-agent', create_time_ms: Date.now(), is_public: false };
        },
      };

      mockClient.agents.list.mockReturnValue(asyncIterator);

      await Agent.list(mockClient, { name: 'filtered-agent' });

      expect(mockClient.agents.list).toHaveBeenCalledWith({ name: 'filtered-agent' }, undefined);
    });

    it('should handle empty list', async () => {
      const asyncIterator = {
        async *[Symbol.asyncIterator]() {
          // Empty iterator
        },
      };

      mockClient.agents.list.mockReturnValue(asyncIterator);

      const agents = await Agent.list(mockClient);

      expect(agents).toHaveLength(0);
    });
  });

  describe('instance methods', () => {
    let agent: Agent;

    beforeEach(async () => {
      mockClient.agents.create.mockResolvedValue(mockAgentData);
      agent = await Agent.create(mockClient, {
        name: 'test-agent',
        source: {
          type: 'npm',
          npm: {
            package_name: '@runloop/example-agent',
          },
        },
      });
    });

    describe('getInfo', () => {
      it('should get agent information from API', async () => {
        const updatedData = { ...mockAgentData, is_public: true };
        mockClient.agents.retrieve.mockResolvedValue(updatedData);

        const info = await agent.getInfo();

        expect(mockClient.agents.retrieve).toHaveBeenCalledWith('agent-123', undefined);
        expect(info.is_public).toBe(true);
        expect(info.id).toBe('agent-123');
      });

      it('should pass request options to retrieve', async () => {
        mockClient.agents.retrieve.mockResolvedValue(mockAgentData);

        await agent.getInfo({ timeout: 5000 });

        expect(mockClient.agents.retrieve).toHaveBeenCalledWith('agent-123', { timeout: 5000 });
      });
    });

    describe('id property', () => {
      it('should expose agent ID', () => {
        expect(agent.id).toBe('agent-123');
      });
    });
  });

  describe('error handling', () => {
    it('should handle agent creation failure', async () => {
      const error = new Error('Creation failed');
      mockClient.agents.create.mockRejectedValue(error);

      await expect(
        Agent.create(mockClient, {
          name: 'failing-agent',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/example-agent',
            },
          },
        }),
      ).rejects.toThrow('Creation failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Agent not found');
      mockClient.agents.retrieve.mockRejectedValue(error);

      const agent = Agent.fromId(mockClient, 'non-existent');
      await expect(agent.getInfo()).rejects.toThrow('Agent not found');
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockClient.agents.list.mockImplementation(() => {
        throw error;
      });

      await expect(Agent.list(mockClient)).rejects.toThrow('List failed');
    });
  });

  describe('edge cases', () => {
    it('should handle agent with minimal configuration', async () => {
      const minimalData = {
        id: 'agent-minimal',
        create_time_ms: Date.now(),
        name: 'minimal',
        is_public: false,
      };
      mockClient.agents.create.mockResolvedValue(minimalData);

      const agent = await Agent.create(mockClient, {
        name: 'minimal',
        source: {
          type: 'npm',
          npm: {
            package_name: '@runloop/agent',
          },
        },
      });

      expect(agent.id).toBe('agent-minimal');
    });

    it('should handle agent with all source types', async () => {
      // Test with object source
      const objectAgentData = {
        ...mockAgentData,
        source: {
          type: 'object' as const,
          object: {
            object_id: 'obj-123',
          },
        },
      };
      mockClient.agents.create.mockResolvedValue(objectAgentData);

      const agent = await Agent.create(mockClient, {
        name: 'object-agent',
        source: {
          type: 'object',
          object: {
            object_id: 'obj-123',
          },
        },
      });

      expect(agent.id).toBe('agent-123');
    });
  });
});
