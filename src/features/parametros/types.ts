export const catalogKeys = [
  "proyectos",
  "direcciones",
  "financiadores",
  "categorias",
  "monedas",
  "parametros-mensuales",
] as const

export type CatalogKey = (typeof catalogKeys)[number]

export function isCatalogKey(value: string | null | undefined): value is CatalogKey {
  return catalogKeys.includes(value as CatalogKey)
}

export const estadosProyecto = ["En ejecución", "Finalizado", "En preparación", "Aprobado"] as const

export type EstadoProyecto = (typeof estadosProyecto)[number]

export const gradosCerteza = ["Alta", "Media", "Baja"] as const

export type GradoCerteza = (typeof gradosCerteza)[number]

export const tiposCategoria = ["estructura_fija", "proyecto"] as const

export type TipoCategoria = (typeof tiposCategoria)[number]

export const codigosMoneda = ["ARS", "USD"] as const

export type CodigoMoneda = (typeof codigosMoneda)[number]

/** Campos comunes de todo registro de un catálogo. */
export interface CatalogRecord {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Proyecto extends CatalogRecord {
  nombre: string
  direccionId: string
  financiadorId: string | null
  estado: EstadoProyecto
  gradoCerteza: GradoCerteza | null
  esFicticioEstructura: boolean
}

export interface Direccion extends CatalogRecord {
  nombre: string
}

export interface Financiador extends CatalogRecord {
  nombre: string
}

export interface Categoria extends CatalogRecord {
  nombre: string
  tipo: TipoCategoria
}

export interface Moneda extends CatalogRecord {
  codigo: CodigoMoneda
  descripcion: string
}

export interface ParametroMensual extends CatalogRecord {
  /** Primer día del mes en formato ISO (`YYYY-MM-01`). */
  mes: string
  tipoCambioCcl: number | null
  tipoCambioNacion: number | null
  /** Fracción mensual: `0.025` equivale a 2,5 %. */
  inflacionMensual: number
}

export type CatalogItemMap = {
  proyectos: Proyecto
  direcciones: Direccion
  financiadores: Financiador
  categorias: Categoria
  monedas: Moneda
  "parametros-mensuales": ParametroMensual
}

export type CatalogItem<K extends CatalogKey> = CatalogItemMap[K]

export type ProyectoInput = Omit<Proyecto, keyof CatalogRecord>
export type DireccionInput = Omit<Direccion, keyof CatalogRecord>
export type FinanciadorInput = Omit<Financiador, keyof CatalogRecord>
export type CategoriaInput = Omit<Categoria, keyof CatalogRecord>
export type MonedaInput = Omit<Moneda, keyof CatalogRecord>
export type ParametroMensualInput = Omit<ParametroMensual, keyof CatalogRecord>

export type CatalogInputMap = {
  proyectos: ProyectoInput
  direcciones: DireccionInput
  financiadores: FinanciadorInput
  categorias: CategoriaInput
  monedas: MonedaInput
  "parametros-mensuales": ParametroMensualInput
}

export type CatalogInput<K extends CatalogKey> = CatalogInputMap[K]
