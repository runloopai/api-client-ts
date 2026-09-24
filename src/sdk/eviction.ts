import { Runloop } from '../index';
import { Stream } from '../streaming';
import type { DevboxEvictionEventView } from '../resources/devboxes/devboxes';
import type { Devbox } from './devbox';

/**
 * Invoked once when the devbox it was registered for has a pending eviction.
 *
 * @param devbox - The devbox with a pending eviction.
 * @param evictionDeadlineMs - Unix timestamp (ms) by which the devbox will be suspended.
 */
export type EvictionCallback = (devbox: Devbox, evictionDeadlineMs: number) => void;

/**
 * Fans account-wide eviction notifications out to per-devbox callbacks.
 *
 * One monitor is shared by every {@link Devbox} built from the same generated
 * client (see {@link getEvictionMonitor}), so all registered devboxes are served
 * by a single SSE connection. The stream opens the moment the first devbox
 * registers interest and closes as soon as the last interested devbox has been
 * notified.
 *
 * Delivery contract:
 * - The server replays every currently-pending eviction on connect, so a devbox
 *   that registers after its eviction was scheduled is still notified.
 * - Notifications for devboxes not in the interest set are discarded.
 * - A devbox is removed from the interest set *before* its callback runs, so the
 *   callback fires at most once even if the server repeats the notification.
 */
export class EvictionMonitor {
  private entries = new Map<string, { devbox: Devbox; callback: EvictionCallback }>();
  private stream: Stream<DevboxEvictionEventView> | null = null;
  private running = false;

  constructor(private client: Runloop) {}

  /** Add `devbox` to the interest set, opening the stream if idle. */
  register(devbox: Devbox, callback: EvictionCallback): void {
    this.entries.set(devbox.id, { devbox, callback });
    if (!this.running) {
      this.running = true;
      void this.run();
    }
  }

  /** Drop `devboxId`; close the stream if it was the last interested devbox. */
  unregister(devboxId: string): void {
    this.entries.delete(devboxId);
    if (this.entries.size === 0) {
      this.close();
    }
  }

  /** Clear all interest and tear down the stream. */
  close(): void {
    this.entries.clear();
    this.stream?.controller.abort();
    this.stream = null;
    this.running = false;
  }

  private async run(): Promise<void> {
    // The server force-closes the stream on purpose (leader change / slow consumer) and a
    // long-lived HTTP/2 stream can drop; the client is expected to reconnect and re-read the
    // snapshot, which re-delivers anything missed. So reconnect (with backoff) until no devbox is
    // still interested.
    const INITIAL_BACKOFF_MS = 500;
    const MAX_BACKOFF_MS = 30_000;
    let backoff = INITIAL_BACKOFF_MS;
    try {
      while (this.entries.size > 0) {
        try {
          // Force the SSE Accept header: the endpoint only streams for text/event-stream; the
          // generated client's default (application/json) gets an empty text/plain response, so the
          // feed would silently deliver nothing.
          const stream = await this.client.devboxes.watchEvictions({
            headers: { Accept: 'text/event-stream' },
          });
          this.stream = stream;
          for await (const event of stream) {
            this.dispatch(event);
            if (this.entries.size === 0) return;
          }
          // Clean end: reset backoff and reconnect if still interested.
          backoff = INITIAL_BACKOFF_MS;
        } catch (error) {
          // Aborting the stream on close surfaces as an AbortError; that is an intentional teardown.
          if (error instanceof Error && error.name === 'AbortError') return;
          if (this.entries.size === 0) return;
          // Otherwise a routine disconnect — fall through to backoff + reconnect.
        }
        if (this.entries.size === 0) return;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
    } finally {
      this.stream = null;
      this.running = false;
    }
  }

  private dispatch(event: DevboxEvictionEventView): void {
    const entry = this.entries.get(event.devbox_id);
    if (!entry) return;
    // Remove before signaling so a duplicate notification for the same devbox is
    // discarded and the callback fires at most once.
    this.entries.delete(event.devbox_id);
    try {
      entry.callback(entry.devbox, event.eviction_deadline_ms);
    } catch (error) {
      console.error(`Error in eviction callback for devbox ${event.devbox_id}:`, error);
    }
  }
}

const monitors = new WeakMap<Runloop, EvictionMonitor>();

/** Return the shared {@link EvictionMonitor} for `client`, creating it once. */
export function getEvictionMonitor(client: Runloop): EvictionMonitor {
  let monitor = monitors.get(client);
  if (!monitor) {
    monitor = new EvictionMonitor(client);
    monitors.set(client, monitor);
  }
  return monitor;
}
