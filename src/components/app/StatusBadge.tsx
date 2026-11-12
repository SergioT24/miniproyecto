import type { ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusBadgeTone = "neutral" | "info" | "success" | "warning" | "danger"

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
}

export interface StatusBadgeProps {
  children: ReactNode
  tone?: StatusBadgeTone
  icon?: LucideIcon
  className?: string
}

/**
 * Estado con texto siempre visible: el color acompaña, nunca es la única
 * señal. El significado concreto de cada estado lo define el dominio.
 */
export function StatusBadge({
  children,
  tone = "neutral",
  icon: Icon,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="status-badge"
      data-tone={tone}
      className={cn(toneClasses[tone], className)}
    >
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </Badge>
  )
}
