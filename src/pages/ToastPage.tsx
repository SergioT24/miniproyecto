import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ToastPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Avisos (toast)</h1>
            <p className="mt-2 text-muted-foreground">
                Notificacion visual breve y emergente que aparece de forma automatica.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => toast.success("Guardado correctamente")}>
                    Éxito
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => toast.error("No se pudo guardar. Revisá los campos.")}
                >
                    Error
                </Button>
                <Button
                    variant="outline"
                    onClick={() => toast.info("Hay saldos de hoy sin cargar")}
                >
                    Información
                </Button>
                <Button
                    variant="outline"
                    onClick={() => toast.warning("Una factura vence mañana")}
                >
                    Advertencia
                </Button>
            </div>
        </div>
    )
}