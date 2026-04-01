import { Stream } from '../streaming';
import { APIPromise, StreamBackedAPIPromise, type APIResponseProps } from '../core';

/**
 * Wraps a stream with automatic reconnection on timeout.
 * Returns an {@link APIPromise} so callers can use {@link APIPromise.asResponse} and
 * {@link APIPromise.withResponse} like other streaming endpoints.
 */
export function withStreamAutoReconnect<Item>(
  streamCreator: (offset: number | undefined) => APIPromise<Stream<Item>>,
  getOffset: (item: Item) => number | undefined,
): StreamBackedAPIPromise<Stream<Item>> {
  let firstRequest: APIPromise<Stream<Item>> | undefined;
  const ensureFirst = () => (firstRequest ??= streamCreator(undefined));

  // Defer the first HTTP request until something awaits this promise (avoids eager
  // connection attempts and unhandled rejections when the caller only attaches later).
  const responsePropsPromise = new Promise<APIResponseProps>((resolve, reject) => {
    queueMicrotask(() => {
      ensureFirst()._getResponseProps().then(resolve, reject);
    });
  });

  let dataPromiseMemo: Promise<Stream<Item>> | undefined;
  const getDataPromise = () => {
    if (!dataPromiseMemo) {
      dataPromiseMemo = (async () => {
        let lastOffset: number | undefined = undefined;
        let currentStream = await ensureFirst();

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
    }
    return dataPromiseMemo;
  };

  return new StreamBackedAPIPromise(responsePropsPromise, getDataPromise);
}
