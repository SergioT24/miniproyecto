import { useEffect, useRef, type RefObject } from "react"
import { useLocation } from "react-router-dom"
import { routes } from "@/lib/nav"

const pageTitles: Record<string, string> = {
    [routes.home]: "Inicio",
    [routes.bandeja]: "Bandeja de entrada",
    [routes.calendario]: "Calendario",
    [routes.configuracion]: "Configuración",
    [routes.form]: "Tabla de presupuestos",
    [routes.emptyPage]: "Página vacía",
    [routes.modalConfirmacion]: "Modal de confirmación",
    [routes.toasts]: "Toasts",
}

/**
 * Mantiene el título del documento alineado con la ruta actual y mueve el
 * foco al contenido principal al navegar dentro de la SPA (WCAG 2.4.2 y 2.4.3).
 */
export function useRouteAnnouncer(mainRef: RefObject<HTMLElement | null>) {
    const { pathname } = useLocation()
    const previousPathname = useRef(pathname)

    useEffect(() => {
        const pageTitle = pageTitles[pathname]
        document.title = pageTitle
            ? `${pageTitle} · Fundación Huésped Finanzas`
            : "Fundación Huésped · Finanzas"

        // En el primer render no movemos el foco: evita robarle el foco
        // a quien acaba de entrar a la aplicación.
        if (previousPathname.current === pathname) {
            return
        }

        previousPathname.current = pathname
        mainRef.current?.focus()
    }, [pathname, mainRef])
}
