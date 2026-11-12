import { useMemo, useState } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { Download, RotateCcw, TrendingDown, TrendingUp } from "lucide-react"
import { CurrencyDisplay } from "@/components/app/CurrencyDisplay"
import { DataTable } from "@/components/app/DataTable"
import { FilterBar } from "@/components/app/FilterBar"
import { FilterSelect } from "@/components/app/FilterSelect"
import { MetricCard } from "@/components/app/MetricCard"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFilters } from "@/hooks/use-filters"
import { formatCurrency, formatDate } from "@/lib/format"
import { agruparMensual, agruparSemanal } from "@/features/cashflow/aggregate"
import {
  cashFlowFiltrosDefaults,
  cashFlowFiltrosSchema,
} from "@/features/cashflow/schemas"
import {
  useCashFlowQuery,
  useResumenCashFlowQuery,
} from "@/features/cashflow/queries"
import type {
  FilaDiaria,
  FilaMensual,
  FilaSemanal,
  VistaCashFlow,
} from "@/features/cashflow/types"

type ModoAgrupacion = "diario" | "semanal" | "mensual"

interface FilaTabla {
  id: string
  displayPeriodo: string
  proyecto: string
  cuenta: string
  moneda: string
  saldoInicial: number
  ingresos: number
  egresos: number
  saldoCierre: number
}

const proyectoItems = [
  { value: "todos", label: "Todos los proyectos" },
  { value: "FONDO_GENERAL", label: "Fondo General" },
  { value: "PROYECTO_SALUD", label: "Proyecto Salud" },
  { value: "PROYECTO_EDUCACION", label: "Proyecto Educación" },
]

const cuentaItems = [
  { value: "todas", label: "Todas las cuentas" },
  { value: "banco-nacion", label: "Banco Nación" },
  { value: "caja", label: "Caja chica" },
]

const monedaItems = [
  { value: "todas", label: "Todas las monedas" },
  { value: "ARS", label: "Pesos (ARS)" },
  { value: "USD", label: "Dólares (USD)" },
]

const vistaItems = [
  { value: "7d", label: "7 días" },
  { value: "15d", label: "15 días" },
  { value: "30d", label: "30 días" },
  { value: "mes", label: "Mes completo" },
  { value: "meses", label: "Varios meses" },
]

