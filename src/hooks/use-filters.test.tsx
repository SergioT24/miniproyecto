import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { renderWithProviders as render, screen } from "@/test/render"
import { useFilters } from "./use-filters"

const filtrosSchema = z.object({
  q: z.string().optional().default(""),
  pagina: z.coerce.number().int().min(1).optional().default(1),
  activo: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((value) => value === "true"),
})

type Filtros = z.infer<typeof filtrosSchema>

const defaults: Filtros = { q: "", pagina: 1, activo: false }

function Probe() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(filtrosSchema, defaults)

  return (
    <div>
      <p>q:{filters.q || "vacío"}</p>
      <p>página:{filters.pagina}</p>
      <p>activo:{String(filters.activo)}</p>
      <p>activos:{String(hasActiveFilters)}</p>
      <button type="button" onClick={() => setFilter("q", "testeos")}>
        Buscar testeos
      </button>
      <button type="button" onClick={() => setFilter("pagina", 3)}>
        Ir a página 3
      </button>
      <button type="button" onClick={() => setFilter("activo", true)}>
        Activar
      </button>
      <button type="button" onClick={resetFilters}>
        Limpiar
      </button>
    </div>
  )
}

describe("useFilters", () => {
  it("lee los filtros de la URL y los valida", () => {
    render(<Probe />, { route: "/?q=VIH&pagina=2&activo=true" })

    expect(screen.getByText("q:VIH")).toBeInTheDocument()
    expect(screen.getByText("página:2")).toBeInTheDocument()
    expect(screen.getByText("activo:true")).toBeInTheDocument()
    expect(screen.getByText("activos:true")).toBeInTheDocument()
  })

  it("usa los defaults cuando la URL tiene valores inválidos", () => {
    render(<Probe />, { route: "/?pagina=0&activo=quizas" })

    expect(screen.getByText("página:1")).toBeInTheDocument()
    expect(screen.getByText("activo:false")).toBeInTheDocument()
    expect(screen.getByText("activos:false")).toBeInTheDocument()
  })

  it("actualiza un filtro y lo refleja en la URL", async () => {
    const user = userEvent.setup()
    render(<Probe />)

    await user.click(screen.getByRole("button", { name: "Buscar testeos" }))
    expect(screen.getByText("q:testeos")).toBeInTheDocument()
    expect(screen.getByText("activos:true")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ir a página 3" }))
    expect(screen.getByText("página:3")).toBeInTheDocument()
  })

  it("limpia todos los filtros", async () => {
    const user = userEvent.setup()
    render(<Probe />, { route: "/?q=VIH&pagina=2" })

    await user.click(screen.getByRole("button", { name: "Limpiar" }))

    expect(screen.getByText("q:vacío")).toBeInTheDocument()
    expect(screen.getByText("página:1")).toBeInTheDocument()
    expect(screen.getByText("activos:false")).toBeInTheDocument()
  })
})
