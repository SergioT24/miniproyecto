import { useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Clock3, TriangleAlert } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { EmptyState } from "@/components/app/EmptyState"
import { ErrorState } from "@/components/app/ErrorState"
import { FilterBar } from "@/components/app/FilterBar"
import { FormActions } from "@/components/app/FormActions"
import { FormErrorSummary } from "@/components/app/FormErrorSummary"
import { FormField } from "@/components/app/FormField"
import { FormSection } from "@/components/app/FormSection"
import { LoadingState } from "@/components/app/LoadingState"
import { MaskedValue } from "@/components/app/MaskedValue"
import { MetricCard } from "@/components/app/MetricCard"
import { MoneyInput } from "@/components/app/MoneyInput"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { StatusBadge } from "@/components/app/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RecordsGrid } from "@/components/RecordsGrid"
import { estadosPresupuesto } from "@/lib/presupuesto"
import { DataTableDemo, DataTableEstadosDemo } from "@/pages/ui-gallery/DataTableDemo"

const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

interface GallerySectionProps {
  title: string
  description: string
  children: ReactNode
}

function GallerySection({ title, description, children }: GallerySectionProps) {
  return (
    <section
      aria-labelledby={`seccion-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className="space-y-4"
    >
      <div className="space-y-1">
        <h2
          id={`seccion-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-lg font-semibold"
        >
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ToastsDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast.success("Guardado correctamente")}>Éxito</Button>
      <Button
        variant="destructive"
        onClick={() => toast.error("No se pudo guardar. Revisá los campos.")}
      >
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.info("Hay saldos de hoy sin cargar")}>
        Información
      </Button>
      <Button variant="outline" onClick={() => toast.warning("El período está por cerrarse")}>
        Advertencia
      </Button>
    </div>
  )
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)
  const [resultado, setResultado] = useState("Todavía no confirmaste nada.")

  return (
    <div className="space-y-3">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Eliminar movimiento
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {resultado}
      </p>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar movimiento?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => setResultado("Movimiento eliminado (demo).")}
      />
    </div>
  )
}

function FilterBarDemo() {
  const [busqueda, setBusqueda] = useState("")

  return (
    <div className="space-y-3">
      <FilterBar
        actions={
          <Button
            variant="outline"
            onClick={() => setBusqueda("")}
            disabled={busqueda.length === 0}
          >
            Limpiar filtros
          </Button>
        }
      >
        <FormField id="demo-filtro-busqueda" label="Buscar" className="w-full sm:w-72">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Detalle o proyecto"
            />
          )}
        </FormField>
      </FilterBar>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {busqueda ? `Filtrando por “${busqueda}”.` : "Sin búsqueda activa."}
      </p>
    </div>
  )
}

const formularioSchema = z.object({
  detalle: z
    .string()
    .trim()
    .min(1, "Ingresá un detalle.")
    .max(120, "El detalle no puede superar los 120 caracteres."),
  monto: z
    .number()
    .nullable()
    .refine((value) => value !== null && value > 0, "Ingresá un monto mayor a 0."),
  estado: z.string().min(1, "Elegí un estado."),
})

type FormularioValores = z.infer<typeof formularioSchema>

const formularioId = "demo-presupuesto"

const formularioEtiquetas: Record<keyof FormularioValores, string> = {
  detalle: "Detalle",
  monto: "Monto",
  estado: "Estado",
}

