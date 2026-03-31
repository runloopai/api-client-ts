import { AxonOps } from '../../src/sdk';
import { Axon } from '../../src/sdk/axon';
import type { AxonView } from '../../src/resources/axons';

jest.mock('../../src/sdk/axon');

describe('AxonOps', () => {
  let mockClient: any;
  let axonOps: AxonOps;
  let mockAxonData: AxonView;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      axons: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        publish: jest.fn(),
        subscribeSse: jest.fn(),
      },
    } as any;

    axonOps = new AxonOps(mockClient);

    mockAxonData = {
      id: 'axn_123',
      created_at_ms: Date.now(),
      name: 'test-axon',
    };

    const mockAxonInstance = { id: 'axn_123', getInfo: jest.fn() } as unknown as Axon;
    jest.spyOn(Axon as any, 'create').mockResolvedValue(mockAxonInstance);
    jest.spyOn(Axon as any, 'fromId').mockReturnValue(mockAxonInstance);
  });

  describe('create', () => {
    it('should delegate to Axon.create with params', async () => {
      await axonOps.create({ name: 'my-axon' });

      expect(Axon.create).toHaveBeenCalledWith(mockClient, { name: 'my-axon' }, undefined);
    });

    it('should delegate to Axon.create without params', async () => {
      await axonOps.create();

      expect(Axon.create).toHaveBeenCalledWith(mockClient, undefined, undefined);
    });

    it('should pass request options', async () => {
      await axonOps.create({ name: 'my-axon' }, { timeout: 5000 });

      expect(Axon.create).toHaveBeenCalledWith(mockClient, { name: 'my-axon' }, { timeout: 5000 });
    });

    it('should return an Axon instance', async () => {
      const axon = await axonOps.create({ name: 'my-axon' });

      expect(axon).toBeDefined();
      expect(axon.id).toBe('axn_123');
    });
  });

  describe('fromId', () => {
    it('should delegate to Axon.fromId', () => {
      axonOps.fromId('axn_456');

      expect(Axon.fromId).toHaveBeenCalledWith(mockClient, 'axn_456');
    });

    it('should return an Axon instance', () => {
      const axon = axonOps.fromId('axn_456');

      expect(axon).toBeDefined();
      expect(axon.id).toBe('axn_123');
    });
  });

  describe('list', () => {
    function mockPageResult(items: AxonView[]) {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield* items;
        },
      };
    }

    it('should list axons and wrap as Axon instances', async () => {
      const mockAxons: AxonView[] = [
        { id: 'axn_1', created_at_ms: Date.now(), name: 'axon-1' },
        { id: 'axn_2', created_at_ms: Date.now(), name: 'axon-2' },
        { id: 'axn_3', created_at_ms: Date.now() },
      ];
      mockClient.axons.list.mockResolvedValue(mockPageResult(mockAxons));

      const axons = await axonOps.list();

      expect(mockClient.axons.list).toHaveBeenCalledWith(undefined, undefined);
      expect(Axon.fromId).toHaveBeenCalledTimes(3);
      expect(Axon.fromId).toHaveBeenCalledWith(mockClient, 'axn_1');
      expect(Axon.fromId).toHaveBeenCalledWith(mockClient, 'axn_2');
      expect(Axon.fromId).toHaveBeenCalledWith(mockClient, 'axn_3');
      expect(axons).toHaveLength(3);
    });

    it('should return empty array when no axons exist', async () => {
      mockClient.axons.list.mockResolvedValue(mockPageResult([]));

      const axons = await axonOps.list();

      expect(axons).toHaveLength(0);
    });

    it('should pass filter params', async () => {
      mockClient.axons.list.mockResolvedValue(mockPageResult([]));

      await axonOps.list({ name: 'my-axon', limit: 10 });

      expect(mockClient.axons.list).toHaveBeenCalledWith({ name: 'my-axon', limit: 10 }, undefined);
    });

    it('should pass request options', async () => {
      mockClient.axons.list.mockResolvedValue(mockPageResult([]));

      await axonOps.list(undefined, { timeout: 3000 });

      expect(mockClient.axons.list).toHaveBeenCalledWith(undefined, { timeout: 3000 });
    });
  });
});
