import { ChevronRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useCurrentRouteMeta } from "@/app/route-meta"

export function Navbar() {
  const meta = useCurrentRouteMeta()

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3 md:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger />
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="hidden text-muted-foreground sm:block">
                {meta?.section ?? "Finanzas"}
              </li>
              <li aria-hidden="true" className="hidden sm:block">
                <ChevronRight className="size-4 text-muted-foreground" />
              </li>
              <li aria-current="page" className="truncate font-medium">
                {meta?.label ?? "Página no encontrada"}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
