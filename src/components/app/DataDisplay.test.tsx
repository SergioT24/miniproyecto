import { CheckCircle2 } from "lucide-react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { CurrencyDisplay } from "./CurrencyDisplay"
import { StatusBadge } from "./StatusBadge"

describe("CurrencyDisplay", () => {
  it("formatea un importe en pesos argentinos", () => {
    render(<CurrencyDisplay value={1234567.5} />)

    expect(screen.getByText(/\$\s*1\.234\.567,50/)).toBeInTheDocument()
  })

  it("muestra el signo cuando se solicita", () => {
    render(<CurrencyDisplay value={24500} showSign />)

    expect(screen.getByText(/\+\$\s*24\.500,00/)).toBeInTheDocument()
  })

  it("muestra un texto explícito cuando no hay valor", () => {
    render(<CurrencyDisplay value={null} />)

    expect(screen.getByText("Sin dato")).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <dl>
        <dt>Saldo</dt>
        <dd>
          <CurrencyDisplay value={-24500} showSign />
        </dd>
      </dl>,
    )

    await expectNoAccessibilityViolations(container)
  })
})

describe("StatusBadge", () => {
  it("muestra el texto y el tono sin depender solo del color", () => {
    render(
      <StatusBadge tone="success" icon={CheckCircle2}>
        Aprobado
      </StatusBadge>,
    )

    const badge = screen.getByText("Aprobado")
    expect(badge).toHaveAttribute("data-tone", "success")
    expect(badge.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <div className="flex gap-2">
        <StatusBadge tone="success" icon={CheckCircle2}>
          Aprobado
        </StatusBadge>
        <StatusBadge tone="warning">Pendiente</StatusBadge>
        <StatusBadge tone="danger">Observado</StatusBadge>
      </div>,
    )

    await expectNoAccessibilityViolations(container)
  })
})
