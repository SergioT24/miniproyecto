import { http, HttpResponse } from "msw"
import { movimientosSeed } from "@/features/movimientos/fixtures"
import { tipoCambioCclPorMes } from "@/features/parametros/exchange-rates"
import { categoriasSeed, proyectosSeed } from "@/features/parametros/fixtures"
import { buildResumen, computeVersionTotals } from "./aggregate"
import {
  buildEjecucionesSeed,
  buildLineasSeed,
  presupuestosSeed,
  versionesSeed,
} from "./fixtures"
import {
  type EjecucionReal,
  type LineaPresupuesto,
  type LineaVersionRecord,
  type NuevaVersionInput,
  type Presupuesto,
  type VersionProyeccionRecord,
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

interface PresupuestoStore {
  presupuestos: Presupuesto[]
  versiones: VersionProyeccionRecord[]
  lineas: LineaVersionRecord[]
  ejecuciones: EjecucionReal[]
  counters: {
    version: number
    linea: number
  }
}

function createInitialStore(): PresupuestoStore {
  const lineas = buildLineasSeed(versionesSeed, movimientosSeed)

  return {
    presupuestos: presupuestosSeed.map((presupuesto) => ({ ...presupuesto })),
    versiones: versionesSeed.map((version) => ({ ...version })),
    lineas,
    ejecuciones: buildEjecucionesSeed(movimientosSeed),
    counters: {
      version: versionesSeed.length,
      linea: lineas.length,
    },
  }
}

let store = createInitialStore()

/** Reinicia los datos mock. Se llama entre tests para aislar el estado. */
export function resetPresupuestoStore() {
  store = createInitialStore()
}

function resolveParam(params: Record<string, string | readonly string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
}

function notFoundResponse(message = "El presupuesto o la versión no existe.") {
  return HttpResponse.json({ code: "not_found", message }, { status: 404 })
}

function validationResponse(message: string, fieldErrors: Record<string, string[]>) {
  return HttpResponse.json(
    { code: "validation_error", message, field_errors: fieldErrors },
    { status: 422 },
  )
}

function conflictResponse(message: string, field: string) {
  return HttpResponse.json(
    { code: "conflict", message, field_errors: { [field]: [message] } },
    { status: 409 },
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

function findPresupuesto(presupuestoId: string) {
  return store.presupuestos.find((presupuesto) => presupuesto.id === presupuestoId)
}

function findVersion(presupuestoId: string, versionId: string) {
  return store.versiones.find(
    (version) => version.id === versionId && version.presupuestoId === presupuestoId,
  )
}

function versionesDelPresupuesto(presupuestoId: string) {
  return store.versiones
    .filter((version) => version.presupuestoId === presupuestoId)
    .sort((left, right) => left.fechaCreacion.localeCompare(right.fechaCreacion))
}

function enrichLinea(linea: LineaVersionRecord): LineaPresupuesto {
  return {
    ...linea,
    proyectoNombre: proyectoNombrePorId.get(linea.proyectoId) ?? "Proyecto sin nombre",
    categoriaNombre: categoriaNombrePorId.get(linea.categoriaId) ?? "Categoría sin nombre",
  }
}

function nextVersionId() {
  store.counters.version += 1
  return `ver-${String(store.counters.version).padStart(3, "0")}`
}

function nextLineaId() {
  store.counters.linea += 1
  return `lin-${String(store.counters.linea).padStart(5, "0")}`
}

function versionResponse(version: VersionProyeccionRecord) {
  return computeVersionTotals(version, store.lineas)
}

function getBaseVersion(versiones: VersionProyeccionRecord[]) {
  return versiones.find((version) => normalize(version.nombre) === "original") ?? versiones.at(0)
}

function listLineas(presupuestoId: string, url: URL) {
  const versionId = url.searchParams.get("versionId") ?? ""

  if (!findVersion(presupuestoId, versionId)) {
    return null
  }

  const search = url.searchParams.get("search")?.trim() ?? ""
  const sort = url.searchParams.get("sort") ?? "mesImputacion"
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc"
  const proyectoId = url.searchParams.get("proyectoId")
  const categoriaId = url.searchParams.get("categoriaId")
  const tipo = url.searchParams.get("tipo")
  const mes = url.searchParams.get("mes")
  const requestedPage = Number(url.searchParams.get("page") ?? 1)
  const requestedPageSize = Number(url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(requestedPageSize)))
    : DEFAULT_PAGE_SIZE

  let items = store.lineas.filter((linea) => linea.versionId === versionId).map(enrichLinea)

  if (proyectoId) {
    items = items.filter((linea) => linea.proyectoId === proyectoId)
  }

  if (categoriaId) {
    items = items.filter((linea) => linea.categoriaId === categoriaId)
  }

  if (tipo === "ingreso" || tipo === "egreso") {
    items = items.filter((linea) => linea.tipo === tipo)
  }

  if (mes) {
    items = items.filter((linea) => linea.mesImputacion === mes)
  }

  if (search) {
    const term = normalize(search)
    items = items.filter((linea) =>
      normalize(
        `${linea.concepto} ${linea.proyectoNombre} ${linea.categoriaNombre} ${linea.tipo} ${linea.mesImputacion}`,
      ).includes(term),
    )
  }

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

interface NuevaVersionParseResult {
  input?: NuevaVersionInput
  fieldErrors?: Record<string, string[]>
}

function parseNuevaVersion(raw: unknown): NuevaVersionParseResult {
  if (!isObject(raw)) {
    return { fieldErrors: { nombre: ["El cuerpo de la solicitud no es válido."] } }
  }

  const fieldErrors: Record<string, string[]> = {}
  const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : ""
  const versionBaseId = typeof raw.versionBaseId === "string" ? raw.versionBaseId : ""
  const observaciones =
    typeof raw.observaciones === "string" && raw.observaciones.trim().length > 0
      ? raw.observaciones.trim()
      : null

  if (nombre.length < 2) {
    fieldErrors.nombre = ["El nombre debe tener al menos 2 caracteres."]
  } else if (nombre.length > 30) {
    fieldErrors.nombre = ["El nombre no puede superar los 30 caracteres."]
  }

  if (!versionBaseId) {
    fieldErrors.versionBaseId = ["Elegí una versión base."]
  }

  if (observaciones && observaciones.length > 500) {
    fieldErrors.observaciones = ["Las observaciones no pueden superar los 500 caracteres."]
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  return { input: { nombre, versionBaseId, observaciones } }
}

/**
 * Handlers MSW de Presupuesto. El store vive en memoria y se reinicia entre
 * tests con `resetPresupuestoStore`. En desarrollo se pierde al recargar.
 * TODO(api): reemplazar por el backend real, incluida la regla de inmutabilidad
 * de versiones cerradas y la generación de líneas desde movimientos previstos.
 */
export const presupuestoHandlers = [
  http.get("/api/presupuestos", () => HttpResponse.json(store.presupuestos)),

  http.get("/api/presupuestos/:presupuestoId/versiones", ({ params }) => {
    const presupuestoId = resolveParam(params, "presupuestoId")

    if (!presupuestoId || !findPresupuesto(presupuestoId)) {
      return notFoundResponse()
    }

    return HttpResponse.json(
      versionesDelPresupuesto(presupuestoId).map((version) => versionResponse(version)),
    )
  }),

  http.get("/api/presupuestos/:presupuestoId/resumen", ({ request, params }) => {
    const presupuestoId = resolveParam(params, "presupuestoId")
    const presupuesto = presupuestoId ? findPresupuesto(presupuestoId) : undefined

    if (!presupuestoId || !presupuesto) {
      return notFoundResponse()
    }

    const url = new URL(request.url)
    const versiones = versionesDelPresupuesto(presupuestoId)
    const requestedVersionId = url.searchParams.get("versionId")
    const version = requestedVersionId
      ? findVersion(presupuestoId, requestedVersionId)
      : versiones.at(-1)

    if (!version) {
      return notFoundResponse()
    }

    const base = getBaseVersion(versiones)

    if (!base) {
      return notFoundResponse("El presupuesto no tiene versiones.")
    }

    const resumen = buildResumen({
      presupuesto,
      version: versionResponse(version),
      versionBase: versionResponse(base),
      lineasVersion: store.lineas.filter((linea) => linea.versionId === version.id),
      lineasBase: store.lineas.filter((linea) => linea.versionId === base.id),
      ejecuciones: store.ejecuciones,
      tipoCambioPorMes: tipoCambioCclPorMes,
    })

    return HttpResponse.json(resumen)
  }),

  http.get("/api/presupuestos/:presupuestoId/lineas", ({ request, params }) => {
    const presupuestoId = resolveParam(params, "presupuestoId")

    if (!presupuestoId || !findPresupuesto(presupuestoId)) {
      return notFoundResponse()
    }

    const result = listLineas(presupuestoId, new URL(request.url))

    if (!result) {
      return notFoundResponse("La versión no existe o no pertenece al presupuesto.")
    }

    return HttpResponse.json(result)
  }),

  http.post("/api/presupuestos/:presupuestoId/versiones", async ({ request, params }) => {
    const presupuestoId = resolveParam(params, "presupuestoId")

    if (!presupuestoId || !findPresupuesto(presupuestoId)) {
      return notFoundResponse()
    }

    const parsed = parseNuevaVersion(await readJson(request))

    if (!parsed.input) {
      return validationResponse("Revisá los campos marcados.", parsed.fieldErrors ?? {})
    }

    const versiones = versionesDelPresupuesto(presupuestoId)
    const base = versiones.find((version) => version.id === parsed.input?.versionBaseId)

    if (!base) {
      return validationResponse("Revisá los campos marcados.", {
        versionBaseId: ["Elegí una versión base válida."],
      })
    }

    if (
      versiones.some(
        (version) => normalize(version.nombre) === normalize(parsed.input?.nombre ?? ""),
      )
    ) {
      return conflictResponse("Ya existe una versión con ese nombre.", "nombre")
    }

    const version: VersionProyeccionRecord = {
      id: nextVersionId(),
      presupuestoId,
      nombre: parsed.input.nombre,
      fechaCreacion: new Date().toISOString(),
      usuarioCreador: "Sistema",
      esInmutable: false,
      observaciones: parsed.input.observaciones,
    }

    store.versiones.push(version)

    const sourceLines = store.lineas.filter((linea) => linea.versionId === base.id)

    for (const linea of sourceLines) {
      store.lineas.push({
        ...linea,
        id: nextLineaId(),
        versionId: version.id,
      })
    }

    return HttpResponse.json(versionResponse(version), { status: 201 })
  }),

  http.patch(
    "/api/presupuestos/:presupuestoId/versiones/:versionId",
    async ({ request, params }) => {
      const presupuestoId = resolveParam(params, "presupuestoId")
      const versionId = resolveParam(params, "versionId")

      if (!presupuestoId || !versionId) {
        return notFoundResponse()
      }

      const version = findVersion(presupuestoId, versionId)

      if (!version) {
        return notFoundResponse()
      }

      const body = await readJson(request)

      if (!isObject(body) || body.esInmutable !== true) {
        return validationResponse("La única actualización admitida es cerrar la versión.", {
          esInmutable: ["Enviá esInmutable=true para cerrar la versión."],
        })
      }

      if (version.esInmutable) {
        return conflictResponse("La versión ya está cerrada.", "esInmutable")
      }

      version.esInmutable = true
      return HttpResponse.json(versionResponse(version))
    },
  ),
]
