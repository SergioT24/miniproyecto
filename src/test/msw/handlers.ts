import { http, HttpResponse } from "msw"
import { parametrosHandlers } from "@/features/parametros/msw"

/**
 * Handlers base del mock service.
 * Combina los handlers base con los de cada feature.
 */
export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
  ...parametrosHandlers,
]
