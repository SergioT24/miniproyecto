import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatARS } from "@/lib/format"
import type { ConceptoResumen } from "../types"

export interface PresupuestoChartPoint {
  mes: string
  label: string
  original: number
  proyectado: number
  ejecutado?: number | null
}

export interface PresupuestoChartProps {
  data: PresupuestoChartPoint[]
  concepto: ConceptoResumen
}

const serieLabels: Record<string, string> = {
  original: "Original",
  proyectado: "Proyectado",
  ejecutado: "Ejecutado",
}

const conceptoLabels: Record<ConceptoResumen, string> = {
  ingresos: "Ingresos",
  egresos: "Egresos",
  resultado: "Resultado",
}

function formatAxisValue(value: number) {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Gráfico de barras del resumen mensual. Es una representación complementaria:
 * la tabla de detalle contiene los mismos datos y es la alternativa accesible.
 * Las animaciones están desactivadas para respetar `prefers-reduced-motion`.
 */
export function PresupuestoChart({ data, concepto }: PresupuestoChartProps) {
  const showEjecutado = concepto === "egresos"
  const label = conceptoLabels[concepto]

  return (
    <div
      role="img"
      aria-label={`Gráfico de ${label.toLowerCase()} mensuales. Series: original${
        showEjecutado ? ", proyectado y ejecutado" : " y proyectado"
      }. Los mismos datos están en la tabla de detalle mensual.`}
      className="h-72 w-full"
    >
      <div aria-hidden="true" className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            accessibilityLayer={false}
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={72}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => formatAxisValue(Number(value))}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(value) => formatARS(Number(value), { maximumFractionDigits: 0 })}
            />
            <Legend
              wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
              formatter={(value) => serieLabels[String(value)] ?? String(value)}
            />
            <Bar
              dataKey="original"
              name="original"
              fill="var(--color-chart-5)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="proyectado"
              name="proyectado"
              fill="var(--color-chart-1)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
            {showEjecutado && (
              <Bar
                dataKey="ejecutado"
                name="ejecutado"
                fill="var(--color-chart-3)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
