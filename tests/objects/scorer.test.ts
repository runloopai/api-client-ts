import { Scorer } from '../../src/sdk/scorer';
import type {
  ScorerRetrieveResponse,
  ScorerUpdateResponse,
  ScorerValidateResponse,
} from '../../src/resources/scenarios/scorers';

// Mock the Runloop client
jest.mock('../../src/index');

describe('Scorer', () => {
  let mockClient: any;
  let mockScorerData: ScorerRetrieveResponse;
  let mockValidateResult: ScorerValidateResponse;

  beforeEach(() => {
    mockClient = {
      scenarios: {
        scorers: {
          create: jest.fn(),
          retrieve: jest.fn(),
          update: jest.fn(),
          validate: jest.fn(),
        },
      },
    } as any;

    mockScorerData = {
      id: 'sco-123',
      type: 'my_custom_scorer',
      bash_script: 'echo "score=1.0"',
    };

    mockValidateResult = {
      name: 'my_custom_scorer',
      scoring_context: { output: 'test' },
      scoring_result: {
        output: 'score=1.0',
        score: 1.0,
        state: 'complete',
        scoring_function_name: 'test-scorer',
      },
    };
  });

  describe('fromId', () => {
    it('should create a Scorer instance by ID without API call', () => {
      const scorer = Scorer.fromId(mockClient, 'sco-123');

      expect(scorer).toBeInstanceOf(Scorer);
      expect(scorer.id).toBe('sco-123');
    });
  });

  describe('create', () => {
    it('should create a scorer via API and return a Scorer instance', async () => {
      mockClient.scenarios.scorers.create.mockResolvedValue(mockScorerData);

      const scorer = await Scorer.create(mockClient, {
        type: 'my_custom_scorer',
        bash_script: 'echo "score=1.0"',
      });

      expect(mockClient.scenarios.scorers.create).toHaveBeenCalledWith(
        { type: 'my_custom_scorer', bash_script: 'echo "score=1.0"' },
        undefined,
      );
      expect(scorer).toBeInstanceOf(Scorer);
      expect(scorer.id).toBe('sco-123');
    });
  });

  describe('getInfo', () => {
    it('should retrieve scorer information from API', async () => {
      mockClient.scenarios.scorers.retrieve.mockResolvedValue(mockScorerData);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      const info = await scorer.getInfo();

      expect(mockClient.scenarios.scorers.retrieve).toHaveBeenCalledWith('sco-123', undefined);
      expect(info).toEqual(mockScorerData);
      expect(info.type).toBe('my_custom_scorer');
      expect(info.bash_script).toBe('echo "score=1.0"');
    });

    it('should pass options to the API client', async () => {
      mockClient.scenarios.scorers.retrieve.mockResolvedValue(mockScorerData);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      await scorer.getInfo({ timeout: 5000 });

      expect(mockClient.scenarios.scorers.retrieve).toHaveBeenCalledWith('sco-123', { timeout: 5000 });
    });
  });

  describe('update', () => {
    it('should update scorer with provided parameters', async () => {
      const updatedData: ScorerUpdateResponse = {
        ...mockScorerData,
        type: 'my_custom_scorer_v2',
        bash_script: 'echo "score=0.5"',
      };
      mockClient.scenarios.scorers.update.mockResolvedValue(updatedData);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      const result = await scorer.update({
        type: 'my_custom_scorer_v2',
        bash_script: 'echo "score=0.5"',
      });

      expect(mockClient.scenarios.scorers.update).toHaveBeenCalledWith(
        'sco-123',
        { type: 'my_custom_scorer_v2', bash_script: 'echo "score=0.5"' },
        undefined,
      );
      expect(result.type).toBe('my_custom_scorer_v2');
    });

    it('should pass options to the API client', async () => {
      mockClient.scenarios.scorers.update.mockResolvedValue(mockScorerData);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      await scorer.update({ type: 'updated', bash_script: 'echo "score=1.0"' }, { timeout: 5000 });

      expect(mockClient.scenarios.scorers.update).toHaveBeenCalledWith(
        'sco-123',
        { type: 'updated', bash_script: 'echo "score=1.0"' },
        { timeout: 5000 },
      );
    });
  });

  describe('validate', () => {
    it('should validate scorer with scoring context', async () => {
      mockClient.scenarios.scorers.validate.mockResolvedValue(mockValidateResult);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      const result = await scorer.validate({
        scoring_context: { output: 'test output', expected: 'expected output' },
      });

      expect(mockClient.scenarios.scorers.validate).toHaveBeenCalledWith(
        'sco-123',
        { scoring_context: { output: 'test output', expected: 'expected output' } },
        undefined,
      );
      expect(result.scoring_result.score).toBe(1.0);
      expect(result.scoring_result.output).toBe('score=1.0');
    });

    it('should pass options to the API client', async () => {
      mockClient.scenarios.scorers.validate.mockResolvedValue(mockValidateResult);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      await scorer.validate({ scoring_context: {} }, { timeout: 30000 });

      expect(mockClient.scenarios.scorers.validate).toHaveBeenCalledWith(
        'sco-123',
        { scoring_context: {} },
        { timeout: 30000 },
      );
    });

    it('should handle low score validation result', async () => {
      const lowScoreResult: ScorerValidateResponse = {
        name: 'my_custom_scorer',
        scoring_context: { incorrect: true },
        scoring_result: {
          output: 'score=0.25',
          score: 0.25,
          state: 'complete',
          scoring_function_name: 'test-scorer',
        },
      };
      mockClient.scenarios.scorers.validate.mockResolvedValue(lowScoreResult);

      const scorer = Scorer.fromId(mockClient, 'sco-123');
      const result = await scorer.validate({ scoring_context: { incorrect: true } });

      expect(result.scoring_result.score).toBe(0.25);
    });
  });

  describe('error handling', () => {
    it('should handle API errors on getInfo', async () => {
      const error = new Error('Scorer not found');
      mockClient.scenarios.scorers.retrieve.mockRejectedValue(error);

      const scorer = Scorer.fromId(mockClient, 'sco-nonexistent');

      await expect(scorer.getInfo()).rejects.toThrow('Scorer not found');
    });

    it('should handle API errors on update', async () => {
      const error = new Error('Update failed');
      mockClient.scenarios.scorers.update.mockRejectedValue(error);

      const scorer = Scorer.fromId(mockClient, 'sco-123');

      await expect(scorer.update({ type: 'new_type', bash_script: 'echo 1' })).rejects.toThrow('Update failed');
    });

    it('should handle API errors on validate', async () => {
      const error = new Error('Validation timeout');
      mockClient.scenarios.scorers.validate.mockRejectedValue(error);

      const scorer = Scorer.fromId(mockClient, 'sco-123');

      await expect(scorer.validate({ scoring_context: {} })).rejects.toThrow('Validation timeout');
    });
  });
});

