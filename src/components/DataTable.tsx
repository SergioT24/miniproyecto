import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
  type VisibilityState,
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

// Componente Principal DataTable
export default function DataTable({ data = datosDePrueba }: DataTableProps) {
//Estados para manejar los filtros
const [columnFilters,setColumnFilters] = useState<ColumnFiltersState>([])
const [columnOrder, setColumnOrder] = useState<string[]>(columnas.map((col) => (col as any).accessorKey || (col as any).id))
const [globalFilter,setGlobalFilter] = useState("")
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

  return (
    <div className= "space-y-4">
      <div className="flex items-center justify-between py-4">
        <input 
        placeholder="Búsqueda de tabla" 
        value={globalFilter ?? ""}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm px-3 py-2 border rounded-md text-sm bg-background"
        />

      <DropdownMenu>
        <DropdownMenuTrigger as Child>
          <Button variant="outline" size="sm">
            Columnas visibles ▾ 
          </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) =>
            {
              return (
                <DropdownMenuCheckboxItem key={column.id}
                className="capitalize cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )  
            })}
            </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="w-full overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Listado de presupuestos</caption>

        {/* Cabecera procesada por TanStack */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-muted/50 text-muted-foreground">
            {headerGroup.headers.map((header) => (
            <th 
            key={header.id}
            scope="col"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", header.column.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault()
                const draggedColumnId = e.dataTransfer.getData("text/plain")
                const targetColumnId = header.column.id

                if(draggedColumnId !== targetColumnId) {
                  const newOrder = [...columnOrder]
                  const draggedIdx = newOrder.indexOf(draggedColumnId)
                  const targetIdx = newOrder.indexOf(targetColumnId)
                
                  //reordenamiento
                  newOrder.splice(draggedIdx,1)
                  newOrder.splice(targetIdx,0,draggedColumnId)
                  setColumnOrder(newOrder)

                }
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
