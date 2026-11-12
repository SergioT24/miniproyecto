import { type ColumnDef } from "@tanstack/react-table"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@/test/render"
import { expectNoAccessibilityViolations } from "@/test/a11y"
import { DataTable, type DataTableProps } from "./DataTable"

interface Persona {
  id: string
  nombre: string
  area: string
  monto: number
}

const personas: Persona[] = [
  { id: "p1", nombre: "Ana", area: "Salud", monto: 700 },
  { id: "p2", nombre: "Beto", area: "Educación", monto: 200 },
  { id: "p3", nombre: "Carla", area: "Comunicación", monto: 1100 },
  { id: "p4", nombre: "Diego", area: "Operaciones", monto: 400 },
  { id: "p5", nombre: "Elena", area: "Salud", monto: 900 },
  { id: "p6", nombre: "Fabio", area: "Educación", monto: 100 },
  { id: "p7", nombre: "Gabriela", area: "Comunicación", monto: 1200 },
  { id: "p8", nombre: "Hugo", area: "Operaciones", monto: 300 },
  { id: "p9", nombre: "Inés", area: "Salud", monto: 800 },
  { id: "p10", nombre: "Julián", area: "Educación", monto: 500 },
  { id: "p11", nombre: "Kara", area: "Comunicación", monto: 1000 },
  { id: "p12", nombre: "Leo", area: "Operaciones", monto: 600 },
]

const columnas: ColumnDef<Persona, unknown>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "area", header: "Área" },
  {
    accessorKey: "monto",
    header: "Monto",
    meta: { align: "right" },
    cell: ({ getValue }) => <span>{getValue<number>()}</span>,
  },
]

function renderTabla(props: Partial<DataTableProps<Persona>> = {}) {
  return render(
    <DataTable
      label="Personas de prueba"
      data={personas}
      columns={columnas}
      initialPageSize={5}
      {...props}
    />,
  )
}

