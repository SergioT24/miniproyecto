import { z } from "zod"

export const cashFlowFiltrosSchema = z.object({
  proyecto: z.string().optional().default("todos"),
  cuenta: z.string().optional().default("todas"),
  moneda: z.string().optional().default("todas"),
  vista: z.enum(["7d", "15d", "30d", "mes", "meses"]).optional().default("30d"),
  fechaDesde: z.string().optional().default(""),
  fechaHasta: z.string().optional().default(""),
})

export type CashFlowFiltros = z.infer<typeof cashFlowFiltrosSchema>

export const cashFlowFiltrosDefaults: CashFlowFiltros = {
  proyecto: "todos",
  cuenta: "todas",
  moneda: "todas",
  vista: "30d",
  fechaDesde: "",
  fechaHasta: "",
}
