import { RecordsGrid } from "@/components/RecordsGrid"

export function GridPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Grilla con agregar y editar</h1>
            <p className="mt-2 text-muted-foreground">
                Listado de registros: se pueden agregar nuevos y editar los existentes desde un panel lateral.
            </p>

            <div className="mt-6">
                <RecordsGrid />
            </div>
        </div>
    )
}
