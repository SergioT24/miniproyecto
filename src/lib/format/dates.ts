import { format, isValid, parse, parseISO, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Interpreta una fecha ISO (`2026-03-05`) o escrita como `dd/MM/yyyy`.
 * Devuelve `null` cuando el texto no representa una fecha válida.
 */
export function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  const iso = parseISO(value)

  if (isValid(iso)) {
    return iso
  }

  const local = parse(value, "dd/MM/yyyy", new Date())
  return isValid(local) ? local : null
}

/** Fecha sin hora en formato `yyyy-MM-dd`, el que usa la API. */
export function toIsoDate(value: Date): string {
  return format(value, "yyyy-MM-dd")
}

export function formatDate(
  value: string | Date | null | undefined,
  pattern = "dd/MM/yyyy",
): string {
  const date = value ? parseDate(value) : null
  return date ? format(date, pattern, { locale: es }) : "—"
}

/** Mes con nombre completo, por ejemplo `Marzo de 2026`. */
export function formatMonth(value: string | Date | null | undefined): string {
  const date = value ? parseDate(value) : null
  return date ? capitalize(format(date, "MMMM 'de' yyyy", { locale: es })) : "—"
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "dd/MM/yyyy HH:mm")
}

/** Primer día del mes, normalizado para parámetros mensuales. */
export function monthStart(value: Date): Date {
  return startOfMonth(value)
}
