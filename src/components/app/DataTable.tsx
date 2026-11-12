import { useCallback, useId, useMemo, useState, type ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"
import { type LucideIcon } from "lucide-react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Inbox,
  MoreHorizontal,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { ErrorState } from "./ErrorState"
import { LoadingState } from "./LoadingState"

declare module "@tanstack/react-table" {
  // Los parámetros de tipo son obligatorios para fusionar la interfaz original.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Etiqueta visible en el selector de columnas. */
    label?: string
    /** Alineación del encabezado y de las celdas. */
    align?: "left" | "center" | "right"
    /** Clases adicionales para las celdas de la columna. */
    cellClassName?: string
  }
}

/**
 * Estado de la tabla que puede controlarse desde afuera.
 * Cada campo presente en `state` pasa a ser controlado; los ausentes
 * siguen manejándose internamente.
 */
export interface DataTableState {
  pagination?: PaginationState
  sorting?: SortingState
  globalFilter?: string
  columnVisibility?: VisibilityState
  rowSelection?: RowSelectionState
}

export interface DataTableProps<TData extends RowData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  /** Nombre accesible de la tabla. Se renderiza como caption oculto. */
  label: string

  /** Estado controlado. Los campos omitidos se manejan internamente. */
  state?: DataTableState
  /** Se llama con la paginación resuelta cuando cambia. */
  onPaginationChange?: (pagination: PaginationState) => void
  /** Se llama con el orden resuelto cuando cambia. */
  onSortingChange?: (sorting: SortingState) => void
  /** Se llama con el texto de búsqueda cuando cambia. */
  onGlobalFilterChange?: (value: string) => void
  /** Se llama con la visibilidad de columnas resuelta cuando cambia. */
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  /** Se llama con la selección resuelta cuando cambia. */
  onRowSelectionChange?: (selection: RowSelectionState) => void

  /** La paginación, el orden o el filtro los resuelve el servidor. */
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  /** Cantidad total de páginas. Si se omite, se calcula desde `rowCount`. */
  pageCount?: number
  /** Cantidad total de filas. Necesario para el resumen en modo servidor. */
  rowCount?: number
  /** Filas por página iniciales. */
  initialPageSize?: number
  /** Opciones del selector de filas por página. */
  pageSizeOptions?: number[]

  /** Id estable de cada fila. Necesario para conservar la selección entre páginas. */
  getRowId?: (originalRow: TData, index: number) => string
  /** Habilita la columna de selección con checkboxes. */
  enableRowSelection?: boolean
  /** Nombre accesible de cada checkbox de fila. */
  selectionLabel?: (row: TData, index: number) => string

  /** Muestra el buscador global. */
  enableSearch?: boolean
  searchLabel?: string
  searchPlaceholder?: string
  /** Muestra el selector de columnas visibles. */
  enableColumnVisibility?: boolean
  /** Controles propios de la pantalla, por ejemplo un filtro por estado. */
  toolbar?: ReactNode
  /** Acciones a la derecha de la barra de herramientas. */
  actions?: ReactNode

  isLoading?: boolean
  loadingLabel?: string
  isError?: boolean
  errorTitle?: string
  errorMessage?: string
  onRetry?: () => void

  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  emptyIcon?: LucideIcon

  className?: string
  tableClassName?: string
}

type PageItem = number | "ellipsis-start" | "ellipsis-end"

const defaultPageSizeOptions = [10, 25, 50]

function getPageItems(pageIndex: number, pageCount: number): PageItem[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index)
  }

  const items: PageItem[] = [0]
  const start = Math.max(1, pageIndex - 1)
  const end = Math.min(pageCount - 2, pageIndex + 1)

  if (start > 1) {
    items.push("ellipsis-start")
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < pageCount - 2) {
    items.push("ellipsis-end")
  }

  items.push(pageCount - 1)
  return items
}

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const metaLabel = column.columnDef.meta?.label

  if (metaLabel) {
    return metaLabel
  }

  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header
  }

  return column.id
}

