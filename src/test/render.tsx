import type { ReactElement, ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render as testingLibraryRender, type RenderOptions } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string
  queryClient?: QueryClient
}

/**
 * Render de tests con los providers de la app.
 * Cada render crea su propio QueryClient para aislar cache entre tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", queryClient, ...options }: RenderWithProvidersOptions = {},
) {
  const client = queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={[route]}>
            <TooltipProvider>{children}</TooltipProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    )
  }

  return {
    queryClient: client,
    ...testingLibraryRender(ui, { wrapper: Wrapper, ...options }),
  }
}

export * from "@testing-library/react"
