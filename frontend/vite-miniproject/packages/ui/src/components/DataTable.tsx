import {   ColumnDef, useReactTable,   getCoreRowModel,   flexRender } from "@tanstack/react-table";

// 1. Tipado estricto de los datos
export type Presupuesto = {
    id: string;
    monto: number;
    detalle: string;
    estado: string;
};

// 2. Datos de prueba iniciales
const datosDePrueba: Presupuesto[] = [
    { id: "1", monto: 150000, detalle: "Compra de elementos médicos", estado: "REALIZADO" },
    { id: "2", monto: 110000, detalle: "Compra de elementos médicos", estado: "PRE PRESUPUESTO" },
    { id: "3", monto: 275000, detalle: "Compra de elementos médicos", estado: "AJUSTE" }        
];

// 3. Definición de columnas tipadas específicamente para Presupuesto
export const columnas: ColumnDef<Presupuesto>[] = [
    { 
        accessorKey: "id", 
        header: "ID" 
    },
    { 
        accessorKey: "monto", 
        header: "Monto" 
    },
    { 
        accessorKey: "detalle", 
        header: "Detalle" 
    },
    { 
        accessorKey: "estado", 
        header: "Estado" 
    },
];

// 4. Props del componente
type DataTableProps = {
    data?: Presupuesto[];
};

// 5. Componente Principal DataTable
export default function DataTable({ data = datosDePrueba }: DataTableProps) {
    
    // Inicialización del hook con el genérico <Presupuesto> para que TypeScript sepa qué maneja
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border shadow-sm bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
                
                {/* Cabecera procesada por TanStack */}
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b bg-gray-50 text-gray-700">
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="p-3 font-semibold">
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
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-b hover:bg-gray-50 text-gray-600">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="p-3">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}