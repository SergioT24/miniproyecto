import { describe, expect, it } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { FilterBar } from "./FilterBar"

describe("FilterBar", () => {
  it("expone un landmark de búsqueda y asocia el label con el control", () => {
    render(
      <FilterBar label="Filtros de movimientos" actions={<button type="button">Limpiar</button>}>
        <label htmlFor="busqueda">Buscar</label>
        <input id="busqueda" type="search" />
      </FilterBar>,
    )

    expect(screen.getByRole("search", { name: "Filtros de movimientos" })).toBeInTheDocument()
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Limpiar" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <FilterBar actions={<button type="button">Limpiar filtros</button>}>
        <label htmlFor="proyecto">Proyecto</label>
        <input id="proyecto" />
      </FilterBar>,
    )

    await expectNoAccessibilityViolations(container)
  })
})
