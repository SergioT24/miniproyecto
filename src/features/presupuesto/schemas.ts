import { z } from "zod"
import type { NuevaVersionInput } from "./types"

export const nuevaVersionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(30, "El nombre no puede superar los 30 caracteres."),
  versionBaseId: z.string().min(1, "Elegí una versión base."),
  observaciones: z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden superar los 500 caracteres."),
})

export type NuevaVersionFormValues = z.infer<typeof nuevaVersionSchema>

export function nuevaVersionToInput(values: NuevaVersionFormValues): NuevaVersionInput {
  return {
    nombre: values.nombre.trim(),
    versionBaseId: values.versionBaseId,
    observaciones: values.observaciones.trim() || null,
  }
}
