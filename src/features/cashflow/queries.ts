import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { CashFlowParams } from "./api"
import type { FilaDiaria, ResumenCashFlow } from "./types"

export const cashflowKeys = {
  all: ["cashflow"] as const,
  diario: (params: CashFlowParams) => [...cashflowKeys.all, "diario", params] as const,
  resumen: (params: CashFlowParams) => [...cashflowKeys.all, "resumen", params] as const,
}

export function useCashFlowQuery(params: CashFlowParams) {
  return useQuery({
    queryKey: cashflowKeys.diario(params),
    queryFn: () =>
      apiClient.get<FilaDiaria[]>("/cashflow/diario", {
        query: {
          proyecto: params.proyecto,
          cuenta: params.cuenta,
          moneda: params.moneda,
          vista: params.vista,
          fechaDesde: params.fechaDesde,
          fechaHasta: params.fechaHasta,
        },
      }),
  })
}

export function useResumenCashFlowQuery(params: CashFlowParams) {
  return useQuery({
    queryKey: cashflowKeys.resumen(params),
    queryFn: () =>
      apiClient.get<ResumenCashFlow>("/cashflow/resumen", {
        query: {
          proyecto: params.proyecto,
          cuenta: params.cuenta,
          moneda: params.moneda,
          vista: params.vista,
          fechaDesde: params.fechaDesde,
          fechaHasta: params.fechaHasta,
        },
      }),
  })
}
