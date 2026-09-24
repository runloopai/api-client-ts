import { Devbox } from '@runloop/api-client/sdk';
import type { DevboxEvictionEventView } from '@runloop/api-client/resources/devboxes/devboxes';

// Hermetic tests: they drive the shared EvictionMonitor through an in-memory fake
// SSE stream instead of a live devbox eviction, so `devbox.onEvict` / `cancelOnEvict`
// (and the monitor's dispatch + teardown) are exercised deterministically.

// The generated watch_evictions stream: an async-iterable of eviction events plus an
// AbortController the monitor aborts on close().
type FakeStream = {
  controller: AbortController;
  [Symbol.asyncIterator](): AsyncIterator<DevboxEvictionEventView>;
};

function streamOf(events: DevboxEvictionEventView[]): FakeStream {
  return {
    controller: new AbortController(),
    async *[Symbol.asyncIterator]() {
      for (const event of events) {
        yield event;
      }
    },
  };
}

// A stream that emits nothing until the monitor aborts it (i.e. on cancelOnEvict).
function blockingStream(): FakeStream {
  const controller = new AbortController();
  return {
    controller,
    async *[Symbol.asyncIterator]() {
      await new Promise<void>((resolve) => {
        if (controller.signal.aborted) {
          resolve();
        } else {
          controller.signal.addEventListener('abort', () => resolve(), { once: true });
        }
      });
    },
  };
}

// Type the fake as whatever Devbox.fromId expects, without importing the generated client.
type Client = Parameters<typeof Devbox.fromId>[0];
function fakeClient(watchEvictions: () => Promise<FakeStream>): Client {
  return { devboxes: { watchEvictions } } as unknown as Client;
}

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

(process.env['RUN_SMOKETESTS'] ? describe : describe.skip)('object-oriented eviction notifications', () => {
  test('onEvict fires once for a matching devbox and ignores others', async () => {
    const events: DevboxEvictionEventView[] = [
      { devbox_id: 'dbx_other', eviction_deadline_ms: 1 },
      { devbox_id: 'dbx_match', eviction_deadline_ms: 1_720_000_000_000 },
    ];
    const devbox = Devbox.fromId(
      fakeClient(async () => streamOf(events)),
      'dbx_match',
    );

    let receivedDevbox: Devbox | undefined;
    const calls: Array<{ id: string; deadline: number }> = [];
    const fired = new Promise<void>((resolve) => {
      devbox.onEvict((evicted, evictionDeadlineMs) => {
        receivedDevbox = evicted;
        calls.push({ id: evicted.id, deadline: evictionDeadlineMs });
        resolve();
      });
    });

    let guard: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_resolve, reject) => {
      guard = setTimeout(() => reject(new Error('onEvict callback never fired')), 2000);
    });
    try {
      await Promise.race([fired, timeout]);
    } finally {
      clearTimeout(guard!);
    }
    await tick();

    // Fired once, with the devbox object and its deadline; the unmatched id was discarded.
    expect(receivedDevbox).toBe(devbox);
    expect(calls).toEqual([{ id: 'dbx_match', deadline: 1_720_000_000_000 }]);
  });

  test('cancelOnEvict stops watching and aborts the stream', async () => {
    const stream = blockingStream();
    const devbox = Devbox.fromId(
      fakeClient(async () => stream),
      'dbx_cancel',
    );

    const callback = jest.fn();
    devbox.onEvict(callback);
    await tick(); // let the monitor open the stream

    devbox.cancelOnEvict();

    expect(stream.controller.signal.aborted).toBe(true);
    await tick();
    expect(callback).not.toHaveBeenCalled();
  });
});
