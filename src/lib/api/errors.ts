import type { ApiErrorPayload, FieldErrors } from "./types"

export interface ApiErrorOptions {
  code?: string
  status?: number
  details?: unknown
  fieldErrors?: FieldErrors
}

/**
 * Error normalizado de la API. Conserva el mensaje del backend, el código
 * de negocio y los errores por campo para que los formularios puedan
 * mostrarlos sin depender del formato de cada endpoint.
 */
export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown
  readonly fieldErrors?: FieldErrors

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = "ApiError"
    this.code = options.code ?? "api_error"
    this.status = options.status ?? 0
    this.details = options.details
    this.fieldErrors = options.fieldErrors
  }

  static fromResponse(status: number, payload?: ApiErrorPayload) {
    return new ApiError(payload?.message ?? `La solicitud falló con el estado ${status}.`, {
      code: payload?.code,
      status,
      details: payload?.details,
      fieldErrors: payload?.field_errors,
    })
  }
}

/** Extrae un mensaje legible de cualquier error, sin exponer detalles internos. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Ocurrió un error inesperado. Intentá de nuevo."
}
