import type { ReactNode } from "react"
import { EmptyState } from "@/components/app/EmptyState"
import { ErrorState } from "@/components/app/ErrorState"
import { LoadingState } from "@/components/app/LoadingState"

export interface QueryStateProps {
  isLoading?: boolean
  isError?: boolean
  /** La consulta terminó bien pero no devolvió resultados. */
  isEmpty?: boolean
  onRetry?: () => void
  loadingLabel?: string
  errorTitle?: string
  errorDescription?: string
  /** Estado vacío específico del dominio. */
  emptyState?: ReactNode
  children: ReactNode
}

/**
 * Resuelve los estados de una consulta de TanStack Query y solo renderiza
 * el contenido cuando hay datos. No conoce el dominio ni inventa mensajes
 * de negocio.
 */
export function QueryState({
  isLoading = false,
  isError = false,
  isEmpty = false,
  onRetry,
  loadingLabel,
  errorTitle,
  errorDescription,
  emptyState,
  children,
}: QueryStateProps) {
  if (isError) {
    return <ErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
  }

  if (isLoading) {
    return <LoadingState label={loadingLabel} />
  }

  if (isEmpty) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            title="No hay resultados"
            description="Probá con otros filtros o revisá la búsqueda."
          />
        )}
      </>
    )
  }

  return <>{children}</>
}
