import { http, HttpResponse } from "msw"
import { categoriasSeed, proyectosSeed } from "@/features/parametros/fixtures"
import { codigosMoneda, gradosCerteza } from "@/features/parametros/types"
import { parseDate, toIsoDate } from "@/lib/format/dates"
import { summarizeMovimientos } from "./aggregate"
import { movimientosSeed, periodoMovimientos } from "./fixtures"
import {
  estadosCobroPago,
  tiposMovimiento,
  type EstadoCobroPago,
  type Movimiento,
  type MovimientoInput,
  type MovimientoRecord,
  type TipoMovimiento,
} from "./types"

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

const proyectoNombrePorId = new Map(
  proyectosSeed.map((proyecto, index) => [
    `proy-${String(index + 1).padStart(3, "0")}`,
    proyecto.nombre,
  ]),
)

const categoriaNombrePorId = new Map(
  categoriasSeed.map((categoria, index) => [
    `cat-${String(index + 1).padStart(3, "0")}`,
    categoria.nombre,
  ]),
)

const proyectoIds = new Set(proyectoNombrePorId.keys())
const categoriaIds = new Set(categoriaNombrePorId.keys())

interface MovimientosStore {
  movimientos: MovimientoRecord[]
  counters: {
    movimiento: number
  }
}

function createInitialStore(): MovimientosStore {
  return {
    movimientos: movimientosSeed.map((movimiento) => ({
      ...movimiento,
      ingresoDetalle: movimiento.ingresoDetalle ? { ...movimiento.ingresoDetalle } : null,
      egresoDetalle: movimiento.egresoDetalle ? { ...movimiento.egresoDetalle } : null,
    })),
    counters: {
      movimiento: movimientosSeed.length,
    },
  }
}

let store = createInitialStore()

/** Reinicia los datos mock. Se llama entre tests para aislar el estado. */
export function resetMovimientosStore() {
  store = createInitialStore()
}

function resolveParam(params: Record<string, string | readonly string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
}

function notFoundResponse(message = "El movimiento no existe.") {
  return HttpResponse.json({ code: "not_found", message }, { status: 404 })
}

