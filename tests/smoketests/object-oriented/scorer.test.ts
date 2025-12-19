import { makeClientSDK, uniqueName } from '../utils';
import { Scorer } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented scorers', () => {
  describe('scorer lifecycle', () => {
    let scorer: Scorer;
    let scorerId: string | undefined;

    beforeAll(async () => {
      // Create a scorer first (no delete endpoint currently, so we keep it small + uniquely named)
      scorer = await sdk.scorer.create({
        type: uniqueName('sdk-scorer'),
        bash_script: 'echo "score=1.0"',
      });
      expect(scorer).toBeDefined();
      expect(scorer.id).toBeTruthy();
      scorerId = scorer.id;
    });

    test('create scorer via Scorer.create (static)', async () => {
      const created = await Scorer.create(sdk.api, {
        type: uniqueName('sdk-scorer-static-create'),
        bash_script: 'echo "score=1.0"',
      });

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();

      const info = await created.getInfo();
      expect(info.id).toBe(created.id);
      expect(info.type).toBeTruthy();
      expect(info.bash_script).toBeTruthy();
    });

    test('get scorer info', async () => {
      const info = await scorer.getInfo();
      expect(info.id).toBe(scorerId);
      expect(info.type).toBeTruthy();
      expect(info.bash_script).toBeTruthy();
    });

    test('update scorer', async () => {
      const newType = uniqueName('sdk-scorer-updated');
      const updated = await scorer.update({
        type: newType,
        bash_script: 'echo "score=0.5"',
      });

      expect(updated.id).toBe(scorerId);
      expect(updated.type).toBe(newType);
      expect(updated.bash_script).toBe('echo "score=0.5"');
    });

    // TODO: reenable this post-API fixes
    // test('validate scorer', async () => {
    //   const result = await scorer.validate({ scoring_context: { test: true } });
    //   expect(result.scoring_result).toBeDefined();
    //   expect(typeof result.scoring_result.score).toBe('number');
    // });

    test('get scorer by ID (ScorerOps.fromId)', async () => {
      const retrieved = sdk.scorer.fromId(scorerId!);
      expect(retrieved.id).toBe(scorerId);

      const info = await retrieved.getInfo();
      expect(info.id).toBe(scorerId);
    });

    test('list scorers (ScorerOps.list)', async () => {
      const scorers = await sdk.scorer.list({ limit: 10 });
      expect(Array.isArray(scorers)).toBe(true);
      expect(scorers.length).toBeGreaterThan(0);
      expect(scorers.every((s) => typeof s.id === 'string' && s.id.length > 0)).toBe(true);
    });
  });
});


