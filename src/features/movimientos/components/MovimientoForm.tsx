import type { FormEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch, type FieldErrors, type FieldValues } from "react-hook-form"
import { DatePicker } from "@/components/app/DatePicker"
import { FormActions } from "@/components/app/FormActions"
import { FormErrorSummary, type FormErrorItem } from "@/components/app/FormErrorSummary"
import { FormField } from "@/components/app/FormField"
import { FormSection } from "@/components/app/FormSection"
import { MoneyInput } from "@/components/app/MoneyInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { codigosMoneda, gradosCerteza } from "@/features/parametros/types"
import { estadoCobroPagoLabel } from "../aggregate"
import {
  createMovimientoSchema,
  movimientoToFormValues,
  movimientoToInput,
  type MovimientoFormValues,
  type PeriodoMovimiento,
} from "../schemas"
import {
  estadosPorTipo,
  type EstadoCobroPago,
  type Movimiento,
  type MovimientoInput,
  type TipoMovimiento,
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

const tipoItems = [
  { value: "ingreso", label: "Ingreso" },
  { value: "egreso", label: "Egreso" },
]

const monedaItems = codigosMoneda.map((moneda) => ({
  value: moneda,
  label: moneda === "ARS" ? "Pesos argentinos (ARS)" : "Dólares estadounidenses (USD)",
}))

const gradoItems = [
  { value: "sin-definir", label: "Sin definir" },
  ...gradosCerteza.map((grado) => ({ value: grado, label: grado })),
]

export interface MovimientoFormProps {
  movimiento: Movimiento | null
  proyectos: Array<{ id: string; nombre: string }>
  categorias: Array<{ id: string; nombre: string }>
  periodo: PeriodoMovimiento
  onSubmit: (input: MovimientoInput) => Promise<void>
  onCancel: () => void
}

/**
 * Alta y edición de un movimiento previsto. El tipo define qué detalle se
 * completa y qué estados de cobro o pago son válidos.
 */
export function MovimientoForm({
  movimiento,
  proyectos,
  categorias,
  periodo,
  onSubmit,
  onCancel,
}: MovimientoFormProps) {
  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(createMovimientoSchema(periodo)),
    defaultValues: movimientoToFormValues(movimiento, periodo),
  })

  const idPrefix = "movimiento"
  const tipo = useWatch({ control: form.control, name: "tipo" })
  const moneda = useWatch({ control: form.control, name: "moneda" })
  const esIngreso = tipo === "ingreso"
  const estadoItems = estadosPorTipo(tipo).map((estado) => ({
    value: estado,
    label: estadoCobroPagoLabel(estado),
  }))
  const proyectoItems = proyectos.map((proyecto) => ({
    value: proyecto.id,
    label: proyecto.nombre,
  }))
  const categoriaItems = categorias.map((categoria) => ({
    value: categoria.id,
    label: categoria.nombre,
  }))

  const errors = getErrorItems(
    form.formState.errors,
    {
      tipo: "Tipo",
      concepto: "Concepto",
      proyectoId: "Proyecto",
      categoriaId: "Categoría",
      moneda: "Moneda",
      importeOriginal: "Importe",
      fechaProbable: "Fecha probable",
      fechaPrevistaOriginal: "Fecha prevista original",
      gradoCerteza: "Grado de certeza",
      estadoCobroPago: "Estado",
      cuentaDestino: "Cuenta destino",
      condicionCobro: "Condición de cobro",
      proveedorDestinatario: "Proveedor o destinatario",
      cuentaOrigen: "Cuenta origen",
      tipoGasto: "Tipo de gasto",
    },
    idPrefix,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(movimientoToInput(values))
    } catch {
      // La mutación ya notificó el error y el panel queda abierto.
    }
  })

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(event)
  }

  function handleTipoChange(value: string | null) {
    if (value !== "ingreso" && value !== "egreso") {
      return
    }

    const nextTipo: TipoMovimiento = value
    form.setValue("tipo", nextTipo, { shouldDirty: true })

    const estadoActual = form.getValues("estadoCobroPago")

    if (!estadosPorTipo(nextTipo).includes(estadoActual)) {
      form.setValue("estadoCobroPago", "previsto", { shouldDirty: true })
    }

    form.clearErrors("estadoCobroPago")
  }

  return (
    <form noValidate onSubmit={handleFormSubmit} className="flex flex-col gap-5">
      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <FormSection
        title="Datos generales"
        description="El movimiento se imputa al proyecto y a la categoría seleccionados."
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
                    onValueChange={handleTipoChange}
                    items={tipoItems}
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
                      {tipoItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          />

          <FormField
            id={`${idPrefix}-concepto`}
            label="Concepto"
            description="Descripción breve del ingreso o egreso."
            error={form.formState.errors.concepto?.message}
            required
          >
            {(field) => (
              <Input
                {...form.register("concepto")}
                id={field.id}
                aria-describedby={field.describedBy}
                aria-invalid={field.invalid || undefined}
                autoComplete="off"
              />
            )}
          </FormField>

          <Controller
            control={form.control}
            name="proyectoId"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-proyectoId`}
                label="Proyecto"
                error={form.formState.errors.proyectoId?.message}
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
                    items={proyectoItems}
                  >
                    <SelectTrigger
                      id={control.id}
                      aria-describedby={control.describedBy}
                      aria-invalid={control.invalid || undefined}
                      className="w-full"
                    >
                      <SelectValue placeholder="Elegí un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectoItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
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
            name="categoriaId"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-categoriaId`}
                label="Categoría"
                error={form.formState.errors.categoriaId?.message}
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
                    items={categoriaItems}
                  >
                    <SelectTrigger
                      id={control.id}
                      aria-describedby={control.describedBy}
                      aria-invalid={control.invalid || undefined}
                      className="w-full"
                    >
                      <SelectValue placeholder="Elegí una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriaItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
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
            name="moneda"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-moneda`}
                label="Moneda"
                error={form.formState.errors.moneda?.message}
                required
              >
                {(control) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === "ARS" || value === "USD") {
                        field.onChange(value)
                      }
                    }}
                    items={monedaItems}
                  >
                    <SelectTrigger
                      id={control.id}
                      aria-describedby={control.describedBy}
                      aria-invalid={control.invalid || undefined}
                      className="w-full"
                    >
                      <SelectValue placeholder="Elegí una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      {monedaItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
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
            name="importeOriginal"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-importeOriginal`}
                label="Importe"
                description={`Importe original expresado en ${moneda}.`}
                error={form.formState.errors.importeOriginal?.message}
                required
              >
                {(control) => (
                  <MoneyInput
                    id={control.id}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    currency={moneda}
                    allowNegative={false}
                    aria-describedby={control.describedBy}
                    aria-invalid={control.invalid || undefined}
                  />
                )}
              </FormField>
            )}
          />

          <Controller
            control={form.control}
            name="fechaProbable"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-fechaProbable`}
                label="Fecha probable"
                description="Se usa para proyectar el cash flow y las versiones."
                error={form.formState.errors.fechaProbable?.message}
                required
              >
                {(control) => (
                  <DatePicker
                    id={control.id}
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    aria-describedby={control.describedBy}
                    aria-invalid={control.invalid || undefined}
                  />
                )}
              </FormField>
            )}
          />

          <Controller
            control={form.control}
            name="fechaPrevistaOriginal"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-fechaPrevistaOriginal`}
                label="Fecha prevista original"
                description="Opcional. Sirve para comparar la planificación inicial."
                error={form.formState.errors.fechaPrevistaOriginal?.message}
                optional
              >
                {(control) => (
                  <DatePicker
                    id={control.id}
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    aria-describedby={control.describedBy}
                    aria-invalid={control.invalid || undefined}
                    placeholder="Sin fecha original"
                  />
                )}
              </FormField>
            )}
          />

          <Controller
            control={form.control}
            name="gradoCerteza"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-gradoCerteza`}
                label="Grado de certeza"
                error={form.formState.errors.gradoCerteza?.message}
                optional
              >
                {(control) => (
                  <Select
                    value={field.value ?? "sin-definir"}
                    onValueChange={(value) => {
                      field.onChange(value === "sin-definir" ? null : value)
                    }}
                    items={gradoItems}
                  >
                    <SelectTrigger
                      id={control.id}
                      aria-describedby={control.describedBy}
                      aria-invalid={control.invalid || undefined}
                      className="w-full"
                    >
                      <SelectValue placeholder="Sin definir" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradoItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
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
            name="estadoCobroPago"
            render={({ field }) => (
              <FormField
                id={`${idPrefix}-estadoCobroPago`}
                label="Estado"
                description={
                  esIngreso
                    ? "Situación del cobro del ingreso."
                    : "Situación del pago del egreso."
                }
                error={form.formState.errors.estadoCobroPago?.message}
                required
              >
                {(control) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value as EstadoCobroPago)
                      }
                    }}
                    items={estadoItems}
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
                      {estadoItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          />
        </div>
      </FormSection>

      {esIngreso ? (
        <FormSection
          title="Detalle del ingreso"
          description="Datos de cobro. Todos los campos son opcionales."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={`${idPrefix}-cuentaDestino`}
              label="Cuenta destino"
              error={form.formState.errors.cuentaDestino?.message}
              optional
            >
              {(field) => (
                <Input
                  {...form.register("cuentaDestino")}
                  id={field.id}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  autoComplete="off"
                />
              )}
            </FormField>

            <FormField
              id={`${idPrefix}-condicionCobro`}
              label="Condición de cobro"
              error={form.formState.errors.condicionCobro?.message}
              optional
            >
              {(field) => (
                <Input
                  {...form.register("condicionCobro")}
                  id={field.id}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  autoComplete="off"
                />
              )}
            </FormField>
          </div>
        </FormSection>
      ) : (
        <FormSection
          title="Detalle del egreso"
          description="Datos del pago. Todos los campos son opcionales."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={`${idPrefix}-proveedorDestinatario`}
              label="Proveedor o destinatario"
              error={form.formState.errors.proveedorDestinatario?.message}
              optional
            >
              {(field) => (
                <Input
                  {...form.register("proveedorDestinatario")}
                  id={field.id}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  autoComplete="off"
                />
              )}
            </FormField>

            <FormField
              id={`${idPrefix}-cuentaOrigen`}
              label="Cuenta origen"
              error={form.formState.errors.cuentaOrigen?.message}
              optional
            >
              {(field) => (
                <Input
                  {...form.register("cuentaOrigen")}
                  id={field.id}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  autoComplete="off"
                />
              )}
            </FormField>

            <FormField
              id={`${idPrefix}-tipoGasto`}
              label="Tipo de gasto"
              error={form.formState.errors.tipoGasto?.message}
              optional
            >
              {(field) => (
                <Input
                  {...form.register("tipoGasto")}
                  id={field.id}
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  autoComplete="off"
                />
              )}
            </FormField>
          </div>
        </FormSection>
      )}

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
          {form.formState.isSubmitting
            ? "Guardando…"
            : movimiento
              ? "Guardar cambios"
              : "Crear movimiento"}
        </Button>
      </FormActions>
    </form>
  )
}
