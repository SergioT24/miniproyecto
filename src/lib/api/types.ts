export type SortDirection = "asc" | "desc"

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  order?: SortDirection
}

export type FieldErrors = Record<string, string[]>

export interface ApiErrorPayload {
  code?: string
  message?: string
  details?: unknown
  field_errors?: FieldErrors
}
