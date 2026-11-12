export interface CurrencyFormatOptions {
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface PercentFormatOptions {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Formatea un importe con `Intl`. No fija moneda ni locale: cada llamador
 * decide si necesita ARS, USD u otra moneda.
 */
export function formatCurrency(value: number, options: CurrencyFormatOptions = {}) {
  const {
    currency = "ARS",
    locale = "es-AR",
    maximumFractionDigits = 2,
    minimumFractionDigits = Math.min(2, maximumFractionDigits),
  } = options

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

export function formatARS(value: number, options: Omit<CurrencyFormatOptions, "currency"> = {}) {
  return formatCurrency(value, { ...options, currency: "ARS" })
}

export function formatUSD(value: number, options: Omit<CurrencyFormatOptions, "currency"> = {}) {
  return formatCurrency(value, { ...options, currency: "USD" })
}

/**
 * Convierte texto escrito por una persona a número.
 *
 * Acepta `$ 1.234,56`, `1234.56`, `1,234.56` y negativos entre paréntesis.
 * Si no puede interpretarlo, devuelve `null` en lugar de `NaN`.
 */
export function parseMoney(input: string): number | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const isNegative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith("-")
  const cleaned = trimmed.replace(/[^\d.,]/g, "")

  if (!cleaned) {
    return null
  }

  const lastComma = cleaned.lastIndexOf(",")
  const lastDot = cleaned.lastIndexOf(".")
  let normalized: string

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".")
    } else {
      normalized = cleaned.replace(/,/g, "")
    }
  } else if (lastComma >= 0) {
    normalized = cleaned.replace(",", ".")
  } else if (lastDot >= 0) {
    const looksLikeThousands = /^\d{1,3}(\.\d{3})+$/.test(cleaned)
    normalized = looksLikeThousands ? cleaned.replace(/\./g, "") : cleaned
  } else {
    normalized = cleaned
  }

  const value = Number(normalized.replace(/-/g, ""))

  if (!Number.isFinite(value)) {
    return null
  }

  return isNegative ? -value : value
}

/**
 * Formatea una fracción como porcentaje: `0.125` se muestra como `12,5 %`.
 * Si el dato de origen ya es un porcentaje, dividilo por 100 antes de llamar.
 */
export function formatPercent(value: number, options: PercentFormatOptions = {}) {
  const { locale = "es-AR", minimumFractionDigits = 0, maximumFractionDigits = 2 } = options

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}
