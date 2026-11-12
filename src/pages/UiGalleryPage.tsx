import { useState, type ReactNode } from "react"
import { CreditCard, PiggyBank, Receipt, SearchX, Wallet } from "lucide-react"
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
        description="Tarjetas que resumen un indicador con su variación respecto del período anterior."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Ingresos del mes"
            value={formatoPesos.format(1250000)}
            icon={Wallet}
            change="+12,5%"
            trend="up"
            description="vs. mes anterior"
          />
          <MetricCard
            label="Egresos del mes"
            value={formatoPesos.format(890000)}
            icon={Receipt}
            change="-4,2%"
            trend="down"
            description="vs. mes anterior"
          />
          <MetricCard
            label="Saldo disponible"
            value={formatoPesos.format(360000)}
            icon={PiggyBank}
            change="Sin cambios"
            trend="neutral"
            description="cuentas en pesos"
          />
          <MetricCard
            label="Fondos restringidos"
            value={formatoPesos.format(150000)}
            icon={CreditCard}
            change="+2,1%"
            trend="up"
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
        description="Mensajes para secciones sin datos o búsquedas sin resultados."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            title="Todavía no hay movimientos"
            description="Cuando cargues el primero, lo vas a ver acá."
            action={<Button>Agregar movimiento</Button>}
          />
          <EmptyState
            icon={SearchX}
            title="Sin resultados"
            description="Probá con otros filtros o revisá la búsqueda."
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
