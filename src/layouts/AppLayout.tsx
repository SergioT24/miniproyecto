import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navbar } from "@/components/Navbar"

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="min-w-0">
                <Navbar />

                <div className="flex-1 p-6">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
