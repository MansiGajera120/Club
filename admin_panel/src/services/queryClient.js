import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client. Sensible defaults for an admin dashboard:
 * retry once, don't refetch on window focus, keep data fresh for 30s.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default queryClient;
