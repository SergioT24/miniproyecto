import type { ReactElement } from "react"
import { ModulePlaceholderPage } from "@/pages/ModulePlaceholderPage"
import { UiGalleryPage } from "@/pages/UiGalleryPage"
import { isRouteEnabled, routeMeta, type RouteMeta } from "./route-meta"

export interface AppRoute extends RouteMeta {
  element: ReactElement
}

const pageByPath: Record<string, ReactElement> = {
  "/dev/ui": <UiGalleryPage />,
}

/**
 * Une la metadata de navegación con el elemento de cada página.
 * Las rutas todavía no implementadas usan un placeholder hasta su fase.
 */
export const appRoutes: AppRoute[] = routeMeta.map((meta) => ({
  ...meta,
  element: pageByPath[meta.path] ?? <ModulePlaceholderPage />,
}))

export const enabledAppRoutes: AppRoute[] = appRoutes.filter(isRouteEnabled)
