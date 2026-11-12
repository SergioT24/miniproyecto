import type { Paginated, SortDirection } from "@/lib/api"
import { apiClient } from "@/lib/api"
import type { CodigoMoneda } from "@/features/parametros/types"
import type {
  EstadoCobroPago,
  Movimiento,
  MovimientoInput,
  ResumenMovimientos,
  TipoMovimiento,
} from "./types"

export interface MovimientoFilterParams {
  search?: string
  tipo?: TipoMovimiento
  proyectoId?: string
  categoriaId?: string
  moneda?: CodigoMoneda
  estado?: EstadoCobroPago
  /** Primer día del mes en formato ISO (`YYYY-MM-01`). */
  mes?: string
}

export interface MovimientoListParams extends MovimientoFilterParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: SortDirection
}

/**
 * API mock de Movimientos. Mantiene la forma REST para reemplazarla por el
 * backend real sin cambiar las pantallas.
 * TODO(api): confirmar endpoints, filtros y contrato de los detalles.
 */
export function listMovimientos(params: MovimientoListParams): Promise<Paginated<Movimiento>> {
  return apiClient.get<Paginated<Movimiento>>("/movimientos", { query: { ...params } })
}

export function getResumenMovimientos(
  params: MovimientoFilterParams,
): Promise<ResumenMovimientos> {
  return apiClient.get<ResumenMovimientos>("/movimientos/resumen", { query: { ...params } })
}

export function createMovimiento(input: MovimientoInput): Promise<Movimiento> {
  return apiClient.post<Movimiento>("/movimientos", input)
}

export function updateMovimiento(id: string, input: MovimientoInput): Promise<Movimiento> {
  return apiClient.put<Movimiento>(`/movimientos/${id}`, input)
}

export function deleteMovimiento(id: string): Promise<void> {
  return apiClient.delete<void>(`/movimientos/${id}`)
}
