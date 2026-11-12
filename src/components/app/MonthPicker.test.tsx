import { useState } from "react"
import userEvent from "@testing-library/user-event"
import { within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { MonthPicker } from "./MonthPicker"

const initialMonth = new Date(2026, 2, 1)

function MonthPickerDemo({
  initialValue = null,
  onChange = vi.fn(),
}: {
  initialValue?: Date | null
  onChange?: (value: Date | null) => void
}) {
  const [value, setValue] = useState<Date | null>(initialValue)

  return (
    <MonthPicker
      value={value}
      onChange={(date) => {
        setValue(date)
        onChange(date)
      }}
    />
  )
}

describe("MonthPicker", () => {
  it("muestra el mes elegido y permite cambiarlo", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MonthPickerDemo initialValue={initialMonth} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Marzo de 2026" }))
    await user.click(await screen.findByRole("button", { name: /julio de 2026/i }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 1))
    expect(screen.getByRole("button", { name: "Julio de 2026" })).toBeInTheDocument()
  })

  it("permite navegar entre años y muestra los doce meses", async () => {
    const user = userEvent.setup()
    render(<MonthPickerDemo initialValue={initialMonth} />)

    await user.click(screen.getByRole("button", { name: "Marzo de 2026" }))
    const monthsGroup = await screen.findByRole("group", { name: "Meses de 2026" })
    expect(within(monthsGroup).getAllByRole("button")).toHaveLength(12)

    await user.click(screen.getByRole("button", { name: "Año siguiente" }))
    expect(screen.getByRole("group", { name: "Meses de 2027" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Año anterior" }))
    expect(screen.getByRole("group", { name: "Meses de 2026" })).toBeInTheDocument()
  })

  it("se puede abrir con teclado", async () => {
    const user = userEvent.setup()
    render(<MonthPickerDemo initialValue={initialMonth} />)

    await user.tab()
    expect(screen.getByRole("button", { name: "Marzo de 2026" })).toHaveFocus()

    await user.keyboard("{Enter}")
    expect(await screen.findByRole("group", { name: "Meses de 2026" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<MonthPickerDemo />)
    await expectNoAccessibilityViolations(container)
  })
})
