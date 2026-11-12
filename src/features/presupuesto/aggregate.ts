import Decimal from "decimal.js"
import { monthRange } from "@/lib/format/dates"
import { sumMoney } from "@/lib/money"
import type {
  EjecucionReal,
  LineaVersionRecord,
  Presupuesto,
  ResumenMensual,
  ResumenPresupuesto,
  TipoMovimiento,
  VersionProyeccion,
  VersionProyeccionRecord,
} from "./types"

export { roundMoney, sumMoney } from "@/lib/money"

/** Completa los totales derivados de una versión a partir de sus líneas. */
export function computeVersionTotals(
  version: VersionProyeccionRecord,
  lineas: LineaVersionRecord[],
): VersionProyeccion {
  const versionLines = lineas.filter((linea) => linea.versionId === version.id)
  const ingresos = versionLines
    .filter((linea) => linea.tipo === "ingreso")
    .map((linea) => linea.importePesos)
  const egresos = versionLines
    .filter((linea) => linea.tipo === "egreso")
    .map((linea) => linea.importePesos)
  const dolares = versionLines.flatMap((linea) =>
    linea.importeDolares === null ? [] : [linea.importeDolares],
  )

  return {
    ...version,
    totalLineas: versionLines.length,
    totalIngresos: sumMoney(ingresos),
    totalEgresos: sumMoney(egresos),
    totalDolares: dolares.length > 0 ? sumMoney(dolares) : null,
  }
}

interface MonthlyTotals {
  ingresos: number[]
  egresos: number[]
}

function groupByMonth(lineas: LineaVersionRecord[]) {
  const totals = new Map<string, MonthlyTotals>()

  for (const linea of lineas) {
    const current = totals.get(linea.mesImputacion) ?? { ingresos: [], egresos: [] }
    const bucket = linea.tipo === "ingreso" ? current.ingresos : current.egresos
    bucket.push(linea.importePesos)
    totals.set(linea.mesImputacion, current)
  }

  return totals
}

function monthValues(totals: Map<string, MonthlyTotals>, mes: string) {
  const current = totals.get(mes)

  return {
    ingresos: sumMoney(current?.ingresos ?? []),
    egresos: sumMoney(current?.egresos ?? []),
  }
}

function toPesos(ejecucion: EjecucionReal, tipoCambioPorMes: Record<string, number>) {
  if (ejecucion.moneda === "ARS") {
    return ejecucion.importeReal
  }

  const tipoCambio = tipoCambioPorMes[ejecucion.mes] ?? 1
  return new Decimal(ejecucion.importeReal).mul(tipoCambio).toDecimalPlaces(2).toNumber()
}

export interface BuildResumenInput {
  presupuesto: Presupuesto
  version: VersionProyeccion
  versionBase: VersionProyeccion
  lineasVersion: LineaVersionRecord[]
  lineasBase: LineaVersionRecord[]
  ejecuciones: EjecucionReal[]
  /** Tipo de cambio CCL por mes usado para convertir la ejecución en dólares. */
  tipoCambioPorMes: Record<string, number>
}

/**
 * Construye la comparación mensual entre la versión base (Original), la
 * versión seleccionada y la ejecución real de egresos.
 *
 * `ejecucion_real` no discrimina ingresos de egresos en el DER, por eso el
 * control presupuestario solo compara egresos. El desvío se calcula únicamente
 * sobre los meses con registros para no comparar un año completo contra datos
 * parciales.
 */
export function buildResumen({
  presupuesto,
  version,
  versionBase,
  lineasVersion,
  lineasBase,
  ejecuciones,
  tipoCambioPorMes,
}: BuildResumenInput): ResumenPresupuesto {
  const meses = monthRange(presupuesto.fechaInicio, presupuesto.fechaFin)
  const proyectadoPorMes = groupByMonth(lineasVersion)
  const originalPorMes = groupByMonth(lineasBase)
  const ejecutadoPorMes = new Map<string, number>()

  for (const ejecucion of ejecuciones) {
    const current = ejecutadoPorMes.get(ejecucion.mes) ?? 0
    ejecutadoPorMes.set(ejecucion.mes, sumMoney([current, toPesos(ejecucion, tipoCambioPorMes)]))
  }

  const mensual: ResumenMensual[] = meses.map((mes) => {
    const original = monthValues(originalPorMes, mes)
    const proyectado = monthValues(proyectadoPorMes, mes)
    const tieneEjecucion = ejecutadoPorMes.has(mes)
    const egresosEjecutado = tieneEjecucion ? (ejecutadoPorMes.get(mes) ?? 0) : 0

    return {
      mes,
      tieneEjecucion,
      ingresosOriginal: original.ingresos,
      ingresosProyectado: proyectado.ingresos,
      egresosOriginal: original.egresos,
      egresosProyectado: proyectado.egresos,
      egresosEjecutado,
      resultadoOriginal: sumMoney([original.ingresos, -original.egresos]),
      resultadoProyectado: sumMoney([proyectado.ingresos, -proyectado.egresos]),
    }
  })

  const ingresosOriginal = sumMoney(mensual.map((fila) => fila.ingresosOriginal))
  const ingresosProyectado = sumMoney(mensual.map((fila) => fila.ingresosProyectado))
  const egresosOriginal = sumMoney(mensual.map((fila) => fila.egresosOriginal))
  const egresosProyectado = sumMoney(mensual.map((fila) => fila.egresosProyectado))
  const egresosEjecutado = sumMoney(mensual.map((fila) => fila.egresosEjecutado))
  const originalEjecutado = sumMoney(
    mensual.filter((fila) => fila.tieneEjecucion).map((fila) => fila.egresosOriginal),
  )
  const desvio = sumMoney([originalEjecutado, -egresosEjecutado])
  const desvioPorcentaje =
    originalEjecutado === 0 ? null : new Decimal(desvio).div(originalEjecutado).toNumber()
  const mesesConEjecucion = mensual.filter((fila) => fila.tieneEjecucion).length
  const ultimaEjecucion =
    mesesConEjecucion === 0
      ? null
      : (mensual.filter((fila) => fila.tieneEjecucion).at(-1)?.mes ?? null)

  return {
    presupuesto,
    version,
    versionBase,
    totales: {
      ingresos: {
        original: ingresosOriginal,
        proyectado: ingresosProyectado,
      },
      egresos: {
        original: egresosOriginal,
        proyectado: egresosProyectado,
        ejecutado: egresosEjecutado,
        originalEjecutado,
        desvio,
        desvioPorcentaje,
      },
      resultado: {
        original: sumMoney([ingresosOriginal, -egresosOriginal]),
        proyectado: sumMoney([ingresosProyectado, -egresosProyectado]),
      },
    },
    mensual,
    ultimaEjecucion,
    mesesConEjecucion,
  }
}

/** Variación relativa entre un valor y su base, o `null` si la base es cero. */
export function relativeChange(actual: number, base: number): number | null {
  if (base === 0) {
    return null
  }

  return new Decimal(actual).minus(base).div(Math.abs(base)).toNumber()
}

/** Etiqueta singular/plural para el tipo de movimiento. */
export function tipoLabel(tipo: TipoMovimiento): string {
  return tipo === "ingreso" ? "Ingreso" : "Egreso"
}
