import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders as render, screen, waitFor, within } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { PresupuestoPage } from "./PresupuestoPage"

function renderPage(route = "/presupuesto") {
  return render(<PresupuestoPage />, { route })
}

describe("PresupuestoPage", () => {
  it("muestra el resumen de la versión activa por defecto", async () => {
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "Presupuesto", level: 1 }),
    ).toBeInTheDocument()
    expect(await screen.findByText("Ingresos · Marzo")).toBeInTheDocument()
    expect(screen.getByText("Egresos · Marzo")).toBeInTheDocument()
    expect(screen.getByText("Resultado · Marzo")).toBeInTheDocument()
    expect(screen.getByText("Desvío de egresos")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Resumen" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("img", { name: /Gráfico de egresos mensuales/ })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Presupuesto" })).toHaveTextContent(
      "Presupuesto 2026 UNLZ",
    )
    expect(screen.getByRole("combobox", { name: "Versión" })).toHaveTextContent("Marzo")
  })

  it("consulta las líneas de la versión al abrir la pestaña", async () => {
    renderPage("/presupuesto?vista=lineas")

    const table = await screen.findByRole("table", { name: "Líneas del presupuesto" })

    expect((await within(table).findAllByText("Sueldos y cargas sociales")).length).toBeGreaterThan(
      0,
    )
    expect(within(table).getAllByText("Ingreso").length).toBeGreaterThan(0)
    expect(within(table).getAllByText("Egreso").length).toBeGreaterThan(0)
    expect(screen.getByRole("tab", { name: "Líneas" })).toHaveAttribute("aria-selected", "true")
  })

  it("filtra las líneas por tipo y permite limpiar los filtros", async () => {
    const user = userEvent.setup()
    renderPage("/presupuesto?vista=lineas")

    const table = await screen.findByRole("table", { name: "Líneas del presupuesto" })
    expect((await within(table).findAllByText("Sueldos y cargas sociales")).length).toBeGreaterThan(
      0,
    )

    await user.click(screen.getByRole("combobox", { name: "Tipo" }))
    await user.click(await screen.findByRole("option", { name: "Egresos" }))

    await waitFor(() => {
      expect(within(table).queryAllByText("Ingreso")).toHaveLength(0)
    })
    expect(within(table).getAllByText("Egreso").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }))

    expect(screen.getByRole("combobox", { name: "Tipo" })).toHaveTextContent("Todos los tipos")
    expect((await within(table).findAllByText("Ingreso")).length).toBeGreaterThan(0)
  })

  it("busca líneas por concepto en la API mock", async () => {
    const user = userEvent.setup()
    renderPage("/presupuesto?vista=lineas")

    const table = await screen.findByRole("table", { name: "Líneas del presupuesto" })
    expect((await within(table).findAllByText("Sueldos y cargas sociales")).length).toBeGreaterThan(
      0,
    )

    await user.type(screen.getByRole("searchbox", { name: "Buscar en las líneas" }), "alquiler")

    expect((await within(table).findAllByText("Alquiler de oficinas")).length).toBeGreaterThan(0)
    expect(within(table).queryAllByText("Sueldos y cargas sociales")).toHaveLength(0)
  })

  it("crea una nueva versión desde el panel lateral", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos · Marzo")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nueva versión" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Nueva versión" })).toBeInTheDocument()
    expect(within(dialog).getByRole("combobox", { name: /Versión base/ })).toHaveTextContent(
      "Marzo",
    )

    await user.type(within(dialog).getByLabelText(/Nombre de la versión/), "Abril")
    await user.click(within(dialog).getByRole("button", { name: "Crear versión" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(await screen.findByRole("combobox", { name: "Versión" })).toHaveTextContent("Abril")
    expect(await screen.findByText("Ingresos · Abril")).toBeInTheDocument()
  })

  it("valida el nombre de la nueva versión", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos · Marzo")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nueva versión" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText(/Nombre de la versión/), "A")
    await user.click(within(dialog).getByRole("button", { name: "Crear versión" }))

    expect(
      (await within(dialog).findAllByText("El nombre debe tener al menos 2 caracteres.")).length,
    ).toBeGreaterThan(0)
    expect(within(dialog).getByLabelText(/Nombre de la versión/)).toHaveAttribute(
      "aria-invalid",
      "true",
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("cierra una versión abierta y refleja el estado inmutable", async () => {
    const user = userEvent.setup()
    renderPage("/presupuesto?vista=versiones")

    const row = await screen.findByRole("row", { name: /Marzo/ })
    expect(within(row).getByText("Abierta")).toBeInTheDocument()

    await user.click(within(row).getByRole("button", { name: "Cerrar la versión Marzo" }))

    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Cerrar versión" }))

    await waitFor(() => {
      const closedRow = screen.getByRole("row", { name: /Marzo/ })
      expect(within(closedRow).getByText("Cerrada")).toBeInTheDocument()
    })
    expect(
      within(screen.getByRole("row", { name: /Marzo/ })).queryByRole("button", {
        name: "Cerrar la versión Marzo",
      }),
    ).not.toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad en el resumen", async () => {
    const { container } = renderPage()

    expect(await screen.findByText("Ingresos · Marzo")).toBeInTheDocument()
    await expectNoAccessibilityViolations(container)
  })

  it("no tiene violaciones de accesibilidad en las líneas", async () => {
    const { container } = renderPage("/presupuesto?vista=lineas")

    expect(await screen.findByRole("table", { name: "Líneas del presupuesto" })).toBeInTheDocument()
    await expectNoAccessibilityViolations(container)
  })
})
