import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders as render, screen, waitFor, within } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { MovimientosPage } from "./MovimientosPage"

function renderPage(route = "/movimientos") {
  return render(<MovimientosPage />, { route })
}

async function findTable() {
  return screen.findByRole("table", { name: "Movimientos previstos" })
}

describe("MovimientosPage", () => {
  it("muestra el resumen y los movimientos del período", async () => {
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "Movimientos", level: 1 }),
    ).toBeInTheDocument()
    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()
    expect(screen.getByText("Egresos previstos")).toBeInTheDocument()
    expect(screen.getByText("Resultado previsto")).toBeInTheDocument()
    expect(screen.getByText("Pendientes de cobro y pago")).toBeInTheDocument()

    const table = await findTable()
    expect(
      (await within(table).findAllByText("Aporte internacional Estructura FH")).length,
    ).toBeGreaterThan(0)
    expect(within(table).getAllByText("Sueldos y cargas sociales").length).toBeGreaterThan(0)
    expect(screen.getByRole("combobox", { name: "Tipo" })).toHaveTextContent("Todos los tipos")
  })

  it("filtra por tipo y permite limpiar los filtros", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    expect((await within(table).findAllByText("Ingreso")).length).toBeGreaterThan(0)

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

  it("busca movimientos por concepto en la API mock", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    expect((await within(table).findAllByText("Sueldos y cargas sociales")).length).toBeGreaterThan(
      0,
    )

    await user.type(screen.getByRole("searchbox", { name: "Buscar movimientos" }), "alquiler")

    expect((await within(table).findAllByText("Alquiler de oficinas")).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(within(table).queryAllByText("Sueldos y cargas sociales")).toHaveLength(0)
    })
  })

  it("filtra por mes en la API mock", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    expect((await within(table).findAllByText("01/01/2026")).length).toBeGreaterThan(0)

    await user.click(screen.getByRole("combobox", { name: "Mes" }))
    await user.click(await screen.findByRole("option", { name: "Marzo de 2026" }))

    expect((await within(table).findAllByText("01/03/2026")).length).toBeGreaterThan(0)
    expect(within(table).queryAllByText("01/01/2026")).toHaveLength(0)
  })

  it("crea un movimiento desde el panel lateral", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nuevo movimiento" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Nuevo movimiento" })).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/Concepto/), "Movimiento de prueba")

    await user.click(within(dialog).getByRole("combobox", { name: /Proyecto/ }))
    await user.click(await screen.findByRole("option", { name: "Salud mental" }))

    await user.click(within(dialog).getByRole("combobox", { name: /Categoría/ }))
    await user.click(await screen.findByRole("option", { name: "Donaciones" }))

    await user.type(within(dialog).getByLabelText(/Importe/), "1500000")
    await user.click(within(dialog).getByRole("button", { name: "Crear movimiento" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())

    await user.type(
      screen.getByRole("searchbox", { name: "Buscar movimientos" }),
      "Movimiento de prueba",
    )

    const row = await screen.findByRole("row", { name: /Movimiento de prueba/ })
    expect(within(row).getByText("Salud mental")).toBeInTheDocument()
    expect(within(row).getByText("Donaciones")).toBeInTheDocument()
  }, 15000)

  it("valida los campos obligatorios del movimiento", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nuevo movimiento" }))

    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Crear movimiento" }))

    expect(
      (await within(dialog).findAllByText("El concepto debe tener al menos 2 caracteres.")).length,
    ).toBeGreaterThan(0)
    expect(within(dialog).getAllByText("El importe debe ser mayor a cero.").length).toBeGreaterThan(
      0,
    )
    expect(within(dialog).getAllByText("Elegí un proyecto.").length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText("Elegí una categoría.").length).toBeGreaterThan(0)
    expect(within(dialog).getByLabelText(/Concepto/)).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("edita un movimiento existente", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    const row = await within(table).findByRole("row", {
      name: /Aporte internacional Estructura FH/,
    })

    await user.click(
      within(row).getByRole("button", {
        name: /Editar Aporte internacional Estructura FH/,
      }),
    )

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Editar movimiento" })).toBeInTheDocument()

    const concepto = within(dialog).getByLabelText(/Concepto/)
    await user.clear(concepto)
    await user.type(concepto, "Aporte editado")
    await user.click(within(dialog).getByRole("button", { name: "Guardar cambios" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(await screen.findByText("Aporte editado")).toBeInTheDocument()
  })

  it("elimina un movimiento con confirmación", async () => {
    const user = userEvent.setup()
    renderPage()

    const table = await findTable()
    await user.type(screen.getByRole("searchbox", { name: "Buscar movimientos" }), "alquiler")

    const row = await within(table).findByRole("row", {
      name: /01\/01\/2026.*Alquiler de oficinas/,
    })
    await user.click(within(row).getByRole("button", { name: /Eliminar Alquiler de oficinas/ }))

    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Eliminar movimiento" }))

    await waitFor(() => {
      expect(
        within(table).queryByRole("row", {
          name: /01\/01\/2026.*Alquiler de oficinas/,
        }),
      ).not.toBeInTheDocument()
    })
  })

  it("muestra el detalle de egreso y sus estados al cambiar el tipo", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nuevo movimiento" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Detalle del ingreso")).toBeInTheDocument()
    expect(within(dialog).queryByText("Detalle del egreso")).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole("combobox", { name: /^Tipo/ }))
    await user.click(await screen.findByRole("option", { name: "Egreso" }))

    expect(within(dialog).getByText("Detalle del egreso")).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Proveedor o destinatario/)).toBeInTheDocument()
    expect(within(dialog).queryByLabelText(/Cuenta destino/)).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole("combobox", { name: /Estado/ }))
    expect(await screen.findByRole("option", { name: "Pagado" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Cobrado" })).not.toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad en el listado", async () => {
    const { container } = renderPage()

    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()
    expect(await findTable()).toBeInTheDocument()
    await expectNoAccessibilityViolations(container)
  })

  it("no tiene violaciones de accesibilidad en el formulario", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("Ingresos previstos")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nuevo movimiento" }))

    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByRole("heading", { name: "Nuevo movimiento" }),
    ).toBeInTheDocument()
    await expectNoAccessibilityViolations(dialog)
  })
})
