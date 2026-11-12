import { Construction } from "lucide-react"
import { useCurrentRouteMeta } from "@/app/route-meta"

/**
 * Placeholder de los módulos que se implementan en las próximas fases.
 * Mantiene la navegación y el título de la ruta funcionando desde la Fase 0.
 */
export function ModulePlaceholderPage() {
  const meta = useCurrentRouteMeta()

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{meta?.title ?? "Módulo"}</h1>
        <p className="text-sm text-muted-foreground">{meta?.description}</p>
      </header>

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Construction className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Módulo en construcción</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          La navegación ya está conectada. Los datos y las acciones de este módulo se agregan en las
          próximas fases.
        </p>
      </div>
    </div>
  )
}
