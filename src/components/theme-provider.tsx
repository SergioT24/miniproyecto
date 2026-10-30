import * as React from "react"

export type Theme = "dark" | "light" | "system"
type ResolvedTheme = Exclude<Theme, "system">

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
    disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
}

const THEME_VALUES: Theme[] = ["dark", "light", "system"]

const ThemeProviderContext = React.createContext<
    ThemeProviderState | undefined
>(undefined)

function isTheme(value: string | null): value is Theme {
    if (value === null) {
        return false
    }

    return THEME_VALUES.includes(value as Theme)
}

function getSystemTheme(): ResolvedTheme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

function disableTransitionsTemporarily() {
    const style = document.createElement("style")
    style.appendChild(
        document.createTextNode(
            "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
        )
    )
    document.head.appendChild(style)

    return () => {
        window.getComputedStyle(document.body)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                style.remove()
            })
        })
    }
}

function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    if (target.isContentEditable) {
        return true
    }

    const editableParent = target.closest(
        "input, textarea, select, [contenteditable='true']"
    )
    if (editableParent) {
        return true
    }

    return false
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "theme",
    disableTransitionOnChange = true,
    ...props
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        const storedTheme = localStorage.getItem(storageKey)
        if (isTheme(storedTheme)) {
            return storedTheme
        }

        return defaultTheme
    })

    const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() =>
        getSystemTheme()
    )

    React.useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => setSystemTheme(getSystemTheme())
        mql.addEventListener("change", onChange)
        return () => mql.removeEventListener("change", onChange)
    }, [])

    const setTheme = React.useCallback(
        (nextTheme: Theme) => {
            localStorage.setItem(storageKey, nextTheme)
            setThemeState(nextTheme)
        },
        [storageKey]
    )

    const applyTheme = React.useCallback(
        (nextTheme: ResolvedTheme) => {
            const root = document.documentElement
            const restoreTransitions = disableTransitionOnChange
                ? disableTransitionsTemporarily()
                : null

            root.classList.remove("light", "dark")
            root.classList.add(nextTheme)

            if (restoreTransitions) {
                restoreTransitions()
            }
        },
        [disableTransitionOnChange]
    )

    const resolvedTheme = theme === "system" ? systemTheme : theme

    React.useEffect(() => {
        applyTheme(resolvedTheme)
    }, [resolvedTheme, applyTheme])

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return
            }

            if (isEditableTarget(event.target)) {
                return
            }

            if (event.key.toLowerCase() !== "d") {
                return
            }

            setThemeState((currentTheme) => {
                const nextTheme =
                    currentTheme === "light"
                        ? "dark"
                        : currentTheme === "dark"
                            ? "system"
                            : "light"

                localStorage.setItem(storageKey, nextTheme)
                return nextTheme
            })
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [storageKey])

    React.useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea !== localStorage) {
                return
            }

            if (event.key !== storageKey) {
                return
            }

            if (isTheme(event.newValue)) {
                setThemeState(event.newValue)
                return
            }

            setThemeState(defaultTheme)
        }

        window.addEventListener("storage", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [defaultTheme, storageKey])

    const value = React.useMemo(
        () => ({
            theme,
            resolvedTheme,
            setTheme,
        }),
        [theme, resolvedTheme, setTheme]
    )

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

// El hook convive con el componente a propósito (API pública del provider).
export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}