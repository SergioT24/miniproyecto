import { http, HttpResponse } from "msw"
import {
  categoriasSeed,
  direccionesSeed,
  financiadoresSeed,
  monedasSeed,
  parametrosMensualesSeed,
  proyectosSeed,
} from "./fixtures"
import {
  codigosMoneda,
  estadosProyecto,
  gradosCerteza,
  isCatalogKey,
  tiposCategoria,
  type CatalogRecord,
  type CatalogKey,
  type Categoria,
  type Direccion,
  type Financiador,
  type Moneda,
  type ParametroMensual,
  type Proyecto,
} from "./types"

const AUDIT_TIMESTAMP = "2026-01-05T12:00:00.000Z"
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

const idPrefixes: Record<CatalogKey, string> = {
  proyectos: "proy",
  direcciones: "dir",
  financiadores: "fin",
  categorias: "cat",
  monedas: "mon",
  "parametros-mensuales": "pm",
}

const searchableFields: Record<CatalogKey, string[]> = {
  proyectos: ["nombre", "estado", "gradoCerteza", "direccionId", "financiadorId"],
  direcciones: ["nombre"],
  financiadores: ["nombre"],
  categorias: ["nombre", "tipo"],
  monedas: ["codigo", "descripcion"],
  "parametros-mensuales": ["mes"],
}

const defaultSort: Record<CatalogKey, string> = {
  proyectos: "nombre",
  direcciones: "nombre",
  financiadores: "nombre",
  categorias: "nombre",
  monedas: "codigo",
  "parametros-mensuales": "mes",
}

interface ParametrosStore {
  proyectos: Proyecto[]
  direcciones: Direccion[]
  financiadores: Financiador[]
  categorias: Categoria[]
  monedas: Moneda[]
  "parametros-mensuales": ParametroMensual[]
  counters: Record<CatalogKey, number>
}

function withAudit<T extends CatalogRecord>(input: Omit<T, keyof CatalogRecord>, id: string): T {
  return {
    ...input,
    id,
    createdAt: AUDIT_TIMESTAMP,
    updatedAt: AUDIT_TIMESTAMP,
  } as T
}

function seed<T extends CatalogRecord>(items: Omit<T, keyof CatalogRecord>[], prefix: string): T[] {
  return items.map((item, index) =>
    withAudit<T>(item, `${prefix}-${String(index + 1).padStart(3, "0")}`),
  )
}

function createInitialStore(): ParametrosStore {
  return {
    proyectos: seed<Proyecto>(proyectosSeed, "proy"),
    direcciones: seed<Direccion>(direccionesSeed, "dir"),
    financiadores: seed<Financiador>(financiadoresSeed, "fin"),
    categorias: seed<Categoria>(categoriasSeed, "cat"),
    monedas: seed<Moneda>(monedasSeed, "mon"),
    "parametros-mensuales": seed<ParametroMensual>(parametrosMensualesSeed, "pm"),
    counters: {
      proyectos: proyectosSeed.length,
      direcciones: direccionesSeed.length,
      financiadores: financiadoresSeed.length,
      categorias: categoriasSeed.length,
      monedas: monedasSeed.length,
      "parametros-mensuales": parametrosMensualesSeed.length,
    },
  }
}

let store = createInitialStore()

/** Reinicia los datos mock. Se llama entre tests para aislar el estado. */
export function resetParametrosStore() {
  store = createInitialStore()
}

