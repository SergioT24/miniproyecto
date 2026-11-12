import { expect } from "vitest"
import { axe } from "vitest-axe"

/**
 * Corre axe sobre un contenedor y falla con un resumen legible.
 * No usamos el matcher de vitest-axe porque sus tipos apuntan a la API
 * global `Vi` anterior a Vitest 5.
 */
export async function expectNoAccessibilityViolations(container: HTMLElement) {
  const results = await axe(container)
  const summary = results.violations.map(
    (violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`,
  )

  expect(summary).toEqual([])
}
