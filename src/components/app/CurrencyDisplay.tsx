import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export interface CurrencyDisplayProps extends Omit<ComponentProps<"span">, "children"> {
  value: number | null | undefined
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  /** Muestra el signo en valores distintos de cero. */
  showSign?: boolean
  emptyLabel?: string
}

/**
 * Formatea un importe con `Intl.NumberFormat` sin acoplar la vista a una
 * moneda fija. Los valores nulos se muestran como un texto explícito.
 */
export function CurrencyDisplay({
  value,
  currency = "ARS",
  locale = "es-AR",
  minimumFractionDigits,
  maximumFractionDigits = 2,
  showSign = false,
  emptyLabel = "Sin dato",
  className,
  ...props
}: CurrencyDisplayProps) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value)
  const minDigits = minimumFractionDigits ?? Math.min(2, Math.max(0, maximumFractionDigits))

  const formatted = hasValue
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: Math.max(minDigits, maximumFractionDigits),
        signDisplay: showSign ? "exceptZero" : "auto",
      }).format(value)
    : null

  return (
    <span
      data-slot="currency-display"
      className={cn("tabular-nums", !formatted && "text-muted-foreground", className)}
      {...props}
    >
      {formatted ?? emptyLabel}
    </span>
  )
}
