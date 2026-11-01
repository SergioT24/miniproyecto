import { useState } from "react"
import { RecordForm } from "@/components/RecordForm"
import { type PresupuestoValores } from "@/lib/presupuesto"

export function FormPage() {
    const [enviado, setEnviado] = useState<PresupuestoValores | null>(null)

    return (
        <div>
            <h1 className="text-2xl font-bold">Formulario</h1>
            <p className="mt-2 text-muted-foreground">
                Formulario con validación para cargar un registro. Los errores se muestran al enviar.
            </p>

            <div className="mt-6 max-w-md rounded-xl border bg-card p-5">
                <RecordForm submitLabel="Guardar registro" onSubmit={setEnviado} />
            </div>

            <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
                {enviado
                    ? `Último envío: ${enviado.detalle} · $ ${enviado.monto} · ${enviado.estado}`
                    : "Todavía no enviaste nada."}
            </p>
        </div>
    )
}
