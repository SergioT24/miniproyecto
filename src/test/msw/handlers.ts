import { http, HttpResponse } from "msw"

/**
 * Handlers base del mock service.
 * Los handlers por feature se agregan en fases posteriores.
 */
export const handlers = [http.get("/api/health", () => HttpResponse.json({ status: "ok" }))]
