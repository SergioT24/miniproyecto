import { z } from "zod"
import { monthStart, parseDate, toIsoDate } from "@/lib/format/dates"
import {
  codigosMoneda,
  estadosProyecto,
  gradosCerteza,
  tiposCategoria,
  type ParametroMensual,
  type ParametroMensualInput,
} from "./types"

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(100, "El nombre no puede superar los 100 caracteres.")

export const direccionSchema = z.object({
  nombre: nombreSchema,
})

export const financiadorSchema = z.object({
  nombre: nombreSchema,
})

export const categoriaSchema = z.object({
  nombre: nombreSchema,
  tipo: z.enum(tiposCategoria, { error: "Elegí el tipo de categoría." }),
})

export const monedaSchema = z.object({
  codigo: z.enum(codigosMoneda, { error: "Elegí el código de la moneda." }),
  descripcion: z
    .string()
    .trim()
    .min(2, "La descripción debe tener al menos 2 caracteres.")
    .max(40, "La descripción no puede superar los 40 caracteres."),
})

export const proyectoSchema = z.object({
  nombre: nombreSchema,
  direccionId: z.string().min(1, "Elegí una dirección."),
  financiadorId: z.string().nullable(),
  estado: z.enum(estadosProyecto, { error: "Elegí un estado." }),
  gradoCerteza: z.enum(gradosCerteza).nullable(),
  esFicticioEstructura: z.boolean(),
})

export const parametroMensualSchema = z.object({
  mes: z.date({ error: "Elegí el mes del parámetro." }),
  tipoCambioCcl: z
    .number({ error: "Ingresá un tipo de cambio CCL válido." })
    .positive("El tipo de cambio CCL debe ser mayor a 0.")
    .optional(),
  tipoCambioNacion: z
    .number({ error: "Ingresá un tipo de cambio Nación válido." })
    .positive("El tipo de cambio Nación debe ser mayor a 0.")
    .optional(),
  inflacionPorcentaje: z
    .number({ error: "Ingresá la inflación mensual." })
    .min(0, "La inflación no puede ser negativa.")
    .max(100, "La inflación no puede superar el 100 %."),
})

export type DireccionFormValues = z.infer<typeof direccionSchema>
export type FinanciadorFormValues = z.infer<typeof financiadorSchema>
export type CategoriaFormValues = z.infer<typeof categoriaSchema>
export type MonedaFormValues = z.infer<typeof monedaSchema>
export type ProyectoFormValues = z.infer<typeof proyectoSchema>
export type ParametroMensualFormValues = z.infer<typeof parametroMensualSchema>

export function parametroMensualToInput(values: ParametroMensualFormValues): ParametroMensualInput {
  return {
    mes: toIsoDate(monthStart(values.mes)),
    tipoCambioCcl: values.tipoCambioCcl ?? null,
    tipoCambioNacion: values.tipoCambioNacion ?? null,
    inflacionMensual: values.inflacionPorcentaje / 100,
  }
}

export function parametroMensualToFormValues(
  parametro: ParametroMensual,
): ParametroMensualFormValues {
  return {
    mes: parseDate(parametro.mes) ?? new Date(),
    tipoCambioCcl: parametro.tipoCambioCcl ?? undefined,
    tipoCambioNacion: parametro.tipoCambioNacion ?? undefined,
    inflacionPorcentaje: parametro.inflacionMensual * 100,
  }
}
