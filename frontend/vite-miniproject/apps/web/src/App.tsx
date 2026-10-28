import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./components/AppSidebar.tsx"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger className="md:hidden" />
      </main>
    </SidebarProvider>
  )
}