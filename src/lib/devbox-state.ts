import { poll, PollingOptions } from './polling';

export interface DevboxStateWaitOptions<T> {
  client: {
    post: (url: string, options?: any) => Promise<T>;
  };
  devboxId: string;
  targetState: string;
  statesToCheck: string[];
  transitionStates: string[];
  pollingOptions?: Partial<PollingOptions<T>> | undefined;
  errorMessage: (id: string, actualState: string) => string;
}

/**
 * Shared utility for waiting for a devbox to reach a specific state.
 * Uses the /wait_for_status endpoint with polling.
 */
export async function awaitDevboxState<T extends { status: string }>(
  options: DevboxStateWaitOptions<T>,
): Promise<T> {
  const { client, devboxId, targetState, statesToCheck, transitionStates, pollingOptions, errorMessage } =
    options;

  const longPoll = (): Promise<T> => {
    // This either returns a DevboxView when status matches one of statesToCheck;
    // Otherwise it throws an 408 error when times out.
    return client.post(`/v1/devboxes/${devboxId}/wait_for_status`, {
      body: { statuses: statesToCheck },
    });
  };

  const finalResult = await poll(
    () => longPoll(),
    () => longPoll(),
    {
      ...pollingOptions,
      shouldStop: (result) => {
        return !transitionStates.includes(result.status);
      },
      onError: (error: any) => {
        if (error.status === 408) {
          // Return a placeholder result to continue polling
          return { status: transitionStates[0] } as T;
        }

        // For any other error, rethrow it
        throw error;
      },
    },
  );

  // Now we check if the devbox is in the target state otherwise we throw an error
  if (finalResult.status !== targetState) {
    throw new Error(errorMessage(devboxId, finalResult.status));
  }

  return finalResult;
}
