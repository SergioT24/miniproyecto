import { describe, expect, it } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { MetricCard } from "./MetricCard"

describe("MetricCard", () => {
  it("muestra valor, etiqueta, variación y descripción", () => {
    render(
      <MetricCard
        value="$ 42.500"
        label="Ingresos totales"
        change="+22%"
        trend="up"
        description="vs. mes anterior"
      />,
    )

    expect(screen.getByText("$ 42.500")).toBeInTheDocument()
    expect(screen.getByText("Ingresos totales")).toBeInTheDocument()
    expect(screen.getByText("+22%")).toBeInTheDocument()
    expect(screen.getByText(/variación:/i)).toBeInTheDocument()
    expect(screen.getByText("vs. mes anterior")).toBeInTheDocument()
  })

  it("oculta el visual decorativo a lectores de pantalla", () => {
    render(
      <MetricCard
        value="$ 10"
        label="Indicador"
        visual={<svg data-testid="visual" aria-hidden="true" />}
      />,
    )

    const visual = screen.getByTestId("visual")
    expect(visual.parentElement).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("expone el visual como imagen cuando recibe una etiqueta", () => {
    render(
      <MetricCard
        value="75%"
        label="Objetivo"
        visual={<svg />}
        visualLabel="Anillo de progreso: 75% del objetivo anual."
      />,
    )

    expect(screen.getByRole("img", { name: /anillo de progreso: 75%/i })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <MetricCard
        value="$ 42.500"
        label="Ingresos totales"
        change="+22%"
        trend="up"
        visual={<svg viewBox="0 0 10 10" />}
        visualLabel="Tendencia creciente."
      />,
    )

    await expectNoAccessibilityViolations(container)
  })
})
