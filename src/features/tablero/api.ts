import { resumenTableroFixture } from "./fixtures"
import type { ResumenTablero } from "./types"

/**
 * Devuelve el resumen del tablero.
 * TODO(api): reemplazar por llamada al backend real.
 */
export function getResumenTablero(): Promise<ResumenTablero> {
  return Promise.resolve(resumenTableroFixture)
}
