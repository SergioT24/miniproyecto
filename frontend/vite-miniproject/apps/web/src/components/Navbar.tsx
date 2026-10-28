import { ChevronDown, Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { SidebarTrigger } from "@workspace/ui/components/sidebar" // <-- Agregar import
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"

const links = [
    { label: "Home", href: "#", active: true },
    { label: "Services", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Contact", href: "#" },
]

const dropdownItems = ["Sergio", "Cami", "Matu", "Agus", "Lu"]

function NavLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
    return (
        <a
            href={href}
            className={
                active
                    ? "font-medium text-primary"
                    : "font-medium text-foreground hover:text-primary"
            }
        >
            {label}
        </a>
    )
}

export function Navbar() {
    return (
        <nav className="w-full sticky top-0 z-20 border-b bg-card">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 p-4">

                {/* Lado izquierdo: Trigger en mobile + Título */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <a href="#" className="flex items-center gap-3">
                        <span className="text-xl font-semibold">Tablero</span>
                    </a>
                </div>

                {/* Buscador */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar..."
                        className="w-full pl-8"
                    />
                </div>

                {/* Links Desktop */}
                <div className="hidden items-center gap-8 md:flex">
                    <NavLink {...links[0]} />
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 font-medium hover:text-primary">
                            Integrantes
                            <ChevronDown className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {dropdownItems.map((item) => (
                                <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {links.slice(1).map((link) => (
                        <NavLink key={link.label} {...link} />
                    ))}
                </div>

            </div>
        </nav>
    )
}