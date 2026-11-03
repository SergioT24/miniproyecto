/**
 * Tipos y datos de ejemplo de los registros de presupuesto.
 * Los usan el formulario (RecordForm) y la grilla (RecordsGrid).
 */

export const estadosPresupuesto = ["REALIZADO", "PRE PRESUPUESTO", "AJUSTE"] as const

export type EstadoPresupuesto = (typeof estadosPresupuesto)[number]

export type Presupuesto = {
    id: string
    monto: number
    detalle: string
    estado: EstadoPresupuesto
}

/** Lo que carga el usuario en el formulario (el id lo asigna la grilla). */
export type PresupuestoValores = Omit<Presupuesto, "id">

export const presupuestosDePrueba: Presupuesto[] = [
    { id: "1", monto: 150000, detalle: "Compra de elementos médicos", estado: "REALIZADO" },
    { id: "2", monto: 110000, detalle: "Alquiler de sala de capacitación", estado: "PRE PRESUPUESTO" },
    { id: "3", monto: 275000, detalle: "Impresión de material de difusión", estado: "AJUSTE" },
]
