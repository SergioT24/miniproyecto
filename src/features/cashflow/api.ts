import { cashFlowFixtures, FECHA_INICIO_CASHFLOW } from "./fixtures"
import type { FilaDiaria, ResumenCashFlow, VistaCashFlow } from "./types"

export interface CashFlowParams {
  proyecto?: string
  cuenta?: string
  moneda?: string
  vista?: VistaCashFlow | string
  fechaDesde?: string
  fechaHasta?: string
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function resolveRango(params: CashFlowParams): { desde: string; hasta: string } {
  if (params.fechaDesde && params.fechaHasta) {
    return { desde: params.fechaDesde, hasta: params.fechaHasta }
  }

  const base = params.fechaDesde || FECHA_INICIO_CASHFLOW

  switch (params.vista) {
    case "7d":
      return { desde: base, hasta: addDays(base, 6) }
    case "15d":
      return { desde: base, hasta: addDays(base, 14) }
    case "mes":
      return { desde: base, hasta: addDays(base, 30) }
    case "meses":
      return { desde: base, hasta: addDays(base, 180) }
    case "30d":
    default:
      return { desde: base, hasta: addDays(base, 29) }
  }
}

// TODO(api): reemplazar por llamada al backend real.
export function getCashFlow(params: CashFlowParams): FilaDiaria[] {
  const { desde, hasta } = resolveRango(params)

  let filas = cashFlowFixtures.filter((fila) => fila.fecha >= desde && fila.fecha <= hasta)

  if (params.proyecto && params.proyecto !== "todos") {
    filas = filas.filter((fila) => fila.proyecto === params.proyecto)
  }

  if (params.cuenta && params.cuenta !== "todas") {
    filas = filas.filter((fila) => fila.cuenta === params.cuenta)
  }

  if (params.moneda && params.moneda !== "todas") {
    filas = filas.filter((fila) => fila.moneda === params.moneda)
  }

  return filas.sort((a, b) => a.fecha.localeCompare(b.fecha))
}

// TODO(api): reemplazar por llamada al backend real.
export function getResumenCashFlow(params: CashFlowParams): ResumenCashFlow {
  const filas = getCashFlow(params)
  const moneda = params.moneda && params.moneda !== "todas" ? params.moneda : "ARS"

  if (filas.length === 0) {
    return {
      saldoInicial: 0,
      totalIngresos: 0,
      totalEgresos: 0,
      saldoCierre: 0,
      moneda,
    }
  }

  const totalIngresos = filas.reduce((acc, f) => acc + f.ingresos, 0)
  const totalEgresos = filas.reduce((acc, f) => acc + f.egresos, 0)
  const saldoInicial = filas[0].saldoInicial
  const saldoCierre = filas[filas.length - 1].saldoCierre

  return {
    saldoInicial: Math.round(saldoInicial * 100) / 100,
    totalIngresos: Math.round(totalIngresos * 100) / 100,
    totalEgresos: Math.round(totalEgresos * 100) / 100,
    saldoCierre: Math.round(saldoCierre * 100) / 100,
    moneda,
  }
}
