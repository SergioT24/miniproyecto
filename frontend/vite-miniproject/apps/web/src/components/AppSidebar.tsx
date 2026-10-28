import React from "react"
import { type LucideIcon, Home, Inbox, Calendar, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@workspace/ui/components/sidebar"

interface NavItem {
    title: string
    url: string
    icon: LucideIcon
}

const platformItems: NavItem[] = [
    { title: "Inicio", url: "#", icon: Home },
    { title: "Bandeja de entrada", url: "#", icon: Inbox },
    { title: "Calendario", url: "#", icon: Calendar },
    { title: "Configuración", url: "#", icon: Settings },
]

export function AppSidebar(): React.ReactElement {
    return (
        <Sidebar collapsible="icon" className="border-r-0">
            <SidebarHeader className="flex flex-row items-center gap-2 p-3">
                {/* Logo o Avatar */}
                <div className="flex h-8 w-8 items-center justify-center shrink-0">
                    <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold leading-tight">Fundación Huésped</span>
                    <span className="text-xs text-sidebar-foreground/70">Finanzas</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {platformItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        render={<a href={item.url} />}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-semibold text-xs shrink-0">
                        VA
                    </div>
                    <div className="flex flex-col text-left text-xs group-data-[collapsible=icon]:hidden">
                        <span className="font-medium">Vanesa Acosta</span>
                        <span className="text-sidebar-foreground/60 text-[10px]">va@ejemplo.com</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}