import { describe, expect, it } from "vitest"
import { isRouteEnabled, resolveRouteMeta, routeMeta } from "./route-meta"

describe("resolveRouteMeta", () => {
  it("resuelve la ruta raíz", () => {
    expect(resolveRouteMeta("/")?.label).toBe("Tablero")
  })

  it("resuelve una ruta exacta", () => {
    expect(resolveRouteMeta("/presupuesto")?.title).toBe("Presupuesto")
  })

  it("resuelve una subruta por prefijo", () => {
    expect(resolveRouteMeta("/presupuesto/version-2026")?.title).toBe("Presupuesto")
  })

  it("devuelve undefined para rutas desconocidas", () => {
    expect(resolveRouteMeta("/no-existe")).toBeUndefined()
  })

  it("no confunde rutas con prefijos parecidos", () => {
    expect(resolveRouteMeta("/presupuesto-otro")).toBeUndefined()
  })
})

describe("isRouteEnabled", () => {
  it("expone la galería solo en desarrollo", () => {
    const gallery = routeMeta.find((route) => route.path === "/dev/ui")

    expect(gallery).toBeDefined()
    expect(gallery && isRouteEnabled(gallery)).toBe(import.meta.env.DEV)
  })
})
