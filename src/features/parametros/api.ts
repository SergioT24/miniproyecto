import { apiClient, type Paginated, type SortDirection } from "@/lib/api"
import type { CatalogInput, CatalogItem, CatalogKey } from "./types"

export interface CatalogListParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  order?: SortDirection
}

function catalogPath(catalog: CatalogKey) {
  return `/parametros/${catalog}`
}

/**
 * API mock de Parámetros. Mantiene la forma de un recurso REST paginado para
 * que el reemplazo por el backend real no cambie las pantallas.
 * TODO(api): confirmar nombres de campos y endpoints con el contrato definitivo.
 */
export function listCatalog<K extends CatalogKey>(
  catalog: K,
  params: CatalogListParams = {},
): Promise<Paginated<CatalogItem<K>>> {
  return apiClient.get<Paginated<CatalogItem<K>>>(catalogPath(catalog), {
    query: { ...params },
  })
}

export function createCatalogItem<K extends CatalogKey>(
  catalog: K,
  input: CatalogInput<K>,
): Promise<CatalogItem<K>> {
  return apiClient.post<CatalogItem<K>>(catalogPath(catalog), input)
}

export function updateCatalogItem<K extends CatalogKey>(
  catalog: K,
  id: string,
  input: CatalogInput<K>,
): Promise<CatalogItem<K>> {
  return apiClient.put<CatalogItem<K>>(`${catalogPath(catalog)}/${id}`, input)
}

export function deleteCatalogItem<K extends CatalogKey>(catalog: K, id: string): Promise<void> {
  return apiClient.delete<void>(`${catalogPath(catalog)}/${id}`)
}
