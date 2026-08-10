import { QueryClient } from "@tanstack/react-query";

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Session expired.") {
      return false;
    }
  }

  return failureCount < 1;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}