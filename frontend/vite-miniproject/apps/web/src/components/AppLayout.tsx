import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Navbar } from "./Navbar"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <div className="flex flex-1 flex-col">
                    <Navbar />

                    <main className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}