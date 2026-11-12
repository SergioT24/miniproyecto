import { startOfMonth } from "date-fns"
import { tipoCambioCclPorMes } from "@/features/parametros/exchange-rates"
import { parseDate, toIsoDate } from "@/lib/format/dates"
import { roundMoney, sumMoney } from "@/lib/money"
import type {
  EstadoCobroPago,
  Movimiento,
  MovimientoRecord,
  ResumenMovimientos,
  TipoMovimiento,
} from "./types"

type MovimientoImporte = Pick<MovimientoRecord, "moneda" | "importeOriginal" | "fechaProbable">

function mesKey(fechaProbable: string) {
  const fecha = parseDate(fechaProbable)
  return fecha ? toIsoDate(startOfMonth(fecha)) : ""
}

/**
 * Importe del movimiento expresado en pesos. Los movimientos en dólares se
 * convierten con el CCL del mes de la fecha probable.
 */
export function movimientoEnPesos(movimiento: MovimientoImporte): number {
  if (movimiento.moneda === "ARS") {
    return movimiento.importeOriginal
  }

  const tipoCambio = tipoCambioCclPorMes[mesKey(movimiento.fechaProbable)] ?? 1
  return roundMoney(movimiento.importeOriginal * tipoCambio)
}

export function esPendiente(estado: EstadoCobroPago): boolean {
  return estado === "previsto" || estado === "vencido"
}

/** Totales del conjunto de movimientos que recibe la pantalla. */
export function summarizeMovimientos(movimientos: Movimiento[]): ResumenMovimientos {
  const ingresos: number[] = []
  const egresos: number[] = []
  const pendientesIngresos: number[] = []
  const pendientesEgresos: number[] = []
  let pendientesCantidad = 0
  let vencidos = 0

  for (const movimiento of movimientos) {
    const importe = movimientoEnPesos(movimiento)

    if (movimiento.tipo === "ingreso") {
      ingresos.push(importe)
    } else {
      egresos.push(importe)
    }

    if (esPendiente(movimiento.estadoCobroPago)) {
      pendientesCantidad += 1

      if (movimiento.tipo === "ingreso") {
        pendientesIngresos.push(importe)
      } else {
        pendientesEgresos.push(importe)
      }

      if (movimiento.estadoCobroPago === "vencido") {
        vencidos += 1
      }
    }
  }

  return {
    ingresos: sumMoney(ingresos),
    egresos: sumMoney(egresos),
    resultado: sumMoney([...ingresos, ...egresos.map((importe) => -importe)]),
    pendientes: {
      cantidad: pendientesCantidad,
      ingresos: sumMoney(pendientesIngresos),
      egresos: sumMoney(pendientesEgresos),
      vencidos,
    },
  }
}

const tipoLabels: Record<TipoMovimiento, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
}

const estadoLabels: Record<EstadoCobroPago, string> = {
  previsto: "Previsto",
  cobrado: "Cobrado",
  pagado: "Pagado",
  vencido: "Vencido",
}

export function tipoMovimientoLabel(tipo: TipoMovimiento): string {
  return tipoLabels[tipo]
}

export function estadoCobroPagoLabel(estado: EstadoCobroPago): string {
  return estadoLabels[estado]
}
