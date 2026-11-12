import { startOfMonth } from "date-fns"
import { z } from "zod"
import { formatDate, parseDate, toIsoDate } from "@/lib/format/dates"
import { codigosMoneda, gradosCerteza } from "@/features/parametros/types"
import { estadosCobroPago, tiposMovimiento, type Movimiento, type MovimientoInput } from "./types"

export interface PeriodoMovimiento {
  fechaInicio: string
  fechaFin: string
}

function textoOpcional(max: number, mensaje: string) {
  return z.string().trim().max(max, mensaje)
}

export function createMovimientoSchema(periodo: PeriodoMovimiento) {
  const rango = `La fecha debe estar entre ${formatDate(periodo.fechaInicio)} y ${formatDate(periodo.fechaFin)}.`

  return z
    .object({
      tipo: z.enum(tiposMovimiento),
      concepto: z
        .string()
        .trim()
        .min(2, "El concepto debe tener al menos 2 caracteres.")
        .max(150, "El concepto no puede superar los 150 caracteres."),
      proyectoId: z.string().min(1, "Elegí un proyecto."),
      categoriaId: z.string().min(1, "Elegí una categoría."),
      moneda: z.enum(codigosMoneda),
      importeOriginal: z
        .number({ error: "Ingresá un importe válido." })
        .nullable()
        .refine((value) => value !== null && value > 0, {
          message: "El importe debe ser mayor a cero.",
        }),
      fechaProbable: z
        .date({ error: "Elegí la fecha probable." })
        .refine(
          (value) => {
            const iso = toIsoDate(value)
            return iso >= periodo.fechaInicio && iso <= periodo.fechaFin
          },
          { message: rango },
        ),
      fechaPrevistaOriginal: z
        .date({ error: "Elegí una fecha válida." })
        .nullable()
        .refine(
          (value) => {
            if (value === null) {
              return true
            }

            const iso = toIsoDate(value)
            return iso >= periodo.fechaInicio && iso <= periodo.fechaFin
          },
          { message: rango },
        ),
      gradoCerteza: z.enum(gradosCerteza).nullable(),
      estadoCobroPago: z.enum(estadosCobroPago),
      cuentaDestino: textoOpcional(50, "La cuenta no puede superar los 50 caracteres."),
      condicionCobro: textoOpcional(50, "La condición no puede superar los 50 caracteres."),
      proveedorDestinatario: textoOpcional(
        120,
        "El proveedor no puede superar los 120 caracteres.",
      ),
      cuentaOrigen: textoOpcional(50, "La cuenta no puede superar los 50 caracteres."),
      tipoGasto: textoOpcional(80, "El tipo de gasto no puede superar los 80 caracteres."),
    })
    .superRefine((values, ctx) => {
      if (values.tipo === "ingreso" && values.estadoCobroPago === "pagado") {
        ctx.addIssue({
          code: "custom",
          path: ["estadoCobroPago"],
          message: "Un ingreso no puede estar pagado.",
        })
      }

      if (values.tipo === "egreso" && values.estadoCobroPago === "cobrado") {
        ctx.addIssue({
          code: "custom",
          path: ["estadoCobroPago"],
          message: "Un egreso no puede estar cobrado.",
        })
      }
    })
}

export type MovimientoFormValues = z.infer<ReturnType<typeof createMovimientoSchema>>

function requireImporte(value: number | null) {
  if (value === null) {
    throw new Error("El importe es obligatorio.")
  }

  return value
}

function textoONull(value: string) {
  const texto = value.trim()
  return texto || null
}

/** Convierte los valores del formulario al contrato de la API. */
export function movimientoToInput(values: MovimientoFormValues): MovimientoInput {
  const esIngreso = values.tipo === "ingreso"

  return {
    tipo: values.tipo,
    concepto: values.concepto.trim(),
    proyectoId: values.proyectoId,
    categoriaId: values.categoriaId,
    moneda: values.moneda,
    importeOriginal: requireImporte(values.importeOriginal),
    fechaProbable: toIsoDate(values.fechaProbable),
    fechaPrevistaOriginal: values.fechaPrevistaOriginal
      ? toIsoDate(values.fechaPrevistaOriginal)
      : null,
    gradoCerteza: values.gradoCerteza,
    estadoCobroPago: values.estadoCobroPago,
    ingresoDetalle: esIngreso
      ? {
          cuentaDestino: textoONull(values.cuentaDestino),
          condicionCobro: textoONull(values.condicionCobro),
        }
      : null,
    egresoDetalle: esIngreso
      ? null
      : {
          proveedorDestinatario: textoONull(values.proveedorDestinatario),
          cuentaOrigen: textoONull(values.cuentaOrigen),
          tipoGasto: textoONull(values.tipoGasto),
        },
  }
}

function fechaProbableInicial(periodo: PeriodoMovimiento) {
  const hoy = startOfMonth(new Date())
  const iso = toIsoDate(hoy)

  if (iso >= periodo.fechaInicio && iso <= periodo.fechaFin) {
    return hoy
  }

  return parseDate(periodo.fechaInicio) ?? hoy
}

/** Valores iniciales del formulario de alta o edición. */
export function movimientoToFormValues(
  movimiento: Movimiento | null,
  periodo: PeriodoMovimiento,
): MovimientoFormValues {
  return {
    tipo: movimiento?.tipo ?? "ingreso",
    concepto: movimiento?.concepto ?? "",
    proyectoId: movimiento?.proyectoId ?? "",
    categoriaId: movimiento?.categoriaId ?? "",
    moneda: movimiento?.moneda ?? "ARS",
    importeOriginal: movimiento?.importeOriginal ?? null,
    fechaProbable:
      (movimiento ? parseDate(movimiento.fechaProbable) : null) ?? fechaProbableInicial(periodo),
    fechaPrevistaOriginal: movimiento?.fechaPrevistaOriginal
      ? parseDate(movimiento.fechaPrevistaOriginal)
      : null,
    gradoCerteza: movimiento?.gradoCerteza ?? "Alta",
    estadoCobroPago: movimiento?.estadoCobroPago ?? "previsto",
    cuentaDestino: movimiento?.ingresoDetalle?.cuentaDestino ?? "",
    condicionCobro: movimiento?.ingresoDetalle?.condicionCobro ?? "",
    proveedorDestinatario: movimiento?.egresoDetalle?.proveedorDestinatario ?? "",
    cuentaOrigen: movimiento?.egresoDetalle?.cuentaOrigen ?? "",
    tipoGasto: movimiento?.egresoDetalle?.tipoGasto ?? "",
  }
}
