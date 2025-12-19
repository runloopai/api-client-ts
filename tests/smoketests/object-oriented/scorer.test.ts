import { makeClientSDK, uniqueName } from '../utils';
import { Scorer } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented scorers', () => {
  describe('scorer lifecycle', () => {
    let scorer: Scorer;
    let scorerId: string | undefined;
    let scorerType: string;

    beforeAll(async () => {
      // Create a scorer first (no delete endpoint currently, so we keep it small + uniquely named)
      scorerType = uniqueName('sdk-scorer');
      scorer = await sdk.scorer.create({
        type: scorerType,
        bash_script: 'echo "1.0"',
      });
      expect(scorer).toBeDefined();
      expect(scorer.id).toMatch(/^scs_/);
      scorerId = scorer.id;
    });

    test('create scorer via Scorer.create (static)', async () => {
      const type = uniqueName('sdk-scorer-static-create');
      const bashScript = 'echo "1.0"';
      const created = await Scorer.create(sdk.api, {
        type,
        bash_script: bashScript,
      });

      expect(created).toBeDefined();
      expect(created.id).toMatch(/^scs_/);

      const info = await created.getInfo();
      expect(info.id).toBe(created.id);
      expect(info.type).toBe(type);
      expect(info.bash_script).toBe(bashScript);
    });

    test('update scorer', async () => {
      const newType = uniqueName('sdk-scorer-updated');
      const updated = await scorer.update({
        type: newType,
        bash_script: 'echo "0.5"',
      });

      expect(updated.id).toBe(scorerId);
      expect(updated.type).toBe(newType);
      expect(updated.bash_script).toBe('echo "0.5"');
    });

    test('validate scorer', async () => {
       const result = await scorer.validate({ scoring_context: { test: true } });
       expect(result.scoring_result).toBeDefined();
       expect(typeof result.scoring_result.score).toBe('number');
    });

    test('get scorer by ID (ScorerOps.fromId)', async () => {
      const retrieved = sdk.scorer.fromId(scorerId!);
      expect(retrieved.id).toBe(scorerId);

      const info = await retrieved.getInfo();
      expect(info.id).toBe(scorerId);
      expect(info.type).toBe(scorerType);
    });

    test('list scorers (ScorerOps.list)', async () => {
      const scorers = await sdk.scorer.list({ limit: 10 });
      expect(Array.isArray(scorers)).toBe(true);
      expect(scorers.length).toBeGreaterThan(0);
      expect(scorers.every((s) => typeof s.id === 'string' && s.id.length > 0)).toBe(true);
    });
  });
});


