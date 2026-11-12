import { MetricCard, type MetricTrend } from "@/components/app/MetricCard"
import { formatARS } from "@/lib/format"
import type { ResumenMovimientos as ResumenMovimientosData } from "../types"

function formatAmount(value: number) {
  return formatARS(value, { maximumFractionDigits: 0 })
}

export interface ResumenMovimientosProps {
  resumen: ResumenMovimientosData
}

/**
 * Totales del conjunto filtrado. Los importes se muestran en pesos y los
 * movimientos en dólares se convierten con el CCL del mes de la fecha probable.
 */
export function ResumenMovimientos({ resumen }: ResumenMovimientosProps) {
  const { pendientes } = resumen
  const totalPendiente = pendientes.ingresos + pendientes.egresos
  const resultadoTrend: MetricTrend =
    resumen.resultado > 0 ? "up" : resumen.resultado < 0 ? "down" : "neutral"

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        value={formatAmount(resumen.ingresos)}
        label="Ingresos previstos"
        description="Total en pesos; los importes en USD se convierten al CCL del mes."
      />
      <MetricCard
        value={formatAmount(resumen.egresos)}
        label="Egresos previstos"
        description="Total en pesos; los importes en USD se convierten al CCL del mes."
      />
      <MetricCard
        value={formatAmount(resumen.resultado)}
        label="Resultado previsto"
        trend={resultadoTrend}
        description="Ingresos menos egresos del conjunto filtrado."
      />
      <MetricCard
        value={formatAmount(totalPendiente)}
        label="Pendientes de cobro y pago"
        change={`${pendientes.cantidad} ${pendientes.cantidad === 1 ? "movimiento" : "movimientos"}`}
        trend="neutral"
        description={`${formatAmount(pendientes.ingresos)} por cobrar · ${formatAmount(
          pendientes.egresos,
        )} por pagar${pendientes.vencidos > 0 ? ` · ${pendientes.vencidos} vencidos` : ""}`}
      />
    </div>
  )
}
