import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useState } from "react"
import { columnas, datosDePrueba, type Presupuesto } from "./data-table/columns"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export type { Presupuesto } from "./data-table/columns"

// Props del componente
type DataTableProps = {
  data?: Presupuesto[]
}

function getColumnId(col: ColumnDef<Presupuesto>): string {
  if ("accessorKey" in col && typeof col.accessorKey === "string") {
    return col.accessorKey
  }
  return col.id ?? ""
}

function getColumnLabel(column: ColumnDef<Presupuesto>): string {
  return typeof column.header === "string" ? column.header : getColumnId(column)
}

// Componente Principal DataTable
export default function DataTable({ data = datosDePrueba }: DataTableProps) {
  //Estados para manejar los filtros
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnOrder, setColumnOrder] = useState<string[]>(columnas.map(getColumnId))
  const [globalFilter, setGlobalFilter] = useState("")
  const [anuncio, setAnuncio] = useState("")

  const table = useReactTable({
    data,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    state: {
      columnFilters,
      globalFilter,
      columnOrder,
    },
  })

  /** Mueve la columna `id` a la posición `destino` dentro del orden actual. */
  function moverColumna(id: string, destino: number) {
    setColumnOrder((ordenActual) => {
      const origen = ordenActual.indexOf(id)
      if (
        origen === -1 ||
        destino < 0 ||
        destino >= ordenActual.length ||
        origen === destino
      ) {
        return ordenActual
      }

      const nuevoOrden = [...ordenActual]
      nuevoOrden.splice(origen, 1)
      nuevoOrden.splice(destino, 0, id)
      return nuevoOrden
    })
  }

  const filas = table.getRowModel().rows.length

  return (
    <div className="space-y-4">
      <p id="instrucciones-reordenar" className="sr-only">
        Para reordenar una columna con el teclado, enfocá su encabezado y usá
        Shift + flecha izquierda o Shift + flecha derecha.
      </p>

      {/* Anuncios para lectores de pantalla */}
      <div role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {filas === 0
          ? "No hay presupuestos para mostrar."
          : `${filas} ${filas === 1 ? "presupuesto encontrado" : "presupuestos encontrados"}.`}
      </div>

      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          placeholder="Búsqueda de tabla"
          aria-label="Buscar en la tabla"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background sm:max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            Columnas visibles ▾
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize cursor-pointer"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Listado de presupuestos</caption>

          {/* Cabecera procesada por TanStack */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b bg-muted/50 text-muted-foreground"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    draggable
                    tabIndex={0}
                    title="Arrastrar para reordenar la columna"
                    aria-describedby="instrucciones-reordenar"
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", header.column.id)
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const draggedColumnId =
                        event.dataTransfer.getData("text/plain")
                      const targetColumnId = header.column.id

                      if (draggedColumnId !== targetColumnId) {
                        moverColumna(
                          draggedColumnId,
                          columnOrder.indexOf(targetColumnId)
                        )
                      }
                    }}
                    onKeyDown={(event) => {
                      if (!event.shiftKey) return
                      if (
                        event.key !== "ArrowLeft" &&
                        event.key !== "ArrowRight"
                      ) {
                        return
                      }

                      event.preventDefault()
                      const origen = columnOrder.indexOf(header.column.id)
                      const destino =
                        origen + (event.key === "ArrowLeft" ? -1 : 1)

                      if (destino < 0 || destino >= columnOrder.length) {
                        setAnuncio(
                          "La columna ya está en el extremo de la tabla."
                        )
                        return
                      }

                      moverColumna(header.column.id, destino)
                      setAnuncio(
                        `Columna ${getColumnLabel(header.column.columnDef)} movida a la posición ${destino + 1} de ${columnOrder.length}.`
                      )
                    }}
                    className="px-4 py-3 font-medium whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Cuerpo de la tabla procesado por TanStack */}
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No hay presupuesto para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
