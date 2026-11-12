import type { FormEvent, ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type FieldErrors, type FieldValues } from "react-hook-form"
import { FormActions } from "@/components/app/FormActions"
import { FormErrorSummary, type FormErrorItem } from "@/components/app/FormErrorSummary"
import { FormField } from "@/components/app/FormField"
import { MonthPicker } from "@/components/app/MonthPicker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { monthStart } from "@/lib/format/dates"
import { useCatalogOptions } from "../queries"
import {
  categoriaSchema,
  direccionSchema,
  monedaSchema,
  parametroMensualSchema,
  parametroMensualToFormValues,
  parametroMensualToInput,
  proyectoSchema,
  type CategoriaFormValues,
  type DireccionFormValues,
  type MonedaFormValues,
  type ParametroMensualFormValues,
  type ProyectoFormValues,
} from "../schemas"
import {
  codigosMoneda,
  estadosProyecto,
  gradosCerteza,
  tiposCategoria,
  type Categoria,
  type CategoriaInput,
  type Direccion,
  type Financiador,
  type Moneda,
  type MonedaInput,
  type ParametroMensual,
  type ParametroMensualInput,
  type Proyecto,
  type ProyectoInput,
} from "../types"

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

interface FormShellProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isSubmitting: boolean
  children: ReactNode
  submitLabel?: string
}

function FormShell({
  onSubmit,
  onCancel,
  isSubmitting,
  children,
  submitLabel = "Guardar",
}: FormShellProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {children}

      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
      </FormActions>
    </form>
  )
}

interface NombreFormProps {
  item: Direccion | Financiador | null
  onSubmit: (input: { nombre: string }) => Promise<void>
  onCancel: () => void
  idPrefix: string
}

/** Alta y edición de catálogos que solo tienen un nombre. */
export function NombreForm({ item, onSubmit, onCancel, idPrefix }: NombreFormProps) {
  const form = useForm<DireccionFormValues>({
    resolver: zodResolver(direccionSchema),
    defaultValues: { nombre: item?.nombre ?? "" },
  })

  const errors = getErrorItems(form.formState.errors, { nombre: "Nombre" }, idPrefix)

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      // El hook de mutación ya notificó el error y el panel queda abierto.
    }
  })

  return (
    <FormShell
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={form.formState.isSubmitting}
    >
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <FormField
        id={`${idPrefix}-nombre`}
        label="Nombre"
        error={form.formState.errors.nombre?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("nombre")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            autoComplete="organization"
          />
        )}
      </FormField>
    </FormShell>
  )
}

interface CategoriaFormProps {
  item: Categoria | null
  onSubmit: (input: CategoriaInput) => Promise<void>
  onCancel: () => void
}