/**
 * Estado controlado o interno. El callback externo recibe el valor ya
 * resuelto, para que conectarlo a un fetch o a un `useState` sea directo.
 */
function useControllableTableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (updater: Updater<T>) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const setValue = useCallback(
    (updater: Updater<T>) => {
      const next = typeof updater === "function" ? (updater as (previous: T) => T)(value) : updater

      if (!isControlled) {
        setInternalValue(next)
      }

      onChange?.(next)
    },
    [isControlled, onChange, value],
  )

  return [value, setValue]
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown

  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0",
        direction ? "text-foreground" : "text-muted-foreground/70",
      )}
    />
  )
}

/**
 * Tabla de datos genérica sobre TanStack Table.
 *
 * Por defecto ordena, busca y pagina en el cliente. Con `manualSorting`,
 * `manualFiltering` y `manualPagination` delega esas operaciones en la API;
 * en ese caso conviene controlar `state` y pasar `rowCount` o `pageCount`.
 * La selección, la visibilidad de columnas y los estados de consulta son
 * opcionales.
 */
export function DataTable<TData extends RowData>({
  data,
  columns,
  label,
  state,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pageCount,
  rowCount,
  initialPageSize = 10,
  pageSizeOptions = defaultPageSizeOptions,
  getRowId,
  enableRowSelection = false,
  selectionLabel,
  enableSearch = true,
  searchLabel = "Buscar en la tabla",
  searchPlaceholder = "Buscar…",
  enableColumnVisibility = true,
  toolbar,
  actions,
  isLoading = false,
  loadingLabel = "Cargando datos…",
  isError = false,
  errorTitle,
  errorMessage = "Revisá la conexión e intentá de nuevo.",
  onRetry,
  emptyTitle = "No hay datos para mostrar",
  emptyDescription = "No se encontraron filas con los criterios actuales.",
  emptyAction,
  emptyIcon = Inbox,
  className,
  tableClassName,
}: DataTableProps<TData>) {
  const searchId = useId()
  const pageSizeId = useId()

  const [pagination, setPagination] = useControllableTableState<PaginationState>(
    state?.pagination,
    { pageIndex: 0, pageSize: Math.max(1, initialPageSize) },
    onPaginationChange,
  )
  const [sorting, setSorting] = useControllableTableState<SortingState>(
    state?.sorting,
    [],
    onSortingChange,
  )
  const [globalFilter, setGlobalFilter] = useControllableTableState<string>(
    state?.globalFilter,
    "",
    onGlobalFilterChange,
  )
  const [columnVisibility, setColumnVisibility] = useControllableTableState<VisibilityState>(
    state?.columnVisibility,
    {},
    onColumnVisibilityChange,
  )
  const [rowSelection, setRowSelection] = useControllableTableState<RowSelectionState>(
    state?.rowSelection,
    {},
    onRowSelectionChange,
  )

  const selectionColumn = useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "__select__",
      enableSorting: false,
      enableHiding: false,
      size: 40,
      header: ({ table }) => (
        <Checkbox
          aria-label="Seleccionar todas las filas de esta página"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
          disabled={table.getRowModel().rows.length === 0}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={
            selectionLabel
              ? selectionLabel(row.original, row.index)
              : `Seleccionar fila ${row.index + 1}`
          }
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked)}
        />
      ),
    }),
    [selectionLabel],
  )

  const tableColumns = useMemo(
    () => (enableRowSelection ? [selectionColumn, ...columns] : columns),
    [columns, enableRowSelection, selectionColumn],
  )

  const resolvedPageCount =
    manualPagination && pageCount === undefined && rowCount !== undefined
      ? Math.ceil(rowCount / pagination.pageSize)
      : pageCount

  // TanStack Table expone funciones mutables que React Compiler no puede memoizar.
  // El proyecto no usa React Compiler; la advertencia no aplica a este caso.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    getRowId,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: resolvedPageCount,
    autoResetPageIndex: !manualPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  })

  const pageRows = table.getRowModel().rows
  const visibleColumnCount = Math.max(1, table.getVisibleLeafColumns().length)
  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide())
  const filteredRows = manualFiltering ? data.length : table.getFilteredRowModel().rows.length
  const totalRows = rowCount ?? (manualPagination ? data.length : filteredRows)
  const tablePageCount = table.getPageCount()
  const pageSizeChoices = useMemo(
    () => Array.from(new Set([...pageSizeOptions, pagination.pageSize])).sort((a, b) => a - b),
    [pageSizeOptions, pagination.pageSize],
  )
  const showFooter = !isLoading && !isError && totalRows > 0
  const startRow = pageRows.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const endRow = pageRows.length === 0 ? 0 : startRow + pageRows.length - 1
  const summary =
    totalRows === 0
      ? "Sin resultados"
      : `Mostrando ${startRow}–${endRow} de ${totalRows} ${totalRows === 1 ? "fila" : "filas"}`
  const hasToolbar =
    enableSearch ||
    Boolean(toolbar) ||
    Boolean(actions) ||
    (enableColumnVisibility && hideableColumns.length > 0)

  return (
    <div data-slot="data-table" className={cn("space-y-3", className)}>
      {hasToolbar && (
        <div
          data-slot="data-table-toolbar"
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {enableSearch && (
              <div className="relative w-full sm:max-w-xs">
                <label htmlFor={searchId} className="sr-only">
                  {searchLabel}
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id={searchId}
                  type="search"
                  autoComplete="off"
                  value={globalFilter}
                  onChange={(event) => table.setGlobalFilter(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-8"
                />
              </div>
            )}

            {toolbar}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions}

            {enableColumnVisibility && hideableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                  <Columns3 aria-hidden="true" />
                  Columnas
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hideableColumns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) => column.toggleVisibility(checked)}
                      >
                        {getColumnLabel(column)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table aria-busy={isLoading || undefined} className={tableClassName}>
          <TableCaption className="sr-only">{label}</TableCaption>

          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      colSpan={header.colSpan}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={cn(
                        "px-3",
                        align === "right" && "text-right",
                        align === "center" && "text-center",
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "-mx-2 h-8 gap-1 px-2 font-medium",
                            align === "right" && "w-full justify-end",
                            align === "center" && "w-full justify-center",
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon direction={sorted} />
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal p-0">
                  <LoadingState label={loadingLabel} />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal p-3">
                  <ErrorState title={errorTitle} description={errorMessage} onRetry={onRetry} />
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal p-3">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    className="py-10"
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-3",
                          meta?.align === "right" && "text-right",
                          meta?.align === "center" && "text-center",
                          meta?.cellClassName,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showFooter && (
        <div
          data-slot="data-table-footer"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {summary}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span id={`${pageSizeId}-label`} className="text-sm text-muted-foreground">
                Filas por página
              </span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  table.setPagination({ pageIndex: 0, pageSize: Number(value) })
                }}
              >
                <SelectTrigger size="sm" aria-labelledby={`${pageSizeId}-label`} className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeChoices.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tablePageCount > 1 && (
              <Pagination
                aria-label={`Paginación: ${label}`}
                className="mx-0 w-auto justify-start sm:justify-end"
              >
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Ir a la página anterior"
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                  </PaginationItem>

                  {getPageItems(pagination.pageIndex, tablePageCount).map((item) =>
                    typeof item === "number" ? (
                      <PaginationItem key={item}>
                        <Button
                          variant={item === pagination.pageIndex ? "outline" : "ghost"}
                          size="icon-sm"
                          aria-label={`Ir a la página ${item + 1}`}
                          aria-current={item === pagination.pageIndex ? "page" : undefined}
                          onClick={() => table.setPageIndex(item)}
                        >
                          {item + 1}
                        </Button>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <span
                          aria-hidden="true"
                          className="flex size-7 items-center justify-center"
                        >
                          <MoreHorizontal className="size-4 text-muted-foreground" />
                        </span>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Ir a la página siguiente"
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
