import type { ResumenTablero } from "./types"

/** Genera los últimos 12 meses en formato "MMM YYYY" (es-AR). */
function generarMeses(): string[] {
  const meses: string[] = []
  const ahora = new Date(2026, 9, 1) // octubre 2026 como referencia
  for (let i = 11; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    meses.push(
      fecha.toLocaleDateString("es-AR", { month: "short", year: "numeric" }),
    )
  }
  return meses
}

const meses = generarMeses()

// Evolución mensual: saldos con variaciones realistas
const evolucionBase = [
  { ingresos: 4_200_000, egresos: 3_800_000 },
  { ingresos: 4_500_000, egresos: 4_000_000 },
  { ingresos: 3_900_000, egresos: 3_600_000 },
  { ingresos: 5_100_000, egresos: 4_200_000 },
  { ingresos: 4_800_000, egresos: 4_600_000 },
  { ingresos: 5_300_000, egresos: 4_400_000 },
  { ingresos: 4_700_000, egresos: 4_800_000 },
  { ingresos: 5_600_000, egresos: 4_900_000 },
  { ingresos: 6_100_000, egresos: 5_200_000 },
  { ingresos: 5_800_000, egresos: 5_500_000 },
  { ingresos: 6_400_000, egresos: 5_700_000 },
  { ingresos: 7_200_000, egresos: 6_100_000 },
]

export const resumenTableroFixture: ResumenTablero = {
  kpis: [
    {
      id: "ingresos",
      label: "Ingresos del período",
      valor: 7_200_000,
      variacion: 12.5,
      moneda: "ARS",
      tendencia: "sube",
    },
    {
      id: "egresos",
      label: "Egresos del período",
      valor: 6_100_000,
      variacion: 7.0,
      moneda: "ARS",
      tendencia: "baja",
    },
    {
      id: "resultado",
      label: "Resultado",
      valor: 1_100_000,
      variacion: 38.0,
      moneda: "ARS",
      tendencia: "sube",
    },
    {
      id: "saldo",
      label: "Saldo disponible",
      valor: 3_450_000,
      variacion: 5.2,
      moneda: "ARS",
      tendencia: "neutro",
    },
  ],
  evolucionMensual: evolucionBase.map((item, index) => ({
    mes: meses[index],
    ingresos: item.ingresos,
    egresos: item.egresos,
    resultado: item.ingresos - item.egresos,
  })),
}
