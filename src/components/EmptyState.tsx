import type { ReactNode } from "react"
import { type LucideIcon, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
    
    icon?: LucideIcon
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

/*estado vacio se muestra cuando una sección tabla o lista no tiene datos*/
export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center",
                className
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
