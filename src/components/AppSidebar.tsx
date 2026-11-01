import type { ReactElement } from "react"
import { Link, useLocation } from "react-router-dom"
import { sidebarNav } from "@/lib/nav"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar(): ReactElement {
    const { pathname } = useLocation()

    return (
        <Sidebar collapsible="icon" className="border-r-0">
            <div
                role="complementary"
                aria-label="Barra lateral"
                className="flex size-full flex-col"
            >
                <SidebarHeader className="flex flex-row items-center gap-2 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        <img
                            src="/logo.png"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                        <span className="text-sm leading-tight font-semibold">
                            Fundación Huésped
                        </span>
                        <span className="text-xs text-sidebar-muted-foreground">
                            Finanzas
                        </span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <nav aria-label="Navegación principal">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {sidebarNav.map((item) => (
                                        <SidebarMenuItem key={item.to}>
                                            <SidebarMenuButton
                                                tooltip={item.label}
                                                isActive={pathname === item.to}
                                                aria-current={
                                                    pathname === item.to
                                                        ? "page"
                                                        : undefined
                                                }
                                                render={<Link to={item.to} />}
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </nav>
                </SidebarContent>

                <SidebarFooter className="p-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-semibold text-white">
                            VA
                        </div>
                        <div className="flex flex-col text-left text-xs group-data-[collapsible=icon]:hidden">
                            <span className="font-medium">Vanesa Acosta</span>
                            <span className="text-[10px] text-sidebar-muted-foreground">
                                va@ejemplo.com
                            </span>
                        </div>
                    </div>
                </SidebarFooter>

                <SidebarRail />
            </div>
        </Sidebar>
    )
}