function FormularioDemo() {
  const form = useForm<FormularioValores>({
    resolver: zodResolver(formularioSchema),
    defaultValues: { detalle: "", monto: null, estado: "" },
    mode: "onSubmit",
  })
  const [intento, setIntento] = useState(0)
  const [ultimoEnvio, setUltimoEnvio] = useState<string | null>(null)

  const errores = (Object.keys(formularioEtiquetas) as Array<keyof FormularioValores>).flatMap(
    (campo) => {
      const error = form.formState.errors[campo]

      if (!error) {
        return []
      }

      return [
        {
          fieldId: `${formularioId}-${campo}`,
          label: formularioEtiquetas[campo],
          message: typeof error.message === "string" ? error.message : "Revisá este campo.",
        },
      ]
    },
  )

  function handleValid(values: FormularioValores) {
    setUltimoEnvio(
      `${values.detalle} · ${formatoPesos.format(values.monto ?? 0)} · ${values.estado}`,
    )
    setIntento(0)
    form.reset()
  }

  const handleSubmit = form.handleSubmit(handleValid, () => setIntento((current) => current + 1))

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-xl border bg-card p-5"
    >
      {errores.length > 0 && <FormErrorSummary key={`intento-${intento}`} errors={errores} />}

      <FormSection
        title="Datos del registro"
        description="Los campos marcados con * son obligatorios."
      >
        <Controller
          control={form.control}
          name="detalle"
          render={({ field, fieldState }) => (
            <FormField
              id={`${formularioId}-detalle`}
              label="Detalle"
              description="Máximo 120 caracteres."
              error={fieldState.error?.message}
              required
            >
              {({ id, describedBy, invalid, required }) => (
                <Input
                  {...field}
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  required={required}
                  placeholder="Ej.: Compra de insumos"
                />
              )}
            </FormField>
          )}
        />

        <Controller
          control={form.control}
          name="monto"
          render={({ field, fieldState }) => (
            <FormField
              id={`${formularioId}-monto`}
              label="Monto"
              description="Se guarda como número, sin separadores de miles."
              error={fieldState.error?.message}
              required
            >
              {({ id, describedBy, invalid, required }) => (
                <MoneyInput
                  id={id}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  required={required}
                  placeholder="0"
                />
              )}
            </FormField>
          )}
        />

        <Controller
          control={form.control}
          name="estado"
          render={({ field, fieldState }) => (
            <FormField
              id={`${formularioId}-estado`}
              label="Estado"
              error={fieldState.error?.message}
              required
            >
              {({ id, describedBy, invalid, required }) => (
                <Select
                  name={field.name}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  required={required}
                >
                  <SelectTrigger
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    className="w-full"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Seleccioná un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosPresupuesto.map((estado) => (
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
      </FormSection>

      <FormActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset()
            setIntento(0)
            setUltimoEnvio(null)
          }}
        >
          Limpiar
        </Button>
        <Button type="submit">Guardar registro</Button>
      </FormActions>

      <p role="status" className="text-sm text-muted-foreground">
        {ultimoEnvio ? `Último envío: ${ultimoEnvio}` : "Todavía no enviaste el formulario."}
      </p>
    </form>
  )
}

function QueryStatesDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">Cargando</h3>
        <LoadingState />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">Error recuperable</h3>
        <ErrorState onRetry={() => toast.info("Reintento solicitado (demo).")} />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">Consulta sin resultados</h3>
        <QueryState
          isEmpty
          emptyState={
            <EmptyState
              illustration="movements"
              title="No se encontraron movimientos"
              description="Probá con otro período o ajustá los filtros."
            />
          }
        >
          <p>Contenido con datos.</p>
        </QueryState>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">Consulta con datos</h3>
        <QueryState isLoading={false} isError={false} isEmpty={false}>
          <p className="py-6 text-center text-sm text-muted-foreground">
            3 movimientos listos para mostrar.
          </p>
        </QueryState>
      </div>
    </div>
  )
}

function DatosDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium">Importes y valores ocultos</h3>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Saldo total</dt>
            <dd>
              <CurrencyDisplay value={1234567.5} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Variación</dt>
            <dd>
              <CurrencyDisplay value={-24500} showSign />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Sin dato</dt>
            <dd>
              <CurrencyDisplay value={null} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Saldo restringido</dt>
            <dd>
              <MaskedValue label="Saldo restringido">
                <CurrencyDisplay value={98500} />
              </MaskedValue>
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium">Estados</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success" icon={CheckCircle2}>
            Aprobado
          </StatusBadge>
          <StatusBadge tone="warning" icon={Clock3}>
            Pendiente
          </StatusBadge>
          <StatusBadge tone="danger" icon={TriangleAlert}>
            Observado
          </StatusBadge>
          <StatusBadge tone="info">En revisión</StatusBadge>
          <StatusBadge tone="neutral">Sin estado</StatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">
          El texto siempre acompaña al color y al ícono.
        </p>
      </div>
    </div>
  )
}

