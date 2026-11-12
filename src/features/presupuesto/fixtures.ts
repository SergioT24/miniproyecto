import type { MovimientoRecord } from "@/features/movimientos/types"
import { tipoCambioCclPorMes } from "@/features/parametros/exchange-rates"
import { proyectosSeed } from "@/features/parametros/fixtures"
import { monthRange } from "@/lib/format/dates"
import { roundMoney } from "@/lib/money"
import type {
  EjecucionReal,
  LineaVersionRecord,
  Presupuesto,
  TipoMovimiento,
  VersionProyeccionRecord,
} from "./types"

const proyectoNombrePorId = new Map(
  proyectosSeed.map((proyecto, index) => [
    `proy-${String(index + 1).padStart(3, "0")}`,
    proyecto.nombre,
  ]),
)

export const presupuestosSeed: Presupuesto[] = [
  {
    id: "pres-001",
    anio: 2026,
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    descripcion: "Presupuesto 2026 UNLZ",
    fechaAprobacion: "2025-12-18",
  },
]

export const versionesSeed: VersionProyeccionRecord[] = [
  {
    id: "ver-001",
    presupuestoId: "pres-001",
    nombre: "Original",
    fechaCreacion: "2025-12-15T10:00:00.000Z",
    usuarioCreador: "Sistema",
    esInmutable: true,
    observaciones: "Versión aprobada del presupuesto 2026.",
  },
  {
    id: "ver-002",
    presupuestoId: "pres-001",
    nombre: "Enero",
    fechaCreacion: "2026-01-31T18:00:00.000Z",
    usuarioCreador: "Sistema",
    esInmutable: true,
    observaciones: "Actualización por inflación y primeras reprogramaciones.",
  },
  {
    id: "ver-003",
    presupuestoId: "pres-001",
    nombre: "Marzo",
    fechaCreacion: "2026-03-31T18:00:00.000Z",
    usuarioCreador: "Sistema",
    esInmutable: false,
    observaciones: "Reproyección con el avance del primer trimestre.",
  },
]

const meses = monthRange("2026-01-01", "2026-12-31")
const mesesConEjecucion = new Set(meses.slice(0, 10))

const ajustesVersion = [
  { ingresos: 1, egresos: 1 },
  { ingresos: 1.012, egresos: 1.028 },
  { ingresos: 1.021, egresos: 1.052 },
] as const

const ajustesProyecto: Record<
  number,
  Record<string, Partial<Record<"ingresos" | "egresos", number>>>
> = {
  1: {
    "Comunicación y campañas": { egresos: 1.08 },
    "Investigación clínica": { ingresos: 1.05 },
  },
  2: {
    "Acompañamiento integral": { ingresos: 0.94 },
    "Operaciones territoriales": { egresos: 0.96 },
    "Comunicación y campañas": { egresos: 1.12 },
    "Investigación clínica": { ingresos: 1.08 },
  },
}

function versionFactor(versionIndex: number, tipo: TipoMovimiento, proyectoNombre: string) {
  const ajuste = ajustesVersion[versionIndex] ?? ajustesVersion[0]
  const base = tipo === "ingreso" ? ajuste.ingresos : ajuste.egresos
  const clave = tipo === "ingreso" ? "ingresos" : "egresos"
  const override = ajustesProyecto[versionIndex]?.[proyectoNombre]?.[clave] ?? 1

  return base * override
}

/** Genera las líneas congeladas de cada versión a partir de los movimientos base. */
export function buildLineasSeed(
  versiones: VersionProyeccionRecord[],
  movimientos: MovimientoRecord[],
): LineaVersionRecord[] {
  const lineas: LineaVersionRecord[] = []
  let counter = 0

  versiones.forEach((version, versionIndex) => {
    movimientos.forEach((movimiento) => {
      counter += 1
      const factor = versionFactor(
        versionIndex,
        movimiento.tipo,
        proyectoNombrePorId.get(movimiento.proyectoId) ?? movimiento.proyectoId,
      )
      const importe = movimiento.importeOriginal * factor
      const importeDolares = movimiento.moneda === "USD" ? roundMoney(importe) : null
      const importePesos =
        importeDolares === null
          ? roundMoney(importe)
          : roundMoney(importeDolares * (tipoCambioCclPorMes[movimiento.fechaProbable] ?? 1))

      lineas.push({
        id: `lin-${String(counter).padStart(5, "0")}`,
        versionId: version.id,
        movimientoId: movimiento.id,
        mesImputacion: movimiento.fechaProbable,
        importePesos,
        importeDolares,
        categoriaId: movimiento.categoriaId,
        proyectoId: movimiento.proyectoId,
        concepto: movimiento.concepto,
        tipo: movimiento.tipo,
        moneda: movimiento.moneda,
      })
    })
  })

  return lineas
}

/** Genera ejecuciones reales de egresos hasta octubre de 2026. */
export function buildEjecucionesSeed(movimientos: MovimientoRecord[]): EjecucionReal[] {
  const egresos = movimientos.filter(
    (movimiento) => movimiento.tipo === "egreso" && mesesConEjecucion.has(movimiento.fechaProbable),
  )

  return egresos.map((movimiento, index) => {
    const variacion = 0.82 + ((index * 13) % 24) / 100

    return {
      id: `eje-${String(index + 1).padStart(4, "0")}`,
      proyectoId: movimiento.proyectoId,
      categoriaId: movimiento.categoriaId,
      moneda: movimiento.moneda,
      mes: movimiento.fechaProbable,
      importeReal: roundMoney(movimiento.importeOriginal * variacion),
      fuente: index % 6 === 0 ? "manual" : "finnegans",
    }
  })
}
