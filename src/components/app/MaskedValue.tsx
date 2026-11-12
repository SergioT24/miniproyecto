import { useId, useState, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MaskedValueProps {
  children: ReactNode
  /** Contexto para lectores de pantalla, por ejemplo “Saldo total”. */
  label?: string
  defaultVisible?: boolean
  showLabel?: string
  hideLabel?: string
  maskedLabel?: string
  className?: string
}

/**
 * Oculta un valor sensible con un botón de mostrar/ocultar.
 * El estado se comunica con `aria-pressed`, y el valor oculto tiene una
 * alternativa textual para lectores de pantalla.
 */
export function MaskedValue({
  children,
  label,
  defaultVisible = false,
  showLabel = "Mostrar valor",
  hideLabel = "Ocultar valor",
  maskedLabel = "Valor oculto",
  className,
}: MaskedValueProps) {
  const [visible, setVisible] = useState(defaultVisible)
  const valueId = useId()

  return (
    <span data-slot="masked-value" className={cn("inline-flex items-center gap-1.5", className)}>
      {label && <span className="sr-only">{label}: </span>}

      <span id={valueId} aria-live="polite">
        {visible ? (
          children
        ) : (
          <>
            <span aria-hidden="true">••••••</span>
            <span className="sr-only">{maskedLabel}</span>
          </>
        )}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={visible}
        aria-controls={valueId}
        aria-label={visible ? hideLabel : showLabel}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </span>
  )
}
