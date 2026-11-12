import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/app/PageHeader"
import { StatusBadge, type StatusBadgeTone } from "@/components/app/StatusBadge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMonth } from "@/lib/format/dates"
import { formatARS, formatPercent } from "@/lib/format/money"
import {
  CategoriaForm,
  MonedaForm,
  NombreForm,
  ParametroMensualForm,
  ProyectoForm,
} from "@/features/parametros/components/CatalogForms"
import { CatalogSection } from "@/features/parametros/components/CatalogSection"
import { useCatalogOptions } from "@/features/parametros/queries"
import {
  isCatalogKey,
  type Categoria,
  type Direccion,
  type EstadoProyecto,
  type Financiador,
  type Moneda,
  type ParametroMensual,
  type Proyecto,
} from "@/features/parametros/types"

const estadoTone: Record<EstadoProyecto, StatusBadgeTone> = {
  "En ejecución": "info",
  Finalizado: "neutral",
  "En preparación": "warning",
  Aprobado: "success",
}

const tipoCategoriaLabel = {
  estructura_fija: "Estructura fija",
  proyecto: "Proyecto",
} as const

const direccionColumns: ColumnDef<Direccion, unknown>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    meta: { label: "Nombre" },
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
]

const financiadorColumns: ColumnDef<Financiador, unknown>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    meta: { label: "Nombre" },
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
]

const categoriaColumns: ColumnDef<Categoria, unknown>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    meta: { label: "Nombre" },
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    meta: { label: "Tipo" },
    cell: ({ getValue }) => {
      const tipo = getValue<Categoria["tipo"]>()
      return <StatusBadge tone="neutral">{tipoCategoriaLabel[tipo]}</StatusBadge>
    },
  },
]

const monedaColumns: ColumnDef<Moneda, unknown>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    meta: { label: "Código" },
    cell: ({ getValue }) => <StatusBadge tone="info">{getValue<string>()}</StatusBadge>,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    meta: { label: "Descripción" },
  },
]

function formatRate(value: number | null) {
  return value === null ? "—" : formatARS(value)
}

const parametroColumns: ColumnDef<ParametroMensual, unknown>[] = [
  {
    accessorKey: "mes",
    header: "Mes",
    meta: { label: "Mes" },
    cell: ({ getValue }) => <span className="font-medium">{formatMonth(getValue<string>())}</span>,
  },
  {
    accessorKey: "tipoCambioCcl",
    header: "TC CCL",
    meta: { label: "TC CCL", align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatRate(getValue<number | null>())}</span>
    ),
  },
  {
    accessorKey: "tipoCambioNacion",
    header: "TC Nación",
    meta: { label: "TC Nación", align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatRate(getValue<number | null>())}</span>
    ),
  },
  {
    accessorKey: "inflacionMensual",
    header: "Inflación mensual",
    meta: { label: "Inflación mensual", align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatPercent(getValue<number>())}</span>
    ),
  },
]

function ProyectosCatalog() {
  const direcciones = useCatalogOptions("direcciones")
  const financiadores = useCatalogOptions("financiadores")

  const direccionNames = useMemo(
    () => new Map(direcciones.items.map((direccion) => [direccion.id, direccion.nombre])),
    [direcciones.items],
  )
  const financiadorNames = useMemo(
    () => new Map(financiadores.items.map((financiador) => [financiador.id, financiador.nombre])),
    [financiadores.items],
  )

  const columns = useMemo<ColumnDef<Proyecto, unknown>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        meta: { label: "Nombre" },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        id: "direccion",
        header: "Dirección",
        enableSorting: false,
        meta: { label: "Dirección" },
        cell: ({ row }) => direccionNames.get(row.original.direccionId) ?? "—",
      },
      {
        id: "financiador",
        header: "Financiador",
        enableSorting: false,
        meta: { label: "Financiador" },
        cell: ({ row }) =>
          row.original.financiadorId
            ? (financiadorNames.get(row.original.financiadorId) ?? "—")
            : "Sin financiador",
      },
      {
        accessorKey: "estado",
        header: "Estado",
        meta: { label: "Estado" },
        cell: ({ getValue }) => {
          const estado = getValue<EstadoProyecto>()
          return <StatusBadge tone={estadoTone[estado]}>{estado}</StatusBadge>
        },
      },
      {
        accessorKey: "gradoCerteza",
        header: "Certeza",
        meta: { label: "Certeza" },
        cell: ({ getValue }) => {
          const certeza = getValue<Proyecto["gradoCerteza"]>()
          return certeza ? (
            <StatusBadge tone="neutral">{certeza}</StatusBadge>
          ) : (
            <span className="text-muted-foreground">Sin definir</span>
          )
        },
      },
    ],
    [direccionNames, financiadorNames],
  )

  return (
    <CatalogSection
      catalog="proyectos"
      columns={columns}
      itemLabel={(proyecto) => proyecto.nombre}
      renderForm={(props) => <ProyectoForm {...props} />}
    />
  )
}

