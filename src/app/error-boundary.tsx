import { Component, type ErrorInfo, type ReactNode } from "react"
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"
import { House, RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  title: string
  description: string
  fullScreen?: boolean
}

function ErrorFallback({ title, description, fullScreen = false }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={
        fullScreen
          ? "flex min-h-svh items-center justify-center bg-background p-6"
          : "flex min-h-[50vh] items-center justify-center p-6"
      }
    >
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.reload()
            }}
          >
            <RotateCcw aria-hidden="true" />
            Reintentar
          </Button>
          <Button render={<Link to="/" />}>
            <House aria-hidden="true" />
            Ir al tablero
          </Button>
        </div>
      </div>
    </div>
  )
}

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

/** Captura errores de render fuera del router y evita la pantalla en blanco. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado en la app", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          fullScreen
          title="Algo salió mal"
          description="Se produjo un error inesperado. Podés reintentar o volver al tablero."
        />
      )
    }

    return this.props.children
  }
}

/** Error de una ruta: React Router lo muestra dentro del layout. */
export function RouteErrorPage() {
  const error = useRouteError()
  const description =
    isRouteErrorResponse(error) && error.statusText
      ? error.statusText
      : "No pudimos cargar esta página. Reintentá o volvé al tablero."

  return <ErrorFallback title="Algo salió mal" description={description} />
}
