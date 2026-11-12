import { useCallback, useMemo, useState, type ReactNode } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { DataTable } from "@/components/app/DataTable"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getErrorMessage } from "@/lib/api"
import { catalogMeta } from "../catalog-meta"
import {
  useCatalogQuery,
  useCreateCatalogItem,
  useDeleteCatalogItem,
  useUpdateCatalogItem,
} from "../queries"
import type { CatalogInput, CatalogItem, CatalogKey } from "../types"

export interface CatalogFormRenderProps<K extends CatalogKey> {
  item: CatalogItem<K> | null
  onSubmit: (input: CatalogInput<K>) => Promise<void>
  onCancel: () => void
}

export interface CatalogSectionProps<K extends CatalogKey> {
  catalog: K
  columns: ColumnDef<CatalogItem<K>, unknown>[]
  /** Texto que identifica al registro en confirmaciones y etiquetas accesibles. */
  itemLabel: (item: CatalogItem<K>) => string
  renderForm: (props: CatalogFormRenderProps<K>) => ReactNode
}

/**
 * Sección CRUD de un catálogo de Parámetros.
 *
 * Centraliza la consulta paginada, el alta y la edición en un `Sheet`, la
 * confirmación de borrado y la tabla. Las columnas y el formulario los define
 * cada catálogo; así el panel no conoce los campos del dominio.
 */
export function CatalogSection<K extends CatalogKey>({
  catalog,
  columns,
  itemLabel,
  renderForm,
}: CatalogSectionProps<K>) {
  const meta = catalogMeta[catalog]
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: meta.defaultSort, desc: false }])
  const [search, setSearch] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem<K> | null>(null)
  const [deleteItem, setDeleteItem] = useState<CatalogItem<K> | null>(null)

  const listParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: search.trim() || undefined,
      sort: sorting[0]?.id,
      order: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
    }),
    [pagination, search, sorting],
  )

  const query = useCatalogQuery(catalog, listParams)
  const createMutation = useCreateCatalogItem(catalog)
  const updateMutation = useUpdateCatalogItem(catalog)
  const deleteMutation = useDeleteCatalogItem(catalog)

  const openCreate = useCallback(() => {
    setEditingItem(null)
    setEditorOpen(true)
  }, [])

  const openEdit = useCallback((item: CatalogItem<K>) => {
    setEditingItem(item)
    setEditorOpen(true)
  }, [])

  const handleEditorOpenChange = useCallback((open: boolean) => {
    setEditorOpen(open)

    if (!open) {
      setEditingItem(null)
    }
  }, [])

  const handleSubmit = useCallback(
    async (input: CatalogInput<K>) => {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }

      setEditorOpen(false)
      setEditingItem(null)
    },
    [createMutation, editingItem, updateMutation],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteItem) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deleteItem.id)
      setDeleteItem(null)
    } catch {
      // El hook de mutación ya muestra el error; el diálogo se cierra solo.
    }
  }, [deleteItem, deleteMutation])

  const actionsColumn = useMemo<ColumnDef<CatalogItem<K>, unknown>>(
    () => ({
      id: "acciones",
      header: () => <span className="sr-only">Acciones</span>,
      enableSorting: false,
      enableHiding: false,
      meta: { label: "Acciones", align: "right" },
      cell: ({ row }) => {
        const description = itemLabel(row.original)

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${meta.article} ${meta.singular}: ${description}`}
              onClick={() => openEdit(row.original)}
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Eliminar ${meta.article} ${meta.singular}: ${description}`}
              onClick={() => setDeleteItem(row.original)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        )
      },
    }),
    [itemLabel, meta.article, meta.singular, openEdit],
  )

  const tableColumns = useMemo(() => [...columns, actionsColumn], [actionsColumn, columns])

  const rows = query.data?.data ?? []

  return (
    <section aria-labelledby={`catalogo-${catalog}`} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 id={`catalogo-${catalog}`} className="text-lg font-semibold">
            {meta.label}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">{meta.description}</p>
        </div>

        <Button onClick={openCreate} className="shrink-0">
          <Plus aria-hidden="true" />
          {meta.createLabel}
        </Button>
      </div>

      <DataTable
        data={rows}
        columns={tableColumns}
        label={`${meta.label} de parámetros`}
        state={{ pagination, sorting, globalFilter: search }}
        onPaginationChange={setPagination}
        onSortingChange={(nextSorting) => {
          setSorting(nextSorting)
          setPagination((current) => ({ ...current, pageIndex: 0 }))
        }}
        onGlobalFilterChange={(value) => {
          setSearch(value)
          setPagination((current) => ({ ...current, pageIndex: 0 }))
        }}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={query.data?.meta.total ?? 0}
        isLoading={query.isLoading}
        isError={query.isError}
        errorMessage={query.error ? getErrorMessage(query.error) : undefined}
        onRetry={() => void query.refetch()}
        searchLabel={`Buscar en ${meta.label.toLowerCase()}`}
        searchPlaceholder="Buscar…"
        emptyTitle={meta.emptyTitle}
        emptyDescription="Probá con otra búsqueda o creá el primero."
        emptyAction={<Button onClick={openCreate}>{meta.createLabel}</Button>}
      />

      <Sheet open={editorOpen} onOpenChange={handleEditorOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingItem ? `Editar ${meta.article} ${meta.singular}` : meta.createLabel}
            </SheetTitle>
            <SheetDescription>
              {editingItem
                ? `Modificá los datos ${meta.deSingular}.`
                : `Completá los datos para crear ${meta.article} ${meta.singular}.`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {renderForm({
              item: editingItem,
              onSubmit: handleSubmit,
              onCancel: () => handleEditorOpenChange(false),
            })}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(deleteItem)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteItem(null)
          }
        }}
        title={`¿Eliminar ${meta.article} ${meta.singular}?`}
        description={
          deleteItem
            ? `Se eliminará “${itemLabel(deleteItem)}”. Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => void handleDelete()}
      />
    </section>
  )
}
