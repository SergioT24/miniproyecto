import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import {
  createMovimiento,
  deleteMovimiento,
  getResumenMovimientos,
  listMovimientos,
  updateMovimiento,
  type MovimientoFilterParams,
  type MovimientoListParams,
} from "./api"
import type { Movimiento, MovimientoInput } from "./types"

export const movimientoKeys = {
  all: ["movimientos"] as const,
  list: (params: MovimientoListParams) => [...movimientoKeys.all, "lista", params] as const,
  resumen: (params: MovimientoFilterParams) => [...movimientoKeys.all, "resumen", params] as const,
}

export function useMovimientosQuery(params: MovimientoListParams) {
  return useQuery({
    queryKey: movimientoKeys.list(params),
    queryFn: () => listMovimientos(params),
    placeholderData: keepPreviousData,
  })
}

export function useResumenMovimientosQuery(params: MovimientoFilterParams) {
  return useQuery({
    queryKey: movimientoKeys.resumen(params),
    queryFn: () => getResumenMovimientos(params),
  })
}

function invalidateMovimientos(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: movimientoKeys.all })
}

export function useCreateMovimientoMutation() {
  const queryClient = useQueryClient()

  return useMutation<Movimiento, Error, MovimientoInput>({
    mutationFn: createMovimiento,
    onSuccess: () => {
      invalidateMovimientos(queryClient)
      toast.success("Movimiento creado.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateMovimientoMutation() {
  const queryClient = useQueryClient()

  return useMutation<Movimiento, Error, { id: string; input: MovimientoInput }>({
    mutationFn: ({ id, input }) => updateMovimiento(id, input),
    onSuccess: () => {
      invalidateMovimientos(queryClient)
      toast.success("Cambios guardados.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteMovimientoMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteMovimiento,
    onSuccess: () => {
      invalidateMovimientos(queryClient)
      toast.success("Movimiento eliminado.")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
