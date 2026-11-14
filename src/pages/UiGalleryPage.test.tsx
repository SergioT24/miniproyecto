import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { screen, waitFor, within, renderWithProviders } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { UiGalleryPage } from "./UiGalleryPage"

describe("UiGalleryPage", () => {
  it("incluye los componentes reutilizables base y muestra sus ejemplos", () => {
    renderWithProviders(<UiGalleryPage />)

    expect(screen.getByRole("heading", { name: "Navegación y ayuda" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Mes" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Filtros y campos base" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Período" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Incluir períodos cerrados" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Observaciones" })).toBeInTheDocument()
    expect(
      screen.getByRole("img", { name: "Ingresos mensuales con tendencia creciente" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Eliminar informe" })).toBeInTheDocument()
  })

  it("no presenta violaciones de accesibilidad en sus ejemplos", async () => {
    const { container } = renderWithProviders(<UiGalleryPage />)

    await expectNoAccessibilityViolations(container)
  })

  it("permite cambiar el período de las pestañas y el filtro", async () => {
    const user = userEvent.setup()
    renderWithProviders(<UiGalleryPage />)

    await user.click(screen.getByRole("tab", { name: "Año" }))
    expect(screen.getByText("Resumen del año seleccionado.")).toBeInTheDocument()

    await user.click(screen.getByRole("combobox", { name: "Período" }))
    await user.click(await screen.findByRole("option", { name: "Este año" }))
    expect(screen.getByText("Período aplicado: anio.")).toBeInTheDocument()
  })

  it("expone la ayuda del tooltip en hover y la vincula con su disparador", async () => {
    const user = userEvent.setup()
    renderWithProviders(<UiGalleryPage />)

    const trigger = screen.getByRole("button", { name: "Ayuda sobre los períodos" })
    await user.hover(trigger)

    const tooltip = await screen.findByRole("tooltip")
    expect(tooltip).toHaveTextContent("Elegí el período que querés comparar.")
    expect(trigger).toHaveAttribute("aria-describedby", "periodos-tooltip")
  })

  it("confirma o cancela el AlertDialog sin ejecutar accidentalmente la acción", async () => {
    const user = userEvent.setup()
    renderWithProviders(<UiGalleryPage />)

    await user.click(screen.getByRole("button", { name: "Eliminar informe" }))
    const dialog = screen.getByRole("alertdialog", { name: "¿Eliminar el informe?" })
    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }))
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })
    expect(screen.getByText("No se eliminó ningún registro.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Eliminar informe" }))
    const confirmation = screen.getByRole("alertdialog", { name: "¿Eliminar el informe?" })
    await user.click(within(confirmation).getByRole("button", { name: "Eliminar informe" }))
    expect(screen.getByText("Informe eliminado (demo).")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })
  })
})
