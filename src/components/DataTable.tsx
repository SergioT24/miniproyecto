import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { columnas, datosDePrueba, type Presupuesto } from "./data-table/columns"

export type { Presupuesto } from "./data-table/columns"

// Props del componente
type DataTableProps = {
  data?: Presupuesto[]
}

// Componente Principal DataTable
export default function DataTable({ data = datosDePrueba }: DataTableProps) {
  // Inicialización del hook con el genérico <Presupuesto> para que TypeScript sepa qué maneja
  const table = useReactTable({
    data,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
                  className="px-4 py-3 font-medium whitespace-nowrap"
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
                No hay presupuestos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
