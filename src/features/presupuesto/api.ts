import { apiClient, type Paginated, type SortDirection } from "@/lib/api"
import type {
  LineaPresupuesto,
  NuevaVersionInput,
  Presupuesto,
  ResumenPresupuesto,
  TipoMovimiento,
  VersionProyeccion,
} from "./types"

export interface LineaListParams {
  versionId: string
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  order?: SortDirection
  proyectoId?: string
  categoriaId?: string
  tipo?: TipoMovimiento
  /** Primer día del mes en formato ISO (`YYYY-MM-01`). */
  mes?: string
}

function presupuestoPath(presupuestoId: string) {
  return `/presupuestos/${presupuestoId}`
}

/**
 * API mock de Presupuesto. Mantiene la forma esperada de los recursos REST
 * para que el reemplazo por el backend real no cambie las pantallas.
 * TODO(api): confirmar endpoints, nombres de campos y reglas de negocio.
 */
export function listPresupuestos(): Promise<Presupuesto[]> {
  return apiClient.get<Presupuesto[]>("/presupuestos")
}

export function listVersiones(presupuestoId: string): Promise<VersionProyeccion[]> {
  return apiClient.get<VersionProyeccion[]>(`${presupuestoPath(presupuestoId)}/versiones`)
}

export function getResumen(presupuestoId: string, versionId: string): Promise<ResumenPresupuesto> {
  return apiClient.get<ResumenPresupuesto>(`${presupuestoPath(presupuestoId)}/resumen`, {
    query: { versionId },
  })
}

export function listLineas(
  presupuestoId: string,
  params: LineaListParams,
): Promise<Paginated<LineaPresupuesto>> {
  return apiClient.get<Paginated<LineaPresupuesto>>(`${presupuestoPath(presupuestoId)}/lineas`, {
    query: { ...params },
  })
}

export function createVersion(
  presupuestoId: string,
  input: NuevaVersionInput,
): Promise<VersionProyeccion> {
  return apiClient.post<VersionProyeccion>(`${presupuestoPath(presupuestoId)}/versiones`, input)
}

export function cerrarVersion(
  presupuestoId: string,
  versionId: string,
): Promise<VersionProyeccion> {
  return apiClient.patch<VersionProyeccion>(
    `${presupuestoPath(presupuestoId)}/versiones/${versionId}`,
    { esInmutable: true },
  )
}
