import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate, parseDate } from "@/lib/format/dates"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  id?: string
  value: Date | string | null
  onChange: (value: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  "aria-label"?: string
}

/**
 * Selector de fecha con `Calendar` dentro de un `Popover`.
 * El botón muestra la fecha formateada y conserva el foco al cerrar.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Elegir fecha",
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = value ? parseDate(value) : null

  function handleSelect(date: Date | undefined) {
    onChange(date ?? null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            aria-label={ariaLabel}
            className={cn("w-full justify-start font-normal", className)}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {selectedDate ? formatDate(selectedDate) : placeholder}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          defaultMonth={selectedDate ?? undefined}
          onSelect={handleSelect}
          locale={es}
          labels={{
            labelNav: () => "Navegación del calendario",
            labelPrevious: () => "Mes anterior",
            labelNext: () => "Mes siguiente",
            labelGrid: (month) => `Días de ${format(month, "MMMM 'de' yyyy", { locale: es })}`,
            labelDayButton: (date) => format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
