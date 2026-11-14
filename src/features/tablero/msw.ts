import { http, HttpResponse } from "msw"
import { resumenTableroFixture } from "./fixtures"

/**
 * Handlers MSW del Tablero. No tiene estado mutable, por lo que el reset
 * es un noop.
 * TODO(api): reemplazar por el backend real.
 */
export const tableroHandlers = [
  http.get("/api/tablero/resumen", () => {
    return HttpResponse.json(resumenTableroFixture)
  }),
]

/** Noop: el tablero no tiene estado mutable en el mock. */
export function resetTableroStore() {
  // noop
}
