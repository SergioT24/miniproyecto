import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { MaskedValue } from "./MaskedValue"

describe("MaskedValue", () => {
  it("oculta el valor y lo muestra con el botón", async () => {
    const user = userEvent.setup()

    render(
      <MaskedValue label="Saldo restringido">
        <span>$ 98.500</span>
      </MaskedValue>,
    )

    const mostrar = screen.getByRole("button", { name: "Mostrar valor" })
    expect(mostrar).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Valor oculto")).toBeInTheDocument()
    expect(screen.queryByText("$ 98.500")).not.toBeInTheDocument()

    await user.click(mostrar)

    expect(screen.getByText("$ 98.500")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ocultar valor" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("puede iniciar visible", () => {
    render(
      <MaskedValue defaultVisible>
        <span>$ 10.000</span>
      </MaskedValue>,
    )

    expect(screen.getByText("$ 10.000")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ocultar valor" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <MaskedValue label="Saldo restringido">
        <span>$ 98.500</span>
      </MaskedValue>,
    )

    await expectNoAccessibilityViolations(container)
  })
})
