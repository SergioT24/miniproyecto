import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders as render, screen, waitFor, within } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { ParametrosPage } from "./ParametrosPage"

function renderPage(route: string) {
  return render(<ParametrosPage />, { route })
}

describe("ParametrosPage", () => {
  it("abre el catálogo indicado en la URL y permite cambiar de pestaña", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=monedas")

    expect(await screen.findByRole("heading", { name: "Monedas", level: 2 })).toBeInTheDocument()
    expect(await screen.findByText("Peso argentino")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Monedas" })).toHaveAttribute("aria-selected", "true")

    await user.click(screen.getByRole("tab", { name: "Categorías" }))

    expect(await screen.findByRole("heading", { name: "Categorías", level: 2 })).toBeInTheDocument()
    expect(await screen.findByText("Alquileres")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Categorías" })).toHaveAttribute("aria-selected", "true")
  })

  it("crea una dirección desde el panel lateral", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=direcciones")

    expect(await screen.findByText("Dirección Médica")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nueva dirección" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText(/Nombre/), "Dirección de Prueba")
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }))

    expect(await screen.findByText("Dirección de Prueba")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("edita una dirección existente", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=direcciones")

    expect(await screen.findByText("Dirección Médica")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Editar la dirección: Dirección Médica" }))

    const dialog = await screen.findByRole("dialog")
    const input = within(dialog).getByLabelText(/Nombre/)

    expect(input).toHaveValue("Dirección Médica")

    await user.clear(input)
    await user.type(input, "Dirección Médica Norte")
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }))

    expect(await screen.findByText("Dirección Médica Norte")).toBeInTheDocument()
    expect(screen.queryByText("Dirección Médica")).not.toBeInTheDocument()
  })

  it("muestra las etiquetas legibles de los selects al editar un proyecto", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=proyectos")

    expect(await screen.findByText("Dirección Ejecutiva")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: "Editar el proyecto: Abogacía y políticas públicas",
      }),
    )

    const dialog = await screen.findByRole("dialog", {}, { timeout: 3000 })

    expect(within(dialog).getByRole("combobox", { name: /Dirección/ })).toHaveTextContent(
      "Dirección Ejecutiva",
    )
    expect(within(dialog).getByRole("combobox", { name: /Financiador/ })).toHaveTextContent(
      "Sin financiador",
    )
    expect(within(dialog).getByRole("combobox", { name: /Estado/ })).toHaveTextContent(
      "En preparación",
    )
    expect(within(dialog).getByRole("combobox", { name: /certeza/i })).toHaveTextContent("Baja")
  })

  it("elimina una moneda después de confirmar", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=monedas")

    expect(await screen.findByText("Dólar estadounidense")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: "Eliminar la moneda: USD — Dólar estadounidense",
      }),
    )

    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }))

    await waitFor(() => expect(screen.queryByText("Dólar estadounidense")).not.toBeInTheDocument())
    expect(screen.getByText("Peso argentino")).toBeInTheDocument()
  })

  it("muestra los errores de validación al guardar sin nombre", async () => {
    const user = userEvent.setup()
    renderPage("/parametros?catalogo=direcciones")

    expect(await screen.findByText("Dirección Médica")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nueva dirección" }))

    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }))

    const messages = await screen.findAllByText("El nombre debe tener al menos 2 caracteres.")
    expect(messages.length).toBeGreaterThan(0)
    expect(within(dialog).getByLabelText(/Nombre/)).toHaveAttribute("aria-invalid", "true")
    expect(within(dialog).getByText("Revisá los campos marcados")).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = renderPage("/parametros?catalogo=direcciones")

    expect(await screen.findByText("Dirección Médica")).toBeInTheDocument()
    await expectNoAccessibilityViolations(container)
  })
})
