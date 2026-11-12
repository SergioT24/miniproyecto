import { RotateCcw, TriangleAlert } from "lucide-react"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * Error recuperable de una consulta o sección. `Alert` ya expone `role="alert"`;
 * la acción de reintento es opcional.
 */
export function ErrorState({
  title = "No se pudieron cargar los datos",
  description = "Revisá la conexión e intentá de nuevo.",
  onRetry,
  retryLabel = "Reintentar",
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" data-slot="error-state" className={cn("items-start", className)}>
      <TriangleAlert aria-hidden="true" />

      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>

      {onRetry && (
        <AlertAction>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            {retryLabel}
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}
