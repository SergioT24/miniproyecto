import { type ColumnDef } from "@tanstack/react-table"

// 1. Tipado estricto de los datos
export type Presupuesto = {
  id: string
  monto: number
  detalle: string
  estado: string
}

// 2. Datos de prueba iniciales
export const datosDePrueba: Presupuesto[] = [
  {
    id: "1",
    monto: 150000,
    detalle: "Compra de elementos médicos",
    estado: "REALIZADO",
  },
  {
    id: "2",
    monto: 110000,
    detalle: "Compra de elementos médicos",
    estado: "PRE PRESUPUESTO",
  },
  {
    id: "3",
    monto: 275000,
    detalle: "Compra de elementos médicos",
    estado: "AJUSTE",
  },
]

// 3. Formato de moneda reutilizable (es-AR)
const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// 4. Estilos de estado usando los tokens del tema (funcionan en claro y oscuro)
const estilosEstado: Record<string, string> = {
  REALIZADO: "bg-success/10 text-success",
  "PRE PRESUPUESTO": "bg-muted text-muted-foreground",
  AJUSTE: "bg-warning/10 text-warning",
}

// 5. Definición de columnas tipadas específicamente para Presupuesto
export const columnas: ColumnDef<Presupuesto>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {formatoMoneda.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "detalle",
    header: "Detalle",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ getValue }) => {
      const estado = getValue<string>()

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            estilosEstado[estado.toUpperCase()] ??
            "bg-secondary text-secondary-foreground"
          }`}
        >
          {estado}
        </span>
      )
    },
  },
]
