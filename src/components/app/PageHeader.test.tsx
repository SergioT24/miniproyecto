import { describe, expect, it } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { PageHeader } from "./PageHeader"

describe("PageHeader", () => {
  it("renderiza el título como h1, la descripción y las acciones", () => {
    render(
      <PageHeader
        title="Movimientos"
        description="Ingresos y egresos del período."
        actions={<button type="button">Nuevo movimiento</button>}
      />,
    )

    expect(screen.getByRole("heading", { level: 1, name: "Movimientos" })).toBeInTheDocument()
    expect(screen.getByText("Ingresos y egresos del período.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Nuevo movimiento" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <PageHeader
        title="Presupuesto"
        description="Versiones y líneas del presupuesto."
        actions={<button type="button">Acción</button>}
      />,
    )

    await expectNoAccessibilityViolations(container)
  })
})