describe("DataTable", () => {
  it("renderiza la tabla con nombre accesible y la primera página", () => {
    renderTabla()

    expect(screen.getByRole("table", { name: "Personas de prueba" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Nombre/ })).toBeInTheDocument()
    expect(screen.getByText("Ana")).toBeInTheDocument()
    expect(screen.getByText("Elena")).toBeInTheDocument()
    expect(screen.queryByText("Fabio")).not.toBeInTheDocument()
    expect(screen.getByText("Mostrando 1–5 de 12 filas")).toBeInTheDocument()
  })

  it("ordena de forma ascendente y descendente desde el encabezado", async () => {
    const user = userEvent.setup()
    renderTabla()

    const encabezadoMonto = screen.getByRole("columnheader", { name: /Monto/ })
    const botonMonto = within(encabezadoMonto).getByRole("button", { name: /Monto/ })

    await user.click(botonMonto)

    expect(encabezadoMonto).toHaveAttribute("aria-sort", "descending")
    expect(within(screen.getAllByRole("row")[1]).getByText("Gabriela")).toBeInTheDocument()

    await user.click(botonMonto)

    expect(encabezadoMonto).toHaveAttribute("aria-sort", "ascending")
    expect(within(screen.getAllByRole("row")[1]).getByText("Fabio")).toBeInTheDocument()
  })

  it("navega entre páginas y actualiza el resumen", async () => {
    const user = userEvent.setup()
    renderTabla()

    expect(
      screen.getByRole("navigation", { name: "Paginación: Personas de prueba" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }))

    expect(screen.getByText("Mostrando 6–10 de 12 filas")).toBeInTheDocument()
    expect(screen.getByText("Fabio")).toBeInTheDocument()
    expect(screen.queryByText("Ana")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ir a la página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )

    await user.click(screen.getByRole("button", { name: "Ir a la página 3" }))

    expect(screen.getByText("Mostrando 11–12 de 12 filas")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled()
  })

  it("filtra con el buscador y muestra el estado vacío", async () => {
    const user = userEvent.setup()
    renderTabla()

    const buscador = screen.getByRole("searchbox", { name: "Buscar en la tabla" })

    await user.type(buscador, "ana")

    expect(screen.getByText("Ana")).toBeInTheDocument()
    expect(screen.queryByText("Beto")).not.toBeInTheDocument()
    expect(screen.getByText("Mostrando 1–1 de 1 fila")).toBeInTheDocument()

    await user.clear(buscador)
    await user.type(buscador, "zzz")

    expect(screen.getByRole("heading", { name: "No hay datos para mostrar" })).toBeInTheDocument()
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
  })

  it("selecciona filas y todas las filas de la página", async () => {
    const user = userEvent.setup()
    renderTabla({
      enableRowSelection: true,
      getRowId: (row) => row.id,
      selectionLabel: (row) => `Seleccionar a ${row.nombre}`,
    })

    const seleccionarAna = screen.getByRole("checkbox", { name: "Seleccionar a Ana" })
    const seleccionarPagina = screen.getByRole("checkbox", {
      name: "Seleccionar todas las filas de esta página",
    })

    expect(seleccionarAna).toHaveAttribute("aria-checked", "false")

    await user.click(seleccionarAna)

    expect(seleccionarAna).toHaveAttribute("aria-checked", "true")
    expect(seleccionarPagina).toHaveAttribute("aria-checked", "mixed")

    await user.click(seleccionarPagina)

    expect(seleccionarPagina).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("checkbox", { name: "Seleccionar a Beto" })).toHaveAttribute(
      "aria-checked",
      "true",
    )

    await user.click(seleccionarPagina)

    expect(seleccionarPagina).toHaveAttribute("aria-checked", "false")
  })

  it("oculta columnas desde el selector", async () => {
    const user = userEvent.setup()
    renderTabla()

    await user.click(screen.getByRole("button", { name: "Columnas" }))

    const opcionArea = await screen.findByRole("menuitemcheckbox", { name: "Área" })
    await user.click(opcionArea)

    expect(screen.queryByRole("columnheader", { name: /Área/ })).not.toBeInTheDocument()
  })

  it("muestra y anuncia el estado de carga", () => {
    renderTabla({ isLoading: true })

    expect(screen.getByRole("status")).toHaveTextContent("Cargando datos…")
    expect(screen.queryByText("Ana")).not.toBeInTheDocument()
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
  })

  it("muestra el error y permite reintentar", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    renderTabla({
      isError: true,
      errorMessage: "Falló la consulta de personas.",
      onRetry,
    })

    const alerta = screen.getByRole("alert")
    expect(alerta).toHaveTextContent("No se pudieron cargar los datos")
    expect(alerta).toHaveTextContent("Falló la consulta de personas.")

    await user.click(screen.getByRole("button", { name: "Reintentar" }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("muestra el estado vacío configurable", () => {
    renderTabla({
      data: [],
      emptyTitle: "Sin personas",
      emptyDescription: "Agregá una persona para verla acá.",
    })

    expect(screen.getByRole("heading", { name: "Sin personas" })).toBeInTheDocument()
    expect(screen.getByText("Agregá una persona para verla acá.")).toBeInTheDocument()
  })

  it("respeta la paginación resuelta por el servidor", async () => {
    const user = userEvent.setup()
    const onPaginationChange = vi.fn()

    renderTabla({
      data: personas.slice(0, 5),
      manualPagination: true,
      rowCount: 12,
      pageCount: 3,
      onPaginationChange,
    })

    expect(screen.getByText("Mostrando 1–5 de 12 filas")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ir a la página 3" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }))

    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 5 })
    expect(screen.getByText("Mostrando 6–10 de 12 filas")).toBeInTheDocument()
  })

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = renderTabla({
      enableRowSelection: true,
      getRowId: (row) => row.id,
      selectionLabel: (row) => `Seleccionar a ${row.nombre}`,
    })

    await expectNoAccessibilityViolations(container)
  })

  it("no tiene violaciones de accesibilidad en el estado vacío", async () => {
    const { container } = renderTabla({ data: [] })

    await expectNoAccessibilityViolations(container)
  })
})
