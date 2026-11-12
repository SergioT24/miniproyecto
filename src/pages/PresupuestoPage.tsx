import { useMemo, useState, type ReactNode } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { Plus, RotateCcw } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { DataTable } from "@/components/app/DataTable"
import { EmptyState } from "@/components/app/EmptyState"
import { FilterBar } from "@/components/app/FilterBar"
import { FilterSelect } from "@/components/app/FilterSelect"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { StatusBadge } from "@/components/app/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage } from "@/lib/api"
import { formatDate, formatMonth } from "@/lib/format"
import { useCatalogOptions } from "@/features/parametros/queries"
import { NuevaVersionForm } from "@/features/presupuesto/components/NuevaVersionForm"
import { ResumenPresupuesto } from "@/features/presupuesto/components/ResumenPresupuesto"
import { VersionesPresupuesto } from "@/features/presupuesto/components/VersionesPresupuesto"
import { monthRange } from "@/lib/format"
import type { LineaListParams } from "@/features/presupuesto/api"
import {
  useCerrarVersionMutation,
  useCreateVersionMutation,
  useLineasQuery,
  usePresupuestosQuery,
  useResumenQuery,
  useVersionesQuery,
} from "@/features/presupuesto/queries"
import {
  isVistaPresupuesto,
  type LineaPresupuesto,
  type NuevaVersionInput,
  type TipoMovimiento,
  type VersionProyeccion,
  type VistaPresupuesto,
} from "@/features/presupuesto/types"

const tipoItems = [
  { value: "todos", label: "Todos los tipos" },
  { value: "ingreso", label: "Ingresos" },
  { value: "egreso", label: "Egresos" },
]

const lineaColumns: ColumnDef<LineaPresupuesto, unknown>[] = [
  {
    accessorKey: "mesImputacion",
    header: "Mes",
    meta: { label: "Mes" },
    cell: ({ getValue }) => <span className="font-medium">{formatMonth(getValue<string>())}</span>,
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
          {tipo === "ingreso" ? "Ingreso" : "Egreso"}
        </StatusBadge>
      )
    },
  },
  {
    accessorKey: "importePesos",
    header: "Importe ARS",
    meta: { label: "Importe ARS", align: "right" },
    cell: ({ getValue }) => (
      <CurrencyDisplay value={getValue<number>()} maximumFractionDigits={0} />
    ),
  },
  {
    accessorKey: "importeDolares",
    header: "Importe USD",
    meta: { label: "Importe USD", align: "right" },
    cell: ({ getValue }) => (
      <CurrencyDisplay
        value={getValue<number | null>()}
        currency="USD"
        maximumFractionDigits={0}
        emptyLabel="—"
      />
    ),
  },
]

function PageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

/**
 * Pantalla de Presupuesto: selecciona una versión y compara lo presupuestado,
 * lo proyectado y la ejecución real. Las líneas se consultan con paginación,
 * búsqueda y filtros resueltos por la API mock.
 */