function getCollection(catalog: CatalogKey): CatalogRecord[] {
  return store[catalog]
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function compareValues(left: unknown, right: unknown) {
  if (left === null || left === undefined) {
    return right === null || right === undefined ? 0 : 1
  }

  if (right === null || right === undefined) {
    return -1
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right
  }

  return String(left).localeCompare(String(right), "es", {
    numeric: true,
    sensitivity: "base",
  })
}

function listItems(catalog: CatalogKey, url: URL) {
  const search = url.searchParams.get("search")?.trim() ?? ""
  const sort = url.searchParams.get("sort") ?? defaultSort[catalog]
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc"
  const requestedPage = Number(url.searchParams.get("page") ?? 1)
  const requestedPageSize = Number(url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(requestedPageSize)))
    : DEFAULT_PAGE_SIZE

  let items = [...getCollection(catalog)]

  if (search) {
    const term = normalize(search)

    items = items.filter((item) => {
      const record = item as unknown as Record<string, unknown>
      return searchableFields[catalog].some((field) =>
        normalize(String(record[field] ?? "")).includes(term),
      )
    })
  }

  items.sort((left, right) => {
    const leftRecord = left as unknown as Record<string, unknown>
    const rightRecord = right as unknown as Record<string, unknown>
    const compared = compareValues(leftRecord[sort], rightRecord[sort])
    return order === "desc" ? -compared : compared
  })

  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total, totalPages },
  }
}

