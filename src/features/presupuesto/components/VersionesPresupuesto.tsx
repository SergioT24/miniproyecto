import { Eye, Lock } from "lucide-react"
import { StatusBadge } from "@/components/app/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatARS, formatDateTime } from "@/lib/format"
import type { VersionProyeccion } from "../types"

function formatAmount(value: number) {
  return formatARS(value, { maximumFractionDigits: 0 })
}

export interface VersionesPresupuestoProps {
  versiones: VersionProyeccion[]
  activeVersionId: string
  onSelect: (versionId: string) => void
  onCloseRequest: (version: VersionProyeccion) => void
}

/**
 * Historial de versiones del presupuesto. Las versiones cerradas son
 * inmutables y no ofrecen la acción de cierre.
 */
export function VersionesPresupuesto({
  versiones,
  activeVersionId,
  onSelect,
  onCloseRequest,
}: VersionesPresupuestoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Versiones del presupuesto</CardTitle>
        <CardDescription>
          Cada versión congela las líneas de un corte temporal. Las versiones cerradas no admiten
          cambios en sus líneas ni parámetros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="sr-only">Versiones del presupuesto</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Versión</TableHead>
              <TableHead scope="col">Creada</TableHead>
              <TableHead scope="col">Estado</TableHead>
              <TableHead scope="col" className="text-right">
                Líneas
              </TableHead>
              <TableHead scope="col" className="text-right">
                Ingresos
              </TableHead>
              <TableHead scope="col" className="text-right">
                Egresos
              </TableHead>
              <TableHead scope="col" className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versiones.map((version) => {
              const isActive = version.id === activeVersionId

              return (
                <TableRow key={version.id} data-state={isActive ? "selected" : undefined}>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{version.nombre}</span>
                      {isActive && <StatusBadge tone="info">En uso</StatusBadge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(version.fechaCreacion)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={version.esInmutable ? "neutral" : "success"}>
                      {version.esInmutable ? "Cerrada" : "Abierta"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{version.totalLineas}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(version.totalIngresos)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(version.totalEgresos)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Ver resumen de la versión ${version.nombre}`}
                        onClick={() => onSelect(version.id)}
                      >
                        <Eye aria-hidden="true" />
                        Ver resumen
                      </Button>
                      {!version.esInmutable && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Cerrar la versión ${version.nombre}`}
                          onClick={() => onCloseRequest(version)}
                        >
                          <Lock aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
