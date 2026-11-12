import { describe, expect, it } from "vitest"
import { formatDate, formatDateTime, formatMonth, monthStart, parseDate, toIsoDate } from "./dates"

describe("parseDate", () => {
  it("interpreta fechas ISO", () => {
    expect(parseDate("2026-03-05")?.getFullYear()).toBe(2026)
    expect(parseDate("2026-03-05")?.getMonth()).toBe(2)
  })

  it("interpreta fechas escritas en es-AR", () => {
    expect(parseDate("05/03/2026")?.getDate()).toBe(5)
  })

  it("devuelve null para textos inválidos", () => {
    expect(parseDate("no es una fecha")).toBeNull()
  })
})

describe("formatDate", () => {
  it("formatea una fecha ISO sin corrimiento de zona horaria", () => {
    expect(formatDate("2026-03-05")).toBe("05/03/2026")
  })

  it("usa un guion cuando no hay fecha", () => {
    expect(formatDate(null)).toBe("—")
  })
})

describe("formatMonth", () => {
  it("muestra el mes con nombre completo y año", () => {
    expect(formatMonth("2026-03-01")).toBe("Marzo de 2026")
  })
})

describe("formatDateTime", () => {
  it("incluye hora y minutos", () => {
    expect(formatDateTime("2026-03-05T14:30:00")).toBe("05/03/2026 14:30")
  })
})

describe("toIsoDate", () => {
  it("devuelve el formato que usa la API", () => {
    expect(toIsoDate(new Date(2026, 2, 5))).toBe("2026-03-05")
  })
})

describe("monthStart", () => {
  it("normaliza al primer día del mes", () => {
    const result = monthStart(new Date(2026, 2, 18))
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(2)
  })
})
