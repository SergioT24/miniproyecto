import { useState } from "react"
import { AlertTriangle, CircleHelp } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ChartCard } from "@/components/app/ChartCard"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { FilterSelect } from "@/components/app/FilterSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function NavigationComponentsDemo() {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/presupuesto">Presupuesto</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/cashflow">Reportes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Resumen anual</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Separator />

      <Tabs defaultValue="mes">
        <TabsList aria-label="Período del resumen">
          <TabsTrigger value="mes">Mes</TabsTrigger>
          <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
          <TabsTrigger value="anio">Año</TabsTrigger>
        </TabsList>
        <TabsContent value="mes" className="pt-3">
          Resumen del mes seleccionado.
        </TabsContent>
        <TabsContent value="trimestre" className="pt-3">
          Resumen del trimestre seleccionado.
        </TabsContent>
        <TabsContent value="anio" className="pt-3">
          Resumen del año seleccionado.
        </TabsContent>
      </Tabs>

      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              aria-describedby={tooltipOpen ? "periodos-tooltip" : undefined}
            >
              <CircleHelp aria-hidden="true" />
              Ayuda sobre los períodos
            </Button>
          }
        />
        <TooltipContent id="periodos-tooltip">Elegí el período que querés comparar.</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function FilterAndFieldComponentsDemo() {
  const [periodo, setPeriodo] = useState("mes")
  const [incluirCerrados, setIncluirCerrados] = useState(false)
  const [observaciones, setObservaciones] = useState("")

  return (
    <div className="grid gap-5 rounded-xl border bg-card p-5 md:grid-cols-2">
      <div className="space-y-4">
        <FilterSelect
          label="Período"
          value={periodo}
          onValueChange={setPeriodo}
          items={[
            { value: "mes", label: "Este mes" },
            { value: "trimestre", label: "Este trimestre" },
            { value: "anio", label: "Este año" },
          ]}
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Período aplicado: {periodo}.
        </p>
      </div>

      <FieldSet>
        <FieldLegend>Opciones del informe</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox
              id="incluir-cerrados-demo"
              checked={incluirCerrados}
              onCheckedChange={(checked) => setIncluirCerrados(checked === true)}
            />
            <FieldContent>
              <FieldLabel htmlFor="incluir-cerrados-demo">Incluir períodos cerrados</FieldLabel>
              <FieldDescription>Agrega datos de períodos que ya fueron cerrados.</FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="observaciones-demo">Observaciones</FieldLabel>
            <Textarea
              id="observaciones-demo"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              placeholder="Agregá un comentario para el informe"
            />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

function ChartPreview() {
  return (
    <svg
      viewBox="0 0 640 220"
      className="h-full w-full"
      role="img"
      aria-label="Ingresos mensuales con tendencia creciente"
    >
      <path d="M24 190H616M24 140H616M24 90H616M24 40H616" className="stroke-border" />
      <path
        d="m36 164 94-35 94 18 94-56 94 24 94-70 94 12"
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChartCardDemo() {
  return (
    <ChartCard
      title="Ingresos por mes"
      description="Comparación ilustrativa del período actual."
      className="max-w-2xl"
    >
      <ChartPreview />
    </ChartCard>
  )
}

export function AlertDialogDemo() {
  const [open, setOpen] = useState(false)
  const [resultado, setResultado] = useState("No se eliminó ningún registro.")

  return (
    <div className="space-y-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button variant="destructive">
              <AlertTriangle aria-hidden="true" />
              Eliminar informe
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el informe?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setResultado("Informe eliminado (demo).")
                setOpen(false)
              }}
            >
              Eliminar informe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-sm text-muted-foreground">
        {resultado}
      </p>
    </div>
  )
}
