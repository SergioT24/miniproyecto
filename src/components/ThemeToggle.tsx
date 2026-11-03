import { Monitor, Moon, Sun } from "lucide-react"
import { type Theme, useTheme } from "@/components/theme-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
]

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Cambiar tema"
                className="flex size-8 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
                {resolvedTheme === "dark" ? (
                    <Moon className="size-4" />
                ) : (
                    <Sun className="size-4" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as Theme)}
                >
                    {themeOptions.map((option) => (
                        <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer gap-2"
                        >
                            <option.icon className="size-4" />
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
