import { useEffect, useId, useRef, type MouseEvent } from "react"
import { CircleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormErrorItem {
  /** Id del control que se debe enfocar. */
  fieldId: string
  /** Etiqueta visible del campo. */
  label: string
  message: string
}

export interface FormErrorSummaryProps {
  errors: FormErrorItem[]
  title?: string
  className?: string
}

/**
 * Resumen de errores de un formulario. Recibe el foco cuando cambia el conjunto
 * de errores y cada mensaje enlaza al campo correspondiente.
 */
export function FormErrorSummary({
  errors,
  title = "Revisá los campos marcados",
  className,
}: FormErrorSummaryProps) {
  const titleId = useId()
  const summaryRef = useRef<HTMLDivElement>(null)
  const hasFocusedRef = useRef(false)

  // Enfoca al aparecer el resumen, pero no cuando cambia mientras la persona
  // corrige un campo: robarle el foco interrumpiría la edición.
  useEffect(() => {
    if (errors.length === 0) {
      hasFocusedRef.current = false
      return
    }

    if (!hasFocusedRef.current) {
      summaryRef.current?.focus()
      hasFocusedRef.current = true
    }
  }, [errors.length])

  if (errors.length === 0) {
    return null
  }

  function handleErrorClick(event: MouseEvent<HTMLAnchorElement>, fieldId: string) {
    event.preventDefault()
    const control = document.getElementById(fieldId)
    if (control instanceof HTMLElement) {
      control.focus()
    }
  }

  return (
    <div
      ref={summaryRef}
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
      data-slot="form-error-summary"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm outline-none",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />

        <div className="min-w-0 space-y-1">
          <h2 id={titleId} className="font-medium text-destructive">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {errors.length === 1
              ? "Hay 1 campo que necesita tu atención."
              : `Hay ${errors.length} campos que necesitan tu atención.`}
          </p>

          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={`${error.fieldId}:${error.message}`}>
                <a
                  href={`#${error.fieldId}`}
                  onClick={(event) => handleErrorClick(event, error.fieldId)}
                  className="rounded-sm text-foreground underline underline-offset-4 hover:text-primary"
                >
                  <span className="font-medium">{error.label}:</span> {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
