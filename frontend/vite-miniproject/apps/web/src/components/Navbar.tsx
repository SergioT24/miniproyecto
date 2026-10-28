import { ChevronDown, Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Link, useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"

const links = [
    { label: "Home", href: "/", active: true },
]

const dropdownItems = [
    { label: "Grilla Filtro", href: "/" },
    { label: "Grilla agregar", href: "/" },
    { label: "Cards metricas", href: "/" },
    { label: "Toasts", href: "/" },
    { label: "Empty states", href: "/emptypage" },
    { label: "Form", href: "/" },
    { label: "Modal confirmacion", href: "/" },
]

function NavLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
    return (
        <Link
            to={href}
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
    const navigate = useNavigate()

    return (
        <nav className="w-full sticky top-0 z-20 border-b bg-card">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 p-4">

                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <Link to="/" className="flex items-center gap-3">
                        <span className="text-xl font-semibold">Tablero</span>
                    </Link>
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

                <div className="hidden items-center gap-8 md:flex">
                    <NavLink {...links[0]} />
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 font-medium hover:text-primary">
                            Componentes
                            <ChevronDown className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {dropdownItems.map((item) => (
                                <DropdownMenuItem
                                    key={item.label}
                                    onClick={() => navigate(item.href)}
                                    className="cursor-pointer"
                                >
                                    {item.label}
                                </DropdownMenuItem>
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