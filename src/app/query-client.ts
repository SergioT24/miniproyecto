import { QueryClient } from "@tanstack/react-query"

/**
 * Cliente global de TanStack Query.
 * TODO(api): clasificar errores 4xx como no reintentables cuando exista ApiError.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
