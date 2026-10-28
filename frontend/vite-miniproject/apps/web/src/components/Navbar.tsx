import { ChevronDown, Search } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Input } from "@workspace/ui/components/input"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import { componentGalleryNav, mainNav } from "@/lib/nav"
import { ThemeToggle } from "./ThemeToggle"

function NavLink({ label, to }: { label: string; to: string }) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Link
      to={to}
      className={
        active
          ? "font-medium text-primary"
          : "font-medium text-foreground hover:text-primary"
      }
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 w-full border-b bg-card">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <ThemeToggle />
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-semibold">Tablero</span>
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar"
            className="w-full pl-8"
          />
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {mainNav.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-medium hover:text-primary">
              Componentes
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {componentGalleryNav.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  render={<Link to={item.to} />}
                  className="cursor-pointer"
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
