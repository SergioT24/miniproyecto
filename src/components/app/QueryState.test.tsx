import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { QueryState } from "./QueryState"

describe("QueryState", () => {
  it("muestra el contenido cuando la consulta tiene datos", () => {
    render(
      <QueryState>
        <p>Contenido disponible.</p>
      </QueryState>,
    )

    expect(screen.getByText("Contenido disponible.")).toBeInTheDocument()
  })

  it("anuncia la carga y muestra el mensaje recibido", () => {
    render(
      <QueryState isLoading loadingLabel="Buscando movimientos…">
        <p>No debería verse.</p>
      </QueryState>,
    )

    expect(screen.getByRole("status")).toHaveTextContent("Buscando movimientos…")
    expect(screen.queryByText("No debería verse.")).not.toBeInTheDocument()
  })

  it("muestra el error y permite reintentar", async () => {
    const onRetry = vi.fn()

    render(
      <QueryState isError onRetry={onRetry}>
        <p>No debería verse.</p>
      </QueryState>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron cargar los datos")

    screen.getByRole("button", { name: /reintentar/i }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("muestra el estado vacío específico", () => {
    render(
      <QueryState isEmpty emptyState={<p>No hay movimientos.</p>}>
        <p>No debería verse.</p>
      </QueryState>,
    )

    expect(screen.getByText("No hay movimientos.")).toBeInTheDocument()
    expect(screen.queryByText("No debería verse.")).not.toBeInTheDocument()
  })

  it("usa un estado vacío genérico si no recibe uno", () => {
    render(
      <QueryState isEmpty>
        <p>No debería verse.</p>
      </QueryState>,
    )

    expect(screen.getByRole("heading", { name: "No hay resultados" })).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <QueryState isError onRetry={() => undefined}>
        <p>Contenido.</p>
      </QueryState>,
    )

    await expectNoAccessibilityViolations(container)
  })
})
