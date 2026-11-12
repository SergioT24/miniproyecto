import { format, getISOWeek, getISOWeekYear, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { FilaDiaria, FilaMensual, FilaSemanal } from "./types"

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Clave semana ISO para agrupar (ej: "2026-W01"). */
function claveSemanaPorFecha(isoDate: string): string {
  const date = parseISO(isoDate)
  const year = getISOWeekYear(date)
  const week = String(getISOWeek(date)).padStart(2, "0")
  return `${year}-W${week}`
}

/** Clave mes para agrupar (ej: "2026-01"). */
function claveMesPorFecha(isoDate: string): string {
  return isoDate.slice(0, 7)
}

interface AgrupadoKey {
  clave: string
  proyecto: string
  cuenta: string
  moneda: string
}

function keyString(k: AgrupadoKey): string {
  return `${k.clave}|${k.proyecto}|${k.cuenta}|${k.moneda}`
}

/** Agrupa filas diarias por semana ISO (por proyecto/cuenta/moneda). */
export function agruparSemanal(filas: FilaDiaria[]): FilaSemanal[] {
  const map = new Map<
    string,
    {
      key: AgrupadoKey
      rows: FilaDiaria[]
    }
  >()

  for (const fila of filas) {
    const clave = claveSemanaPorFecha(fila.fecha)
    const k: AgrupadoKey = {
      clave,
      proyecto: fila.proyecto,
      cuenta: fila.cuenta,
      moneda: fila.moneda,
    }
    const ks = keyString(k)
    const existing = map.get(ks)
    if (existing) {
      existing.rows.push(fila)
    } else {
      map.set(ks, { key: k, rows: [fila] })
    }
  }

  const result: FilaSemanal[] = []

  for (const { key, rows } of map.values()) {
    rows.sort((a, b) => a.fecha.localeCompare(b.fecha))
    const first = rows[0]
    const last = rows[rows.length - 1]
    const totalIngresos = rows.reduce((acc, r) => acc + r.ingresos, 0)
    const totalEgresos = rows.reduce((acc, r) => acc + r.egresos, 0)

    const startDate = parseISO(first.fecha)
    const endDate = parseISO(last.fecha)
    const periodo = `Semana ${getISOWeek(startDate)} — ${format(startDate, "d MMM", { locale: es })} al ${format(endDate, "d MMM yyyy", { locale: es })}`

    result.push({
      periodo: capitalize(periodo),
      fechaInicio: first.fecha,
      fechaFin: last.fecha,
      saldoInicial: first.saldoInicial,
      ingresos: Math.round(totalIngresos * 100) / 100,
      egresos: Math.round(totalEgresos * 100) / 100,
      saldoCierre: last.saldoCierre,
      proyecto: key.proyecto,
      cuenta: key.cuenta,
      moneda: key.moneda,
    })
  }

  result.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  return result
}

/** Agrupa filas diarias por mes (por proyecto/cuenta/moneda). */
export function agruparMensual(filas: FilaDiaria[]): FilaMensual[] {
  const map = new Map<
    string,
    {
      key: AgrupadoKey
      rows: FilaDiaria[]
    }
  >()

  for (const fila of filas) {
    const clave = claveMesPorFecha(fila.fecha)
    const k: AgrupadoKey = {
      clave,
      proyecto: fila.proyecto,
      cuenta: fila.cuenta,
      moneda: fila.moneda,
    }
    const ks = keyString(k)
    const existing = map.get(ks)
    if (existing) {
      existing.rows.push(fila)
    } else {
      map.set(ks, { key: k, rows: [fila] })
    }
  }

  const result: FilaMensual[] = []

  for (const { key, rows } of map.values()) {
    rows.sort((a, b) => a.fecha.localeCompare(b.fecha))
    const first = rows[0]
    const last = rows[rows.length - 1]
    const totalIngresos = rows.reduce((acc, r) => acc + r.ingresos, 0)
    const totalEgresos = rows.reduce((acc, r) => acc + r.egresos, 0)

    const startDate = parseISO(first.fecha)
    const periodo = capitalize(format(startDate, "MMMM 'de' yyyy", { locale: es }))

    result.push({
      periodo,
      fechaInicio: first.fecha,
      fechaFin: last.fecha,
      saldoInicial: first.saldoInicial,
      ingresos: Math.round(totalIngresos * 100) / 100,
      egresos: Math.round(totalEgresos * 100) / 100,
      saldoCierre: last.saldoCierre,
      proyecto: key.proyecto,
      cuenta: key.cuenta,
      moneda: key.moneda,
    })
  }

  result.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  return result
}
