import type { CatalogKey } from "./types"

export interface CatalogMeta {
  /** Nombre del catálogo en plural. */
  label: string
  /** Sustantivo singular sin artículo. */
  singular: string
  /** Artículo que corresponde al sustantivo. */
  article: string
  /** Sustantivo con la contracción “de”, para descripciones. */
  deSingular: string
  /** Texto del botón de alta. */
  createLabel: string
  description: string
  emptyTitle: string
  /** Columna por la que se ordena inicialmente. */
  defaultSort: string
}

export const catalogMeta: Record<CatalogKey, CatalogMeta> = {
  proyectos: {
    label: "Proyectos",
    singular: "proyecto",
    article: "el",
    deSingular: "del proyecto",
    createLabel: "Nuevo proyecto",
    description:
      "Proyectos y centros de costo con su dirección, financiador y estado de ejecución.",
    emptyTitle: "No hay proyectos cargados",
    defaultSort: "nombre",
  },
  direcciones: {
    label: "Direcciones",
    singular: "dirección",
    article: "la",
    deSingular: "de la dirección",
    createLabel: "Nueva dirección",
    description: "Áreas responsables de los proyectos y centros de costo.",
    emptyTitle: "No hay direcciones cargadas",
    defaultSort: "nombre",
  },
  financiadores: {
    label: "Financiadores",
    singular: "financiador",
    article: "el",
    deSingular: "del financiador",
    createLabel: "Nuevo financiador",
    description: "Organismos y organizaciones que financian los proyectos.",
    emptyTitle: "No hay financiadores cargados",
    defaultSort: "nombre",
  },
  categorias: {
    label: "Categorías",
    singular: "categoría",
    article: "la",
    deSingular: "de la categoría",
    createLabel: "Nueva categoría",
    description: "Conceptos de ingreso y egreso, separados entre estructura fija y proyecto.",
    emptyTitle: "No hay categorías cargadas",
    defaultSort: "nombre",
  },
  monedas: {
    label: "Monedas",
    singular: "moneda",
    article: "la",
    deSingular: "de la moneda",
    createLabel: "Nueva moneda",
    description: "Monedas habilitadas para presupuestar y registrar movimientos.",
    emptyTitle: "No hay monedas cargadas",
    defaultSort: "codigo",
  },
  "parametros-mensuales": {
    label: "Parámetros mensuales",
    singular: "parámetro mensual",
    article: "el",
    deSingular: "del parámetro mensual",
    createLabel: "Nuevo parámetro",
    description: "Tipo de cambio CCL y Nación e inflación mensual usados por las proyecciones.",
    emptyTitle: "No hay parámetros mensuales cargados",
    defaultSort: "mes",
  },
}
