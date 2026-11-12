import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  Bell,
  CalendarDays,
  History,
  Landmark,
  LayoutDashboard,
  Palette,
  Settings,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { useLocation } from "react-router-dom"

export type RouteSection = "Principal" | "Gestión" | "Administración" | "Desarrollo"

export interface RouteMeta {
  /** Ruta absoluta de la app. */
  path: string
  /** Texto corto para el sidebar y los breadcrumbs. */
  label: string
  /** Título completo de la página y del documento. */
  title: string
  description: string
  icon: LucideIcon
  section: RouteSection
  /** Solo se expone en desarrollo (por ejemplo, la galería). */
  devOnly?: boolean
}

/**
 * Única fuente de verdad de la navegación y los títulos de página.
 * Sidebar, breadcrumbs, document.title y el router consumen esta metadata.
 */
export const routeMeta: RouteMeta[] = [
  {
    path: "/",
    label: "Tablero",
    title: "Tablero",
    description: "Resumen de ingresos, egresos y saldos del período.",
    icon: LayoutDashboard,
    section: "Principal",
  },
  {
    path: "/presupuesto",
    label: "Presupuesto",
    title: "Presupuesto",
    description: "Versiones, líneas y comparación entre presupuesto, proyección y ejecución.",
    icon: Wallet,
    section: "Gestión",
  },
  {
    path: "/movimientos",
    label: "Movimientos",
    title: "Movimientos",
    description: "Ingresos y egresos previstos y registrados.",
    icon: ArrowLeftRight,
    section: "Gestión",
  },
  {
    path: "/cashflow",
    label: "Cash flow",
    title: "Cash flow",
    description: "Saldo diario, semanal y mensual por proyecto, cuenta y moneda.",
    icon: TrendingUp,
    section: "Gestión",
  },
  {
    path: "/disponibilidades",
    label: "Disponibilidades",
    title: "Disponibilidades",
    description: "Cuentas, caja, inversiones y fondos restringidos.",
    icon: Landmark,
    section: "Gestión",
  },
  {
    path: "/proyeccion",
    label: "Proyección",
    title: "Proyección",
    description: "Grilla mensual de los próximos doce meses.",
    icon: CalendarDays,
    section: "Gestión",
  },
  {
    path: "/alertas",
    label: "Alertas",
    title: "Alertas",
    description: "Avisos operativos con severidad y vínculo al origen.",
    icon: Bell,
    section: "Gestión",
  },
  {
    path: "/parametros",
    label: "Parámetros",
    title: "Parámetros",
    description: "Catálogos y datos maestros que alimentan la operación.",
    icon: Settings,
    section: "Administración",
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    title: "Usuarios",
    description: "Datos de usuarios, roles asignados y restricciones por proyecto.",
    icon: Users,
    section: "Administración",
  },
  {
    path: "/auditoria",
    label: "Auditoría",
    title: "Auditoría",
    description: "Historial de cambios con detalle antes y después.",
    icon: History,
    section: "Administración",
  },
  {
    path: "/dev/ui",
    label: "Galería UI",
    title: "Galería UI",
    description: "Catálogo de componentes y patrones de la app. Solo en desarrollo.",
    icon: Palette,
    section: "Desarrollo",
    devOnly: true,
  },
]

export const routeSections: RouteSection[] = [
  "Principal",
  "Gestión",
  "Administración",
  "Desarrollo",
]

export function isRouteEnabled(route: RouteMeta): boolean {
  return !route.devOnly || import.meta.env.DEV
}

/**
 * Resuelve la metadata de una ruta. Usa coincidencia exacta y, si no hay,
 * el prefijo más largo para soportar subrutas como /presupuesto/123.
 */
export function resolveRouteMeta(pathname: string): RouteMeta | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname

  return routeMeta.find((route) => {
    if (route.path === "/") {
      return normalized === "/"
    }

    return normalized === route.path || normalized.startsWith(`${route.path}/`)
  })
}

export function useCurrentRouteMeta(): RouteMeta | undefined {
  const { pathname } = useLocation()
  return resolveRouteMeta(pathname)
}
