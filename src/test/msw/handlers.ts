import { http, HttpResponse } from "msw"
import { cashflowHandlers } from "@/features/cashflow/msw"
import { movimientosHandlers } from "@/features/movimientos/msw"
import { parametrosHandlers } from "@/features/parametros/msw"
import { presupuestoHandlers } from "@/features/presupuesto/msw"

/**
 * Handlers base del mock service.
 * Combina los handlers base con los de cada feature.
 */
export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
  ...parametrosHandlers,
  ...presupuestoHandlers,
  ...movimientosHandlers,
  ...cashflowHandlers,
]
