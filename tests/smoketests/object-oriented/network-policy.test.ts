import { THIRTY_SECOND_TIMEOUT, uniqueName, makeClientSDK } from '../utils';
import { NetworkPolicy } from '@runloop/api-client/sdk';

const sdk = makeClientSDK();

describe('smoketest: object-oriented network policy', () => {
  describe('network policy lifecycle', () => {
    let policy: NetworkPolicy;
    let policyId: string | undefined;

    afterAll(async () => {
      if (policy) {
        await policy.delete().catch(() => {});
      }
    });

    test(
      'create network policy',
      async () => {
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-network-policy'),
          allow_all: false,
          allowed_hostnames: ['github.com', '*.npmjs.org'],
          allow_devbox_to_devbox: false,
          description: 'Test network policy',
        });
        expect(policy).toBeDefined();
        expect(policy.id).toBeTruthy();
        policyId = policy.id;
      },
      THIRTY_SECOND_TIMEOUT,
    );

    test('get network policy info', async () => {
      expect(policy).toBeDefined();
      const info = await policy.getInfo();
      expect(info.id).toBe(policyId);
      expect(info.name).toContain('sdk-network-policy');
      expect(info.egress).toBeDefined();
      expect(info.egress.allow_all).toBe(false);
      expect(info.egress.allowed_hostnames).toContain('github.com');
      expect(info.egress.allowed_hostnames).toContain('*.npmjs.org');
      expect(info.egress.allow_devbox_to_devbox).toBe(false);
      expect(info.description).toBe('Test network policy');
    });

    test('update network policy', async () => {
      expect(policy).toBeDefined();
      const updated = await policy.update({
        name: uniqueName('sdk-network-policy-updated'),
        allow_all: false,
        allowed_hostnames: ['github.com', 'api.openai.com'],
        description: 'Updated test network policy',
      });
      expect(updated.name).toContain('sdk-network-policy-updated');
      expect(updated.egress.allowed_hostnames).toContain('github.com');
      expect(updated.egress.allowed_hostnames).toContain('api.openai.com');
      expect(updated.description).toBe('Updated test network policy');

      // Verify the update persisted
      const info = await policy.getInfo();
      expect(info.name).toContain('sdk-network-policy-updated');
      expect(info.description).toBe('Updated test network policy');
    });

    test('update network policy - allow_all', async () => {
      expect(policy).toBeDefined();
      const updated = await policy.update({
        allow_all: true,
      });
      expect(updated.egress.allow_all).toBe(true);

      // Verify the update persisted
      const info = await policy.getInfo();
      expect(info.egress.allow_all).toBe(true);
    });

    test('update network policy - allow_devbox_to_devbox', async () => {
      expect(policy).toBeDefined();
      const updated = await policy.update({
        allow_devbox_to_devbox: true,
      });
      expect(updated.egress.allow_devbox_to_devbox).toBe(true);

      // Verify the update persisted
      const info = await policy.getInfo();
      expect(info.egress.allow_devbox_to_devbox).toBe(true);
    });

    test('delete network policy', async () => {
      expect(policy).toBeDefined();
      await policy.delete();

      // Verify it's deleted by trying to get info (should fail)
      try {
        await policy.getInfo();
        fail('Expected network policy to be deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('network policy list and retrieval', () => {
    test('list network policies', async () => {
      const policies = await sdk.networkPolicy.list({ limit: 10 });
      expect(Array.isArray(policies)).toBe(true);
    });

    test('get network policy by ID', async () => {
      // First create a network policy
      let policy: NetworkPolicy | undefined;
      try {
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-network-policy-retrieve'),
          allow_all: false,
          allowed_hostnames: ['github.com'],
        });
        expect(policy?.id).toBeTruthy();

        // Retrieve it by ID
        const retrieved = sdk.networkPolicy.fromId(policy.id);
        expect(retrieved.id).toBe(policy.id);

        // Verify we can get info
        const info = await retrieved.getInfo();
        expect(info.id).toBe(policy.id);
        expect(info.name).toContain('sdk-network-policy-retrieve');
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });
  });

  describe('network policy egress configurations', () => {
    test('create policy with allow_all=true', async () => {
      let policy: NetworkPolicy | undefined;
      try {
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-policy-allow-all'),
          allow_all: true,
        });
        const info = await policy.getInfo();
        expect(info.egress.allow_all).toBe(true);
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });

    test('create policy with allow_devbox_to_devbox=true', async () => {
      let policy: NetworkPolicy | undefined;
      try {
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-policy-devbox-to-devbox'),
          allow_all: false,
          allow_devbox_to_devbox: true,
          allowed_hostnames: ['github.com'],
        });
        const info = await policy.getInfo();
        expect(info.egress.allow_devbox_to_devbox).toBe(true);
        expect(info.egress.allow_all).toBe(false);
        expect(info.egress.allowed_hostnames).toContain('github.com');
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });

    test('create policy with multiple allowed hostnames', async () => {
      let policy: NetworkPolicy | undefined;
      try {
        const hostnames = ['github.com', '*.npmjs.org', 'api.openai.com', '*.googleapis.com'];
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-policy-multiple-hostnames'),
          allow_all: false,
          allowed_hostnames: hostnames,
        });
        const info = await policy.getInfo();
        expect(info.egress.allow_all).toBe(false);
        expect(info.egress.allowed_hostnames.length).toBe(hostnames.length);
        for (const hostname of hostnames) {
          expect(info.egress.allowed_hostnames).toContain(hostname);
        }
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });

    test('create policy with empty allowed_hostnames (DENY_ALL)', async () => {
      let policy: NetworkPolicy | undefined;
      try {
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-policy-deny-all'),
          allow_all: false,
          allowed_hostnames: [],
        });
        const info = await policy.getInfo();
        expect(info.egress.allow_all).toBe(false);
        expect(info.egress.allowed_hostnames).toEqual([]);
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });

    test('create policy with wildcard hostnames', async () => {
      let policy: NetworkPolicy | undefined;
      try {
        const hostnames = ['*.github.com', '*.npmjs.org', 'api.*.com'];
        policy = await sdk.networkPolicy.create({
          name: uniqueName('sdk-policy-wildcards'),
          allow_all: false,
          allowed_hostnames: hostnames,
        });
        const info = await policy.getInfo();
        expect(info.egress.allowed_hostnames.length).toBe(hostnames.length);
        for (const hostname of hostnames) {
          expect(info.egress.allowed_hostnames).toContain(hostname);
        }
      } finally {
        if (policy) {
          await policy.delete().catch(() => {});
        }
      }
    });
  });

  describe('network policy update operations', () => {
    let policy: NetworkPolicy;

    beforeEach(async () => {
      policy = await sdk.networkPolicy.create({
        name: uniqueName('sdk-policy-update-test'),
        allow_all: false,
        allowed_hostnames: ['github.com'],
      });
    });

    afterEach(async () => {
      if (policy) {
        await policy.delete().catch(() => {});
      }
    });

    test('update name only', async () => {
      const newName = uniqueName('sdk-policy-updated-name');
      const updated = await policy.update({ name: newName });
      expect(updated.name).toContain('sdk-policy-updated-name');

      const info = await policy.getInfo();
      expect(info.name).toContain('sdk-policy-updated-name');
    });

    test('update description only', async () => {
      const updated = await policy.update({ description: 'New description' });
      expect(updated.description).toBe('New description');

      const info = await policy.getInfo();
      expect(info.description).toBe('New description');
    });

    test('update allowed_hostnames only', async () => {
      const newHostnames = ['api.openai.com', '*.googleapis.com'];
      const updated = await policy.update({ allowed_hostnames: newHostnames });
      expect(updated.egress.allowed_hostnames.length).toBe(newHostnames.length);
      for (const hostname of newHostnames) {
        expect(updated.egress.allowed_hostnames).toContain(hostname);
      }

      const info = await policy.getInfo();
      expect(info.egress.allowed_hostnames.length).toBe(newHostnames.length);
    });

    test('update multiple fields at once', async () => {
      const updated = await policy.update({
        name: uniqueName('sdk-policy-multi-update'),
        description: 'Multi-update description',
        allow_devbox_to_devbox: true,
        allowed_hostnames: ['github.com', 'api.openai.com'],
      });

      expect(updated.name).toContain('sdk-policy-multi-update');
      expect(updated.description).toBe('Multi-update description');
      expect(updated.egress.allow_devbox_to_devbox).toBe(true);
      expect(updated.egress.allowed_hostnames.length).toBe(2);
      expect(updated.egress.allowed_hostnames).toContain('github.com');
      expect(updated.egress.allowed_hostnames).toContain('api.openai.com');

      const info = await policy.getInfo();
      expect(info.name).toContain('sdk-policy-multi-update');
      expect(info.description).toBe('Multi-update description');
      expect(info.egress.allow_devbox_to_devbox).toBe(true);
    });

    test('update allow_all from false to true', async () => {
      // Start with allow_all=false
      let info = await policy.getInfo();
      expect(info.egress.allow_all).toBe(false);

      // Update to allow_all=true
      const updated = await policy.update({ allow_all: true });
      expect(updated.egress.allow_all).toBe(true);

      // Verify persisted
      info = await policy.getInfo();
      expect(info.egress.allow_all).toBe(true);
    });

    test('update allow_all from true to false', async () => {
      // First set allow_all=true
      await policy.update({ allow_all: true });
      let info = await policy.getInfo();
      expect(info.egress.allow_all).toBe(true);

      // Update to allow_all=false with hostnames
      const updated = await policy.update({
        allow_all: false,
        allowed_hostnames: ['github.com'],
      });
      expect(updated.egress.allow_all).toBe(false);
      expect(updated.egress.allowed_hostnames).toContain('github.com');

      // Verify persisted
      info = await policy.getInfo();
      expect(info.egress.allow_all).toBe(false);
      expect(info.egress.allowed_hostnames).toContain('github.com');
    });
  });
});
