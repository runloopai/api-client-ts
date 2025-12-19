import { ScorerOps } from '../../src/sdk';
import { Scorer } from '../../src/sdk/scorer';

// Mock the Scorer class
jest.mock('../../src/sdk/scorer');

describe('ScorerOps', () => {
  let mockClient: any;
  let scorerOps: ScorerOps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      scenarios: {
        scorers: {
          list: jest.fn(),
        },
      },
    } as any;

    scorerOps = new ScorerOps(mockClient);

    // Note: We keep these ops-level tests even though they may feel duplicative with Scorer tests,
    // because they cover what users call (`runloop.scorer.*`) and help ensure SDK-level coverage.
    jest.spyOn(Scorer as any, 'fromId').mockImplementation((_client: any, id: string) => {
      return { id } as unknown as Scorer;
    });
  });

  describe('create', () => {
    it('should delegate to Scorer.create', async () => {
      const mockScorerInstance = { id: 'sco-123', getInfo: jest.fn() } as unknown as Scorer;
      jest.spyOn(Scorer as any, 'create').mockResolvedValue(mockScorerInstance);

      const scorer = await scorerOps.create(
        {
          type: 'my_scorer',
          bash_script: 'echo "score=1.0"',
        },
        undefined,
      );

      expect(Scorer.create).toHaveBeenCalledWith(
        mockClient,
        {
          type: 'my_scorer',
          bash_script: 'echo "score=1.0"',
        },
        undefined,
      );
      expect(scorer.id).toBe('sco-123');
    });
  });

  describe('fromId', () => {
    it('should delegate to Scorer.fromId', () => {
      const scorer = scorerOps.fromId('sco-123');
      expect(Scorer.fromId).toHaveBeenCalledWith(mockClient, 'sco-123');
      expect(scorer.id).toBe('sco-123');
    });
  });

  describe('list', () => {
    it('should list scorers and return Scorer instances by ID', async () => {
      const page = {
        async *[Symbol.asyncIterator]() {
          yield { id: 'sco-1' };
          yield { id: 'sco-2' };
        },
      } as any;

      mockClient.scenarios.scorers.list.mockResolvedValue(page);

      const scorers = await scorerOps.list({ limit: 2 });

      expect(mockClient.scenarios.scorers.list).toHaveBeenCalledWith({ limit: 2 }, undefined);
      expect(Scorer.fromId).toHaveBeenCalledWith(mockClient, 'sco-1');
      expect(Scorer.fromId).toHaveBeenCalledWith(mockClient, 'sco-2');

      expect(Array.isArray(scorers)).toBe(true);
      expect(scorers).toHaveLength(2);
      expect(scorers[0].id).toBe('sco-1');
      expect(scorers[1].id).toBe('sco-2');
    });
  });
});


