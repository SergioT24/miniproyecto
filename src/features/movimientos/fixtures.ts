import { addDays } from "date-fns"
import { categoriasSeed, proyectosSeed } from "@/features/parametros/fixtures"
import { gradosCerteza, type CodigoMoneda, type GradoCerteza } from "@/features/parametros/types"
import { monthRange, parseDate, toIsoDate } from "@/lib/format/dates"
import { roundMoney } from "@/lib/money"
import type { EstadoCobroPago, MovimientoRecord, TipoMovimiento } from "./types"

/** Período del presupuesto demo. TODO(api): tomar el período del presupuesto activo. */
export const periodoMovimientos = {
  fechaInicio: "2026-01-01",
  fechaFin: "2026-12-31",
} as const

/** Mes a partir del cual los movimientos siguen pendientes en la demo. */
const mesReferencia = "2026-11-01"

function seedId(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`
}

function proyectoId(nombre: string) {
  const index = proyectosSeed.findIndex((proyecto) => proyecto.nombre === nombre)

  if (index < 0) {
    throw new Error(`El proyecto semilla "${nombre}" no existe en Parámetros.`)
  }

  return seedId("proy", index)
}

function categoriaId(nombre: string) {
  const index = categoriasSeed.findIndex((categoria) => categoria.nombre === nombre)

  if (index < 0) {
    throw new Error(`La categoría semilla "${nombre}" no existe en Parámetros.`)
  }

  return seedId("cat", index)
}

const conceptosEgreso: Record<string, string> = {
  "Sueldos y cargas sociales": "Sueldos y cargas sociales",
  Alquileres: "Alquiler de oficinas",
  Servicios: "Servicios e infraestructura",
  "Insumos de testeo": "Insumos de testeo",
  "Viáticos y movilidad": "Viáticos y traslados",
  "Material de difusión": "Campaña de difusión",
  Capacitaciones: "Talleres y capacitaciones",
  Honorarios: "Honorarios profesionales",
  Consultoría: "Consultoría clínica",
  Equipamiento: "Equipamiento médico",
}

const proveedoresPorCategoria: Record<string, string> = {
  "Sueldos y cargas sociales": "Nómina Fundación Huésped",
  Alquileres: "Consorcio Edificio Norte",
  Servicios: "Servicios Urbanos S.A.",
  "Insumos de testeo": "Diagnóstica Argentina S.R.L.",
  "Viáticos y movilidad": "Movilidad Integral",
  "Material de difusión": "Gráfica del Sur",
  Capacitaciones: "Centro de Formación Abya Yala",
  Honorarios: "Honorarios profesionales",
  Consultoría: "Consultora Sanitaria Andina",
  Equipamiento: "Equipamiento Médico del Plata",
}

function conceptoIngreso(categoria: string, proyecto: string) {
  if (categoria === "Donaciones") {
    return `Donaciones para ${proyecto}`
  }

  if (categoria === "Aportes internacionales") {
    return `Aporte internacional ${proyecto}`
  }

  return `Convenio ${proyecto}`
}

interface EgresoPlan {
  categoria: string
  /** Proporción del egreso mensual total del proyecto. */
  peso: number
}

interface ProyectoPlan {
  proyecto: string
  ingresoCategoria: string
  ingresoBase: number
  monedaIngreso: CodigoMoneda
  egresoBase: number
  monedaEgreso: CodigoMoneda
  egresos: EgresoPlan[]
}

const planes: ProyectoPlan[] = [
  {
    proyecto: "Estructura FH",
    ingresoCategoria: "Aportes internacionales",
    ingresoBase: 34_000_000,
    monedaIngreso: "ARS",
    egresoBase: 52_000_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Sueldos y cargas sociales", peso: 0.58 },
      { categoria: "Alquileres", peso: 0.27 },
      { categoria: "Servicios", peso: 0.15 },
    ],
  },
  {
    proyecto: "Prevención y testeo",
    ingresoCategoria: "Convenios y subsidios",
    ingresoBase: 18_500_000,
    monedaIngreso: "ARS",
    egresoBase: 14_200_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Insumos de testeo", peso: 0.62 },
      { categoria: "Viáticos y movilidad", peso: 0.38 },
    ],
  },
  {
    proyecto: "Educación sexual integral",
    ingresoCategoria: "Convenios y subsidios",
    ingresoBase: 12_800_000,
    monedaIngreso: "ARS",
    egresoBase: 9_600_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Material de difusión", peso: 0.55 },
      { categoria: "Capacitaciones", peso: 0.45 },
    ],
  },
  {
    proyecto: "Acompañamiento integral",
    ingresoCategoria: "Donaciones",
    ingresoBase: 8_400_000,
    monedaIngreso: "ARS",
    egresoBase: 7_100_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Honorarios", peso: 0.6 },
      { categoria: "Viáticos y movilidad", peso: 0.4 },
    ],
  },
  {
    proyecto: "Comunicación y campañas",
    ingresoCategoria: "Donaciones",
    ingresoBase: 6_900_000,
    monedaIngreso: "ARS",
    egresoBase: 6_300_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Material de difusión", peso: 0.7 },
      { categoria: "Servicios", peso: 0.3 },
    ],
  },
  {
    proyecto: "Investigación clínica",
    ingresoCategoria: "Aportes internacionales",
    ingresoBase: 24_000,
    monedaIngreso: "USD",
    egresoBase: 12_000,
    monedaEgreso: "USD",
    egresos: [
      { categoria: "Consultoría", peso: 0.65 },
      { categoria: "Equipamiento", peso: 0.35 },
    ],
  },
  {
    proyecto: "Operaciones territoriales",
    ingresoCategoria: "Convenios y subsidios",
    ingresoBase: 10_200_000,
    monedaIngreso: "ARS",
    egresoBase: 8_800_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Viáticos y movilidad", peso: 0.55 },
      { categoria: "Insumos de testeo", peso: 0.45 },
    ],
  },
  {
    proyecto: "Salud mental",
    ingresoCategoria: "Donaciones",
    ingresoBase: 7_500_000,
    monedaIngreso: "ARS",
    egresoBase: 6_400_000,
    monedaEgreso: "ARS",
    egresos: [
      { categoria: "Honorarios", peso: 0.58 },
      { categoria: "Capacitaciones", peso: 0.42 },
    ],
  },
]

const meses = monthRange(periodoMovimientos.fechaInicio, periodoMovimientos.fechaFin)

function monthlyFactor(monthIndex: number, projectIndex: number, tipo: TipoMovimiento) {
  const seasonal = 1 + 0.05 * Math.sin(((monthIndex + projectIndex) * Math.PI) / 6)
  const trend = 1 + monthIndex * (tipo === "ingreso" ? 0.012 : 0.018)

  return seasonal * trend
}

function estadoCobroPago(index: number, tipo: TipoMovimiento, fechaProbable: string): EstadoCobroPago {
  if (fechaProbable >= mesReferencia) {
    return "previsto"
  }

  if (index % 17 === 0) {
    return "vencido"
  }

  return tipo === "ingreso" ? "cobrado" : "pagado"
}

function fechaPrevistaOriginal(index: number, fechaProbable: string) {
  if (index % 9 === 0) {
    return null
  }

  if (index % 7 === 0) {
    const fecha = parseDate(fechaProbable)
    return fecha ? toIsoDate(addDays(fecha, 10)) : fechaProbable
  }

  return fechaProbable
}

function gradoCerteza(index: number, fechaProbable: string): GradoCerteza | null {
  if (index % 13 === 0) {
    return null
  }

  if (fechaProbable < mesReferencia) {
    return "Alta"
  }

  return gradosCerteza[index % gradosCerteza.length] ?? null
}

function cuentaBancaria(moneda: CodigoMoneda, index: number) {
  if (moneda === "USD") {
    return "Cuenta en dólares"
  }

  return index % 5 === 0 ? "Caja chica" : "Cuenta corriente en pesos"
}

function tipoGasto(categoria: string) {
  const categoriaSeed = categoriasSeed.find((item) => item.nombre === categoria)

  if (categoria === "Equipamiento") {
    return "Inversión"
  }

  return categoriaSeed?.tipo === "estructura_fija" ? "Administrativo" : "Operativo"
}

function buildMovimientosSeed(): MovimientoRecord[] {
  const movimientos: MovimientoRecord[] = []
  let counter = 0

  function push(
    plan: ProyectoPlan,
    mes: string,
    tipo: TipoMovimiento,
    categoria: string,
    importe: number,
  ) {
    counter += 1
    const moneda = tipo === "ingreso" ? plan.monedaIngreso : plan.monedaEgreso

    movimientos.push({
      id: `mov-${String(counter).padStart(4, "0")}`,
      tipo,
      concepto:
        tipo === "ingreso"
          ? conceptoIngreso(categoria, plan.proyecto)
          : (conceptosEgreso[categoria] ?? categoria),
      proyectoId: proyectoId(plan.proyecto),
      categoriaId: categoriaId(categoria),
      moneda,
      importeOriginal: roundMoney(importe),
      fechaPrevistaOriginal: fechaPrevistaOriginal(counter, mes),
      fechaProbable: mes,
      gradoCerteza: gradoCerteza(counter, mes),
      estadoCobroPago: estadoCobroPago(counter, tipo, mes),
      ingresoDetalle:
        tipo === "ingreso"
          ? {
              cuentaDestino: cuentaBancaria(moneda, counter),
              condicionCobro: ["Transferencia bancaria", "Cheque", "Efectivo"][counter % 3] ?? null,
            }
          : null,
      egresoDetalle:
        tipo === "egreso"
          ? {
              proveedorDestinatario: proveedoresPorCategoria[categoria] ?? categoria,
              cuentaOrigen: cuentaBancaria(moneda, counter),
              tipoGasto: tipoGasto(categoria),
            }
          : null,
    })
  }

  planes.forEach((plan, projectIndex) => {
    meses.forEach((mes, monthIndex) => {
      push(
        plan,
        mes,
        "ingreso",
        plan.ingresoCategoria,
        plan.ingresoBase * monthlyFactor(monthIndex, projectIndex, "ingreso"),
      )

      plan.egresos.forEach((egreso) => {
        push(
          plan,
          mes,
          "egreso",
          egreso.categoria,
          plan.egresoBase * egreso.peso * monthlyFactor(monthIndex, projectIndex, "egreso"),
        )
      })
    })
  })

  return movimientos
}

/** Movimientos previstos que alimentan tanto Movimientos como las líneas de Presupuesto. */
export const movimientosSeed = buildMovimientosSeed()
