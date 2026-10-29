import { Button } from "@workspace/ui/components/button"

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>Acá empezamos a construir cada componente de la app. </p>
          <p>Dejo lo que habría</p>
          <p># Botones (para el Navbar, Cards y Accesibilidad)
npx shadcn@latest add button

# Cards (para el contenedor de contenidos)
npx shadcn@latest add card

# Menú desplegable (súper útil para el botón de accesibilidad o menú móvil)
npx shadcn@latest add dropdown-menu</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="text-muted-foreground font-mono text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
