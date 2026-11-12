import { useState } from "react"
import { addYears, format, isSameMonth, setMonth, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatMonth, parseDate } from "@/lib/format/dates"
import { cn } from "@/lib/utils"

export interface MonthPickerProps {
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Selector de mes. `Calendar` no tiene modo “solo mes”, por eso se usa una
 * grilla de botones dentro de un `Popover` con navegación por año.
 */
export function MonthPicker({
  id,
  value,
  onChange,
  placeholder = "Elegir mes",
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const selectedMonth = value ? parseDate(value) : null
  const [viewDate, setViewDate] = useState<Date>(() => selectedMonth ?? new Date())

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setViewDate(selectedMonth ?? new Date())
    }

    setOpen(nextOpen)
  }

  function handleSelect(month: number) {
    onChange(startOfMonth(setMonth(viewDate, month)))
    setOpen(false)
  }

  const months = Array.from({ length: 12 }, (_, month) => {
    const monthDate = setMonth(viewDate, month)
    const selected = selectedMonth ? isSameMonth(monthDate, selectedMonth) : false

    return { month, monthDate, selected }
  })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
        <CalendarDays aria-hidden="true" />
        {selectedMonth ? formatMonth(selectedMonth) : placeholder}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año anterior"
            onClick={() => setViewDate((current) => addYears(current, -1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>

          <span className="text-sm font-medium" aria-live="polite">
            {format(viewDate, "yyyy")}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año siguiente"
            onClick={() => setViewDate((current) => addYears(current, 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        <div
          role="group"
          aria-label={`Meses de ${format(viewDate, "yyyy")}`}
          className="grid grid-cols-3 gap-1"
        >
          {months.map(({ month, monthDate, selected }) => (
            <Button
              key={month}
              type="button"
              variant={selected ? "default" : "ghost"}
              size="sm"
              aria-pressed={selected}
              aria-label={formatMonth(monthDate)}
              onClick={() => handleSelect(month)}
              className="justify-center"
            >
              {capitalize(format(monthDate, "MMM", { locale: es }).replace(".", ""))}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
