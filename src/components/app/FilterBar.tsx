import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface FilterBarProps extends Omit<ComponentProps<"div">, "role"> {
  /** Nombre accesible del bloque de filtros. */
  label?: string
  /** Acciones a la derecha, por ejemplo “Limpiar filtros”. */
  actions?: ReactNode
}

/**
 * Contenedor de filtros de una lista. Se anuncia como landmark de búsqueda
 * y mantiene los controles y las acciones separados en pantallas grandes.
 */
export function FilterBar({
  label = "Filtros",
  actions,
  children,
  className,
  ...props
}: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label={label}
      data-slot="filter-bar"
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">{children}</div>

      {actions && (
        <div data-slot="filter-bar-actions" className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
