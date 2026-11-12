import type { ReactElement } from "react"
import { Link } from "react-router-dom"
import { useCurrentRouteMeta, isRouteEnabled, routeMeta, routeSections } from "@/app/route-meta"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar(): ReactElement {
  const currentRoute = useCurrentRouteMeta()

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div role="complementary" aria-label="Barra lateral" className="flex size-full flex-col">
        <SidebarHeader className="flex flex-row items-center gap-2 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <img src="/logo.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
            <span className="text-sm leading-tight font-semibold">Fundación Huésped</span>
            <span className="text-xs text-sidebar-muted-foreground">Finanzas</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <nav aria-label="Navegación principal">
            {routeSections.map((section) => {
              const items = routeMeta.filter(
                (route) => route.section === section && isRouteEnabled(route),
              )

              if (items.length === 0) {
                return null
              }

              return (
                <SidebarGroup key={section}>
                  <SidebarGroupLabel>{section}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={currentRoute?.path === item.path}
                            aria-current={currentRoute?.path === item.path ? "page" : undefined}
                            render={<Link to={item.path} />}
                          >
                            <item.icon aria-hidden="true" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )
            })}
          </nav>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <p className="text-xs text-sidebar-muted-foreground group-data-[collapsible=icon]:hidden">
            Datos de demostración
          </p>
        </SidebarFooter>

        <SidebarRail />
      </div>
    </Sidebar>
  )
}
