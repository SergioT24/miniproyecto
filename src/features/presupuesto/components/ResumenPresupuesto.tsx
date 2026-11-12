import { useId, useState } from "react"
import { MetricCard, type MetricTrend } from "@/components/app/MetricCard"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatARS, formatDate, formatMonth, formatPercent } from "@/lib/format"
import { relativeChange } from "../aggregate"
import type { ConceptoResumen, ResumenMensual, ResumenPresupuesto as ResumenData } from "../types"
import { PresupuestoChart, type PresupuestoChartPoint } from "./PresupuestoChart"

const conceptoLabels: Record<ConceptoResumen, string> = {
  ingresos: "Ingresos",
  egresos: "Egresos",
  resultado: "Resultado",
}

const conceptOptions = [
  { value: "ingresos", label: "Ingresos" },
  { value: "egresos", label: "Egresos" },
  { value: "resultado", label: "Resultado" },
]

function formatAmount(value: number) {
  return formatARS(value, { maximumFractionDigits: 0 })
}

function formatSignedPercent(value: number | null) {
  if (value === null) {
    return "—"
  }

  return `${value > 0 ? "+" : ""}${formatPercent(value)}`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function monthlyValues(row: ResumenMensual, concepto: ConceptoResumen) {
  if (concepto === "ingresos") {
    return {
      original: row.ingresosOriginal,
      proyectado: row.ingresosProyectado,
      ejecutado: null,
    }
  }

  if (concepto === "egresos") {
    return {
      original: row.egresosOriginal,
      proyectado: row.egresosProyectado,
      ejecutado: row.egresosEjecutado,
    }
  }

  return {
    original: row.resultadoOriginal,
    proyectado: row.resultadoProyectado,
    ejecutado: null,
  }
}

interface Variation {
  text: string
  trend: MetricTrend
}

function variation(actual: number, base: number): Variation {
  const change = relativeChange(actual, base)

  if (change === null) {
    return { text: "Sin base de comparación", trend: "neutral" }
  }

  return {
    text: `${change > 0 ? "+" : ""}${formatPercent(change)} vs. original`,
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  }
}

function buildChartData(
  rows: ResumenMensual[],
  concepto: ConceptoResumen,
): PresupuestoChartPoint[] {
  return rows.map((row) => {
    const values = monthlyValues(row, concepto)

    return {
      mes: row.mes,
      label: capitalize(formatDate(row.mes, "MMM")),
      original: values.original,
      proyectado: values.proyectado,
      ...(concepto === "egresos"
        ? { ejecutado: row.tieneEjecucion ? row.egresosEjecutado : null }
        : {}),
    }
  })
}

export interface ResumenPresupuestoProps {
  resumen: ResumenData
}

/**
 * Comparación entre la versión original, la versión seleccionada y la
 * ejecución real de egresos. El gráfico y la tabla comparten el concepto
 * elegido para que la lectura sea consistente.
 */
export function ResumenPresupuesto({ resumen }: ResumenPresupuestoProps) {
  const [concepto, setConcepto] = useState<ConceptoResumen>("egresos")
  const conceptoId = useId()
  const { version, totales } = resumen
  const ingresosVariation = variation(totales.ingresos.proyectado, totales.ingresos.original)
  const egresosVariation = variation(totales.egresos.proyectado, totales.egresos.original)
  const resultadoVariation = variation(totales.resultado.proyectado, totales.resultado.original)
  const hayEjecucion = resumen.mesesConEjecucion > 0
  const desvioTrend: MetricTrend =
    totales.egresos.desvio > 0 ? "up" : totales.egresos.desvio < 0 ? "down" : "neutral"
  const chartData = buildChartData(resumen.mensual, concepto)
  const showEjecutado = concepto === "egresos"
  const totalOriginal = totales[concepto].original
  const totalProyectado = totales[concepto].proyectado
  const totalEjecutado = concepto === "egresos" ? totales.egresos.ejecutado : null
  const totalVariacion = relativeChange(totalProyectado, totalOriginal)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          value={formatAmount(totales.ingresos.proyectado)}
          label={`Ingresos · ${version.nombre}`}
          change={ingresosVariation.text}
          trend={ingresosVariation.trend}
          description={`Original: ${formatAmount(totales.ingresos.original)}`}
        />
        <MetricCard
          value={formatAmount(totales.egresos.proyectado)}
          label={`Egresos · ${version.nombre}`}
          change={egresosVariation.text}
          trend="neutral"
          description={`Original: ${formatAmount(totales.egresos.original)}`}
        />
        <MetricCard
          value={formatAmount(totales.resultado.proyectado)}
          label={`Resultado · ${version.nombre}`}
          change={resultadoVariation.text}
          trend={resultadoVariation.trend}
          description="Ingresos menos egresos de la versión."
        />
        <MetricCard
          value={hayEjecucion ? formatAmount(totales.egresos.desvio) : "Sin ejecución"}
          label="Desvío de egresos"
          change={hayEjecucion ? formatSignedPercent(totales.egresos.desvioPorcentaje) : undefined}
          trend={hayEjecucion ? desvioTrend : "neutral"}
          description={
            hayEjecucion
              ? `Ejecutado: ${formatAmount(totales.egresos.ejecutado)} · ${resumen.mesesConEjecucion} ${
                  resumen.mesesConEjecucion === 1 ? "mes" : "meses"
                } con registros`
              : "Todavía no hay ejecución real registrada."
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución mensual</CardTitle>
          <CardDescription>
            {conceptoLabels[concepto]} presupuestados y proyectados
            {showEjecutado ? " frente a la ejecución real." : "."}
          </CardDescription>
          <CardAction>
            <Label htmlFor={conceptoId} className="sr-only">
              Concepto del resumen
            </Label>
            <Select
              value={concepto}
              onValueChange={(value) => {
                if (value === "ingresos" || value === "egresos" || value === "resultado") {
                  setConcepto(value)
                }
              }}
              items={conceptOptions}
            >
              <SelectTrigger id={conceptoId} size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conceptOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <PresupuestoChart data={chartData} concepto={concepto} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle mensual</CardTitle>
          <CardDescription>
            {conceptoLabels[concepto]} de la versión {version.nombre} comparados con la versión{" "}
            {resumen.versionBase.nombre}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="sr-only">
              Resumen mensual de {conceptoLabels[concepto].toLowerCase()}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Mes</TableHead>
                <TableHead scope="col" className="text-right">
                  Original
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Proyectado
                </TableHead>
                {showEjecutado ? (
                  <>
                    <TableHead scope="col" className="text-right">
                      Ejecutado
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Desvío
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Desvío %
                    </TableHead>
                  </>
                ) : (
                  <>
                    <TableHead scope="col" className="text-right">
                      Variación
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Variación %
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumen.mensual.map((row) => {
                const values = monthlyValues(row, concepto)
                const desvio = values.original - (values.ejecutado ?? 0)
                const desvioRelativo =
                  values.original === 0 ? null : desvio / Math.abs(values.original)
                const variacion = relativeChange(values.proyectado, values.original)

                return (
                  <TableRow key={row.mes}>
                    <TableCell className="font-medium">{formatMonth(row.mes)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(values.original)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(values.proyectado)}
                    </TableCell>
                    {showEjecutado ? (
                      <>
                        <TableCell className="text-right tabular-nums">
                          {row.tieneEjecucion ? formatAmount(values.ejecutado ?? 0) : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.tieneEjecucion ? formatAmount(desvio) : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.tieneEjecucion ? formatSignedPercent(desvioRelativo) : "—"}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-right tabular-nums">
                          {formatAmount(values.proyectado - values.original)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatSignedPercent(variacion)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatAmount(totalOriginal)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatAmount(totalProyectado)}
                </TableCell>
                {showEjecutado ? (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(totalEjecutado ?? 0)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {hayEjecucion ? formatAmount(totales.egresos.desvio) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {hayEjecucion ? formatSignedPercent(totales.egresos.desvioPorcentaje) : "—"}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(totalProyectado - totalOriginal)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatSignedPercent(totalVariacion)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableFooter>
          </Table>

          <p className="mt-3 text-xs text-muted-foreground">
            {showEjecutado
              ? "El desvío compara los egresos presupuestados y ejecutados en los meses con registros. Los meses sin ejecución se muestran con —."
              : "La variación compara la versión seleccionada con la versión original del presupuesto."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
