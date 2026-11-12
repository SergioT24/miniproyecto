import type { ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type EmptyStateIllustration = "generic" | "charts" | "accounts" | "movements"

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  /** Ilustración decorativa. Por defecto usa la genérica. */
  illustration?: EmptyStateIllustration
  /** Ícono simple; si se pasa, reemplaza a la ilustración. */
  icon?: LucideIcon
  className?: string
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex h-40 w-64 max-w-full items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute inset-6 rounded-full bg-accent/70" />
      <svg
        viewBox="0 0 240 160"
        className="relative h-full w-full text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {children}
      </svg>
    </div>
  )
}

function Sparkles() {
  return (
    <g className="text-muted-foreground/30">
      <path d="M58 46v6M55 49h6" />
      <path d="M202 64v6M199 67h6" />
      <path d="M48 122v6M45 125h6" />
      <path d="M196 118v6M193 121h6" />
    </g>
  )
}

function GenericIllustration() {
  return (
    <Frame>
      <Sparkles />

      {/* Documento que asoma detrás de la carpeta */}
      <g transform="rotate(8 128 70)">
        <rect x="96" y="36" width="64" height="58" rx="4" className="fill-card" />
        <circle cx="118" cy="58" r="2" className="fill-muted-foreground/40" />
        <circle cx="138" cy="58" r="2" className="fill-muted-foreground/40" />
        <path d="M118 70c4 4 12 4 16 0" />
      </g>

      {/* Carpeta */}
      <path
        d="M58 78c0-3 2-5 5-5h38l9 9h67c3 0 5 2 5 5v42c0 3-2 5-5 5H63c-3 0-5-2-5-5V78Z"
        className="fill-card"
      />

      {/* Lupa */}
      <circle cx="160" cy="100" r="22" className="fill-card" />
      <path d="m176 116 14 14" />
    </Frame>
  )
}

function ChartsIllustration() {
  return (
    <Frame>
      <Sparkles />

      <rect x="70" y="48" width="100" height="70" rx="6" className="fill-card" />

      {/* Barras */}
      <g className="fill-muted-foreground/20" stroke="none">
        <rect x="82" y="90" width="8" height="18" rx="2" />
        <rect x="98" y="78" width="8" height="30" rx="2" />
        <rect x="114" y="84" width="8" height="24" rx="2" />
        <rect x="130" y="68" width="8" height="40" rx="2" />
        <rect x="146" y="86" width="8" height="22" rx="2" />
      </g>

      {/* Línea */}
      <polyline
        points="82,96 98,86 114,92 130,76 146,84"
        className="stroke-primary/50"
        fill="none"
      />

      {/* Insignia de cierre */}
      <circle cx="172" cy="44" r="18" className="fill-card" />
      <path d="m166 38 12 12M178 38l-12 12" />
    </Frame>
  )
}

function AccountsIllustration() {
  return (
    <Frame>
      <Sparkles />

      {/* Banco */}
      <path d="M68 70 120 42l52 28H68Z" className="fill-card" />
      <circle cx="120" cy="62" r="10" className="fill-card" />
      <text
        x="120"
        y="66"
        textAnchor="middle"
        className="fill-muted-foreground/60 text-[10px] font-semibold"
        stroke="none"
      >
        $
      </text>
      <path d="M78 76h84" />

      {/* Columnas */}
      <rect x="82" y="80" width="14" height="38" rx="2" className="fill-card" />
      <rect x="113" y="80" width="14" height="38" rx="2" className="fill-card" />
      <rect x="144" y="80" width="14" height="38" rx="2" className="fill-card" />

      {/* Base */}
      <rect x="70" y="118" width="100" height="8" rx="2" className="fill-card" />
    </Frame>
  )
}

function MovementsIllustration() {
  return (
    <Frame>
      <Sparkles />

      {/* Documento */}
      <rect x="78" y="42" width="82" height="78" rx="6" className="fill-card" />
      <path d="M140 42v20h20" />

      {/* Filas */}
      <g className="fill-muted" stroke="none">
        <rect x="92" y="62" width="54" height="12" rx="3" />
        <rect x="92" y="82" width="54" height="12" rx="3" />
        <rect x="92" y="102" width="54" height="12" rx="3" />
      </g>
      <g className="fill-muted-foreground/40" stroke="none">
        <circle cx="100" cy="68" r="2" />
        <circle cx="108" cy="68" r="2" />
        <circle cx="116" cy="68" r="2" />
        <circle cx="100" cy="88" r="2" />
        <circle cx="108" cy="88" r="2" />
        <circle cx="116" cy="88" r="2" />
        <circle cx="100" cy="108" r="2" />
        <circle cx="108" cy="108" r="2" />
        <circle cx="116" cy="108" r="2" />
      </g>

      {/* Lupa */}
      <circle cx="158" cy="86" r="24" className="fill-card" />
      <path d="m176 104 14 14" />
    </Frame>
  )
}

const illustrations: Record<EmptyStateIllustration, () => ReactNode> = {
  generic: GenericIllustration,
  charts: ChartsIllustration,
  accounts: AccountsIllustration,
  movements: MovementsIllustration,
}

export function EmptyState({
  title,
  description,
  action,
  illustration = "generic",
  icon: Icon,
  className,
}: EmptyStateProps) {
  const Illustration = illustrations[illustration]

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 p-6 text-center", className)}
    >
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <Illustration />
      )}

      <h2 className="text-base font-medium text-muted-foreground">{title}</h2>
      {description && <p className="max-w-sm text-sm text-muted-foreground/80">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
