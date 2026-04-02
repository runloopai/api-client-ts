import { Axon } from '../../src/sdk/axon';
import type { AxonView, PublishResultView } from '../../src/resources/axons';

jest.mock('../../src/index');

describe('Axon', () => {
  let mockClient: any;
  let mockAxonData: AxonView;

  beforeEach(() => {
    mockClient = {
      axons: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        publish: jest.fn(),
        subscribeSse: jest.fn(),
      },
    } as any;

    mockAxonData = {
      id: 'axn_123456789',
      created_at_ms: Date.now(),
      name: 'test-axon',
    };
  });

  describe('create', () => {
    it('should create an axon and return an Axon instance', async () => {
      mockClient.axons.create.mockResolvedValue(mockAxonData);

      const axon = await Axon.create(mockClient, { name: 'test-axon' });

      expect(mockClient.axons.create).toHaveBeenCalledWith({ name: 'test-axon' }, undefined);
      expect(axon).toBeInstanceOf(Axon);
      expect(axon.id).toBe('axn_123456789');
    });

    it('should create an axon without params', async () => {
      mockClient.axons.create.mockResolvedValue(mockAxonData);

      const axon = await Axon.create(mockClient);

      expect(mockClient.axons.create).toHaveBeenCalledWith({}, undefined);
      expect(axon).toBeInstanceOf(Axon);
      expect(axon.id).toBe('axn_123456789');
    });

    it('should pass request options to the API client', async () => {
      mockClient.axons.create.mockResolvedValue(mockAxonData);

      await Axon.create(mockClient, { name: 'test-axon' }, { timeout: 5000 });

      expect(mockClient.axons.create).toHaveBeenCalledWith({ name: 'test-axon' }, { timeout: 5000 });
    });
  });

  describe('fromId', () => {
    it('should create an Axon instance by ID without API call', () => {
      const axon = Axon.fromId(mockClient, 'axn_123456789');

      expect(axon).toBeInstanceOf(Axon);
      expect(axon.id).toBe('axn_123456789');
      expect(mockClient.axons.retrieve).not.toHaveBeenCalled();
    });

    it('should work with any valid axon ID format', () => {
      const axon = Axon.fromId(mockClient, 'axn_abcdefghij');

      expect(axon.id).toBe('axn_abcdefghij');
    });
  });

  describe('instance methods', () => {
    let axon: Axon;

    beforeEach(async () => {
      mockClient.axons.create.mockResolvedValue(mockAxonData);
      axon = await Axon.create(mockClient, { name: 'test-axon' });
    });

    describe('getInfo', () => {
      it('should get axon information from API', async () => {
        mockClient.axons.retrieve.mockResolvedValue(mockAxonData);

        const info = await axon.getInfo();

        expect(mockClient.axons.retrieve).toHaveBeenCalledWith('axn_123456789', undefined);
        expect(info.id).toBe('axn_123456789');
        expect(info.name).toBe('test-axon');
      });

      it('should pass request options to retrieve call', async () => {
        mockClient.axons.retrieve.mockResolvedValue(mockAxonData);

        await axon.getInfo({ timeout: 3000 });

        expect(mockClient.axons.retrieve).toHaveBeenCalledWith('axn_123456789', { timeout: 3000 });
      });

      it('should return updated data on subsequent calls', async () => {
        const updatedData = { ...mockAxonData, name: 'updated-name' };
        mockClient.axons.retrieve.mockResolvedValue(updatedData);

        const info = await axon.getInfo();

        expect(info.name).toBe('updated-name');
      });
    });

    describe('publish', () => {
      const publishParams = {
        event_type: 'push',
        origin: 'EXTERNAL_EVENT' as const,
        payload: JSON.stringify({ repo: 'my-repo' }),
        source: 'github',
      };

      const mockPublishResult: PublishResultView = {
        sequence: 1,
        timestamp_ms: Date.now(),
      };

      it('should publish an event to the axon', async () => {
        mockClient.axons.publish.mockResolvedValue(mockPublishResult);

        const result = await axon.publish(publishParams);

        expect(mockClient.axons.publish).toHaveBeenCalledWith('axn_123456789', publishParams, undefined);
        expect(result.sequence).toBe(1);
        expect(result.timestamp_ms).toBeDefined();
      });

      it('should pass request options to publish call', async () => {
        mockClient.axons.publish.mockResolvedValue(mockPublishResult);

        await axon.publish(publishParams, { timeout: 5000 });

        expect(mockClient.axons.publish).toHaveBeenCalledWith('axn_123456789', publishParams, {
          timeout: 5000,
        });
      });

      it('should handle different event origins', async () => {
        mockClient.axons.publish.mockResolvedValue(mockPublishResult);

        for (const origin of ['EXTERNAL_EVENT', 'AGENT_EVENT', 'USER_EVENT'] as const) {
          await axon.publish({ ...publishParams, origin });
          expect(mockClient.axons.publish).toHaveBeenCalledWith(
            'axn_123456789',
            { ...publishParams, origin },
            undefined,
          );
        }
      });
    });

    describe('subscribeSse', () => {
      it('should subscribe to axon event stream', async () => {
        const mockStream = { [Symbol.asyncIterator]: jest.fn() };
        mockClient.axons.subscribeSse.mockResolvedValue(mockStream);

        const stream = await axon.subscribeSse();

        expect(mockClient.axons.subscribeSse).toHaveBeenCalledWith(
          'axn_123456789',
          undefined,
          undefined,
        );
        expect(stream).toBe(mockStream);
      });

      it('should pass request options to subscribeSse call', async () => {
        const mockStream = { [Symbol.asyncIterator]: jest.fn() };
        mockClient.axons.subscribeSse.mockResolvedValue(mockStream);

        await axon.subscribeSse(undefined, { timeout: 60000 });

        expect(mockClient.axons.subscribeSse).toHaveBeenCalledWith(
          'axn_123456789',
          undefined,
          { timeout: 60000 },
        );
      });
    });

    describe('id property', () => {
      it('should expose axon ID', () => {
        expect(axon.id).toBe('axn_123456789');
      });

      it('should be read-only', () => {
        const originalId = axon.id;
        expect(axon.id).toBe(originalId);
      });
    });
  });

  describe('error handling', () => {
    it('should handle axon creation failure', async () => {
      const error = new Error('Creation failed');
      mockClient.axons.create.mockRejectedValue(error);

      await expect(Axon.create(mockClient, { name: 'failing-axon' })).rejects.toThrow('Creation failed');
    });

    it('should handle retrieval errors in getInfo', async () => {
      const error = new Error('Axon not found');
      mockClient.axons.retrieve.mockRejectedValue(error);

      const axon = Axon.fromId(mockClient, 'axn_nonexistent');
      await expect(axon.getInfo()).rejects.toThrow('Axon not found');
    });

    it('should handle publish errors', async () => {
      mockClient.axons.create.mockResolvedValue({ id: 'axn_123', created_at_ms: Date.now() });
      const axon = await Axon.create(mockClient);

      const error = new Error('Publish failed');
      mockClient.axons.publish.mockRejectedValue(error);

      await expect(
        axon.publish({
          event_type: 'test',
          origin: 'AGENT_EVENT',
          payload: '{}',
          source: 'test',
        }),
      ).rejects.toThrow('Publish failed');
    });

    it('should handle subscribeSse errors', async () => {
      mockClient.axons.create.mockResolvedValue({ id: 'axn_123', created_at_ms: Date.now() });
      const axon = await Axon.create(mockClient);

      const error = new Error('Subscribe failed');
      mockClient.axons.subscribeSse.mockRejectedValue(error);

      await expect(axon.subscribeSse()).rejects.toThrow('Subscribe failed');
    });
  });

  describe('edge cases', () => {
    it('should handle axon with no name', async () => {
      const noNameData = { id: 'axn_noname', created_at_ms: Date.now() };
      mockClient.axons.create.mockResolvedValue(noNameData);

      const axon = await Axon.create(mockClient);

      expect(axon.id).toBe('axn_noname');
    });

    it('should handle axon with null name', async () => {
      const nullNameData = { id: 'axn_nullname', created_at_ms: Date.now(), name: null };
      mockClient.axons.create.mockResolvedValue(nullNameData);

      const axon = await Axon.create(mockClient, { name: null });

      expect(axon.id).toBe('axn_nullname');
    });
  });
});
