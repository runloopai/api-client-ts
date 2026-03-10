import { longPollUntil } from './polling';

export interface DevboxStateWaitOptions<T> {
  client: {
    post: (url: string, options?: any) => Promise<T>;
  };
  devboxId: string;
  targetState: string;
  statesToCheck: string[];
  transitionStates: string[];
  /** Timeout in milliseconds for the long-poll operation. */
  timeoutMs?: number | undefined;
  /** Optional AbortSignal to cancel the long-poll loop externally. */
  signal?: AbortSignal | null | undefined;
  errorMessage: (id: string, actualState: string) => string;
}

/**
 * Shared utility for waiting for a devbox to reach a specific state.
 * Uses the /wait_for_status long-poll endpoint.
 */
export async function awaitDevboxState<T extends { status: string }>(
  options: DevboxStateWaitOptions<T>,
): Promise<T> {
  const { client, devboxId, targetState, statesToCheck, transitionStates, errorMessage } = options;

  const finalResult = await longPollUntil(
    (signal) =>
      client.post(`/v1/devboxes/${devboxId}/wait_for_status`, {
        body: { statuses: statesToCheck },
        signal,
      }),
    {
      timeoutMs: options.timeoutMs,
      shouldStop: (result) => !transitionStates.includes(result.status),
      signal: options.signal,
    },
  );

  // Now we check if the devbox is in the target state otherwise we throw an error
  if (finalResult.status !== targetState) {
    throw new Error(errorMessage(devboxId, finalResult.status));
  }

  return finalResult;
}
