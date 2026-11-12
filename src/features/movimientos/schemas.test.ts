import { describe, expect, it } from "vitest"
import {
  createMovimientoSchema,
  movimientoToInput,
  type MovimientoFormValues,
  type PeriodoMovimiento,
} from "./schemas"

const periodo: PeriodoMovimiento = {
  fechaInicio: "2026-01-01",
  fechaFin: "2026-12-31",
}

const schema = createMovimientoSchema(periodo)

const validValues: MovimientoFormValues = {
  tipo: "ingreso",
  concepto: "  Donación de prueba  ",
  proyectoId: "proy-001",
  categoriaId: "cat-014",
  moneda: "ARS",
  importeOriginal: 1500,
  fechaProbable: new Date(2026, 2, 15),
  fechaPrevistaOriginal: null,
  gradoCerteza: "Alta",
  estadoCobroPago: "previsto",
  cuentaDestino: "  Cuenta corriente  ",
  condicionCobro: "",
  proveedorDestinatario: "",
  cuentaOrigen: "",
  tipoGasto: "",
}

describe("createMovimientoSchema", () => {
  it("valida un movimiento completo y normaliza el concepto", () => {
    const parsed = schema.safeParse(validValues)

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.concepto).toBe("Donación de prueba")
      expect(parsed.data.cuentaDestino).toBe("Cuenta corriente")
    }
  })

  it("rechaza una fecha probable fuera del período", () => {
    const parsed = schema.safeParse({
      ...validValues,
      fechaProbable: new Date(2027, 0, 15),
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toContain("La fecha debe estar entre")
    }
  })

  it("rechaza estados incompatibles con el tipo", () => {
    const parsed = schema.safeParse({ ...validValues, estadoCobroPago: "pagado" })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Un ingreso no puede estar pagado.")
    }
  })
})

describe("movimientoToInput", () => {
  it("convierte fechas y detalles al contrato de la API", () => {
    const input = movimientoToInput(validValues)

    expect(input).toMatchObject({
      concepto: "Donación de prueba",
      fechaProbable: "2026-03-15",
      fechaPrevistaOriginal: null,
      ingresoDetalle: { cuentaDestino: "Cuenta corriente", condicionCobro: null },
      egresoDetalle: null,
    })
  })

  it("arma el detalle de egreso y descarta el de ingreso", () => {
    const input = movimientoToInput({
      ...validValues,
      tipo: "egreso",
      estadoCobroPago: "pagado",
      proveedorDestinatario: "Proveedor S.A.",
      cuentaOrigen: "Caja chica",
      tipoGasto: "Operativo",
    })

    expect(input.ingresoDetalle).toBeNull()
    expect(input.egresoDetalle).toEqual({
      proveedorDestinatario: "Proveedor S.A.",
      cuentaOrigen: "Caja chica",
      tipoGasto: "Operativo",
    })
  })
})
