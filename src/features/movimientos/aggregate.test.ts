import { describe, expect, it } from "vitest"
import { esPendiente, estadoCobroPagoLabel, movimientoEnPesos, summarizeMovimientos } from "./aggregate"
import type { Movimiento } from "./types"

const base: Movimiento = {
  id: "mov-0001",
  tipo: "ingreso",
  concepto: "Convenio de prueba",
  proyectoId: "proy-002",
  proyectoNombre: "Prevención y testeo",
  categoriaId: "cat-013",
  categoriaNombre: "Convenios y subsidios",
  moneda: "ARS",
  importeOriginal: 1000,
  fechaPrevistaOriginal: null,
  fechaProbable: "2026-01-01",
  gradoCerteza: "Alta",
  estadoCobroPago: "cobrado",
  ingresoDetalle: null,
  egresoDetalle: null,
}

describe("movimientoEnPesos", () => {
  it("convierte los dólares con el CCL del mes de la fecha probable", () => {
    expect(
      movimientoEnPesos({
        moneda: "USD",
        importeOriginal: 100,
        fechaProbable: "2026-03-15",
      }),
    ).toBe(126_840)
  })

  it("deja los importes en pesos sin cambios", () => {
    expect(
      movimientoEnPesos({ moneda: "ARS", importeOriginal: 1500, fechaProbable: "2026-03-01" }),
    ).toBe(1500)
  })
})

describe("summarizeMovimientos", () => {
  it("calcula ingresos, egresos, resultado y pendientes", () => {
    const resumen = summarizeMovimientos([
      base,
      { ...base, id: "mov-0002", importeOriginal: 500, estadoCobroPago: "previsto" },
      {
        ...base,
        id: "mov-0003",
        tipo: "egreso",
        moneda: "USD",
        importeOriginal: 100,
        fechaProbable: "2026-03-01",
        estadoCobroPago: "pagado",
      },
      {
        ...base,
        id: "mov-0004",
        tipo: "egreso",
        importeOriginal: 200,
        estadoCobroPago: "vencido",
      },
    ])

    expect(resumen.ingresos).toBe(1500)
    expect(resumen.egresos).toBe(127_040)
    expect(resumen.resultado).toBe(-125_540)
    expect(resumen.pendientes).toEqual({
      cantidad: 2,
      ingresos: 500,
      egresos: 200,
      vencidos: 1,
    })
  })

  it("devuelve ceros cuando no hay movimientos", () => {
    expect(summarizeMovimientos([])).toEqual({
      ingresos: 0,
      egresos: 0,
      resultado: 0,
      pendientes: { cantidad: 0, ingresos: 0, egresos: 0, vencidos: 0 },
    })
  })
})

describe("etiquetas y pendientes", () => {
  it("considera pendientes a los previstos y vencidos", () => {
    expect(esPendiente("previsto")).toBe(true)
    expect(esPendiente("vencido")).toBe(true)
    expect(esPendiente("cobrado")).toBe(false)
    expect(esPendiente("pagado")).toBe(false)
  })

  it("traduce los estados a etiquetas legibles", () => {
    expect(estadoCobroPagoLabel("cobrado")).toBe("Cobrado")
    expect(estadoCobroPagoLabel("vencido")).toBe("Vencido")
  })
})
