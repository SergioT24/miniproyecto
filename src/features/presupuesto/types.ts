import type { CodigoMoneda } from "@/features/parametros/types"

export const tiposMovimiento = ["ingreso", "egreso"] as const

export type TipoMovimiento = (typeof tiposMovimiento)[number]

export const conceptosResumen = ["ingresos", "egresos", "resultado"] as const

export type ConceptoResumen = (typeof conceptosResumen)[number]

export const vistasPresupuesto = ["resumen", "lineas", "versiones"] as const

export type VistaPresupuesto = (typeof vistasPresupuesto)[number]

export function isVistaPresupuesto(value: string | null | undefined): value is VistaPresupuesto {
  return vistasPresupuesto.includes(value as VistaPresupuesto)
}

/** Cabecera del presupuesto anual o plurianual. */
export interface Presupuesto {
  id: string
  anio: number
  /** Primer día del período en formato ISO (`YYYY-MM-DD`). */
  fechaInicio: string
  /** Último día del período en formato ISO (`YYYY-MM-DD`). */
  fechaFin: string
  descripcion: string
  fechaAprobacion: string | null
}

/**
 * Versión congelada de la proyección. El nombre identifica el corte temporal
 * (`Original`, `Enero`, `Marzo`) dentro de un mismo presupuesto.
 */
export interface VersionProyeccionRecord {
  id: string
  presupuestoId: string
  nombre: string
  fechaCreacion: string
  usuarioCreador: string
  esInmutable: boolean
  observaciones: string | null
}

/** Versión con los totales derivados que expone la API. */
export interface VersionProyeccion extends VersionProyeccionRecord {
  totalLineas: number
  totalIngresos: number
  totalEgresos: number
  /** Suma de los importes congelados en dólares; `null` si no hay líneas USD. */
  totalDolares: number | null
}

/**
 * Línea congelada de una versión. Los campos de proyecto, concepto y tipo
 * provienen del movimiento de origen y se incluyen para evitar joins en la UI.
 * TODO(api): confirmar que el backend devuelva estos campos denormalizados.
 */
export interface LineaVersionRecord {
  id: string
  versionId: string
  movimientoId: string
  /** Primer día del mes en formato ISO (`YYYY-MM-01`). */
  mesImputacion: string
  importePesos: number
  importeDolares: number | null
  categoriaId: string
  proyectoId: string
  concepto: string
  tipo: TipoMovimiento
  moneda: CodigoMoneda
}

export interface LineaPresupuesto extends LineaVersionRecord {
  proyectoNombre: string
  categoriaNombre: string
}

/** Ejecución real de egresos, proveniente de Finnegans o de carga manual. */
export interface EjecucionReal {
  id: string
  proyectoId: string
  categoriaId: string
  moneda: CodigoMoneda
  /** Primer día del mes en formato ISO (`YYYY-MM-01`). */
  mes: string
  importeReal: number
  fuente: "finnegans" | "manual"
}

export interface TotalesProyectados {
  original: number
  proyectado: number
}

export interface TotalesEgresos extends TotalesProyectados {
  /** Egresos registrados en los meses con ejecución. */
  ejecutado: number
  /** Presupuesto original de los meses que tienen ejecución registrada. */
  originalEjecutado: number
  /** `originalEjecutado - ejecutado`: positivo significa ahorro. */
  desvio: number
  desvioPorcentaje: number | null
}

export interface ResumenMensual {
  mes: string
  /** Indica si el mes tiene al menos una ejecución real registrada. */
  tieneEjecucion: boolean
  ingresosOriginal: number
  ingresosProyectado: number
  egresosOriginal: number
  egresosProyectado: number
  egresosEjecutado: number
  resultadoOriginal: number
  resultadoProyectado: number
}

export interface ResumenPresupuesto {
  presupuesto: Presupuesto
  version: VersionProyeccion
  versionBase: VersionProyeccion
  totales: {
    ingresos: TotalesProyectados
    egresos: TotalesEgresos
    resultado: TotalesProyectados
  }
  mensual: ResumenMensual[]
  ultimaEjecucion: string | null
  mesesConEjecucion: number
}

export interface NuevaVersionInput {
  nombre: string
  versionBaseId: string
  observaciones: string | null
}
