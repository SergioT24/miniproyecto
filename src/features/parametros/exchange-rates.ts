import { parametrosMensualesSeed } from "./fixtures"

/**
 * Tipo de cambio CCL por mes (`YYYY-MM-01`).
 * TODO(api): usar el tipo de cambio del parámetro mensual de la versión activa.
 */
export const tipoCambioCclPorMes: Record<string, number> = Object.fromEntries(
  parametrosMensualesSeed.map((parametro) => [parametro.mes, parametro.tipoCambioCcl ?? 1]),
)
