import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import type { ZodType } from "zod"

export type FilterPrimitive = string | number | boolean | undefined

export interface UseFiltersResult<T extends Record<string, FilterPrimitive>> {
  /** Valores validados; si la URL no es válida, se usan los defaults. */
  filters: T
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void
  setFilters: (values: Partial<T>) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Sincroniza filtros de una lista con la URL.
 *
 * El schema recibe los parámetros como texto, por eso las features deben usar
 * `z.coerce.number()` o `z.coerce.boolean()` cuando corresponda. Los valores
 * iguales al default se omiten de la URL para mantenerla limpia.
 */
export function useFilters<T extends Record<string, FilterPrimitive>>(
  schema: ZodType<T>,
  defaults: T,
): UseFiltersResult<T> {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries())
    const parsed = schema.safeParse(raw)
    return parsed.success ? parsed.data : defaults
  }, [defaults, schema, searchParams])

  const setFilters = useCallback(
    (values: Partial<T>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          for (const [key, value] of Object.entries(values)) {
            if (value === undefined || value === "" || value === defaults[key]) {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          }

          return next
        },
        { replace: true },
      )
    },
    [defaults, setSearchParams],
  )

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      // El índice genérico no se puede estrechar a `Partial<T>` sin el cast;
      // la clave y el valor ya están garantizados por la firma de `setFilter`.
      setFilters({ [key]: value } as unknown as Partial<T>)
    },
    [setFilters],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const hasActiveFilters = useMemo(
    () => Object.keys(defaults).some((key) => filters[key] !== defaults[key]),
    [defaults, filters],
  )

  return { filters, setFilter, setFilters, resetFilters, hasActiveFilters }
}
