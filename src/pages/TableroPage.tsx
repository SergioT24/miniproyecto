import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartCard } from "@/components/app/ChartCard"
import { EmptyState } from "@/components/app/EmptyState"
import { MetricCard } from "@/components/app/MetricCard"
import { PageHeader } from "@/components/app/PageHeader"
import { QueryState } from "@/components/app/QueryState"
import { formatARS, formatPercent } from "@/lib/format"
import { useResumenTableroQuery } from "@/features/tablero/queries"
import type { KpiTablero } from "@/features/tablero/types"

function tendenciaToTrend(tendencia: KpiTablero["tendencia"]): "up" | "down" | "neutral" {
  if (tendencia === "sube") return "up"
  if (tendencia === "baja") return "down"
  return "neutral"
}

function formatVariacion(variacion: number | undefined): string | undefined {
  if (variacion === undefined) return undefined
  const sign = variacion >= 0 ? "+" : ""
  return `${sign}${formatPercent(variacion / 100)}`
}

function formatAxisARS(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

/** Página de Tablero: KPIs y gráficos de evolución mensual. */
export function TableroPage() {
  const query = useResumenTableroQuery()
  const data = query.data

  const isEmpty = !query.isLoading && !query.isError && (!data || data.kpis.length === 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tablero"
        description="Resumen de ingresos, egresos y saldos del período."
      />

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        loadingLabel="Cargando tablero…"
        errorTitle="No pudimos cargar el tablero"
        emptyState={
          <EmptyState
            title="Sin datos disponibles"
            description="No hay información de ingresos o egresos para mostrar."
          />
        }
      >
        {data && (
          <div className="space-y-6">
            {/* KPIs */}
            <section aria-label="Indicadores clave">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {data.kpis.map((kpi) => (
                  <MetricCard
                    key={kpi.id}
                    value={formatARS(kpi.valor, { maximumFractionDigits: 0 })}
                    label={kpi.label}
                    change={formatVariacion(kpi.variacion)}
                    trend={tendenciaToTrend(kpi.tendencia)}
                  />
                ))}
              </div>
            </section>

            {/* Gráficos */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Evolución de ingresos y egresos"
                description="Comparativa mensual de los últimos 12 meses."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.evolucionMensual}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={formatAxisARS}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [
                        formatARS(Number(value) || 0, { maximumFractionDigits: 0 }),
                      ]}
                    />
                    <Bar dataKey="ingresos" name="Ingresos" fill="var(--color-chart-1, #4ade80)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="egresos" name="Egresos" fill="var(--color-chart-2, #f87171)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Resultado mensual"
                description="Diferencia entre ingresos y egresos por mes."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.evolucionMensual}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={formatAxisARS}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [
                        formatARS(Number(value) || 0, { maximumFractionDigits: 0 }),
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="resultado"
                      name="Resultado"
                      stroke="var(--color-chart-3, #60a5fa)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  )
}