interface ValidationFailure {
  message: string
  fieldErrors: Record<string, string[]>
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function textValue(
  input: Record<string, unknown>,
  field: string,
  errors: Record<string, string[]>,
  label: string,
  maxLength = 100,
) {
  const value = input[field]

  if (typeof value !== "string" || value.trim().length < 2) {
    errors[field] = [`Ingresá ${label}.`]
    return ""
  }

  const trimmed = value.trim()

  if (trimmed.length > maxLength) {
    errors[field] = [`El campo no puede superar los ${maxLength} caracteres.`]
    return trimmed
  }

  return trimmed
}

function nullableText(input: Record<string, unknown>, field: string) {
  const value = input[field]
  return typeof value === "string" && value.length > 0 ? value : null
}

function nullableNumber(input: Record<string, unknown>, field: string) {
  const value = input[field]
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function validateCatalogInput(
  catalog: CatalogKey,
  raw: unknown,
): { data: Record<string, unknown> } | { failure: ValidationFailure } {
  if (!isObject(raw)) {
    return { failure: { message: "El cuerpo de la solicitud no es válido.", fieldErrors: {} } }
  }

  const errors: Record<string, string[]> = {}

  if (catalog === "proyectos") {
    const nombre = textValue(raw, "nombre", errors, "un nombre")
    const direccionId = nullableText(raw, "direccionId")
    const financiadorId = nullableText(raw, "financiadorId")
    const estado = raw.estado
    const gradoCerteza = nullableText(raw, "gradoCerteza")

    if (!direccionId || !store.direcciones.some((item) => item.id === direccionId)) {
      errors.direccionId = ["Elegí una dirección válida."]
    }

    if (financiadorId && !store.financiadores.some((item) => item.id === financiadorId)) {
      errors.financiadorId = ["Elegí un financiador válido."]
    }

    if (typeof estado !== "string" || !(estadosProyecto as readonly string[]).includes(estado)) {
      errors.estado = ["Elegí un estado válido."]
    }

    if (gradoCerteza && !(gradosCerteza as readonly string[]).includes(gradoCerteza)) {
      errors.gradoCerteza = ["Elegí un grado de certeza válido."]
    }

    if (Object.keys(errors).length > 0) {
      return { failure: { message: "Revisá los campos marcados.", fieldErrors: errors } }
    }

    return {
      data: {
        nombre,
        direccionId,
        financiadorId,
        estado,
        gradoCerteza,
        esFicticioEstructura: raw.esFicticioEstructura === true,
      },
    }
  }

  if (catalog === "direcciones" || catalog === "financiadores") {
    const nombre = textValue(raw, "nombre", errors, "un nombre")

    if (Object.keys(errors).length > 0) {
      return { failure: { message: "Revisá los campos marcados.", fieldErrors: errors } }
    }

    return { data: { nombre } }
  }

  if (catalog === "categorias") {
    const nombre = textValue(raw, "nombre", errors, "un nombre")
    const tipo = raw.tipo

    if (typeof tipo !== "string" || !(tiposCategoria as readonly string[]).includes(tipo)) {
      errors.tipo = ["Elegí un tipo de categoría válido."]
    }

    if (Object.keys(errors).length > 0) {
      return { failure: { message: "Revisá los campos marcados.", fieldErrors: errors } }
    }

    return { data: { nombre, tipo } }
  }

  if (catalog === "monedas") {
    const codigo = raw.codigo
    const descripcion = textValue(raw, "descripcion", errors, "una descripción", 40)

    if (typeof codigo !== "string" || !(codigosMoneda as readonly string[]).includes(codigo)) {
      errors.codigo = ["Elegí un código de moneda válido."]
    }

    if (Object.keys(errors).length > 0) {
      return { failure: { message: "Revisá los campos marcados.", fieldErrors: errors } }
    }

    return { data: { codigo, descripcion } }
  }

  const mes = raw.mes
  const tipoCambioCcl = nullableNumber(raw, "tipoCambioCcl")
  const tipoCambioNacion = nullableNumber(raw, "tipoCambioNacion")
  const inflacionMensual = raw.inflacionMensual

  if (typeof mes !== "string" || !/^\d{4}-\d{2}-01$/.test(mes)) {
    errors.mes = ["Elegí un mes válido."]
  }

  if (raw.tipoCambioCcl !== null && tipoCambioCcl === null) {
    errors.tipoCambioCcl = ["Ingresá un tipo de cambio CCL válido."]
  } else if (tipoCambioCcl !== null && tipoCambioCcl <= 0) {
    errors.tipoCambioCcl = ["El tipo de cambio CCL debe ser mayor a 0."]
  }

  if (raw.tipoCambioNacion !== null && tipoCambioNacion === null) {
    errors.tipoCambioNacion = ["Ingresá un tipo de cambio Nación válido."]
  } else if (tipoCambioNacion !== null && tipoCambioNacion <= 0) {
    errors.tipoCambioNacion = ["El tipo de cambio Nación debe ser mayor a 0."]
  }

  if (
    typeof inflacionMensual !== "number" ||
    !Number.isFinite(inflacionMensual) ||
    inflacionMensual < 0 ||
    inflacionMensual > 1
  ) {
    errors.inflacionMensual = ["La inflación mensual debe ser una fracción entre 0 y 1."]
  }

  if (Object.keys(errors).length > 0) {
    return { failure: { message: "Revisá los campos marcados.", fieldErrors: errors } }
  }

  return { data: { mes, tipoCambioCcl, tipoCambioNacion, inflacionMensual } }
}

function findDuplicate(catalog: CatalogKey, data: Record<string, unknown>, currentId?: string) {
  const records = getCollection(catalog).filter((item) => item.id !== currentId)

  if (catalog === "monedas") {
    return records.some((item) => (item as Moneda).codigo === (data.codigo as Moneda["codigo"]))
  }

  if (catalog === "parametros-mensuales") {
    return records.some((item) => (item as ParametroMensual).mes === data.mes)
  }

  if (catalog === "proyectos") {
    return records.some((item) => {
      const proyecto = item as Proyecto
      return (
        normalize(proyecto.nombre) === normalize(String(data.nombre)) &&
        proyecto.direccionId === data.direccionId
      )
    })
  }

  return records.some((item) => {
    const record = item as unknown as { nombre: string }
    return normalize(record.nombre) === normalize(String(data.nombre))
  })
}

function nextId(catalog: CatalogKey) {
  store.counters[catalog] += 1
  return `${idPrefixes[catalog]}-${String(store.counters[catalog]).padStart(3, "0")}`
}

function conflictResponse(message: string, field: string) {
  return HttpResponse.json(
    {
      code: "conflict",
      message,
      field_errors: { [field]: [message] },
    },
    { status: 409 },
  )
}

function notFoundResponse() {
  return HttpResponse.json(
    { code: "not_found", message: "El registro no existe." },
    { status: 404 },
  )
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function resolveCatalog(params: Record<string, string | readonly string[] | undefined>) {
  const value = Array.isArray(params.catalog) ? params.catalog[0] : params.catalog
  return typeof value === "string" && isCatalogKey(value) ? value : null
}

function resolveId(params: Record<string, string | readonly string[] | undefined>) {
  const value = Array.isArray(params.id) ? params.id[0] : params.id
  return typeof value === "string" ? value : null
}

/**
 * Handlers MSW de Parámetros. El store vive en memoria y se reinicia entre
 * tests con `resetParametrosStore`. En desarrollo se pierde al recargar.
 * TODO(api): mover a un backend real y reemplazar este módulo.
 */
export const parametrosHandlers = [
  http.get("/api/parametros/:catalog", ({ request, params }) => {
    const catalog = resolveCatalog(params)

    if (!catalog) {
      return HttpResponse.json(
        { code: "not_found", message: "El catálogo no existe." },
        { status: 404 },
      )
    }

    return HttpResponse.json(listItems(catalog, new URL(request.url)))
  }),

  http.post("/api/parametros/:catalog", async ({ request, params }) => {
    const catalog = resolveCatalog(params)

    if (!catalog) {
      return HttpResponse.json(
        { code: "not_found", message: "El catálogo no existe." },
        { status: 404 },
      )
    }

    const parsed = validateCatalogInput(catalog, await readJson(request))

    if ("failure" in parsed) {
      return HttpResponse.json(
        {
          code: "validation_error",
          message: parsed.failure.message,
          field_errors: parsed.failure.fieldErrors,
        },
        { status: 422 },
      )
    }

    const duplicateField = catalog === "parametros-mensuales" ? "mes" : "nombre"
    const duplicateMessage =
      catalog === "monedas"
        ? "Ya existe una moneda con ese código."
        : catalog === "parametros-mensuales"
          ? "Ya existe un parámetro para ese mes."
          : "Ya existe un registro con ese nombre."

    if (findDuplicate(catalog, parsed.data)) {
      return conflictResponse(duplicateMessage, duplicateField)
    }

    const now = new Date().toISOString()
    const item: CatalogRecord = {
      ...parsed.data,
      id: nextId(catalog),
      createdAt: now,
      updatedAt: now,
    }

    getCollection(catalog).push(item)
    return HttpResponse.json(item, { status: 201 })
  }),

  http.put("/api/parametros/:catalog/:id", async ({ request, params }) => {
    const catalog = resolveCatalog(params)
    const id = resolveId(params)

    if (!catalog || !id) {
      return notFoundResponse()
    }

    const collection = getCollection(catalog)
    const index = collection.findIndex((item) => item.id === id)

    if (index < 0) {
      return notFoundResponse()
    }

    const parsed = validateCatalogInput(catalog, await readJson(request))

    if ("failure" in parsed) {
      return HttpResponse.json(
        {
          code: "validation_error",
          message: parsed.failure.message,
          field_errors: parsed.failure.fieldErrors,
        },
        { status: 422 },
      )
    }

    const duplicateField = catalog === "parametros-mensuales" ? "mes" : "nombre"
    const duplicateMessage =
      catalog === "monedas"
        ? "Ya existe una moneda con ese código."
        : catalog === "parametros-mensuales"
          ? "Ya existe un parámetro para ese mes."
          : "Ya existe un registro con ese nombre."

    if (findDuplicate(catalog, parsed.data, id)) {
      return conflictResponse(duplicateMessage, duplicateField)
    }

    const updated: CatalogRecord = {
      ...collection[index],
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    collection[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete("/api/parametros/:catalog/:id", ({ params }) => {
    const catalog = resolveCatalog(params)
    const id = resolveId(params)

    if (!catalog || !id) {
      return notFoundResponse()
    }

    if (
      catalog === "direcciones" &&
      store.proyectos.some((proyecto) => proyecto.direccionId === id)
    ) {
      return conflictResponse(
        "No se puede eliminar la dirección porque tiene proyectos asociados.",
        "id",
      )
    }

    if (
      catalog === "financiadores" &&
      store.proyectos.some((proyecto) => proyecto.financiadorId === id)
    ) {
      return conflictResponse(
        "No se puede eliminar el financiador porque tiene proyectos asociados.",
        "id",
      )
    }

    const collection = getCollection(catalog)
    const index = collection.findIndex((item) => item.id === id)

    if (index < 0) {
      return notFoundResponse()
    }

    collection.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
