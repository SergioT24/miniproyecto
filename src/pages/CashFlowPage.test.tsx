import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders as render, screen, waitFor, within } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { CashFlowPage } from "./CashFlowPage"

function renderPage(route = "/cashflow") {
  return render(<CashFlowPage />, { route })
}

async function findTable() {
  return screen.findByRole("table", { name: "Flujo de fondos" })
}

describe("CashFlowPage", () => {
  it("muestra el resumen y las filas de flujo de fondos", async () => {
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "Cash flow", level: 1 }),
    ).toBeInTheDocument()

    expect(await screen.findByText("Saldo inicial período")).toBeInTheDocument()
    expect(screen.getByText("Ingresos totales")).toBeInTheDocument()
    expect(screen.getByText("Egresos totales")).toBeInTheDocument()
    expect(screen.getAllByText("Saldo de cierre").length).toBeGreaterThan(0)

    const table = await findTable()
    expect(table).toBeInTheDocument()
    // Verificamos que hay filas cargadas
    const rows = await within(table).findAllByRole("row")
    expect(rows.length).toBeGreaterThan(1) // Header + al menos 1 fila
  })

  it("permite cambiar la agrupación a semanal y mensual", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    expect(table).toBeInTheDocument()

    // Cambiar a Semanal
    const tabSemanal = screen.getByRole("tab", { name: "Semanal" })
    await user.click(tabSemanal)

    await waitFor(async () => {
      const headers = await within(table).findAllByRole("columnheader")
      expect(headers[0]).toHaveTextContent("Período")
    })

    // Cambiar a Mensual
    const tabMensual = screen.getByRole("tab", { name: "Mensual" })
    await user.click(tabMensual)

    await waitFor(async () => {
      const headers = await within(table).findAllByRole("columnheader")
      expect(headers[0]).toHaveTextContent("Período")
    })
  })

  it("permite cambiar el horizonte de tiempo", async () => {
    const user = userEvent.setup()
    renderPage()

    await findTable()

    const btn7d = screen.getByRole("button", { name: "7 días" })
    await user.click(btn7d)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "7 días" })).toHaveAttribute("data-variant", "default")
    })
  })

  it("filtra por proyecto y permite limpiar", async () => {
    const user = userEvent.setup()
    renderPage()

    await findTable()

    // Abre el combobox de Proyecto
    const combobox = screen.getByRole("combobox", { name: "Proyecto" })
    await user.click(combobox)

    const opcionSalud = await screen.findByRole("option", { name: "Proyecto Salud" })
    await user.click(opcionSalud)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Limpiar filtros" })).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }))
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument()
    })
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = renderPage()
    await findTable()
    await expectNoAccessibilityViolations(container)
  })
})
