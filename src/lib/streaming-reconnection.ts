import { Stream } from '../streaming';
import { APIPromise, StreamBackedAPIPromise, type APIResponseProps } from '../core';

function isIdleTimeoutReconnectError(error: unknown): boolean {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;
  if (status === 408) return true;
  if (error instanceof Error && error.name === 'TimeoutError') return true;
  if (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    error.name === 'TimeoutError'
  ) {
    return true;
  }
  return false;
}

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
              if (isIdleTimeoutReconnectError(error)) {
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
