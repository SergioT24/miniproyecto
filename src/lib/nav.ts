import { type LucideIcon, Calendar, Home, Inbox, Settings } from "lucide-react"

/**
 * Única fuente de verdad de las rutas y la navegación de la app.
 * Sidebar, navbar y router consumen esta data — no hardcodear rutas en componentes.
 */

export const routes = {
    home: "/",
    bandeja: "/bandeja",
    calendario: "/calendario",
    configuracion: "/configuracion",
    emptyPage: "/emptypage",
    toasts: "/toasts",
} as const

export interface NavItem {
    label: string
    to: string
}

export interface SidebarNavItem extends NavItem {
    icon: LucideIcon
}

/** IA del producto (sidebar izquierdo). */
export const sidebarNav: SidebarNavItem[] = [
    { label: "Inicio", to: routes.home, icon: Home },
    { label: "Bandeja de entrada", to: routes.bandeja, icon: Inbox },
    { label: "Calendario", to: routes.calendario, icon: Calendar },
    { label: "Configuración", to: routes.configuracion, icon: Settings },
]

/** Links horizontales del navbar. */
export const mainNav: NavItem[] = [{ label: "Home", to: routes.home }]

/** Galería de demos del kit de UI — no es parte de la IA del producto. */
export const componentGalleryNav: NavItem[] = [
    { label: "Grilla Filtro", to: routes.home },
    { label: "Grilla agregar", to: routes.home },
    { label: "Cards metricas", to: routes.home },
    { label: "Toasts", to: routes.toasts },
    { label: "Empty states", to: routes.emptyPage },
    { label: "Form", to: routes.home },
    { label: "Modal confirmacion", to: routes.home },
]