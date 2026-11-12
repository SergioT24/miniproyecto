import { useId, useMemo, useState, type ComponentProps, type FocusEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface MoneyInputProps extends Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> {
  value: number | null
  onValueChange: (value: number | null) => void
  /** Código ISO de la moneda. */
  currency?: string
  locale?: string
  /** Cantidad máxima de decimales aceptados. */
  maxDecimals?: number
  allowNegative?: boolean
}

function getCurrencySymbol(locale: string, currency: string) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0)

  return parts.find((part) => part.type === "currency")?.value ?? currency
}

function formatNumber(value: number | null, locale: string, maxDecimals: number) {
  if (value === null || !Number.isFinite(value)) {
    return ""
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value)
}

function parseMoney(raw: string, allowNegative: boolean, maxDecimals: number) {
  const cleaned = raw.replace(/[^\d.,-]/g, "")
  const negative = allowNegative && cleaned.trimStart().startsWith("-")
  const unsigned = cleaned.replace(/-/g, "")

  const lastComma = unsigned.lastIndexOf(",")
  const lastDot = unsigned.lastIndexOf(".")
  const candidate = Math.max(lastComma, lastDot)

  let integerPart = unsigned
  let fractionPart = ""

  if (candidate >= 0) {
    const decimals = unsigned.length - candidate - 1

    // Si hay más dígitos que los decimales permitidos, se interpreta como
    // separador de miles. Si no, como separador decimal.
    if (decimals <= maxDecimals) {
      integerPart = unsigned.slice(0, candidate)
      fractionPart = unsigned
        .slice(candidate + 1)
        .replace(/\D/g, "")
        .slice(0, maxDecimals)
    }
  }

  integerPart = integerPart.replace(/\D/g, "")

  if (!integerPart && !fractionPart) {
    return null
  }

  const parsed = Number(`${integerPart || "0"}.${fractionPart || "0"}`)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return negative ? -parsed : parsed
}

/**
 * Input de dinero con símbolo de moneda y formato local.
 *
 * Mientras el campo tiene foco se respeta el texto que escribe la persona;
 * al salir se muestra formateado. El valor que consume el formulario es
 * siempre numérico (`number | null`), nunca un string con separadores.
 */
export function MoneyInput({
  value,
  onValueChange,
  currency = "ARS",
  locale = "es-AR",
  maxDecimals = 2,
  allowNegative = true,
  className,
  id,
  inputMode = "decimal",
  onFocus,
  onBlur,
  "aria-describedby": ariaDescribedBy,
  ...props
}: MoneyInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const currencyDescriptionId = `${inputId}-currency`
  const describedBy =
    [ariaDescribedBy, currencyDescriptionId].filter(Boolean).join(" ") || undefined

  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState("")

  const currencySymbol = useMemo(() => getCurrencySymbol(locale, currency), [currency, locale])

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true)
    setDraft(formatNumber(value, locale, maxDecimals))
    onFocus?.(event)
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false)
    onBlur?.(event)
  }

  return (
    <div data-slot="money-input" className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center border-r border-input text-sm text-muted-foreground"
      >
        {currencySymbol}
      </span>

      <Input
        {...props}
        id={inputId}
        type="text"
        inputMode={inputMode}
        value={focused ? draft : formatNumber(value, locale, maxDecimals)}
        onChange={(event) => {
          const nextDraft = event.target.value
          setDraft(nextDraft)
          onValueChange(parseMoney(nextDraft, allowNegative, maxDecimals))
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={describedBy}
        className={cn("pl-11 text-right tabular-nums", className)}
      />

      <span id={currencyDescriptionId} className="sr-only">
        Moneda: {currency}.
      </span>
    </div>
  )
}
