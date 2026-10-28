import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "./components/AppSidebar.tsx"
import { Navbar } from "./components/navbar.tsx"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full min-w-0">
        <Navbar />
      </main>
    </SidebarProvider>
  )
}