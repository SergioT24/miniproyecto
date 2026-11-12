import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import {
  cerrarVersion,
  createVersion,
  getResumen,
  listLineas,
  listPresupuestos,
  listVersiones,
  type LineaListParams,
} from "./api"
import type { NuevaVersionInput } from "./types"

export const presupuestoKeys = {
  all: ["presupuestos"] as const,
  list: () => [...presupuestoKeys.all, "lista"] as const,
  versiones: (presupuestoId: string) =>
    [...presupuestoKeys.all, presupuestoId, "versiones"] as const,
  resumen: (presupuestoId: string, versionId: string) =>
    [...presupuestoKeys.all, presupuestoId, "resumen", versionId] as const,
  lineas: (presupuestoId: string, params: LineaListParams | null) =>
    [...presupuestoKeys.all, presupuestoId, "lineas", params] as const,
}

export function usePresupuestosQuery() {
  return useQuery({
    queryKey: presupuestoKeys.list(),
    queryFn: listPresupuestos,
  })
}

export function useVersionesQuery(presupuestoId: string | undefined) {
  return useQuery({
    queryKey: presupuestoKeys.versiones(presupuestoId ?? ""),
    queryFn: () => listVersiones(presupuestoId ?? ""),
    enabled: Boolean(presupuestoId),
  })
}

export function useResumenQuery(presupuestoId: string | undefined, versionId: string | undefined) {
  return useQuery({
    queryKey: presupuestoKeys.resumen(presupuestoId ?? "", versionId ?? ""),
    queryFn: () => getResumen(presupuestoId ?? "", versionId ?? ""),
    enabled: Boolean(presupuestoId && versionId),
  })
}

export function useLineasQuery(
  presupuestoId: string | undefined,
  params: LineaListParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: presupuestoKeys.lineas(presupuestoId ?? "", params),
    queryFn: () => listLineas(presupuestoId ?? "", params ?? { versionId: "" }),
    enabled: Boolean(presupuestoId && params) && enabled,
    placeholderData: keepPreviousData,
  })
}

function invalidatePresupuesto(
  queryClient: ReturnType<typeof useQueryClient>,
  presupuestoId: string,
) {
  void queryClient.invalidateQueries({ queryKey: [...presupuestoKeys.all, presupuestoId] })
}

export function useCreateVersionMutation(presupuestoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation<Awaited<ReturnType<typeof createVersion>>, Error, NuevaVersionInput>({
    mutationFn: (input) => {
      if (!presupuestoId) {
        return Promise.reject(new Error("Elegí un presupuesto antes de crear una versión."))
      }

      return createVersion(presupuestoId, input)
    },
    onSuccess: () => {
      if (presupuestoId) {
        invalidatePresupuesto(queryClient, presupuestoId)
      }
      toast.success("Versión creada.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useCerrarVersionMutation(presupuestoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation<Awaited<ReturnType<typeof cerrarVersion>>, Error, string>({
    mutationFn: (versionId) => {
      if (!presupuestoId) {
        return Promise.reject(new Error("Elegí un presupuesto antes de cerrar la versión."))
      }

      return cerrarVersion(presupuestoId, versionId)
    },
    onSuccess: () => {
      if (presupuestoId) {
        invalidatePresupuesto(queryClient, presupuestoId)
      }
      toast.success("Versión cerrada. Ya no admite cambios.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
