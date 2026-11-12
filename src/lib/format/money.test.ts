import { describe, expect, it } from "vitest"
import { formatARS, formatCurrency, formatPercent, formatUSD, parseMoney } from "./money"

describe("formatCurrency", () => {
  it("formatea pesos argentinos con dos decimales", () => {
    expect(formatARS(1234567.5)).toMatch(/\$\s*1\.234\.567,50/)
  })

  it("formatea dólares sin mezclar el símbolo de pesos", () => {
    expect(formatUSD(1250)).toMatch(/US\$\s*1\.250,00/)
  })

  it("permite elegir la cantidad de decimales", () => {
    expect(formatCurrency(1500.75, { maximumFractionDigits: 0 })).toMatch(/\$\s*1\.501/)
  })
})

describe("parseMoney", () => {
  it("interpreta el formato es-AR", () => {
    expect(parseMoney("$ 1.234.567,89")).toBe(1234567.89)
  })

  it("interpreta separadores anglosajones", () => {
    expect(parseMoney("1,234.56")).toBe(1234.56)
  })

  it("interpreta un punto como separador de miles cuando corresponde", () => {
    expect(parseMoney("1.234")).toBe(1234)
  })

  it("acepta negativos y paréntesis contables", () => {
    expect(parseMoney("-1.500,25")).toBe(-1500.25)
    expect(parseMoney("(1.500,25)")).toBe(-1500.25)
  })

  it("devuelve null si no hay un número", () => {
    expect(parseMoney("")).toBeNull()
    expect(parseMoney("sin dato")).toBeNull()
  })
})

describe("formatPercent", () => {
  it("recibe fracciones", () => {
    expect(formatPercent(0.125)).toMatch(/12,5\s*%/)
  })

  it("permite fijar los decimales", () => {
    expect(formatPercent(0.1, { maximumFractionDigits: 0 })).toMatch(/10\s*%/)
  })
})
