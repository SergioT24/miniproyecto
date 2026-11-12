import { useState } from "react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { DatePicker } from "./DatePicker"

const initialDate = new Date(2026, 2, 15)

function DatePickerDemo({
  initialValue = null,
  onChange = vi.fn(),
}: {
  initialValue?: Date | null
  onChange?: (value: Date | null) => void
}) {
  const [value, setValue] = useState<Date | null>(initialValue)

  return (
    <DatePicker
      value={value}
      onChange={(date) => {
        setValue(date)
        onChange(date)
      }}
    />
  )
}

describe("DatePicker", () => {
  it("abre el calendario y muestra la fecha elegida", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePickerDemo initialValue={initialDate} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "15/03/2026" }))

    expect(await screen.findByRole("grid")).toBeInTheDocument()

    const day = screen.getByRole("button", { name: /20 de marzo de 2026/ })
    await user.click(day)

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 20))
    expect(screen.getByRole("button", { name: "20/03/2026" })).toBeInTheDocument()
  })

  it("permite abrir el calendario con teclado y elegir un día", async () => {
    const user = userEvent.setup()
    render(<DatePickerDemo initialValue={initialDate} />)

    await user.tab()
    expect(screen.getByRole("button", { name: "15/03/2026" })).toHaveFocus()

    await user.keyboard("{Enter}")
    expect(await screen.findByRole("grid")).toBeInTheDocument()

    const day = screen.getByRole("button", { name: /20 de marzo de 2026/ })
    day.focus()
    await user.keyboard("{Enter}")

    expect(screen.getByRole("button", { name: "20/03/2026" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<DatePickerDemo />)
    await expectNoAccessibilityViolations(container)
  })
})
