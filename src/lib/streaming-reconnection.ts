import { Stream } from '../streaming';
import { APIError } from '../error';

/**
 * Wraps a stream with automatic reconnection on timeout.
 *
 * @param stream The stream to wrap
 * @param recreator Function that creates a new stream with the last offset
 * @returns A new stream that automatically reconnects on timeout
 */
export async function withStreamAutoReconnect<Item>(
  streamCreator: (offset: number | undefined) => Promise<Stream<Item>>,
  getOffset: (item: Item) => number | undefined,
): Promise<Stream<Item>> {
  let lastOffset: number | undefined = undefined;
  let currentStream = await streamCreator(lastOffset);

  async function* createReconnectingIterator(): AsyncIterator<Item> {
    while (true) {
      try {
        for await (const item of currentStream) {
          if (getOffset(item) !== undefined) {
            lastOffset = getOffset(item);
          }
          yield item;
        }
        return; // Stream completed normally
      } catch (error) {
        if (error instanceof APIError && error.status === 408) {
          // Reconnect with the last known offset
          currentStream = await streamCreator(lastOffset);
          continue;
        }
        throw error; // Not a timeout, rethrow
      }
    }
  }

  return new Stream(createReconnectingIterator, currentStream.controller);
}