function MiniBars() {
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-full" fill="none" aria-hidden="true">
      <rect x="8" y="58" width="10" height="32" rx="5" className="fill-primary" />
      <rect x="26" y="30" width="10" height="60" rx="5" className="fill-primary/30" />
      <rect x="48" y="44" width="10" height="46" rx="5" className="fill-primary" />
      <rect x="66" y="24" width="10" height="66" rx="5" className="fill-primary/30" />
      <rect x="88" y="52" width="10" height="38" rx="5" className="fill-chart-2/40" />
    </svg>
  )
}

function MiniLine({ tone = "primary" }: { tone?: "primary" | "secondary" }) {
  const strokeClassName = tone === "primary" ? "stroke-primary" : "stroke-chart-2"
  const fillClassName = tone === "primary" ? "fill-primary" : "fill-chart-2"

  return (
    <svg viewBox="0 0 120 96" className="h-24 w-full" fill="none" aria-hidden="true">
      <path
        d="M8 74 28 46l22 16 24-30 28-14"
        className={strokeClassName}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="102" cy="18" r="4" className={`${fillClassName} stroke-card`} strokeWidth="2" />
    </svg>
  )
}

function MiniGauge() {
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-full" fill="none" aria-hidden="true">
      <circle cx="60" cy="52" r="32" className="stroke-muted" strokeWidth="10" />
      <circle
        cx="60"
        cy="52"
        r="32"
        className="stroke-destructive"
        strokeWidth="10"
        pathLength={100}
        strokeDasharray="75 25"
        strokeLinecap="round"
        transform="rotate(-90 60 52)"
      />
      <text
        x="60"
        y="57"
        textAnchor="middle"
        className="fill-foreground text-lg font-semibold"
        stroke="none"
      >
        75%
      </text>
    </svg>
  )
}

function MiniDonut() {
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-full" fill="none" aria-hidden="true">
      <circle cx="60" cy="48" r="30" className="stroke-muted" strokeWidth="10" />
      <circle
        cx="60"
        cy="48"
        r="30"
        className="stroke-primary"
        strokeWidth="10"
        pathLength={100}
        strokeDasharray="45 55"
        transform="rotate(-90 60 48)"
      />
      <circle
        cx="60"
        cy="48"
        r="30"
        className="stroke-warning"
        strokeWidth="10"
        pathLength={100}
        strokeDasharray="30 70"
        strokeDashoffset={-45}
        transform="rotate(-90 60 48)"
      />
      <circle
        cx="60"
        cy="48"
        r="30"
        className="stroke-destructive"
        strokeWidth="10"
        pathLength={100}
        strokeDasharray="25 75"
        strokeDashoffset={-75}
        transform="rotate(-90 60 48)"
      />
      <text
        x="60"
        y="53"
        textAnchor="middle"
        className="fill-foreground text-sm font-semibold"
        stroke="none"
      >
        $23K
      </text>
    </svg>
  )
}

