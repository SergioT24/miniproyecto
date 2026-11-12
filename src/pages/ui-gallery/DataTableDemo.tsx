import { useState } from "react"
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table"
import { parseISO } from "date-fns"
import { CheckCircle2, Clock3, PencilLine, type LucideIcon } from "lucide-react"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { DataTable } from "@/components/app/DataTable"
import { StatusBadge, type StatusBadgeTone } from "@/components/app/StatusBadge"
import { Button } from "@/components/ui/button"
import { type EstadoPresupuesto } from "@/lib/presupuesto"

interface GastoDemo {
  id: string
  detalle: string
  proyecto: string
  monto: number
  fecha: string
  estado: EstadoPresupuesto
}

/**
 * Datos ficticios solo para la galería.
 * TODO(api): reemplazar por el endpoint de presupuestos cuando exista.
 */
const gastosDemo: GastoDemo[] = [
  {
    id: "P-001",
    detalle: "Compra de insumos médicos",
    proyecto: "Prevención",
    monto: 850000,
    fecha: "2026-02-12",
    estado: "REALIZADO",
  },
  {
    id: "P-002",
    detalle: "Alquiler de sala de capacitación",
    proyecto: "Educación",
    monto: 420000,
    fecha: "2026-02-20",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "P-003",
    detalle: "Impresión de material de difusión",
    proyecto: "Comunicación",
    monto: 275000,
    fecha: "2026-03-03",
    estado: "AJUSTE",
  },
  {
    id: "P-004",
    detalle: "Testeos rápidos de VIH",
    proyecto: "Prevención",
    monto: 1250000,
    fecha: "2026-03-15",
    estado: "REALIZADO",
  },
  {
    id: "P-005",
    detalle: "Transporte del equipo móvil",
    proyecto: "Operaciones",
    monto: 380000,
    fecha: "2026-03-22",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "P-006",
    detalle: "Viáticos de la jornada de testeos",
    proyecto: "Operaciones",
    monto: 190000,
    fecha: "2026-04-05",
    estado: "REALIZADO",
  },
  {
    id: "P-007",
    detalle: "Material didáctico para talleres",
    proyecto: "Educación",
    monto: 225000,
    fecha: "2026-04-18",
    estado: "AJUSTE",
  },
  {
    id: "P-008",
    detalle: "Producción de piezas audiovisuales",
    proyecto: "Comunicación",
    monto: 760000,
    fecha: "2026-05-02",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "P-009",
    detalle: "Insumos de laboratorio",
    proyecto: "Prevención",
    monto: 1540000,
    fecha: "2026-05-16",
    estado: "REALIZADO",
  },
  {
    id: "P-010",
    detalle: "Servicio de catering para el evento",
    proyecto: "Comunicación",
    monto: 330000,
    fecha: "2026-06-01",
    estado: "AJUSTE",
  },
  {
    id: "P-011",
    detalle: "Mantenimiento de la unidad móvil",
    proyecto: "Operaciones",
    monto: 610000,
    fecha: "2026-06-14",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "P-012",
    detalle: "Becas de formación",
    proyecto: "Educación",
    monto: 980000,
    fecha: "2026-06-28",
    estado: "REALIZADO",
  },
  {
    id: "P-013",
    detalle: "Campaña de concientización",
    proyecto: "Comunicación",
    monto: 1120000,
    fecha: "2026-07-09",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "P-014",
    detalle: "Reposición de preservativos",
    proyecto: "Prevención",
    monto: 540000,
    fecha: "2026-07-21",
    estado: "REALIZADO",
  },
  {
    id: "P-015",
    detalle: "Auditoría contable anual",
    proyecto: "Administración",
    monto: 470000,
    fecha: "2026-08-04",
    estado: "AJUSTE",
  },
]

const configuracionEstado: Record<EstadoPresupuesto, { tone: StatusBadgeTone; icon: LucideIcon }> =
  {
    REALIZADO: { tone: "success", icon: CheckCircle2 },
    "PRE PRESUPUESTO": { tone: "neutral", icon: Clock3 },
    AJUSTE: { tone: "warning", icon: PencilLine },
  }

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const columnas: ColumnDef<GastoDemo, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
    meta: { label: "ID" },
  },
  {
    accessorKey: "detalle",
    header: "Detalle",
    meta: { label: "Detalle" },
  },
  {
    accessorKey: "proyecto",
    header: "Proyecto",
    meta: { label: "Proyecto" },
  },
  {
    accessorKey: "monto",
    header: "Monto",
    meta: { label: "Monto", align: "right" },
    cell: ({ getValue }) => <CurrencyDisplay value={getValue<number>()} />,
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    meta: { label: "Fecha" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatoFecha.format(parseISO(getValue<string>()))}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    meta: { label: "Estado" },
    cell: ({ row }) => {
      const configuracion = configuracionEstado[row.original.estado]

      return (
        <StatusBadge tone={configuracion.tone} icon={configuracion.icon}>
          {row.original.estado}
        </StatusBadge>
      )
    },
  },
]

export function DataTableDemo() {
  const [seleccion, setSeleccion] = useState<RowSelectionState>({})
  const filasSeleccionadas = Object.values(seleccion).filter(Boolean).length

  return (
    <DataTable
      label="Presupuestos de ejemplo"
      data={gastosDemo}
      columns={columnas}
      getRowId={(row) => row.id}
      enableRowSelection
      selectionLabel={(row) => `Seleccionar ${row.detalle}`}
      state={{ rowSelection: seleccion }}
      onRowSelectionChange={setSeleccion}
      initialPageSize={5}
      pageSizeOptions={[5, 10, 20]}
      emptyTitle="No se encontraron presupuestos"
      emptyDescription="Probá con otra búsqueda o cambiá los filtros."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {filasSeleccionadas === 0
              ? "Sin filas seleccionadas"
              : `${filasSeleccionadas} ${
                  filasSeleccionadas === 1 ? "fila seleccionada" : "filas seleccionadas"
                }`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSeleccion({})}
            disabled={filasSeleccionadas === 0}
          >
            Limpiar selección
          </Button>
        </div>
      }
    />
  )
}

const opcionesEstado = [
  { value: "datos", label: "Con datos" },
  { value: "cargando", label: "Cargando" },
  { value: "error", label: "Error" },
  { value: "vacio", label: "Sin resultados" },
] as const

type EstadoDemo = (typeof opcionesEstado)[number]["value"]

export function DataTableEstadosDemo() {
  const [estado, setEstado] = useState<EstadoDemo>("datos")

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Estado de la tabla de ejemplo" className="flex flex-wrap gap-2">
        {opcionesEstado.map((opcion) => (
          <Button
            key={opcion.value}
            variant={estado === opcion.value ? "default" : "outline"}
            size="sm"
            aria-pressed={estado === opcion.value}
            onClick={() => setEstado(opcion.value)}
          >
            {opcion.label}
          </Button>
        ))}
      </div>

      <DataTable
        label="Presupuestos de ejemplo según su estado"
        data={estado === "vacio" ? [] : gastosDemo}
        columns={columnas}
        isLoading={estado === "cargando"}
        isError={estado === "error"}
        onRetry={() => setEstado("datos")}
        initialPageSize={3}
        pageSizeOptions={[3, 5, 10]}
        enableSearch={false}
        enableColumnVisibility={false}
        emptyTitle="No hay presupuestos para este filtro"
        emptyDescription="Cuando agregues uno, lo vas a ver acá."
      />
    </div>
  )
}
