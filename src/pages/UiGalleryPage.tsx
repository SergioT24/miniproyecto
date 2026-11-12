import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { EmptyState } from "@/components/app/EmptyState"
import { MetricCard } from "@/components/app/MetricCard"
import DataTable from "@/components/DataTable"
import { RecordForm } from "@/components/RecordForm"
import { RecordsGrid } from "@/components/RecordsGrid"
import { type PresupuestoValores } from "@/lib/presupuesto"

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

function RecordFormDemo() {
  const [enviado, setEnviado] = useState<PresupuestoValores | null>(null)

  return (
    <div className="max-w-md space-y-4 rounded-xl border bg-card p-5">
      <RecordForm submitLabel="Guardar registro" onSubmit={setEnviado} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {enviado
          ? `Último envío: ${enviado.detalle} · $ ${enviado.monto} · ${enviado.estado}`
          : "Todavía no enviaste nada."}
      </p>
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
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Galería UI</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de componentes y patrones existentes. Ruta disponible solo en desarrollo.
        </p>
      </header>

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
        title="Tabla de presupuestos"
        description="Demo de tabla con filtros, orden y selector de columnas."
      >
        <DataTable />
      </GallerySection>

      <GallerySection
        title="Grilla con alta y edición"
        description="Listado de registros con panel lateral para agregar y editar."
      >
        <RecordsGrid />
      </GallerySection>

      <GallerySection
        title="Formulario"
        description="Formulario con validación para cargar un registro."
      >
        <RecordFormDemo />
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
