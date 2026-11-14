export interface KpiTablero {
  id: string
  label: string
  valor: number
  variacion?: number
  moneda?: string
  tendencia?: "sube" | "baja" | "neutro"
}

export interface EvolucionMensual {
  mes: string
  ingresos: number
  egresos: number
  resultado: number
}

export interface ResumenTablero {
  kpis: KpiTablero[]
  evolucionMensual: EvolucionMensual[]
}
