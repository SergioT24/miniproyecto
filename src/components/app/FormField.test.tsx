import { describe, expect, it } from "vitest"
import { Input } from "@/components/ui/input"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { FormActions } from "./FormActions"
import { FormField } from "./FormField"
import { FormSection } from "./FormSection"

describe("FormField", () => {
  it("asocia label, descripción, error y estado inválido con el control", () => {
    render(
      <FormField
        id="campo-detalle"
        label="Detalle"
        description="Máximo 120 caracteres."
        error="Ingresá un detalle."
        required
        optional
      >
        {({ id, describedBy, invalid, required }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
          />
        )}
      </FormField>,
    )

    const input = screen.getByRole("textbox", {
      name: /detalle/i,
    })

    expect(input).toHaveAttribute("id", "campo-detalle")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute(
      "aria-describedby",
      "campo-detalle-description campo-detalle-error",
    )
    expect(screen.getByText("Máximo 120 caracteres.")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá un detalle.")
    expect(screen.getByText("(obligatorio)")).toBeInTheDocument()
  })

  it("marca los campos opcionales cuando se solicita", () => {
    render(
      <FormField id="referencia" label="Referencia" optional>
        {({ id }) => <Input id={id} />}
      </FormField>,
    )

    expect(screen.getByText("(opcional)")).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <FormField label="Monto" error="Ingresá un monto." required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            inputMode="decimal"
          />
        )}
      </FormField>,
    )

    await expectNoAccessibilityViolations(container)
  })
})

describe("FormSection y FormActions", () => {
  it("agrupa campos con fieldset y acciones", async () => {
    const { container } = render(
      <form>
        <FormSection title="Datos del registro" description="Completá los campos.">
          <FormField id="detalle" label="Detalle">
            {({ id }) => <Input id={id} />}
          </FormField>
        </FormSection>
        <FormActions>
          <button type="submit">Guardar</button>
        </FormActions>
      </form>,
    )

    expect(screen.getByRole("group", { name: "Datos del registro" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument()

    await expectNoAccessibilityViolations(container)
  })
})
