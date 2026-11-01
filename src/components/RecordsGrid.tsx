import { useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { EmptyState } from "@/components/EmptyState"
import { RecordForm } from "@/components/RecordForm"
import {
    presupuestosDePrueba,
    type Presupuesto,
    type PresupuestoValores,
} from "@/lib/presupuesto"

interface RecordsGridProps {
    /** Registros iniciales de la grilla. */
    data?: Presupuesto[]
}

// Montos en pesos argentinos, ej: "$ 150.000"
const formatoPesos = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
})

/**
 * Grilla de registros con alta y edición.
 * "Agregar registro" y el botón de cada fila abren el mismo formulario
 * (RecordForm) en un panel lateral: vacío para agregar, cargado para editar.
 */
export function RecordsGrid({ data = presupuestosDePrueba }: RecordsGridProps) {
    const [registros, setRegistros] = useState<Presupuesto[]>(data)
    const [open, setOpen] = useState(false)
    // null = se está agregando; un registro = se está editando
    const [editando, setEditando] = useState<Presupuesto | null>(null)

    function abrirAgregar() {
        setEditando(null)
        setOpen(true)
    }

    function abrirEditar(registro: Presupuesto) {
        setEditando(registro)
        setOpen(true)
    }

    function guardar(valores: PresupuestoValores) {
        if (editando) {
            setRegistros((prev) =>
                prev.map((r) => (r.id === editando.id ? { ...r, ...valores } : r))
            )
        } else {
            setRegistros((prev) => [...prev, { id: String(Date.now()), ...valores }])
        }
        setOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    {registros.length} {registros.length === 1 ? "registro" : "registros"}
                </p>
                <Button onClick={abrirAgregar}>
                    <Plus />
                    Agregar registro
                </Button>
            </div>

            {registros.length === 0 ? (
                <EmptyState
                    title="Todavía no hay registros"
                    description="Agregá el primero para verlo en la grilla."
                    action={<Button onClick={abrirAgregar}>Agregar registro</Button>}
                />
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-card text-card-foreground">
                    <table className="w-full text-sm">
                        <caption className="sr-only">Registros de presupuesto</caption>
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th scope="col" className="px-4 py-3 font-medium">Detalle</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Monto</th>
                                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.map((registro) => (
                                <tr key={registro.id} className="border-b last:border-0">
                                    <td className="px-4 py-3">{registro.detalle}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {formatoPesos.format(registro.monto)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                            {registro.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Editar ${registro.detalle}`}
                                            onClick={() => abrirEditar(registro)}
                                        >
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editando ? "Editar registro" : "Agregar registro"}</SheetTitle>
                        <SheetDescription>
                            {editando
                                ? "Modificá los datos y guardá los cambios."
                                : "Completá los datos del nuevo registro."}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-4">
                        {/* key: al cambiar de registro el formulario se reinicia con sus valores */}
                        <RecordForm
                            key={editando?.id ?? "nuevo"}
                            initialValues={
                                editando
                                    ? {
                                          detalle: editando.detalle,
                                          monto: editando.monto,
                                          estado: editando.estado,
                                      }
                                    : undefined
                            }
                            submitLabel={editando ? "Guardar cambios" : "Agregar"}
                            onSubmit={guardar}
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
