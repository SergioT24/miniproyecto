import { type LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type MetricTrend = "up" | "down" | "neutral"

export interface MetricCardProps {
   
    label: string
    value: string
    unit?: string
    icon?: LucideIcon
    change?: string
    trend?: MetricTrend
    description?: string
    className?: string
}

const trendStyles: Record<MetricTrend, { icon: LucideIcon; className: string }> = {
    up: { icon: TrendingUp, className: "text-success" },
    down: { icon: TrendingDown, className: "text-destructive" },
    neutral: { icon: Minus, className: "text-muted-foreground" },
}

export function MetricCard({
    label,
    value,
    unit,
    icon: Icon,
    change,
    trend = "neutral",
    description,
    className,
}: MetricCardProps) {
    const { icon: TrendIcon, className: trendClassName } = trendStyles[trend]

    return (
        <div
            className={cn(
                "rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {Icon && (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                    </span>
                )}
            </div>

            <p className="mt-2 text-2xl font-bold">
                {value}
                {unit && <span className="ml-1.5 text-sm font-medium text-muted-foreground">{unit}</span>}
            </p>

            {(change || description) && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
                    {change && (
                        <span className={cn("flex items-center gap-1 font-medium", trendClassName)}>
                            <TrendIcon className="size-4" aria-hidden="true" />
                            {change}
                        </span>
                    )}
                    {description && <span className="text-muted-foreground">{description}</span>}
                </div>
            )}
        </div>
    )
}
