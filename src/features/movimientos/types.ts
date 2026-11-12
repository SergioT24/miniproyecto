import type { CodigoMoneda, GradoCerteza } from "@/features/parametros/types"

export const tiposMovimiento = ["ingreso", "egreso"] as const

export type TipoMovimiento = (typeof tiposMovimiento)[number]

export const estadosCobroPago = ["previsto", "cobrado", "pagado", "vencido"] as const

export type EstadoCobroPago = (typeof estadosCobroPago)[number]

export const estadosIngreso = [
  "previsto",
  "cobrado",
  "vencido",
] as const satisfies readonly EstadoCobroPago[]

export const estadosEgreso = [
  "previsto",
  "pagado",
  "vencido",
] as const satisfies readonly EstadoCobroPago[]

/** Estados válidos según el tipo de movimiento. */
export function estadosPorTipo(tipo: TipoMovimiento): readonly EstadoCobroPago[] {
  return tipo === "ingreso" ? estadosIngreso : estadosEgreso
}

export interface IngresoDetalle {
  cuentaDestino: string | null
  condicionCobro: string | null
}

export interface EgresoDetalle {
  proveedorDestinatario: string | null
  cuentaOrigen: string | null
  tipoGasto: string | null
}

/**
 * Movimiento previsto, con la especialización de ingreso o egreso en un solo
 * registro. `categoriaId` se incluye para evitar joins en la UI.
 * TODO(api): confirmar si la categoría pertenece al movimiento o solo a la línea.
 */
export interface MovimientoRecord {
  id: string
  tipo: TipoMovimiento
  concepto: string
  proyectoId: string
  categoriaId: string
  moneda: CodigoMoneda
  importeOriginal: number
  /** Fecha planificada original en formato ISO (`YYYY-MM-DD`). */
  fechaPrevistaOriginal: string | null
  /** Fecha probable en formato ISO (`YYYY-MM-DD`). Motor del cash flow. */
  fechaProbable: string
  gradoCerteza: GradoCerteza | null
  estadoCobroPago: EstadoCobroPago
  ingresoDetalle: IngresoDetalle | null
  egresoDetalle: EgresoDetalle | null
}

/** Movimiento con los nombres de proyecto y categoría resueltos por la API. */
export interface Movimiento extends MovimientoRecord {
  proyectoNombre: string
  categoriaNombre: string
}

export type MovimientoInput = Omit<MovimientoRecord, "id">

export interface PendientesMovimientos {
  cantidad: number
  ingresos: number
  egresos: number
  vencidos: number
}

/** Totales en pesos; los movimientos en dólares se convierten con el CCL del mes. */
export interface ResumenMovimientos {
  ingresos: number
  egresos: number
  resultado: number
  pendientes: PendientesMovimientos
}
