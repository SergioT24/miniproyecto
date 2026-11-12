import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  label?: string
  className?: string
}

/**
 * Estado de carga compartido. Un único `role="status"` anuncia el cambio
 * sin duplicar el mensaje del spinner.
 */
export function LoadingState({ label = "Cargando datos…", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loading-state"
      className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}
    >
      <Spinner className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
