import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export interface FormActionsProps extends ComponentProps<"div"> {
  /** Alineación de los botones en pantallas grandes. */
  align?: "start" | "end" | "between"
}

const alignmentClasses = {
  start: "sm:justify-start",
  end: "sm:justify-end",
  between: "sm:justify-between",
} as const

/** Barra de acciones al pie de un formulario. */
export function FormActions({ align = "end", className, children, ...props }: FormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center",
        alignmentClasses[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
