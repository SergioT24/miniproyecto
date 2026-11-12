import { ApiError } from "./errors"
import type { ApiErrorPayload } from "./types"

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "")

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  /** Cuerpo JSON. Si es `FormData`, se envía tal cual. */
  body?: unknown
  /** Parámetros de consulta; los valores vacíos se omiten. */
  query?: Record<string, QueryValue>
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${API_BASE_URL}${normalizedPath}`

  if (!query) {
    return url
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return text || undefined
}

async function request<T>(
  path: string,
  method: string,
  { body, query, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")

  let requestBody: BodyInit | undefined

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body
    } else {
      requestHeaders.set("Content-Type", "application/json")
      requestBody = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    method,
    headers: requestHeaders,
    body: requestBody,
    // TODO(auth): reemplazar por el fetch autenticado de la librería real.
    credentials: "include",
  })

  const payload = await readPayload(response)

  if (!response.ok) {
    throw ApiError.fromResponse(
      response.status,
      isApiErrorPayload(payload)
        ? payload
        : { message: typeof payload === "string" ? payload : undefined },
    )
  }

  return payload as T
}

/**
 * Cliente HTTP de la app. Centraliza base URL, JSON, credenciales y errores.
 * Los componentes no llaman a `fetch` directamente: lo hacen las features
 * a través de TanStack Query.
 */
export const apiClient = {
  get<T>(path: string, options: Omit<RequestOptions, "body"> = {}) {
    return request<T>(path, "GET", options)
  },
  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, "body"> = {}) {
    return request<T>(path, "POST", { ...options, body })
  },
  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, "body"> = {}) {
    return request<T>(path, "PUT", { ...options, body })
  },
  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions, "body"> = {}) {
    return request<T>(path, "PATCH", { ...options, body })
  },
  delete<T>(path: string, options: Omit<RequestOptions, "body"> = {}) {
    return request<T>(path, "DELETE", options)
  },
}

export { API_BASE_URL }
