import type { ReactNode } from "react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type MetricTrend = "up" | "down" | "neutral"

export interface MetricCardProps {
  /** Valor principal, ya formateado. */
  value: string
  /** Texto que describe la métrica. */
  label: string
  /** Variación respecto del período anterior, por ejemplo "+12,5%". */
  change?: string
  trend?: MetricTrend
  /** Texto secundario opcional debajo del valor. */
  description?: string
  /** Visual decorativo o informativo (sparkline, barras, anillo). */
  visual?: ReactNode
  /**
   * Descripción accesible del visual. Si se omite, el visual se considera
   * decorativo y se oculta a lectores de pantalla.
   */
  visualLabel?: string
  className?: string
}

const trendStyles: Record<MetricTrend, { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: "text-success" },
  down: { icon: TrendingDown, className: "text-destructive" },
  neutral: { icon: Minus, className: "text-muted-foreground" },
}

/**
 * Tarjeta de indicador con valor, variación y un visual opcional.
 * El color nunca es la única señal: la variación siempre incluye signo,
 * ícono y texto para lectores de pantalla.
 */
export function MetricCard({
  value,
  label,
  change,
  trend = "neutral",
  description,
  visual,
  visualLabel,
  className,
}: MetricCardProps) {
  const { icon: TrendIcon, className: trendClassName } = trendStyles[trend]

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && (
          <span className={cn("flex items-center gap-1 text-sm font-medium", trendClassName)}>
            <TrendIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Variación: </span>
            {change}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>

      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}

      {visual && (
        <div
          className="mt-4 flex flex-1 items-end"
          role={visualLabel ? "img" : undefined}
          aria-label={visualLabel}
          aria-hidden={visualLabel ? undefined : true}
        >
          {visual}
        </div>
      )}
    </article>
  )
}
