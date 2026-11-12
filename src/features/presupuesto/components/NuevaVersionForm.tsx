import type { FormEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type FieldErrors, type FieldValues } from "react-hook-form"
import { FormActions } from "@/components/app/FormActions"
import { FormErrorSummary, type FormErrorItem } from "@/components/app/FormErrorSummary"
import { FormField } from "@/components/app/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { nuevaVersionSchema, nuevaVersionToInput, type NuevaVersionFormValues } from "../schemas"
import type { NuevaVersionInput, VersionProyeccion } from "../types"

function getErrorItems<T extends FieldValues>(
  errors: FieldErrors<T>,
  labels: Partial<Record<keyof T, string>>,
  idPrefix: string,
): FormErrorItem[] {
  return (Object.keys(labels) as Array<keyof T>).flatMap((field) => {
    const error = errors[field]

    if (!error || typeof error !== "object" || !("message" in error)) {
      return []
    }

    const message = error.message

    if (typeof message !== "string" || !message) {
      return []
    }

    return [
      {
        fieldId: `${idPrefix}-${String(field)}`,
        label: labels[field] ?? String(field),
        message,
      },
    ]
  })
}

export interface NuevaVersionFormProps {
  versiones: VersionProyeccion[]
  defaultVersionId: string
  onSubmit: (input: NuevaVersionInput) => Promise<void>
  onCancel: () => void
}

export function NuevaVersionForm({
  versiones,
  defaultVersionId,
  onSubmit,
  onCancel,
}: NuevaVersionFormProps) {
  const form = useForm<NuevaVersionFormValues>({
    resolver: zodResolver(nuevaVersionSchema),
    defaultValues: {
      nombre: "",
      versionBaseId: defaultVersionId,
      observaciones: "",
    },
  })

  const idPrefix = "nueva-version"
  const errors = getErrorItems(
    form.formState.errors,
    {
      nombre: "Nombre de la versión",
      versionBaseId: "Versión base",
      observaciones: "Observaciones",
    },
    idPrefix,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(nuevaVersionToInput(values))
    } catch {
      // La mutación ya notificó el error y el panel queda abierto.
    }
  })

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(event)
  }

  const versionItems = versiones.map((version) => ({
    value: version.id,
    label: `${version.nombre}${version.esInmutable ? " (cerrada)" : ""}`,
  }))

  return (
    <form noValidate onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <FormField
        id={`${idPrefix}-nombre`}
        label="Nombre de la versión"
        description="Por ejemplo, Abril o Junio. Debe ser único dentro del presupuesto."
        error={form.formState.errors.nombre?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("nombre")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            autoComplete="off"
          />
        )}
      </FormField>

      <Controller
        control={form.control}
        name="versionBaseId"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-base`}
            label="Versión base"
            description="La nueva versión copia las líneas congeladas de esta versión."
            error={form.formState.errors.versionBaseId?.message}
            required
          >
            {(control) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value)
                  }
                }}
                items={versionItems}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Elegí una versión" />
                </SelectTrigger>
                <SelectContent>
                  {versiones.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.nombre}
                      {version.esInmutable ? " (cerrada)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <FormField
        id={`${idPrefix}-observaciones`}
        label="Observaciones"
        description="Opcional. Contexto del corte o de los cambios proyectados."
        error={form.formState.errors.observaciones?.message}
        optional
      >
        {(field) => (
          <Textarea
            {...form.register("observaciones")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            rows={4}
          />
        )}
      </FormField>

      <FormActions>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creando…" : "Crear versión"}
        </Button>
      </FormActions>
    </form>
  )
}
