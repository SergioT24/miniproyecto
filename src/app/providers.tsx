import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppErrorBoundary } from "./error-boundary"
import { queryClient } from "./query-client"

interface AppProvidersProps {
  children: ReactNode
}

/** Providers globales de la app: tema, estado de servidor, tooltips y errores. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="miniproyecto-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
