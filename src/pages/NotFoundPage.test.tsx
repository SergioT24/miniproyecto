import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { NotFoundPage } from "./NotFoundPage"

describe("NotFoundPage", () => {
  it("muestra el mensaje y el enlace al tablero", () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole("heading", { name: /página no encontrada/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ir al tablero/i })).toHaveAttribute("href", "/")
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = renderWithProviders(<NotFoundPage />)
    await expectNoAccessibilityViolations(container)
  })
})
