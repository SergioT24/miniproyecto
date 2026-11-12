import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { FormErrorSummary } from "./FormErrorSummary"

const errores = [
  {
    fieldId: "detalle",
    label: "Detalle",
    message: "Ingresá un detalle.",
  },
  {
    fieldId: "monto",
    label: "Monto",
    message: "Ingresá un monto mayor a 0.",
  },
]

describe("FormErrorSummary", () => {
  it("recibe el foco y lista los errores", () => {
    render(
      <>
        <FormErrorSummary errors={errores} />
        <input id="detalle" aria-label="Detalle" />
        <input id="monto" aria-label="Monto" />
      </>,
    )

    const summary = screen.getByRole("alert")
    expect(summary).toHaveFocus()
    expect(summary).toHaveTextContent("Hay 2 campos que necesitan tu atención.")
    expect(screen.getByRole("link", { name: /detalle:/i })).toBeInTheDocument()
  })

  it("no roba el foco cuando cambia el conjunto de errores", async () => {
    const user = userEvent.setup()

    function Demo({ errors }: { errors: typeof errores }) {
      return (
        <>
          <FormErrorSummary errors={errors} />
          <input id="detalle" aria-label="Detalle" />
          <input id="monto" aria-label="Monto" />
        </>
      )
    }

    const { rerender } = render(<Demo errors={errores} />)
    const detalle = screen.getByRole("textbox", { name: "Detalle" })

    await user.click(detalle)
    expect(detalle).toHaveFocus()

    rerender(<Demo errors={[errores[1]]} />)

    expect(detalle).toHaveFocus()
  })

  it("lleva el foco al campo al activar un enlace", async () => {
    const user = userEvent.setup()

    render(
      <>
        <FormErrorSummary errors={errores} />
        <input id="detalle" aria-label="Detalle" />
        <input id="monto" aria-label="Monto" />
      </>,
    )

    await user.click(screen.getByRole("link", { name: /monto:/i }))

    expect(screen.getByRole("textbox", { name: "Monto" })).toHaveFocus()
  })

  it("no renderiza nada sin errores", () => {
    const { container } = render(<FormErrorSummary errors={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <>
        <FormErrorSummary errors={[errores[0]]} />
        <input id="detalle" aria-label="Detalle" />
      </>,
    )

    await expectNoAccessibilityViolations(container)
  })
})
