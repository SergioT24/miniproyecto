import { useState } from "react"
import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { MoneyInput } from "./MoneyInput"

function MoneyInputDemo() {
  const [value, setValue] = useState<number | null>(null)

  return (
    <>
      <label htmlFor="monto">Monto</label>
      <MoneyInput id="monto" value={value} onValueChange={setValue} />
      <output aria-label="Valor numérico">{value ?? "null"}</output>
    </>
  )
}

describe("MoneyInput", () => {
  it("convierte el texto local a número y lo formatea al salir", async () => {
    const user = userEvent.setup()
    render(<MoneyInputDemo />)

    const input = screen.getByRole("textbox", { name: "Monto" })

    await user.type(input, "1500,5")

    expect(input).toHaveValue("1500,5")
    expect(screen.getByRole("status", { name: "Valor numérico" })).toHaveTextContent("1500.5")
    expect(input).toHaveAccessibleDescription("Moneda: ARS.")

    await user.tab()

    expect(input).toHaveValue("1.500,5")
  })

  it("devuelve null cuando el campo queda vacío", async () => {
    const user = userEvent.setup()
    render(<MoneyInputDemo />)

    const input = screen.getByRole("textbox", { name: "Monto" })
    await user.type(input, "123")
    await user.clear(input)

    expect(screen.getByRole("status", { name: "Valor numérico" })).toHaveTextContent("null")
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<MoneyInputDemo />)

    await expectNoAccessibilityViolations(container)
  })
})
