import { useId, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    estadosPresupuesto,
    type EstadoPresupuesto,
    type PresupuestoValores,
} from "@/lib/presupuesto"

interface RecordFormProps {
    /** Si se pasan, el formulario arranca cargado (modo edición). */
    initialValues?: PresupuestoValores
    submitLabel?: string
    onSubmit: (valores: PresupuestoValores) => void
    onCancel?: () => void
}

type Campo = "detalle" | "monto" | "estado"
type Errores = Partial<Record<Campo, string>>

const camposEnOrden: Campo[] = ["detalle", "monto", "estado"]

// Estilo del <select> nativo, igual al de Input
const claseSelect =
    "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 [&>option]:bg-popover [&>option]:text-popover-foreground"

function validar(detalle: string, monto: string, estado: string): Errores {
    const errores: Errores = {}

    if (!detalle.trim()) {
        errores.detalle = "Ingresá un detalle."
    } else if (detalle.trim().length > 120) {
        errores.detalle = "El detalle no puede superar los 120 caracteres."
    }

    if (monto.trim() === "") {
        errores.monto = "Ingresá un monto."
    } else if (!Number.isFinite(Number(monto)) || Number(monto) <= 0) {
        errores.monto = "El monto debe ser mayor a 0."
    }

    if (!estadosPresupuesto.includes(estado as EstadoPresupuesto)) {
        errores.estado = "Elegí un estado."
    }

    return errores
}

function FormField({
    id,
    label,
    error,
    children,
}: {
    id: string
    label: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    )
}

/**
 * Formulario de un registro de presupuesto (detalle, monto y estado).
 * Sirve para agregar (sin initialValues) y para editar (con initialValues).
 * Valida al enviar y lleva el foco al primer campo con error.
 */
export function RecordForm({
    initialValues,
    submitLabel = "Guardar",
    onSubmit,
    onCancel,
}: RecordFormProps) {
    const uid = useId()
    const [detalle, setDetalle] = useState(initialValues?.detalle ?? "")
    const [monto, setMonto] = useState(initialValues ? String(initialValues.monto) : "")
    const [estado, setEstado] = useState<string>(initialValues?.estado ?? "")
    const [errores, setErrores] = useState<Errores>({})

    const id = (campo: Campo) => `${uid}-${campo}`
    const aria = (campo: Campo) => ({
        "aria-invalid": errores[campo] ? true : undefined,
        "aria-describedby": errores[campo] ? `${id(campo)}-error` : undefined,
    })
    const limpiarError = (campo: Campo) =>
        setErrores((prev) => ({ ...prev, [campo]: undefined }))

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const nuevos = validar(detalle, monto, estado)
        setErrores(nuevos)

        const primero = camposEnOrden.find((campo) => nuevos[campo])
        if (primero) {
            const el = e.currentTarget.elements.namedItem(primero)
            if (el instanceof HTMLElement) el.focus()
            return
        }

        onSubmit({
            detalle: detalle.trim(),
            monto: Number(monto),
            estado: estado as EstadoPresupuesto,
        })
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField id={id("detalle")} label="Detalle" error={errores.detalle}>
                <Input
                    id={id("detalle")}
                    name="detalle"
                    value={detalle}
                    onChange={(e) => {
                        setDetalle(e.target.value)
                        limpiarError("detalle")
                    }}
                    placeholder="Ej: Compra de insumos"
                    {...aria("detalle")}
                />
            </FormField>

            <FormField id={id("monto")} label="Monto (ARS)" error={errores.monto}>
                <Input
                    id={id("monto")}
                    name="monto"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={monto}
                    onChange={(e) => {
                        setMonto(e.target.value)
                        limpiarError("monto")
                    }}
                    placeholder="0"
                    {...aria("monto")}
                />
            </FormField>

            <FormField id={id("estado")} label="Estado" error={errores.estado}>
                <select
                    id={id("estado")}
                    name="estado"
                    value={estado}
                    onChange={(e) => {
                        setEstado(e.target.value)
                        limpiarError("estado")
                    }}
                    className={claseSelect}
                    {...aria("estado")}
                >
                    <option value="">Seleccioná un estado</option>
                    {estadosPresupuesto.map((opcion) => (
                        <option key={opcion} value={opcion}>
                            {opcion}
                        </option>
                    ))}
                </select>
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit">{submitLabel}</Button>
            </div>
        </form>
    )
}