export function CategoriaForm({ item, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: item?.nombre ?? "",
      tipo: item?.tipo ?? "proyecto",
    },
  })

  const idPrefix = "categoria"
  const errors = getErrorItems(form.formState.errors, { nombre: "Nombre", tipo: "Tipo" }, idPrefix)

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      // El hook de mutación ya notificó el error.
    }
  })

  return (
    <FormShell
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={form.formState.isSubmitting}
    >
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <FormField
        id={`${idPrefix}-nombre`}
        label="Nombre"
        error={form.formState.errors.nombre?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("nombre")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>

      <Controller
        control={form.control}
        name="tipo"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-tipo`}
            label="Tipo"
            error={form.formState.errors.tipo?.message}
            required
          >
            {(control) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={tiposCategoria.map((tipo) => ({
                  value: tipo,
                  label: tipo === "estructura_fija" ? "Estructura fija" : "Proyecto",
                }))}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Elegí un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCategoria.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo === "estructura_fija" ? "Estructura fija" : "Proyecto"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />
    </FormShell>
  )
}

interface MonedaFormProps {
  item: Moneda | null
  onSubmit: (input: MonedaInput) => Promise<void>
  onCancel: () => void
}

export function MonedaForm({ item, onSubmit, onCancel }: MonedaFormProps) {
  const form = useForm<MonedaFormValues>({
    resolver: zodResolver(monedaSchema),
    defaultValues: {
      codigo: item?.codigo ?? "ARS",
      descripcion: item?.descripcion ?? "",
    },
  })

  const idPrefix = "moneda"
  const errors = getErrorItems(
    form.formState.errors,
    { codigo: "Código", descripcion: "Descripción" },
    idPrefix,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      // El hook de mutación ya notificó el error.
    }
  })

  return (
    <FormShell
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={form.formState.isSubmitting}
    >
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <Controller
        control={form.control}
        name="codigo"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-codigo`}
            label="Código"
            description="Código ISO de tres letras."
            error={form.formState.errors.codigo?.message}
            required
          >
            {(control) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={codigosMoneda.map((codigo) => ({ value: codigo, label: codigo }))}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Elegí un código" />
                </SelectTrigger>
                <SelectContent>
                  {codigosMoneda.map((codigo) => (
                    <SelectItem key={codigo} value={codigo}>
                      {codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <FormField
        id={`${idPrefix}-descripcion`}
        label="Descripción"
        error={form.formState.errors.descripcion?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("descripcion")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>
    </FormShell>
  )
}

interface ProyectoFormProps {
  item: Proyecto | null
  onSubmit: (input: ProyectoInput) => Promise<void>
  onCancel: () => void
}

export function ProyectoForm({ item, onSubmit, onCancel }: ProyectoFormProps) {
  const direcciones = useCatalogOptions("direcciones")
  const financiadores = useCatalogOptions("financiadores")
  const form = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      nombre: item?.nombre ?? "",
      direccionId: item?.direccionId ?? "",
      financiadorId: item?.financiadorId ?? null,
      estado: item?.estado ?? "En preparación",
      gradoCerteza: item?.gradoCerteza ?? null,
      esFicticioEstructura: item?.esFicticioEstructura ?? false,
    },
  })

  const idPrefix = "proyecto"
  const errors = getErrorItems(
    form.formState.errors,
    {
      nombre: "Nombre",
      direccionId: "Dirección",
      financiadorId: "Financiador",
      estado: "Estado",
      gradoCerteza: "Grado de certeza",
      esFicticioEstructura: "Proyecto de estructura",
    },
    idPrefix,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      // El hook de mutación ya notificó el error.
    }
  })

  return (
    <FormShell
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={form.formState.isSubmitting}
    >
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <FormField
        id={`${idPrefix}-nombre`}
        label="Nombre"
        error={form.formState.errors.nombre?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("nombre")}
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>

      <Controller
        control={form.control}
        name="direccionId"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-direccion`}
            label="Dirección"
            error={form.formState.errors.direccionId?.message}
            required
          >
            {(control) => (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={direcciones.items.map((direccion) => ({
                  value: direccion.id,
                  label: direccion.nombre,
                }))}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                  disabled={direcciones.isLoading}
                >
                  <SelectValue placeholder="Elegí una dirección" />
                </SelectTrigger>
                <SelectContent>
                  {direcciones.items.map((direccion) => (
                    <SelectItem key={direccion.id} value={direccion.id}>
                      {direccion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="financiadorId"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-financiador`}
            label="Financiador"
            error={form.formState.errors.financiadorId?.message}
            optional
          >
            {(control) => (
              <Select
                value={field.value ?? "sin-financiador"}
                onValueChange={(value) =>
                  field.onChange(value === "sin-financiador" ? null : value)
                }
                items={[
                  { value: "sin-financiador", label: "Sin financiador" },
                  ...financiadores.items.map((financiador) => ({
                    value: financiador.id,
                    label: financiador.nombre,
                  })),
                ]}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                  disabled={financiadores.isLoading}
                >
                  <SelectValue placeholder="Elegí un financiador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-financiador">Sin financiador</SelectItem>
                  {financiadores.items.map((financiador) => (
                    <SelectItem key={financiador.id} value={financiador.id}>
                      {financiador.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="estado"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-estado`}
            label="Estado"
            error={form.formState.errors.estado?.message}
            required
          >
            {(control) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={estadosProyecto.map((estado) => ({ value: estado, label: estado }))}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Elegí un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosProyecto.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="gradoCerteza"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-certeza`}
            label="Grado de certeza"
            error={form.formState.errors.gradoCerteza?.message}
            optional
          >
            {(control) => (
              <Select
                value={field.value ?? "sin-certeza"}
                onValueChange={(value) => field.onChange(value === "sin-certeza" ? null : value)}
                items={[
                  { value: "sin-certeza", label: "Sin definir" },
                  ...gradosCerteza.map((grado) => ({ value: grado, label: grado })),
                ]}
              >
                <SelectTrigger
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Elegí un grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-certeza">Sin definir</SelectItem>
                  {gradosCerteza.map((grado) => (
                    <SelectItem key={grado} value={grado}>
                      {grado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="esFicticioEstructura"
        render={({ field }) => (
          <div className="flex items-start gap-2 rounded-lg border p-3">
            <Checkbox
              id={`${idPrefix}-ficticio`}
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              aria-describedby={`${idPrefix}-ficticio-description`}
            />
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-ficticio`}>Proyecto ficticio de estructura</Label>
              <p id={`${idPrefix}-ficticio-description`} className="text-sm text-muted-foreground">
                Se usa para agrupar los gastos de estructura de la fundación.
              </p>
            </div>
          </div>
        )}
      />
    </FormShell>
  )
}

interface ParametroMensualFormProps {
  item: ParametroMensual | null
  onSubmit: (input: ParametroMensualInput) => Promise<void>
  onCancel: () => void
}

export function ParametroMensualForm({ item, onSubmit, onCancel }: ParametroMensualFormProps) {
  const form = useForm<ParametroMensualFormValues>({
    resolver: zodResolver(parametroMensualSchema),
    defaultValues: item
      ? parametroMensualToFormValues(item)
      : {
          mes: monthStart(new Date()),
          tipoCambioCcl: undefined,
          tipoCambioNacion: undefined,
          inflacionPorcentaje: 2.5,
        },
  })

  const idPrefix = "parametro"
  const errors = getErrorItems(
    form.formState.errors,
    {
      mes: "Mes",
      tipoCambioCcl: "Tipo de cambio CCL",
      tipoCambioNacion: "Tipo de cambio Nación",
      inflacionPorcentaje: "Inflación mensual",
    },
    idPrefix,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(parametroMensualToInput(values))
    } catch {
      // El hook de mutación ya notificó el error.
    }
  })

  return (
    <FormShell
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={form.formState.isSubmitting}
    >
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <Controller
        control={form.control}
        name="mes"
        render={({ field }) => (
          <FormField
            id={`${idPrefix}-mes`}
            label="Mes"
            description="Los parámetros se guardan normalizados al primer día del mes."
            error={form.formState.errors.mes?.message}
            required
          >
            {(control) => (
              <MonthPicker
                id={control.id}
                value={field.value}
                onChange={(value) => field.onChange(value ?? new Date())}
                aria-describedby={control.describedBy}
                aria-invalid={control.invalid}
              />
            )}
          </FormField>
        )}
      />

      <FormField
        id={`${idPrefix}-ccl`}
        label="Tipo de cambio CCL"
        description="Opcional. Pesos por dólar."
        error={form.formState.errors.tipoCambioCcl?.message}
        optional
      >
        {(field) => (
          <Input
            {...form.register("tipoCambioCcl", {
              setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
            })}
            id={field.id}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-nacion`}
        label="Tipo de cambio Nación"
        description="Opcional. Pesos por dólar."
        error={form.formState.errors.tipoCambioNacion?.message}
        optional
      >
        {(field) => (
          <Input
            {...form.register("tipoCambioNacion", {
              setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
            })}
            id={field.id}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-inflacion`}
        label="Inflación mensual (%)"
        description="Porcentaje del mes. La API lo guarda como fracción."
        error={form.formState.errors.inflacionPorcentaje?.message}
        required
      >
        {(field) => (
          <Input
            {...form.register("inflacionPorcentaje", { valueAsNumber: true })}
            id={field.id}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
          />
        )}
      </FormField>
    </FormShell>
  )
}
