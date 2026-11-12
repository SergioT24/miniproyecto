import { Link } from "react-router-dom"
import { Compass, House } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Compass className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Error 404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          La dirección que buscás no existe o cambió de lugar.
        </p>
      </div>
      <Button render={<Link to="/" />}>
        <House aria-hidden="true" />
        Ir al tablero
      </Button>
    </div>
  )
}
