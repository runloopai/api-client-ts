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
    jest.spyOn(Scorer as any, 'fromId').mockImplementation((...args: any[]) => {
      const id = args[1] as string;
      return { id } as unknown as Scorer;
    });
  });

  describe('create', () => {
    it('should delegate to Scorer.create', async () => {
      const mockScorerInstance = { id: 'scs_123', getInfo: jest.fn() } as unknown as Scorer;
      jest.spyOn(Scorer as any, 'create').mockResolvedValue(mockScorerInstance);

      const scorer = await scorerOps.create(
        {
          type: 'my_scorer',
          bash_script: 'echo "1.0"',
        },
        undefined,
      );

      expect(Scorer.create).toHaveBeenCalledWith(
        mockClient,
        {
          type: 'my_scorer',
          bash_script: 'echo "1.0"',
        },
        undefined,
      );
      expect(scorer.id).toBe('scs_123');
    });
  });

  describe('fromId', () => {
    it('should delegate to Scorer.fromId', () => {
      const scorer = scorerOps.fromId('scs_123');
      expect(Scorer.fromId).toHaveBeenCalledWith(mockClient, 'scs_123');
      expect(scorer.id).toBe('scs_123');
    });
  });

  describe('list', () => {
    it('should delegate to Scorer.list', async () => {
      jest
        .spyOn(Scorer as any, 'list')
        .mockResolvedValue([{ id: 'scs_1' }, { id: 'scs_2' }] as unknown as Scorer[]);

      const scorers = await scorerOps.list({ limit: 2 });

      expect(Scorer.list).toHaveBeenCalledWith(mockClient, { limit: 2 }, undefined);
      expect(scorers).toHaveLength(2);
      expect(scorers[0]!.id).toBe('scs_1');
      expect(scorers[1]!.id).toBe('scs_2');
    });
  });
});
