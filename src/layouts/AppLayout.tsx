import { Toaster } from "@/components/ui/sonner"
import { useTheme } from "@/components/theme-provider"
import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navbar } from "@/components/Navbar"

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const { resolvedTheme } = useTheme()

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="min-w-0">
                <Navbar />

                <div className="flex-1 p-6">{children}</div>
            </SidebarInset>

            <Toaster theme={resolvedTheme} />
        </SidebarProvider>
    )
}
