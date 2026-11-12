import type { ReactNode } from "react"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface FormSectionProps {
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Agrupación semántica de campos dentro de un formulario.
 * Usa `fieldset` + `legend`, por lo que el grupo se anuncia correctamente.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <FieldSet data-slot="form-section" className={cn("gap-4", className)}>
      <FieldLegend>{title}</FieldLegend>

      {description && (
        <p data-slot="form-section-description" className="-mt-3 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <FieldGroup className={cn("gap-4", contentClassName)}>{children}</FieldGroup>
    </FieldSet>
  )
}
