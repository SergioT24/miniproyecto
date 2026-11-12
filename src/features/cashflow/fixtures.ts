import type { FilaDiaria } from "./types"

/** Parámetros de la función generadora de fixtures. */
interface GeneratorParams {
  proyecto: string
  cuenta: string
  moneda: string
  saldoInicial: number
  fechaInicio: string
  dias: number
  seed: number
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Generador pseudo-aleatorio determinista (LCG simple). */
function lcg(seed: number) {
  let state = seed

  return function next(min: number, max: number): number {
    state = (state * 1664525 + 1013904223) & 0xffff_ffff
    const normalized = (state >>> 0) / 0xffff_ffff
    return min + normalized * (max - min)
  }
}

/** Genera `dias` filas diarias encadenadas para una combinación proyecto/cuenta/moneda. */
function generarFilasDiarias(params: GeneratorParams): FilaDiaria[] {
  const { proyecto, cuenta, moneda, saldoInicial, fechaInicio, dias, seed } = params
  const rng = lcg(seed)
  const filas: FilaDiaria[] = []
  let saldo = saldoInicial

  for (let i = 0; i < dias; i++) {
    const fecha = addDays(fechaInicio, i)
    // Fin de semana menos movimientos
    const dayOfWeek = new Date(`${fecha}T12:00:00Z`).getUTCDay()
    const esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6

    const maxIngreso = esFinDeSemana ? 20_000 : moneda === "USD" ? 3_000 : 250_000
    const maxEgreso = esFinDeSemana ? 10_000 : moneda === "USD" ? 2_500 : 220_000

    const ingresos = Math.round(rng(0, maxIngreso) * 100) / 100
    const egresos = Math.round(rng(0, maxEgreso) * 100) / 100
    const saldoCierre = Math.round((saldo + ingresos - egresos) * 100) / 100

    filas.push({
      fecha,
      saldoInicial: saldo,
      ingresos,
      egresos,
      saldoCierre,
      proyecto,
      cuenta,
      moneda,
    })

    saldo = saldoCierre
  }

  return filas
}

export const FECHA_INICIO_CASHFLOW = "2026-01-01"
export const DIAS_CASHFLOW = 365

/** Fixtures de cash flow: 365 días para 2026, 3 proyectos, 2 cuentas, 2 monedas. */
export const cashFlowFixtures: FilaDiaria[] = [
  ...generarFilasDiarias({
    proyecto: "FONDO_GENERAL",
    cuenta: "banco-nacion",
    moneda: "ARS",
    saldoInicial: 5_000_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 1001,
  }),
  ...generarFilasDiarias({
    proyecto: "FONDO_GENERAL",
    cuenta: "caja",
    moneda: "ARS",
    saldoInicial: 800_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 1002,
  }),
  ...generarFilasDiarias({
    proyecto: "PROYECTO_SALUD",
    cuenta: "banco-nacion",
    moneda: "ARS",
    saldoInicial: 3_200_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 2001,
  }),
  ...generarFilasDiarias({
    proyecto: "PROYECTO_SALUD",
    cuenta: "banco-nacion",
    moneda: "USD",
    saldoInicial: 50_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 2002,
  }),
  ...generarFilasDiarias({
    proyecto: "PROYECTO_EDUCACION",
    cuenta: "banco-nacion",
    moneda: "ARS",
    saldoInicial: 2_100_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 3001,
  }),
  ...generarFilasDiarias({
    proyecto: "PROYECTO_EDUCACION",
    cuenta: "caja",
    moneda: "ARS",
    saldoInicial: 450_000,
    fechaInicio: FECHA_INICIO_CASHFLOW,
    dias: DIAS_CASHFLOW,
    seed: 3002,
  }),
]
