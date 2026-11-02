import DataTable from "@/components/DataTable"

export function DataTablePage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight"> Listado de presupuesto</h1>
                <p className="text-sm text-muted-foreground">
                    Gestión y visualización de los movimientos registrados
                </p>
            </div>


            {/*Renderización del componente de la tabla*/}
            <DataTable />
        </div>
    )
}