export const vistasCashFlow = ["7d", "15d", "30d", "mes", "meses"] as const

export type VistaCashFlow = (typeof vistasCashFlow)[number]

export const proyectosCashFlow = [
  "FONDO_GENERAL",
  "PROYECTO_SALUD",
  "PROYECTO_EDUCACION",
] as const

export type ProyectoCashFlow = (typeof proyectosCashFlow)[number]

export const cuentasCashFlow = ["banco-nacion", "caja"] as const

export type CuentaCashFlow = (typeof cuentasCashFlow)[number]

export const monedasCashFlow = ["ARS", "USD"] as const

export type MonedaCashFlow = (typeof monedasCashFlow)[number]

/**
 * Fila diaria del cash flow. Los saldos están encadenados:
 * `saldoInicial[d+1] === saldoCierre[d]`.
 */
export interface FilaDiaria {
  fecha: string
  saldoInicial: number
  ingresos: number
  egresos: number
  saldoCierre: number
  proyecto: string
  cuenta: string
  moneda: string
}

/** Fila semanal agregada del cash flow. */
export interface FilaSemanal {
  periodo: string
  fechaInicio: string
  fechaFin: string
  saldoInicial: number
  ingresos: number
  egresos: number
  saldoCierre: number
  proyecto: string
  cuenta: string
  moneda: string
}

/** Fila mensual agregada del cash flow. */
export interface FilaMensual {
  periodo: string
  fechaInicio: string
  fechaFin: string
  saldoInicial: number
  ingresos: number
  egresos: number
  saldoCierre: number
  proyecto: string
  cuenta: string
  moneda: string
}

/** Resumen global del cash flow en el período seleccionado. */
export interface ResumenCashFlow {
  saldoInicial: number
  totalIngresos: number
  totalEgresos: number
  saldoCierre: number
  moneda: string
}
