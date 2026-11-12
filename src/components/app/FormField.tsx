import { useId, type ReactNode } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface FormFieldControlProps {
  /** Id que debe recibir el control para asociarse con el label. */
  id: string
  descriptionId?: string
  errorId?: string
  /** Valor listo para `aria-describedby`, o `undefined` si no hay ayudas. */
  describedBy?: string
  /** Valor listo para `aria-invalid`. */
  invalid: boolean
  required: boolean
}

export interface FormFieldProps {
  /** Id explícito del control. Si se omite, se genera uno estable. */
  id?: string
  label: ReactNode
  description?: ReactNode
  error?: string
  required?: boolean
  /** Muestra “(opcional)” cuando el campo no es obligatorio. */
  optional?: boolean
  className?: string
  children: (props: FormFieldControlProps) => ReactNode
}

/**
 * Campo de formulario accesible sobre `field`.
 *
 * El render prop entrega el `id` y los atributos ARIA para que el control
 * quede asociado al label, la descripción y el error, sin duplicar lógica
 * en cada formulario. Funciona con inputs nativos, RHF o `Controller`.
 */
export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  optional = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const descriptionId = description ? `${controlId}-description` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <Field data-slot="form-field" data-invalid={error ? true : undefined} className={cn(className)}>
      <FieldLabel htmlFor={controlId}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
        {!required && optional && (
          <span className="font-normal text-muted-foreground">(opcional)</span>
        )}
      </FieldLabel>

      {children({
        id: controlId,
        descriptionId,
        errorId,
        describedBy,
        invalid: Boolean(error),
        required,
      })}

      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {error && <FieldError id={errorId} errors={[{ message: error }]} />}
    </Field>
  )
}
