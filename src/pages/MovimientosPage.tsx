import { useMemo, useState } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { z } from "zod"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { DataTable } from "@/components/app/DataTable"
import { FilterBar } from "@/components/app/FilterBar"
import { FilterSelect } from "@/components/app/FilterSelect"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { StatusBadge, type StatusBadgeTone } from "@/components/app/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useFilters } from "@/hooks/use-filters"
import { getErrorMessage } from "@/lib/api"
import { formatDate, formatMonth, monthRange } from "@/lib/format"
import { useCatalogOptions } from "@/features/parametros/queries"
import {
  estadoCobroPagoLabel,
  tipoMovimientoLabel,
} from "@/features/movimientos/aggregate"
import type {
  MovimientoFilterParams,
  MovimientoListParams,
} from "@/features/movimientos/api"
import { MovimientoForm } from "@/features/movimientos/components/MovimientoForm"
import { ResumenMovimientos } from "@/features/movimientos/components/ResumenMovimientos"
import { periodoMovimientos } from "@/features/movimientos/fixtures"
import {
  useCreateMovimientoMutation,
  useDeleteMovimientoMutation,
  useMovimientosQuery,
  useResumenMovimientosQuery,
  useUpdateMovimientoMutation,
} from "@/features/movimientos/queries"
import type {
  EstadoCobroPago,
  Movimiento,
  MovimientoInput,
  TipoMovimiento,
} from "@/features/movimientos/types"

const filtrosSchema = z.object({
  tipo: z.enum(["todos", "ingreso", "egreso"]).optional().default("todos"),
  proyecto: z.string().optional().default("todos"),
  categoria: z.string().optional().default("todos"),
  moneda: z.enum(["todas", "ARS", "USD"]).optional().default("todas"),
  estado: z
    .enum(["todos", "previsto", "cobrado", "pagado", "vencido"])
    .optional()
    .default("todos"),
  mes: z.string().optional().default("todos"),
})

type FiltrosMovimientos = z.infer<typeof filtrosSchema>

const filtrosDefaults: FiltrosMovimientos = {
  tipo: "todos",
  proyecto: "todos",
  categoria: "todos",
  moneda: "todas",
  estado: "todos",
  mes: "todos",
}

const tipoOptions = [
  { value: "todos", label: "Todos los tipos" },
  { value: "ingreso", label: "Ingresos" },
  { value: "egreso", label: "Egresos" },
]

const monedaOptions = [
  { value: "todas", label: "Todas las monedas" },
  { value: "ARS", label: "Pesos (ARS)" },
  { value: "USD", label: "Dólares (USD)" },
]

const estadoTone: Record<EstadoCobroPago, StatusBadgeTone> = {
  previsto: "info",
  cobrado: "success",
  pagado: "success",
  vencido: "danger",
}

/**
 * Pantalla de Movimientos previstos. El resumen y la tabla comparten los
 * filtros de la URL; la búsqueda, el orden y la paginación se resuelven en la
 * API mock. El alta y la edición se hacen en un panel lateral.
 */
