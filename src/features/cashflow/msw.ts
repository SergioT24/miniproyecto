import { http, HttpResponse } from "msw"
import { getCashFlow, getResumenCashFlow, type CashFlowParams } from "./api"

function resolveSearchParam(url: URL, key: string): string | undefined {
  const value = url.searchParams.get(key)
  return value ?? undefined
}

function buildParams(url: URL): CashFlowParams {
  return {
    proyecto: resolveSearchParam(url, "proyecto"),
    cuenta: resolveSearchParam(url, "cuenta"),
    moneda: resolveSearchParam(url, "moneda"),
    vista: resolveSearchParam(url, "vista"),
    fechaDesde: resolveSearchParam(url, "fechaDesde"),
    fechaHasta: resolveSearchParam(url, "fechaHasta"),
  }
}

// El store de cashflow es stateless (sólo lee fixtures), pero la función de
// reset existe para que setup.ts pueda invocarlo de forma uniforme.
export function resetCashflowStore(): void {
  // No hay estado mutable; función de utilidad para consistencia con otros módulos.
}

/**
 * Handlers MSW del módulo Cash Flow.
 * TODO(api): reemplazar por los endpoints del backend real.
 */
export const cashflowHandlers = [
  http.get("/api/cashflow/diario", ({ request }) => {
    const url = new URL(request.url)
    const params = buildParams(url)
    const data = getCashFlow(params)
    return HttpResponse.json(data)
  }),

  http.get("/api/cashflow/resumen", ({ request }) => {
    const url = new URL(request.url)
    const params = buildParams(url)
    const resumen = getResumenCashFlow(params)
    return HttpResponse.json(resumen)
  }),
]