function validationResponse(message: string, fieldErrors: Record<string, string[]>) {
  return HttpResponse.json(
    { code: "validation_error", message, field_errors: fieldErrors },
    { status: 422 },
  )
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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

function enrichMovimiento(movimiento: MovimientoRecord): Movimiento {
  return {
    ...movimiento,
    proyectoNombre: proyectoNombrePorId.get(movimiento.proyectoId) ?? "Proyecto sin nombre",
    categoriaNombre: categoriaNombrePorId.get(movimiento.categoriaId) ?? "Categoría sin nombre",
  }
}

function filterMovimientos(url: URL): Movimiento[] {
  const search = url.searchParams.get("search")?.trim() ?? ""
  const tipo = url.searchParams.get("tipo")
  const proyectoId = url.searchParams.get("proyectoId")
  const categoriaId = url.searchParams.get("categoriaId")
  const moneda = url.searchParams.get("moneda")
  const estado = url.searchParams.get("estado")
  const mes = url.searchParams.get("mes")

  let items = store.movimientos.map(enrichMovimiento)

  if (tipo === "ingreso" || tipo === "egreso") {
    items = items.filter((movimiento) => movimiento.tipo === tipo)
  }

  if (proyectoId) {
    items = items.filter((movimiento) => movimiento.proyectoId === proyectoId)
  }

  if (categoriaId) {
    items = items.filter((movimiento) => movimiento.categoriaId === categoriaId)
  }

  if (moneda === "ARS" || moneda === "USD") {
    items = items.filter((movimiento) => movimiento.moneda === moneda)
  }

  if (estado && estadosCobroPago.some((item) => item === estado)) {
    items = items.filter((movimiento) => movimiento.estadoCobroPago === estado)
  }

  if (mes) {
    const mesBuscado = mes.slice(0, 7)
    items = items.filter((movimiento) => movimiento.fechaProbable.slice(0, 7) === mesBuscado)
  }

  if (search) {
    const term = normalize(search)
    items = items.filter((movimiento) =>
      normalize(
        `${movimiento.concepto} ${movimiento.proyectoNombre} ${movimiento.categoriaNombre} ${movimiento.tipo} ${movimiento.estadoCobroPago} ${movimiento.fechaProbable}`,
      ).includes(term),
    )
  }

  return items
}

function listMovimientos(url: URL) {
  const sort = url.searchParams.get("sort") ?? "fechaProbable"
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc"
  const requestedPage = Number(url.searchParams.get("page") ?? 1)
  const requestedPageSize = Number(url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(requestedPageSize)))
    : DEFAULT_PAGE_SIZE

  const items = filterMovimientos(url)

  items.sort((left, right) => {
    const leftRecord = left as unknown as Record<string, unknown>
    const rightRecord = right as unknown as Record<string, unknown>
    const compared = compareValues(leftRecord[sort], rightRecord[sort])

    if (compared === 0) {
      return left.id.localeCompare(right.id)
    }

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

function isTipoMovimiento(value: unknown): value is TipoMovimiento {
  return typeof value === "string" && tiposMovimiento.some((tipo) => tipo === value)
}

function isEstadoCobroPago(value: unknown): value is EstadoCobroPago {
  return typeof value === "string" && estadosCobroPago.some((estado) => estado === value)
}

function isCodigoMoneda(value: unknown): value is "ARS" | "USD" {
  return typeof value === "string" && codigosMoneda.some((moneda) => moneda === value)
}

function isGradoCerteza(value: unknown): value is (typeof gradosCerteza)[number] {
  return typeof value === "string" && gradosCerteza.some((grado) => grado === value)
}

function isIsoDate(value: string) {
  const date = parseDate(value)
  return date !== null && toIsoDate(date) === value
}

function parseFecha(
  value: unknown,
  field: string,
  label: string,
  errors: Record<string, string[]>,
) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  if (typeof value !== "string" || !isIsoDate(value)) {
    errors[field] = [`${label} no es una fecha válida.`]
    return null
  }

  if (value < periodoMovimientos.fechaInicio || value > periodoMovimientos.fechaFin) {
    errors[field] = [`${label} debe estar dentro del período del presupuesto.`]
    return null
  }

  return value
}

function parseTextoOpcional(
  value: unknown,
  field: string,
  label: string,
  max: number,
  errors: Record<string, string[]>,
) {
  if (typeof value !== "string") {
    return null
  }

  const texto = value.trim()

  if (!texto) {
    return null
  }

  if (texto.length > max) {
    errors[field] = [`${label} no puede superar los ${max} caracteres.`]
  }

  return texto
}

interface MovimientoParseResult {
  input?: MovimientoInput
  fieldErrors?: Record<string, string[]>
}

function parseMovimiento(raw: unknown): MovimientoParseResult {
  if (!isObject(raw)) {
    return { fieldErrors: { concepto: ["El cuerpo de la solicitud no es válido."] } }
  }

  const errors: Record<string, string[]> = {}
  const tipo = isTipoMovimiento(raw.tipo) ? raw.tipo : null
  const moneda = isCodigoMoneda(raw.moneda) ? raw.moneda : null
  const estadoCobroPago = isEstadoCobroPago(raw.estadoCobroPago) ? raw.estadoCobroPago : null
  const concepto = typeof raw.concepto === "string" ? raw.concepto.trim() : ""
  const proyectoId = typeof raw.proyectoId === "string" ? raw.proyectoId : ""
  const categoriaId = typeof raw.categoriaId === "string" ? raw.categoriaId : ""
  const importeOriginal = typeof raw.importeOriginal === "number" ? raw.importeOriginal : null
  const fechaProbable = parseFecha(
    raw.fechaProbable,
    "fechaProbable",
    "La fecha probable",
    errors,
  )
  const fechaPrevistaOriginal = parseFecha(
    raw.fechaPrevistaOriginal,
    "fechaPrevistaOriginal",
    "La fecha prevista original",
    errors,
  )
  const gradoCerteza =
    raw.gradoCerteza === null || raw.gradoCerteza === undefined
      ? null
      : isGradoCerteza(raw.gradoCerteza)
        ? raw.gradoCerteza
        : null

  if (!tipo) {
    errors.tipo = ["Elegí un tipo de movimiento."]
  }

  if (!moneda) {
    errors.moneda = ["Elegí una moneda válida."]
  }

  if (!estadoCobroPago) {
    errors.estadoCobroPago = ["Elegí un estado válido."]
  }

  if (!concepto) {
    errors.concepto = ["El concepto es obligatorio."]
  } else if (concepto.length < 2) {
    errors.concepto = ["El concepto debe tener al menos 2 caracteres."]
  } else if (concepto.length > 150) {
    errors.concepto = ["El concepto no puede superar los 150 caracteres."]
  }

  if (!proyectoIds.has(proyectoId)) {
    errors.proyectoId = ["Elegí un proyecto válido."]
  }

  if (!categoriaIds.has(categoriaId)) {
    errors.categoriaId = ["Elegí una categoría válida."]
  }

  if (importeOriginal === null || !Number.isFinite(importeOriginal) || importeOriginal <= 0) {
    errors.importeOriginal = ["El importe debe ser mayor a cero."]
  }

  if (!fechaProbable) {
    errors.fechaProbable = [errors.fechaProbable?.[0] ?? "La fecha probable es obligatoria."]
  }

  if (!raw.fechaPrevistaOriginal && raw.fechaPrevistaOriginal !== null) {
    // Sin fecha original es válido; este bloque solo documenta la intención.
  }

  if (raw.gradoCerteza !== null && raw.gradoCerteza !== undefined && !isGradoCerteza(raw.gradoCerteza)) {
    errors.gradoCerteza = ["Elegí un grado de certeza válido."]
  }

  if (tipo === "ingreso" && estadoCobroPago === "pagado") {
    errors.estadoCobroPago = ["Un ingreso no puede estar pagado."]
  }

  if (tipo === "egreso" && estadoCobroPago === "cobrado") {
    errors.estadoCobroPago = ["Un egreso no puede estar cobrado."]
  }

  const detalleIngreso = tipo === "ingreso" && isObject(raw.ingresoDetalle) ? raw.ingresoDetalle : {}
  const detalleEgreso = tipo === "egreso" && isObject(raw.egresoDetalle) ? raw.egresoDetalle : {}

  const ingresoDetalle =
    tipo === "ingreso"
      ? {
          cuentaDestino: parseTextoOpcional(
            detalleIngreso.cuentaDestino,
            "cuentaDestino",
            "La cuenta destino",
            50,
            errors,
          ),
          condicionCobro: parseTextoOpcional(
            detalleIngreso.condicionCobro,
            "condicionCobro",
            "La condición de cobro",
            50,
            errors,
          ),
        }
      : null

  const egresoDetalle =
    tipo === "egreso"
      ? {
          proveedorDestinatario: parseTextoOpcional(
            detalleEgreso.proveedorDestinatario,
            "proveedorDestinatario",
            "El proveedor o destinatario",
            120,
            errors,
          ),
          cuentaOrigen: parseTextoOpcional(
            detalleEgreso.cuentaOrigen,
            "cuentaOrigen",
            "La cuenta origen",
            50,
            errors,
          ),
          tipoGasto: parseTextoOpcional(
            detalleEgreso.tipoGasto,
            "tipoGasto",
            "El tipo de gasto",
            80,
            errors,
          ),
        }
      : null

  if (
    Object.keys(errors).length > 0 ||
    !tipo ||
    !moneda ||
    !estadoCobroPago ||
    !fechaProbable ||
    importeOriginal === null
  ) {
    return { fieldErrors: errors }
  }

  return {
    input: {
      tipo,
      concepto,
      proyectoId,
      categoriaId,
      moneda,
      importeOriginal,
      fechaProbable,
      fechaPrevistaOriginal,
      gradoCerteza,
      estadoCobroPago,
      ingresoDetalle,
      egresoDetalle,
    },
  }
}

function nextMovimientoId() {
  store.counters.movimiento += 1
  return `mov-${String(store.counters.movimiento).padStart(4, "0")}`
}

/**
 * Handlers MSW de Movimientos. El store vive en memoria y se reinicia entre
 * tests con `resetMovimientosStore`. En desarrollo se pierde al recargar.
 * TODO(api): reemplazar por el backend real y validar la relación con las
 * versiones cerradas del presupuesto.
 */
export const movimientosHandlers = [
  http.get("/api/movimientos/resumen", ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(summarizeMovimientos(filterMovimientos(url)))
  }),

  http.get("/api/movimientos", ({ request }) => {
    return HttpResponse.json(listMovimientos(new URL(request.url)))
  }),

  http.post("/api/movimientos", async ({ request }) => {
    const parsed = parseMovimiento(await readJson(request))

    if (!parsed.input) {
      return validationResponse("Revisá los campos marcados.", parsed.fieldErrors ?? {})
    }

    const movimiento: MovimientoRecord = {
      id: nextMovimientoId(),
      ...parsed.input,
    }

    store.movimientos.push(movimiento)
    return HttpResponse.json(enrichMovimiento(movimiento), { status: 201 })
  }),

  http.put("/api/movimientos/:movimientoId", async ({ request, params }) => {
    const movimientoId = resolveParam(params, "movimientoId")
    const index = store.movimientos.findIndex((movimiento) => movimiento.id === movimientoId)

    if (!movimientoId || index < 0) {
      return notFoundResponse()
    }

    const parsed = parseMovimiento(await readJson(request))

    if (!parsed.input) {
      return validationResponse("Revisá los campos marcados.", parsed.fieldErrors ?? {})
    }

    const updated: MovimientoRecord = {
      id: movimientoId,
      ...parsed.input,
    }

    store.movimientos[index] = updated
    return HttpResponse.json(enrichMovimiento(updated))
  }),

  http.delete("/api/movimientos/:movimientoId", ({ params }) => {
    const movimientoId = resolveParam(params, "movimientoId")
    const index = store.movimientos.findIndex((movimiento) => movimiento.id === movimientoId)

    if (!movimientoId || index < 0) {
      return notFoundResponse()
    }

    store.movimientos.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