function DireccionesCatalog() {
  return (
    <CatalogSection
      catalog="direcciones"
      columns={direccionColumns}
      itemLabel={(direccion) => direccion.nombre}
      renderForm={(props) => <NombreForm {...props} idPrefix="direccion" />}
    />
  )
}

function FinanciadoresCatalog() {
  return (
    <CatalogSection
      catalog="financiadores"
      columns={financiadorColumns}
      itemLabel={(financiador) => financiador.nombre}
      renderForm={(props) => <NombreForm {...props} idPrefix="financiador" />}
    />
  )
}

function CategoriasCatalog() {
  return (
    <CatalogSection
      catalog="categorias"
      columns={categoriaColumns}
      itemLabel={(categoria) => categoria.nombre}
      renderForm={(props) => <CategoriaForm {...props} />}
    />
  )
}

function MonedasCatalog() {
  return (
    <CatalogSection
      catalog="monedas"
      columns={monedaColumns}
      itemLabel={(moneda) => `${moneda.codigo} — ${moneda.descripcion}`}
      renderForm={(props) => <MonedaForm {...props} />}
    />
  )
}

function ParametrosMensualesCatalog() {
  return (
    <CatalogSection
      catalog="parametros-mensuales"
      columns={parametroColumns}
      itemLabel={(parametro) => formatMonth(parametro.mes)}
      renderForm={(props) => <ParametroMensualForm {...props} />}
    />
  )
}

const catalogTabs: Array<{ value: string; label: string }> = [
  { value: "proyectos", label: "Proyectos" },
  { value: "direcciones", label: "Direcciones" },
  { value: "financiadores", label: "Financiadores" },
  { value: "categorias", label: "Categorías" },
  { value: "monedas", label: "Monedas" },
  { value: "parametros-mensuales", label: "Parámetros mensuales" },
]

/**
 * Pantalla de Parámetros: catálogos maestros que alimentan presupuesto,
 * movimientos y proyecciones. Cada pestaña es una sección CRUD independiente.
 */
export function ParametrosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get("catalogo")
  const activeTab = isCatalogKey(requestedTab) ? requestedTab : "proyectos"

  function handleTabChange(value: string) {
    if (!isCatalogKey(value)) {
      return
    }

    const next = new URLSearchParams(searchParams)
    next.set("catalogo", value)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parámetros"
        description="Catálogos y datos maestros que alimentan la operación. Los cambios se guardan en el mock local."
      />

      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(String(value))}>
        <TabsList
          aria-label="Catálogos de parámetros"
          className="w-full justify-start overflow-x-auto"
        >
          {catalogTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-none px-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="proyectos" className="mt-4">
          <ProyectosCatalog />
        </TabsContent>
        <TabsContent value="direcciones" className="mt-4">
          <DireccionesCatalog />
        </TabsContent>
        <TabsContent value="financiadores" className="mt-4">
          <FinanciadoresCatalog />
        </TabsContent>
        <TabsContent value="categorias" className="mt-4">
          <CategoriasCatalog />
        </TabsContent>
        <TabsContent value="monedas" className="mt-4">
          <MonedasCatalog />
        </TabsContent>
        <TabsContent value="parametros-mensuales" className="mt-4">
          <ParametrosMensualesCatalog />
        </TabsContent>
      </Tabs>
    </div>
  )
}
