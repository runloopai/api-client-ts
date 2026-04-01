import { Stream } from '../streaming';
import { APIPromise, StreamBackedAPIPromise } from '../core';

/**
 * Wraps a stream with automatic reconnection on timeout.
 * Returns an {@link APIPromise} so callers can use {@link APIPromise.asResponse} and
 * {@link APIPromise.withResponse} like other streaming endpoints.
 */
export function withStreamAutoReconnect<Item>(
  streamCreator: (offset: number | undefined) => APIPromise<Stream<Item>>,
  getOffset: (item: Item) => number | undefined,
): StreamBackedAPIPromise<Stream<Item>> {
  const firstRequest = streamCreator(undefined);
  const responsePropsPromise = firstRequest._getResponseProps();

  const dataPromise = (async () => {
    let lastOffset: number | undefined = undefined;
    let currentStream = await firstRequest;

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
          if ((error as any)?.status === 408) {
            currentStream = await streamCreator(lastOffset);
            continue;
          }
          throw error; // Not a timeout, rethrow
        }
      }
    }

    return new Stream(createReconnectingIterator, currentStream.controller);
  })();

  return new StreamBackedAPIPromise(responsePropsPromise, dataPromise);
}