export function UiGalleryPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Galería UI"
        description="Catálogo de componentes y patrones de la app. Ruta disponible solo en desarrollo."
        actions={
          <Button variant="outline" onClick={() => toast.success("Acción de página (demo).")}>
            Acción principal
          </Button>
        }
      />

      <GallerySection
        title="Filtros"
        description="Barra de filtros con landmark de búsqueda y acción para limpiar."
      >
        <FilterBarDemo />
      </GallerySection>

      <GallerySection
        title="Métricas"
        description="Tarjetas con valor, variación y un visual opcional. El color no es la única señal."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            value={formatoPesos.format(42500)}
            label="Ingresos totales"
            change="+22%"
            trend="up"
            visual={<MiniBars />}
            visualLabel="Barras con tendencia creciente de ingresos en los últimos cinco meses."
          />
          <MetricCard
            value={formatoPesos.format(38500)}
            label="Donaciones / fondos"
            change="+62%"
            trend="up"
            visual={<MiniLine />}
            visualLabel="Línea con tendencia creciente de donaciones en los últimos cinco meses."
          />
          <MetricCard
            value={formatoPesos.format(22600)}
            label="Impacto / alcance"
            change="+38%"
            trend="up"
            visual={<MiniLine tone="secondary" />}
            visualLabel="Línea con tendencia creciente de alcance en los últimos cinco meses."
          />
          <MetricCard
            value={formatoPesos.format(67100)}
            label="Objetivo anual"
            change="+32%"
            trend="up"
            description="75% del objetivo alcanzado"
            visual={<MiniGauge />}
            visualLabel="Anillo de progreso: 75% del objetivo anual."
          />
          <MetricCard
            value={formatoPesos.format(27900)}
            label="Crecimiento total"
            change="+49%"
            trend="up"
            description="Composición por fuente"
            visual={<MiniDonut />}
            visualLabel="Anillo de composición del crecimiento total por fuente."
          />
          <MetricCard
            value={formatoPesos.format(890000)}
            label="Egresos del mes"
            change="-4,2%"
            trend="down"
            description="vs. mes anterior"
          />
        </div>
      </GallerySection>

      <GallerySection
        title="Tabla de datos"
        description="Tabla genérica con búsqueda, orden, paginación, columnas visibles, selección y estados de consulta."
      >
        <DataTableDemo />
      </GallerySection>

      <GallerySection
        title="Estados de la tabla"
        description="La estructura de la tabla se mantiene mientras anuncia carga, error o ausencia de resultados."
      >
        <DataTableEstadosDemo />
      </GallerySection>

      <GallerySection
        title="Grilla con alta y edición"
        description="Listado de registros con panel lateral para agregar y editar."
      >
        <RecordsGrid />
      </GallerySection>

      <GallerySection
        title="Formularios"
        description="Campos accesibles, validación con React Hook Form + Zod, resumen de errores e input de dinero."
      >
        <FormularioDemo />
      </GallerySection>

      <GallerySection
        title="Estados de consulta"
        description="Carga, error recuperable, resultado vacío y contenido disponible."
      >
        <QueryStatesDemo />
      </GallerySection>

      <GallerySection
        title="Importes y estados"
        description="Formato consistente, ocultamiento de valores sensibles y estados que no dependen solo del color."
      >
        <DatosDemo />
      </GallerySection>

      <GallerySection
        title="Estados vacíos"
        description="Ilustraciones decorativas con un mensaje claro. No transmiten información por color."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            illustration="charts"
            title="No se encontraron gráficos"
            description="Probá con otro período o ajustá los filtros."
          />
          <EmptyState
            illustration="accounts"
            title="No se encontraron cuentas"
            description="Cuando agregues una cuenta, la vas a ver acá."
          />
          <EmptyState
            illustration="movements"
            title="No se encontraron movimientos"
            description="Revisá los filtros de fecha, proyecto o estado."
          />
          <EmptyState
            illustration="generic"
            title="No se encontraron resultados"
            description="Probá con otros filtros o revisá la búsqueda."
            action={
              <Button variant="outline" onClick={() => toast.info("Filtros limpiados (demo).")}>
                Limpiar filtros
              </Button>
            }
          />
        </div>
      </GallerySection>

      <GallerySection
        title="Diálogos y avisos"
        description="Confirmación de acciones destructivas y notificaciones breves."
      >
        <div className="space-y-6">
          <ConfirmDialogDemo />
          <ToastsDemo />
        </div>
      </GallerySection>
    </div>
  )
}