export function MovimientosPage() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(
    filtrosSchema,
    filtrosDefaults,
  )
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "fechaProbable", desc: false }])
  const [search, setSearch] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Movimiento | null>(null)
  const [deleting, setDeleting] = useState<Movimiento | null>(null)

  const proyectosOptions = useCatalogOptions("proyectos")
  const categoriasOptions = useCatalogOptions("categorias")
  const meses = monthRange(periodoMovimientos.fechaInicio, periodoMovimientos.fechaFin)

  const filterParams = useMemo<MovimientoFilterParams>(
    () => ({
      search: search.trim() || undefined,
      tipo: filters.tipo === "todos" ? undefined : (filters.tipo as TipoMovimiento),
      proyectoId: filters.proyecto === "todos" ? undefined : filters.proyecto,
      categoriaId: filters.categoria === "todos" ? undefined : filters.categoria,
      moneda: filters.moneda === "todas" ? undefined : filters.moneda,
      estado: filters.estado === "todos" ? undefined : (filters.estado as EstadoCobroPago),
      mes: filters.mes === "todos" ? undefined : filters.mes,
    }),
    [filters, search],
  )

  const listParams = useMemo<MovimientoListParams>(
    () => ({
      ...filterParams,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sort: sorting[0]?.id ?? "fechaProbable",
      order: sorting[0]?.desc ? "desc" : "asc",
    }),
    [filterParams, pagination, sorting],
  )

  const resumenQuery = useResumenMovimientosQuery(filterParams)
  const movimientosQuery = useMovimientosQuery(listParams)
  const createMutation = useCreateMovimientoMutation()
  const updateMutation = useUpdateMovimientoMutation()
  const deleteMutation = useDeleteMovimientoMutation()

  const movimientos = movimientosQuery.data?.data ?? []
  const proyectoItems = [
    { value: "todos", label: "Todos los proyectos" },
    ...proyectosOptions.items.map((proyecto) => ({
      value: proyecto.id,
      label: proyecto.nombre,
    })),
  ]
  const categoriaItems = [
    { value: "todos", label: "Todas las categorías" },
    ...categoriasOptions.items.map((categoria) => ({
      value: categoria.id,
      label: categoria.nombre,
    })),
  ]
  const mesItems = [
    { value: "todos", label: "Todos los meses" },
    ...meses.map((mes) => ({ value: mes, label: formatMonth(mes) })),
  ]
  const estadoItems = [
    { value: "todos", label: "Todos los estados" },
    { value: "previsto", label: estadoCobroPagoLabel("previsto") },
    { value: "cobrado", label: estadoCobroPagoLabel("cobrado") },
    { value: "pagado", label: estadoCobroPagoLabel("pagado") },
    { value: "vencido", label: estadoCobroPagoLabel("vencido") },
  ]

  const hasFilters = hasActiveFilters || search.trim().length > 0

  function resetPage() {
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  function handleFilterChange<K extends keyof FiltrosMovimientos>(
    key: K,
    value: FiltrosMovimientos[K],
  ) {
    setFilter(key, value)
    resetPage()
  }

  function clearFilters() {
    resetFilters()
    setSearch("")
    resetPage()
  }

  function openCreate() {
    setEditing(null)
    setEditorOpen(true)
  }

  function openEdit(movimiento: Movimiento) {
    setEditing(movimiento)
    setEditorOpen(true)
  }

  function handleEditorOpenChange(open: boolean) {
    setEditorOpen(open)

    if (!open) {
      setEditing(null)
    }
  }

  async function handleSubmit(input: MovimientoInput) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input })
    } else {
      await createMutation.mutateAsync(input)
    }

    setEditorOpen(false)
    setEditing(null)
  }

  function handleConfirmDelete() {
    if (!deleting) {
      return
    }

    deleteMutation.mutate(deleting.id)
    setDeleting(null)
  }

  const columns: ColumnDef<Movimiento, unknown>[] = [
    {
      accessorKey: "fechaProbable",
      header: "Fecha probable",
      meta: { label: "Fecha probable" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-medium">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: "concepto",
      header: "Concepto",
      meta: { label: "Concepto" },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: "proyectoNombre",
      header: "Proyecto",
      meta: { label: "Proyecto" },
    },
    {
      accessorKey: "categoriaNombre",
      header: "Categoría",
      meta: { label: "Categoría" },
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      meta: { label: "Tipo" },
      cell: ({ getValue }) => {
        const tipo = getValue<TipoMovimiento>()
        return (
          <StatusBadge tone={tipo === "ingreso" ? "success" : "warning"}>
            {tipoMovimientoLabel(tipo)}
          </StatusBadge>
        )
      },
    },
    {
      accessorKey: "moneda",
      header: "Moneda",
      meta: { label: "Moneda" },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: "importeOriginal",
      header: "Importe",
      meta: { label: "Importe", align: "right" },
      cell: ({ row }) => (
        <CurrencyDisplay
          value={row.original.importeOriginal}
          currency={row.original.moneda}
          maximumFractionDigits={2}
        />
      ),
    },
    {
      accessorKey: "estadoCobroPago",
      header: "Estado",
      meta: { label: "Estado" },
      cell: ({ getValue }) => {
        const estado = getValue<EstadoCobroPago>()
        return <StatusBadge tone={estadoTone[estado]}>{estadoCobroPagoLabel(estado)}</StatusBadge>
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      meta: { label: "Acciones", align: "right" },
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${row.original.concepto} del ${formatDate(row.original.fechaProbable)}`}
            onClick={() => openEdit(row.original)}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Eliminar ${row.original.concepto} del ${formatDate(row.original.fechaProbable)}`}
            onClick={() => setDeleting(row.original)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        description="Ingresos y egresos previstos, con su estado de cobro o pago y el detalle de cada operación."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            Nuevo movimiento
          </Button>
        }
      />

      <QueryState
        isLoading={resumenQuery.isLoading}
        isError={resumenQuery.isError}
        onRetry={() => void resumenQuery.refetch()}
        loadingLabel="Cargando resumen de movimientos…"
        errorTitle="No pudimos cargar el resumen"
        errorDescription={resumenQuery.error ? getErrorMessage(resumenQuery.error) : undefined}
      >
        {resumenQuery.data && <ResumenMovimientos resumen={resumenQuery.data} />}
      </QueryState>

      <div className="space-y-4">
        <FilterBar
          label="Filtros de movimientos"
          actions={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw aria-hidden="true" />
                Limpiar filtros
              </Button>
            ) : undefined
          }
        >
          <FilterSelect
            label="Tipo"
            value={filters.tipo}
            onValueChange={(value) =>
              handleFilterChange("tipo", value as FiltrosMovimientos["tipo"])
            }
            items={tipoOptions}
            className="w-full sm:w-40"
          />
          <FilterSelect
            label="Proyecto"
            value={filters.proyecto}
            onValueChange={(value) => handleFilterChange("proyecto", value)}
            items={proyectoItems}
            className="w-full sm:w-56"
          />
          <FilterSelect
            label="Categoría"
            value={filters.categoria}
            onValueChange={(value) => handleFilterChange("categoria", value)}
            items={categoriaItems}
            className="w-full sm:w-56"
          />
          <FilterSelect
            label="Moneda"
            value={filters.moneda}
            onValueChange={(value) =>
              handleFilterChange("moneda", value as FiltrosMovimientos["moneda"])
            }
            items={monedaOptions}
            className="w-full sm:w-44"
          />
          <FilterSelect
            label="Estado"
            value={filters.estado}
            onValueChange={(value) =>
              handleFilterChange("estado", value as FiltrosMovimientos["estado"])
            }
            items={estadoItems}
            className="w-full sm:w-40"
          />
          <FilterSelect
            label="Mes"
            value={filters.mes}
            onValueChange={(value) => handleFilterChange("mes", value)}
            items={mesItems}
            className="w-full sm:w-48"
          />
        </FilterBar>

        <DataTable
          data={movimientos}
          columns={columns}
          label="Movimientos previstos"
          state={{ pagination, sorting, globalFilter: search }}
          onPaginationChange={setPagination}
          onSortingChange={(nextSorting) => {
            setSorting(nextSorting)
            resetPage()
          }}
          onGlobalFilterChange={(value) => {
            setSearch(value)
            resetPage()
          }}
          manualPagination
          manualSorting
          manualFiltering
          rowCount={movimientosQuery.data?.meta.total ?? 0}
          getRowId={(movimiento) => movimiento.id}
          isLoading={movimientosQuery.isLoading}
          loadingLabel="Cargando movimientos…"
          isError={movimientosQuery.isError}
          errorMessage={
            movimientosQuery.error ? getErrorMessage(movimientosQuery.error) : undefined
          }
          onRetry={() => void movimientosQuery.refetch()}
          searchLabel="Buscar movimientos"
          searchPlaceholder="Concepto, proyecto o categoría…"
          emptyTitle={
            hasFilters
              ? "No hay movimientos para los filtros seleccionados"
              : "No hay movimientos cargados"
          }
          emptyDescription={
            hasFilters
              ? "Probá con otro tipo, proyecto, categoría, moneda, estado o mes."
              : "Creá el primer movimiento para empezar a proyectar el cash flow."
          }
          emptyAction={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" />
                Nuevo movimiento
              </Button>
            )
          }
        />
      </div>

      <Sheet open={editorOpen} onOpenChange={handleEditorOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar movimiento" : "Nuevo movimiento"}</SheetTitle>
            <SheetDescription>
              {editing
                ? "Actualizá los datos del movimiento previsto. Los cambios no modifican las versiones cerradas del presupuesto."
                : "Registrá un ingreso o egreso previsto para el período del presupuesto."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <MovimientoForm
              key={editing?.id ?? "nuevo"}
              movimiento={editing}
              proyectos={proyectosOptions.items}
              categorias={categoriasOptions.items}
              periodo={periodoMovimientos}
              onSubmit={handleSubmit}
              onCancel={() => handleEditorOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
          }
        }}
        title={`¿Eliminar el movimiento "${deleting?.concepto ?? ""}"?`}
        description="El movimiento se quita del listado y deja de proyectarse. Las versiones del presupuesto ya cerradas conservan sus líneas."
        confirmLabel="Eliminar movimiento"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
