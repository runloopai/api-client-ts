import { APIError } from '../../src/error';
import { withStreamAutoReconnect } from '../../src/lib/streaming-reconnection';
import { Stream } from '../../src/streaming';

type SampleItem = { offset: number; value: string };
type FailureTrigger = { offset: number; error?: unknown };

function findStartIndex(items: SampleItem[], offset: number | undefined): number {
  const resumeFrom = offset ?? 0;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i]!.offset > resumeFrom) {
      return i;
    }
  }
  return items.length;
}

function createStreamFactory(
  items: SampleItem[],
  options: { failures?: FailureTrigger[] } = {},
): (offset: number | undefined) => Promise<Stream<SampleItem>> {
  const encoder = new TextEncoder();
  const triggers = [...(options.failures ?? [])];

  const takeTrigger = (offset: number | undefined): FailureTrigger | undefined => {
    const resolvedOffset = offset ?? 0;
    const index = triggers.findIndex((trigger) => trigger.offset === resolvedOffset);
    if (index === -1) {
      return undefined;
    }
    return triggers.splice(index, 1)[0];
  };

  return async (offset: number | undefined) => {
    const abortController = new AbortController();
    let cursor = findStartIndex(items, offset);
    let lastDeliveredOffset = offset ?? 0;

    const readable = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const trigger = takeTrigger(lastDeliveredOffset);
        if (trigger) {
          controller.error(trigger.error ?? new Error('Synthetic failure'));
          return;
        }

        const current = items[cursor];

        if (current) {
          cursor += 1;
          await Promise.resolve();
          controller.enqueue(encoder.encode(JSON.stringify(current) + '\n'));
          lastDeliveredOffset = current.offset;
          return;
        }

        controller.close();
      },
      cancel() {
        abortController.abort();
      },
    });

    return Stream.fromReadableStream(readable, abortController);
  };
}

describe('withStreamAutoReconnect', () => {
  const items: SampleItem[] = [
    { offset: 1, value: 'chunk-1' },
    { offset: 2, value: 'chunk-2' },
    { offset: 3, value: 'chunk-3' },
    { offset: 4, value: 'chunk-4' },
  ];

  const makeTimeoutError = (label: string) =>
    new APIError(
      408,
      { code: '408', message: `Synthetic timeout ${label}` },
      `Synthetic timeout ${label}`,
      undefined,
    );

  test('retries when a 408 arrives before the first chunk and restarts from offset 0', async () => {
    const factory = createStreamFactory(items, {
      failures: [{ offset: 0, error: makeTimeoutError('before-first') }],
    });

    const offsets: number[] = [];
    let creatorCalls = 0;

    const stream = await withStreamAutoReconnect<SampleItem>(
      async (offset) => {
        const resumeOffset = offset ?? 0;
        offsets.push(resumeOffset);
        creatorCalls += 1;
        return factory(resumeOffset);
      },
      (item) => item.offset,
    );

    const collected: SampleItem[] = [];
    for await (const item of stream) {
      collected.push(item);
    }

    expect(collected.map((item) => item.value)).toEqual(items.map((item) => item.value));
    expect(offsets).toEqual([0, 0]);
    expect(creatorCalls).toBe(2);
  });

  test('resumes from the last delivered offset after a mid-stream 408', async () => {
    const factory = createStreamFactory(items, {
      failures: [{ offset: 2, error: makeTimeoutError('mid-stream') }],
    });

    const offsets: number[] = [];
    let creatorCalls = 0;

    const stream = await withStreamAutoReconnect<SampleItem>(
      async (offset) => {
        const resumeOffset = offset ?? 0;
        offsets.push(resumeOffset);
        creatorCalls += 1;
        return factory(resumeOffset);
      },
      (item) => item.offset,
    );

    const collected: SampleItem[] = [];
    for await (const item of stream) {
      collected.push(item);
    }

    expect(collected.map((item) => item.value)).toEqual(items.map((item) => item.value));
    expect(offsets).toEqual([0, 2]);
    expect(creatorCalls).toBe(2);
  });

  test('retries a 408 that fires after the last chunk before the stream closes', async () => {
    const factory = createStreamFactory(items, {
      failures: [{ offset: 4, error: makeTimeoutError('after-end') }],
    });

    const offsets: number[] = [];
    let creatorCalls = 0;

    const stream = await withStreamAutoReconnect<SampleItem>(
      async (offset) => {
        const resumeOffset = offset ?? 0;
        offsets.push(resumeOffset);
        creatorCalls += 1;
        return factory(resumeOffset);
      },
      (item) => item.offset,
    );

    const collected: SampleItem[] = [];
    for await (const item of stream) {
      collected.push(item);
    }

    expect(collected.map((item) => item.value)).toEqual(items.map((item) => item.value));
    expect(offsets).toEqual([0, 4]);
    expect(creatorCalls).toBe(2);
  });

  test('handles multiple sequential 408 errors across retries', async () => {
    const factory = createStreamFactory(items, {
      failures: [
        { offset: 0, error: makeTimeoutError('before-first') },
        { offset: 2, error: makeTimeoutError('mid-stream') },
        { offset: 4, error: makeTimeoutError('after-end') },
      ],
    });

    const offsets: number[] = [];
    let creatorCalls = 0;

    const stream = await withStreamAutoReconnect<SampleItem>(
      async (offset) => {
        const resumeOffset = offset ?? 0;
        offsets.push(resumeOffset);
        creatorCalls += 1;
        return factory(resumeOffset);
      },
      (item) => item.offset,
    );

    const collected: SampleItem[] = [];
    for await (const item of stream) {
      collected.push(item);
    }

    expect(collected.map((item) => item.value)).toEqual(items.map((item) => item.value));
    expect(offsets).toEqual([0, 0, 2, 4]);
    expect(creatorCalls).toBe(4);
  });

  const nonTimeoutCases = [
    {
      name: 'non-timeout APIError',
      makeError: () => new APIError(500, { code: '500', message: 'Server error' }, 'Server error', undefined),
    },
    {
      name: 'generic error without status',
      makeError: () => new Error('Generic failure'),
    },
  ];

  test.each(nonTimeoutCases)('propagates %s without retrying', async ({ makeError }) => {
    const error = makeError();
    let creatorCalls = 0;
    const offsets: number[] = [];

    const stream = await withStreamAutoReconnect<SampleItem>(
      async (offset) => {
        const resumeOffset = offset ?? 0;
        offsets.push(resumeOffset);
        creatorCalls += 1;
        const abortController = new AbortController();
        const readable = new ReadableStream<Uint8Array>({
          pull(controller) {
            controller.error(error);
          },
          cancel() {
            abortController.abort();
          },
        });
        return Stream.fromReadableStream(readable, abortController);
      },
      (item) => item.offset,
    );

    const iterate = async () => {
      for await (const _item of stream) {
        // no-op
      }
    };

    await expect(iterate()).rejects.toBe(error);
    expect(creatorCalls).toBe(1);
    expect(offsets).toEqual([0]);
  });
});
