import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { RouteErrorPage } from "./error-boundary"
import { enabledAppRoutes, type AppRoute } from "./routes"

function toRouteObject({ path, element }: AppRoute) {
  if (path === "/") {
    return { index: true, element }
  }

  return { path: path.slice(1), element }
}

const appChildren = enabledAppRoutes.map(toRouteObject)

/**
 * Router de la app. El layout conserva sidebar y navbar en todas las páginas,
 * incluida la 404, y el error de ruta se muestra dentro del contenido.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [...appChildren, { path: "*", element: <NotFoundPage /> }],
      },
    ],
  },
])
