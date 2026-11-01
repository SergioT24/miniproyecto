import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/EmptyState"

export function EmptyStatePage() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Empty states</h1>
            <p className="mt-2 text-muted-foreground">
                Mensaje que se muestra cuando una sección o listado todavía no tiene datos.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {/* Con acción: invita a cargar el primer dato */}
                <EmptyState
                    title="Todavía no hay movimientos"
                    description="Cuando cargues el primero, lo vas a ver acá."
                    action={<Button>Agregar movimiento</Button>}
                />

                {/* Sin acción y con ícono propio: resultado de una búsqueda */}
                <EmptyState
                    icon={SearchX}
                    title="Sin resultados"
                    description="Probá con otros filtros o revisá lo que escribiste."
                />
            </div>
        </div>
    )
}
