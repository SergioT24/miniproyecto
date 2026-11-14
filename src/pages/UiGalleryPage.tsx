import { useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Info,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Settings,
  Shield,
  TriangleAlert,
  User,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { DatePicker } from "@/components/app/DatePicker"
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
import { MonthPicker } from "@/components/app/MonthPicker"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { StatusBadge } from "@/components/app/StatusBadge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { RecordsGrid } from "@/components/RecordsGrid"
import { estadosPresupuesto } from "@/lib/presupuesto"
import { DataTableDemo, DataTableEstadosDemo } from "@/pages/ui-gallery/DataTableDemo"
import {
  AlertDialogDemo,
  ChartCardDemo,
  FilterAndFieldComponentsDemo,
  NavigationComponentsDemo,
} from "@/pages/ui-gallery/ReusableComponentsDemo"

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

function SelectoresFechaDemo() {
  const [fecha, setFecha] = useState<Date | null>(new Date(2026, 2, 15))
  const [mes, setMes] = useState<Date | null>(new Date(2026, 2, 1))

  return (
    <div className="grid max-w-2xl gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
      <FormField
        id="demo-fecha"
        label="Fecha"
        description="Calendario de días con navegación por mes."
      >
        {(field) => (
          <DatePicker
            id={field.id}
            value={fecha}
            onChange={setFecha}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
          />
        )}
      </FormField>

      <FormField
        id="demo-mes"
        label="Mes"
        description="Grilla de doce meses con navegación por año."
      >
        {(field) => (
          <MonthPicker
            id={field.id}
            value={mes}
            onChange={setMes}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
          />
        )}
      </FormField>
    </div>
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

function BotonesDemo() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Variantes principales</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default / Primario</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Tamaños y estados con iconos</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">
            <LogIn className="mr-1.5 size-3.5" /> Pequeño (sm)
          </Button>
          <Button size="default">
            <KeyRound className="mr-2 size-4" /> Normal
          </Button>
          <Button size="lg">
            <Shield className="mr-2 size-5" /> Grande (lg)
          </Button>
          <Button disabled>
            <Lock className="mr-2 size-4" /> Deshabilitado
          </Button>
          <Button disabled>
            <Spinner className="mr-2 size-4" /> Procesando…
          </Button>
        </div>
      </div>
    </div>
  )
}

function AlertasDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Sesión activa</AlertTitle>
        <AlertDescription>
          Tu sesión se renovó automáticamente. Los cambios pendientes fueron sincronizados.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Credenciales incorrectas</AlertTitle>
        <AlertDescription>
          El correo o la contraseña no coinciden con nuestros registros. Verificá los datos.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function BadgesRolesDemo() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Roles del sistema (Fundación Huésped)
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Shield className="size-3" /> Administrador
          </Badge>
          <Badge variant="secondary">Editor</Badge>
          <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400">
            Aprobador
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          >
            Tesorería
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            Consulta
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Variantes estándar de Badge</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    </div>
  )
}

