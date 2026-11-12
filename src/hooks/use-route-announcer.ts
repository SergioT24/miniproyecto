import { useEffect, useRef, type RefObject } from "react"
import { useLocation } from "react-router-dom"
import { resolveRouteMeta } from "@/app/route-meta"

/**
 * Mantiene el título del documento alineado con la ruta actual y mueve el
 * foco al contenido principal al navegar dentro de la SPA (WCAG 2.4.2 y 2.4.3).
 */
export function useRouteAnnouncer(mainRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    const meta = resolveRouteMeta(pathname)
    document.title = meta
      ? `${meta.title} · Fundación Huésped Finanzas`
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
