import { useRef } from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { useTheme } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navbar } from "@/components/Navbar"
import { useRouteAnnouncer } from "@/hooks/use-route-announcer"

export function AppLayout() {
  const { resolvedTheme } = useTheme()
  const mainRef = useRef<HTMLElement>(null)

  useRouteAnnouncer(mainRef)

  return (
    <SidebarProvider>
      {/* Primer elemento enfocable: permite saltear la navegación (WCAG 2.4.1) */}
      <a
        href="#contenido-principal"
        className="absolute top-2 left-2 z-50 -translate-y-16 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-md transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      <AppSidebar />

      <SidebarInset className="min-w-0">
        <Navbar />

        <main
          id="contenido-principal"
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 p-4 outline-none md:p-6"
        >
          <Outlet />
        </main>
      </SidebarInset>

      <Toaster theme={resolvedTheme} />
    </SidebarProvider>
  )
}
