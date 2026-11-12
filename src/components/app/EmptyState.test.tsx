import { Inbox } from "lucide-react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { EmptyState, type EmptyStateIllustration } from "./EmptyState"

const illustrations: EmptyStateIllustration[] = ["generic", "charts", "accounts", "movements"]

describe("EmptyState", () => {
  it("muestra título, descripción y acción", () => {
    render(
      <EmptyState
        title="No se encontraron movimientos"
        description="Revisá los filtros."
        action={<button type="button">Limpiar filtros</button>}
      />,
    )

    expect(
      screen.getByRole("heading", { name: "No se encontraron movimientos" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Revisá los filtros.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Limpiar filtros" })).toBeInTheDocument()
  })

  it.each(illustrations)("renderiza la ilustración %s como decorativa", (illustration) => {
    const { container } = render(
      <EmptyState illustration={illustration} title={`Vacío: ${illustration}`} />,
    )

    const svg = container.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("mantiene el fallback con ícono", () => {
    const { container } = render(<EmptyState icon={Inbox} title="Sin datos" />)

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <EmptyState
        illustration="accounts"
        title="No se encontraron cuentas"
        description="Cuando agregues una cuenta, la vas a ver acá."
        action={<button type="button">Agregar cuenta</button>}
      />,
    )

    await expectNoAccessibilityViolations(container)
  })
})