export function PresupuestoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const presupuestosQuery = usePresupuestosQuery()
  const presupuestos = presupuestosQuery.data ?? []
  const requestedPresupuestoId = searchParams.get("presupuesto")
  const presupuesto =
    presupuestos.find((item) => item.id === requestedPresupuestoId) ?? presupuestos.at(0)
  const presupuestoId = presupuesto?.id

  const versionesQuery = useVersionesQuery(presupuestoId)
  const versiones = versionesQuery.data ?? []
  const requestedVersionId = searchParams.get("version")
  const activeVersionId = versiones.some((version) => version.id === requestedVersionId)
    ? (requestedVersionId ?? undefined)
    : versiones.at(-1)?.id
  const activeVersion = versiones.find((version) => version.id === activeVersionId)

  const requestedVista = searchParams.get("vista")
  const activeTab: VistaPresupuesto = isVistaPresupuesto(requestedVista)
    ? requestedVista
    : "resumen"

  const resumenQuery = useResumenQuery(presupuestoId, activeVersionId)
  const createVersionMutation = useCreateVersionMutation(presupuestoId)
  const closeVersionMutation = useCerrarVersionMutation(presupuestoId)

  const [versionEditorOpen, setVersionEditorOpen] = useState(false)
  const [closingVersion, setClosingVersion] = useState<VersionProyeccion | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "mesImputacion", desc: false }])
  const [search, setSearch] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [proyectoFilter, setProyectoFilter] = useState("todos")
  const [categoriaFilter, setCategoriaFilter] = useState("todos")
  const [mesFilter, setMesFilter] = useState("todos")

  const proyectosOptions = useCatalogOptions("proyectos")
  const categoriasOptions = useCatalogOptions("categorias")

  const lineParams = useMemo<LineaListParams | null>(() => {
    if (!activeVersionId) {
      return null
    }

    const tipo: TipoMovimiento | undefined =
      tipoFilter === "ingreso" || tipoFilter === "egreso" ? tipoFilter : undefined

    return {
      versionId: activeVersionId,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: search.trim() || undefined,
      sort: sorting[0]?.id ?? "mesImputacion",
      order: sorting[0]?.desc ? "desc" : "asc",
      proyectoId: proyectoFilter === "todos" ? undefined : proyectoFilter,
      categoriaId: categoriaFilter === "todos" ? undefined : categoriaFilter,
      tipo,
      mes: mesFilter === "todos" ? undefined : mesFilter,
    }
  }, [
    activeVersionId,
    categoriaFilter,
    mesFilter,
    pagination,
    proyectoFilter,
    search,
    sorting,
    tipoFilter,
  ])

  const lineasQuery = useLineasQuery(presupuestoId, lineParams, activeTab === "lineas")
  const lineas = lineasQuery.data?.data ?? []

  const hasLineFilters =
    search.trim().length > 0 ||
    tipoFilter !== "todos" ||
    proyectoFilter !== "todos" ||
    categoriaFilter !== "todos" ||
    mesFilter !== "todos"

  const meses = presupuesto ? monthRange(presupuesto.fechaInicio, presupuesto.fechaFin) : []
  const mesItems = [
    { value: "todos", label: "Todos los meses" },
    ...meses.map((mes) => ({ value: mes, label: formatMonth(mes) })),
  ]
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
  const presupuestoItems = presupuestos.map((item) => ({
    value: item.id,
    label: item.descripcion,
  }))
  const versionItems = versiones.map((version) => ({
    value: version.id,
    label: version.nombre,
  }))

  function updateParam(key: "presupuesto" | "version" | "vista", value: string | null) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }

        return next
      },
      { replace: true },
    )
  }

  function handlePresupuestoChange(value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set("presupuesto", value)
        next.delete("version")
        return next
      },
      { replace: true },
    )
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  function handleVersionChange(value: string) {
    updateParam("version", value)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  function handleSelectVersion(versionId: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set("version", versionId)
        next.delete("vista")
        return next
      },
      { replace: true },
    )
  }

  function handleTabChange(value: string) {
    if (!isVistaPresupuesto(value)) {
      return
    }

    updateParam("vista", value === "resumen" ? null : value)
  }

  function clearLineFilters() {
    setSearch("")
    setTipoFilter("todos")
    setProyectoFilter("todos")
    setCategoriaFilter("todos")
    setMesFilter("todos")
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  async function handleCreateVersion(input: NuevaVersionInput) {
    const created = await createVersionMutation.mutateAsync(input)
    setVersionEditorOpen(false)
    updateParam("version", created.id)
  }

  function handleConfirmClose() {
    if (!closingVersion) {
      return
    }

    closeVersionMutation.mutate(closingVersion.id)
    setClosingVersion(null)
  }

  return (
    <PageShell>
      <PageHeader
        title="Presupuesto"
        description="Versiones, líneas y comparación entre presupuesto, proyección y ejecución."
        actions={
          <Button onClick={() => setVersionEditorOpen(true)} disabled={!activeVersion}>
            <Plus aria-hidden="true" />
            Nueva versión
          </Button>
        }
      />

      <QueryState
        isLoading={presupuestosQuery.isLoading}
        isError={presupuestosQuery.isError}
        isEmpty={!presupuesto}
        onRetry={() => void presupuestosQuery.refetch()}
        loadingLabel="Cargando presupuestos…"
        errorTitle="No pudimos cargar los presupuestos"
        errorDescription={
          presupuestosQuery.error ? getErrorMessage(presupuestosQuery.error) : undefined
        }
        emptyState={
          <EmptyState
            illustration="charts"
            title="No hay presupuestos cargados"
            description="Cuando exista un presupuesto vas a poder consultar sus versiones y líneas."
          />
        }
      >
        {presupuesto && (
          <div className="space-y-4">
            <FilterBar label="Selección de presupuesto">
              <FilterSelect
                label="Presupuesto"
                value={presupuesto.id}
                onValueChange={handlePresupuestoChange}
                items={presupuestoItems}
                className="w-full sm:w-72"
              />
              <FilterSelect
                label="Versión"
                value={activeVersionId ?? ""}
                onValueChange={handleVersionChange}
                items={versionItems}
                disabled={versionesQuery.isLoading || versiones.length === 0}
                className="w-full sm:w-44"
              />
              <div className="flex flex-wrap items-center gap-2 pb-1.5">
                {activeVersion && (
                  <StatusBadge tone={activeVersion.esInmutable ? "neutral" : "success"}>
                    {activeVersion.esInmutable ? "Cerrada" : "Abierta"}
                  </StatusBadge>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDate(presupuesto.fechaInicio)} – {formatDate(presupuesto.fechaFin)}
                </span>
              </div>
            </FilterBar>

            <QueryState
              isLoading={versionesQuery.isLoading}
              isError={versionesQuery.isError}
              isEmpty={versiones.length === 0}
              onRetry={() => void versionesQuery.refetch()}
              loadingLabel="Cargando versiones…"
              errorTitle="No pudimos cargar las versiones"
              errorDescription={
                versionesQuery.error ? getErrorMessage(versionesQuery.error) : undefined
              }
              emptyState={
                <EmptyState
                  illustration="charts"
                  title="No hay versiones cargadas"
                  description="Creá la primera versión para empezar a presupuestar."
                />
              }
            >
              {versiones.length > 0 && (
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList
                    aria-label="Secciones del presupuesto"
                    className="w-full justify-start overflow-x-auto"
                  >
                    <TabsTrigger value="resumen" className="flex-none px-3">
                      Resumen
                    </TabsTrigger>
                    <TabsTrigger value="lineas" className="flex-none px-3">
                      Líneas
                    </TabsTrigger>
                    <TabsTrigger value="versiones" className="flex-none px-3">
                      Versiones
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="resumen" className="mt-4">
                    <QueryState
                      isLoading={resumenQuery.isLoading}
                      isError={resumenQuery.isError}
                      onRetry={() => void resumenQuery.refetch()}
                      loadingLabel="Cargando resumen del presupuesto…"
                      errorTitle="No pudimos cargar el resumen"
                      errorDescription={
                        resumenQuery.error ? getErrorMessage(resumenQuery.error) : undefined
                      }
                    >
                      {resumenQuery.data && <ResumenPresupuesto resumen={resumenQuery.data} />}
                    </QueryState>
                  </TabsContent>

                  <TabsContent value="lineas" className="mt-4">
                    <div className="space-y-4">
                      <FilterBar
                        label="Filtros de líneas"
                        actions={
                          hasLineFilters ? (
                            <Button variant="outline" size="sm" onClick={clearLineFilters}>
                              <RotateCcw aria-hidden="true" />
                              Limpiar filtros
                            </Button>
                          ) : undefined
                        }
                      >
                        <FilterSelect
                          label="Tipo"
                          value={tipoFilter}
                          onValueChange={(value) => {
                            setTipoFilter(value)
                            setPagination((current) => ({ ...current, pageIndex: 0 }))
                          }}
                          items={tipoItems}
                          className="w-full sm:w-40"
                        />
                        <FilterSelect
                          label="Proyecto"
                          value={proyectoFilter}
                          onValueChange={(value) => {
                            setProyectoFilter(value)
                            setPagination((current) => ({ ...current, pageIndex: 0 }))
                          }}
                          items={proyectoItems}
                          className="w-full sm:w-56"
                        />
                        <FilterSelect
                          label="Categoría"
                          value={categoriaFilter}
                          onValueChange={(value) => {
                            setCategoriaFilter(value)
                            setPagination((current) => ({ ...current, pageIndex: 0 }))
                          }}
                          items={categoriaItems}
                          className="w-full sm:w-56"
                        />
                        <FilterSelect
                          label="Mes"
                          value={mesFilter}
                          onValueChange={(value) => {
                            setMesFilter(value)
                            setPagination((current) => ({ ...current, pageIndex: 0 }))
                          }}
                          items={mesItems}
                          className="w-full sm:w-48"
                        />
                      </FilterBar>

                      <DataTable
                        data={lineas}
                        columns={lineaColumns}
                        label="Líneas del presupuesto"
                        state={{ pagination, sorting, globalFilter: search }}
                        onPaginationChange={setPagination}
                        onSortingChange={(nextSorting) => {
                          setSorting(nextSorting)
                          setPagination((current) => ({ ...current, pageIndex: 0 }))
                        }}
                        onGlobalFilterChange={(value) => {
                          setSearch(value)
                          setPagination((current) => ({ ...current, pageIndex: 0 }))
                        }}
                        manualPagination
                        manualSorting
                        manualFiltering
                        rowCount={lineasQuery.data?.meta.total ?? 0}
                        getRowId={(linea) => linea.id}
                        isLoading={lineasQuery.isLoading}
                        loadingLabel="Cargando líneas…"
                        isError={lineasQuery.isError}
                        errorMessage={
                          lineasQuery.error ? getErrorMessage(lineasQuery.error) : undefined
                        }
                        onRetry={() => void lineasQuery.refetch()}
                        searchLabel="Buscar en las líneas"
                        searchPlaceholder="Concepto, proyecto o categoría…"
                        emptyTitle="No hay líneas para los filtros seleccionados"
                        emptyDescription="Probá con otro proyecto, categoría, mes o término de búsqueda."
                        emptyAction={
                          hasLineFilters ? (
                            <Button variant="outline" onClick={clearLineFilters}>
                              Limpiar filtros
                            </Button>
                          ) : undefined
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="versiones" className="mt-4">
                    <VersionesPresupuesto
                      versiones={versiones}
                      activeVersionId={activeVersionId ?? ""}
                      onSelect={handleSelectVersion}
                      onCloseRequest={setClosingVersion}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </QueryState>
          </div>
        )}
      </QueryState>

      <Sheet open={versionEditorOpen} onOpenChange={setVersionEditorOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Nueva versión</SheetTitle>
            <SheetDescription>
              Creá un corte temporal a partir de una versión existente. La versión queda abierta
              para futuras actualizaciones.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {activeVersionId && versiones.length > 0 && (
              <NuevaVersionForm
                versiones={versiones}
                defaultVersionId={activeVersionId}
                onSubmit={handleCreateVersion}
                onCancel={() => setVersionEditorOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(closingVersion)}
        onOpenChange={(open) => {
          if (!open) {
            setClosingVersion(null)
          }
        }}
        title={`¿Cerrar la versión ${closingVersion?.nombre ?? ""}?`}
        description="Una vez cerrada, la versión no admitirá cambios en sus líneas ni parámetros. La acción no se puede deshacer."
        confirmLabel="Cerrar versión"
        onConfirm={handleConfirmClose}
      />
    </PageShell>
  )
}
