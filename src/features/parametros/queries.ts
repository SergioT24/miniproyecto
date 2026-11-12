import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalog,
  updateCatalogItem,
  type CatalogListParams,
} from "./api"
import type { CatalogInput, CatalogItem, CatalogKey } from "./types"

export const parametrosKeys = {
  all: ["parametros"] as const,
  list: (catalog: CatalogKey, params: CatalogListParams) =>
    ["parametros", catalog, params] as const,
}

/** Listado paginado de un catálogo. Conserva la página anterior mientras carga. */
export function useCatalogQuery<K extends CatalogKey>(catalog: K, params: CatalogListParams) {
  return useQuery({
    queryKey: parametrosKeys.list(catalog, params),
    queryFn: () => listCatalog(catalog, params),
    placeholderData: keepPreviousData,
  })
}

/** Opciones completas de un catálogo para selects y búsquedas de nombres. */
export function useCatalogOptions<K extends CatalogKey>(catalog: K, sort = "nombre") {
  const query = useCatalogQuery(catalog, { page: 1, pageSize: 100, sort })

  return {
    items: query.data?.data ?? ([] as CatalogItem<K>[]),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

function invalidateCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: parametrosKeys.all })
}

export function useCreateCatalogItem<K extends CatalogKey>(catalog: K) {
  const queryClient = useQueryClient()

  return useMutation<CatalogItem<K>, Error, CatalogInput<K>>({
    mutationFn: (input) => createCatalogItem(catalog, input),
    onSuccess: () => {
      invalidateCatalog(queryClient)
      toast.success("Registro creado.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateCatalogItem<K extends CatalogKey>(catalog: K) {
  const queryClient = useQueryClient()

  return useMutation<CatalogItem<K>, Error, { id: string; input: CatalogInput<K> }>({
    mutationFn: ({ id, input }) => updateCatalogItem(catalog, id, input),
    onSuccess: () => {
      invalidateCatalog(queryClient)
      toast.success("Cambios guardados.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteCatalogItem<K extends CatalogKey>(catalog: K) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteCatalogItem(catalog, id),
    onSuccess: () => {
      invalidateCatalog(queryClient)
      toast.success("Registro eliminado.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
