import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ConfirmDialog"

export function ModalPage() {
    const [open, setOpen] = useState(false)
    const [resultado, setResultado] = useState("Todavía no confirmaste nada.")

    return (
        <div>
            <h1 className="text-2xl font-bold">Modal de confirmación</h1>
            <p className="mt-2 text-muted-foreground">
                Ventana que pide confirmar una acción importante antes de hacerla.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button variant="destructive" onClick={() => setOpen(true)}>
                    Eliminar movimiento
                </Button>
                <p role="status" className="text-sm text-muted-foreground">
                    {resultado}
                </p>
            </div>

            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="¿Eliminar movimiento?"
                description="Se perderán todas las proyecciones cargadas en él."
                confirmLabel="Eliminar"
                destructive
                onConfirm={() => setResultado("Movimiento eliminado.")}
            />
        </div>
    )
}