function UserMenuDemo() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Mockup de UserMenu (Navbar superior)</p>
        <p className="text-xs text-muted-foreground">
          Menú desplegable accesible con Base UI para colocar en la barra superior.
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className="flex items-center gap-2 rounded-full pl-2 pr-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                VA
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium leading-none">Vanesa Acosta</span>
                <span className="text-[10px] text-muted-foreground leading-none">Administrador</span>
              </div>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-1">
                <p className="text-xs font-semibold leading-none">Vanesa Acosta</p>
                <p className="text-[11px] text-muted-foreground leading-none">
                  vanesa.acosta@huesped.org.ar
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.info("Navegando a Mi perfil (demo)")}>
            <User className="mr-2 size-4" />
            <span>Mi perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Abriendo Cambio de contraseña (demo)")}>
            <KeyRound className="mr-2 size-4" />
            <span>Cambiar contraseña</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Abriendo Preferencias (demo)")}>
            <Settings className="mr-2 size-4" />
            <span>Preferencias</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={() => toast.success("Sesión cerrada (demo)")}
          >
            <LogOut className="mr-2 size-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function DialogCambiarPasswordDemo() {
  const [open, setOpen] = useState(false)
  const [actual, setActual] = useState("")
  const [nueva, setNueva] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Contraseña actualizada con éxito (demo).")
    setOpen(false)
    setActual("")
    setNueva("")
  }

  return (
    <div className="flex items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="outline">
              <KeyRound className="mr-2 size-4" /> Cambiar contraseña (Modal)
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Ingresá tu contraseña actual y la nueva clave. Debe contener al menos 8 caracteres.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <FormField id="pwd-actual" label="Contraseña actual" required>
              {(field) => (
                <Input
                  id={field.id}
                  type="password"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}
            </FormField>

            <FormField id="pwd-nueva" label="Nueva contraseña" required>
              {(field) => (
                <Input
                  id={field.id}
                  type="password"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}
            </FormField>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar clave</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CargaSkeletonsDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium">Spinners de actividad</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Spinner className="size-4 text-primary" />
            <span className="text-xs text-muted-foreground">size-4</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner className="size-6 text-primary" />
            <span className="text-xs text-muted-foreground">size-6</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner className="size-8 text-primary" />
            <span className="text-xs text-muted-foreground">size-8</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium">Esqueletos de perfil y sesión</h3>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginCardDemo() {
  const [simularError, setSimularError] = useState(false)
  const [email, setEmail] = useState("admin@huesped.org.ar")
  const [password, setPassword] = useState("••••••••")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (simularError) {
        toast.error("Error al iniciar sesión: credenciales no válidas.")
      } else {
        toast.success("¡Bienvenido/a al Sistema de Finanzas!")
      }
    }, 700)
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/20 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Button
          size="sm"
          variant={simularError ? "destructive" : "outline"}
          onClick={() => setSimularError(!simularError)}
        >
          {simularError ? "Desactivar error simulado" : "Simular error de login"}
        </Button>
      </div>

      <Card className="w-full max-w-sm bg-card shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <CardTitle className="text-lg">Fundación Huésped</CardTitle>
          <CardDescription>Ingreso al Sistema de Finanzas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {simularError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error de acceso</AlertTitle>
                <AlertDescription className="text-xs">
                  Correo o contraseña incorrectos. Intento 1 de 5.
                </AlertDescription>
              </Alert>
            )}

            <FormField id="demo-login-email" label="Correo electrónico" required>
              {(field) => (
                <Input
                  id={field.id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@huesped.org.ar"
                  required
                />
              )}
            </FormField>

            <FormField id="demo-login-pass" label="Contraseña" required>
              {(field) => (
                <Input
                  id={field.id}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}
            </FormField>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {loading ? "Verificando…" : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
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

      {/* SECCIÓN ESPECIAL: COMPONENTES DE AUTENTICACIÓN, ROLES Y ACCIONES */}
      <GallerySection
        title="Botones y acciones"
        description="Variantes principales, secundarios, destructivos, tamaños y estados interactivos."
      >
        <BotonesDemo />
      </GallerySection>

      <GallerySection
        title="Alertas y mensajes de seguridad"
        description="Avisos contextuales informativos y de error para validaciones de login o credenciales."
      >
        <AlertasDemo />
      </GallerySection>

      <GallerySection
        title="Badges y roles de usuario"
        description="Etiquetas visuales para identificar roles de la Fundación y estados en el sistema."
      >
        <BadgesRolesDemo />
      </GallerySection>

      <GallerySection
        title="Menú de usuario (UserMenu)"
        description="Mockup del menú de usuario para la barra superior (Navbar), con dropdown accesible y logout."
      >
        <UserMenuDemo />
      </GallerySection>

      <GallerySection
        title="Diálogo modal de contraseña"
        description="Modal interactivo estándar con formulario para cambio de credenciales o edición de perfil."
      >
        <DialogCambiarPasswordDemo />
      </GallerySection>

      <GallerySection
        title="Carga y esqueletos de autenticación"
        description="Spinners y esqueletos animados para estados de verificación de sesión sin parpadeo."
      >
        <CargaSkeletonsDemo />
      </GallerySection>

      <GallerySection
        title="Maqueta de inicio de sesión (Login Card)"
        description="Ejemplo interactivo de tarjeta de ingreso montada con Card, FormField, Button y Alert."
      >
        <LoginCardDemo />
      </GallerySection>

      <GallerySection
        title="Navegación y ayuda"
        description="Breadcrumb, pestañas y tooltip para orientar la navegación y dar contexto."
      >
        <NavigationComponentsDemo />
      </GallerySection>

      <GallerySection
        title="Filtros y campos base"
        description="Selector etiquetado, agrupación semántica, checkbox y área de texto."
      >
        <FilterAndFieldComponentsDemo />
      </GallerySection>

      <GallerySection
        title="Tarjeta de gráfico"
        description="Contenedor reutilizable para gráficos con título, descripción y contenido accesible."
      >
        <ChartCardDemo />
      </GallerySection>

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
        title="Selectores de fecha"
        description="Fecha puntual y mes con teclado, popover accesible y formato local."
      >
        <SelectoresFechaDemo />
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
        description="Confirmación, alert dialog y notificaciones breves."
      >
        <div className="space-y-6">
          <ConfirmDialogDemo />
          <AlertDialogDemo />
          <ToastsDemo />
        </div>
      </GallerySection>
    </div>
  )
}
