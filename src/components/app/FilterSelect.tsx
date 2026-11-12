import { useId } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterSelectProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  items: Array<{ value: string; label: string }>
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Select etiquetado para barras de filtros. Mantiene el label asociado y
 * muestra las etiquetas legibles provistas por `items`.
 */
export function FilterSelect({
  label,
  value,
  onValueChange,
  items,
  disabled = false,
  className,
  id,
}: FilterSelectProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={controlId}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) {
            onValueChange(next)
          }
        }}
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={controlId} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