export function CashFlowPage() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(
    cashFlowFiltrosSchema,
    cashFlowFiltrosDefaults,
  )

  const [modo, setModo] = useState<ModoAgrupacion>("diario")
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "displayPeriodo", desc: false }])
  const [search, setSearch] = useState("")

  const queryParams = useMemo(
    () => ({
      proyecto: filters.proyecto === "todos" ? undefined : filters.proyecto,
      cuenta: filters.cuenta === "todas" ? undefined : filters.cuenta,
      moneda: filters.moneda === "todas" ? undefined : filters.moneda,
      vista: filters.vista,
      fechaDesde: filters.fechaDesde || undefined,
      fechaHasta: filters.fechaHasta || undefined,
    }),
    [filters],
  )

  const cashFlowQuery = useCashFlowQuery(queryParams)
  const resumenQuery = useResumenCashFlowQuery(queryParams)

  const filasTabla: FilaTabla[] = useMemo(() => {
    const rawFilas = cashFlowQuery.data ?? []
    if (modo === "semanal") {
      return agruparSemanal(rawFilas).map((f: FilaSemanal, idx) => ({
        id: `sem-${idx}-${f.fechaInicio}`,
        displayPeriodo: f.periodo,
        proyecto: f.proyecto,
        cuenta: f.cuenta,
        moneda: f.moneda,
        saldoInicial: f.saldoInicial,
        ingresos: f.ingresos,
        egresos: f.egresos,
        saldoCierre: f.saldoCierre,
      }))
    }
    if (modo === "mensual") {
      return agruparMensual(rawFilas).map((f: FilaMensual, idx) => ({
        id: `mes-${idx}-${f.fechaInicio}`,
        displayPeriodo: f.periodo,
        proyecto: f.proyecto,
        cuenta: f.cuenta,
        moneda: f.moneda,
        saldoInicial: f.saldoInicial,
        ingresos: f.ingresos,
        egresos: f.egresos,
        saldoCierre: f.saldoCierre,
      }))
    }
    return rawFilas.map((f: FilaDiaria) => ({
      id: `${f.fecha}-${f.proyecto}-${f.cuenta}-${f.moneda}`,
      displayPeriodo: formatDate(f.fecha),
      proyecto: f.proyecto,
      cuenta: f.cuenta,
      moneda: f.moneda,
      saldoInicial: f.saldoInicial,
      ingresos: f.ingresos,
      egresos: f.egresos,
      saldoCierre: f.saldoCierre,
    }))
  }, [cashFlowQuery.data, modo])

  // Filtro de búsqueda local
  const filasFiltradas = useMemo(() => {
    if (!search.trim()) return filasTabla
    const term = search.toLowerCase()
    return filasTabla.filter(
      (f) =>
        f.displayPeriodo.toLowerCase().includes(term) ||
        f.proyecto.toLowerCase().includes(term) ||
        f.cuenta.toLowerCase().includes(term) ||
        f.moneda.toLowerCase().includes(term),
    )
  }, [filasTabla, search])

  const columns: ColumnDef<FilaTabla, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "displayPeriodo",
        header: modo === "diario" ? "Fecha" : "Período",
        meta: { label: modo === "diario" ? "Fecha" : "Período" },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: "proyecto",
        header: "Proyecto",
        meta: { label: "Proyecto" },
        cell: ({ getValue }) => {
          const val = getValue<string>()
          const match = proyectoItems.find((p) => p.value === val)
          return match?.label ?? val
        },
      },
      {
        accessorKey: "cuenta",
        header: "Cuenta",
        meta: { label: "Cuenta" },
        cell: ({ getValue }) => {
          const val = getValue<string>()
          const match = cuentaItems.find((c) => c.value === val)
          return match?.label ?? val
        },
      },
      {
        accessorKey: "saldoInicial",
        header: "Saldo inicial",
        meta: { label: "Saldo inicial" },
        cell: ({ row }) => (
          <div className="text-right font-mono">
            <CurrencyDisplay value={row.original.saldoInicial} currency={row.original.moneda} />
          </div>
        ),
      },
      {
        accessorKey: "ingresos",
        header: "Ingresos",
        meta: { label: "Ingresos" },
        cell: ({ row }) => (
          <div className="text-right font-mono text-emerald-600 dark:text-emerald-400">
            {row.original.ingresos > 0 ? (
              <CurrencyDisplay value={row.original.ingresos} currency={row.original.moneda} />
            ) : (
              "—"
            )}
          </div>
        ),
      },
      {
        accessorKey: "egresos",
        header: "Egresos",
        meta: { label: "Egresos" },
        cell: ({ row }) => (
          <div className="text-right font-mono text-rose-600 dark:text-rose-400">
            {row.original.egresos > 0 ? (
              <CurrencyDisplay value={row.original.egresos} currency={row.original.moneda} />
            ) : (
              "—"
            )}
          </div>
        ),
      },
      {
        accessorKey: "saldoCierre",
        header: "Saldo de cierre",
        meta: { label: "Saldo de cierre" },
        cell: ({ row }) => {
          const delta = row.original.saldoCierre - row.original.saldoInicial
          return (
            <div className="flex items-center justify-end gap-1 font-mono font-medium">
              <CurrencyDisplay value={row.original.saldoCierre} currency={row.original.moneda} />
              {delta > 0 && <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-label="Aumento" />}
              {delta < 0 && <TrendingDown className="size-3.5 text-rose-600 dark:text-rose-400" aria-label="Disminución" />}
            </div>
          )
        },
      },
    ],
    [modo],
  )

  const handleExportCSV = () => {
    if (filasFiltradas.length === 0) return
    const headers = ["Período", "Proyecto", "Cuenta", "Moneda", "Saldo Inicial", "Ingresos", "Egresos", "Saldo Cierre"]
    const rows = filasFiltradas.map((f) => [
      `"${f.displayPeriodo}"`,
      `"${f.proyecto}"`,
      `"${f.cuenta}"`,
      f.moneda,
      f.saldoInicial,
      f.ingresos,
      f.egresos,
      f.saldoCierre,
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `cashflow_${filters.vista}_${modo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const resumen = resumenQuery.data
  const deltaTotal = resumen ? resumen.saldoCierre - resumen.saldoInicial : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash flow"
        description="Saldo diario, semanal y mensual por proyecto, cuenta y moneda."
        actions={
          <Button variant="outline" onClick={handleExportCSV} disabled={filasFiltradas.length === 0}>
            <Download className="mr-2 size-4" />
            Exportar CSV
          </Button>
        }
      />

      {/* Tarjetas de resumen */}
      <QueryState
        isLoading={resumenQuery.isLoading}
        isError={resumenQuery.isError}
        loadingLabel="Cargando resumen de saldos…"
        errorTitle="No se pudo cargar el resumen"
        onRetry={() => void resumenQuery.refetch()}
      >
        {resumen && (
          <section aria-label="Resumen de flujo de fondos" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Saldo inicial período"
              value={formatCurrency(resumen.saldoInicial, { currency: resumen.moneda })}
            />
            <MetricCard
              label="Ingresos totales"
              value={formatCurrency(resumen.totalIngresos, { currency: resumen.moneda })}
              trend="up"
            />
            <MetricCard
              label="Egresos totales"
              value={formatCurrency(resumen.totalEgresos, { currency: resumen.moneda })}
              trend="down"
            />
            <MetricCard
              label="Saldo de cierre"
              value={formatCurrency(resumen.saldoCierre, { currency: resumen.moneda })}
              trend={deltaTotal >= 0 ? "up" : "down"}
              change={deltaTotal >= 0 ? `+${resumen.moneda}` : `-${resumen.moneda}`}
            />
          </section>
        )}
      </QueryState>

      {/* Selector de modo y filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={modo}
          onValueChange={(val) => setModo(val as ModoAgrupacion)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="diario">Diario</TabsTrigger>
            <TabsTrigger value="semanal">Semanal</TabsTrigger>
            <TabsTrigger value="mensual">Mensual</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Botones de período vista */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Horizonte:</span>
          {vistaItems.map((item) => (
            <Button
              key={item.value}
              size="sm"
              data-variant={filters.vista === item.value ? "default" : "outline"}
              variant={filters.vista === item.value ? "default" : "outline"}
              onClick={() => setFilter("vista", item.value as VistaCashFlow)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Barra de filtros */}
      <FilterBar
        label="Filtros de flujo de fondos"
        actions={
          hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-2 size-4" />
              Limpiar filtros
            </Button>
          ) : null
        }
      >
        <FilterSelect
          label="Proyecto"
          value={filters.proyecto}
          onValueChange={(val) => setFilter("proyecto", val)}
          items={proyectoItems}
        />
        <FilterSelect
          label="Cuenta"
          value={filters.cuenta}
          onValueChange={(val) => setFilter("cuenta", val)}
          items={cuentaItems}
        />
        <FilterSelect
          label="Moneda"
          value={filters.moneda}
          onValueChange={(val) => setFilter("moneda", val)}
          items={monedaItems}
        />
      </FilterBar>

      {/* Tabla con DataTable */}
      <DataTable
        data={filasFiltradas}
        columns={columns}
        label="Flujo de fondos"
        getRowId={(row) => row.id}
        state={{ pagination, sorting, globalFilter: search }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setSearch}
        isLoading={cashFlowQuery.isLoading}
        loadingLabel="Calculando saldos de cash flow…"
        isError={cashFlowQuery.isError}
        errorMessage="No se pudo cargar el cash flow"
        onRetry={() => void cashFlowQuery.refetch()}
        emptyTitle="No hay movimientos en este rango"
        emptyDescription="Probá ajustando el horizonte o los filtros de cuenta y proyecto."
        searchLabel="Buscar en cash flow"
        searchPlaceholder="Buscar por fecha, cuenta o proyecto…"
      />
    </div>
  )
}
