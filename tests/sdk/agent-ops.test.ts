import { AgentOps } from '../../src/sdk';
import { Agent } from '../../src/sdk/agent';
import type { AgentView } from '../../src/resources/agents';

// Mock the Agent class
jest.mock('../../src/sdk/agent');

describe('AgentOps', () => {
  let mockClient: any;
  let agentOps: AgentOps;
  let mockAgentData: AgentView;

  beforeEach(() => {
    // Create mock client
    jest.clearAllMocks();
    mockClient = {
      agents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
    } as any;

    agentOps = new AgentOps(mockClient);

    // Mock agent data
    mockAgentData = {
      id: 'agent-123',
      create_time_ms: Date.now(),
      name: 'test-agent',
      version: '1.0.0',
      is_public: false,
      source: {
        type: 'npm',
        npm: {
          package_name: '@runloop/example-agent',
        },
      },
    };

    // Mock Agent.create to return a mock Agent instance
    const mockAgentInstance = { id: 'agent-123', getInfo: jest.fn() } as unknown as Agent;
    jest.spyOn(Agent as any, 'create').mockResolvedValue(mockAgentInstance);
  });

  describe('createFromNpm', () => {
    it('should create an agent from npm package', async () => {
      await agentOps.createFromNpm({
        name: 'test-agent',
        version: '1.0.0',
        package_name: '@runloop/example-agent',
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/example-agent',
            },
          },
        },
        undefined,
      );
    });

    it('should create an agent with all npm options', async () => {
      await agentOps.createFromNpm({
        name: 'test-agent',
        version: '1.0.0',
        package_name: '@runloop/example-agent',
        npm_version: '1.2.3',
        registry_url: 'https://registry.example.com',
        agent_setup: ['npm install', 'npm run setup'],
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'npm',
            npm: {
              package_name: '@runloop/example-agent',
              npm_version: '1.2.3',
              registry_url: 'https://registry.example.com',
              agent_setup: ['npm install', 'npm run setup'],
            },
          },
        },
        undefined,
      );
    });
  });

  describe('createFromPip', () => {
    it('should create an agent from pip package', async () => {
      await agentOps.createFromPip({
        name: 'test-agent',
        version: '1.0.0',
        package_name: 'runloop-example-agent',
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
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

    it('should create an agent with all pip options', async () => {
      await agentOps.createFromPip({
        name: 'test-agent',
        version: '1.0.0',
        package_name: 'runloop-example-agent',
        pip_version: '1.2.3',
        registry_url: 'https://pypi.example.com',
        agent_setup: ['pip install extra-deps'],
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'pip',
            pip: {
              package_name: 'runloop-example-agent',
              pip_version: '1.2.3',
              registry_url: 'https://pypi.example.com',
              agent_setup: ['pip install extra-deps'],
            },
          },
        },
        undefined,
      );
    });
  });

  describe('createFromGit', () => {
    it('should create an agent from git repository', async () => {
      await agentOps.createFromGit({
        name: 'test-agent',
        version: '1.0.0',
        repository: 'https://github.com/example/agent-repo',
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'git',
            git: {
              repository: 'https://github.com/example/agent-repo',
            },
          },
        },
        undefined,
      );
    });

    it('should create an agent with all git options', async () => {
      await agentOps.createFromGit({
        name: 'test-agent',
        version: '1.0.0',
        repository: 'https://github.com/example/agent-repo',
        ref: 'develop',
        agent_setup: ['npm install', 'npm run build'],
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'git',
            git: {
              repository: 'https://github.com/example/agent-repo',
              ref: 'develop',
              agent_setup: ['npm install', 'npm run build'],
            },
          },
        },
        undefined,
      );
    });
  });

  describe('createFromObject', () => {
    it('should create an agent from object', async () => {
      await agentOps.createFromObject({
        name: 'test-agent',
        version: '1.0.0',
        object_id: 'obj_123',
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'object',
            object: {
              object_id: 'obj_123',
            },
          },
        },
        undefined,
      );
    });

    it('should create an agent with agent_setup', async () => {
      await agentOps.createFromObject({
        name: 'test-agent',
        version: '1.0.0',
        object_id: 'obj_123',
        agent_setup: ['chmod +x setup.sh', './setup.sh'],
      });

      expect(Agent.create).toHaveBeenCalledWith(
        mockClient,
        {
          name: 'test-agent',
          version: '1.0.0',
          source: {
            type: 'object',
            object: {
              object_id: 'obj_123',
              agent_setup: ['chmod +x setup.sh', './setup.sh'],
            },
          },
        },
        undefined,
      );
    });
  });
});
